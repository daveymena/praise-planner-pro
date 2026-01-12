import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useCreateMember, useUpdateMember } from "@/hooks/useMembers";
import { toast } from "sonner";
import { Users, Mail, Phone, Music, Mic, Plus, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Member = Database['public']['Tables']['members']['Row'];

const memberSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    role: z.enum(["Director", "Vocalista", "Instrumentista", "Técnico", "Coordinador"]),
    instruments: z.array(z.string()).default([]),
    voice_type: z.string().optional().or(z.literal("")),
    notes: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
    member?: Member | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function MemberForm({ member, onSuccess, onCancel }: MemberFormProps) {
    const [newInstrument, setNewInstrument] = useState("");
    const createMember = useCreateMember();
    const updateMember = useUpdateMember();

    const form = useForm<MemberFormData>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            name: member?.name || "",
            email: member?.email || "",
            phone: member?.phone || "",
            role: (member?.role as any) || "Instrumentista",
            instruments: member?.instruments || [],
            voice_type: member?.voice_type || "",
            notes: member?.notes || "",
        },
    });

    const onSubmit = async (data: MemberFormData) => {
        try {
            if (member) {
                await updateMember.mutateAsync({ id: member.id, ...data });
                toast.success("Integrante actualizado exitosamente");
            } else {
                await createMember.mutateAsync(data);
                toast.success("Integrante creado exitosamente");
            }
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || "Error al procesar la solicitud");
        }
    };

    const addInstrument = () => {
        if (!newInstrument.trim()) return;
        const currentInstruments = form.getValues("instruments");
        if (!currentInstruments.includes(newInstrument.trim())) {
            form.setValue("instruments", [...currentInstruments, newInstrument.trim()]);
        }
        setNewInstrument("");
    };

    const removeInstrument = (inst: string) => {
        const currentInstruments = form.getValues("instruments");
        form.setValue("instruments", currentInstruments.filter(i => i !== inst));
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre Completo</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input placeholder="Ej: Juan Pérez" {...field} className="pl-10" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rol en el Ministerio</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un rol" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Director">Director</SelectItem>
                                        <SelectItem value="Vocalista">Vocalista</SelectItem>
                                        <SelectItem value="Instrumentista">Instrumentista</SelectItem>
                                        <SelectItem value="Técnico">Técnico</SelectItem>
                                        <SelectItem value="Coordinador">Coordinador</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Correo Electrónico</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input placeholder="ejemplo@correo.com" {...field} className="pl-10" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono / WhatsApp</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input placeholder="+1234567890" {...field} className="pl-10" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="voice_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Voz (si aplica)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona tipo de voz" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Soprano">Soprano</SelectItem>
                                        <SelectItem value="Contralto">Contralto</SelectItem>
                                        <SelectItem value="Tenor">Tenor</SelectItem>
                                        <SelectItem value="Bajo">Bajo</SelectItem>
                                        <SelectItem value="Ninguno">Ninguno</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-3">
                    <FormLabel>Instrumentos</FormLabel>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Ej: Piano, Guitarra..."
                            value={newInstrument}
                            onChange={(e) => setNewInstrument(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addInstrument();
                                }
                            }}
                        />
                        <Button type="button" variant="secondary" onClick={addInstrument}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {form.watch("instruments")?.map((inst) => (
                            <Badge key={inst} variant="secondary" className="pl-3 pr-1 py-1 gap-1">
                                {inst}
                                <button
                                    type="button"
                                    onClick={() => removeInstrument(inst)}
                                    className="hover:text-destructive transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notas Adicionales</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Información relevante sobre el integrante..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-4">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                    <Button type="submit" className="btn-gold" disabled={createMember.isPending || updateMember.isPending}>
                        {member ? "Actualizar" : "Guardar"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
