import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Lightbulb, RefreshCw } from 'lucide-react';

interface AdaptiveLearningCardProps {
  topic: string;
  wrongCount: number;
  reinforcementContent: string;
  onDismiss: () => void;
}

const AdaptiveLearningCard = ({ topic, wrongCount, reinforcementContent, onDismiss }: AdaptiveLearningCardProps) => {
  return (
    <Card className="mb-6 border-2 border-primary/30 bg-primary/5 animate-in fade-in slide-in-from-top-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">📚 Rinforzo: {topic}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hai sbagliato {wrongCount} domande su questo argomento
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <RefreshCw className="w-3 h-3" /> Adaptive
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none mb-4">
          {reinforcementContent.split('\n\n').map((p, i) => (
            <div key={i} className="mb-3">
              {p.split('\n').map((line, j) => {
                const parts = line.split(/(\*\*[^*]+\*\*)/g);
                return (
                  <p key={j} className="text-sm leading-relaxed mb-1">
                    {parts.map((part, k) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={k} className="text-primary">{part.slice(2, -2)}</strong>;
                      }
                      return <span key={k}>{part}</span>;
                    })}
                  </p>
                );
              })}
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={onDismiss} className="gap-1">
          <BookOpen className="w-3 h-3" /> Ho capito, continua
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdaptiveLearningCard;
