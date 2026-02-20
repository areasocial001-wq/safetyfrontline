import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface Props {
  companyId: string;
}

const LINE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(220, 70%, 55%)',
  'hsl(280, 60%, 55%)',
  'hsl(340, 65%, 55%)',
  'hsl(160, 55%, 45%)',
];

export const ScoreTrendChart = ({ companyId }: Props) => {
  const [data, setData] = useState<Record<string, string | number>[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: notifs, error } = await supabase
        .from('admin_notifications')
        .select('module_title, score, max_score, created_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // Group by week and module
      const weekMap = new Map<string, Map<string, { total: number; count: number }>>();
      const moduleSet = new Set<string>();

      (notifs || []).forEach(n => {
        const d = new Date(n.created_at);
        // Get Monday of the week
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d);
        monday.setDate(diff);
        const weekKey = monday.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });

        const shortTitle = n.module_title.length > 16 ? n.module_title.slice(0, 14) + '…' : n.module_title;
        moduleSet.add(shortTitle);

        if (!weekMap.has(weekKey)) weekMap.set(weekKey, new Map());
        const modMap = weekMap.get(weekKey)!;
        const entry = modMap.get(shortTitle) || { total: 0, count: 0 };
        entry.total += n.max_score > 0 ? Math.round((n.score / n.max_score) * 100) : 0;
        entry.count++;
        modMap.set(shortTitle, entry);
      });

      const mods = Array.from(moduleSet);
      setModules(mods);

      const chartData = Array.from(weekMap.entries()).map(([week, modMap]) => {
        const row: Record<string, string | number> = { settimana: week };
        mods.forEach(m => {
          const e = modMap.get(m);
          row[m] = e ? Math.round(e.total / e.count) : 0;
        });
        return row;
      });

      setData(chartData);
      setLoading(false);
    };
    fetch();
  }, [companyId]);

  const exportToExcel = () => {
    if (data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data.map(row => {
      const r: Record<string, string | number> = { 'Settimana': row.settimana as string };
      modules.forEach(m => { r[m] = `${row[m]}%`; });
      return r;
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trend Punteggi');
    XLSX.writeFile(wb, `trend-punteggi-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Report esportato');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trend Punteggi Medi per Modulo
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
            Dati insufficienti per mostrare il trend
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="settimana" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} className="fill-muted-foreground" unit="%" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                formatter={(value: number) => [`${value}%`, '']}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {modules.map((mod, i) => (
                <Line
                  key={mod}
                  type="monotone"
                  dataKey={mod}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
