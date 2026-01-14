import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateRehearsal } from "@/hooks/useRehearsals";
import { useSongs } from "@/hooks/useSongs";
import { useMembers } from "@/hooks/useMembers";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Music, Users, Calendar, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Schema validation
const formSchema = z.object({
    date: z.string().min(1, "La fecha es requerida"),
    time: z.string().min(1, "La hora es requerida"),
    location: z.string().min(1, "El lugar es requerido"),
    type: z.enum(["General", "Vocal", "Instrumental"], {
        required_error: "Selecciona un tipo de ensayo",
    }),
    notes: z.string().optional(),
    songs: z.array(z.object({
        song_id: z.string().min(1, "Selecciona una canción"),
        leader_id: z.string().optional(),
        notes: z.string().optional(),
        order_position: z.number().default(0),
    })).default([]),
    members: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface RehearsalFormProps {
    onSuccess?: () => void;
}

export function RehearsalForm({ onSuccess }: RehearsalFormProps) {
    const createRehearsal = useCreateRehearsal();
    const { data: songsData } = useSongs();
    const { data: membersData } = useMembers();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            time: "19:00",
            location: "Salón Principal",
            type: "General",
            notes: "",
            songs: [],
            members: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "songs",
    });

    const onSubmit = async (values: FormValues) => {
        try {
            await createRehearsal.mutateAsync(values);
            toast.success("Ensayo programado exitosamente");
            form.reset();
            onSuccess?.();
        } catch (error) {
            toast.error("Error al programar el ensayo");
            console.error(error);
        }
    };

    const toggleMember = (memberId: string) => {
        const currentMembers = form.getValues("members");
        if (currentMembers.includes(memberId)) {
            form.setValue("members", currentMembers.filter(id => id !== memberId));
        } else {
            form.setValue("members", [...currentMembers, memberId]);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                {/* Basic Info Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Detalles Básicos</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary/20 p-6 rounded-[2rem] border border-border/50">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-1">Fecha del Ensayo</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input type="date" {...field} className="h-12 pl-11 bg-background border-border/50 rounded-xl focus:ring-primary/20 transition-all font-medium" />
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
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-1">Hora de Inicio</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input type="time" {...field} className="h-12 pl-11 bg-background border-border/50 rounded-xl focus:ring-primary/20 transition-all font-medium" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-1">Ubicación / Lugar</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input placeholder="Ej. Salón Principal" {...field} className="h-12 pl-11 bg-background border-border/50 rounded-xl focus:ring-primary/20 transition-all font-medium" />
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
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-1">Tipo de Sesión</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 bg-background border-border/50 rounded-xl focus:ring-primary/20 font-medium">
                                                <SelectValue placeholder="Selecciona tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl border-border/50">
                                            <SelectItem value="General">General (Todo el equipo)</SelectItem>
                                            <SelectItem value="Vocal">Vocal (Solo voces)</SelectItem>
                                            <SelectItem value="Instrumental">Instrumental (Solo músicos)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Song Selection Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Music className="w-5 h-5 text-primary" />
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Plan de Alabanza</h3>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => append({ song_id: "", leader_id: "", notes: "", order_position: fields.length })}
                            className="rounded-full border-primary/30 text-primary font-bold hover:bg-primary/5 uppercase text-[10px] tracking-widest px-4"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Añadir Canción
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="group relative flex flex-col gap-4 p-6 bg-secondary/10 rounded-[2rem] border border-border/40 hover:border-primary/30 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
                                <div className="absolute -left-3 top-6 w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center text-xs font-black shadow-lg shadow-primary/20 z-10">
                                    {index + 1}
                                </div>

                                <div className="flex items-center gap-4 ml-4">
                                    <FormField
                                        control={form.control}
                                        name={`songs.${index}.song_id`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 bg-background border-border/50 rounded-xl shadow-sm font-bold uppercase tracking-tight text-sm">
                                                            <SelectValue placeholder="Buscar canción en el repertorio..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl">
                                                        {songsData?.map((song) => (
                                                            <SelectItem key={song.id} value={song.id} className="py-3">
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold">{song.name}</span>
                                                                    <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest">{song.type} • Tono: {song.key}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        className="h-12 w-12 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                                    <FormField
                                        control={form.control}
                                        name={`songs.${index}.leader_id`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 bg-background/50 border-border/30 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                            <SelectValue placeholder="Asignar Líder" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-lg">
                                                        {membersData?.map((member) => (
                                                            <SelectItem key={member.id} value={member.id}>
                                                                {member.name} ({member.role})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`songs.${index}.notes`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <Input
                                                    placeholder="Observaciones específicas..."
                                                    {...field}
                                                    className="h-10 bg-background/50 border-border/30 rounded-lg text-xs"
                                                />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <div className="text-center py-12 rounded-[2.5rem] border-2 border-dashed border-border/40 bg-secondary/5">
                                <Music className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">El plan está vacío</p>
                                <p className="text-xs text-muted-foreground mt-1 px-8">Añade canciones para estructurar la sesión de hoy.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Team Selection Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Convocatoria de Equipo</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-secondary/10 p-6 rounded-[2rem] border border-border/40">
                        {membersData?.map((member) => {
                            const isSelected = form.watch("members").includes(member.id);
                            return (
                                <div
                                    key={member.id}
                                    className={`relative flex flex-col p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden ${isSelected
                                        ? 'bg-primary/10 border-primary/50 shadow-lg shadow-primary/5'
                                        : 'bg-background/50 border-transparent hover:border-border/60'
                                        }`}
                                    onClick={() => toggleMember(member.id)}
                                >
                                    {isSelected && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />}
                                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-3">
                                        <span className="text-xs font-black uppercase text-muted-foreground">{member.name.slice(0, 2)}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-foreground truncate uppercase tracking-tight">{member.name}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground truncate uppercase opacity-60 mt-0.5">{member.role}</p>
                                    </div>
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
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-1">Mensaje para el Equipo</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Instrucciones adicionales, enfoque espiritual o notas técnicas..."
                                    className="resize-none h-32 bg-secondary/10 border-border/40 rounded-2xl focus:ring-primary/20 p-4 font-medium"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full btn-premium py-8 h-auto text-xl font-black shadow-2xl shadow-primary/20 uppercase tracking-[0.1em]"
                    disabled={createRehearsal.isPending}
                >
                    {createRehearsal.isPending ? (
                        <>
                            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                            PROCESANDO...
                        </>
                    ) : (
                        "PROGRAMAR Y NOTIFICAR"
                    )}
                </Button>
            </form>
        </Form>
    );
}

