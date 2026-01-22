import { useEffect, useState } from "react";
import { Plus, Trash2, ShieldCheck, Search, Phone, FileUp, X, Edit2, Save } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { authorizationService } from "../../services/authorizationService";
import type { TelefoneAutorizado } from "../../services/authorizationService";
import { cn } from "../../lib/utils";

export default function AuthorizationsPage() {
    const [phones, setPhones] = useState<TelefoneAutorizado[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPhone, setNewPhone] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showImport, setShowImport] = useState(false);
    const [importData, setImportData] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        loadPhones();
    }, []);

    async function loadPhones() {
        setLoading(true);
        const data = await authorizationService.getAuthorizedPhones();
        setPhones(data);
        setLoading(false);
    }

    async function handleAdd() {
        if (!newPhone || newPhone.replace(/\D/g, '').length < 10) {
            alert("Insira um número de celular válido com DDD.");
            return;
        }

        try {
            if (editingId) {
                await authorizationService.updatePhone(editingId, newPhone);
                setEditingId(null);
            } else {
                await authorizationService.addPhone(newPhone);
            }
            setNewPhone("");
            loadPhones();
        } catch (error: any) {
            alert("Erro ao salvar: " + (error.message.includes('unique') ? "Este número já está autorizado." : error.message));
        }
    }

    function handleEdit(phone: TelefoneAutorizado) {
        setNewPhone(phone.celular);
        setEditingId(phone.id);
        setShowImport(false);
        // Scroll to top to see the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelEdit() {
        setEditingId(null);
        setNewPhone("");
    }

    async function handleBulkImport() {
        if (!importData.trim()) return;

        setIsImporting(true);
        try {
            // Split by lines, commas or spaces
            const phoneList = importData.split(/[\n,; ]+/).filter(p => p.trim().length > 0);
            const results = await authorizationService.bulkAddPhones(phoneList);
            alert(`${results.length} números processados com sucesso!`);
            setImportData("");
            setShowImport(false);
            loadPhones();
        } catch (error: any) {
            alert("Erro na importação: " + error.message);
        }
        setIsImporting(false);
    }

    async function handleDeleteAll() {
        if (!confirm("AVISO CRÍTICO: Issole removerá TODOS os números autorizados do sistema. Esta ação não pode ser desfeita.\n\nTem certeza absoluta que deseja remover tudo?")) return;

        const confirmText = prompt("Para confirmar, digite 'EXCLUIR TUDO':");
        if (confirmText !== 'EXCLUIR TUDO') {
            alert("Exclusão cancelada. O texto digitado não confere.");
            return;
        }

        setLoading(true);
        try {
            await authorizationService.deleteAllPhones();
            alert("Todas as autorizações foram removidas com sucesso.");
            loadPhones();
        } catch (error: any) {
            alert("Erro ao remover tudo: " + error.message);
        }
        setLoading(false);
    }

    const filtered = phones.filter(p => p.celular.includes(searchTerm.replace(/\D/g, '')));

    const formatPhone = (phone: string) => {
        const d = phone.replace(/\D/g, '');
        if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
        if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
        return phone;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gerenciar Autorizações</h2>
                    <p className="text-muted-foreground">Números de celular autorizados a realizar o autocadastro.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="destructive"
                        className="gap-2 font-bold transition-all"
                        onClick={handleDeleteAll}
                        disabled={loading || phones.length === 0}
                    >
                        <Trash2 className="h-4 w-4" />
                        Remover Tudo
                    </Button>
                    <Button
                        variant="outline"
                        className={cn("gap-2 font-bold transition-all", showImport ? "bg-red-500/10 border-red-500/50 text-red-500" : "border-indigo-500/50 hover:bg-indigo-500/5")}
                        onClick={() => setShowImport(!showImport)}
                    >
                        {showImport ? <X className="h-4 w-4" /> : <FileUp className="h-4 w-4" />}
                        {showImport ? "Cancelar Importação" : "Importar Números"}
                    </Button>
                </div>
            </div>

            {showImport && (
                <Card className="glass-card border-indigo-500/30 animate-in fade-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <FileUp className="h-5 w-5 text-indigo-500" /> Importar Lista de Telefones
                        </CardTitle>
                        <CardDescription>
                            Cole uma lista de números separados por linha, vírgula ou espaço. <br />
                            O sistema removerá duplicatas e formatará automaticamente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <textarea
                            className="w-full min-h-[150px] p-4 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                            placeholder="Ex:&#10;11999998888&#10;11999997777&#10;11988887777"
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowImport(false)}>Cancelar</Button>
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8 h-11"
                                onClick={handleBulkImport}
                                disabled={isImporting || !importData.trim()}
                            >
                                {isImporting ? "Processando..." : "Confirmar Importação"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!showImport && (
                <Card className="glass-card border-indigo-500/30 animate-in fade-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            {editingId ? <Edit2 className="h-5 w-5 text-indigo-500" /> : <Plus className="h-5 w-5 text-indigo-500" />}
                            {editingId ? "Editar Autorização" : "Autorizar Novo Número"}
                        </CardTitle>
                        <CardDescription>O número deve incluir o DDD (ex: 11999999999)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/50" />
                                <Input
                                    className="pl-12 h-12 bg-background/50 border-border rounded-xl focus:ring-indigo-500"
                                    placeholder="DDD + Número (apenas dígitos)"
                                    value={newPhone}
                                    onChange={e => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                />
                            </div>
                            <div className="flex gap-2">
                                {editingId && (
                                    <Button variant="ghost" className="h-12 w-12" onClick={cancelEdit}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                )}
                                <Button className="h-12 px-8 font-bold bg-indigo-600 hover:bg-indigo-700" onClick={handleAdd}>
                                    {editingId ? "Salvar Alteração" : "Autorizar Celular"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex items-center gap-4 bg-card/40 backdrop-blur-md p-4 rounded-2xl border border-border">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                        className="pl-12 h-12 bg-background/50 border-border rounded-xl"
                        placeholder="Buscar por número..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden shadow-xl">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-black uppercase tracking-widest text-[10px] border-b border-border">
                        <tr>
                            <th className="px-6 py-4">Celular Autorizado</th>
                            <th className="px-6 py-4">Data de Autorização</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filtered.map(p => (
                            <tr key={p.id} className="hover:bg-indigo-500/5 transition-colors group">
                                <td className="px-6 py-4 font-bold text-foreground text-lg flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                        <ShieldCheck className="h-4 w-4 text-indigo-500" />
                                    </div>
                                    {formatPhone(p.celular)}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground font-medium">
                                    {new Date(p.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-9 w-9 text-indigo-600 hover:bg-indigo-500/10"
                                            onClick={() => handleEdit(p)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-9 w-9 text-red-600 hover:bg-red-500/10"
                                            onClick={() => handleDelete(p.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && !loading && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground font-medium">
                                    Nenhuma autorização encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
