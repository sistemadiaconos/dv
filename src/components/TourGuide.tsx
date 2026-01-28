import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { HelpCircle } from "lucide-react";
import { Button } from "./ui/button";

export function TourGuide() {

    const startTour = () => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            doneBtnText: "Concluir",
            nextBtnText: "Próximo",
            prevBtnText: "Anterior",
            steps: [
                {
                    element: "#tour-welcome",
                    popover: {
                        title: "Bem-vindo ao Painel!",
                        description: "Olá! Preparamos um tour rápido para te mostrar as principais funcionalidades do sistema.",
                        side: "left",
                        align: 'start'
                    }
                },
                {
                    element: "#tour-sidebar",
                    popover: {
                        title: "Menu de Navegação",
                        description: "Aqui você acessa todas as áreas do sistema: Participantes, Reuniões e Configurações.",
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: "#tour-theme-toggle",
                    popover: {
                        title: "Modo Escuro/Claro",
                        description: "Prefere trabalhar no escuro? Você pode alternar o tema aqui a qualquer momento.",
                        side: "top",
                        align: 'start'
                    }
                },
                {
                    element: "#tour-logout",
                    popover: {
                        title: "Sair com Segurança",
                        description: "Quando terminar seu trabalho, clique aqui para sair da sua conta.",
                        side: "top",
                        align: 'start'
                    }
                },
                {
                    element: "#tour-help-btn",
                    popover: {
                        title: "Precisa de ajuda?",
                        description: "Se quiser ver este tour novamente, basta clicar neste botão de ajuda.",
                        side: "bottom",
                        align: 'end'
                    }
                }
            ],
            onDestroyed: () => {
                localStorage.setItem("tour_seen", "true");
            }
        });

        driverObj.drive();
    };

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("tour_seen");
        if (!hasSeenTour) {
            // Pequeno delay para garantir que a UI carregou
            setTimeout(() => {
                startTour();
            }, 1000);
        }
    }, []);

    return (
        <Button
            id="tour-help-btn"
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg bg-card hover:bg-accent"
            onClick={startTour}
            title="Iniciar Tour Guiado"
        >
            <HelpCircle className="h-5 w-5 text-indigo-500" />
        </Button>
    );
}
