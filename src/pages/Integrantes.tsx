import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MemberForm } from "@/components/forms/MemberForm";
import {
  Plus,
  Search,
  Users,
  Mail,
  Phone,
  Music,
  Mic,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useMembers, useDeleteMember } from "@/hooks/useMembers";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Member = Database['public']['Tables']['members']['Row'];

const roleColors = {
  "Director": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "Vocalista": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Instrumentista": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "Técnico": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Coordinador": "bg-red-500/10 text-red-600 border-red-500/20",
};

const roleIcons = {
  "Director": Music,
  "Vocalista": Mic,
  "Instrumentista": Music,
  "Técnico": Users,
  "Coordinador": Users,
};

export default function Integrantes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const { data: members, isLoading, error } = useMembers();
  const deleteMember = useDeleteMember();

  const handleDeleteMember = async (member: Member) => {
    if (!confirm(`¿Estás seguro de eliminar a "${member.name}"?`)) return;

    try {
      await deleteMember.mutateAsync(member.id);
      toast.success("Integrante eliminado exitosamente");
    } catch (error) {
      toast.error("Error al eliminar el integrante");
    }
  };

  const filteredMembers = members?.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || member.role === selectedRole;
    return matchesSearch && matchesRole;
  }) || [];

  const roles = ["Director", "Vocalista", "Instrumentista", "Técnico", "Coordinador"];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-500">Error al cargar los integrantes</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Integrantes 👥
            </h1>
            <p className="text-muted-foreground mt-1">
              {isLoading ? "Cargando..." : `${members?.length || 0} integrantes activos`}
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Integrante
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nuevo Integrante</DialogTitle>
                <DialogDescription>Registre un nuevo miembro en el ministerio.</DialogDescription>
              </DialogHeader>
              <MemberForm
                onSuccess={() => setIsCreateDialogOpen(false)}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="card-elevated p-4 mb-6 fade-in">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                className="pl-10 input-warm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div className="flex flex-wrap gap-2">
              {roles.map(role => (
                <Button
                  key={role}
                  variant={selectedRole === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                  className={selectedRole === role ? "btn-gold" : ""}
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Members Grid */}
        {!isLoading && members && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member, index) => {
              const RoleIcon = roleIcons[member.role];
              return (
                <div
                  key={member.id}
                  className="card-elevated p-6 slide-up group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {member.name}
                      </h3>
                      <Badge className={`mt-1 ${roleColors[member.role as keyof typeof roleColors] || ''}`}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {member.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {member.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {(member.instruments && member.instruments.length > 0) || member.voice_type ? (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {member.instruments?.map((instrument, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {instrument}
                          </Badge>
                        ))}
                        {member.voice_type && (
                          <Badge variant="outline" className="text-xs">
                            {member.voice_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Notes */}
                  {member.notes && (
                    <p className="text-xs text-muted-foreground italic bg-secondary/50 p-2 rounded-lg mb-4">
                      "{member.notes}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setEditingMember(member)}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Editar Integrante</DialogTitle>
                          <DialogDescription>Actualice la información del integrante.</DialogDescription>
                        </DialogHeader>
                        <MemberForm
                          member={editingMember}
                          onSuccess={() => setEditingMember(null)}
                          onCancel={() => setEditingMember(null)}
                        />
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMember(member)}
                      disabled={deleteMember.isPending}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {members?.length === 0 ? "No hay integrantes registrados" : "No se encontraron integrantes"}
            </p>
            {members?.length === 0 && (
              <Button
                className="mt-4 btn-gold"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primer Integrante
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}