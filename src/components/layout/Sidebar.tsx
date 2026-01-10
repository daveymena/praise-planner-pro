import { NavLink, useLocation } from "react-router-dom";
import { 
  Music, 
  Users, 
  Calendar, 
  Church, 
  FileText, 
  Home,
  Mic2
} from "lucide-react";

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

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border/50 p-6 flex flex-col z-50">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
            <Music className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-semibold text-foreground">Alabanza</h1>
            <p className="text-xs text-muted-foreground">Ministerio de Música</p>
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
      <div className="pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          🕊️ Para la gloria de Dios
        </p>
      </div>
    </aside>
  );
}
