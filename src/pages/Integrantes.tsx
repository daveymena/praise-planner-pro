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
  Loader2,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useMembers, useDeleteMember } from "@/hooks/useMembers";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center p-12 bg-destructive/5 rounded-[2rem] border border-destructive/20 max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive">Error de Conexión</h2>
            <p className="text-muted-foreground mt-2">No pudimos cargar la lista de integrantes. Por favor, revisa tu conexión.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-0 sm:px-4 space-y-8 pb-32 lg:pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 sm:px-0 fade-in">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 rounded-full bg-primary" />
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Integrantes
              </h1>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                {isLoading ? "Sincronizando..." : `${members?.length || 0} Miembros Conectados`}
              </p>
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold h-12 px-6 rounded-2xl shadow-xl shadow-primary/10 group">
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Registrar Integrante
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl rounded-[2rem] p-0 border-primary/20 bg-background shadow-2xl">
              <DialogHeader className="p-8 border-b border-border/50 bg-secondary/20">
                <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" /> Nuevo Miembro
                </DialogTitle>
                <DialogDescription>Completa el perfil ministerial del nuevo integrante.</DialogDescription>
              </DialogHeader>
              <div className="p-8">
                <MemberForm
                  onSuccess={() => setIsCreateDialogOpen(false)}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Global Filters */}
        <div className="px-4 sm:px-0">
          <div className="card-elevated p-2 sm:p-3 flex flex-col lg:flex-row gap-4 items-center slide-up">
            <div className="relative w-full flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
              <Input
                placeholder="Buscar por nombre, correo, instrumento..."
                className="h-14 pl-14 pr-6 bg-secondary/30 border-transparent focus:bg-background focus:ring-4 focus:ring-primary/5 rounded-2xl text-lg font-medium transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="hidden lg:flex items-center gap-2 pr-2">
              {roles.slice(0, 3).map(role => (
                <Button
                  key={role}
                  variant="ghost"
                  onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                  className={`h-11 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${selectedRole === role ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-secondary'
                    }`}
                >
                  {role}
                </Button>
              ))}
              <Select onValueChange={(val) => setSelectedRole(val)} value={selectedRole || ""}>
                <SelectTrigger className="h-11 w-40 rounded-xl font-bold text-xs uppercase tracking-widest bg-secondary/50 border-transparent">
                  <SelectValue placeholder="MÁS ROLES" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {roles.map(r => (
                    <SelectItem key={r} value={r} className="font-bold text-xs uppercase tracking-widest">{r}</SelectItem>
                  ))}
                  <SelectItem value="" className="font-bold text-xs uppercase tracking-widest">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 rounded-[2rem] bg-secondary/30 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0 pb-12">
            {filteredMembers.map((member, index) => {
              const RoleIcon = roleIcons[member.role as keyof typeof roleIcons] || Users;
              return (
                <div
                  key={member.id}
                  className="group card-premium p-6 slide-up overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Role Badge - Floating */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className={`rounded-lg text-[9px] font-black uppercase tracking-[0.1em] px-2 py-1 flex items-center gap-1.5 shadow-sm border-none ${roleColors[member.role as keyof typeof roleColors] || ''}`}>
                      <RoleIcon className="w-3 h-3" />
                      {member.role}
                    </Badge>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4 pt-4">
                    <div className="relative p-1 rounded-full border-2 border-primary/20 group-hover:border-primary/50 transition-all duration-500">
                      <Avatar className="w-20 h-20 ring-4 ring-background border border-border/50 shadow-xl">
                        <AvatarImage src={member.avatar_url || undefined} className="object-cover" />
                        <AvatarFallback className="bg-secondary text-primary font-black text-2xl uppercase tracking-tighter">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg gold-gradient border-2 border-background flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                        <Music className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-foreground uppercase tracking-tight leading-tight">
                        {member.name}
                      </h3>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                        {member.voice_type || "Instrumentista"}
                      </p>
                    </div>

                    {/* Contact Pills */}
                    <div className="flex items-center gap-2 pt-2">
                      {member.phone && (
                        <a href={`tel:${member.phone}`} className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="mt-8 pt-6 border-t border-border/50 space-y-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      {member.instruments?.length ? (
                        member.instruments.map((inst, idx) => (
                          <Badge key={idx} variant="outline" className="rounded-full text-[10px] font-bold uppercase tracking-widest bg-secondary/30 border-transparent px-3">
                            {inst}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="rounded-full text-[10px] font-bold uppercase tracking-widest bg-secondary/30 border-transparent px-3 opacity-50">
                          TALENTO VOCAL
                        </Badge>
                      )}
                    </div>

                    {member.notes && (
                      <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 group-hover:bg-primary/10 transition-colors">
                        <p className="text-[10px] font-medium text-foreground/80 italic text-center leading-tight line-clamp-2">
                          "{member.notes}"
                        </p>
                      </div>
                    )}

                    {/* Member Actions - Appears on Hover */}
                    <div className="flex gap-2 pt-2 group-hover:translate-y-0 translate-y-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 h-11 rounded-xl bg-background border-border/50 font-bold text-xs uppercase tracking-widest hover:bg-secondary"
                            onClick={() => setEditingMember(member)}
                          >
                            <Edit className="w-4 h-4 mr-2 text-primary" />
                            Editar Perfil
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-2xl rounded-[2rem] p-0 border-primary/20">
                          <DialogHeader className="p-8 border-b bg-secondary/20">
                            <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tight">Personalizar Perfil</DialogTitle>
                            <DialogDescription>Modifica la información de {member.name}</DialogDescription>
                          </DialogHeader>
                          <div className="p-8">
                            <MemberForm
                              member={editingMember || undefined}
                              onSuccess={() => setEditingMember(null)}
                              onCancel={() => setEditingMember(null)}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-11 w-11 rounded-xl shadow-lg shadow-destructive/10"
                        onClick={() => handleDeleteMember(member)}
                        disabled={deleteMember.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredMembers.length === 0 && (
          <div className="text-center py-24 px-4 bg-secondary/10 rounded-[3rem] border border-dashed border-border/60 max-w-2xl mx-auto">
            <div className="w-24 h-24 rounded-[2rem] bg-secondary/50 flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Users className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Base de Datos Vacía</h3>
            <p className="text-muted-foreground mt-2 font-medium">
              {members?.length === 0 ? "Comienza a construir tu equipo ministerial hoy mismo." : "No se encontró ningún integrante que coincida con tu búsqueda."}
            </p>
            <Button
              className="mt-10 btn-gold h-14 px-10 rounded-2xl text-base shadow-2xl shadow-primary/20"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Registrar Primer Miembro
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}