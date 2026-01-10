import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { SongForm } from "@/components/forms/SongForm";
import {
  Plus,
  Search,
  Music,
  Star,
  Play,
  ExternalLink,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useSongs, useToggleSongFavorite, useDeleteSong } from "@/hooks/useSongs";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Song = Database['public']['Tables']['songs']['Row'];

const typeColors = {
  "Alabanza": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Adoración": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "Ministración": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Congregacional": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

const tempoColors = {
  "Rápido": "text-red-500",
  "Moderado": "text-amber-500",
  "Lento": "text-blue-500",
};

export default function Repertorio() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  const { data: songs, isLoading, error } = useSongs({
    type: selectedType || undefined,
    favorite: showFavorites || undefined,
    search: searchQuery || undefined,
  });

  const toggleFavorite = useToggleSongFavorite();
  const deleteSong = useDeleteSong();

  const handleToggleFavorite = async (song: Song) => {
    try {
      await toggleFavorite.mutateAsync({
        id: song.id,
        is_favorite: !song.is_favorite,
      });
      toast.success(song.is_favorite ? "Removido de favoritas" : "Agregado a favoritas");
    } catch (error) {
      toast.error("Error al actualizar favorita");
    }
  };

  const handleDeleteSong = async (song: Song) => {
    if (!confirm(`¿Estás seguro de eliminar "${song.name}"?`)) return;

    try {
      await deleteSong.mutateAsync(song.id);
      toast.success("Canción eliminada exitosamente");
    } catch (error) {
      toast.error("Error al eliminar la canción");
    }
  };

  const types = ["Alabanza", "Adoración", "Ministración", "Congregacional"];

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-500">Error al cargar las canciones</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Repertorio 🎶
            </h1>
            <p className="text-muted-foreground mt-1">
              {isLoading ? "Cargando..." : `${songs?.length || 0} canciones en el repertorio`}
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Canción
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nueva Canción</DialogTitle>
                <DialogDescription>Complete los detalles para agregar una nueva canción al repertorio.</DialogDescription>
              </DialogHeader>
              <SongForm
                onSuccess={() => setIsCreateDialogOpen(false)}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="card-elevated p-4 mb-6 fade-in">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar canción..."
                className="pl-10 input-warm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                  className={selectedType === type ? "btn-gold" : ""}
                >
                  {type}
                </Button>
              ))}
            </div>

            {/* Favorites Toggle */}
            <Button
              variant={showFavorites ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavorites(!showFavorites)}
              className={showFavorites ? "btn-gold" : ""}
            >
              <Star className={`w-4 h-4 mr-1 ${showFavorites ? 'fill-current' : ''}`} />
              Favoritas
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Songs Grid */}
        {!isLoading && songs && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {songs.map((song, index) => (
              <div
                key={song.id}
                className="card-elevated p-5 slide-up group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {song.name}
                      </h3>
                      <button
                        onClick={() => handleToggleFavorite(song)}
                        disabled={toggleFavorite.isPending}
                      >
                        <Star className={`w-4 h-4 transition-colors ${song.is_favorite
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-muted-foreground hover:text-amber-500'
                          }`} />
                      </button>
                    </div>
                    <Badge className={`mt-2 ${typeColors[song.type]}`}>
                      {song.type}
                    </Badge>
                  </div>
                  {song.youtube_url && (
                    <a
                      href={song.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="w-4 h-4 text-primary ml-0.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" />
                    <span>Tono: <strong className="text-foreground">{song.key}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${tempoColors[song.tempo].replace('text-', 'bg-')}`} />
                    <span>{song.tempo}</span>
                  </div>
                </div>

                {song.notes && (
                  <p className="mt-3 text-xs text-muted-foreground italic bg-secondary/50 p-2 rounded-lg">
                    "{song.notes}"
                  </p>
                )}

                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditingSong(song)}
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Editar Canción</DialogTitle>
                        <DialogDescription>Modifique los detalles de la canción existente.</DialogDescription>
                      </DialogHeader>
                      <SongForm
                        song={editingSong}
                        onSuccess={() => setEditingSong(null)}
                        onCancel={() => setEditingSong(null)}
                      />
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSong(song)}
                    disabled={deleteSong.isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && songs && songs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
              <Music className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No se encontraron canciones</p>
            <Button
              className="mt-4 btn-gold"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primera Canción
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
