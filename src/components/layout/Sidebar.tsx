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
    <aside className="fixed left-0 top-0 h-full w-64 glass-card border-r border-white/10 p-6 flex flex-col z-50">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-primary/20">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">{user?.ministry_name || "Harmony"}</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-2 h-2" />
              Pro Ministry
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-4">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>

        <div className="pt-4 border-t border-white/5">
          <p className="text-[10px] text-muted-foreground/60 text-center uppercase tracking-widest">
            🕊️ Soli Deo Gloria
          </p>
        </div>
      </div>
    </aside>
  );
}
