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
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUpcomingRehearsals } from "@/hooks/useRehearsals";
import { useUpcomingServices } from "@/hooks/useServices";
import { useSongs } from "@/hooks/useSongs";
import { useMembers } from "@/hooks/useMembers";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const quickActions = [
  { label: "Nuevo Ensayo", path: "/ensayos", icon: Mic2 },
  { label: "Agregar Canción", path: "/repertorio", icon: Music },
  { label: "Ver Calendario", path: "/calendario", icon: Calendar },
  { label: "Gestionar Equipo", path: "/integrantes", icon: Users },
];

export default function Index() {
  const { data: upcomingRehearsals, isLoading: loadingRehearsals } = useUpcomingRehearsals();
  const { data: upcomingServices, isLoading: loadingServices } = useUpcomingServices();
  const { data: songs, isLoading: loadingSongs } = useSongs();
  const { data: members, isLoading: loadingMembers } = useMembers();

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
      icon: Mic2 
    },
    { 
      title: "Canciones", 
      value: loadingSongs ? "..." : totalSongs.toString(), 
      subtitle: "en repertorio", 
      icon: Music 
    },
    { 
      title: "Integrantes", 
      value: loadingMembers ? "..." : activeMembers.toString(), 
      subtitle: "activos", 
      icon: Users, 
      trend: "up" as const 
    },
    { 
      title: "Servicios", 
      value: loadingServices ? "..." : thisMonthServices.toString(), 
      subtitle: "este mes", 
      icon: Church 
    },
  ];

  const formatRehearsalDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayName = format(date, "EEEE", { locale: es });
    const dayNumber = format(date, "d");
    return { dayName, dayNumber };
  };
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="fade-in">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">
            ¡Bienvenido al Ministerio! 🎵
          </h1>
          <p className="text-muted-foreground mt-2">
            Organiza ensayos, gestiona el repertorio y prepara los servicios con excelencia.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Rehearsals */}
          <div className="lg:col-span-2 card-elevated p-6 slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-semibold text-foreground">
                Próximos Ensayos
              </h2>
              <Link to="/ensayos">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            {loadingRehearsals ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : upcomingRehearsals && upcomingRehearsals.length > 0 ? (
              <div className="space-y-4">
                {upcomingRehearsals.slice(0, 3).map((rehearsal, index) => {
                  const { dayName, dayNumber } = formatRehearsalDate(rehearsal.date);
                  return (
                    <div 
                      key={rehearsal.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-14 h-14 rounded-xl gold-gradient flex flex-col items-center justify-center text-primary-foreground">
                        <span className="text-xs font-medium capitalize">
                          {dayName.slice(0, 3)}
                        </span>
                        <span className="text-lg font-bold">
                          {dayNumber}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          Ensayo {rehearsal.type}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {rehearsal.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {rehearsal.location}
                          </span>
                        </div>
                      </div>
                      
                      <Link to={`/ensayos`}>
                        <Button variant="outline" size="sm">
                          Ver detalles
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mic2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No hay ensayos programados</p>
                <Link to="/ensayos">
                  <Button className="mt-3 btn-gold" size="sm">
                    Programar Ensayo
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card-elevated p-6 slide-up">
            <h2 className="text-xl font-serif font-semibold text-foreground mb-6">
              Acciones Rápidas
            </h2>
            
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={index} to={action.path}>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3 h-12 hover:bg-primary/5 hover:border-primary/30 transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      {action.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Spiritual Note */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
              <p className="text-sm text-muted-foreground italic">
                "Cantad a Jehová cántico nuevo; su alabanza sea en la congregación de los santos."
              </p>
              <p className="text-xs text-primary mt-2 font-medium">
                — Salmos 149:1
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
