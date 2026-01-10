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
  MapPin
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { title: "Próximo Ensayo", value: "Jueves", subtitle: "19:30 hrs", icon: Mic2 },
  { title: "Canciones", value: "24", subtitle: "en repertorio", icon: Music },
  { title: "Integrantes", value: "12", subtitle: "activos", icon: Users, trend: "up" as const },
  { title: "Servicios", value: "4", subtitle: "este mes", icon: Church },
];

const upcomingRehearsals = [
  { id: 1, date: "Jueves 18", time: "19:30", place: "Templo Principal", type: "General" },
  { id: 2, date: "Sábado 20", time: "16:00", place: "Sala de Ensayo", type: "Vocal" },
  { id: 3, date: "Jueves 25", time: "19:30", place: "Templo Principal", type: "General" },
];

const quickActions = [
  { label: "Nuevo Ensayo", path: "/ensayos", icon: Mic2 },
  { label: "Agregar Canción", path: "/repertorio", icon: Music },
  { label: "Ver Calendario", path: "/calendario", icon: Calendar },
  { label: "Gestionar Equipo", path: "/integrantes", icon: Users },
];

export default function Index() {
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
            
            <div className="space-y-4">
              {upcomingRehearsals.map((rehearsal, index) => (
                <div 
                  key={rehearsal.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-xl gold-gradient flex flex-col items-center justify-center text-primary-foreground">
                    <span className="text-xs font-medium">
                      {rehearsal.date.split(' ')[0]}
                    </span>
                    <span className="text-lg font-bold">
                      {rehearsal.date.split(' ')[1]}
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
                        {rehearsal.place}
                      </span>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    Ver detalles
                  </Button>
                </div>
              ))}
            </div>
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
