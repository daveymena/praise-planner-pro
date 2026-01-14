import { NavLink, useLocation } from "react-router-dom";
import {
  Music,
  Users,
  Calendar,
  Church,
  Home,
  Mic2,
  Menu,
  X,
  FileText
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Inicio", icon: Home },
  { path: "/ensayos", label: "Ensayos", icon: Mic2 },
  { path: "/repertorio", label: "Repertorio", icon: Music },
  { path: "/integrantes", label: "Integrantes", icon: Users },
  { path: "/servicios", label: "Servicios", icon: Church },
  { path: "/calendario", label: "Calendario", icon: Calendar },
  { path: "/normas", label: "Normas", icon: FileText },
];

export function MobileNav() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border/40 px-6 flex items-center justify-between z-50 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-primary/20">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black uppercase tracking-tighter text-foreground leading-none">Ministerio</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-0.5">App Pro</span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-2xl bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-all"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu (Side Drawer style for better UX) */}
      <div className={`fixed top-16 left-0 right-0 bottom-0 bg-background/95 backdrop-blur-2xl z-40 lg:hidden transform transition-all duration-500 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <nav className="p-6 space-y-2">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4 ml-2">Navegación Principal</p>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`nav-item ${isActive ? 'active' : ''} p-4 text-lg`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary/20' : 'bg-secondary/50'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-6 left-4 right-4 h-16 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] flex items-center justify-around px-2 z-50 lg:hidden shadow-2xl">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-slate-400 opacity-60'}`}
            >
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 rounded-full bg-primary animate-pulse" />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]' : ''}`} />
              <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}

