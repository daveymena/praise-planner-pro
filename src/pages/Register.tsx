import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Music, User, Mail, Lock, Building, Church, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Register = () => {
    const [formData, setFormData] = useState({
        adminName: "",
        email: "",
        password: "",
        ministryName: "",
        groupType: "coro",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await register(formData);
            toast.success("¡Ministerio creado con éxito!");
            navigate("/");
        } catch (error: any) {
            toast.error(error.message || "Error al crear el ministerio");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0c14]">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal/10 rounded-full blur-[120px] animate-pulse"></div>

            <div className="w-full max-w-lg relative z-10 fade-in py-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-teal p-2 mb-3 shadow-lg shadow-primary/20">
                        <Music className="w-full h-full text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Comienza Hoy</h1>
                    <p className="text-muted-foreground">Crea tu ministerio en Harmony Pro</p>
                </div>

                <Card className="glass-card border-white/10 shadow-2xl overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl text-white">Configuración del Ministerio</CardTitle>
                        <CardDescription className="text-muted-foreground/80">
                            Completa los detalles para tu nueva cuenta administrativa
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4 md:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/70 ml-1">Tu Nombre</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-10 bg-white/5 border-white/10 text-white h-11 focus:ring-primary/30"
                                                placeholder="Ej: Juan Pérez"
                                                value={formData.adminName}
                                                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/70 ml-1">Correo Electrónico</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-10 bg-white/5 border-white/10 text-white h-11 focus:ring-primary/30"
                                                placeholder="admin@ministerio.com"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70 ml-1">Contraseña de Acceso</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-10 bg-white/5 border-white/10 text-white h-11 focus:ring-primary/30"
                                            placeholder="Mínimo 8 caracteres"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-white/5 my-2"></div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70 ml-1">Nombre del Ministerio / Iglesia</label>
                                    <div className="relative">
                                        <Church className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-10 bg-white/5 border-white/10 text-white h-11 focus:ring-primary/30"
                                            placeholder="Ej: Ministerio Alabanza Sión"
                                            value={formData.ministryName}
                                            onChange={(e) => setFormData({ ...formData, ministryName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70 ml-1">Tipo de Agrupación</label>
                                    <Select
                                        value={formData.groupType}
                                        onValueChange={(val) => setFormData({ ...formData, groupType: val })}
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 px-4">
                                            <SelectValue placeholder="Selecciona tipo" />
                                        </SelectTrigger>
                                        <SelectContent className="glass-card border-white/10 text-white">
                                            <SelectItem value="coro">Coro</SelectItem>
                                            <SelectItem value="banda">Banda Instrumental</SelectItem>
                                            <SelectItem value="ministerio">Ministerio Completo</SelectItem>
                                            <SelectItem value="ensamble">Ensamble Vocal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full md:col-span-2 h-12 btn-gold shadow-lg shadow-primary/20 mt-4 font-bold text-lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Crear Ministerio Premium
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-0">
                        <div className="text-sm text-center text-muted-foreground">
                            ¿Ya tienes una cuenta?{" "}
                            <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                                Inicia sesión
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Register;
