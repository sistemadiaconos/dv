import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Phone, CheckCircle2, XCircle, ArrowRight, UserPlus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { authorizationService } from "../../services/authorizationService";
import { settingsService } from "../../services/settingsService";
import { participantService } from "../../services/participantService";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/utils";

export default function RegistrationPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [celular, setCelular] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<string[]>([]);

    const [nome, setNome] = useState("");
    const [encargo, setEncargo] = useState("");

    useEffect(() => {
        async function loadRoles() {
            const depts = await settingsService.getDepartments();
            setRoles(depts.map(d => d.nome));
        }
        loadRoles();
    }, []);



    // Mask implementation
    const handlePhoneChange = (val: string) => {
        const cleaned = val.replace(/\D/g, '').slice(0, 11);
        let masked = cleaned;
        if (cleaned.length > 2) masked = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
        if (cleaned.length > 7) masked = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        setCelular(masked);
    };

    // Real-time validation
    useEffect(() => {
        const cleaned = celular.replace(/\D/g, '');
        if (cleaned.length === 11) {
            validatePhone();
        } else {
            setIsAuthorized(null);
        }
    }, [celular]);

    async function validatePhone() {
        setIsValidating(true);
        const cleanPhone = celular.replace(/\D/g, '');

        // 1. Check if already registered
        const alreadyExists = await participantService.checkPhoneExists(cleanPhone);
        if (alreadyExists) {
            alert("Este número já está cadastrado no sistema!");
            setIsValidating(false);
            setIsAuthorized(null);
            return;
        }

        // 2. Check authorization
        const authorized = await authorizationService.checkPhone(celular);
        setIsAuthorized(authorized);
        setIsValidating(false);
        if (authorized) {
            setStep(2);
        }
    }

    async function handleRegister() {
        if (!nome || !encargo) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        setLoading(true);
        const { error } = await supabase
            .from('participantes')
            .insert([{
                nome,
                telefone: celular.replace(/\D/g, ''),
                encargo,
                departamento: encargo === 'Pastor(a)' ? 'Administrativo' : (encargo === 'MVPMusic' ? 'MVPMusic' : 'Outro'),
                ativo: true
            }]);

        if (error) {
            alert("Erro ao realizar cadastro: " + error.message);
        } else {
            alert("Cadastro realizado com sucesso! Bem-vindo(a).");
            navigate("/confirmar");
        }
        setLoading(false);
    }

    return (
        <Card className="w-full shadow-2xl border-t-4 border-t-indigo-600 glass-card">
            <CardHeader className="pt-8 text-center pb-2">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-4">
                    <UserPlus className="h-6 w-6 text-indigo-500" />
                </div>
                <CardTitle className="text-4xl font-black tracking-tight text-foreground drop-shadow-sm">Seja Bem-vindo</CardTitle>
                <CardDescription className="text-base font-medium">Cadastre-se para confirmar presença nas reuniões.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">

                {/* Step 1: Phone Validation */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Seu Celular (Com DDD)</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/50 group-focus-within:text-indigo-500 transition-colors">
                                <Phone className="h-5 w-5" />
                            </div>
                            <Input
                                className={cn(
                                    "pl-12 h-14 text-lg font-bold bg-background/50 border-border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all",
                                    isAuthorized === true && "border-green-500/50 bg-green-500/5",
                                    isAuthorized === false && "border-red-500/50 bg-red-500/5"
                                )}
                                placeholder="(00) 00000-0000"
                                value={celular}
                                onChange={e => handlePhoneChange(e.target.value)}
                                disabled={step > 1}
                            />
                            <div className="absolute right-4 top-3.5">
                                {isValidating && <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                                {isAuthorized === true && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                                {isAuthorized === false && <XCircle className="h-6 w-6 text-red-500" />}
                            </div>
                        </div>
                    </div>

                    {isAuthorized === false && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-bold flex gap-3 items-center animate-in fade-in slide-in-from-top-2">
                            <XCircle className="h-5 w-5 shrink-0" />
                            Este número não está pré-autorizado. Entre em contato com a administração.
                        </div>
                    )}
                </div>

                {/* Step 2: Details (revealed) */}
                {step >= 2 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="h-px bg-border/50 w-full" />

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/50 group-focus-within:text-indigo-500 transition-colors">
                                    <User className="h-5 w-5" />
                                </div>
                                <Input
                                    className="pl-12 h-14 text-lg font-bold bg-background/50 border-border rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Como quer ser chamado?"
                                    value={nome}
                                    onChange={e => setNome(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Em qual departamento você serve?</label>
                            <div className="grid grid-cols-1 gap-2">
                                {roles.map(role => (
                                    <button
                                        key={role}
                                        onClick={() => setEncargo(role)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                                            encargo === role
                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg scale-[1.02]"
                                                : "bg-background/50 border-border text-foreground hover:border-indigo-500/50"
                                        )}
                                    >
                                        <span className="font-bold">{role}</span>
                                        {encargo === role && <CheckCircle2 className="h-5 w-5" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black text-lg shadow-xl shadow-indigo-500/20 mt-4 transition-all active:scale-95"
                            disabled={loading || !nome || !encargo}
                            onClick={handleRegister}
                        >
                            {loading ? "Processando..." : (
                                <span className="flex items-center gap-2">
                                    Concluir Cadastro <ArrowRight className="h-5 w-5" />
                                </span>
                            )}
                        </Button>
                    </div>
                )}

                <div className="pt-4 text-center">
                    <Link to="/confirmar" className="text-sm font-bold text-muted-foreground hover:text-indigo-500 transition-colors flex items-center justify-center gap-2">
                        Já tem cadastro? <span className="text-indigo-500">Voltar para confirmação</span>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
