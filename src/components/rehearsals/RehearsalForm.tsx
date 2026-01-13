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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-2xl border border-white/5">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" /> Fecha
                                </FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} className="input-warm" />
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
                                <FormLabel className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary" /> Hora
                                </FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} className="input-warm" />
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
                                <FormLabel className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" /> Lugar
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. Salón Principal" {...field} className="input-warm" />
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
                                <FormLabel>Tipo de Ensayo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="input-warm">
                                            <SelectValue placeholder="Selecciona un tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="Vocal">Vocal</SelectItem>
                                        <SelectItem value="Instrumental">Instrumental</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Song Selection */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
                            <Music className="w-5 h-5 text-primary" /> Plan de Alabanza
                        </h3>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => append({ song_id: "", leader_id: "", notes: "", order_position: fields.length })}
                            className="border-primary/30 text-primary hover:bg-primary/5"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Añadir Canción
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                        {index + 1}
                                    </span>
                                    <FormField
                                        control={form.control}
                                        name={`songs.${index}.song_id`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background/50">
                                                            <SelectValue placeholder="Selecciona una canción" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {songsData?.map((song) => (
                                                            <SelectItem key={song.id} value={song.id}>
                                                                {song.name} ({song.key})
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
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-9">
                                    <FormField
                                        control={form.control}
                                        name={`songs.${index}.leader_id`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background/50 h-8 text-xs">
                                                            <SelectValue placeholder="Líder de esta canción" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {membersData?.map((member) => (
                                                            <SelectItem key={member.id} value={member.id}>
                                                                {member.name}
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
                                                    placeholder="Notas (ej: solo acústico al inicio)"
                                                    {...field}
                                                    className="bg-background/50 h-8 text-xs"
                                                />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <p className="text-center py-6 text-sm text-muted-foreground italic border-2 border-dashed border-white/5 rounded-xl">
                                No has añadido canciones todavía. Click en "Añadir Canción" para comenzar.
                            </p>
                        )}
                    </div>
                </div>

                {/* Team Selection */}
                <div className="space-y-4">
                    <h3 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" /> Equipo Convocado
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white/5 p-4 rounded-xl border border-white/10">
                        {membersData?.map((member) => (
                            <div
                                key={member.id}
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${form.watch("members").includes(member.id)
                                        ? 'bg-primary/20 border border-primary/30'
                                        : 'hover:bg-white/5 border border-transparent'
                                    }`}
                                onClick={() => toggleMember(member.id)}
                            >
                                <Checkbox
                                    checked={form.watch("members").includes(member.id)}
                                // React hook form handle toggleMember manually to make UI feel snappier
                                />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-white truncate">{member.name}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Instrucciones Generales (Opcional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Mensaje para todo el equipo ministerial..."
                                    className="resize-none input-warm h-24"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full btn-gold py-6 h-auto text-lg shadow-xl shadow-primary/10"
                    disabled={createRehearsal.isPending}
                >
                    {createRehearsal.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Programando Ensayo...
                        </>
                    ) : (
                        "Programar y Notificar al Equipo"
                    )}
                </Button>
            </form>
        </Form>
    );
}
