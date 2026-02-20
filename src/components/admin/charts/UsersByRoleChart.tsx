import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface UsersByRoleChartProps {
  data: Array<{ role: string; count: number }>;
}

const COLORS = {
  admin: 'hsl(var(--destructive))',
  company_client: 'hsl(var(--primary))',
  employee: 'hsl(var(--secondary))',
};

const ROLE_LABELS = {
  admin: 'Amministratore',
  company_client: 'Azienda',
  employee: 'Dipendente',
};

export const UsersByRoleChart = ({ data }: UsersByRoleChartProps) => {
  const chartData = data.map(item => ({
    name: ROLE_LABELS[item.role as keyof typeof ROLE_LABELS] || item.role,
    value: item.count,
    role: item.role,
  }));

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Utenti per Ruolo</CardTitle>
        <CardDescription>Distribuzione dei {total} utenti registrati</CardDescription>
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
                  fill={COLORS[entry.role as keyof typeof COLORS] || 'hsl(var(--muted))'} 
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