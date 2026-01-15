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
import { RehearsalForm } from "@/components/rehearsals/RehearsalForm";
import { useRehearsals, useUpdateAttendance, useDeleteRehearsal } from "@/hooks/useRehearsals";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Edit, Trash2, XCircle, Mic2, AlertCircle } from "lucide-react";
import type { Rehearsal, RehearsalSong, RehearsalAttendance } from "@/types/api";

// Los tipos ya están importados desde @/types/api, no necesitamos redefinirlos

const typeColors: Record<string, string> = {
  General: "bg-primary/10 text-primary border-primary/20",
  Vocal: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Instrumental: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

export default function Ensayos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRehearsal, setSelectedRehearsal] = useState<Rehearsal | null>(null);
  const [editingRehearsal, setEditingRehearsal] = useState<Rehearsal | null>(null);
  const { data: rehearsals, isLoading, error } = useRehearsals();
  const updateAttendance = useUpdateAttendance();
  const deleteRehearsal = useDeleteRehearsal();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el ensayo del ${name}?`)) return;
    try {
      await deleteRehearsal.mutateAsync(id);
      toast.success("Ensayo eliminado");
      setSelectedRehearsal(null);
    } catch (error) {
      toast.error("Error al eliminar el ensayo");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEEE d 'de' MMMM", { locale: es });
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'confirmed': return <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /></div>;
      case 'absent': return <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center"><XCircle className="w-3.5 h-3.5 text-red-500" /></div>;
      default: return <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center"><AlertCircle className="w-3.5 h-3.5 text-amber-500" /></div>;
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
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center p-12 bg-destructive/5 rounded-[2rem] border border-destructive/20">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive">Error de Conexión</h2>
            <p className="text-muted-foreground mt-2">No se pudieron cargar los ensayos. Por favor, intenta de nuevo.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-0 sm:px-4 space-y-8 pb-32 lg:pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 sm:px-0 fade-in">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 rounded-full bg-primary" />
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Ensayos
              </h1>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                {isLoading ? "Sincronizando..." : `Agenda Ministerial`}
              </p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold h-12 px-6 rounded-2xl shadow-xl shadow-primary/10 group">
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Programar Ensayo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-primary/20 bg-background shadow-2xl">
              <DialogHeader className="p-8 border-b border-border/50 bg-secondary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center shadow-lg">
                    <Mic2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-foreground">Planificar Ensayo</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-muted-foreground mt-1">Coordina recursos y equipo ministerial.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="p-8 pb-40">
                <RehearsalForm onSuccess={() => setIsDialogOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid lg:grid-cols-3 gap-8 px-4 sm:px-0">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 rounded-3xl bg-secondary/30 animate-pulse border border-border/50" />
              ))}
            </div>
            <div className="h-64 rounded-3xl bg-secondary/30 animate-pulse border border-border/50 hidden lg:block" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 px-4 sm:px-0">
            {/* Rehearsals List */}
            <div className="lg:col-span-2 space-y-4">
              {rehearsals?.length === 0 ? (
                <div className="text-center py-24 bg-secondary/10 rounded-[3rem] border border-dashed border-border/60">
                  <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-6">
                    <Mic2 className="w-12 h-12 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Calendario Vacío</h3>
                  <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Comienza programando un nuevo ensayo para tu ministerio.</p>
                  <Button
                    variant="outline"
                    className="mt-8 rounded-2xl h-12 px-8 border-primary/30 text-primary font-bold hover:bg-primary/5"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Programar Ahora
                  </Button>
                </div>
              ) : (
                rehearsals?.map((rehearsal, index) => (
                  <div
                    key={rehearsal.id}
                    onClick={() => setSelectedRehearsal(rehearsal)}
                    className={`group card-elevated p-6 cursor-pointer transition-all duration-300 slide-up ${selectedRehearsal?.id === rehearsal.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/30'
                      }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-background border border-border/50 flex flex-col items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                          <span className="text-[10px] font-black uppercase text-primary tracking-tighter">
                            {format(new Date(rehearsal.date), 'MMMM', { locale: es }).slice(0, 3)}
                          </span>
                          <span className="text-3xl font-black text-foreground">
                            {format(new Date(rehearsal.date), 'd')}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                            {format(new Date(rehearsal.date), 'EEE', { locale: es })}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`${typeColors[rehearsal.type] || typeColors.General} rounded-lg text-[10px] font-black uppercase tracking-widest px-2.5 py-1`}>
                              {rehearsal.type}
                            </Badge>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          </div>
                          <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
                            Ensayo {rehearsal.type}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-primary/60" />
                              {rehearsal.time}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-primary/60" />
                              <span className="truncate max-w-[120px] sm:max-w-none">{rehearsal.location}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-border/50">
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground overflow-hidden">
                              <Users className="w-3 h-3" />
                            </div>
                          ))}
                          <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[10px] font-black text-primary">
                            +{rehearsal.rehearsal_attendance?.length || 0}
                          </div>
                        </div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-secondary/50 px-2 py-1 rounded">
                          {rehearsal.rehearsal_songs?.length || 0} CANCIONES
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Detail Panel */}
            <div className="lg:sticky lg:top-8 self-start">
              {selectedRehearsal ? (
                <div className="glass-card p-0 overflow-hidden slide-up shadow-2xl border-primary/10">
                  <div className="p-8 space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
                          Detalles
                        </h2>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-primary hover:bg-primary/10" onClick={() => setEditingRehearsal(selectedRehearsal)}>
                                <Edit className="w-5 h-5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[2rem] p-0">
                              <DialogHeader className="p-8 border-b bg-secondary/20">
                                <DialogTitle className="text-2xl font-bold">Editar Ensayo</DialogTitle>
                              </DialogHeader>
                              <div className="p-8 pb-40">
                                <RehearsalForm
                                  rehearsal={editingRehearsal}
                                  onSuccess={() => setEditingRehearsal(null)}
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl h-10 w-10 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(selectedRehearsal.id, formatDate(selectedRehearsal.date))}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-muted-foreground" onClick={() => setSelectedRehearsal(null)}>
                            <XCircle className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-6 rounded-[2rem] bg-slate-900 text-white shadow-xl shadow-slate-900/10">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Programación</p>
                        <p className="text-lg font-bold capitalize">
                          {formatDate(selectedRehearsal.date)}
                        </p>
                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold">{selectedRehearsal.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold truncate">{selectedRehearsal.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Songs */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-6 rounded-full bg-primary" />
                          Repertorio ({selectedRehearsal.rehearsal_songs?.length || 0})
                        </h3>
                        <Music className="w-4 h-4 text-muted-foreground/40" />
                      </div>

                      {selectedRehearsal.rehearsal_songs && selectedRehearsal.rehearsal_songs.length > 0 ? (
                        <div className="space-y-3">
                          {selectedRehearsal.rehearsal_songs
                            .sort((a, b) => a.order_position - b.order_position)
                            .map((songData, idx) => (
                              <div key={idx} className="group/song flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-border/50 transition-all">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black text-muted-foreground/60 w-4 tracking-tighter">{idx + 1}</span>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-foreground text-sm uppercase tracking-tight">
                                      {songData.song?.name || 'Canción sin nombre'}
                                    </span>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">
                                      {songData.leader?.name || 'Varios'}
                                    </span>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-[10px] font-black bg-background border-none shadow-sm px-2">
                                  {songData.song?.key || 'C'}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-secondary/20 rounded-2xl border border-dashed border-border/50">
                          <Music className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Sin canciones asignadas</p>
                        </div>
                      )}
                    </div>

                    {/* Members */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-6 rounded-full bg-primary" />
                          Convocados ({selectedRehearsal.rehearsal_attendance?.length || 0})
                        </h3>
                        <Users className="w-4 h-4 text-muted-foreground/40" />
                      </div>

                      {selectedRehearsal.rehearsal_attendance && selectedRehearsal.rehearsal_attendance.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {selectedRehearsal.rehearsal_attendance.map((attendance, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl border border-border/30 bg-background/30">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black text-muted-foreground uppercase">
                                  {attendance.member?.name?.slice(0, 2) || '?'}
                                </div>
                                <span className="text-sm font-bold text-foreground tracking-tight">
                                  {attendance.member?.name || 'Invitado'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(attendance.status)}
                                <span className={`text-[9px] font-black uppercase tracking-widest ${attendance.status === 'confirmed' ? 'text-emerald-500' :
                                  attendance.status === 'absent' ? 'text-red-500' :
                                    'text-amber-500'
                                  }`}>
                                  {getStatusText(attendance.status)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground font-medium italic text-center py-4 underline decoration-primary/20">No hay equipo convocado aún</p>
                      )}
                    </div>

                    {/* Notes */}
                    {selectedRehearsal.notes && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Notas del Director</h3>
                        </div>
                        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Mic2 className="w-12 h-12" />
                          </div>
                          <p className="text-sm text-foreground/80 font-medium leading-relaxed relative z-10 italic">
                            "{selectedRehearsal.notes}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t border-border/50">
                      <Button className="w-full btn-premium h-14 text-base font-bold shadow-xl shadow-primary/20">
                        Gestionar Asistencia
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 text-center border-dashed border-2 flex flex-col items-center justify-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center shadow-inner">
                    <AlertCircle className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Vista de Detalles</p>
                    <p className="text-xs text-muted-foreground font-medium max-w-[200px] leading-relaxed">
                      Selecciona un ensayo de la lista para ver el plan detallado y el equipo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
