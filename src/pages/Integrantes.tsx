import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Plus, 
  Mic2,
  Music,
  Phone,
  Mail,
  MoreVertical
} from "lucide-react";

interface Member {
  id: number;
  name: string;
  role: string;
  voice?: "Soprano" | "Alto" | "Tenor" | "Bajo";
  instrument?: string;
  phone?: string;
  email?: string;
  availability: string[];
  attendance: number;
  active: boolean;
}

const mockMembers: Member[] = [
  { 
    id: 1, 
    name: "Juan García", 
    role: "Director", 
    voice: "Tenor", 
    instrument: "Guitarra",
    phone: "+1 234 567 890",
    email: "juan@email.com",
    availability: ["Jueves", "Domingo"],
    attendance: 95,
    active: true
  },
  { 
    id: 2, 
    name: "María López", 
    role: "Vocal Líder", 
    voice: "Soprano",
    phone: "+1 234 567 891",
    email: "maria@email.com",
    availability: ["Jueves", "Sábado", "Domingo"],
    attendance: 90,
    active: true
  },
  { 
    id: 3, 
    name: "Pedro Martínez", 
    role: "Corista", 
    voice: "Bajo",
    instrument: "Bajo",
    availability: ["Jueves", "Domingo"],
    attendance: 75,
    active: true
  },
  { 
    id: 4, 
    name: "Ana Rodríguez", 
    role: "Vocal", 
    voice: "Alto",
    availability: ["Sábado", "Domingo"],
    attendance: 88,
    active: true
  },
  { 
    id: 5, 
    name: "Luis Hernández", 
    role: "Tecladista",
    instrument: "Teclado",
    availability: ["Jueves", "Domingo"],
    attendance: 92,
    active: true
  },
  { 
    id: 6, 
    name: "Carmen Díaz", 
    role: "Corista", 
    voice: "Soprano",
    availability: ["Domingo"],
    attendance: 70,
    active: false
  },
];

const voiceColors = {
  "Soprano": "bg-pink-500/10 text-pink-600 border-pink-500/20",
  "Alto": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "Tenor": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Bajo": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const getAttendanceColor = (attendance: number) => {
  if (attendance >= 90) return "text-emerald-600";
  if (attendance >= 75) return "text-amber-600";
  return "text-red-500";
};

export default function Integrantes() {
  const activeMembers = mockMembers.filter(m => m.active);
  const inactiveMembers = mockMembers.filter(m => !m.active);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Integrantes 👥
            </h1>
            <p className="text-muted-foreground mt-1">
              {activeMembers.length} miembros activos
            </p>
          </div>
          <Button className="btn-gold">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Integrante
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-elevated p-4 text-center">
            <p className="text-2xl font-serif font-bold text-foreground">{activeMembers.length}</p>
            <p className="text-sm text-muted-foreground">Activos</p>
          </div>
          <div className="card-elevated p-4 text-center">
            <p className="text-2xl font-serif font-bold text-foreground">
              {mockMembers.filter(m => m.voice).length}
            </p>
            <p className="text-sm text-muted-foreground">Voces</p>
          </div>
          <div className="card-elevated p-4 text-center">
            <p className="text-2xl font-serif font-bold text-foreground">
              {mockMembers.filter(m => m.instrument).length}
            </p>
            <p className="text-sm text-muted-foreground">Instrumentistas</p>
          </div>
          <div className="card-elevated p-4 text-center">
            <p className="text-2xl font-serif font-bold text-foreground">
              {Math.round(mockMembers.reduce((acc, m) => acc + m.attendance, 0) / mockMembers.length)}%
            </p>
            <p className="text-sm text-muted-foreground">Asistencia Prom.</p>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeMembers.map((member, index) => (
            <div 
              key={member.id}
              className="card-elevated p-5 slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-14 h-14 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground truncate">
                        {member.name}
                      </h3>
                      <p className="text-sm text-primary font-medium">{member.role}</p>
                    </div>
                    <button className="p-1 hover:bg-secondary rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {member.voice && (
                      <Badge className={voiceColors[member.voice]}>
                        <Mic2 className="w-3 h-3 mr-1" />
                        {member.voice}
                      </Badge>
                    )}
                    {member.instrument && (
                      <Badge variant="outline">
                        <Music className="w-3 h-3 mr-1" />
                        {member.instrument}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Asistencia</span>
                  <span className={`font-semibold ${getAttendanceColor(member.attendance)}`}>
                    {member.attendance}%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full gold-gradient rounded-full transition-all duration-500"
                    style={{ width: `${member.attendance}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
                {member.availability.map(day => (
                  <span key={day} className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">
                    {day}
                  </span>
                ))}
              </div>

              {(member.phone || member.email) && (
                <div className="flex gap-2 mt-4">
                  {member.phone && (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="w-3.5 h-3.5 mr-1" />
                      Llamar
                    </Button>
                  )}
                  {member.email && (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Mail className="w-3.5 h-3.5 mr-1" />
                      Email
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Inactive Members */}
        {inactiveMembers.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-serif font-semibold text-muted-foreground mb-4">
              Miembros Inactivos
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveMembers.map(member => (
                <div key={member.id} className="card-elevated p-5 opacity-60">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-secondary text-muted-foreground">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-foreground">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
