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
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0c14]">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal/10 rounded-full blur-[120px] animate-pulse"></div>

            <div className="w-full max-w-md relative z-10 fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-teal p-3 mb-4 shadow-lg shadow-primary/20">
                        <Music className="w-full h-full text-white" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Harmony</h1>
                    <p className="text-muted-foreground font-medium">Ministry Management App</p>
                </div>

                <Card className="glass-card border-white/10 shadow-2xl overflow-hidden">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center text-white">Iniciar Sesión</CardTitle>
                        <CardDescription className="text-center text-muted-foreground/80">
                            Ingresa tus credenciales para acceder a tu ministerio
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-10 bg-background/80 border-white/20 text-foreground placeholder:text-muted-foreground h-11 focus:ring-primary/30 focus:border-primary/50"
                                        placeholder="correo@ejemplo.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-10 bg-background/80 border-white/20 text-foreground placeholder:text-muted-foreground h-11 focus:ring-primary/30 focus:border-primary/50"
                                        placeholder="Contraseña"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-11 btn-gold shadow-lg shadow-primary/20 mt-2 font-semibold text-lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Entrar al Sistema
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="text-sm text-center text-muted-foreground">
                            ¿No tienes un ministerio?{" "}
                            <Link to="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                                Regístrate aquí
                            </Link>
                        </div>
                    </CardFooter>
                </Card>

                <p className="text-center mt-8 text-xs text-muted-foreground/50 uppercase tracking-widest">
                    Premium SaaS Experience · 2026
                </p>
            </div>
        </div>
    );
};

export default Login;
