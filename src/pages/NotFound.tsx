import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Music, Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="text-center relative z-10 max-w-md space-y-8 fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-secondary border border-border/50 shadow-inner mb-4">
          <Search className="w-10 h-10 text-muted-foreground/30" />
        </div>

        <div className="space-y-3">
          <h1 className="text-8xl font-black text-foreground/10 tracking-tighter leading-none">404</h1>
          <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Ruta No Encontrada</h2>
          <p className="text-muted-foreground font-medium">
            Parece que la página que buscas ha sido movida o no existe en nuestro manual ministerial.
          </p>
        </div>

        <div className="pt-8">
          <Link to="/">
            <Button className="btn-gold h-14 px-10 rounded-2xl shadow-2xl shadow-primary/20 group">
              <Home className="w-5 h-5 mr-3 group-hover:-translate-y-1 transition-transform" />
              <span>Volver al Inicio</span>
            </Button>
          </Link>
        </div>

        <div className="pt-12 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Harmony Pro</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-border" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Soli Deo Gloria</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
