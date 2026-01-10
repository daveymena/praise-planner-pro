import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Clock,
  Users,
  Shirt,
  Heart,
  BookOpen,
  Music,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";

interface Rule {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const rules: Rule[] = [
  {
    id: 1,
    title: "Puntualidad",
    description: "Llegar al menos 15 minutos antes de los ensayos y servicios. El tiempo es un recurso valioso y el respeto hacia los demás comienza con la puntualidad.",
    icon: Clock
  },
  {
    id: 2,
    title: "Asistencia",
    description: "Mantener una asistencia mínima del 80% a los ensayos. En caso de no poder asistir, avisar con anticipación al director. La constancia es clave para la excelencia.",
    icon: Users
  },
  {
    id: 3,
    title: "Vestimenta",
    description: "Usar ropa apropiada y modesta para los servicios. El ministerio representa a Cristo, nuestra apariencia debe reflejar respeto y dignidad.",
    icon: Shirt
  },
  {
    id: 4,
    title: "Actitud en el Altar",
    description: "Mantener una actitud de adoración genuina. No somos artistas sino adoradores. El enfoque siempre debe estar en glorificar a Dios, no en nosotros mismos.",
    icon: Heart
  },
  {
    id: 5,
    title: "Preparación Personal",
    description: "Estudiar las canciones antes de los ensayos. Conocer la letra, acordes y estructura. La preparación individual beneficia a todo el grupo.",
    icon: BookOpen
  },
  {
    id: 6,
    title: "Vida Devocional",
    description: "Mantener una vida de oración y comunión con Dios activa. No podemos ministrar lo que no vivimos. La adoración comienza en lo secreto.",
    icon: Music
  }
];

export default function Normas() {
  const [accepted, setAccepted] = useState(false);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 fade-in">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">
            Normas del Ministerio 📝
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Lineamientos para servir con excelencia y mantener la unidad del equipo de alabanza.
          </p>
        </div>

        {/* Spiritual Quote */}
        <div className="card-elevated p-8 mb-8 text-center fade-in bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <p className="text-lg text-foreground italic font-serif">
            "Hágase todo decentemente y con orden"
          </p>
          <p className="text-primary font-medium mt-2">
            — 1 Corintios 14:40
          </p>
        </div>

        {/* Rules */}
        <div className="space-y-4 mb-8">
          {rules.map((rule, index) => {
            const Icon = rule.icon;
            
            return (
              <div 
                key={rule.id}
                className="card-elevated p-6 slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {rule.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Note */}
        <div className="card-elevated p-6 mb-8 border-amber-500/30 bg-amber-500/5">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            ⚠️ Recordatorio Importante
          </h3>
          <p className="text-muted-foreground text-sm">
            El ministerio de alabanza no es solo un talento, es un llamado. Cada integrante es 
            responsable de mantener una vida íntegra que respalde su servicio. Si atraviesas 
            dificultades personales, acércate al liderazgo para recibir apoyo.
          </p>
        </div>

        {/* Acceptance */}
        <div className="card-elevated p-6 slide-up">
          <div className="flex items-start gap-4">
            <Checkbox 
              id="accept" 
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
              className="mt-1"
            />
            <div className="flex-1">
              <label 
                htmlFor="accept" 
                className="text-foreground font-medium cursor-pointer"
              >
                He leído y acepto las normas del ministerio
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Al aceptar, me comprometo a seguir estos lineamientos y a servir con excelencia.
              </p>
            </div>
          </div>

          <Button 
            className={`w-full mt-6 ${accepted ? 'btn-gold' : ''}`}
            disabled={!accepted}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirmar Compromiso
          </Button>
        </div>

        {/* Footer Quote */}
        <div className="text-center mt-12 py-8 border-t border-border/50">
          <p className="text-muted-foreground italic">
            🕊️ "La app ordena para que el Espíritu fluya mejor"
          </p>
        </div>
      </div>
    </Layout>
  );
}
