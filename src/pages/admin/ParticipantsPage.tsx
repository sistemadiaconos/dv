import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Upload } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { supabase } from "../../lib/supabase";
import { participantService } from "../../services/participantService";
import { settingsService } from "../../services/settingsService";
import { normalizePhone } from "../../lib/utils";
import type { Participante } from "../../services/participantService";

export default function ParticipantsPage() {
    const [participants, setParticipants] = useState<Participante[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    // isEditing removed
    const [currentParticipant, setCurrentParticipant] = useState<Partial<Participante>>({});
    const [roles, setRoles] = useState<string[]>([]);

    // Modal/Form State (Simplified as conditional rendering for MVP)
    // Modal/Form State (Simplified as conditional rendering for MVP)
    const [showForm, setShowForm] = useState(false);

    // Import State
    const [showImport, setShowImport] = useState(false);
    const [importText, setImportText] = useState("");
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        loadParticipants();
    }, []);

    async function loadParticipants() {
        setLoading(true);
        const { data } = await supabase
            .from('participantes')
            .select('*')
            .order('nome');
        if (data) setParticipants(data);

        // Load roles dynamic
        const depts = await settingsService.getDepartments();
        setRoles(depts.map(d => d.nome));

        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este participante?")) return;

        try {
            await participantService.deleteParticipant(id);
            loadParticipants();
        } catch (error: any) {
            alert("Erro ao excluir: " + error.message);
        }
    }

    async function handleDeleteAll() {
        const confirmed = confirm("⚠️ ATENÇÃO: Isso apagará TODOS os participantes do sistema. Esta ação não pode ser desfeita.\n\nTem certeza absoluta que deseja continuar?");
        if (!confirmed) return;

        // Double confirmation for safety
        const secondaryConfirm = prompt("Para confirmar a exclusão de todos os participantes, digite: DELETAR");
        if (secondaryConfirm !== "DELETAR") return;

        setLoading(true);
        try {
            await participantService.deleteAll();
            loadParticipants();
            alert("Todos os participantes foram removidos com sucesso.");
        } catch (error: any) {
            alert("Erro ao apagar todos: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!currentParticipant.nome) return alert("Nome é obrigatório");

        const payload = {
            nome: currentParticipant.nome,
            telefone: currentParticipant.telefone ? normalizePhone(currentParticipant.telefone) : null,
            encargo: currentParticipant.encargo,
            departamento: currentParticipant.departamento,
            ativo: true
        };

        let error;
        if (currentParticipant.id) {
            // Update
            const { error: err } = await supabase
                .from('participantes')
                .update(payload)
                .eq('id', currentParticipant.id);
            error = err;
        } else {
            // Insert
            const { error: err } = await supabase
                .from('participantes')
                .insert([payload]);
            error = err;
        }

        if (!error) {
            setShowForm(false);
            setCurrentParticipant({});
            loadParticipants();
        } else {
            alert("Erro ao salvar: " + error.message);
        }
    }
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            setImportText(text);
        };
        reader.readAsText(file);
    };

    async function handleImport() {
        if (!importText.trim()) return alert("Cole os dados ou carregue um arquivo para importar.");
        setImporting(true);

        try {
            const lines = importText.trim().split('\n');
            const newParticipants: any[] = [];

            lines.forEach(line => {
                // Expected: Nome, Telefone, Encargo, Departamento
                const parts = line.split(',').map(p => p.trim());
                if (parts.length >= 1) {
                    newParticipants.push({
                        nome: parts[0],
                        telefone: parts[1] ? normalizePhone(parts[1]) : null,
                        encargo: normalizeEncargo(parts[2]),
                        departamento: normalizeDepartamento(parts[3]),
                        ativo: true
                    });
                }
            });

            await participantService.createBulk(newParticipants);

            setImportText("");
            setShowImport(false);
            loadParticipants();
            alert(`${newParticipants.length} participantes importados com sucesso!`);
        } catch (error: any) {
            alert("Erro na importação: " + error.message);
        } finally {
            setImporting(false);
        }
    }

    const filtered = participants.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.telefone && p.telefone.includes(searchTerm))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Participantes</h2>
                <div className="flex gap-2">
                    <Button variant="destructive" onClick={handleDeleteAll} disabled={participants.length === 0 || loading}>
                        <Trash2 className="mr-2 h-4 w-4" /> Apagar Todos
                    </Button>
                    <Button variant="outline" onClick={() => setShowImport(true)}>
                        <Upload className="mr-2 h-4 w-4" /> Importar
                    </Button>
                    <Button onClick={() => { setCurrentParticipant({}); setShowForm(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Novo Participante
                    </Button>
                </div>
            </div>

            {showImport && (
                <Card className="mb-6 glass-card border-blue-500/30">
                    <CardHeader>
                        <CardTitle className="text-2xl font-black text-foreground">Importar Participantes (CSV)</CardTitle>
                        <CardDescription className="text-sm font-medium text-muted-foreground">
                            Cole os dados ou carregue um arquivo CSV no formato: <b>Nome, Telefone, Encargo, Departamento</b>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Arquivo CSV/Texto</label>
                            <Input
                                type="file"
                                accept=".csv,.txt"
                                onChange={handleFileUpload}
                                className="cursor-pointer bg-background/50 h-12 flex items-center"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Conteúdo Manual</label>
                            <textarea
                                className="flex min-h-[150px] w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-muted-foreground/50"
                                placeholder={"Exemplo:\nJoão Silva, 11999999999, Diacono, MVPMusic\nMaria Oliveira, 11888888888, Voluntário, Louvor"}
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" className="font-bold" onClick={() => setShowImport(false)}>Cancelar</Button>
                            <Button className="px-8 font-bold bg-blue-600 hover:bg-blue-700" onClick={handleImport} disabled={importing}>
                                {importing ? "Importando..." : "Processar Importação"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {showForm && (
                <Card className="mb-6 border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20">
                    <CardHeader>
                        <CardTitle>{currentParticipant.id ? 'Editar Participante' : 'Novo Participante'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Nome</label>
                                <Input
                                    value={currentParticipant.nome || ''}
                                    onChange={e => setCurrentParticipant({ ...currentParticipant, nome: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Telefone</label>
                                <Input
                                    placeholder="+55 XX XXXXX-XXXX"
                                    value={currentParticipant.telefone || ''}
                                    onChange={e => setCurrentParticipant({ ...currentParticipant, telefone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Encargo</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                                    value={currentParticipant.encargo || ''}
                                    onChange={e => setCurrentParticipant({ ...currentParticipant, encargo: e.target.value as any })}
                                >
                                    <option value="">Selecione...</option>
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Departamento</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={currentParticipant.departamento || ''}
                                    onChange={e => setCurrentParticipant({ ...currentParticipant, departamento: e.target.value as any })}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="MVPMusic">MVPMusic</option>
                                    <option value="Diacono(niza)">Diacono(niza)</option>
                                    <option value="Louvor">Louvor</option>
                                    <option value="Administrativo">Administrativo</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
                            <Button onClick={handleSave}>Salvar</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex items-center gap-4 bg-card/40 backdrop-blur-md p-4 rounded-2xl border border-border">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                        className="pl-12 h-12 bg-background/50 border-border rounded-xl focus:ring-indigo-500"
                        placeholder="Buscar por nome ou telefone..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden shadow-xl">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-black uppercase tracking-widest text-[10px] border-b border-border">
                        <tr>
                            <th className="px-6 py-4">Nome</th>
                            <th className="px-6 py-4">Telefone</th>
                            <th className="px-6 py-4">Encargo</th>
                            <th className="px-6 py-4">Departamento</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filtered.map(p => (
                            <tr key={p.id} className="hover:bg-indigo-500/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-foreground text-base">{p.nome}</div>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground font-medium">{p.telefone || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-bold border border-border/50">
                                        {p.encargo}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground font-medium">{p.departamento}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-9 w-9 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10" onClick={() => { setCurrentParticipant(p); setShowForm(true); }}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-9 w-9 text-red-600 dark:text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(p.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                    Nenhum participante encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Helper functions for normalization matching DB constraints
function normalizeEncargo(value: string): any {
    if (!value) return "Outro";
    const lower = value.toLowerCase().trim();

    // Direct matches (case insensitive logic)
    if (lower.includes("pastor")) return "Pastor(a)";
    if (lower.includes("diretoria") || lower.includes("lider") || lower.includes("líder")) return "Conselho Ministerial";
    // "Diácono" (accented) -> DB "Diácono(niza)"
    if (lower.includes("diacono") || lower.includes("diácono") || lower.includes("diaconisa")) return "Diácono(niza)";
    if (lower.includes("voluntario") || lower.includes("voluntário")) return "Voluntário(a)";
    if (lower.includes("mvp") || lower.includes("music")) return "MVPMusic";
    if (lower.includes("house")) return "House Mix";
    if (lower.includes("ami")) return "AMI";
    if (lower.includes("midia") || lower.includes("mídia")) return "Mídia";

    return "Outro";
}

function normalizeDepartamento(value: string): "MVPMusic" | "Diacono(niza)" | "Louvor" | "Administrativo" | "Outro" {
    if (!value) return "Outro";
    const lower = value.toLowerCase().trim();

    if (lower.includes("mvp") || lower.includes("music")) return "MVPMusic";
    if (lower.includes("diacono") || lower.includes("diácono") || lower.includes("diaconia")) return "Diacono(niza)";
    if (lower.includes("louvor") || lower.includes("som") || lower.includes("mídia")) return "Louvor";
    if (lower.includes("admin") || lower.includes("secretaria")) return "Administrativo";

    return "Outro";
}
