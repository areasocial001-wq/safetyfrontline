import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SessionsByScenarioChartProps {
  data: Array<{ scenario: string; count: number; avgScore: number }>;
}

const SCENARIO_LABELS = {
  office: 'Ufficio',
  warehouse: 'Magazzino',
  general: 'Generale',
};

export const SessionsByScenarioChart = ({ data }: SessionsByScenarioChartProps) => {
  const chartData = data.map(item => ({
    name: SCENARIO_LABELS[item.scenario as keyof typeof SCENARIO_LABELS] || item.scenario,
    sessioni: item.count,
    punteggioMedio: Math.round(item.avgScore),
  }));

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessioni per Scenario</CardTitle>
        <CardDescription>Distribuzione delle {total} sessioni demo completate</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
            <YAxis stroke="hsl(var(--foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Bar dataKey="sessioni" fill="hsl(var(--primary))" name="Numero Sessioni" />
            <Bar dataKey="punteggioMedio" fill="hsl(var(--accent))" name="Punteggio Medio %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};