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
    Sparkles,
    MoreHorizontal,
    Download,
    Smartphone,
    Menu,
    HelpCircle
} from "lucide-react";
import { useState, useEffect } from "react";

// Register beforeinstallprompt event type for TS
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
    { path: "/", label: "Inicio", icon: Home },
    { path: "/ensayos", label: "Ensayos", icon: Mic2 },
    { path: "/servicios", label: "Servicios", icon: Church },
    { path: "/repertorio", label: "Repertorio", icon: Music },
    { path: "/integrantes", label: "Equipo", icon: Users },
    { path: "/calendario", label: "Agenda", icon: Calendar },
    { path: "/normas", label: "Manual", icon: FileText },
    { path: "/tutorial", label: "Guía", icon: Sparkles },
];

export function Navigation() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showInstallInfo, setShowInstallInfo] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else {
            // Fallback for iOS or already installed
            setShowInstallInfo(true);
        }
        setIsMenuOpen(false);
    };

    return (
        <>
            {/* Desktop Top Navbar */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-background/60 backdrop-blur-2xl border-b border-border/40 z-50 hidden lg:flex items-center px-10 justify-between">
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
            <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-3xl border-t border-white/10 flex items-center justify-around px-2 z-50 lg:hidden shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
                {navItems.slice(0, 4).map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${isActive ? "text-primary scale-110" : "text-white/60 hover:text-white"
                                }`}
                        >
                            {isActive && (
                                <div className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.8)]" />
                            )}
                            <Icon className={`w-6 h-6 transition-all ${isActive ? "drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]" : ""}`} />
                            <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5 transition-all ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 h-0"}`}>
                                {item.label}
                            </span>
                        </NavLink>
                    );
                })}

                {/* More Menu */}
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <SheetTrigger asChild>
                        <button className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-white/60 hover:text-white transition-all">
                            <Menu className="w-6 h-6" />
                            <span className="text-[9px] font-black uppercase tracking-widest mt-1.5">Más</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="bg-background border-t border-primary/20 rounded-t-[2.5rem] p-8 lg:hidden">
                        <SheetHeader className="mb-8">
                            <SheetTitle className="text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                Centro de App
                            </SheetTitle>
                            <SheetDescription className="text-left">Gestión rápida y guía para tu ministerio</SheetDescription>
                        </SheetHeader>

                        <div className="grid grid-cols-2 gap-4">
                            <NavLink
                                to="/tutorial"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-primary/5 border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all group"
                            >
                                <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Guía App</span>
                            </NavLink>

                            <button
                                onClick={handleInstallClick}
                                className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-all group relative overflow-hidden"
                            >
                                {deferredPrompt && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                )}
                                <Smartphone className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{deferredPrompt ? 'Instalar Ya' : 'Instalar'}</span>
                            </button>

                            <NavLink
                                to="/normas"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-secondary/50 border border-border/50 text-foreground hover:bg-secondary transition-all group"
                            >
                                <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Manual</span>
                            </NavLink>

                            <button
                                onClick={logout}
                                className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-destructive/5 border border-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all group"
                            >
                                <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Salir</span>
                            </button>
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>

            {/* Install Information Modal */}
            <Sheet open={showInstallInfo} onOpenChange={setShowInstallInfo}>
                <SheetContent side="bottom" className="bg-background border-t border-primary/20 rounded-t-[2.5rem] p-8 lg:hidden h-[70vh]">
                    <SheetHeader className="mb-10">
                        <SheetTitle className="text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                                <Download className="w-6 h-6 text-white" />
                            </div>
                            Instalar Praise Pro
                        </SheetTitle>
                        <SheetDescription className="text-left text-base font-medium">Lleva tu ministerio siempre en el bolsillo sin ocupar espacio.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-8">
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 font-black text-xs">1</div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-foreground">En Android / Google Chrome</h4>
                                <p className="text-sm text-muted-foreground font-medium">Pulsa el botón de opciones (tres puntos) y selecciona <span className="text-primary font-bold">"Instalar Aplicación"</span>.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 font-black text-xs">2</div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-foreground">En iOS / iPhone (Safari)</h4>
                                <p className="text-sm text-muted-foreground font-medium">Pulsa el botón de <span className="text-primary font-bold">Compartir</span> (flecha hacia arriba) y busca <span className="text-primary font-bold">"Añadir a pantalla de inicio"</span>.</p>
                            </div>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-primary/10 border border-primary/20">
                            <p className="text-xs font-bold text-primary leading-relaxed text-center italic">"Y todo lo que hagáis, hacedlo de corazón, como para el Señor." - Col 3:23</p>
                        </div>

                        <Button onClick={() => setShowInstallInfo(false)} className="w-full btn-premium h-14 rounded-2xl font-black uppercase tracking-widest">
                            ¡Entendido!
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Mobile Logo/Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-6 z-40 bg-background/80 backdrop-blur-xl border-b border-border/10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shadow-lg">
                        <Music className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black uppercase tracking-tighter text-foreground leading-none">{user?.ministry_name || "Harmony"}</span>
                        <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mt-0.5">Ministerio Pro</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20"
                    >
                        <NavLink to="/tutorial">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </NavLink>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={logout}
                        className="w-10 h-10 rounded-xl bg-secondary/50"
                    >
                        <LogOut className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>
        </>
    );
}
