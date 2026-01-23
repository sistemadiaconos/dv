import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Image as ImageIcon, Briefcase, UserPlus, Users, LayoutGrid } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { settingsService } from "../../services/settingsService";
import type { Departamento } from "../../services/settingsService";

export default function SettingsPage() {
    const [logoUrl, setLogoUrl] = useState("");
    const [departments, setDepartments] = useState<Departamento[]>([]);
    const [newDept, setNewDept] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Tabs state
    const [activeTab, setActiveTab] = useState<'geral' | 'usuarios'>('geral');

    // Create User state
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPass, setNewUserPass] = useState("");
    const [creatingUser, setCreatingUser] = useState(false);

    // User List state
    const [usersList, setUsersList] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [rpcError, setRpcError] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (activeTab === 'usuarios') {
            loadUsers();
        }
    }, [activeTab]);

    async function loadSettings() {
        setLoading(true);
        try {
            const settings = await settingsService.getSettings();
            setLogoUrl(settings?.logo_url || "");
            const depts = await settingsService.getDepartments();
            setDepartments(depts);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }

    async function loadUsers() {
        setLoadingUsers(true);
        setRpcError(false);
        try {
            const list = await settingsService.getUsersList();
            setUsersList(list);
        } catch (err: any) {
            console.error("Erro RPC:", err);
            // Always show warning for now to help debug, with the error message
            setRpcError(true);
            alert("Debug Error: " + err.message);
        }
        setLoadingUsers(false);
    }

    async function handleSaveLogo() {
        setSaving(true);
        try {
            await settingsService.updateLogo(logoUrl);
            alert("Logo atualizada com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar logo.");
        }
        setSaving(false);
    }

    async function handleAddDept() {
        if (!newDept.trim()) return;
        try {
            const added = await settingsService.addDepartment(newDept.trim());
            setDepartments([...departments, added]);
            setNewDept("");
        } catch (error) {
            console.error(error);
            alert("Erro ao adicionar departamento. Talvez já exista?");
        }
    }

    async function handleRemoveDept(id: string) {
        if (!confirm("Tem certeza? Se houver participantes neste departamento, pode dar erro.")) return;
        try {
            await settingsService.removeDepartment(id);
            setDepartments(departments.filter(d => d.id !== id));
        } catch (error) {
            console.error(error);
            alert("Erro ao remover. Verifique se há participantes vinculados.");
        }
    }

    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault();
        setCreatingUser(true);
        try {
            // Create a temporary client to avoid logging out the admin
            const tempSupabase = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
            );

            const { data, error } = await tempSupabase.auth.signUp({
                email: newUserEmail,
                password: newUserPass
            });

            if (error) throw error;

            alert("Usuário criado com sucesso! Ele já pode fazer login.");
            setNewUserEmail("");
            setNewUserPass("");
            loadUsers(); // Reload list after creation
        } catch (error: any) {
            console.error(error);
            alert("Erro ao criar usuário: " + error.message);
        }
        setCreatingUser(false);
    }

    if (loading) return <div className="p-8 text-center">Carregando configurações...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-black tracking-tight text-foreground">Configurações</h2>
                <p className="text-muted-foreground">Gerencie a aparência e os usuários do sistema.</p>
            </div>

            {/* Custom Tabs */}
            <div className="flex gap-2 p-1 bg-muted/30 w-fit rounded-lg">
                <Button
                    variant={activeTab === 'geral' ? 'secondary' : 'ghost'}
                    onClick={() => setActiveTab('geral')}
                    className="gap-2"
                >
                    <LayoutGrid className="h-4 w-4" /> Geral
                </Button>
                <Button
                    variant={activeTab === 'usuarios' ? 'secondary' : 'ghost'}
                    onClick={() => setActiveTab('usuarios')}
                    className="gap-2"
                >
                    <Users className="h-4 w-4" /> Usuários
                </Button>
            </div>

            {activeTab === 'geral' && (
                <div className="grid gap-6 md:grid-cols-2 animate-in slide-in-from-left-2 duration-300">
                    {/* Logo Settings */}
                    <Card className="glass-card shadow-lg border-t-4 border-t-indigo-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-indigo-500" /> Logo do Sistema
                            </CardTitle>
                            <CardDescription>Carregue a imagem da sua logo (PNG, JPG).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4 items-start">
                                {logoUrl ? (
                                    <div className="p-4 bg-white/50 rounded-xl border border-border">
                                        <img src={logoUrl} alt="Preview" className="h-16 object-contain" />
                                    </div>
                                ) : (
                                    <div className="h-24 w-24 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground text-xs">
                                        Sem Logo
                                    </div>
                                )}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Upload de Imagem</label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="cursor-pointer file:cursor-pointer file:text-indigo-600 file:font-bold"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                setSaving(true);
                                                try {
                                                    // 1. Upload to Storage
                                                    const publicUrl = await settingsService.uploadLogoFile(file);

                                                    // 2. Save URL to Settings Table
                                                    await settingsService.updateLogo(publicUrl);

                                                    setLogoUrl(publicUrl);
                                                    alert("Logo atualizada com sucesso!");
                                                } catch (error) {
                                                    console.error(error);
                                                    alert("Erro ao enviar imagem. Verifique se rodou o script de Storage.");
                                                }
                                                setSaving(false);
                                            }}
                                            disabled={saving}
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">Recomendado: 200x80px (Fundo Transparente)</p>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-muted/20" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground">Ou use uma URL</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Input
                                            value={logoUrl}
                                            onChange={e => setLogoUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="text-xs"
                                        />
                                        <Button onClick={handleSaveLogo} disabled={saving} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                            <Save className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Departments Settings */}
                    <Card className="glass-card shadow-lg border-t-4 border-t-emerald-500 row-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-emerald-500" /> Departamentos
                            </CardTitle>
                            <CardDescription>Adicione ou remova áreas de atuação.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Novo Departamento..."
                                    value={newDept}
                                    onChange={e => setNewDept(e.target.value)}
                                />
                                <Button onClick={handleAddDept} className="bg-emerald-600 hover:bg-emerald-700">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {departments.map(dept => (
                                    <div key={dept.id} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border">
                                        <span className="font-medium">{dept.nome}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                                            onClick={() => handleRemoveDept(dept.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {departments.length === 0 && <p className="text-center text-muted-foreground py-4">Nenhum departamento cadastrado.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'usuarios' && (
                <div className="max-w-2xl animate-in slide-in-from-right-2 duration-300">
                    <Card className="glass-card shadow-lg border-t-4 border-t-blue-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-blue-500" /> Cadastrar Novo Usuário
                            </CardTitle>
                            <CardDescription>
                                Crie um novo acesso administrativo. Este usuário terá acesso total ao sistema.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">E-mail</label>
                                    <Input
                                        type="email"
                                        placeholder="novo.usuario@exemplo.com"
                                        value={newUserEmail}
                                        onChange={e => setNewUserEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Senha</label>
                                    <Input
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        value={newUserPass}
                                        onChange={e => setNewUserPass(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="pt-2">
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={creatingUser}>
                                        {creatingUser ? "Criando..." : "Criar Usuário"}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground text-center pt-2">
                                    (Todas as ações ficam registradas).
                                </p>
                            </form>
                        </CardContent>
                    </Card>

                    {/* List Users Card */}
                    <Card className="glass-card shadow-lg border-t-4 border-t-purple-500 mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-500" /> Usuários Cadastrados
                            </CardTitle>
                            <CardDescription>
                                Lista de administradores com acesso ao sistema.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {rpcError ? (
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 text-sm">
                                    <p className="font-bold">⚠️ Configuração Necessária</p>
                                    <p className="mt-1">Para visualizar a lista de usuários, é necessário executar um script de permissão no banco de dados.</p>
                                    <p className="mt-2 text-xs">Vá no Supabase &gt; SQL Editor e rode o script <code>migration_list_users.sql</code>.</p>
                                </div>
                            ) : loadingUsers ? (
                                <div className="text-center py-4 text-muted-foreground">Carregando lista...</div>
                            ) : (
                                <div className="space-y-2">
                                    {usersList.map((u, i) => (
                                        <div key={u.id || i} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border">
                                            <div>
                                                <p className="font-medium text-sm">{u.email}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Criado em: {new Date(u.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {u.last_sign_in_at ? `Último acesso: ${new Date(u.last_sign_in_at).toLocaleDateString()}` : 'Nunca acessou'}
                                            </div>
                                        </div>
                                    ))}
                                    {usersList.length === 0 && <p className="text-center text-muted-foreground text-sm">Nenhum usuário encontrado.</p>}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
