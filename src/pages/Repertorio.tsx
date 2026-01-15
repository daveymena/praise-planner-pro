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
      <div className="max-w-7xl mx-auto px-0 sm:px-4 space-y-6 md:space-y-8 pb-32 lg:pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 sm:px-0 fade-in">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-8 rounded-full bg-primary" />
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                Repertorio
              </h1>
            </div>
            <p className="text-muted-foreground text-base md:text-lg font-medium">
              {isLoading ? "Cargando biblioteca..." : `${songs?.length || 0} canciones registradas`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <UnifiedSongSearch
              onSongFound={(data) => {
                setCapturedData(data);
                setIsCreateDialogOpen(true);
                toast.success("¡Canción capturada! Revisa los datos y guarda.");
              }}
            />

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-premium h-12 px-6" onClick={() => setCapturedData(null)}>
                  <Plus className="w-5 h-5 md:mr-2" />
                  <span className="hidden sm:inline">Agregar Canción</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[100vw] w-full lg:max-w-[1200px] h-[100dvh] lg:h-[90vh] overflow-hidden flex flex-col p-0 glass-card border-primary/20 shadow-3xl lg:rounded-[2.5rem]">
                <DialogHeader className="p-8 border-b border-border/50 bg-secondary/20">
                  <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Nueva Canción</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-8 md:p-12 pb-40 scrollbar-hide">
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
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters & Search - Improved for Mobile */}
        <div className="sticky top-16 lg:top-0 z-30 bg-background/80 backdrop-blur-md lg:bg-transparent pb-4 lg:pb-0 px-4 sm:px-0">
          <div className="glass-card p-3 flex flex-col gap-4 slide-up">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Encuentra cánticos por título, artista o tono..."
                className="pl-16 h-16 md:h-20 bg-secondary/30 border-none focus-visible:ring-4 focus-visible:ring-primary/10 text-xl rounded-[1.5rem] shadow-none font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
              {types.map(type => (
                <Button
                  key={type}
                  variant="ghost"
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                  className={`h-12 px-6 rounded-2xl whitespace-nowrap transition-all border font-bold text-xs uppercase tracking-widest ${selectedType === type
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-background hover:bg-primary/5 text-muted-foreground border-border/50'
                    }`}
                >
                  {type}
                </Button>
              ))}
              <div className="w-px h-8 bg-border mx-2 shrink-0" />
              <Button
                variant="ghost"
                onClick={() => setShowFavorites(!showFavorites)}
                className={`h-12 px-6 rounded-2xl gap-2 transition-all border font-bold text-xs uppercase tracking-widest ${showFavorites
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 border-amber-200'
                  : 'bg-background hover:bg-amber-50 text-muted-foreground border-border/50'
                  }`}
              >
                <Star className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
                <span>Mis Favoritas</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Grid Section - Optimized with larger columns */}
        <div className="px-4 sm:px-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse font-medium">Sincronizando biblioteca...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
              {songs?.map((song, index) => (
                <div
                  key={song.id}
                  className="card-premium group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Thumbnail Container */}
                  <div className="relative h-44 md:h-56 overflow-hidden bg-secondary/20">
                    {getYoutubeThumbnail(song.youtube_url) ? (
                      <img
                        src={getYoutubeThumbnail(song.youtube_url)!}
                        alt={song.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <Music className="w-16 h-16 text-primary/10" />
                      </div>
                    )}

                    {/* Floating Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 dark:bg-black/90 backdrop-blur-md border-transparent text-foreground font-bold shadow-sm">
                        {song.type}
                      </Badge>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(song);
                      }}
                      className={`absolute top-4 right-4 p-2.5 rounded-2xl backdrop-blur-md transition-all z-10 ${song.is_favorite ? 'bg-amber-500 text-white shadow-lg' : 'bg-white/20 text-white hover:bg-white/40'
                        }`}
                    >
                      <Star className={`w-5 h-5 ${song.is_favorite ? 'fill-current' : ''}`} />
                    </button>

                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-white border-none h-6 px-2 text-[10px] font-black tracking-wider uppercase">
                          {song.key}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-white mt-1 drop-shadow-lg">
                        {song.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-4 bg-card/50">
                    <div className="flex items-center justify-between min-h-[1.25rem]">
                      {song.notes ? (
                        <p className="text-xs text-muted-foreground line-clamp-1 italic">
                          "{song.notes}"
                        </p>
                      ) : (
                        <span />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        className="flex-1 btn-premium h-11 text-sm"
                        onClick={() => setViewingSong(song)}
                      >
                        <Play className="w-4 h-4 fill-current mr-2" />
                        Ver / Ensayar
                      </Button>

                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0 glass-card">
                            <DialogHeader className="p-6 border-b border-border/50">
                              <DialogTitle className="text-2xl font-bold">Editar Canción</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto p-6 pb-40 scrollbar-hide">
                              <SongForm song={song} onSuccess={() => setIsCreateDialogOpen(false)} />
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 rounded-2xl border-border/60 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all"
                          onClick={() => handleDeleteSong(song)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Empty State */}
        {!isLoading && songs?.length === 0 && (
          <div className="text-center py-20 glass-card px-6 max-w-xl mx-auto flex flex-col items-center gap-6 slide-up mx-4">
            <div className="w-24 h-24 rounded-[2.5rem] bg-primary/5 flex items-center justify-center">
              <Music className="w-12 h-12 text-primary/30" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">Tu repertorio está vacío</h3>
              <p className="text-muted-foreground">Empieza a agregar canciones manualmente o usa nuestro buscador inteligente.</p>
            </div>
            <Button className="btn-premium px-10 h-14 text-lg" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-5 h-5 mr-1" />
              Agregar Mi Primera Canción
            </Button>
          </div>
        )}
      </div>

      {/* Split View Ensemble Mode Modal */}
      <Dialog open={!!viewingSong} onOpenChange={(open) => !open && setViewingSong(null)}>
        <DialogContent className="max-w-[100vw] w-full lg:max-w-[1600px] h-[100dvh] lg:h-[95vh] p-0 overflow-hidden bg-background lg:rounded-[3rem] border-primary/20 shadow-4xl flex flex-col lg:my-2">
          {viewingSong && (
            <div className="flex flex-col h-full">
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 bg-secondary/30 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shadow-xl shrink-0 group hover:rotate-6 transition-all duration-500">
                    <Music className="w-7 h-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl md:text-3xl font-black text-foreground truncate uppercase tracking-tighter">{viewingSong.name}</h2>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Badge className="bg-primary text-white border-none text-[11px] h-6 px-2.5 uppercase font-black">
                        {viewingSong.key}
                      </Badge>
                      <span className="text-xs text-muted-foreground uppercase font-black tracking-[0.2em]">{viewingSong.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  {viewingSong.youtube_url && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(viewingSong.youtube_url!, '_blank')}
                      className="h-12 border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-2xl px-6 font-bold text-xs uppercase tracking-widest transition-all"
                    >
                      <Youtube className="w-5 h-5 mr-3" />
                      <span className="hidden md:inline">Ver en YouTube</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Content area: Scrollable */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Video Player (Top on Mobile, Side on Desktop) */}
                <div className="w-full lg:w-5/12 lg:fixed lg:right-0 lg:top-[88px] lg:bottom-0 bg-slate-950 flex items-center justify-center relative border-b lg:border-l lg:border-b-0 border-white/5 order-first lg:order-last h-[220px] sm:h-[350px] lg:h-auto shrink-0 shadow-2xl z-10">
                  {viewingSong.youtube_url ? (
                    <div className="relative w-full h-full">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube-nocookie.com/embed/${getYoutubeVideoId(viewingSong.youtube_url)}?rel=0&modestbranding=1&origin=${window.location.origin}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                      />
                      {/* Safety help link */}
                      <div className="absolute top-4 right-4 z-20">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-[10px] h-9 md:h-8 bg-black/80 hover:bg-black text-white backdrop-blur-md border border-white/10 rounded-full px-4 font-bold shadow-xl transition-all"
                          onClick={() => window.open(viewingSong.youtube_url!, '_blank')}
                        >
                          <Youtube className="w-4 h-4 mr-2 text-red-500" />
                          <span>Ver en YouTube</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 max-w-sm">
                      <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Youtube className="w-6 h-6 md:w-10 md:h-10 text-muted-foreground/20" />
                      </div>
                      <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest">Video No Disponible</h4>
                    </div>
                  )}
                </div>

                {/* Main Content: Lyrics & Chords */}
                <div className="flex-1 lg:w-7/12 p-3 md:p-8 lg:p-12 overflow-y-auto custom-scrollbar bg-card/10">
                  <div className="max-w-2xl mx-auto space-y-12 md:space-y-16">


                    {viewingSong.lyrics && (
                      <section className="fade-in">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-px bg-primary/40" />
                          <h3 className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">
                            LETRA Y REGIONES
                          </h3>
                        </div>
                        <div className="bg-white/40 dark:bg-slate-900/40 p-5 md:p-14 rounded-[2rem] md:rounded-[3.5rem] border border-border/30 whitespace-pre-wrap text-[18px] md:text-3xl font-medium !leading-[2] text-foreground shadow-lg backdrop-blur-md">
                          {viewingSong.lyrics.split('\n').map((line, i) => {
                            const trimmedLine = line.trim();
                            if ((trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) ||
                              trimmedLine.match(/^(CORO|VERSO|INTRO|PUENTE|ESTROFA|BRIDGE|CHORUS|VERSE|FINAL|OUTRO):?$/i)) {
                              return (
                                <div key={i} className="flex items-center gap-4 mt-16 mb-8 first:mt-0">
                                  <div className="h-px w-8 bg-primary/40" />
                                  <div className="text-primary font-black text-xs md:text-sm tracking-[0.4em] uppercase py-2">
                                    {trimmedLine.replace(/[\[\]:]/g, '')}
                                  </div>
                                  <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
                                </div>
                              );
                            }
                            if (trimmedLine.includes('[REPETIR:')) {
                              return (
                                <div key={i} className="text-amber-600 dark:text-amber-500 font-black text-xs md:text-sm my-6 flex items-center gap-2 opacity-80 italic">
                                   // {trimmedLine.replace(/[\[\]]/g, '').replace('REPETIR: ', 'Repetir ')}
                                </div>
                              );
                            }
                            if (!trimmedLine) return <div key={i} className="h-4 md:h-8" />;
                            return <div key={i} className="px-2 mb-2">{trimmedLine}</div>;
                          })}
                        </div>
                      </section>
                    )}

                    {viewingSong.chords && (
                      <section className="fade-in" style={{ animationDelay: '150ms' }}>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-px bg-amber-500/40" />
                          <h3 className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">
                            GUÍA DE ACORDES
                          </h3>
                        </div>
                        <div className="bg-amber-500/5 dark:bg-amber-500/5 p-6 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border-2 border-amber-500/20 whitespace-pre-wrap font-mono text-2xl md:text-6xl font-black text-amber-700 dark:text-amber-400 tracking-widest shadow-2xl backdrop-blur-sm">
                          {viewingSong.chords.split('\n').map((line, i) => {
                            const trimmedLine = line.trim();
                            if ((trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) ||
                              trimmedLine.match(/^(CORO|VERSO|INTRO|PUENTE|ESTROFA|BRIDGE|CHORUS|VERSE|FINAL|OUTRO):?$/i)) {
                              return (
                                <div key={i} className="flex items-center gap-4 mt-16 mb-10 first:mt-0">
                                  <div className="h-px w-10 bg-amber-500/40" />
                                  <div className="text-amber-600 dark:text-amber-400 font-black text-xs md:text-sm tracking-[0.5em] uppercase">
                                    {trimmedLine.replace(/[\[\]:]/g, '')}
                                  </div>
                                  <div className="h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
                                </div>
                              );
                            }
                            if (!trimmedLine) return <div key={i} className="h-6 md:h-12" />;
                            return <div key={i} className="px-2 mb-4 leading-relaxed">{trimmedLine}</div>;
                          })}
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
