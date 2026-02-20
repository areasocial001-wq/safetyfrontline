import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Scale, Users, Search, Shield, Lock, Play, CheckCircle, 
  Trophy, Star, Clock, ArrowLeft, Zap, Award, Swords, Download
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { getLevelFromXp, getNextLevel, XP_LEVELS } from '@/data/training-content';
import { MultiplayerChallenges } from '@/components/training/MultiplayerChallenges';
import { generateTrainingCertificatePDF } from '@/lib/training-certificate';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const MODULE_ICONS: Record<string, typeof Scale> = {
  Scale, Users, Search, Shield,
};

const MODULE_ORDER = [
  'giuridico_normativo',
  'gestione_organizzazione', 
  'valutazione_rischi',
  'dpi_protezione',
];

const SECTION_COUNTS: Record<string, number> = {
  giuridico_normativo: 9,
  gestione_organizzazione: 6,
  valutazione_rischi: 4,
  dpi_protezione: 4,
};

const TrainingHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, userXp, loading, getModuleProgress } = useTrainingProgress();
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    // Static module data (matches DB)
    setModules([
      { id: 'giuridico_normativo', title: 'Giuridico e Normativo', subtitle: 'D.Lgs 81/08 e Accordo Stato-Regioni', description: 'Concetti fondamentali di legislazione sulla sicurezza, figure della prevenzione, diritti e doveri dei lavoratori.', module_order: 1, style: '2d', icon_name: 'Scale', min_duration_minutes: 60 },
      { id: 'gestione_organizzazione', title: 'Gestione ed Organizzazione', subtitle: 'RSPP, RLS, Medico Competente', description: 'Organigramma della sicurezza, ruoli e responsabilità, comunicazione e segnalazione.', module_order: 2, style: 'hybrid', icon_name: 'Users', min_duration_minutes: 60 },
      { id: 'valutazione_rischi', title: 'Valutazione dei Rischi', subtitle: 'Pericolo, Rischio, Danno', description: 'Identificazione dei pericoli, valutazione R=PxD, misure di prevenzione e protezione.', module_order: 3, style: '3d', icon_name: 'Search', min_duration_minutes: 60 },
      { id: 'dpi_protezione', title: 'DPI e Protezione', subtitle: 'Dispositivi di Protezione Individuale', description: 'Selezione e utilizzo corretto dei DPI, categorie, manutenzione e obblighi.', module_order: 4, style: '3d', icon_name: 'Shield', min_duration_minutes: 60 },
    ]);
  }, []);

  const getModuleStatus = (moduleId: string, index: number): 'locked' | 'available' | 'in_progress' | 'completed' => {
    const mp = getModuleProgress(moduleId);
    if (mp) return mp.status;
    if (index === 0) return 'available';
    // Check if previous module is completed
    const prevId = MODULE_ORDER[index - 1];
    const prevProgress = getModuleProgress(prevId);
    if (prevProgress?.status === 'completed') return 'available';
    return 'locked';
  };

  const currentLevel = getLevelFromXp(userXp.total_xp);
  const nextLevel = getNextLevel(userXp.total_xp);
  const xpProgress = nextLevel 
    ? ((userXp.total_xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100
    : 100;

  const completedModules = progress.filter(p => p.status === 'completed').length;
  const totalTimeMinutes = Math.round(progress.reduce((sum, p) => sum + p.time_spent_seconds, 0) / 60);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Accesso Richiesto</CardTitle>
            <CardDescription>Effettua il login per accedere alla Formazione Generale Lavoratori</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/auth')}>Accedi</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Torna alla Home
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Formazione Generale Lavoratori</h1>
              <p className="text-muted-foreground mt-1">4 ore • Conforme all'Accordo Stato-Regioni 2025</p>
            </div>
            
            {/* XP & Level */}
            <Card className="min-w-[280px]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Livello {currentLevel.level} • {currentLevel.title}</p>
                    <p className="text-xs text-muted-foreground">{userXp.total_xp} XP totali</p>
                  </div>
                </div>
                <Progress value={xpProgress} className="h-2" />
                {nextLevel && (
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">
                    {nextLevel.minXp - userXp.total_xp} XP al prossimo livello
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              <div>
                <p className="text-lg font-bold">{completedModules}/4</p>
                <p className="text-xs text-muted-foreground">Moduli completati</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-lg font-bold">{totalTimeMinutes} min</p>
                <p className="text-xs text-muted-foreground">Tempo totale</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <p className="text-lg font-bold">{userXp.total_xp}</p>
                <p className="text-xs text-muted-foreground">Punti XP</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {modules.map((mod, index) => {
            const status = getModuleStatus(mod.id, index);
            const mp = getModuleProgress(mod.id);
            const Icon = MODULE_ICONS[mod.icon_name] || Scale;
            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';
            const sectionProgress = mp ? (mp.current_section / (SECTION_COUNTS[mod.id] || 1)) * 100 : 0;

            return (
              <Card 
                key={mod.id}
                className={`relative overflow-hidden transition-all duration-300 ${
                  isLocked ? 'opacity-60 grayscale' : 'hover:shadow-lg hover:-translate-y-1'
                } ${isCompleted ? 'border-accent/50 bg-accent/5' : ''}`}
              >
                {/* Module number badge */}
                <div className="absolute top-4 right-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCompleted ? 'bg-accent text-accent-foreground' : 
                    isLocked ? 'bg-muted text-muted-foreground' : 
                    'bg-primary text-primary-foreground'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      isCompleted ? 'bg-accent/20' : isLocked ? 'bg-muted' : 'bg-primary/10'
                    }`}>
                      {isLocked ? <Lock className="w-6 h-6 text-muted-foreground" /> : <Icon className="w-6 h-6 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{mod.title}</CardTitle>
                      <CardDescription>{mod.subtitle}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{mod.description}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant={mod.style === '3d' ? 'default' : mod.style === 'hybrid' ? 'secondary' : 'outline'}>
                      {mod.style === '3d' ? '3D Simulato' : mod.style === 'hybrid' ? 'Ibrido 2D/3D' : '2D Interattivo'}
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {mod.min_duration_minutes} min
                    </Badge>
                  </div>

                  {/* Progress bar for in-progress */}
                  {status === 'in_progress' && mp && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Sezione {mp.current_section}/{SECTION_COUNTS[mod.id]}</span>
                        <span>{mp.xp_earned} XP</span>
                      </div>
                      <Progress value={sectionProgress} className="h-2" />
                    </div>
                  )}

                  {isCompleted && mp && (
                    <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-accent/10">
                      <Trophy className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">Punteggio: {mp.score}/{mp.max_score}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{mp.xp_earned} XP</span>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    variant={isLocked ? 'outline' : isCompleted ? 'secondary' : 'default'}
                    disabled={isLocked}
                    onClick={() => navigate(`/formazione/${mod.id}`)}
                  >
                    {isLocked ? (
                      <><Lock className="w-4 h-4 mr-2" /> Completa il modulo precedente</>
                    ) : isCompleted ? (
                      <><Award className="w-4 h-4 mr-2" /> Rivedi il modulo</>
                    ) : status === 'in_progress' ? (
                      <><Play className="w-4 h-4 mr-2" /> Continua</>
                    ) : (
                      <><Play className="w-4 h-4 mr-2" /> Inizia il Modulo</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Final certificate CTA */}
        {completedModules === 4 && (
          <div className="max-w-4xl mx-auto mt-8">
            <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">🎉 Formazione Completata!</h2>
                <p className="text-muted-foreground mb-4">
                  Hai completato tutti i 4 moduli della Formazione Generale Lavoratori.
                  Scarica il tuo attestato ufficiale.
                </p>
                <Button variant="hero" size="lg" onClick={async () => {
                  if (!user) return;
                  try {
                    const { data: profile } = await supabase.from('profiles').select('full_name, company_name').eq('id', user.id).maybeSingle();
                    const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
                    const totalMaxScore = progress.reduce((sum, p) => sum + p.max_score, 0);
                    const avgScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
                    
                    await generateTrainingCertificatePDF({
                      userName: profile?.full_name || user.email || 'Lavoratore',
                      companyName: profile?.company_name || '',
                      score: avgScore,
                      totalTimeMinutes,
                      completedModules: modules.map(m => m.title),
                      date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }),
                    });
                    toast({ title: '📄 Attestato generato!', description: 'Il PDF è stato scaricato.' });
                  } catch (e) {
                    toast({ title: 'Errore', description: 'Impossibile generare l\'attestato.', variant: 'destructive' });
                  }
                }}>
                  <Download className="w-5 h-5 mr-2" /> Scarica Attestato PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Multiplayer Challenges Section */}
        <div className="max-w-4xl mx-auto mt-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Swords className="w-6 h-6 text-primary" />
            Sfide Multiplayer
          </h2>
          <MultiplayerChallenges />
        </div>
      </div>
    </div>
  );
};

export default TrainingHub;
