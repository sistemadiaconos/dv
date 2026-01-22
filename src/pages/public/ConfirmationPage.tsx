import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Check, X, User, Phone, MapPin, Calendar, Clock, AlertCircle, ArrowRight, ArrowLeft, ThumbsUp } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { participantService } from "../../services/participantService";
import { settingsService } from "../../services/settingsService";
import type { Participante } from "../../services/participantService";
import { meetingService } from "../../services/meetingService";
import type { Reuniao } from "../../services/meetingService";
import { cn, formatDateWithWeekday } from "../../lib/utils";
import { CredentialCard } from "../../components/credential/CredentialCard";

export default function ConfirmationPage() {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // Search, Validate, Confirm, Success
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Participante[]>([]);
    const [selectedParticipant, setSelectedParticipant] = useState<Participante | null>(null);
    const [meeting, setMeeting] = useState<Reuniao | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic Settings
    const [roles, setRoles] = useState<string[]>([]);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    // Editing State
    const [isEditingDept, setIsEditingDept] = useState(false);
    const [selectedDepts, setSelectedDepts] = useState<string[]>([]);

    // Confirmation State
    const [status, setStatus] = useState<'Confirmado' | 'Ausente' | null>(null);
    const [justificativa, setJustificativa] = useState("");
    const [errorFull, setErrorFull] = useState("");
    const [validationError, setValidationError] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        async function loadData() {
            const activeMeeting = await meetingService.getActiveMeeting();
            setMeeting(activeMeeting);

            const depts = await settingsService.getDepartments();
            setRoles(depts.map(d => d.nome));

            const settings = await settingsService.getSettings();
            setLogoUrl(settings?.logo_url || null);
        }
        loadData();
    }, []);

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length >= 3) {
            setIsLoading(true);
            const data = await participantService.searchParticipants(val);
            setResults(data);
            setIsLoading(false);
        } else {
            setResults([]);
        }
    };

    const handleSelect = (p: Participante) => {
        setSelectedParticipant(p);
        // Split current department string into array, handle null/empty
        // AND FILTER to only include valid roles. If it's "Outro" or something not in the list, it effectively becomes empty, forcing selection.
        const currentDepts = p.departamento
            ? p.departamento.split(",").map(d => d.trim()).filter(d => roles.includes(d))
            : [];
        setSelectedDepts(currentDepts);
        setStep(2);
    };

    const toggleDept = (role: string) => {
        setValidationError(false);
        setSelectedDepts(prev => {
            if (prev.includes(role)) {
                return prev.filter(r => r !== role);
            } else {
                return [...prev, role];
            }
        });
    };

    const confirmIdentity = async () => {
        if (!selectedParticipant) return;

        if (selectedDepts.length === 0) {
            setValidationError(true);
            return;
        }
        setValidationError(false);

        const deptString = selectedDepts.sort().join(", ");

        // If department was changed, update it in the database
        if (deptString !== selectedParticipant.departamento) {
            setIsSubmitting(true);
            try {
                const updated = await participantService.updateParticipant(selectedParticipant.id, {
                    departamento: deptString
                });
                if (updated) setSelectedParticipant(updated);
            } catch (error) {
                console.error("Erro ao atualizar departamento:", error);
                // Fail silently for the user to improve UX, as the flow can proceed.
                // alert("Não foi possível atualizar o departamento, mas você pode prosseguir.");
            }
            setIsSubmitting(false);
        }

        setStep(3);
    };

    const reset = () => {
        setStep(1);
        setQuery("");
        setResults([]);
        setSelectedParticipant(null);
        setStatus(null);
        setJustificativa("");
        setErrorFull("");
        setIsEditingDept(false);
        setSelectedDepts([]);
        setValidationError(false);
    };

    const submitConfirmation = async (status: 'Confirmado' | 'Ausente') => {
        if (!selectedParticipant || !meeting) return;

        if (status === 'Ausente' && !justificativa.trim()) {
            setErrorFull("Por favor, informe o motivo da ausência.");
            return;
        }

        setIsSubmitting(true);
        const result = await meetingService.confirmPresence(
            selectedParticipant.id,
            meeting.id,
            status,
            justificativa
        );
        setIsSubmitting(false);

        if (result.success) {
            setStatus(status);
            setStep(4);
            if (status === 'Confirmado') {
                setShowSuccessDialog(true);
            }
        } else {
            setErrorFull("Erro ao confirmar. Tente novamente.");
        }
    };

    if (!meeting) {
        return (
            <Card className="w-full shadow-lg">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">Nenhuma reunião agendada</h3>
                    <p className="text-muted-foreground">Não há reuniões ativas para confirmação no momento.</p>
                </CardContent>
            </Card>
        );
    }

    // Step 1: Search Form
    if (step === 1) {
        return (
            <Card className="w-full shadow-2xl border-t-4 border-t-indigo-600 glass-card">
                <CardHeader className="pt-8 text-center relative">
                    {logoUrl && (
                        <div className="flex justify-center mb-4">
                            <img src={logoUrl} alt="Logo" className="h-20 object-contain drop-shadow-sm" crossOrigin="anonymous" />
                        </div>
                    )}
                    <CardTitle className="text-4xl font-black tracking-tight text-foreground mb-2 drop-shadow-sm">Confirmar Presença</CardTitle>
                    <div className="space-y-1">
                        <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{meeting.titulo}</p>
                        <div className="flex flex-col items-center">
                            <p className="text-muted-foreground font-medium">
                                {formatDateWithWeekday(meeting.data).formattedDate} às {meeting.hora.slice(0, 5)}
                            </p>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest mt-1">
                                {formatDateWithWeekday(meeting.data).dayName}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Digite seu nome ou telefone..."
                            className="pl-10 h-11 text-base"
                            value={query}
                            onChange={handleSearch}
                        />
                    </div>

                    {isLoading && <p className="text-center text-sm text-gray-500">Buscando...</p>}

                    <div className="space-y-2 mt-2">
                        {results.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => handleSelect(p)}
                                className="w-full p-4 rounded-xl border border-border bg-card/50 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all flex items-center justify-between group"
                            >
                                <div className="text-left max-w-[80%]">
                                    <p className="font-bold text-lg text-foreground group-hover:text-indigo-500 transition-colors truncate">{p.nome}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider line-clamp-1">{p.departamento || "Outro"} • {p.encargo}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-secondary border border-border flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                    <User className="h-5 w-5 text-indigo-500" />
                                </div>
                            </button>
                        ))}
                        {query.length >= 3 && results.length === 0 && !isLoading && (
                            <div className="text-center py-6 animate-in fade-in slide-in-from-top-4">
                                <p className="text-sm text-muted-foreground mb-4">Nenhum participante encontrado.</p>
                                <Link to="/cadastro">
                                    <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl shadow-lg">
                                        Fazer meu Cadastro <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                        {query.length < 3 && !isLoading && (
                            <div className="pt-4 text-center border-t border-border/50 mt-4">
                                <Link to="/cadastro" className="text-sm font-bold text-muted-foreground hover:text-indigo-500 transition-colors flex items-center justify-center gap-2">
                                    Não encontrou seu nome? <span className="text-indigo-500">Cadastre-se aqui</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Step 2: Validate Identity
    if (step === 2 && selectedParticipant) {
        return (
            <Card className="w-full shadow-lg border-t-4 border-t-indigo-600 glass-card relative">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-2 h-10 w-10 text-muted-foreground hover:bg-indigo-500/10 transition-all"
                    onClick={reset}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <CardHeader>
                    {logoUrl && (
                        <div className="flex justify-center mb-3">
                            <img src={logoUrl} alt="Logo" className="h-12 object-contain opacity-80" crossOrigin="anonymous" />
                        </div>
                    )}
                    <CardTitle className="text-xl text-center">É você?</CardTitle>
                    <CardDescription className="text-center">Confirme se os dados abaixo são seus.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl space-y-4 border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <User className="h-6 w-6 text-indigo-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-bold text-foreground leading-tight truncate">{selectedParticipant.nome}</p>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Participante</p>
                            </div>
                        </div>

                        {selectedParticipant.telefone && (
                            <div className="flex items-center gap-4 px-1">
                                <Phone className="h-5 w-5 text-indigo-400" />
                                <p className="text-sm font-bold text-muted-foreground">{selectedParticipant.telefone}</p>
                            </div>
                        )}

                        <div className="pt-2 border-t border-border/50">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Departamentos que serve</label>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                                    {roles.map(role => {
                                        const isSelected = selectedDepts.includes(role);
                                        return (
                                            <button
                                                key={role}
                                                onClick={() => toggleDept(role)}
                                                className={cn(
                                                    "text-[10px] font-bold p-2.5 rounded-lg border transition-all text-center flex items-center justify-center gap-1.5",
                                                    isSelected
                                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md active:scale-95"
                                                        : "bg-background border-border hover:border-indigo-500/50 hover:bg-indigo-500/5"
                                                )}
                                            >
                                                {isSelected && <Check className="h-3 w-3" />}
                                                {role}
                                            </button>
                                        );
                                    })}
                                </div>

                            </div>
                        </div>
                    </div>

                    <AlertDialog open={validationError} onOpenChange={setValidationError}>
                        <AlertDialogContent className="bg-white dark:bg-slate-900 border-indigo-600 border-2">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-center text-indigo-600 text-xl font-black">⚠️ Calma crente!</AlertDialogTitle>
                                <AlertDialogDescription className="text-center text-foreground font-medium text-lg">
                                    Qual departamento você serve na MVP?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogAction onClick={() => setValidationError(false)} className="w-full bg-indigo-600 font-bold">
                                    Entendi, vou selecionar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
                <CardFooter className="flex gap-3 pt-2">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-xl font-bold"
                        onClick={reset}
                        disabled={isSubmitting}
                    >
                        Não sou eu
                    </Button>
                    <Button
                        className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/20"
                        onClick={confirmIdentity}
                        isLoading={isSubmitting}
                    >
                        Sim, sou eu
                    </Button>
                </CardFooter>
            </Card >
        );
    }

    // Step 3: Confirmation Form
    if (step === 3 && selectedParticipant) {
        const isAbsence = status === 'Ausente';

        return (
            <Card className="w-full shadow-lg border-t-4 border-t-indigo-600">
                <CardHeader>
                    <Button variant="ghost" onClick={() => { setStep(2); setStatus(null); }} className="absolute left-2 top-2 p-2 h-auto text-slate-400">
                        <AlertCircle className="h-4 w-4" />
                    </Button>
                    {logoUrl && (
                        <div className="flex justify-center mb-3">
                            <img src={logoUrl} alt="Logo" className="h-16 object-contain opacity-80" crossOrigin="anonymous" />
                        </div>
                    )}
                    <CardTitle className="text-center">Olá, {selectedParticipant.nome.split(' ')[0]}</CardTitle>
                    <CardDescription className="text-center">Você participará da reunião?</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl mb-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-bold text-foreground text-lg mb-3">{meeting.titulo}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                <Calendar className="h-4 w-4 text-indigo-500" />
                                <div className="flex flex-col">
                                    <span>{formatDateWithWeekday(meeting.data).formattedDate}</span>
                                    <span className="text-[10px] font-black opacity-60 tracking-tighter">{formatDateWithWeekday(meeting.data).dayName}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                <Clock className="h-4 w-4 text-indigo-500" /> {meeting.hora.slice(0, 5)}
                            </div>
                            {meeting.local && (
                                <div className="col-span-2 flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                    <MapPin className="h-4 w-4 text-indigo-500" /> {meeting.local}
                                </div>
                            )}
                        </div>
                        {meeting.descricao && (
                            <p className="mt-4 text-xs text-muted-foreground italic border-t border-slate-100 dark:border-slate-800 pt-3">{meeting.descricao}</p>
                        )}
                    </div>

                    {!status ? (
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                className="h-24 flex flex-col gap-2 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => submitConfirmation('Confirmado')}
                                isLoading={isSubmitting}
                            >
                                <Check className="h-8 w-8" />
                                <span>Sim, confirmo</span>
                            </Button>
                            <Button
                                variant="destructive"
                                className="h-24 flex flex-col gap-2 bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => setStatus('Ausente')}
                            >
                                <X className="h-8 w-8" />
                                <span>Não poderei</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            {isAbsence && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Por que não poderá participar?</label>
                                    <Input
                                        placeholder="Motivo (trabalho, saúde, viagem...)"
                                        value={justificativa}
                                        onChange={(e) => { setJustificativa(e.target.value); setErrorFull(""); }}
                                        className={cn(errorFull ? "border-red-500 focus-visible:ring-red-500" : "")}
                                    />
                                    {errorFull && <p className="text-xs text-red-500">{errorFull}</p>}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" className="flex-1" onClick={() => { setStatus(null); setErrorFull(""); }} disabled={isSubmitting}>
                                    Voltar
                                </Button>
                                <Button
                                    className={cn("flex-1 text-white", isAbsence ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700")}
                                    onClick={() => submitConfirmation(status)}
                                    isLoading={isSubmitting}
                                >
                                    Confirmar {isAbsence ? "Ausência" : "Presença"}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Step 4: Success
    if (step === 4) {
        const isConfirmed = status === 'Confirmado';
        return (
            <Card className="w-full shadow-lg border-t-4 border-t-green-500">
                <div className="flex justify-center pt-6 pb-2">
                    {/* Placeholder Logo - Substituir pelo arquivo real */}
                    <img
                        src={logoUrl || "https://placehold.co/200x80?text=Sua+Logo"}
                        alt="Logo da Igreja"
                        className="h-16 object-contain opacity-80 mx-auto"
                    />
                </div>
                <CardContent className="pt-6 text-center space-y-4">
                    <div className={cn("mx-auto h-20 w-20 rounded-full flex items-center justify-center animate-in zoom-in duration-300", isConfirmed ? "bg-green-100 dark:bg-green-900/30" : "bg-orange-100 dark:bg-orange-900/30")}>
                        {isConfirmed ? <ThumbsUp className="h-10 w-10 text-green-600 dark:text-green-400" /> : <X className="h-10 w-10 text-orange-600 dark:text-orange-400" />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-foreground tracking-tight">
                            {isConfirmed ? "Presença Confirmada!" : "Ausência Registrada"}
                        </h3>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Obrigado, <span className="font-bold text-foreground">{selectedParticipant?.nome.split(' ')[0]}</span>. <br />
                            {isConfirmed ? "Nos vemos na reunião!" : "Sua justificativa foi enviada."}
                        </p>
                    </div>


                    {isConfirmed && meeting && (
                        <>
                            <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                                <AlertDialogContent className="bg-white dark:bg-slate-900 border-indigo-600 border-t-4">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-center text-indigo-600 text-xl font-black">
                                            🎉 Presença Confirmada!
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-center text-foreground font-medium text-lg pt-2">
                                            Por favor, <span className="font-bold text-indigo-600">tira um print</span> ou clique em <span className="font-bold text-green-600">Salvar</span> no QR Code abaixo.
                                            <br /><br />
                                            Você precisará apresentá-lo na entrada.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogAction onClick={() => setShowSuccessDialog(false)} className="w-full bg-indigo-600 font-bold h-12 rounded-xl">
                                            Entendi, vou salvar agora!
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <div className="w-full space-y-6">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mt-6 inline-block w-full">
                                    <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-1">
                                        {formatDateWithWeekday(meeting.data).dayName}
                                    </p>
                                    <p className="text-xl font-bold text-foreground leading-none mb-1">
                                        {formatDateWithWeekday(meeting.data).formattedDate}
                                    </p>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        às {meeting.hora.slice(0, 5)}
                                    </p>
                                </div>

                                {selectedParticipant && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                                        <CredentialCard
                                            nome={selectedParticipant.nome}
                                            departamento={selectedParticipant.departamento || undefined}
                                            id_participante={selectedParticipant.id}
                                            logoUrl={logoUrl}
                                        />
                                    </div>
                                )}

                            </div>
                        </>
                    )}

                    <Button variant="outline" className="mt-6 w-full h-12 rounded-xl font-bold" onClick={reset}>
                        Voltar ao início
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return null;
}
