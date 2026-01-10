import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search,
  Music,
  Star,
  Play,
  ExternalLink
} from "lucide-react";
import { useState } from "react";

interface Song {
  id: number;
  name: string;
  type: "Alabanza" | "Adoración" | "Ministración" | "Congregacional";
  key: string;
  tempo: "Rápido" | "Moderado" | "Lento";
  favorite: boolean;
  notes?: string;
  audioUrl?: string;
}

const mockSongs: Song[] = [
  { id: 1, name: "Cristo Vive", type: "Alabanza", key: "D", tempo: "Rápido", favorite: true, notes: "Funciona bien en apertura" },
  { id: 2, name: "Digno es el Señor", type: "Adoración", key: "G", tempo: "Moderado", favorite: true },
  { id: 3, name: "Santo Espíritu", type: "Ministración", key: "F", tempo: "Lento", favorite: false, notes: "Ministración profunda" },
  { id: 4, name: "Gracia Sublime", type: "Adoración", key: "C", tempo: "Lento", favorite: false },
  { id: 5, name: "Tu Gracia", type: "Ministración", key: "E", tempo: "Lento", favorite: true },
  { id: 6, name: "Grande es el Señor", type: "Alabanza", key: "A", tempo: "Rápido", favorite: false },
  { id: 7, name: "Cuan Grande es Él", type: "Congregacional", key: "G", tempo: "Moderado", favorite: true },
  { id: 8, name: "Ven Espíritu Ven", type: "Ministración", key: "D", tempo: "Lento", favorite: false },
];

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

  const filteredSongs = mockSongs.filter(song => {
    const matchesSearch = song.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || song.type === selectedType;
    const matchesFavorite = !showFavorites || song.favorite;
    return matchesSearch && matchesType && matchesFavorite;
  });

  const types = ["Alabanza", "Adoración", "Ministración", "Congregacional"];

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
              {mockSongs.length} canciones en el repertorio
            </p>
          </div>
          <Button className="btn-gold">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Canción
          </Button>
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

        {/* Songs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song, index) => (
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
                    {song.favorite && (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <Badge className={`mt-2 ${typeColors[song.type]}`}>
                    {song.type}
                  </Badge>
                </div>
                <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 text-primary ml-0.5" />
                </button>
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
                <Button variant="outline" size="sm" className="flex-1">
                  Editar
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredSongs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
              <Music className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No se encontraron canciones</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
