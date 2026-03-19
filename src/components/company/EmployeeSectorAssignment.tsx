import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Shield, AlertTriangle, CheckCircle2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { RiskSector } from '@/hooks/useRiskSector';
import { SECTOR_INFO } from '@/hooks/useRiskSector';

interface EmployeeSector {
  user_id: string;
  full_name: string;
  email: string;
  sector: RiskSector | null;
  is_self_assigned: boolean;
}

interface Props {
  companyId: string;
}

export const EmployeeSectorAssignment = ({ companyId }: Props) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<EmployeeSector[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployeesWithSectors();
  }, [companyId]);

  const fetchEmployeesWithSectors = async () => {
    setLoading(true);
    try {
      const { data: companyUsers } = await supabase
        .from('company_users')
        .select('user_id')
        .eq('company_id', companyId);

      if (!companyUsers?.length) { setEmployees([]); setLoading(false); return; }

      const userIds = companyUsers.map(cu => cu.user_id);

      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('user_id', userIds)
        .eq('role', 'employee');

      const employeeIds = roles?.map(r => r.user_id) || [];
      if (!employeeIds.length) { setEmployees([]); setLoading(false); return; }

      const [{ data: profiles }, { data: sectors }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').in('id', employeeIds),
        supabase.from('user_risk_sectors').select('user_id, sector, is_self_assigned').in('user_id', employeeIds),
      ]);

      const sectorMap = new Map(sectors?.map(s => [s.user_id, s]) || []);

      const result: EmployeeSector[] = (profiles || []).map(p => {
        const s = sectorMap.get(p.id);
        return {
          user_id: p.id,
          full_name: p.full_name || 'N/A',
          email: p.email,
          sector: (s?.sector as RiskSector) || null,
          is_self_assigned: s?.is_self_assigned ?? false,
        };
      });

      setEmployees(result);
    } catch (err) {
      console.error(err);
      toast.error('Errore nel caricamento dei settori');
    } finally {
      setLoading(false);
    }
  };

  const assignSector = async (userId: string, sector: RiskSector) => {
    if (!user) return;
    setSaving(userId);
    try {
      const { error } = await supabase
        .from('user_risk_sectors')
        .upsert({
          user_id: userId,
          sector,
          is_self_assigned: false,
          assigned_by: user.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      setEmployees(prev => prev.map(e =>
        e.user_id === userId ? { ...e, sector, is_self_assigned: false } : e
      ));
      toast.success(`Settore ${SECTOR_INFO[sector].label} assegnato`);
    } catch (err) {
      console.error(err);
      toast.error('Errore nell\'assegnazione del settore');
    } finally {
      setSaving(null);
    }
  };

  const getSectorBadge = (emp: EmployeeSector) => {
    if (!emp.sector) {
      return (
        <Badge variant="outline" className="gap-1 text-muted-foreground">
          <AlertTriangle className="w-3 h-3" />
          Non assegnato
        </Badge>
      );
    }
    const info = SECTOR_INFO[emp.sector];
    return (
      <Badge variant={emp.is_self_assigned ? 'secondary' : 'default'} className="gap-1">
        <CheckCircle2 className="w-3 h-3" />
        {info.label}
        {emp.is_self_assigned && <span className="text-[10px] opacity-70">(auto)</span>}
      </Badge>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-xl font-bold">Assegnazione Settore di Rischio</h3>
          <p className="text-sm text-muted-foreground">
            Assegna il settore di formazione specifica a ciascun dipendente
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
      ) : employees.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nessun dipendente trovato</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dipendente</TableHead>
                <TableHead>Settore Attuale</TableHead>
                <TableHead>Assegna Settore</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(emp => (
                <TableRow key={emp.user_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{emp.full_name}</p>
                      <p className="text-xs text-muted-foreground">{emp.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getSectorBadge(emp)}</TableCell>
                  <TableCell>
                    <Select
                      value={emp.sector || ''}
                      onValueChange={(val) => assignSector(emp.user_id, val as RiskSector)}
                      disabled={saving === emp.user_id}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Seleziona settore..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(SECTOR_INFO) as [RiskSector, typeof SECTOR_INFO[RiskSector]][]).map(([key, info]) => (
                          <SelectItem key={key} value={key}>
                            <span className={info.color}>{info.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">({info.hours}h)</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
