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
      <header className="fixed top-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-b border-border/50 px-4 flex items-center justify-between z-50 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <Music className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-serif font-semibold text-foreground">Alabanza</span>
        </div>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div className={`fixed top-16 left-0 right-0 bg-card border-b border-border/50 z-40 lg:hidden transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-t border-border/50 flex items-center justify-around px-2 z-50 lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
