import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import {
  Plus,
  BookOpen,
  Edit,
  Trash2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useMinistryRulesByCategory, useDeleteMinistryRule } from "@/hooks/useMinistryRules";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type MinistryRule = Database['public']['Tables']['ministry_rules']['Row'] & {
  created_by_member: { name: string } | null;
};

const categoryColors = {
  "Ensayos": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Servicios": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "General": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "Instrumentos": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Espiritual": "bg-red-500/10 text-red-600 border-red-500/20",
  "Vestimenta": "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

export default function Normas() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<MinistryRule | null>(null);

  const { data: rulesByCategory, isLoading, error } = useMinistryRulesByCategory();
  const deleteRule = useDeleteMinistryRule();

  const handleDeleteRule = async (rule: MinistryRule) => {
    if (!confirm(`¿Estás seguro de eliminar "${rule.title}"?`)) return;

    try {
      await deleteRule.mutateAsync(rule.id);
      toast.success("Norma eliminada exitosamente");
    } catch (error) {
      toast.error("Error al eliminar la norma");
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center p-12 bg-destructive/5 rounded-[2rem] border border-destructive/20 max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive">Error de Sistema</h2>
            <p className="text-muted-foreground mt-2">No pudimos cargar el manual de normas.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 space-y-12 pb-32 lg:pb-12">
        {/* Header Section */}
        <div className="text-center space-y-4 fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 mb-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Manual Ministerial</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter">
            Estatutos y Normas
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto font-medium leading-relaxed">
            Directrices fundamentales para la excelencia y el orden en cada área de nuestro servicio al Señor.
          </p>

          <div className="pt-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-gold h-12 px-8 rounded-2xl shadow-xl shadow-primary/10 group">
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Nueva Directriz
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl rounded-[2rem] p-0 border-primary/20">
                <DialogHeader className="p-8 border-b bg-secondary/20">
                  <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tight">Agregar Norma</DialogTitle>
                  <DialogDescription>Establezca una nueva regla para el buen funcionamiento del equipo.</DialogDescription>
                </DialogHeader>
                <div className="p-8 flex flex-col items-center justify-center min-h-[200px]">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                    <Edit className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.1em]">Módulo en Desarrollo</p>
                  <p className="text-xs text-muted-foreground mt-1">El formulario de gestión estará disponible en la próxima actualización.</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 rounded-[2.5rem] bg-secondary/30 animate-pulse" />
            ))}
          </div>
        )}

        {/* Rules by Category */}
        {!isLoading && rulesByCategory && (
          <div className="space-y-16">
            {Object.keys(rulesByCategory).length === 0 ? (
              <div className="text-center py-24 px-4 bg-secondary/10 rounded-[3rem] border border-dashed border-border/60">
                <div className="w-24 h-24 rounded-[2rem] bg-secondary/50 flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Libro en Blanco</h3>
                <p className="text-muted-foreground mt-2 font-medium">Aún no se han registrado estatutos en esta plataforma.</p>
              </div>
            ) : (
              Object.entries(rulesByCategory).map(([category, rules], categoryIndex) => (
                <div key={category} className="slide-up space-y-6" style={{ animationDelay: `${categoryIndex * 150}ms` }}>
                  <div className="flex items-center gap-4">
                    <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] whitespace-nowrap">
                      {category}
                    </h2>
                    <div className="h-0.5 bg-primary/20 flex-1 rounded-full" />
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {(rules as any[]).map((rule, ruleIndex) => (
                      <div
                        key={rule.id}
                        className="group card-premium p-8 relative overflow-hidden"
                        style={{ animationDelay: `${(categoryIndex * 150) + (ruleIndex * 50)}ms` }}
                      >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                          <BookOpen className="w-24 h-24 rotate-12" />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                          <div className="space-y-3 flex-1">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                              {rule.title}
                            </h3>
                            <p className="text-muted-foreground font-serif leading-relaxed text-lg italic">
                              "{rule.content}"
                            </p>
                          </div>

                          <div className="flex sm:flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-xl bg-background border-border/50 shadow-sm"
                              onClick={() => setEditingRule(rule)}
                            >
                              <Edit className="w-4 h-4 text-primary" />
                            </Button>

                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-xl bg-background border-border/50 shadow-sm hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
                              onClick={() => handleDeleteRule(rule)}
                              disabled={deleteRule.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {rule.created_by_member && (
                          <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              Autoritas: <span className="text-foreground">{rule.created_by_member.name}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Biblical Quote Footer */}
        <div className="pt-12 fade-in">
          <div className="relative p-12 text-center group">
            <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -rotate-1 group-hover:rotate-0 transition-transform duration-700" />
            <div className="absolute inset-0 bg-background border border-primary/10 rounded-[3rem] rotate-1 group-hover:rotate-0 transition-transform duration-700" />

            <div className="relative z-10 space-y-6">
              <BookOpen className="w-10 h-10 text-primary/40 mx-auto" />
              <div className="space-y-2">
                <p className="text-2xl font-serif text-foreground italic px-4">
                  "Todo se haga decentemente y con orden."
                </p>
                <p className="text-xs font-black text-primary uppercase tracking-[0.3em]">
                  — 1 Corintios 14:40
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}