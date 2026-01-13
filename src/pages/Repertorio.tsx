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
  Trash2,
  Loader2,
  Youtube,
  Info,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { useSongs, useToggleSongFavorite, useDeleteSong } from "@/hooks/useSongs";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Song = Database['public']['Tables']['songs']['Row'];

const typeColors = {
  "Alabanza": "bg-primary/10 text-primary border-primary/20",
  "Adoración": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Ministración": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Congregacional": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function Repertorio() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

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
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-2">
              Repertorio <Music className="w-8 h-8 text-primary" />
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">
              {isLoading ? "Cargando biblioteca..." : `${songs?.length || 0} himnos y cantos en tu ministerio`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/5 shadow-sm"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Buscador IA
            </Button>

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
                    <Badge className={`mt-2 ${typeColors[song.type as keyof typeof typeColors] || 'bg-gray-500/10 text-gray-600 border-gray-500/20'}`}>
                      {song.type}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleFavorite(song)}
                      disabled={toggleFavorite.isPending}
                      className="p-1.5 hover:bg-secondary rounded-full transition-colors"
                    >
                      <Star className={`w-5 h-5 transition-colors ${song.is_favorite
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-muted-foreground hover:text-amber-500'
                        }`} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-primary" />
                    <span>Tono: <strong className="text-white font-semibold">{song.key}</strong></span>
                  </div>
                </div>

                {song.notes && (
                  <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground italic bg-secondary/30 p-2 rounded border-l-2 border-primary/20">
                    <Info className="w-3 h-3 inline mr-1 mb-0.5" />
                    {song.notes}
                  </p>
                )}

                <div className="flex gap-2 mt-4 pt-2 border-t border-border/50">
                  {song.youtube_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setSelectedVideoUrl(song.youtube_url || null)}
                    >
                      <Youtube className="w-3.5 h-3.5 mr-1.5" />
                      Video
                    </Button>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditingSong(song)}
                      >
                        <Edit className="w-3.5 h-3.5 mr-1.5" />
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

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideoUrl} onOpenChange={(open) => !open && setSelectedVideoUrl(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
          {selectedVideoUrl && (
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getYoutubeVideoId(selectedVideoUrl)}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
