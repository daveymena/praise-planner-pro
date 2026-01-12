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
import { Music, ExternalLink, Youtube, Search, ClipboardList, Sparkles, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

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
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pastedText, setPastedText] = useState("");

  const handleAIAutoFill = async (mode: 'search' | 'paste') => {
    const name = form.getValues('name');
    if (mode === 'search' && !name) {
      toast.error("Escribe el nombre de la canción para buscar");
      return;
    }

    if (mode === 'paste' && !pastedText) {
      toast.error("Pega el texto de la letra o acordes");
      return;
    }

    setIsExtracting(true);
    try {
      const response = await fetch('/api/ai/extract-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: mode,
          searchQuery: mode === 'search' ? name : undefined,
          text: mode === 'paste' ? pastedText : undefined
        })
      });

      if (!response.ok) throw new Error('Failed to extract data');

      const { data, source } = await response.json();

      if (data.name) form.setValue('name', data.name);
      if (data.type) form.setValue('type', data.type);
      if (data.key) form.setValue('key', data.key);
      if (data.tempo) form.setValue('tempo', data.tempo);
      if (data.lyrics) form.setValue('lyrics', data.lyrics);
      if (data.chords) form.setValue('chords', data.chords);

      toast.success(`✓ Autocompletado vía ${source}`);
      setShowPasteArea(false);
      setPastedText("");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo completar la información. Intenta pegar el texto manualmente.");
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

        <FormField
          control={form.control}
          name="youtube_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-600" />
                URL de YouTube (Video de referencia)
              </FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...field}
                    className="flex-1"
                  />
                  {field.value && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(field.value, '_blank')}
                      title="Abrir video en YouTube"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-primary/30 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <span className="text-primary">✨</span> Asistente IA de Autocompletado
              </h4>
              <p className="text-xs text-muted-foreground">
                Escribe el nombre y usa la IA para rellenar todo el formulario.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="default"
                disabled={isExtracting || !form.watch('name')}
                onClick={() => handleAIAutoFill('search')}
                className="bg-primary/90 hover:bg-primary flex-1 sm:flex-none"
              >
                {isExtracting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                {isExtracting ? 'Buscando...' : 'Completar con IA'}
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isExtracting || !form.watch('youtube_url')}
                onClick={() => handleAIAutoFill('url')}
                className="flex-1 sm:flex-none"
              >
                <Youtube className="w-4 h-4 mr-2" />
                Usar Video
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isExtracting}
                onClick={() => setShowPasteArea(!showPasteArea)}
                className="flex-1 sm:flex-none"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                {showPasteArea ? 'Cerrar' : 'Pegar Texto'}
              </Button>
            </div>
          </div>

          {showPasteArea && (
            <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-1">
              <Textarea
                placeholder="Pega aquí la letra y/o acordes que encontraste en Google o cualquier otro sitio..."
                className="min-h-[150px] text-sm font-mono"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
              />
              <Button
                type="button"
                className="w-full"
                variant="secondary"
                disabled={isExtracting || !pastedText}
                onClick={() => handleAIAutoFill('paste')}
              >
                {isExtracting ? 'Procesando Texto...' : '✨ Formatear y Rellenar Formulario'}
              </Button>
            </div>
          )}
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