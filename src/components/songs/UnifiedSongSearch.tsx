import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Save, ExternalLink, Sparkles, Loader2, Search, ArrowLeft, ArrowRight, RotateCw, Home } from "lucide-react";
import { toast } from "sonner";

interface UnifiedSongSearchProps {
    onSongFound: (data: {
        name: string;
        type: string;
        key: string;
        lyrics: string;
        chords: string;
        youtube_url: string;
    }) => void;
}

export function UnifiedSongSearch({ onSongFound }: UnifiedSongSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("auto");
    const API_BASE = "http://localhost:3003/api";

    // Auto search state
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // Web browser state
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [browserUrl, setBrowserUrl] = useState("https://www.lacuerda.net/");
    const [currentUrl, setCurrentUrl] = useState("/api/proxy?url=https%3A%2F%2Fwww.lacuerda.net%2F");
    const [isCapturing, setIsCapturing] = useState(false);

    const suggestedSites = [
        { name: "LaCuerda.net", url: "https://www.lacuerda.net/" },
        // Nota: Letras.com y CifraClub bloquean iframes por seguridad
    ];

    // Auto search with backend + AI
    const handleAutoSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error("Escribe el nombre de una canción");
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch("/api/ai/extract-song", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify({
                    searchQuery: searchQuery,
                    type: "search",
                }),
            });

            if (!response.ok) throw new Error("Error en la búsqueda");

            const result = await response.json();
            toast.success(`¡Canción encontrada! Fuente: ${result.source}`);
            onSongFound(result.data);
            setIsOpen(false);
            setSearchQuery("");

        } catch (error) {
            console.error("Search error:", error);
            toast.error("No se pudo encontrar la canción. Intenta con el navegador manual.");
        } finally {
            setIsSearching(false);
        }
    };

    // Manual browser capture
    const handleBrowserNavigate = () => {
        let url = browserUrl.trim();
        if (!url.startsWith('http')) {
            url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        }
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        setCurrentUrl(proxyUrl);
    };

    const handleIframeAction = (action: 'back' | 'forward' | 'reload') => {
        try {
            if (iframeRef.current?.contentWindow) {
                const win = iframeRef.current.contentWindow;
                if (action === 'back') win.history.back();
                if (action === 'forward') win.history.forward();
                if (action === 'reload') win.location.reload();
            }
        } catch (e) {
            toast.error("No se puede navegar aquí por restricciones del sitio");
        }
    };

    const handleCapture = async () => {
        setIsCapturing(true);
        try {
            // Try to get the real current URL from iframe if possible (same-origin)
            let captureUrl = currentUrl;
            try {
                if (iframeRef.current?.contentWindow) {
                    const iframeUrl = iframeRef.current.contentWindow.location.href;
                    if (iframeUrl.includes('/api/proxy')) {
                        captureUrl = iframeUrl;
                        console.log("📍 Capturing from current iframe URL:", captureUrl);
                    }
                }
            } catch (e) {
                console.warn("Could not access iframe URL (cross-origin or blocked):", e);
            }

            const response = await fetch("/api/ai/extract-song", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify({
                    url: captureUrl,
                    type: "url",
                }),
            });

            if (!response.ok) throw new Error("Error al capturar");

            const result = await response.json();
            toast.success("¡Contenido capturado exitosamente!");
            onSongFound(result.data);
            setIsOpen(false);

        } catch (error) {
            console.error("Capture error:", error);
            toast.error("No se pudo capturar el contenido de esta página");
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Search className="w-4 h-4" />
                    Buscar Canción
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-[98vw] w-[1600px] h-[98vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-4 pt-3 pb-2 border-b border-white/10 flex-shrink-0">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Search className="w-4 h-4 text-primary" />
                        </div>
                        Buscar y Agregar Canción
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 px-3 pb-2">
                    <TabsList className="grid w-full grid-cols-2 h-9 mt-2 flex-shrink-0">
                        <TabsTrigger value="auto" className="gap-1.5 text-sm">
                            <Sparkles className="w-4 h-4" />
                            Búsqueda Automática
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="gap-1.5 text-sm">
                            <Globe className="w-4 h-4" />
                            Navegador Web
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Auto Search */}
                    <TabsContent value="auto" className="flex-1 flex flex-col gap-6 mt-6 w-full data-[state=inactive]:hidden data-[state=active]:flex">
                        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5 flex-shrink-0">
                            <p className="text-base text-blue-300 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-4 h-4 text-blue-400" />
                                </div>
                                <span>
                                    <strong className="text-blue-200">Búsqueda Automática:</strong> El sistema buscará en internet y extraerá la letra completa automáticamente usando IA.
                                </span>
                            </p>
                        </div>

                        <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
                            <div className="space-y-3">
                                <label className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <Search className="w-4 h-4 text-primary" />
                                    Nombre de la Canción
                                </label>
                                <Input
                                    placeholder="Ej: Way Maker Sinach"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleAutoSearch()}
                                    className="text-xl h-14 px-5 bg-secondary/50 border-white/10 focus:border-primary/50 transition-all"
                                />
                            </div>

                            <Button
                                onClick={handleAutoSearch}
                                disabled={isSearching}
                                className="w-full btn-gold gap-3 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                                size="lg"
                            >
                                {isSearching ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Buscando en Internet...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Buscar Ahora
                                    </>
                                )}
                            </Button>

                            <div className="bg-secondary/30 border border-white/5 rounded-xl p-6 space-y-3 flex-shrink-0">
                                <h4 className="font-semibold text-base flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    Ejemplos de búsqueda:
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-2 pl-4">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                                        "Way Maker Sinach"
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                                        "Milagroso Jesus Adrian Romero"
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                                        "Reckless Love Cory Asbury"
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                                        "El Es Santo Miel San Marcos"
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Web Browser */}
                    <TabsContent value="manual" className="flex-1 flex flex-col gap-1.5 mt-2 min-h-0 data-[state=inactive]:hidden data-[state=active]:flex">


                        {/* Full navigation bar */}
                        <div className="flex flex-col gap-2 flex-shrink-0 bg-secondary/30 p-2 rounded-lg border border-white/10 shadow-inner">
                            <div className="flex gap-2 items-center">
                                <div className="flex gap-1">
                                    <Button onClick={() => handleIframeAction('back')} variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={() => handleIframeAction('forward')} variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={() => handleIframeAction('reload')} variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                                        <RotateCw className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                                <div className="flex-1 relative flex items-center">
                                    <Globe className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground" />
                                    <Input
                                        value={browserUrl}
                                        onChange={(e) => setBrowserUrl(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleBrowserNavigate()}
                                        placeholder="Busca en Google o pega un enlace..."
                                        className="w-full h-8 pl-8 pr-10 bg-background/80 border-white/10 text-xs rounded-full focus:ring-primary/30"
                                    />
                                    <Button
                                        onClick={handleBrowserNavigate}
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 h-6 px-2 text-[10px] hover:text-primary transition-colors"
                                    >
                                        IR
                                    </Button>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="flex gap-2 items-center flex-wrap">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const url = "https://www.lacuerda.net/";
                                        setBrowserUrl(url);
                                        setCurrentUrl(`/api/proxy?url=${encodeURIComponent(url)}`);
                                        setActiveTab("manual");
                                    }}
                                    className="h-8 px-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs font-medium"
                                >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    LaCuerda
                                </Button>

                                <span className="text-[10px] text-muted-foreground">|</span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const url = "https://www.letras.com/";
                                        setBrowserUrl(url);
                                        setCurrentUrl(`/api/proxy?url=${encodeURIComponent(url)}`);
                                        setActiveTab("manual");
                                    }}
                                    className="h-8 px-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-xs font-medium"
                                >
                                    📝 Letras.com
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const url = "https://www.cifraclub.com/";
                                        setBrowserUrl(url);
                                        setCurrentUrl(`/api/proxy?url=${encodeURIComponent(url)}`);
                                        setActiveTab("manual");
                                    }}
                                    className="h-8 px-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-xs font-medium"
                                >
                                    🎸 CifraClub
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const url = "https://genius.com/";
                                        setBrowserUrl(url);
                                        setCurrentUrl(`/api/proxy?url=${encodeURIComponent(url)}`);
                                        setActiveTab("manual");
                                    }}
                                    className="h-8 px-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-medium"
                                >
                                    🎵 Genius
                                </Button>
                            </div>
                        </div>

                        {/* MAXIMUM Browser Frame */}
                        <div className="flex-1 border-2 border-primary/30 rounded-lg overflow-hidden bg-white min-h-0">
                            <iframe
                                ref={iframeRef}
                                src={currentUrl}
                                className="w-full h-full"
                                title="Navegador de letras"
                                scrolling="yes"
                            />
                        </div>

                        {/* Compact Capture Button */}
                        <div className="flex-shrink-0">
                            <Button
                                onClick={handleCapture}
                                disabled={isCapturing}
                                className="w-full gap-2 btn-gold h-9 text-sm font-semibold"
                                size="lg"
                            >
                                {isCapturing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Capturando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Guardar Esta Letra
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
