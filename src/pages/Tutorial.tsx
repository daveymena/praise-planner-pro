import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
    Music,
    Mic2,
    Users,
    Church,
    Sparkles,
    ArrowRight,
    CheckCircle2,
    PlayCircle,
    Search,
    BookOpen,
    Calendar as CalendarIcon
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tutorialSteps = [
    {
        id: "repertorio",
        title: "Gestiona tu Repertorio",
        description: "El corazón de tu ministerio. Aprende a encontrar y organizar tus cantos con herramientas de IA y video.",
        icon: Music,
        color: "primary",
        features: [
            "Búsqueda unificada en bases de datos cristianas",
            "Extracción automática de letra y acordes",
            "Visor dinámico con video de YouTube integrado",
            "Marcadores de regiones (Coro, Verso) para ensayos claros"
        ],
        tip: "Usa el buscador para traer canciones completas en segundos."
    },
    {
        id: "ensayos",
        title: "Ensayos Efectivos",
        description: "No más ensayos improvisados. Planifica cada sesión con objetivos y lista de cantos.",
        icon: Mic2,
        color: "indigo-500",
        features: [
            "Programación de ensayos semanales",
            "Asignación de canciones a ensayar",
            "Notificaciones para el equipo",
            "Control de asistencia y puntualidad"
        ],
        tip: "Define el tono de la canción antes del ensayo para ganar tiempo."
    },
    {
        id: "servicios",
        title: "Servicios y Liturgia",
        description: "Organiza el orden del culto y asegura que cada integrante sepa su parte.",
        icon: Church,
        color: "teal-500",
        features: [
            "Creación de servicios dominicales y especiales",
            "Orden del culto interactivo",
            "Listado de canciones por momento (Alabanza/Adoración)",
            "Historial de cantos para evitar repeticiones excesivas"
        ],
        tip: "Balancea tu repertorio entre canciones rápidas y de adoración."
    },
    {
        id: "equipo",
        title: "Unidad del Equipo",
        description: "Gestiona a tus músicos y cantantes de forma centralizada.",
        icon: Users,
        color: "amber-500",
        features: [
            "Perfiles de integrantes y sus instrumentos",
            "Roles del ministerio (Director, Músico, Vocal)",
            "Manual de normas y visión ministerial",
            "Comunicación directa y agenda compartida"
        ],
        tip: "Mantén actualizado el manual de normas para una visión unificada."
    }
];

export default function Tutorial() {
    const [activeStep, setActiveStep] = useState(0);

    const nextStep = () => {
        if (activeStep < tutorialSteps.length - 1) {
            setActiveStep(activeStep + 1);
        }
    };

    const prevStep = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
        }
    };

    const currentStep = tutorialSteps[activeStep];
    const Icon = currentStep.icon;

    return (
        <Layout>
            <div className="max-w-5xl mx-auto pb-20">
                {/* Header Section */}
                <div className="text-center space-y-4 mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
                        <Sparkles className="w-4 h-4" />
                        Guía Interactiva
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
                        Domina tu <span className="text-primary">Ministerio</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                        Descubre cómo Praise Planner Pro potencia la excelencia en tu servicio musical a través de esta guía paso a paso.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-4 space-y-3">
                        {tutorialSteps.map((step, index) => (
                            <button
                                key={step.id}
                                onClick={() => setActiveStep(index)}
                                className={`w-full flex items-center gap-4 p-5 rounded-3xl transition-all duration-500 border ${activeStep === index
                                        ? "bg-primary text-white shadow-xl shadow-primary/20 border-primary scale-[1.02]"
                                        : "bg-card/50 text-muted-foreground border-border/40 hover:bg-secondary/50"
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeStep === index ? "bg-white/20" : "bg-primary/10"
                                    }`}>
                                    <step.icon className={`w-5 h-5 ${activeStep === index ? "text-white" : "text-primary"}`} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Paso {index + 1}</p>
                                    <p className="font-bold text-sm tracking-tight">{step.title}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="glass-card p-8 md:p-12 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                    <Icon className="w-64 h-64" />
                                </div>

                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">
                                                {currentStep.title}
                                            </h2>
                                            <p className="text-muted-foreground font-medium">
                                                Función Principal
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-xl text-foreground/80 leading-relaxed font-medium italic">
                                        "{currentStep.description}"
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {currentStep.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/50">
                                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                <span className="text-sm font-bold text-foreground/70 leading-tight">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                                        <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5" /> Consejo Pro
                                        </p>
                                        <p className="text-sm font-medium text-foreground/80">
                                            {currentStep.tip}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-border/40">
                                        <Button
                                            variant="ghost"
                                            onClick={prevStep}
                                            disabled={activeStep === 0}
                                            className="font-bold text-xs uppercase tracking-widest text-muted-foreground disabled:opacity-0"
                                        >
                                            Anterior
                                        </Button>
                                        <div className="flex gap-1">
                                            {tutorialSteps.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === activeStep ? "w-8 bg-primary" : "w-2 bg-border"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <Button
                                            onClick={nextStep}
                                            disabled={activeStep === tutorialSteps.length - 1}
                                            className="btn-premium px-8 font-black text-xs uppercase tracking-widest h-12 shadow-lg shadow-primary/20 disabled:opacity-0"
                                        >
                                            Siguiente Paso <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="mt-20 text-center glass-card p-12 bg-gradient-to-br from-primary to-indigo-700 text-white border-none shadow-2xl">
                    <Sparkles className="w-12 h-12 text-amber-300 mx-auto mb-6 animate-pulse" />
                    <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">¿Listo para comenzar?</h3>
                    <p className="text-white/80 max-w-md mx-auto mb-8 font-medium">
                        Ya tienes el conocimiento básico. Ahora es momento de llevar tu alabanza al siguiente nivel de excelencia.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button className="bg-white text-primary hover:bg-white/90 font-black h-14 px-10 rounded-2xl shadow-xl">
                            Ir al Dashboard
                        </Button>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-14 px-10 rounded-2xl font-bold">
                            Explorar Repertorio
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
