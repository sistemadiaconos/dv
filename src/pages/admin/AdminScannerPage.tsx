import { useEffect, useState } from "react";
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { meetingService, type Reuniao } from "../../services/meetingService";
import { participantService } from "../../services/participantService";
import { CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AdminScannerPage() {
    const [meeting, setMeeting] = useState<Reuniao | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastScan, setLastScan] = useState<{ id: string, name: string, status: 'success' | 'error' | 'loading' } | null>(null);
    const [scanBlocked, setScanBlocked] = useState(false);

    useEffect(() => {
        loadActiveMeeting();
    }, []);

    async function loadActiveMeeting() {
        const active = await meetingService.getActiveMeeting();
        setMeeting(active);
        setLoading(false);
    }

    const handleScan = async (result: any) => {
        if (scanBlocked || !result || !meeting) return;

        // Extract raw value (react-qr-scanner returns [{rawValue: ...}])
        const rawValue = result?.[0]?.rawValue;
        if (!rawValue) return;

        setScanBlocked(true);
        setLastScan({ id: rawValue, name: 'Processando...', status: 'loading' });

        try {
            // 1. Check if participant exists
            const { data: participant, error: partError } = await supabase
                .from('participantes')
                .select('id, nome')
                .eq('id', rawValue)
                .single();

            if (partError || !participant) {
                setLastScan({ id: rawValue, name: 'Participante não encontrado', status: 'error' });
                playSound('error');
            } else {
                // 2. Mark attendance
                // Check if already confirmed? We can upsert or check first.
                // Let's perform upsert to 'confirmacoes' table
                // But confirmacoes has PK as id. We need to find by participante_id + reuniao_id.

                // First check existing
                const { data: existing } = await supabase
                    .from('confirmacoes')
                    .select('id')
                    .eq('id_participante', participant.id)
                    .eq('id_reuniao', meeting.id)
                    .single();

                let error;
                if (existing) {
                    const { error: updateError } = await supabase
                        .from('confirmacoes')
                        .update({
                            presenca: 'Confirmado',
                            checkin_em: new Date().toISOString()
                        })
                        .eq('id', existing.id);
                    error = updateError;
                } else {
                    const { error: insertError } = await supabase
                        .from('confirmacoes')
                        .insert([{
                            id_participante: participant.id,
                            id_reuniao: meeting.id,
                            presenca: 'Confirmado',
                            data_confirmacao: new Date().toISOString(),
                            checkin_em: new Date().toISOString()
                        }]);
                    error = insertError;
                }

                if (error) {
                    console.error(error);
                    setLastScan({ id: participant.id, name: participant.nome, status: 'error' });
                    playSound('error');
                } else {
                    setLastScan({ id: participant.id, name: participant.nome, status: 'success' });
                    playSound('success');
                }
            }
        } catch (err) {
            console.error(err);
            setLastScan({ id: rawValue, name: 'Erro interno', status: 'error' });
            playSound('error');
        }

        // Unblock after delay
        setTimeout(() => setScanBlocked(false), 2000);
    };

    function playSound(type: 'success' | 'error') {
        const audio = new Audio(type === 'success' ? '/sounds/success.mp3' : '/sounds/error.mp3');
        // We probably don't have sounds, so we can just skip or use browser beep if possible (not possible in web easily)
        // Ignoring actual audio for now, as we don't have assets.
    }

    if (loading) return <div className="p-8 text-center">Carregando...</div>;

    if (!meeting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-bold">Nenhuma Reunião Ativa</h2>
                <p className="text-muted-foreground">Inicie uma reunião no painel para usar o scanner.</p>
                <Link to="/admin">
                    <Button>Voltar ao Admin</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-md mx-auto relative bg-black">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 text-white">
                <div className="flex items-center justify-between">
                    <Link to="/admin">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <div className="text-center">
                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Leitor de Check-in</p>
                        <p className="text-sm font-bold truncate max-w-[200px]">{meeting.titulo}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setLastScan(null)}>
                        <RefreshCw className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Scanner Area */}
            <div className="flex-1 relative overflow-hidden flex items-center bg-black">
                <Scanner
                    onScan={handleScan}
                    styles={{ container: { height: '100%' } }}
                    components={{ audio: false, finder: true }}
                    allowMultiple={true}
                    scanDelay={2000}
                />

                {/* Scan Feedback Overlay */}
                {lastScan && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <Card className={`w-full max-w-sm border-0 shadow-2xl ${lastScan.status === 'success' ? 'bg-green-500 text-white' : (lastScan.status === 'loading' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white')}`}>
                            <CardContent className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                                {lastScan.status === 'loading' && <RefreshCw className="h-16 w-16 animate-spin opacity-80" />}
                                {lastScan.status === 'success' && <CheckCircle2 className="h-16 w-16 scale-110" />}
                                {lastScan.status === 'error' && <XCircle className="h-16 w-16" />}

                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight">
                                        {lastScan.status === 'success' ? 'Confirmado!' : (lastScan.status === 'loading' ? 'Lendo...' : 'Erro')}
                                    </h3>
                                    <p className="text-lg font-medium opacity-90 mt-1">{lastScan.name}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Footer Instructions */}
            <div className="absolute bottom-6 left-0 right-0 text-center text-white/50 text-xs z-10">
                Aponte para o QR Code do participante
            </div>
        </div>
    );
}
