import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import {
  Plus,
  Church,
  Music,
  Users,
  Calendar,
  Clock,
  ChevronRight,
  Loader2,
  Trash2,
  Edit,
  MapPin
} from "lucide-react";
import { useState } from "react";
import { useServices, useDeleteService } from "@/hooks/useServices";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { toast } from "sonner";

const typeColors = {
  "Domingo Mañana": "bg-primary/10 text-primary border-primary/20",
  "Domingo Noche": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "Miércoles": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Especial": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Evento": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
};

export default function Servicios() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const { data: services, isLoading } = useServices();
  const deleteService = useDeleteService();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el servicio "${name}"?`)) return;
    try {
      await deleteService.mutateAsync(id);
      toast.success("Servicio eliminado");
    } catch (error) {
      toast.error("Error al eliminar el servicio");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-0 sm:px-4 space-y-8 pb-32 lg:pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 sm:px-0 fade-in">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 rounded-full bg-primary" />
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Planificación
              </h1>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                {isLoading ? "Sincronizando..." : `${(services as any[])?.length || 0} Cultos Programados`}
              </p>
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold h-12 px-6 rounded-2xl shadow-xl shadow-primary/10 group">
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Nuevo Servicio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-primary/20 bg-background shadow-2xl">
              <DialogHeader className="p-8 border-b border-border/50 bg-secondary/20">
                <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Church className="w-6 h-6 text-primary" /> Programar Servicio
                </DialogTitle>
                <DialogDescription>Define el enfoque espiritual, el plan de alabanza y el equipo ministerial.</DialogDescription>
              </DialogHeader>
              <div className="p-8 pb-40">
                <ServiceForm
                  onSuccess={() => setIsCreateDialogOpen(false)}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 px-4 sm:px-0">
            {[1, 2].map(i => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-secondary/30 animate-pulse border border-border/50" />
            ))}
          </div>
        )}

        {/* Services List */}
        {!isLoading && services && (
          <div className="space-y-8 px-4 sm:px-0">
            {(services as any[]).map((service: any, index: number) => (
              <div
                key={service.id}
                className="group card-premium p-0 overflow-hidden slide-up border-primary/5 hover:border-primary/20 transition-all duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Service Card Header */}
                <div className="p-6 sm:p-8 bg-secondary/10 border-b border-border/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 rounded-[2rem] gold-gradient flex flex-col items-center justify-center text-white shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform duration-500">
                        <Church className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase mt-1">CULTO</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tighter">
                            {service.name}
                          </h3>
                          <Badge className={`rounded-lg text-[10px] font-black uppercase tracking-widest px-3 py-1 border-none ${(typeColors as any)[service.type as keyof typeof typeColors] || ''}`}>
                            {service.type}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <Calendar className="w-4 h-4 text-primary" />
                            {formatDate(service.date)}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <Clock className="w-4 h-4 text-primary" />
                            {service.time} HRS
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <MapPin className="w-4 h-4 text-primary" />
                            {service.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-12 px-6 rounded-2xl bg-background border-border/50 font-bold text-xs uppercase tracking-widest hover:bg-secondary whitespace-nowrap shadow-sm"
                            onClick={() => setEditingService(service)}
                          >
                            <Edit className="w-4 h-4 mr-2 text-primary" />
                            Editar Plan
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-primary/20">
                          <DialogHeader className="p-8 border-b bg-secondary/20">
                            <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tight">Personalizar Servicio</DialogTitle>
                            <DialogDescription>Modificando: {service.name}</DialogDescription>
                          </DialogHeader>
                          <div className="p-8 pb-40">
                            <ServiceForm
                              service={editingService}
                              onSuccess={() => setEditingService(null)}
                              onCancel={() => setEditingService(null)}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-12 w-12 rounded-2xl shadow-lg shadow-destructive/10"
                        disabled={deleteService.isPending}
                        onClick={() => handleDelete(service.id, service.name)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Service Card Content */}
                <div className="p-6 sm:p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {/* Songs Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                        <div className="w-1.5 h-6 rounded-full bg-primary" />
                        <h4 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Pauta Musical</h4>
                      </div>
                      <div className="space-y-3">
                        {service.service_songs && service.service_songs.length > 0 ? (
                          service.service_songs.sort((a: any, b: any) => a.order_position - b.order_position).map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="group/song flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-border/50 transition-all cursor-default"
                            >
                              <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-xl bg-background border border-border/50 flex items-center justify-center text-[10px] font-black text-primary shadow-sm group-hover/song:scale-110 transition-transform">
                                  {idx + 1}
                                </span>
                                <div>
                                  <p className="text-sm font-black text-foreground uppercase tracking-tight leading-tight">{item.song.name}</p>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{item.song.type} • TONO: {item.song.key}</p>
                                </div>
                              </div>
                              <Music className="w-4 h-4 text-muted-foreground/30 group-hover/song:text-primary transition-colors" />
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 rounded-2xl border-2 border-dashed border-border/30 bg-secondary/10">
                            <Music className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sin canciones aún</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Team Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                        <div className="w-1.5 h-6 rounded-full bg-primary" />
                        <h4 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Equipo Convocado</h4>
                      </div>
                      <div className="space-y-3">
                        {service.service_assignments && service.service_assignments.length > 0 ? (
                          service.service_assignments.map((assignment: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all cursor-default group/member">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black text-muted-foreground group-hover/member:bg-primary group-hover/member:text-white transition-colors">
                                  {assignment.member.name.slice(0, 1)}
                                </div>
                                <span className="text-xs font-black text-foreground uppercase tracking-tight">{assignment.member.name}</span>
                              </div>
                              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest h-6 rounded-lg bg-background border-border/40 text-primary">
                                {assignment.role}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 rounded-2xl border-2 border-dashed border-border/30 bg-secondary/10">
                            <Users className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sin asignaciones aún</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Spiritual Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                        <div className="w-1.5 h-6 rounded-full bg-primary" />
                        <h4 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Enfoque Espiritual</h4>
                      </div>
                      <div className="p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-xl relative overflow-hidden group/spirit">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                          <Church className="w-20 h-20" />
                        </div>

                        {service.theme ? (
                          <div className="relative z-10 space-y-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Tema Central</p>
                              <p className="text-xl font-black uppercase leading-tight">{service.theme}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Observaciones</p>
                              <p className="text-xs font-medium text-white/70 italic leading-relaxed">
                                {service.notes || "No hay notas adicionales para este servicio."}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 relative z-10">
                            <p className="text-xs font-medium text-white/50 italic leading-relaxed">
                              Configura el tema ministerial para este servicio.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!services || (services as any[]).length === 0) && (
          <div className="text-center py-24 px-4 bg-secondary/10 rounded-[3rem] border border-dashed border-border/60 max-w-2xl mx-auto">
            <div className="w-24 h-24 rounded-[2rem] bg-secondary/50 flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Church className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Ministerio Activo</h3>
            <p className="text-muted-foreground mt-2 font-medium">
              Aún no has programado servicios. La planificación es la clave para la excelencia.
            </p>
            <Button
              className="mt-10 btn-gold h-14 px-10 rounded-2xl text-base shadow-2xl shadow-primary/20"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Planificar Primer Culto
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
