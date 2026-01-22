import { useEffect, useState } from "react";
import { Plus, Calendar, Edit2, Trash2, Power, Clock } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { supabase } from "../../lib/supabase";
import type { Reuniao } from "../../services/meetingService";
import { cn, formatDateWithWeekday } from "../../lib/utils";

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<Reuniao[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentMeeting, setCurrentMeeting] = useState<Partial<Reuniao>>({});

    useEffect(() => {
        loadMeetings();
    }, []);

    async function loadMeetings() {
        setLoading(true);
        const { data } = await supabase
            .from('reunioes')
            .select('*')
            .order('data', { ascending: false });
        if (data) setMeetings(data);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir esta reunião?")) return;

        const { error } = await supabase.from('reunioes').delete().eq('id', id);
        if (!error) loadMeetings();
    }

    async function handleToggleStatus(meeting: Reuniao) {
        const newStatus = meeting.status === 'Agendada' ? 'Encerrada' : 'Agendada';
        // If activating, user might want to ensure only one is active, but for now we allow manual control.
        // Ideally we check if another is active and warn, but let's keep it simple.

        const { error } = await supabase
            .from('reunioes')
            .update({ status: newStatus })
            .eq('id', meeting.id);

        if (!error) loadMeetings();
    }

    async function handleSave() {
        if (!currentMeeting.titulo || !currentMeeting.data || !currentMeeting.hora) {
            alert("Título, Data e Hora são obrigatórios");
            return;
        }

        const payload = {
            titulo: currentMeeting.titulo,
            data: currentMeeting.data,
            hora: currentMeeting.hora,
            local: currentMeeting.local,
            descricao: currentMeeting.descricao,
            status: currentMeeting.status || 'Agendada'
        };

        let error;
        if (currentMeeting.id) {
            // Update
            const { error: err } = await supabase
                .from('reunioes')
                .update(payload)
                .eq('id', currentMeeting.id);
            error = err;
        } else {
            // Insert
            const { error: err } = await supabase
                .from('reunioes')
                .insert([payload]);
            error = err;
        }

        if (!error) {
            setShowForm(false);
            setCurrentMeeting({});
            loadMeetings();
        } else {
            alert("Erro ao salvar: " + error.message);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Reuniões</h2>
                <Button onClick={() => { setCurrentMeeting({ data: new Date().toISOString().split('T')[0], hora: '19:30' }); setShowForm(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Agendar Reunião
                </Button>
            </div>

            {showForm && (
                <Card className="mb-6 glass-card border-indigo-500/30">
                    <CardHeader>
                        <CardTitle className="text-2xl font-black text-foreground">{currentMeeting.id ? 'Editar Reunião' : 'Nova Reunião'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1 block">Título</label>
                                <Input
                                    className="h-12 bg-background/50 border-border focus:ring-indigo-500"
                                    value={currentMeeting.titulo || ''}
                                    onChange={e => setCurrentMeeting({ ...currentMeeting, titulo: e.target.value })}
                                    placeholder="Ex: Reunião de Obreiros"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1 block">Data</label>
                                <Input
                                    className="h-12 bg-background/50 border-border"
                                    type="date"
                                    value={currentMeeting.data || ''}
                                    onChange={e => setCurrentMeeting({ ...currentMeeting, data: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1 block">Hora</label>
                                <Input
                                    className="h-12 bg-background/50 border-border"
                                    type="time"
                                    value={currentMeeting.hora || ''}
                                    onChange={e => setCurrentMeeting({ ...currentMeeting, hora: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1 block">Local</label>
                                <Input
                                    className="h-12 bg-background/50 border-border"
                                    value={currentMeeting.local || ''}
                                    onChange={e => setCurrentMeeting({ ...currentMeeting, local: e.target.value })}
                                    placeholder="Ex: Salão Principal"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1 block">Descrição</label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={currentMeeting.descricao || ''}
                                    onChange={e => setCurrentMeeting({ ...currentMeeting, descricao: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" className="font-bold" onClick={() => setShowForm(false)}>Cancelar</Button>
                            <Button className="px-8 font-bold bg-indigo-600 hover:bg-indigo-700" onClick={handleSave}>Salvar Reunião</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {meetings.map(m => {
                    const isActive = m.status === 'Agendada';
                    return (
                        <Card key={m.id} className={cn("glass-card border-t-4 hover:scale-[1.02] transition-all group overflow-hidden", isActive ? "border-t-green-500" : "border-t-slate-500 opacity-80")}>
                            {/* Decorative background glow for cards */}
                            <div className={cn("absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors", isActive ? "bg-green-500/5 group-hover:bg-green-500/10" : "bg-slate-500/5")} />

                            <CardHeader className="pb-3 relative z-10">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-bold text-foreground leading-tight">{m.titulo}</CardTitle>
                                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-widest", isActive ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-slate-500/10 text-slate-500 border border-slate-500/20")}>
                                        {m.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border/50">
                                        <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <Calendar className="h-5 w-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground opacity-60 leading-none mb-1">{formatDateWithWeekday(m.data).dayName}</p>
                                            <p className="text-sm font-bold text-foreground">{formatDateWithWeekday(m.data).formattedDate}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 px-1 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm font-medium">{m.hora.slice(0, 5)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className={cn("gap-2", isActive ? "text-orange-600 dark:text-orange-400 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30" : "text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30")}
                                        onClick={() => handleToggleStatus(m)}
                                    >
                                        <Power className="h-3 w-3" /> {isActive ? 'Encerrar' : 'Reativar'}
                                    </Button>

                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setCurrentMeeting(m); setShowForm(true); }}>
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(m.id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {meetings.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/50 rounded-lg border border-dashed border-border">
                        <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p>Nenhuma reunião encontrada.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
