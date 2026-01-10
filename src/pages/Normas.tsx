import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import {
  Plus,
  BookOpen,
  Edit,
  Trash2,
  Loader2
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
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-500">Error al cargar las normas</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Normas del Ministerio 📋
            </h1>
            <p className="text-muted-foreground mt-1">
              Directrices y reglas para el buen funcionamiento del ministerio
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Norma
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nueva Norma</DialogTitle>
                <DialogDescription>Establezca una nueva norma para el ministerio.</DialogDescription>
              </DialogHeader>
              <p className="text-muted-foreground">Formulario de norma próximamente...</p>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Rules by Category */}
        {!isLoading && rulesByCategory && (
          <div className="space-y-8">
            {Object.keys(rulesByCategory).length === 0 ? (
              <div className="text-center py-12 card-elevated">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No hay normas registradas</p>
                <Button
                  className="btn-gold"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Norma
                </Button>
              </div>
            ) : (
              Object.entries(rulesByCategory).map(([category, rules], categoryIndex) => (
                <div key={category} className="slide-up" style={{ animationDelay: `${categoryIndex * 100}ms` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={categoryColors[category as keyof typeof categoryColors] || categoryColors.General}>
                      {category}
                    </Badge>
                    <div className="h-px bg-border flex-1" />
                  </div>

                  <div className="space-y-4">
                    {rules.map((rule, ruleIndex) => (
                      <div
                        key={rule.id}
                        className="card-elevated p-6 group"
                        style={{ animationDelay: `${(categoryIndex * 100) + (ruleIndex * 50)}ms` }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-foreground">
                            {rule.title}
                          </h3>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingRule(rule)}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Editar Norma</DialogTitle>
                                  <DialogDescription>Modifique el contenido de la norma.</DialogDescription>
                                </DialogHeader>
                                <p className="text-muted-foreground">Formulario de edición próximamente...</p>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRule(rule)}
                              disabled={deleteRule.isPending}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-muted-foreground leading-relaxed mb-3">
                          {rule.content}
                        </p>

                        {rule.created_by_member && (
                          <p className="text-xs text-muted-foreground">
                            Creado por: {rule.created_by_member.name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Spiritual Note */}
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 fade-in">
          <div className="text-center">
            <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
            <p className="text-muted-foreground italic mb-2">
              "Todo se haga decentemente y con orden."
            </p>
            <p className="text-xs text-primary font-medium">
              — 1 Corintios 14:40
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}