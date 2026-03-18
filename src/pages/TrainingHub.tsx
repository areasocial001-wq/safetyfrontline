import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scale, Users, Search, Shield, Lock, Play, CheckCircle, 
  Trophy, Star, Clock, ArrowLeft, Zap, Award, Swords, Download,
  Building2, Factory, HardHat, Monitor, Brain, Thermometer,
  Cog, Package, Volume2, FlaskConical, ArrowDown, Flame, Heart,
  AlertTriangle, Box, ArrowUp, Truck, Bomb, Bug, Radiation, Siren
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { useRiskSector, SECTOR_INFO, RiskSector } from '@/hooks/useRiskSector';
import { getLevelFromXp, getNextLevel } from '@/data/training-content';
import { MultiplayerChallenges } from '@/components/training/MultiplayerChallenges';
import { SectorSelector } from '@/components/training/SectorSelector';
import { generateTrainingCertificatePDF } from '@/lib/training-certificate';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ALL_ICONS: Record<string, any> = {
  Scale, Users, Search, Shield, Monitor, Brain, Thermometer, Zap,
  Cog, Package, Volume2, FlaskConical, ArrowDown, Flame, Heart,
  AlertTriangle, Box, ArrowUp, Truck, Bomb, Bug, Radiation, Siren, HardHat,
};

const GENERAL_MODULES = ['giuridico_normativo', 'gestione_organizzazione', 'valutazione_rischi', 'dpi_protezione'];

const SECTOR_MODULES: Record<RiskSector, string[]> = {
  basso: ['rb_videoterminali', 'rb_stress_lavoro', 'rb_rischio_elettrico', 'rb_microclima_ergonomia'],
  medio: ['rm_rischi_meccanici', 'rm_movimentazione', 'rm_rischio_elettrico', 'rm_agenti_fisici', 'rm_sostanze_pericolose', 'rm_cadute_alto', 'rm_incendio', 'rm_primo_soccorso'],
  alto: ['ra_rischi_meccanici_avanzati', 'ra_rischio_chimico', 'ra_rischio_biologico', 'ra_amianto', 'ra_spazi_confinati', 'ra_lavori_quota', 'ra_movimentazione_avanzata', 'ra_atmosfere_esplosive', 'ra_rumore_vibrazioni', 'ra_radiazioni', 'ra_emergenze_complesse', 'ra_cantiere'],
};

const SECTION_COUNTS: Record<string, number> = {
  giuridico_normativo: 9, gestione_organizzazione: 6, valutazione_rischi: 4, dpi_protezione: 4,
  rb_videoterminali: 6, rb_stress_lavoro: 5, rb_rischio_elettrico: 4, rb_microclima_ergonomia: 5,
  rm_rischi_meccanici: 4, rm_movimentazione: 4, rm_rischio_elettrico: 3, rm_agenti_fisici: 3,
  rm_sostanze_pericolose: 3, rm_cadute_alto: 3, rm_incendio: 3, rm_primo_soccorso: 3,
  ra_rischi_meccanici_avanzati: 4, ra_rischio_chimico: 3, ra_rischio_biologico: 3, ra_amianto: 2,
  ra_spazi_confinati: 3, ra_lavori_quota: 3, ra_movimentazione_avanzata: 3, ra_atmosfere_esplosive: 2,
  ra_rumore_vibrazioni: 2, ra_radiazioni: 2, ra_emergenze_complesse: 3, ra_cantiere: 3,
};

const TrainingHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, userXp, loading: progressLoading, getModuleProgress } = useTrainingProgress();
  const { userSector, loading: sectorLoading, selectSector } = useRiskSector();
  const [modules, setModules] = useState<any[]>([]);
  const [sectorModules, setSectorModules] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('generale');

  useEffect(() => {
    const fetchModules = async () => {
      const { data } = await supabase.from('training_modules').select('*').order('module_order');
      if (data) {
        setModules(data.filter(m => !m.sector));
        if (userSector) {
          setSectorModules(data.filter(m => m.sector === userSector.sector));
        }
      }
    };
    fetchModules();
  }, [userSector]);

  const getModuleStatus = (moduleId: string, index: number, moduleList: string[]): 'locked' | 'available' | 'in_progress' | 'completed' => {
    const mp = getModuleProgress(moduleId);
    if (mp) return mp.status;
    if (index === 0) return 'available';
    const prevId = moduleList[index - 1];
    const prevProgress = getModuleProgress(prevId);
    if (prevProgress?.status === 'completed') return 'available';
    return 'locked';
  };

  const currentLevel = getLevelFromXp(userXp.total_xp);
  const nextLevel = getNextLevel(userXp.total_xp);
  const xpProgress = nextLevel ? ((userXp.total_xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100 : 100;
  const completedGeneral = progress.filter(p => GENERAL_MODULES.includes(p.module_id) && p.status === 'completed').length;
  const allGeneralCompleted = completedGeneral === 4;
  const totalTimeMinutes = Math.round(progress.reduce((sum, p) => sum + p.time_spent_seconds, 0) / 60);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Accesso Richiesto</CardTitle>
            <CardDescription>Effettua il login per accedere alla formazione</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/auth')}>Accedi</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderModuleCard = (mod: any, index: number, moduleList: string[]) => {
    const status = getModuleStatus(mod.id, index, moduleList);
    const mp = getModuleProgress(mod.id);
    const Icon = ALL_ICONS[mod.icon_name] || Shield;
    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';
    const sectionProgress = mp ? (mp.current_section / (SECTION_COUNTS[mod.id] || 1)) * 100 : 0;

    return (
      <Card key={mod.id} className={`relative overflow-hidden transition-all duration-300 ${isLocked ? 'opacity-60 grayscale' : 'hover:shadow-lg hover:-translate-y-1'} ${isCompleted ? 'border-accent/50 bg-accent/5' : ''}`}>
        <div className="absolute top-4 right-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isCompleted ? 'bg-accent text-accent-foreground' : isLocked ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
            {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
          </div>
        </div>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isCompleted ? 'bg-accent/20' : isLocked ? 'bg-muted' : 'bg-primary/10'}`}>
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
            <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{mod.min_duration_minutes} min</Badge>
          </div>
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
          <Button className="w-full" variant={isLocked ? 'outline' : isCompleted ? 'secondary' : 'default'} disabled={isLocked} onClick={() => navigate(`/formazione/${mod.id}`)}>
            {isLocked ? <><Lock className="w-4 h-4 mr-2" /> Completa il modulo precedente</> : isCompleted ? <><Award className="w-4 h-4 mr-2" /> Rivedi</> : status === 'in_progress' ? <><Play className="w-4 h-4 mr-2" /> Continua</> : <><Play className="w-4 h-4 mr-2" /> Inizia</>}
          </Button>
        </CardContent>
      </Card>
    );
  };

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
              <h1 className="text-3xl font-bold">Formazione Lavoratori</h1>
              <p className="text-muted-foreground mt-1">Generale (4h) + Specifica ({userSector ? SECTOR_INFO[userSector.sector].hours : '4-12'}h) • Accordo Stato-Regioni 2025</p>
            </div>
            <Card className="min-w-[280px]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-primary/10"><Star className="w-5 h-5 text-primary" /></div>
                  <div>
                    <p className="text-sm font-semibold">Livello {currentLevel.level} • {currentLevel.title}</p>
                    <p className="text-xs text-muted-foreground">{userXp.total_xp} XP totali</p>
                  </div>
                </div>
                <Progress value={xpProgress} className="h-2" />
                {nextLevel && <p className="text-[10px] text-muted-foreground mt-1 text-right">{nextLevel.minXp - userXp.total_xp} XP al prossimo livello</p>}
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              <div><p className="text-lg font-bold">{completedGeneral}/4</p><p className="text-xs text-muted-foreground">Moduli generali</p></div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-secondary" />
              <div><p className="text-lg font-bold">{totalTimeMinutes} min</p><p className="text-xs text-muted-foreground">Tempo totale</p></div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <div><p className="text-lg font-bold">{userXp.total_xp}</p><p className="text-xs text-muted-foreground">Punti XP</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="generale" className="flex items-center gap-2">
              <Scale className="w-4 h-4" /> Formazione Generale
            </TabsTrigger>
            <TabsTrigger value="specifica" className="flex items-center gap-2" disabled={!allGeneralCompleted && !userSector}>
              <Shield className="w-4 h-4" /> Formazione Specifica
              {!allGeneralCompleted && <Lock className="w-3 h-3" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generale">
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {modules.map((mod, i) => renderModuleCard(mod, i, GENERAL_MODULES))}
            </div>

            {allGeneralCompleted && !userSector && (
              <div className="max-w-4xl mx-auto mt-8">
                <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
                  <CardContent className="p-8 text-center">
                    <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">🎉 Formazione Generale Completata!</h2>
                    <p className="text-muted-foreground mb-4">Ora seleziona il tuo settore di rischio per proseguire con la Formazione Specifica.</p>
                    <Button onClick={() => setActiveTab('specifica')}>
                      <Shield className="w-4 h-4 mr-2" /> Vai alla Formazione Specifica
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="specifica">
            {!allGeneralCompleted ? (
              <Card className="max-w-md mx-auto">
                <CardContent className="p-8 text-center">
                  <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">Formazione Generale Richiesta</h3>
                  <p className="text-muted-foreground">Completa tutti i 4 moduli della Formazione Generale per accedere alla Specifica.</p>
                </CardContent>
              </Card>
            ) : !userSector ? (
              <SectorSelector onSelect={async (sector) => {
                const err = await selectSector(sector);
                if (!err) toast({ title: '✅ Settore selezionato', description: `Formazione Specifica: ${SECTOR_INFO[sector].label}` });
              }} />
            ) : (
              <>
                <div className="text-center mb-6">
                  <Badge className="text-sm px-4 py-1">{SECTOR_INFO[userSector.sector].label} • {SECTOR_INFO[userSector.sector].hours} ore</Badge>
                  <p className="text-xs text-muted-foreground mt-2">{SECTOR_INFO[userSector.sector].description}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {sectorModules.map((mod, i) => renderModuleCard(mod, i, SECTOR_MODULES[userSector.sector]))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Multiplayer */}
        <div className="max-w-4xl mx-auto mt-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Swords className="w-6 h-6 text-primary" /> Sfide Multiplayer
          </h2>
          <MultiplayerChallenges />
        </div>
      </div>
    </div>
  );
};

export default TrainingHub;
