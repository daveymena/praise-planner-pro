import { NavLink, useLocation } from "react-router-dom";
import {
  Music,
  Users,
  Calendar,
  Church,
  FileText,
  Home,
  Mic2,
  LogOut,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { path: "/", label: "Inicio", icon: Home },
  { path: "/ensayos", label: "Ensayos", icon: Mic2 },
  { path: "/repertorio", label: "Repertorio", icon: Music },
  { path: "/integrantes", label: "Integrantes", icon: Users },
  { path: "/servicios", label: "Servicios", icon: Church },
  { path: "/calendario", label: "Calendario", icon: Calendar },
  { path: "/normas", label: "Normas", icon: FileText },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-background/50 backdrop-blur-2xl border-r border-border/40 p-8 flex flex-col z-50">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-primary/5 blur-[80px] -z-10 pointer-events-none" />

      {/* Logo Section */}
      <div className="mb-12">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="w-12 h-12 rounded-[1.2rem] gold-gradient flex items-center justify-center shadow-xl shadow-primary/20 shrink-0 group-hover:scale-105 transition-transform duration-500">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-foreground tracking-tighter truncate uppercase leading-none">
              {user?.ministry_name || "Harmony"}
            </h1>
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em]">Pro Ministry</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.3em] mb-4 ml-4">Menú Principal</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group
                ${isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 font-bold'
                  : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground hover:translate-x-1'}
              `}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-sm tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Session */}
      <div className="mt-auto pt-8 border-t border-border/50 space-y-6">
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 group overflow-hidden relative"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
          <span className="text-sm font-bold tracking-tight relative z-10">Cerrar Sesión</span>
          <div className="absolute inset-0 bg-destructive/0 group-hover:bg-destructive/5 transition-colors" />
        </button>

        <div className="flex flex-col items-center gap-3">
          <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.4em]">🕊️ Soli Deo Gloria</p>
          <div className="flex gap-2">
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="w-4 h-1 rounded-full bg-primary/20" />
            <div className="w-1 h-1 rounded-full bg-border" />
          </div>
        </div>
      </div>
    </aside>
  );
}
