import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import {
  Plus,
  Clock,
  MapPin,
  Music,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Mic2
} from "lucide-react";
import { useState } from "react";
import { useRehearsals, useUpdateAttendance } from "@/hooks/useRehearsals";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import type { Rehearsal, RehearsalSong, RehearsalAttendance } from "@/types/api";

// Los tipos ya están importados desde @/types/api, no necesitamos redefinirlos

const typeColors = {
  General: "bg-primary/10 text-primary border-primary/20",
  Vocal: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Instrumental: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

export default function Ensayos() {
  const [selectedRehearsal, setSelectedRehearsal] = useState<Rehearsal | null>(null);
  const { data: rehearsals, isLoading, error } = useRehearsals();
  const updateAttendance = useUpdateAttendance();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEEE d 'de' MMMM", { locale: es });
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'absent': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'absent': return 'Ausente';
      default: return 'Pendiente';
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-500">Error al cargar los ensayos</p>
          </div>
        </div>
      </Layout>
    );
  }

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
              {isLoading ? "Cargando..." : `Planifica y organiza los ensayos del ministerio`}
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-gold">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Ensayo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Ensayo</DialogTitle>
                <DialogDescription>Programe un nuevo ensayo para el ministerio.</DialogDescription>
              </DialogHeader>
              <p className="text-muted-foreground">Formulario de ensayo próximamente...</p>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Content */}
        {!isLoading && rehearsals && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Rehearsals List */}
            <div className="lg:col-span-2 space-y-4">
              {rehearsals.length === 0 ? (
                <div className="text-center py-12 card-elevated">
                  <Mic2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No hay ensayos programados</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="btn-gold">
                        <Plus className="w-4 h-4 mr-2" />
                        Programar Primer Ensayo
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nuevo Ensayo</DialogTitle>
                        <DialogDescription>Programe el primer ensayo para comenzar.</DialogDescription>
                      </DialogHeader>
                      <p className="text-muted-foreground">Formulario de ensayo próximamente...</p>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                rehearsals.map((rehearsal, index) => (
                  <div
                    key={rehearsal.id}
                    onClick={() => setSelectedRehearsal(rehearsal)}
                    className={`card-elevated p-6 cursor-pointer transition-all slide-up ${selectedRehearsal?.id === rehearsal.id ? 'ring-2 ring-primary' : ''
                      }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl gold-gradient flex flex-col items-center justify-center text-primary-foreground">
                          <span className="text-xs font-medium uppercase">
                            {format(new Date(rehearsal.date), 'EEE', { locale: es })}
                          </span>
                          <span className="text-lg font-bold">
                            {format(new Date(rehearsal.date), 'd')}
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
                              {rehearsal.location}
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
                        {rehearsal.rehearsal_songs?.length || 0} canciones
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {rehearsal.rehearsal_attendance?.filter(a => a.status === 'confirmed').length || 0}/{rehearsal.rehearsal_attendance?.length || 0} confirmados
                      </span>
                    </div>
                  </div>
                ))
              )}
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
                        {selectedRehearsal.time} • {selectedRehearsal.location}
                      </p>
                    </div>

                    {/* Songs */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Music className="w-4 h-4 text-primary" />
                        Canciones ({selectedRehearsal.rehearsal_songs?.length || 0})
                      </h3>
                      {selectedRehearsal.rehearsal_songs && selectedRehearsal.rehearsal_songs.length > 0 ? (
                        <div className="space-y-2">
                          {selectedRehearsal.rehearsal_songs
                            .sort((a, b) => a.order_position - b.order_position)
                            .map((songData, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                <span className="text-sm text-foreground">
                                  {songData.songs?.name || 'Canción sin nombre'}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {songData.songs?.key || 'N/A'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {songData.leader?.name || 'Sin líder'}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No hay canciones asignadas</p>
                      )}
                    </div>

                    {/* Members */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Asistencia ({selectedRehearsal.rehearsal_attendance?.length || 0})
                      </h3>
                      {selectedRehearsal.rehearsal_attendance && selectedRehearsal.rehearsal_attendance.length > 0 ? (
                        <div className="space-y-2">
                          {selectedRehearsal.rehearsal_attendance.map((attendance, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2">
                              <span className="text-sm text-foreground">
                                {attendance.member?.name || 'Miembro desconocido'}
                              </span>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(attendance.status)}
                                <span className="text-xs text-muted-foreground">
                                  {getStatusText(attendance.status)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No hay asistencia registrada</p>
                      )}
                    </div>

                    {/* Notes */}
                    {selectedRehearsal.notes && (
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          Notas del Director
                        </h3>
                        <p className="text-sm text-muted-foreground italic p-3 bg-primary/5 rounded-lg border border-primary/10">
                          "{selectedRehearsal.notes}"
                        </p>
                      </div>
                    )}

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
        )}
      </div>
    </Layout>
  );
}
