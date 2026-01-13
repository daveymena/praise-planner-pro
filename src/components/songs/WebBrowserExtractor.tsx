import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Globe, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface WebBrowserExtractorProps {
    onExtract: (data: {
        lyrics: string;
        chords: string;
        name: string;
        key: string;
        youtubeUrl: string;
    }) => void;
}

export function WebBrowserExtractor({ onExtract }: WebBrowserExtractorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState("https://www.lacuerda.net/");
    const [currentUrl, setCurrentUrl] = useState("https://www.lacuerda.net/");
    const [isLoading, setIsLoading] = useState(false);

    const suggestedSites = [
        { name: "LaCuerda.net", url: "https://www.lacuerda.net/" },
        { name: "Letras.com", url: "https://www.letras.com/" },
        { name: "CifraClub", url: "https://www.cifraclub.com/" },
    ];

    const handleNavigate = () => {
        setCurrentUrl(url);
    };

    const handleCaptureAndSave = async () => {
        setIsLoading(true);
        try {
            toast.info("Capturando contenido de la página...");

            // Call backend to extract from the current URL
            const response = await fetch("/api/ai/extract-song", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify({
                    url: currentUrl,
                    type: "url",
                }),
            });

            if (!response.ok) {
                throw new Error("Error al capturar contenido");
            }

            const result = await response.json();

            toast.success("¡Contenido capturado exitosamente!");
            onExtract(result.data);
            setIsOpen(false);

        } catch (error) {
            console.error("Capture error:", error);
            toast.error("No se pudo capturar el contenido de esta página");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(true)}
                className="gap-2"
            >
                <Globe className="w-4 h-4" />
                Buscar en Internet
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Navegador de Letras y Acordes
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 flex-1 min-h-0">
                        {/* URL Bar */}
                        <div className="flex gap-2">
                            <Input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleNavigate()}
                                placeholder="https://www.lacuerda.net/..."
                                className="flex-1"
                            />
                            <Button onClick={handleNavigate} variant="secondary">
                                Ir
                            </Button>
                        </div>

                        {/* Quick Links */}
                        <div className="flex gap-2 flex-wrap">
                            {suggestedSites.map((site) => (
                                <Button
                                    key={site.url}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setUrl(site.url);
                                        setCurrentUrl(site.url);
                                    }}
                                    className="gap-1"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    {site.name}
                                </Button>
                            ))}
                        </div>

                        {/* Browser Frame */}
                        <div className="flex-1 border rounded-lg overflow-hidden bg-white min-h-0">
                            <iframe
                                src={currentUrl}
                                className="w-full h-full"
                                title="Navegador de letras"
                                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 justify-between items-center pt-2 border-t">
                            <div className="text-sm text-muted-foreground">
                                📝 Busca la canción manualmente, cuando la encuentres presiona "Guardar"
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleCaptureAndSave}
                                    disabled={isLoading}
                                    className="gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {isLoading ? "Capturando..." : "Guardar Esta Letra"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
