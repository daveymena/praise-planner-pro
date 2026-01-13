import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { SongForm } from "@/components/forms/SongForm";
import { UnifiedSongSearch } from "@/components/songs/UnifiedSongSearch";
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
  Sparkles,
  Edit,
  FileText
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
  const [capturedData, setCapturedData] = useState<any>(null);


  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Miniaturas de YouTube
  const getYoutubeThumbnail = (url?: string | null) => {
    if (!url) return null;
    const videoId = getYoutubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  const [viewingSong, setViewingSong] = useState<Song | null>(null);

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
      toast.success(!song.is_favorite ? "Agregado a favoritas" : "Removido de favoritas");
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
              {isLoading ? "Cargando biblioteca..." : `${songs?.length || 0} canciones listas para ministrar`}
            </p>
          </div>
          <div className="flex gap-2">
            <UnifiedSongSearch
              onSongFound={(data) => {
                setCapturedData(data);
                setIsCreateDialogOpen(true);
                toast.success("¡Canción capturada! Revisa los datos y guarda.");
              }}
            />

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-gold" onClick={() => setCapturedData(null)}>
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
                  prefilledData={capturedData}
                  onSuccess={() => {
                    setIsCreateDialogOpen(false);
                    setCapturedData(null);
                  }}
                  onCancel={() => {
                    setIsCreateDialogOpen(false);
                    setCapturedData(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="card-elevated p-4 mb-6 fade-in">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Busca por nombre, letra o tonalidad..."
                className="pl-10 input-warm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                  className={selectedType === type ? "btn-gold" : "hover:border-primary/40"}
                >
                  {type}
                </Button>
              ))}
            </div>

            <Button
              variant={showFavorites ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavorites(!showFavorites)}
              className={showFavorites ? "btn-gold" : "hover:border-primary/40"}
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.map((song, index) => (
              <div
                key={song.id}
                className="group relative flex flex-col bg-background/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-xl slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Video Thumbnail Header */}
                <div className="relative h-40 overflow-hidden bg-muted">
                  {getYoutubeThumbnail(song.youtube_url) ? (
                    <img
                      src={getYoutubeThumbnail(song.youtube_url)!}
                      alt={song.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-background">
                      <Music className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge className={`shadow-lg border-none ${typeColors[song.type as keyof typeof typeColors] || 'bg-gray-500 text-white'}`}>
                      {song.type}
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <Badge variant="outline" className="bg-black/50 backdrop-blur-md border-primary/30 text-primary font-bold">
                      {song.key}
                    </Badge>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors line-clamp-1">
                      {song.name}
                    </h3>
                    <button
                      onClick={() => handleToggleFavorite(song)}
                      className={`p-1 transition-colors ${song.is_favorite ? 'text-amber-400' : 'text-muted-foreground hover:text-amber-400'}`}
                    >
                      <Star className={`w-5 h-5 ${song.is_favorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {song.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2 italic mb-4">
                      {song.notes}
                    </p>
                  )}

                  <div className="mt-auto pt-4 flex items-center gap-2">
                    <Button
                      className="flex-1 btn-gold shadow-lg shadow-primary/10"
                      size="sm"
                      onClick={() => setViewingSong(song)}
                    >
                      <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                      Modo Ensayo
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-white/10 hover:border-primary/50">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Canción</DialogTitle>
                        </DialogHeader>
                        <SongForm song={song} onSuccess={() => setIsCreateDialogOpen(false)} />
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl border-white/10 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      onClick={() => handleDeleteSong(song)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && songs?.length === 0 && (
          <div className="text-center py-20 card-elevated">
            <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-white mb-2">Tu repertorio está vacío</h3>
            <p className="text-muted-foreground mb-8">Empieza a agregar canciones manualmente o usa nuestro buscador IA.</p>
            <Button className="btn-gold px-8" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Mi Primera Canción
            </Button>
          </div>
        )}
      </div>

      {/* Split View Ensemble Mode Modal */}
      <Dialog open={!!viewingSong} onOpenChange={(open) => !open && setViewingSong(null)}>
        <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] p-0 overflow-hidden bg-background border-primary/20 shadow-2xl">
          {viewingSong && (
            <div className="flex flex-col h-full">
              {/* Modal Header */}
              <div className="p-4 border-b border-white/10 bg-secondary/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shadow-lg">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{viewingSong.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={typeColors[viewingSong.type as keyof typeof typeColors] || ''}>
                        {viewingSong.type}
                      </Badge>
                      <Badge variant="outline" className="border-primary/50 text-primary">
                        Tono: {viewingSong.key}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {viewingSong.youtube_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(viewingSong.youtube_url!, '_blank')}
                      className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                    >
                      <Youtube className="w-4 h-4 mr-2" />
                      Abrir en YouTube
                    </Button>
                  )}
                </div>
              </div>

              {/* Split Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Lado Izquierdo: Letra y Acordes */}
                <div className="w-full lg:w-1/2 p-6 overflow-y-auto border-r border-white/10 custom-scrollbar bg-black/20">
                  <div className="grid grid-cols-1 gap-8">
                    {viewingSong.lyrics && (
                      <section>
                        <h3 className="text-primary font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Letra de la Canción
                        </h3>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 white-space-pre text-lg font-medium leading-relaxed text-gray-200">
                          {viewingSong.lyrics}
                        </div>
                      </section>
                    )}

                    {viewingSong.chords && (
                      <section>
                        <h3 className="text-gold font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                          <Music className="w-4 h-4" /> Guía de Acordes
                        </h3>
                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 white-space-pre font-mono text-xl text-primary-foreground tracking-wider">
                          {viewingSong.chords}
                        </div>
                      </section>
                    )}
                  </div>
                </div>

                {/* Lado Derecho: Video Player */}
                <div className="hidden lg:flex w-1/2 bg-black items-center justify-center relative">
                  {viewingSong.youtube_url ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${getYoutubeVideoId(viewingSong.youtube_url)}?autoplay=1&modestbranding=1&rel=0`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <Youtube className="w-20 h-20 text-muted-foreground opacity-20 mx-auto mb-4" />
                      <p className="text-muted-foreground">Esta canción no tiene un video vinculado.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
