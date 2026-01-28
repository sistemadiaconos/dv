import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, LogOut, ShieldCheck, Settings, Menu, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";

import { ModeToggle } from "../components/mode-toggle";
import { TourGuide } from "../components/TourGuide";

export function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate("/login");
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                navigate("/login");
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const navItems = [
        { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/participantes", icon: Users, label: "Participantes" },
        { href: "/admin/reunioes", icon: Calendar, label: "Reuniões" },
        { href: "/admin/autorizacoes", icon: ShieldCheck, label: "Gerenciar Autorizações" },
        { href: "/admin/configuracoes", icon: Settings, label: "Configurações" },
    ];

    const NavContent = () => (
        <>
            <div className="p-6 border-b border-border flex justify-between items-center">
                <div id="tour-welcome">
                    <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
                    <p className="text-xs text-muted-foreground">MVP Confirmações</p>
                </div>
                {/* Mobile Close Button */}
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <nav id="tour-sidebar" className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-secondary text-secondary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border mt-auto">
                <div id="tour-theme-toggle" className="mb-4 flex justify-center">
                    <ModeToggle />
                </div>
                <Button
                    id="tour-logout"
                    variant="ghost"
                    className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-background flex text-foreground selection:bg-indigo-500/30">
            {/* Background Gradient Effect */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-from)_0%,_transparent_50%)] from-indigo-500/5 to-transparent pointer-events-none" />

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-card/50 backdrop-blur-xl border-r border-border hidden md:flex flex-col relative z-20">
                <NavContent />
            </aside>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-card border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-200" onClick={e => e.stopPropagation()}>
                        <NavContent />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 flex flex-col h-screen">
                {/* Mobile Header */}
                <header className="md:hidden border-b border-border p-4 flex items-center justify-between bg-card/50 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu className="h-6 w-6" />
                        </Button>
                        <span className="font-bold text-lg">Admin Panel</span>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
            <TourGuide />
        </div>
    );
}
