import { useEffect, useState } from "react";
import { Download, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { supabase } from "../../lib/supabase";
// meetingService removed
import type { Reuniao } from "../../services/meetingService";
import type { Participante } from "../../services/participantService";
import { cn } from "../../lib/utils";

type ConfirmationDetail = {
    id: string;
    presenca: 'Confirmado' | 'Ausente' | 'Pendente';
    justificativa: string | null;
    data_confirmacao: string;
    participantes: Participante;
};

export default function ConfirmationsPage() {
    const [meetings, setMeetings] = useState<Reuniao[]>([]);
    const [selectedMeetingId, setSelectedMeetingId] = useState<string>("");
    const [confirmations, setConfirmations] = useState<ConfirmationDetail[]>([]);
    // loading removed
    const [filter, setFilter] = useState<'Todos' | 'Confirmado' | 'Ausente'>('Todos');

    useEffect(() => {
        async function loadMeetings() {
            const { data } = await supabase.from('reunioes').select('*').order('data', { ascending: false });
            if (data && data.length > 0) {
                setMeetings(data);
                setSelectedMeetingId(data[0].id); // Default to latest
            }
        }
        loadMeetings();
    }, []);

    useEffect(() => {
        if (selectedMeetingId) {
            loadConfirmations(selectedMeetingId);
        }
    }, [selectedMeetingId]);

    async function loadConfirmations(meetingId: string) {
        // setLoading(true);
        const { data } = await supabase
            .from('confirmacoes')
            .select(`
            *,
            participantes (*)
        `)
            .eq('id_reuniao', meetingId);

        if (data) setConfirmations(data as any);
        // setLoading(false);
    }

    const filtered = confirmations.filter(c => filter === 'Todos' || c.presenca === filter);

    const stats = {
        confirmed: confirmations.filter(c => c.presenca === 'Confirmado').length,
        absent: confirmations.filter(c => c.presenca === 'Ausente').length,
        total: confirmations.length
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Relatórios & Confirmações</h2>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Exportar PDF
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Exportar Excel
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-card/40 backdrop-blur-md p-6 rounded-2xl border border-border mt-8">
                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground mr-2">Selecione a Reunião</span>
                <select
                    className="flex h-12 w-full max-w-sm rounded-xl border border-input bg-background/50 px-4 py-2 text-base font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    value={selectedMeetingId}
                    onChange={(e) => setSelectedMeetingId(e.target.value)}
                >
                    {meetings.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.titulo} ({new Date(m.data).toLocaleDateString()})
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="glass-card border-l-4 border-l-green-500 overflow-hidden group hover:scale-[1.02] transition-transform">
                    <CardContent className="pt-8 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Confirmados</p>
                                <h3 className="text-4xl font-black text-foreground">{stats.confirmed}</h3>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-l-4 border-l-red-500 overflow-hidden group hover:scale-[1.02] transition-transform">
                    <CardContent className="pt-8 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Ausentes</p>
                                <h3 className="text-4xl font-black text-foreground">{stats.absent}</h3>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                <XCircle className="h-8 w-8 text-red-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-card mt-8 overflow-hidden rounded-2xl border-none">
                <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-black uppercase tracking-widest text-foreground">Relatórios Detalhados</CardTitle>
                        <div className="flex gap-1 bg-background/50 p-1 rounded-xl border border-border">
                            {(['Todos', 'Confirmado', 'Ausente'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all",
                                        filter === f
                                            ? "bg-indigo-600 text-white shadow-lg"
                                            : "text-muted-foreground hover:bg-muted/80"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-black uppercase tracking-widest text-[10px] border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-4">Participante</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Justificativa</th>
                                    <th className="px-6 py-4">Data Confirmação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filtered.map(c => (
                                    <tr key={c.id} className="hover:bg-indigo-500/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground text-base leading-none mb-1">{c.participantes?.nome || 'Desconhecido'}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{c.participantes?.departamento}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter shadow-sm border",
                                                c.presenca === 'Confirmado'
                                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                    : c.presenca === 'Ausente'
                                                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                                                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                            )}>
                                                {c.presenca}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground italic font-medium text-sm">
                                            {c.justificativa || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground font-black text-[10px] uppercase">
                                            {new Date(c.data_confirmacao).toLocaleString('pt-BR')}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                            Nenhum registro encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
