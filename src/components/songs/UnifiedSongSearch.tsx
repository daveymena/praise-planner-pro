import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
        const trimmedUrl = browserUrl.trim();
        if (!trimmedUrl) {
            toast.error("Ingresa una URL o término de búsqueda");
            return;
        }

        let url = trimmedUrl;
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
            let captureUrl = currentUrl;
            try {
                if (iframeRef.current?.contentWindow) {
                    const iframeUrl = iframeRef.current.contentWindow.location.href;
                    if (iframeUrl.includes('/api/proxy')) {
                        captureUrl = iframeUrl;
                    }
                }
            } catch (e) {
                console.warn("Could not access iframe URL:", e);
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
                <Button variant="outline" className="h-12 gap-2 border-border/50 hover:border-primary/50 transition-all rounded-2xl px-5 group">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:rotate-12 transition-all duration-300">
                        <Search className="w-3.5 h-3.5 text-primary group-hover:text-white" />
                    </div>
                    <span className="font-semibold text-foreground">Buscar Canción</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-[100vw] w-full lg:max-w-[1600px] h-[100dvh] lg:h-[95vh] flex flex-col p-0 gap-0 overflow-hidden bg-background lg:rounded-[3rem] border-primary/10 shadow-3xl lg:my-4">
                <DialogHeader className="px-6 py-5 border-b border-border/50 flex-shrink-0 bg-secondary/20">
                    <DialogTitle className="text-xl md:text-2xl font-bold flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center shadow-lg">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-foreground leading-tight">Buscador Inteligente</span>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">IA Powers Enabled</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <TabsList className="grid w-full grid-cols-2 h-12 md:h-14 bg-secondary/30 p-1 rounded-none flex-shrink-0">
                        <TabsTrigger
                            value="auto"
                            className="gap-2 text-xs md:text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-xl transition-all"
                        >
                            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                            AUTOMÁTICO
                        </TabsTrigger>
                        <TabsTrigger
                            value="manual"
                            className="gap-2 text-xs md:text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-xl transition-all"
                        >
                            <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                            NAVEGADOR
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Auto Search */}
                    <TabsContent value="auto" className="flex-1 flex flex-col gap-6 md:gap-10 mt-0 w-full overflow-y-auto p-5 md:p-12 pb-40 data-[state=inactive]:hidden data-[state=active]:flex">
                        <div className="w-full space-y-8 md:space-y-12">
                            <div className="bg-primary/5 border border-primary/20 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 flex items-start gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[1.25rem] bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground text-base md:text-lg">Búsqueda Predictiva</h4>
                                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mt-1">
                                        Nuestra IA buscará la letra, acordes y enlaces de video automáticamente.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 md:space-y-4">
                                <label className="text-[10px] md:text-sm font-black text-primary uppercase tracking-[0.2em] ml-2">
                                    Título / Artista
                                </label>
                                <div className="relative group">
                                    <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        placeholder="Ej: Way Maker..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleAutoSearch()}
                                        className="text-base md:text-xl h-14 md:h-20 pl-12 md:pl-16 pr-6 bg-secondary/30 border-transparent focus:bg-background focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all rounded-[1.25rem] md:rounded-[1.5rem] shadow-none font-medium"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleAutoSearch}
                                disabled={isSearching}
                                className="w-full btn-premium gap-3 h-12 md:h-16 text-base md:text-lg font-bold"
                                size="lg"
                            >
                                {isSearching ? (
                                    <>
                                        <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                                        PROCESANDO...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5 md:w-6 md:h-6" />
                                        ENCONTRAR CANCIÓN
                                    </>
                                )}
                            </Button>

                            <div className="pt-4 md:pt-6 border-t border-border/50">
                                <h4 className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground mb-3 md:mb-4 text-center">IA Powers Enabled</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                    {["LaCuerda.net", "Letras.com", "CifraClub", "Genius"].map(site => (
                                        <div key={site} className="px-3 py-1.5 bg-secondary/50 rounded-lg text-[9px] md:text-[10px] font-bold text-center text-muted-foreground uppercase">
                                            {site}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Web Browser */}
                    <TabsContent value="manual" className="flex-1 flex flex-col gap-0 mt-0 min-h-0 data-[state=inactive]:hidden data-[state=active]:flex">
                        {/* Navigation bar */}
                        <div className="flex flex-col gap-3 flex-shrink-0 bg-background p-4 border-b border-border/50">
                            <div className="flex gap-3 items-center">
                                <div className="flex bg-secondary/50 p-1 rounded-xl">
                                    <Button onClick={() => handleIframeAction('back')} variant="ghost" size="icon" className="h-9 w-9 hover:bg-background rounded-lg">
                                        <ArrowLeft className="w-5 h-5 text-foreground" />
                                    </Button>
                                    <Button onClick={() => handleIframeAction('forward')} variant="ghost" size="icon" className="h-9 w-9 hover:bg-background rounded-lg">
                                        <ArrowRight className="w-5 h-5 text-foreground" />
                                    </Button>
                                    <Button onClick={() => handleIframeAction('reload')} variant="ghost" size="icon" className="h-9 w-9 hover:bg-background rounded-lg">
                                        <RotateCw className="w-4 h-4 text-foreground" />
                                    </Button>
                                </div>
                                <div className="flex-1 relative flex items-center group">
                                    <Globe className="absolute left-4 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        value={browserUrl}
                                        onChange={(e) => setBrowserUrl(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleBrowserNavigate()}
                                        placeholder="Busca en Google o pega un enlace..."
                                        className="w-full h-11 pl-11 pr-14 bg-secondary/50 border-transparent focus:bg-background focus:ring-4 focus:ring-primary/5 rounded-xl text-sm font-medium transition-all"
                                    />
                                    <Button
                                        onClick={handleBrowserNavigate}
                                        className="absolute right-1.5 h-8 px-4 bg-primary text-white text-[10px] font-black uppercase rounded-lg hover:shadow-lg transition-all"
                                    >
                                        IR
                                    </Button>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="flex gap-2 items-center overflow-x-auto no-scrollbar py-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const url = "https://www.lacuerda.net/";
                                        setBrowserUrl(url);
                                        setCurrentUrl(`/api/proxy?url=${encodeURIComponent(url)}`);
                                    }}
                                    className="h-8 px-4 rounded-full border-border/50 text-[10px] font-bold uppercase tracking-widest shrink-0"
                                >
                                    LaCuerda
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const url = "https://www.letras.com/";
                                        setBrowserUrl(url);
                                        setCurrentUrl(`/api/proxy?url=${encodeURIComponent(url)}`);
                                    }}
                                    className="h-8 px-4 rounded-full border-border/50 text-[10px] font-bold uppercase tracking-widest shrink-0"
                                >
                                    Letras.com
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const url = "https://www.cifraclub.com/";
                                        setBrowserUrl(url);
                                        setCurrentUrl(`/api/proxy?url=${encodeURIComponent(url)}`);
                                    }}
                                    className="h-8 px-4 rounded-full border-border/50 text-[10px] font-bold uppercase tracking-widest shrink-0"
                                >
                                    CifraClub
                                </Button>
                            </div>
                        </div>

                        {/* Browser Container */}
                        <div className="flex-1 bg-white relative min-h-0">
                            <iframe
                                ref={iframeRef}
                                src={currentUrl}
                                className="w-full h-full"
                                title="Navegador de letras"
                                scrolling="yes"
                            />

                            {/* Floating Action Bar inside browser */}
                            <div className="absolute bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pointer-events-none">
                                <Button
                                    onClick={handleCapture}
                                    disabled={isCapturing}
                                    className="w-full gap-3 btn-gold h-14 text-base font-bold pointer-events-auto shadow-2xl"
                                    size="lg"
                                >
                                    {isCapturing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            ANALIZANDO CONTENIDO...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-6 h-6" />
                                            CAPTURAR ESTA PÁGINA
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

