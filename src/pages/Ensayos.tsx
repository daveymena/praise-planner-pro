import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Clock, 
  MapPin, 
  Music,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useState } from "react";

interface Rehearsal {
  id: number;
  date: string;
  time: string;
  place: string;
  type: "General" | "Vocal" | "Instrumental";
  songs: { name: string; key: string; leader: string }[];
  members: { name: string; status: "confirmed" | "pending" | "absent" }[];
  notes: string;
}

const mockRehearsals: Rehearsal[] = [
  {
    id: 1,
    date: "2025-01-18",
    time: "19:30",
    place: "Templo Principal",
    type: "General",
    songs: [
      { name: "Cristo Vive", key: "D", leader: "Juan" },
      { name: "Digno es el Señor", key: "G", leader: "María" },
      { name: "Santo Espíritu", key: "F", leader: "Ana" },
    ],
    members: [
      { name: "Juan", status: "confirmed" },
      { name: "María", status: "confirmed" },
      { name: "Pedro", status: "absent" },
      { name: "Ana", status: "pending" },
    ],
    notes: "Revisar entrada del coro en el puente. Ministrar con calma."
  },
  {
    id: 2,
    date: "2025-01-20",
    time: "16:00",
    place: "Sala de Ensayo",
    type: "Vocal",
    songs: [
      { name: "Gracia Sublime", key: "C", leader: "María" },
      { name: "Tu Gracia", key: "E", leader: "Ana" },
    ],
    members: [
      { name: "María", status: "confirmed" },
      { name: "Ana", status: "confirmed" },
      { name: "Luis", status: "pending" },
    ],
    notes: "Trabajar armonías de voces."
  },
];

const typeColors = {
  General: "bg-primary/10 text-primary border-primary/20",
  Vocal: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Instrumental: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

export default function Ensayos() {
  const [selectedRehearsal, setSelectedRehearsal] = useState<Rehearsal | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'absent': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Ensayos 🎤
            </h1>
            <p className="text-muted-foreground mt-1">
              Planifica y organiza los ensayos del ministerio
            </p>
          </div>
          <Button className="btn-gold">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Ensayo
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Rehearsals List */}
          <div className="lg:col-span-2 space-y-4">
            {mockRehearsals.map((rehearsal, index) => (
              <div 
                key={rehearsal.id}
                onClick={() => setSelectedRehearsal(rehearsal)}
                className={`card-elevated p-6 cursor-pointer transition-all slide-up ${
                  selectedRehearsal?.id === rehearsal.id ? 'ring-2 ring-primary' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl gold-gradient flex flex-col items-center justify-center text-primary-foreground">
                      <span className="text-xs font-medium uppercase">
                        {new Date(rehearsal.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                      </span>
                      <span className="text-lg font-bold">
                        {new Date(rehearsal.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Ensayo {rehearsal.type}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
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
                  </div>
                  <Badge className={typeColors[rehearsal.type]}>
                    {rehearsal.type}
                  </Badge>
                </div>

                {/* Quick Info */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Music className="w-4 h-4" />
                    {rehearsal.songs.length} canciones
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {rehearsal.members.filter(m => m.status === 'confirmed').length}/{rehearsal.members.length} confirmados
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          <div className="lg:sticky lg:top-8">
            {selectedRehearsal ? (
              <div className="card-elevated p-6 slide-up">
                <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
                  Detalles del Ensayo
                </h2>

                <div className="space-y-6">
                  {/* Info */}
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(selectedRehearsal.date)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedRehearsal.time} • {selectedRehearsal.place}
                    </p>
                  </div>

                  {/* Songs */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Music className="w-4 h-4 text-primary" />
                      Canciones
                    </h3>
                    <div className="space-y-2">
                      {selectedRehearsal.songs.map((song, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                          <span className="text-sm text-foreground">{song.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {song.key}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{song.leader}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Members */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      Asistencia
                    </h3>
                    <div className="space-y-2">
                      {selectedRehearsal.members.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2">
                          <span className="text-sm text-foreground">{member.name}</span>
                          {getStatusIcon(member.status)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Notas del Director
                    </h3>
                    <p className="text-sm text-muted-foreground italic p-3 bg-primary/5 rounded-lg border border-primary/10">
                      "{selectedRehearsal.notes}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button className="flex-1 btn-gold">
                      Confirmar Asistencia
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-elevated p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
                  <Music className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Selecciona un ensayo para ver los detalles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
