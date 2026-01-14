import { NavLink, useLocation } from "react-router-dom";
import {
    Music,
    Users,
    Calendar,
    Church,
    Home,
    Mic2,
    FileText,
    LogOut,
    Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
    { path: "/", label: "Inicio", icon: Home },
    { path: "/ensayos", label: "Ensayos", icon: Mic2 },
    { path: "/servicios", label: "Servicios", icon: Church },
    { path: "/repertorio", label: "Repertorio", icon: Music },
    { path: "/integrantes", label: "Equipo", icon: Users },
    { path: "/calendario", label: "Agenda", icon: Calendar },
    { path: "/normas", label: "Manual", icon: FileText },
];

export function Navigation() {
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <>
            {/* Desktop Top Navbar */}
            <header className="fixed top-0 left-0 right-0 h-20 bg-background/60 backdrop-blur-2xl border-b border-border/40 z-50 hidden lg:flex items-center px-10 justify-between">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3 group cursor-default">
                        <div className="w-12 h-12 rounded-[1.25rem] gold-gradient flex items-center justify-center shadow-xl shadow-primary/20 shrink-0 group-hover:scale-105 transition-all">
                            <Music className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-black text-foreground tracking-tighter uppercase leading-none">
                                {user?.ministry_name || "Harmony"}
                            </h1>
                            <div className="mt-1.5 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em]">Soli Deo Gloria</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex items-center gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={`px-5 py-2.5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all ${isActive
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </div>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={logout}
                        className="flex items-center gap-2 px-5 h-11 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Salir</span>
                    </Button>
                </div>
            </header>

            {/* Mobile Bottom Navigation (A native-app feel) */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] h-16 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex items-center justify-around px-2 z-50 lg:hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]">
                {navItems.slice(0, 5).map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${isActive ? "text-primary scale-110" : "text-slate-500"
                                }`}
                        >
                            {isActive && (
                                <div className="absolute top-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#2563eb]" />
                            )}
                            <Icon className={`w-6 h-6 transition-all ${isActive ? "drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" : "opacity-60"}`} />
                            <span className={`text-[9px] font-black uppercase tracking-widest mt-1 transition-all ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 h-0"}`}>
                                {item.label}
                            </span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Mobile Logo/Top Bar (Very minimal) */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-40 bg-background/50 backdrop-blur-sm pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center shadow-lg">
                        <Music className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-tighter text-foreground">{user?.ministry_name || "Harmony"}</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="w-10 h-10 rounded-xl bg-secondary/50 pointer-events-auto"
                >
                    <LogOut className="w-4 h-4 text-muted-foreground" />
                </Button>
            </div>
        </>
    );
}
