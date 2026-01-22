import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, ClipboardCheck, LogOut, ShieldCheck, Settings } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";

import { ModeToggle } from "../components/mode-toggle";

export function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    const navItems = [
        { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/participantes", icon: Users, label: "Participantes" },
        { href: "/admin/reunioes", icon: Calendar, label: "Reuniões" },
        { href: "/admin/autorizacoes", icon: ShieldCheck, label: "Gerenciar Autorizações" },
        { href: "/admin/configuracoes", icon: Settings, label: "Configurações" },
    ];

    return (
        <div className="min-h-screen bg-background flex text-foreground selection:bg-indigo-500/30">
            {/* Background Gradient Effect */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-from)_0%,_transparent_50%)] from-indigo-500/5 to-transparent pointer-events-none" />

            {/* Sidebar */}
            <aside className="w-64 bg-card/50 backdrop-blur-xl border-r border-border hidden md:flex flex-col relative z-20">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
                        <p className="text-xs text-muted-foreground">MVP Confirmações</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                to={item.href}
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

                <div className="p-4 border-t border-border">
                    <div className="mb-4 flex justify-center">
                        <ModeToggle />
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
