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
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Cinematic Background Elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>

            <div className="w-full max-w-2xl relative z-10 fade-in py-12">
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gold-gradient p-4 mb-2 shadow-2xl shadow-primary/20 group hover:rotate-12 transition-transform duration-500">
                        <Music className="w-full h-full text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">
                            Únete a <span className="text-primary italic">Harmony</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                            Transformando tu Ministerio con Excelencia
                        </p>
                    </div>
                </div>

                <div className="card-premium p-8 md:p-12 backdrop-blur-xl bg-card/80 border-primary/10 shadow-3xl">
                    <div className="mb-10 flex items-center gap-4">
                        <div className="w-1 h-8 rounded-full bg-primary" />
                        <div>
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Registro de Director / Admin</h2>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Paso 1: Datos de Administración (Cuenta Única)</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tu Nombre Completo</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input
                                            className="input-premium pl-12"
                                            placeholder="Ej: Juan Pérez"
                                            value={formData.adminName}
                                            onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                            required
                                            autoComplete="name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Correo Electrónico</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input
                                            className="input-premium pl-12"
                                            placeholder="admin@ministerio.com"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Seguridad (Clave)</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input
                                            className="input-premium pl-12"
                                            placeholder="Mínimo 8 caracteres"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre del Ministerio</label>
                                    <div className="relative group">
                                        <Church className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input
                                            className="input-premium pl-12"
                                            placeholder="Ministerio Alabanza Sión"
                                            value={formData.ministryName}
                                            onChange={(e) => setFormData({ ...formData, ministryName: e.target.value })}
                                            required
                                            autoComplete="organization"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo de Agrupación</label>
                                    <div className="relative group">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary pointer-events-none transition-colors" />
                                        <select
                                            className="input-premium pl-12 appearance-none cursor-pointer"
                                            value={formData.groupType}
                                            onChange={(e) => setFormData({ ...formData, groupType: e.target.value })}
                                            required
                                        >
                                            <option value="coro">Coro</option>
                                            <option value="banda">Banda Instrumental</option>
                                            <option value="ministerio">Ministerio Completo</option>
                                            <option value="ensamble">Ensamble Vocal</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" /> Beneficio Premium
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                        Incluye acceso ilimitado a IA de composición y gestión de equipo pro.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button
                                type="submit"
                                className="w-full h-14 btn- gold shadow-2xl shadow-primary/20 rounded-2xl text-base font-black uppercase tracking-[0.2em] group"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <span>Crear Ministerio Harmony</span>
                                        <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-45 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-10 pt-8 border-t border-border/50 text-center">
                        <p className="text-sm font-medium text-muted-foreground">
                            ¿Ya formas parte de la comunidad?{" "}
                            <Link to="/login" className="text-primary hover:text-primary/80 font-black uppercase tracking-tight transition-colors">
                                Iniciar Sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
