import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, LayoutDashboard, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                if (authError.message.includes("Invalid login credentials")) {
                    throw new Error("E-mail ou senha incorretos.");
                }
                throw authError;
            }

            navigate("/admin");
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao tentar fazer login.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
            <Card className="w-full shadow-2xl border-t-4 border-t-indigo-600 glass-card">
                <CardHeader className="pt-8 text-center pb-6">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-4 group transition-all hover:scale-110">
                        <LayoutDashboard className="h-8 w-8 text-indigo-500 transition-transform group-hover:rotate-3" />
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight text-foreground drop-shadow-sm">Painel Admin</CardTitle>
                    <CardDescription className="text-base font-medium">Entre para gerenciar o sistema.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail</label>
                            <Input
                                type="email"
                                placeholder="admin@exemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-background/50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Senha</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Sua senha secreta"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 bg-background/50 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-bold flex gap-2 items-center animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black text-base shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                            disabled={loading}
                        >
                            {loading ? "Entrando..." : (
                                <span className="flex items-center gap-2">
                                    Acessar Painel <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
