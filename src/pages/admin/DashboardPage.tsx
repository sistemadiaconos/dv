import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertTriangle, QrCode, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { meetingService } from "../../services/meetingService";
import type { Reuniao } from "../../services/meetingService";
import { Button } from "../../components/ui/button";
import { formatDateWithWeekday } from "../../lib/utils";

export default function DashboardPage() {
    const [meeting, setMeeting] = useState<Reuniao | null>(null);
    const [stats, setStats] = useState({ total: 0, confirmed: 0, absent: 0, pending: 0, checkins: 0, confirmations: [] as any[] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const activeMeeting = await meetingService.getActiveMeeting();
        setMeeting(activeMeeting);

        if (activeMeeting) {
            const meetingStats = await meetingService.getMeetingStats(activeMeeting.id);
            if (meetingStats) {
                setStats(meetingStats);
            }
        }
        setLoading(false);
    }

    async function handleDeleteConfirmation(id: string, name: string) {
        if (!confirm(`Tem certeza que deseja remover ${name} da lista?`)) return;

        try {
            await meetingService.removeConfirmation(id);
            // Refresh local state without full reload
            setStats(prev => ({
                ...prev,
                confirmations: prev.confirmations.filter(c => c.id !== id),
                // Simple decrement of stats for immediate feedback
                // Ideally reload data, but this is faster
            }));
            loadData(); // Reload to be safe and accurate
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
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div> Reunião Ativa
                    </span>
                </div>
            </div>

            <Card className="glass-card bg-slate-900/80 dark:bg-slate-950/40 text-white border-indigo-500/30 overflow-hidden relative group">
                {/* Decorative glow */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors pointer-events-none" />

                <CardContent className="p-8 relative z-10">
                    <div className="flex items-start justify-between">
                        <div className="space-y-4">
                            <div>
                                <p className="text-indigo-300 text-xs font-black uppercase tracking-widest mb-1">Próxima Reunião</p>
                                <h3 className="text-4xl font-black tracking-tight">{meeting.titulo}</h3>
                            </div>
                            <div className="flex flex-wrap gap-6 mt-6">
                                <div className="flex items-center gap-3 text-slate-200">
                                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 leading-none mb-1">{formatDateWithWeekday(meeting.data).dayName}</p>
                                        <p className="text-base font-semibold">{formatDateWithWeekday(meeting.data).formattedDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-200">
                                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 leading-none mb-1">HORÁRIO</p>
                                        <p className="text-base font-semibold">{meeting.hora.slice(0, 5)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button variant="secondary" className="bg-white text-indigo-950 hover:bg-slate-100 font-bold px-6 py-6 h-auto shadow-lg hover:scale-105 transition-all">
                            Gerenciar Reunião
                        </Button>
                        <Link to="/admin/leitor">
                            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-black px-6 py-6 h-auto shadow-xl hover:scale-105 transition-all flex flex-col gap-1 items-center">
                                <QrCode className="h-6 w-6" />
                                <span className="text-xs uppercase tracking-widest">Ler QR Code</span>
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Confirmado</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.confirmed}</div>
                        <p className="text-xs text-muted-foreground opacity-70">Presença garantida</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ausentes</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.absent}</div>
                        <p className="text-xs text-muted-foreground opacity-70">Com justificativa</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Check-ins (Presencial)</CardTitle>
                        <QrCode className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.checkins}</div>
                        <p className="text-xs text-muted-foreground opacity-70">Leram o QR Code</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground opacity-70">Aguardando resposta</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Respostas</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground opacity-70">Interações totais</p>
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
                            {stats.confirmations
                                .filter((c: any) => c.checkin_em)
                                .sort((a: any, b: any) => new Date(b.checkin_em).getTime() - new Date(a.checkin_em).getTime())
                                .slice(0, 10)
                                .map((c: any) => (
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
                            {stats.confirmations.filter((c: any) => c.checkin_em).length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <QrCode className="h-10 w-10 mb-2 opacity-20" />
                                    <p className="text-sm font-medium">Nenhum check-in realizado ainda.</p>
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
                                {stats.confirmations
                                    .filter((c: any) => c.presenca === 'Ausente')
                                    .slice(0, 3)
                                    .map((c: any) => (
                                        <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 hover:bg-muted/50 px-2 rounded-lg">
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium truncate">{c.participantes?.nome}</p>
                                                <p className="text-xs text-muted-foreground truncate">"{c.justificativa}"</p>
                                            </div>
                                        </div>
                                    ))}
                                {stats.confirmations.filter((c: any) => c.presenca === 'Ausente').length === 0 && (
                                    <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma ausência.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Confirmed (Site) */}
                    <Card className="glass-card border-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" /> Confirmados Recentemente
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {stats.confirmations
                                    .filter((c: any) => c.presenca === 'Confirmado' && !c.checkin_em)
                                    .slice(0, 3)
                                    .map((c: any) => (
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
                                {stats.confirmations.filter((c: any) => c.presenca === 'Confirmado' && !c.checkin_em).length === 0 && (
                                    <p className="text-xs text-muted-foreground py-4 text-center">Nenhum pendente de check-in.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
