import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RequestsByStatusChartProps {
  data: Array<{ status: string; count: number }>;
}

const COLORS = {
  nuovo: 'hsl(var(--primary))',
  in_lavorazione: 'hsl(var(--secondary))',
  completato: 'hsl(var(--accent))',
  archiviato: 'hsl(var(--muted))',
};

const STATUS_LABELS = {
  nuovo: 'Nuovo',
  in_lavorazione: 'In Lavorazione',
  completato: 'Completato',
  archiviato: 'Archiviato',
};

export const RequestsByStatusChart = ({ data }: RequestsByStatusChartProps) => {
  const chartData = data.map(item => ({
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
    value: item.count,
    status: item.status,
  }));

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Richieste per Stato</CardTitle>
        <CardDescription>Distribuzione delle {total} richieste preventivo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.status as keyof typeof COLORS] || 'hsl(var(--muted))'} 
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};