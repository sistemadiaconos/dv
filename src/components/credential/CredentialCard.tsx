import QRCode from "react-qr-code";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";

import html2canvas from "html2canvas";
import { Share2 } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

interface CredentialCardProps {
    nome: string;
    departamento?: string;
    id_participante: string;
    logoUrl?: string | null;
}

export function CredentialCard({ nome, departamento, id_participante, logoUrl }: CredentialCardProps) {
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async () => {
        setIsSharing(true);
        const element = document.getElementById("credential-card");
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                backgroundColor: null,
                scale: 2, // High resolution
                useCORS: true, // Important for external images (like Supabase storage)
                allowTaint: true
            });

            canvas.toBlob(async (blob) => {
                if (!blob) return;

                const file = new File([blob], "credential.png", { type: "image/png" });

                // Try native share
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Minha Credencial',
                            text: 'Aqui está minha credencial para a reunião.'
                        });
                    } catch (error) {
                        console.log('Share canceled or failed', error);
                    }
                } else {
                    // Fallback to download
                    const link = document.createElement("a");
                    link.download = `credencial-${nome.split(' ')[0]}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                }
                setIsSharing(false);
            });
        } catch (err) {
            console.error(err);
            setIsSharing(false);
            alert("Erro ao gerar imagem. Tente tirar um print.");
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <Card id="credential-card" className="w-full max-w-sm mx-auto shadow-2xl border-t-4 border-t-indigo-600 glass-card bg-white/95 backdrop-blur overflow-hidden">
                <CardHeader className="text-center pb-2 bg-gradient-to-b from-indigo-50/50 to-transparent">
                    {logoUrl && (
                        <div className="flex justify-center mb-3">
                            <img src={logoUrl} alt="Logo" className="h-12 object-contain drop-shadow-sm" crossOrigin="anonymous" />
                        </div>
                    )}
                    <CardTitle className="text-2xl font-black tracking-tight text-indigo-950 uppercase">{nome}</CardTitle>
                    <div className="flex justify-center mt-2">
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-1 text-sm font-bold uppercase tracking-wider">
                            {departamento || "Voluntário"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
                    <div className="p-4 bg-white rounded-2xl shadow-inner border border-gray-100">
                        <div className="h-48 w-48 flex items-center justify-center">
                            <QRCode
                                value={id_participante}
                                size={180}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                                level="H"
                            />
                        </div>
                    </div>
                    <CardDescription className="text-center text-xs font-medium text-gray-400 uppercase tracking-widest">
                        Apresente este código na entrada
                    </CardDescription>
                </CardContent>
            </Card>

            <Button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full max-w-sm mx-auto h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-500/20"
            >
                {isSharing ? "Gerando imagem..." : (
                    <span className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" /> Salvar / Compartilhar
                    </span>
                )}
            </Button>
        </div>
    );
}
