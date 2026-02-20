import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Shield, Building2, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type UserRole = 'admin' | 'company_client' | 'employee';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  role: UserRole | null;
  created_at: string;
}

const roleIcons = {
  admin: Shield,
  company_client: Building2,
  employee: User,
};

const roleLabels = {
  admin: 'Amministratore',
  company_client: 'Azienda Cliente',
  employee: 'Dipendente',
};

const roleColors = {
  admin: 'destructive',
  company_client: 'default',
  employee: 'secondary',
} as const;

export const RoleManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  // Fetch users with their roles
  const { data: users, isLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, company_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id)
            .maybeSingle();

          return {
            ...profile,
            role: roleData?.role || null,
          };
        })
      );

      return usersWithRoles as UserWithRole[];
    },
  });

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingRole(userId);

    try {
      // Check if role exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      toast({
        title: "Ruolo aggiornato",
        description: `Ruolo cambiato in ${roleLabels[newRole]}`,
      });

      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il ruolo",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const filteredUsers = users?.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.company_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-foreground">Gestione Ruoli</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Modifica i ruoli degli utenti della piattaforma
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {filteredUsers?.length || 0} utenti
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per email, nome o azienda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Legend */}
        <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-destructive" />
            <span className="text-sm font-semibold">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-foreground" />
            <span className="text-sm font-semibold">Azienda</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Dipendente</span>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold">Utente</TableHead>
                <TableHead className="font-bold">Email</TableHead>
                <TableHead className="font-bold">Azienda</TableHead>
                <TableHead className="font-bold">Ruolo Attuale</TableHead>
                <TableHead className="font-bold text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-muted-foreground">Caricamento...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const RoleIcon = user.role ? roleIcons[user.role] : User;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <RoleIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {user.full_name || 'Senza nome'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {user.company_name ? (
                          <Badge variant="outline">
                            {user.company_name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.role ? (
                          <Badge variant={roleColors[user.role]}>
                            {roleLabels[user.role]}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Nessun ruolo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={user.role || ''}
                          onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                          disabled={updatingRole === user.id}
                        >
                          <SelectTrigger className="w-[200px] ml-auto">
                            <SelectValue placeholder="Seleziona ruolo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Amministratore
                              </div>
                            </SelectItem>
                            <SelectItem value="company_client">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Azienda Cliente
                              </div>
                            </SelectItem>
                            <SelectItem value="employee">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Dipendente
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nessun utente trovato
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Stats Footer */}
        {filteredUsers && filteredUsers.length > 0 && (
          <div className="flex gap-4 pt-4 border-t">
            {['admin', 'company_client', 'employee'].map((role) => {
              const count = filteredUsers.filter((u) => u.role === role).length;
              const Icon = roleIcons[role as UserRole];
              
              return (
                <div key={role} className="flex items-center gap-2 text-sm">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{count}</span>
                  <span className="text-muted-foreground">
                    {roleLabels[role as UserRole]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
