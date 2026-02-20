import { Card } from '@/components/ui/card';
import { Users, BookOpen, TrendingUp, Award } from 'lucide-react';

interface CompanyStatsCardsProps {
  totalEmployees: number;
  activeSessions: number;
  averageScore: number;
  completedModules: number;
}

export const CompanyStatsCards = ({
  totalEmployees,
  activeSessions,
  averageScore,
  completedModules,
}: CompanyStatsCardsProps) => {
  const stats = [
    {
      title: 'Dipendenti Totali',
      value: totalEmployees,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Sessioni Attive',
      value: activeSessions,
      icon: BookOpen,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Punteggio Medio',
      value: `${averageScore}%`,
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Moduli Completati',
      value: completedModules,
      icon: Award,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
