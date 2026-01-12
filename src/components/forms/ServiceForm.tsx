import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useCreateService, useUpdateService } from "@/hooks/useServices";
import { useSongs } from "@/hooks/useSongs";
import { useMembers } from "@/hooks/useMembers";
import { toast } from "sonner";
import {
    Calendar,
    Clock,
    MapPin,
    Music,
    Users,
    Plus,
    X,
    GripVertical,
    Church,
    Sparkles
} from "lucide-react";

const serviceSchema = z.object({
    name: z.string().min(1, "El nombre/tema es requerido"),
    date: z.string().min(1, "La fecha es requerida"),
    time: z.string().min(1, "La hora es requerida"),
    type: z.enum(["Domingo Mañana", "Domingo Noche", "Miércoles", "Especial", "Evento"]),
    location: z.string().min(1, "La ubicación es requerida"),
    theme: z.string().optional(),
    notes: z.string().optional(),
    songs: z.array(z.string()).default([]), // IDs de canciones
    team: z.array(z.object({
        member_id: z.string(),
        role: z.string()
    })).default([]),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
    service?: any;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ServiceForm({ service, onSuccess, onCancel }: ServiceFormProps) {
    const createService = useCreateService();
    const updateService = useUpdateService();
    const { data: songsData } = useSongs();
    const { data: membersData } = useMembers();

    const [selectedSongId, setSelectedSongId] = useState("");
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    const form = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: service?.name || "",
            date: service?.date ? new Date(service.date).toISOString().split('T')[0] : "",
            time: service?.time || "",
            type: service?.type || "Domingo Mañana",
            location: service?.location || "Templo Principal",
            theme: service?.theme || "",
            notes: service?.notes || "",
            songs: service?.service_songs?.map((s: any) => s.id) || [],
            team: service?.service_assignments?.map((a: any) => ({
                member_id: a.member_id,
                role: a.role
            })) || [],
        },
    });

    const onSubmit = async (data: ServiceFormData) => {
        try {
            if (service) {
                await updateService.mutateAsync({ id: service.id, ...data });
                toast.success("Servicio actualizado exitosamente");
            } else {
                await createService.mutateAsync(data);
                toast.success("Servicio programado exitosamente");
            }
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || "Error al procesar la solicitud");
        }
    };

    const addSong = () => {
        if (!selectedSongId) return;
        const currentSongs = form.getValues("songs");
        if (!currentSongs.includes(selectedSongId)) {
            form.setValue("songs", [...currentSongs, selectedSongId]);
        }
        setSelectedSongId("");
    };

    const removeSong = (id: string) => {
        const currentSongs = form.getValues("songs");
        form.setValue("songs", currentSongs.filter(sId => sId !== id));
    };

    const addTeamMember = () => {
        if (!selectedMemberId || !selectedRole) return;
        const currentTeam = form.getValues("team");
        form.setValue("team", [...currentTeam, { member_id: selectedMemberId, role: selectedRole }]);
        setSelectedMemberId("");
        setSelectedRole("");
    };

    const removeTeamMember = (index: number) => {
        const currentTeam = form.getValues("team");
        form.setValue("team", currentTeam.filter((_, i) => i !== index));
    };

    const roles = ["Director", "Voz Principal", "Coros", "Piano", "Guitarra", "Bajo", "Batería", "Sonido", "Multimedia"];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Título / Tema del Culto</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                        <Input placeholder="Ej: Especial de Acción de Gracias" {...field} className="pl-10" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input type="date" {...field} className="pl-10" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hora</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input type="time" {...field} className="pl-10" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Servicio</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Domingo Mañana">Domingo Mañana</SelectItem>
                                        <SelectItem value="Domingo Noche">Domingo Noche</SelectItem>
                                        <SelectItem value="Miércoles">Miércoles</SelectItem>
                                        <SelectItem value="Especial">Especial</SelectItem>
                                        <SelectItem value="Evento">Evento</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ubicación</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input placeholder="Templo Principal" {...field} className="pl-10" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Songs Selection */}
                <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-muted">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Music className="w-5 h-5 text-primary" />
                        Plan de Alabanza
                    </h3>
                    <div className="flex gap-2">
                        <Select value={selectedSongId} onValueChange={setSelectedSongId}>
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Selecciona una canción del repertorio" />
                            </SelectTrigger>
                            <SelectContent>
                                {songsData?.map((song) => (
                                    <SelectItem key={song.id} value={song.id}>
                                        {song.name} ({song.key})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="button" onClick={addSong} disabled={!selectedSongId}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {form.watch("songs").map((songId, index) => {
                            const song = songsData?.find(s => s.id === songId);
                            return (
                                <div key={songId} className="flex items-center gap-3 p-2 bg-background rounded-lg border border-border group">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{song?.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{song?.type} • Tono: {song?.key}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeSong(songId)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Team Selection */}
                <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-muted">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Equipo Asignado
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Integrante" />
                            </SelectTrigger>
                            <SelectContent>
                                {membersData?.filter(m => m.is_active).map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        {member.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Función" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="button" onClick={addTeamMember} disabled={!selectedMemberId || !selectedRole}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {form.watch("team").map((assignment, index) => {
                            const member = membersData?.find(m => m.id === assignment.member_id);
                            return (
                                <div key={index} className="flex items-center justify-between p-2 bg-background rounded-lg border border-border">
                                    <div className="text-sm">
                                        <span className="font-medium">{member?.name}</span>
                                        <span className="text-muted-foreground mx-2">•</span>
                                        <span className="text-xs">{assignment.role}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeTeamMember(index)}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Instrucciones / Notas Generales</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Ej: Vestimenta formal, ensayo previo a las 8am..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-4 border-t">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                    <Button type="submit" className="btn-gold px-8" disabled={createService.isPending || updateService.isPending}>
                        {service ? "Actualizar Plan" : "Programar Servicio"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
