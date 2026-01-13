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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Planificación 💒
            </h1>
            <p className="text-muted-foreground mt-1">
              {isLoading ? "Cargando servicios..." : `${services?.length || 0} cultos programados`}
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Servicio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Programar Nuevo Servicio</DialogTitle>
                <DialogDescription>Completa los detalles del culto, canciones y equipo.</DialogDescription>
              </DialogHeader>
              <ServiceForm
                onSuccess={() => setIsCreateDialogOpen(false)}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        )}

        {/* Services List */}
        {!isLoading && services && (
          <div className="space-y-6">
            {services.map((service: any, index: number) => (
              <div
                key={service.id}
                className="card-elevated overflow-hidden slide-up group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div className="p-6 border-b border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl gold-gradient flex flex-col items-center justify-center text-primary-foreground shadow-lg">
                        <Church className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-serif font-semibold text-foreground">
                            {service.name}
                          </h3>
                          <Badge className={typeColors[service.type as keyof typeof typeColors] || ''}>
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
                          <span className="hidden sm:flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {service.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingService(service)}
                            className="bg-background/50 backdrop-blur-sm"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Editar Planificación</DialogTitle>
                            <DialogDescription>Modifica los detalles del servicio.</DialogDescription>
                          </DialogHeader>
                          <ServiceForm
                            service={editingService}
                            onSuccess={() => setEditingService(null)}
                            onCancel={() => setEditingService(null)}
                          />
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="icon"
                        disabled={deleteService.isPending}
                        onClick={() => handleDelete(service.id, service.name)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-8">
                    {/* Songs */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Music className="w-4 h-4 text-primary" />
                        Plan de Alabanza
                      </h4>
                      <div className="space-y-2">
                        {service.service_songs && service.service_songs.length > 0 ? (
                          service.service_songs.sort((a: any, b: any) => a.order_position - b.order_position).map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-secondary/20"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                  {idx + 1}
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{item.song.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{item.song.type} • {item.song.key}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No hay canciones asignadas</p>
                        )}
                      </div>
                    </div>

                    {/* Team */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Equipo Ministerial
                      </h4>
                      <div className="space-y-2">
                        {service.service_assignments && service.service_assignments.length > 0 ? (
                          service.service_assignments.map((assignment: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                              <span className="text-xs font-medium text-foreground">{assignment.member.name}</span>
                              <Badge variant="outline" className="text-[10px] py-0 h-5">
                                {assignment.role}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No hay integrantes asignados</p>
                        )}
                      </div>
                    </div>

                    {/* Spiritual Focus / Notes */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground">
                        🕊️ Enfoque y Notas
                      </h4>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 min-h-[100px]">
                        {service.theme && (
                          <p className="text-sm font-medium text-primary mb-2">Tema: {service.theme}</p>
                        )}
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {service.notes || "No hay notas adicionales para este servicio."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!services || services.length === 0) && (
          <div className="text-center py-20 card-elevated">
            <Church className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground">No hay servicios programados</h3>
            <p className="text-muted-foreground mb-6">Empieza a planificar tu próximo culto</p>
            <Button className="btn-gold" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Programar Primer Servicio
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
