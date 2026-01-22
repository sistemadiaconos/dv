import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Settings, Image as ImageIcon, Briefcase } from "lucide-react";
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

    useEffect(() => {
        loadSettings();
    }, []);

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

    if (loading) return <div className="p-8 text-center">Carregando configurações...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-black tracking-tight text-foreground">Configurações</h2>
                <p className="text-muted-foreground">Gerencie a aparência e as opções do sistema.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
        </div>
    );
}
