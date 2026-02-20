import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Mail, Calendar, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Employee {
  user_id: string;
  full_name: string;
  email: string;
  created_at: string;
  sessions_count: number;
  avg_score: number;
}

interface EmployeesTableProps {
  companyId: string;
}

export const EmployeesTable = ({ companyId }: EmployeesTableProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, [companyId]);

  useEffect(() => {
    const filtered = employees.filter(
      (emp) =>
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Get all users linked to this company with employee role
      const { data: companyUsers, error: companyUsersError } = await supabase
        .from('company_users')
        .select('user_id')
        .eq('company_id', companyId);

      if (companyUsersError) throw companyUsersError;

      if (!companyUsers || companyUsers.length === 0) {
        setEmployees([]);
        setLoading(false);
        return;
      }

      const userIds = companyUsers.map((cu) => cu.user_id);

      // Get profiles for these users with employee role
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Get their roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds)
        .eq('role', 'employee');

      if (rolesError) throw rolesError;

      const employeeIds = roles?.map((r) => r.user_id) || [];

      // Get demo sessions stats
      const { data: sessions, error: sessionsError } = await supabase
        .from('demo_sessions')
        .select('user_id, score, max_score')
        .in('user_id', employeeIds);

      if (sessionsError) throw sessionsError;

      // Calculate stats per employee
      const employeesData = profiles
        ?.filter((p) => employeeIds.includes(p.id))
        .map((profile) => {
          const userSessions = sessions?.filter((s) => s.user_id === profile.id) || [];
          const sessionsCount = userSessions.length;
          const avgScore =
            sessionsCount > 0
              ? Math.round(
                  (userSessions.reduce((sum, s) => sum + (s.score / s.max_score) * 100, 0) /
                    sessionsCount)
                )
              : 0;

          return {
            user_id: profile.id,
            full_name: profile.full_name || 'N/A',
            email: profile.email,
            created_at: profile.created_at,
            sessions_count: sessionsCount,
            avg_score: avgScore,
          };
        }) || [];

      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Errore nel caricamento dei dipendenti');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Dipendenti</h3>
          <p className="text-sm text-muted-foreground">
            Gestisci i dipendenti della tua azienda
          </p>
        </div>
        <Button variant="hero" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Invita Dipendente
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'Nessun dipendente trovato' : 'Nessun dipendente ancora registrato'}
          </p>
          {!searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              Invita i tuoi dipendenti a registrarsi sulla piattaforma
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dipendente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Data Registrazione</TableHead>
                <TableHead className="text-center">Sessioni</TableHead>
                <TableHead className="text-center">Punteggio Medio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.user_id}>
                  <TableCell className="font-medium">{employee.full_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {employee.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(employee.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{employee.sessions_count}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        employee.avg_score >= 80
                          ? 'default'
                          : employee.avg_score >= 60
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {employee.avg_score}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};
