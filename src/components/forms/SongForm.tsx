import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateSong, useUpdateSong } from "@/hooks/useSongs";
import { useMembers } from "@/hooks/useMembers";
import { toast } from "sonner";
import type { CreateSongData } from "@/types/api";

const songSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["Alabanza", "Adoración", "Ministración", "Congregacional"]),
  key: z.string().min(1, "La tonalidad es requerida"),
  tempo: z.enum(["Rápido", "Moderado", "Lento"]),
  is_favorite: z.boolean().default(false),
  lyrics: z.string().optional(),
  chords: z.string().optional(),
  notes: z.string().optional(),
  youtube_url: z.string().url().optional().or(z.literal("")),
  duration_minutes: z.number().min(1).max(30).optional(),
  created_by: z.string().optional(),
});

type SongFormData = z.infer<typeof songSchema>;

interface SongFormProps {
  song?: Database['public']['Tables']['songs']['Row'];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SongForm({ song, onSuccess, onCancel }: SongFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: members } = useMembers();
  const createSong = useCreateSong();
  const updateSong = useUpdateSong();

  const form = useForm<SongFormData>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      name: song?.name || "",
      type: song?.type || "Alabanza",
      key: song?.key || "",
      tempo: song?.tempo || "Moderado",
      is_favorite: song?.is_favorite || false,
      lyrics: song?.lyrics || "",
      chords: song?.chords || "",
      notes: song?.notes || "",
      youtube_url: song?.youtube_url || "",
      duration_minutes: song?.duration_minutes || undefined,
      created_by: song?.created_by || "",
    },
  });

  const onSubmit = async (data: SongFormData) => {
    setIsSubmitting(true);
    try {
      if (song) {
        await updateSong.mutateAsync({ id: song.id, ...data });
        toast.success("Canción actualizada exitosamente");
      } else {
        await createSong.mutateAsync(data);
        toast.success("Canción creada exitosamente");
      }
      onSuccess?.();
    } catch (error) {
      toast.error("Error al guardar la canción");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isExtracting, setIsExtracting] = useState(false);

  const handleAutoFill = async () => {
    const url = form.getValues('youtube_url');
    if (!url) return;

    setIsExtracting(true);
    try {
      // Use relative path which works for both dev (proxy) and prod
      const response = await fetch('/api/ai/extract-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) throw new Error('Failed to extract data');

      const { data } = await response.json();

      if (data.name) form.setValue('name', data.name);
      if (data.key) form.setValue('key', data.key);
      if (data.tempo) form.setValue('tempo', data.tempo);
      if (data.lyrics) form.setValue('lyrics', data.lyrics);
      if (data.chords) form.setValue('chords', data.chords);

      toast.success("¡Datos extraídos con Inteligencia Artificial!");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo extraer la información. Verifica la URL.");
    } finally {
      setIsExtracting(false);
    }
  };

  const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Bb", "Eb", "Ab", "Db"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Canción</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Cristo Vive" {...field} />
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
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Alabanza">Alabanza</SelectItem>
                    <SelectItem value="Adoración">Adoración</SelectItem>
                    <SelectItem value="Ministración">Ministración</SelectItem>
                    <SelectItem value="Congregacional">Congregacional</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tonalidad</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la tonalidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {keys.map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tempo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tempo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Lento">Lento</SelectItem>
                    <SelectItem value="Moderado">Moderado</SelectItem>
                    <SelectItem value="Rápido">Rápido</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración (minutos)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="5"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        <div className="flex gap-4 items-end">
          <FormField
            control={form.control}
            name="youtube_url"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>URL de YouTube (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="secondary"
            className="mb-8"
            disabled={isExtracting || !form.watch('youtube_url')}
            onClick={handleAutoFill}
          >
            {isExtracting ? (
              <span className="animate-spin mr-2">✨</span>
            ) : (
              <span className="mr-2">✨</span>
            )}
            {isExtracting ? 'Analizando...' : 'Auto-completar con IA'}
          </Button>
        </div>

        <FormField
          control={form.control}
          name="is_favorite"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Marcar como favorita</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lyrics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Letra (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escribe la letra de la canción..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acordes (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="C - G - Am - F..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notas adicionales sobre la canción..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting} className="btn-gold">
            {isSubmitting ? "Guardando..." : song ? "Actualizar" : "Crear Canción"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}