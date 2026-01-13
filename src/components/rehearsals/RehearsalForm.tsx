import { useForm } from "react-hook-form";
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
import { useCreateRehearsal } from "@/hooks/useRehearsals";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Schema validation
const formSchema = z.object({
    date: z.string().min(1, "La fecha es requerida"),
    time: z.string().min(1, "La hora es requerida"),
    location: z.string().min(1, "El lugar es requerido"),
    type: z.enum(["General", "Vocal", "Instrumental"], {
        required_error: "Selecciona un tipo de ensayo",
    }),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RehearsalFormProps {
    onSuccess?: () => void;
}

export function RehearsalForm({ onSuccess }: RehearsalFormProps) {
    const createRehearsal = useCreateRehearsal();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            time: "19:00",
            location: "Salón Principal",
            type: "General",
            notes: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        try {
            await createRehearsal.mutateAsync({
                ...values,
                created_by: null, // Will be set by backend based on authenticated user
            });
            toast.success("Ensayo programado exitosamente");
            form.reset();
            onSuccess?.();
        } catch (error) {
            toast.error("Error al programar el ensayo");
            console.error(error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
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
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Lugar</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Salón Principal" {...field} />
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
                                    <SelectTrigger>
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

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notas (Opcional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Instrucciones especiales para el equipo..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full btn-gold"
                    disabled={createRehearsal.isPending}
                >
                    {createRehearsal.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Programando...
                        </>
                    ) : (
                        "Programar Ensayo"
                    )}
                </Button>
            </form>
        </Form>
    );
}
