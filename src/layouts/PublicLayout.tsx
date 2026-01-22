import { Outlet, Link } from "react-router-dom";
import { Lock } from "lucide-react";

import { ModeToggle } from "../components/mode-toggle";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../lib/utils";

export function PublicLayout() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                <Link
                    to="/login"
                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                >
                    <Lock className="h-[1.2rem] w-[1.2rem]" />
                </Link>
                <ModeToggle />
            </div>
            <div className="w-full max-w-md relative z-10">
                <Outlet />
            </div>
        </div>
    );
}
