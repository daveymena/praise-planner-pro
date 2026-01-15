import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import {
  Mic2,
  Music,
  Users,
  Church,
  Calendar,
  ArrowRight,
  Clock,
  MapPin,
  Loader2,
  Sparkles,
  Smartphone,
  Download
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUpcomingRehearsals } from "@/hooks/useRehearsals";
import { useUpcomingServices } from "@/hooks/useServices";
import { useSongs } from "@/hooks/useSongs";
import { useMembers } from "@/hooks/useMembers";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Member, Song, Service } from "@/types/api";

const quickActions = [
  { label: "Nuevo Ensayo", path: "/ensayos", icon: Mic2 },
  { label: "Agregar Canción", path: "/repertorio", icon: Music },
  { label: "Ver Calendario", path: "/calendario", icon: Calendar },
  { label: "Gestionar Equipo", path: "/integrantes", icon: Users },
];

export default function Index() {
  const { data: upcomingRehearsals, isLoading: loadingRehearsals } = useUpcomingRehearsals();
  const { data: upcomingServices, isLoading: loadingServices } = useUpcomingServices() as { data: Service[], isLoading: boolean };
  const { data: songs, isLoading: loadingSongs } = useSongs() as { data: Song[], isLoading: boolean };
  const { data: members, isLoading: loadingMembers } = useMembers() as { data: Member[], isLoading: boolean };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      // If no prompt, it might be iOS or already installed, show instructions
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  // Calculate stats
  const totalSongs = songs?.length || 0;
  const activeMembers = members?.filter(m => m.is_active)?.length || 0;
  const nextRehearsal = upcomingRehearsals?.[0];
  const thisMonthServices = upcomingServices?.filter(service => {
    const serviceDate = new Date(service.date);
    const now = new Date();
    return serviceDate.getMonth() === now.getMonth() && serviceDate.getFullYear() === now.getFullYear();
  })?.length || 0;

  const stats = [
    {
      title: "Próximo Ensayo",
      value: nextRehearsal ? format(new Date(nextRehearsal.date), "EEEE", { locale: es }) : "N/A",
      subtitle: nextRehearsal ? nextRehearsal.time : "Sin programar",
      icon: Mic2,
      trend: "neutral" as const
    },
    {
      title: "Repertorio",
      value: loadingSongs ? "..." : totalSongs.toString(),
      subtitle: "Canciones activas",
      icon: Music,
      trend: "up" as const
    },
    {
      title: "Equipo",
      value: loadingMembers ? "..." : activeMembers.toString(),
      subtitle: "Integrantes",
      icon: Users,
      trend: "up" as const
    },
    {
      title: "Servicios",
      value: loadingServices ? "..." : thisMonthServices.toString(),
      subtitle: "Este mes",
      icon: Church,
      trend: "neutral" as const
    },
  ];

  const formatRehearsalDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayName = format(date, "EEEE", { locale: es });
    const dayNumber = format(date, "d");
    const monthName = format(date, "MMM", { locale: es });
    return { dayName, dayNumber, monthName };
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-10 pb-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 text-white fade-in shadow-2xl">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/20 to-transparent z-0" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl z-0" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest text-primary-foreground">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Ministerio en Excelencia
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-white">
              Eleva tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Adoración</span> a otro nivel.
            </h1>
            <p className="text-lg text-slate-300 font-medium">
              Gestiona tu ministerio con herramientas profesionales. Organiza ensayos, repertorio y servicios en un solo lugar.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/repertorio">
                <Button className="btn-premium h-14 px-8 text-base shadow-xl shadow-primary/20">
                  Explorar Repertorio
                </Button>
              </Link>
              <Link to="/ensayos">
                <Button variant="outline" className="h-14 px-8 text-base bg-white border-white text-slate-900 hover:bg-white/90 rounded-2xl font-bold">
                  Programar Ensayo
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Rehearsals */}
          <div className="lg:col-span-2 glass-card p-8 slide-up">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-foreground">
                  Próximos Ensayos
                </h2>
                <p className="text-sm text-muted-foreground">Mantente al día con la preparación del equipo.</p>
              </div>
              <Link to="/ensayos">
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 rounded-xl">
                  Ver Calendario <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {loadingRehearsals ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Cargando agenda...</p>
              </div>
            ) : upcomingRehearsals && upcomingRehearsals.length > 0 ? (
              <div className="space-y-4">
                {upcomingRehearsals.slice(0, 3).map((rehearsal, index) => {
                  const { dayName, dayNumber, monthName } = formatRehearsalDate(rehearsal.date);
                  return (
                    <div
                      key={rehearsal.id}
                      className="group flex flex-items-center gap-6 p-5 rounded-3xl bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-primary/10 transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-background border border-border/50 flex flex-col items-center justify-center text-foreground group-hover:scale-105 transition-transform shadow-sm">
                        <span className="text-[10px] uppercase font-black text-primary tracking-tighter">
                          {monthName}
                        </span>
                        <span className="text-2xl font-black">
                          {dayNumber}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-foreground truncate uppercase tracking-tight">
                            Ensayo {rehearsal.type}
                          </h3>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        </div>
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1 text-sm text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-primary/60" />
                            {rehearsal.time}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-primary/60" />
                            {rehearsal.location}
                          </span>
                          <span className="flex items-center gap-1.5 capitalize text-primary/80">
                            {dayName}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:block">
                        <Link to={`/ensayos`}>
                          <Button variant="outline" className="h-10 px-4 rounded-xl border-border/50 bg-background hover:bg-secondary transition-all">
                            Detalles
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-secondary/20 rounded-[2rem] border border-dashed border-border/60">
                <Mic2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-bold text-foreground">No hay ensayos programados</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-[200px] mx-auto">Es un buen momento para planificar la semana.</p>
                <Link to="/ensayos">
                  <Button className="mt-6 btn-gold" size="sm">
                    Programar Ahora
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions & Spiritual */}
          <div className="space-y-8 slide-up">
            {/* PWA Install Card */}
            <div className="glass-card p-8 bg-gradient-to-br from-primary to-indigo-600 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Smartphone className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tighter">
                  <Download className="w-5 h-5 text-amber-300" />
                  App en tu Móvil
                </h3>
                <p className="text-sm text-white/80 font-medium leading-relaxed">
                  Lleva tu ministerio siempre contigo. Instala Praise Pro para acceso rápido y notificaciones.
                </p>
                <Button
                  onClick={handleInstall}
                  className="w-full bg-white text-primary hover:bg-white/90 font-black h-12 rounded-2xl shadow-lg border-none uppercase tracking-widest text-xs"
                >
                  {deferredPrompt ? 'Instalar Ahora' : 'Cómo Instalar'}
                </Button>
              </div>
            </div>

            <div className="glass-card p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-white/5 text-white shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                Acceso Rápido
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link key={index} to={action.path} className="block">
                      <button
                        className="w-full h-24 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-2 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{action.label}</span>
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Spiritual Card */}
            <div className="card-premium p-8 border-primary/20 bg-primary/5">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <p className="text-lg font-medium text-foreground italic leading-relaxed">
                "Cantad a Jehová cántico nuevo; su alabanza sea en la congregación de los santos."
              </p>
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm font-black text-primary uppercase tracking-widest">
                  Salmos 149:1
                </p>
                <div className="w-10 h-1 bg-primary/30 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

