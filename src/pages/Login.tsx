import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Music, Lock, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login({ email, password });
            toast.success("¡Bienvenido de nuevo!");
            navigate("/");
        } catch (error: any) {
            toast.error(error.message || "Error al iniciar sesión");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Cinematic Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]"></div>

            <div className="w-full max-w-[440px] relative z-10 fade-in">
                {/* Logo Section */}
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] gold-gradient p-5 mb-2 shadow-2xl shadow-primary/20 group hover:scale-105 transition-transform duration-500">
                        <Music className="w-full h-full text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">
                            Harmony<span className="text-primary">.</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/60">
                            Professional Ministry Suite
                        </p>
                    </div>
                </div>

                <div className="card-premium p-10 backdrop-blur-xl bg-card/80 border-primary/10 shadow-3xl">
                    <div className="space-y-3 mb-10 text-center px-4">
                        <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Iniciar Sesión</h2>
                        <p className="text-xs md:text-sm font-medium text-muted-foreground leading-relaxed">
                            Gestiona tu ministerio con herramientas profesionales. Organiza ensayos, repertorio y servicios en un solo lugar.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Correo Institucional</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        className="input-premium pl-12"
                                        placeholder="admin@ministerio.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contraseña</label>
                                    <a href="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Olvide mi clave</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        className="input-premium pl-12"
                                        placeholder="••••••••••••"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 btn-gold shadow-2xl shadow-primary/20 mt-4 rounded-2xl text-base font-black uppercase tracking-widest group"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <span>Entrar al Sistema</span>
                                    <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-border/50">
                        <p className="text-sm text-center text-muted-foreground font-medium">
                            ¿Aún no tienes un ministerio?{" "}
                            <Link to="/register" className="text-primary hover:text-primary/80 font-black uppercase tracking-tight transition-colors">
                                Regístrate Ahora
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-12 text-center space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
                        Handcrafted for Excellence • 2026
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px w-8 bg-border/50" />
                        <div className="w-1 h-1 rounded-full bg-primary/30" />
                        <div className="h-px w-8 bg-border/50" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
