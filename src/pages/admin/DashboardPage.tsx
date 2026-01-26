import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertTriangle, QrCode, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Modal } from "../../components/ui/modal";
import { meetingService } from "../../services/meetingService";
import type { Reuniao } from "../../services/meetingService";
import { Button } from "../../components/ui/button";
import { formatDateWithWeekday } from "../../lib/utils";

export default function DashboardPage() {
    const [meeting, setMeeting] = useState<Reuniao | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        confirmed: 0,
        absent: 0,
        pending: 0,
        checkins: 0,
        totalParticipants: 0,
        missing: 0,
        confirmations: [] as any[],
        recentCheckins: [] as any[],
        recentAbsences: [] as any[],
        recentConfirmations: [] as any[]
    });
    const [loading, setLoading] = useState(true);
    const [showAllConfirmations, setShowAllConfirmations] = useState(false);
    const [allConfirmations, setAllConfirmations] = useState<any[]>([]);
    const [loadingAllConfirmations, setLoadingAllConfirmations] = useState(false);

    const [showMissingConfirmations, setShowMissingConfirmations] = useState(false);
    const [missingConfirmations, setMissingConfirmations] = useState<any[]>([]);
    const [loadingMissingConfirmations, setLoadingMissingConfirmations] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const activeMeeting = await meetingService.getActiveMeeting();
            setMeeting(activeMeeting);

            if (activeMeeting) {
                const meetingStats = await meetingService.getMeetingStats(activeMeeting.id);
                if (meetingStats) {
                    // @ts-ignore
                    setStats(meetingStats);
                }
            }
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteConfirmation(id: string, name: string) {
        if (!confirm(`Tem certeza que deseja remover ${name} da lista?`)) return;

        try {
            await meetingService.removeConfirmation(id);
            // Refresh local state without full reload
            setStats(prev => ({
                ...prev,
                // Update all lists where this ID might exist
                recentCheckins: prev.recentCheckins.filter(c => c.id !== id),
                recentAbsences: prev.recentAbsences.filter(c => c.id !== id),
                recentConfirmations: prev.recentConfirmations.filter(c => c.id !== id),
            }));
            loadData(); // Reload to be safe and accurate
        } catch (error) {
            console.error(error);
            alert("Erro ao remover participante.");
        }
    }

    async function handleViewAllConfirmations() {
        setShowAllConfirmations(true);
        if (meeting && allConfirmations.length === 0) {
            setLoadingAllConfirmations(true);
            try {
                const data = await meetingService.getAllConfirmations(meeting.id);
                setAllConfirmations(data);
            } catch (error) {
                console.error("Erro ao carregar todas as confirmações", error);
            } finally {
                setLoadingAllConfirmations(false);
            }
        }
    }

    async function handleViewMissingConfirmations() {
        setShowMissingConfirmations(true);
        if (meeting) { // Always reload missing to be accurate? Or cache? Let's generic reload for now.
            setLoadingMissingConfirmations(true);
            try {
                const data = await meetingService.getMissingParticipants(meeting.id);
                setMissingConfirmations(data);
            } catch (error) {
                console.error("Erro ao carregar lista de ausentes", error);
            } finally {
                setLoadingMissingConfirmations(false);
            }
        }
    }

    async function handleRemoveFromModal(id: string, name: string) {
        if (!confirm(`Tem certeza que deseja remover ${name}?`)) return;

        try {
            await meetingService.removeConfirmation(id);
            setAllConfirmations(prev => prev.filter(c => c.id !== id));
            // Also update the main stats preview
            setStats(prev => ({
                ...prev,
                recentConfirmations: prev.recentConfirmations.filter(c => c.id !== id),
                confirmed: Math.max(0, prev.confirmed - 1)
            }));
        } catch (error) {
            console.error(error);
            alert("Erro ao remover participante.");
        }
    }

    if (loading) return <div className="p-8">Carregando dashboard...</div>;

    if (!meeting) {
        return (
            <div className="p-8 text-center bg-card rounded-lg border border-border shadow-sm">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold text-foreground">Nenhuma reunião ativa</h2>
                <p className="text-muted-foreground mb-6">Agende uma reunião para começar a acompanhar as confirmações.</p>
                <Button>Agendar Nova Reunião</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div> Reunião Ativa
                    </span>
                </div>
            </div>

            <Card className="glass-card bg-slate-900/80 dark:bg-slate-950/40 text-white border-indigo-500/30 overflow-hidden relative group">
                {/* Decorative glow */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors pointer-events-none" />

                <CardContent className="p-6 sm:p-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                        <div className="space-y-4 w-full">
                            <div>
                                <p className="text-indigo-300 text-xs font-black uppercase tracking-widest mb-1">Próxima Reunião</p>
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">{meeting.titulo}</h3>
                            </div>
                            <div className="flex flex-wrap gap-4 sm:gap-6 mt-6">
                                <div className="flex items-center gap-3 text-slate-200">
                                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 leading-none mb-1">{formatDateWithWeekday(meeting.data).dayName}</p>
                                        <p className="text-base font-semibold">{formatDateWithWeekday(meeting.data).formattedDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-200">
                                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 leading-none mb-1">HORÁRIO</p>
                                        <p className="text-base font-semibold">{meeting.hora.slice(0, 5)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <Button variant="secondary" className="bg-white text-indigo-950 hover:bg-slate-100 font-bold px-6 py-6 h-auto shadow-lg hover:scale-105 transition-all w-full sm:w-auto flex-1 md:flex-none justify-center">
                                Gerenciar
                            </Button>
                            <Link to="/admin/leitor" className="w-full sm:w-auto flex-1 md:flex-none">
                                <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-black px-6 py-6 h-auto shadow-xl hover:scale-105 transition-all flex flex-col gap-1 items-center justify-center">
                                    <QrCode className="h-6 w-6" />
                                    <span className="text-xs uppercase tracking-widest">Ler QR</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section: General Overview (Member Base) */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                {/* Total Cadastrados */}
                <Card className="col-span-2 sm:col-span-1 lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                        <CardTitle className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Total Cadastrados</CardTitle>
                        <Users className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-foreground">{stats.totalParticipants}</div>
                        <p className="text-xs text-muted-foreground opacity-80">Membros na base</p>
                    </CardContent>
                </Card>

                {/* Total Respostas (moved here) */}
                <Card className="col-span-2 sm:col-span-1 lg:col-span-2 bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                        <CardTitle className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400">Total Respostas</CardTitle>
                        <Users className="h-4 w-4 text-indigo-400" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stats.total}</div>
                        <p className="text-xs text-indigo-500/80 dark:text-indigo-400/60">Interações nesta reunião</p>
                    </CardContent>
                </Card>

                <div className="col-span-2 hidden lg:block"></div>
            </div>

            {/* Section: Meeting Status (Active) */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                <Card className="border-green-100 dark:border-green-900/30 bg-green-50/30 dark:bg-green-900/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                        <CardTitle className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">Confirmados</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.confirmed}</div>
                        <p className="text-xs text-green-600/70 dark:text-green-500/60">Presença garantida</p>
                    </CardContent>
                </Card>

                <Card className="border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                        <CardTitle className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-400">Ausentes</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.absent}</div>
                        <p className="text-xs text-red-600/70 dark:text-red-500/60">Com justificativa</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Check-ins</CardTitle>
                        <QrCode className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-foreground">{stats.checkins}</div>
                        <p className="text-xs text-muted-foreground opacity-80">Leram o QR Code</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground opacity-80">Responderam "Talvez"</p>
                    </CardContent>
                </Card>

                <Card className="col-span-2 sm:col-span-1 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                        <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Faltam Responder</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{stats.missing}</div>
                                <p className="text-xs text-slate-500 dark:text-slate-500">Silenciosos</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs px-2.5 ml-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                                onClick={handleViewMissingConfirmations}
                            >
                                Ver lista
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>


            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Column 1: Check-ins (Most Important) */}
                <Card className="col-span-4 glass-card border-none">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <QrCode className="h-5 w-5 text-indigo-500" /> Últimos Check-ins
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {stats.recentCheckins.map((c: any) => (
                                <div key={c.id} className="flex items-center justify-between border-b border-border/50 py-4 last:border-0 hover:bg-muted/50 px-4 rounded-xl transition-colors">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-foreground">{c.participantes?.nome || "Participante Desconhecido"}</p>
                                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{c.participantes?.departamento || "Sem Departamento"}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs font-bold text-white bg-green-500/80 px-2 py-1 rounded-md flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(c.checkin_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                            onClick={() => handleDeleteConfirmation(c.id, c.participantes?.nome)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {stats.recentCheckins.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-muted/20">
                                    <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                        <QrCode className="h-8 w-8 opacity-40" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground">Aguardando leituras</p>
                                    <p className="text-xs opacity-60 max-w-[200px] text-center mt-1">Os check-ins via QR Code aparecerão aqui em tempo real.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Column 2: Other Lists (Tabs or Stacked) */}
                <div className="col-span-3 space-y-4">
                    {/* Absences */}
                    <Card className="glass-card border-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" /> Ausências Recentes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {stats.recentAbsences.map((c: any) => (
                                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 hover:bg-muted/50 px-2 rounded-lg">
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">{c.participantes?.nome}</p>
                                            <p className="text-xs text-muted-foreground truncate">"{c.justificativa}"</p>
                                        </div>
                                    </div>
                                ))}
                                {stats.recentAbsences.length === 0 && (
                                    <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma ausência.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Confirmed (Site) */}
                    <Card className="glass-card border-none">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" /> Confirmados Recentemente
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                                    onClick={handleViewAllConfirmations}
                                >
                                    Ver todos
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {stats.recentConfirmations.map((c: any) => (
                                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 hover:bg-muted/50 px-2 rounded-lg">
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">{c.participantes?.nome}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(c.data_confirmacao).toLocaleDateString()}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-red-500"
                                            onClick={() => handleDeleteConfirmation(c.id, c.participantes?.nome)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                                {stats.recentConfirmations.length === 0 && (
                                    <p className="text-xs text-muted-foreground py-4 text-center">Nenhum pendente de check-in.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal de Todos os Confirmados */}
            <Modal
                isOpen={showAllConfirmations}
                onClose={() => setShowAllConfirmations(false)}
                title={`Confirmados (${allConfirmations.length})`}
                className="max-w-xl"
            >
                {loadingAllConfirmations ? (
                    <div className="py-8 text-center text-muted-foreground">Carregando lista...</div>
                ) : (
                    <div className="space-y-1">
                        {allConfirmations.map((c) => (
                            <div key={c.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 hover:bg-muted/50 px-2 rounded-lg group">
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium truncate text-foreground">{c.participantes?.nome}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-muted-foreground">{new Date(c.data_confirmacao).toLocaleDateString()}</p>
                                        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground uppercase tracking-wider">{c.participantes?.departamento || 'Participante'}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemoveFromModal(c.id, c.participantes?.nome)}
                                    title="Remover confirmação"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {allConfirmations.length === 0 && (
                            <div className="py-8 text-center text-muted-foreground">
                                Nenhuma confirmação encontrada.
                            </div>
                        )}
                    </div>
                )}
            </Modal>
            {/* Modal de Faltam Responder */}
            <Modal
                isOpen={showMissingConfirmations}
                onClose={() => setShowMissingConfirmations(false)}
                title={`Faltam Responder (${missingConfirmations.length})`}
                className="max-w-xl"
            >
                {loadingMissingConfirmations ? (
                    <div className="py-8 text-center text-muted-foreground">Carregando lista...</div>
                ) : (
                    <div className="space-y-1">
                        {missingConfirmations.map((p) => (
                            <div key={p.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 hover:bg-muted/50 px-2 rounded-lg">
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium truncate text-foreground">{p.nome}</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{p.departamento || 'Sem departamento'}</p>
                                </div>
                            </div>
                        ))}
                        {missingConfirmations.length === 0 && (
                            <div className="py-8 text-center text-muted-foreground">
                                Todos já responderam! 🎉
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
