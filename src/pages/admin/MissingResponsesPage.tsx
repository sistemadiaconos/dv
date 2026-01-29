import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, MessageCircle, Phone, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { meetingService } from "../../services/meetingService";
import type { Reuniao } from "../../services/meetingService";

export default function MissingResponsesPage() {
    const navigate = useNavigate();
    const [meeting, setMeeting] = useState<Reuniao | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Carregar dados
    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const activeMeeting = await meetingService.getActiveMeeting();
            setMeeting(activeMeeting);

            if (activeMeeting) {
                const data = await meetingService.getMissingParticipants(activeMeeting.id);
                setParticipants(data);
            }
        } catch (error) {
            console.error("Erro ao carregar lista de pendentes", error);
        } finally {
            setLoading(false);
        }
    }

    // Filtro de busca
    const filteredParticipants = participants.filter(p =>
        p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.departamento?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Função WhatsApp
    function getWhatsAppLink(phone: string, name: string) {
        if (!phone) return null;

        // Limpar número (deixar apenas dígitos)
        const cleanPhone = phone.replace(/\D/g, "");

        // Adicionar 55 se não tiver (assumindo Brasil)
        const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;

        const message = `Olá ${name.split(" ")[0]}, a paz! Notamos que você ainda não confirmou sua presença na próxima reunião. Poderia nos informar se poderá participar?`;

        return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    }

    // Função Download CSV
    function handleDownload() {
        if (!participants.length) return;

        const headers = ["Nome", "Departamento", "Telefone"];
        const csvContent = [
            headers.join(";"),
            ...participants.map(p => {
                const nome = `"${p.nome || ''}"`;
                const depto = `"${p.departamento || ''}"`;
                const tel = `"${p.telefone || ''}"`;
                return [nome, depto, tel].join(";");
            })
        ].join("\n");

        // Adicionar BOM para garantir que o Excel reconheça o UTF-8
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `pendentes_reuniao_${meeting?.data || 'data'}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-muted-foreground">Carregando lista de pendentes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="-ml-3 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Voltar ao Dashboard
                        </Button>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Participantes Pendentes</h2>
                    <p className="text-muted-foreground">
                        Lista de membros que ainda não responderam à convocação da reunião de {meeting && new Date(meeting.data + 'T00:00:00').toLocaleDateString()}.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleDownload} className="gap-2">
                        <Download className="h-4 w-4" />
                        Baixar Excel (CSV)
                    </Button>
                </div>
            </div>

            {/* Conteúdo */}
            <Card>
                <CardHeader className="border-b border-border/50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <CardTitle className="text-lg font-medium">
                            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-3 py-1 rounded-full text-sm">
                                {participants.length} pendentes
                            </span>
                        </CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome ou departamento..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                        {filteredParticipants.length > 0 ? (
                            filteredParticipants.map((p) => {
                                const waLink = getWhatsAppLink(p.telefone, p.nome);

                                return (
                                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 font-bold text-sm">
                                                {p.nome.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium text-foreground">{p.nome}</p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground uppercase tracking-wider font-semibold">
                                                        {p.departamento || "Geral"}
                                                    </span>
                                                    {p.telefone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {p.telefone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            {waLink ? (
                                                <a
                                                    href={waLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex h-9 items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                                >
                                                    <MessageCircle className="mr-2 h-4 w-4" />
                                                    Enviar WhatsApp
                                                </a>
                                            ) : (
                                                <Button variant="ghost" size="sm" disabled className="text-muted-foreground opacity-50">
                                                    Sem telefone
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                {searchTerm ? "Nenhum participante encontrado com esse filtro." : "Nenhum participante pendente! 🎉"}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
