import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface Props {
  companyId: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(220, 70%, 55%)',
  'hsl(280, 60%, 55%)',
  'hsl(340, 65%, 55%)',
  'hsl(160, 55%, 45%)',
];

export const CompletionsByModuleChart = ({ companyId }: Props) => {
  const [data, setData] = useState<{ name: string; completamenti: number; media: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: notifs, error } = await supabase
        .from('admin_notifications')
        .select('module_title, score, max_score')
        .eq('company_id', companyId);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const map = new Map<string, { count: number; totalPct: number }>();
      (notifs || []).forEach(n => {
        const entry = map.get(n.module_title) || { count: 0, totalPct: 0 };
        entry.count++;
        entry.totalPct += n.max_score > 0 ? Math.round((n.score / n.max_score) * 100) : 0;
        map.set(n.module_title, entry);
      });

      const result = Array.from(map.entries()).map(([name, v]) => ({
        name: name.length > 20 ? name.slice(0, 18) + '…' : name,
        completamenti: v.count,
        media: v.count > 0 ? Math.round(v.totalPct / v.count) : 0,
      }));

      result.sort((a, b) => b.completamenti - a.completamenti);
      setData(result);
      setLoading(false);
    };
    fetch();
  }, [companyId]);

  const exportToExcel = () => {
    if (data.length === 0) return;
    const rows = data.map(d => ({ 'Modulo': d.name, 'Completamenti': d.completamenti, 'Media Punteggio (%)': d.media }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Completamenti per Modulo');
    XLSX.writeFile(wb, `completamenti-per-modulo-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Report esportato');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Completamenti per Modulo
          </CardTitle>
          {data.length > 0 && (
            <Button variant="ghost" size="sm" onClick={exportToExcel} title="Esporta in Excel">
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Caricamento...</div>
        ) : data.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 text-sm">
            Nessun completamento registrato
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                formatter={(value: number, name: string) =>
                  name === 'completamenti' ? [`${value}`, 'Completamenti'] : [`${value}%`, 'Media punteggio']
                }
              />
              <Bar dataKey="completamenti" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
