import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Church,
  Music,
  Users,
  Calendar,
  Clock,
  ChevronRight
} from "lucide-react";

interface Service {
  id: number;
  date: string;
  time: string;
  type: "Domingo" | "Vigilia" | "Especial" | "Oración";
  songs: string[];
  team: { role: string; name: string }[];
  spiritualFocus?: string;
}

const mockServices: Service[] = [
  {
    id: 1,
    date: "2025-01-19",
    time: "10:00",
    type: "Domingo",
    songs: ["Alabaré", "Cristo Vive", "Santo Espíritu", "Tu Gracia"],
    team: [
      { role: "Director", name: "Juan" },
      { role: "Voz Líder", name: "María" },
      { role: "Coros", name: "Ana, Pedro" },
      { role: "Teclado", name: "Luis" },
    ],
    spiritualFocus: "Llamado a la adoración profunda"
  },
  {
    id: 2,
    date: "2025-01-24",
    time: "21:00",
    type: "Vigilia",
    songs: ["Ven Espíritu Ven", "Gracia Sublime", "Santo Espíritu"],
    team: [
      { role: "Director", name: "Juan" },
      { role: "Voz Líder", name: "Ana" },
      { role: "Coros", name: "María" },
    ],
    spiritualFocus: "Búsqueda del Espíritu Santo"
  },
  {
    id: 3,
    date: "2025-01-26",
    time: "10:00",
    type: "Domingo",
    songs: ["Grande es el Señor", "Cuan Grande es Él", "Digno es el Señor"],
    team: [
      { role: "Director", name: "Juan" },
      { role: "Voz Líder", name: "María" },
      { role: "Guitarra", name: "Pedro" },
    ],
    spiritualFocus: "Celebración y gratitud"
  },
];

const typeColors = {
  "Domingo": "bg-primary/10 text-primary border-primary/20",
  "Vigilia": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "Especial": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Oración": "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
};

export default function Servicios() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Servicios 💒
            </h1>
            <p className="text-muted-foreground mt-1">
              Planifica la alabanza para cada culto
            </p>
          </div>
          <Button className="btn-gold">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Servicio
          </Button>
        </div>

        {/* Services List */}
        <div className="space-y-6">
          {mockServices.map((service, index) => (
            <div 
              key={service.id}
              className="card-elevated overflow-hidden slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="p-6 border-b border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl gold-gradient flex flex-col items-center justify-center text-primary-foreground">
                      <Church className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-serif font-semibold text-foreground">
                          Culto {service.type}
                        </h3>
                        <Badge className={typeColors[service.type]}>
                          {service.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(service.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {service.time} hrs
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalles
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Songs */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Music className="w-4 h-4 text-primary" />
                      Orden de Alabanza
                    </h4>
                    <div className="space-y-2">
                      {service.songs.map((song, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30"
                        >
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-foreground">{song}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      Equipo Asignado
                    </h4>
                    <div className="space-y-2">
                      {service.team.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{member.role}</span>
                          <span className="font-medium text-foreground">{member.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spiritual Focus */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      🕊️ Enfoque Espiritual
                    </h4>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
                      <p className="text-sm text-muted-foreground italic">
                        "{service.spiritualFocus}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
