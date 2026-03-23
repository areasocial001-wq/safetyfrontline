import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Scale, Users, Search, Shield, Lock, Play, CheckCircle, 
  Trophy, Star, Clock, ArrowLeft, Zap, Award, Swords, Download,
  Building2, Factory, HardHat, Monitor, Brain, Thermometer,
  Cog, Package, Volume2, FlaskConical, ArrowDown, Flame, Heart,
  AlertTriangle, Box, ArrowUp, Truck, Bomb, Bug, Radiation, Siren,
  GraduationCap, Crown, Eye, KeyRound, ShieldAlert, Cross
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';

import { getLevelFromXp, getNextLevel } from '@/data/training-content';
import { MultiplayerChallenges } from '@/components/training/MultiplayerChallenges';
import { getSpecificaFromAteco, SPECIFICA_CATEGORIES, SpecificaCategory } from '@/lib/ateco-mapping';

import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { generatePathCertificatePDF } from '@/lib/path-certificate-generator';

const ALL_ICONS: Record<string, any> = {
  Scale, Users, Search, Shield, Monitor, Brain, Thermometer, Zap,
  Cog, Package, Volume2, FlaskConical, ArrowDown, Flame, Heart,
  AlertTriangle, Box, ArrowUp, Truck, Bomb, Bug, Radiation, Siren, HardHat,
  GraduationCap, Crown, Eye, KeyRound, ShieldAlert, Cross,
};

const GENERAL_MODULES = ['giuridico_normativo', 'gestione_organizzazione', 'valutazione_rischi', 'dpi_protezione'];


const SECTION_COUNTS: Record<string, number> = {
  giuridico_normativo: 9, gestione_organizzazione: 6, valutazione_rischi: 4, dpi_protezione: 4,
  rb_videoterminali: 6, rb_stress_lavoro: 5, rb_rischio_elettrico: 4, rb_microclima_ergonomia: 5,
  rm_rischi_meccanici: 4, rm_movimentazione: 4, rm_rischio_elettrico: 3, rm_agenti_fisici: 3,
  rm_sostanze_pericolose: 3, rm_cadute_alto: 3, rm_incendio: 3, rm_primo_soccorso: 3,
  ra_rischi_meccanici_avanzati: 4, ra_rischio_chimico: 3, ra_rischio_biologico: 3, ra_amianto: 2,
  ra_spazi_confinati: 3, ra_lavori_quota: 3, ra_movimentazione_avanzata: 3, ra_atmosfere_esplosive: 2,
  ra_rumore_vibrazioni: 2, ra_radiazioni: 2, ra_emergenze_complesse: 3, ra_cantiere: 3,
  ls_uffici: 9, ls_aziende: 9, ls_ristorazione: 9,
  rspp_dl_giuridico: 7, rspp_dl_gestione_rischi: 6, rspp_dl_tecnico: 5, rspp_dl_relazionale: 5,
  rls_ruolo_compiti: 6, rls_rischi_valutazione: 5, rls_comunicazione: 5,
  preposto_ruolo_obblighi: 7, preposto_valutazione_dpi: 6, preposto_emergenze: 6,
  antincendio_prevenzione: 9, antincendio_protezione: 12, antincendio_esercitazioni: 8,
  primo_soccorso_allertare: 10, primo_soccorso_intervento: 12, primo_soccorso_conoscenze: 12,
};

// Training path definitions - all independent
interface TrainingPath {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  hours: string;
  color: string;
  moduleIds: string[];
  requiresSector?: boolean;
  normativeRef: string;
}

const TRAINING_PATHS: TrainingPath[] = [
  {
    id: 'lavoratori',
    title: 'Formazione Lavoratori',
    subtitle: 'Generale + Specifica',
    description: 'Formazione obbligatoria Art. 37 D.Lgs 81/08. Parte generale (4h) + parte specifica per settore (Uffici, Aziende, Ristorazione).',
    icon: GraduationCap,
    hours: '4h + 4-12h',
    color: 'primary',
    moduleIds: [...GENERAL_MODULES, 'ls_uffici', 'ls_aziende', 'ls_ristorazione'],
    requiresSector: false,
    normativeRef: 'Accordo Stato-Regioni 2025',
  },
  {
    id: 'rspp',
    title: 'RSPP Datore di Lavoro',
    subtitle: 'Art. 34 D.Lgs 81/08',
    description: 'Il DL come RSPP: responsabilità, DVR, gestione rischi, ciclo PDCA, near miss reporting. 16-48 ore.',
    icon: Crown,
    hours: '16-48h',
    color: 'destructive',
    moduleIds: ['rspp_dl_giuridico', 'rspp_dl_gestione_rischi', 'rspp_dl_tecnico', 'rspp_dl_relazionale'],
    normativeRef: 'Art. 34 D.Lgs 81/08',
  },
  {
    id: 'rls',
    title: 'RLS',
    subtitle: 'Rappresentante Lavoratori',
    description: 'Corso 32 ore: elezione, attribuzioni art. 50, consultazione preventiva, accesso DVR.',
    icon: Users,
    hours: '32h',
    color: 'accent',
    moduleIds: ['rls_ruolo_compiti', 'rls_rischi_valutazione', 'rls_comunicazione'],
    normativeRef: 'Art. 37 comma 10-11 D.Lgs 81/08',
  },
  {
    id: 'preposto',
    title: 'Corso Preposto',
    subtitle: 'L. 215/2021',
    description: 'Vigilanza, intervento diretto, interruzione attività pericolose. Aggiornamento biennale obbligatorio.',
    icon: Eye,
    hours: '8h',
    color: 'secondary',
    moduleIds: ['preposto_ruolo_obblighi', 'preposto_valutazione_dpi', 'preposto_emergenze'],
    normativeRef: 'Art. 37 D.Lgs 81/08 - L. 215/2021',
  },
  {
    id: 'cybersecurity',
    title: 'Cyber Security',
    subtitle: 'Sicurezza Informatica Aziendale',
    description: 'Phishing, ransomware, password, GDPR, incident response. Simulazioni 3D interattive.',
    icon: ShieldAlert,
    hours: '4h',
    color: 'primary',
    moduleIds: ['cybersecurity-awareness'],
    normativeRef: 'Reg. UE 2016/679 (GDPR)',
  },
  {
    id: 'antincendio',
    title: 'Addetto Antincendio',
    subtitle: 'D.M. 2 Settembre 2021',
    description: 'Incendio e prevenzione, protezione attiva/passiva, procedure di emergenza, esercitazioni pratiche con estintori.',
    icon: Flame,
    hours: '4-16h',
    color: 'destructive',
    moduleIds: ['antincendio_prevenzione', 'antincendio_protezione', 'antincendio_esercitazioni'],
    normativeRef: 'D.M. 2 Settembre 2021',
  },
  {
    id: 'primo_soccorso',
    title: 'Addetto Primo Soccorso',
    subtitle: 'D.M. 388/2003',
    description: 'Allertamento soccorsi, BLS e DAE, gestione traumi, emorragie, ustioni, intossicazioni. Gruppi A, B e C.',
    icon: Heart,
    hours: '12-16h',
    color: 'accent',
    moduleIds: ['primo_soccorso_allertare', 'primo_soccorso_intervento', 'primo_soccorso_conoscenze'],
    normativeRef: 'D.M. 388/2003',
  },
];

const TrainingHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, userXp, loading: progressLoading, getModuleProgress } = useTrainingProgress();
  
  const [allModules, setAllModules] = useState<any[]>([]);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [assignedSpecifica, setAssignedSpecifica] = useState<SpecificaCategory | null>(null);
  const [specificaOverride, setSpecificaOverride] = useState<SpecificaCategory | null>(null);
  const [specificaSource, setSpecificaSource] = useState<'ateco' | 'manual' | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      const { data } = await supabase.from('training_modules').select('*').order('module_order');
      if (data) setAllModules(data);
    };
    fetchModules();
  }, []);

  // Fetch company ATECO code for auto-assignment
  useEffect(() => {
    const fetchCompanyAteco = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('company_users')
        .select('companies(ateco_code)')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data?.companies) {
        const company = data.companies as any;
        const detected = getSpecificaFromAteco(company.ateco_code);
        if (detected) {
          setAssignedSpecifica(detected);
          setSpecificaSource('ateco');
        }
      }
    };
    fetchCompanyAteco();
  }, [user]);

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
  const totalCompleted = progress.filter(p => p.status === 'completed').length;
  const totalTimeMinutes = Math.round(progress.reduce((sum, p) => sum + p.time_spent_seconds, 0) / 60);

  const getPathProgress = (path: TrainingPath) => {
    const moduleIds = path.moduleIds;
    const completed = moduleIds.filter(id => getModuleProgress(id)?.status === 'completed').length;
    return { completed, total: moduleIds.length };
  };

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

  const renderPathCard = (path: TrainingPath) => {
    const Icon = path.icon;
    const pathProgress = getPathProgress(path);
    const isExpanded = expandedPath === path.id;
    const progressPercent = pathProgress.total > 0 ? (pathProgress.completed / pathProgress.total) * 100 : 0;
    const isComplete = pathProgress.completed === pathProgress.total && pathProgress.total > 0;

    return (
      <div key={path.id} className="space-y-4">
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isExpanded ? 'ring-2 ring-primary/50' : ''} ${isComplete ? 'border-accent/50' : ''}`}
          onClick={() => setExpandedPath(isExpanded ? null : path.id)}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl bg-${path.color}/10 shrink-0`}>
                <Icon className={`w-8 h-8 text-${path.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">{path.title}</h3>
                  {isComplete && <CheckCircle className="w-5 h-5 text-accent shrink-0" />}
                </div>
                <p className="text-sm font-medium text-muted-foreground">{path.subtitle}</p>
                <p className="text-sm text-muted-foreground mt-2">{path.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{path.hours}</Badge>
                  <Badge variant="secondary">{pathProgress.completed}/{pathProgress.total} moduli</Badge>
                </div>
                {pathProgress.total > 0 && (
                  <div className="mt-3">
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}
                {isComplete && (
                  <Button
                    variant="default"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const moduleIds = path.moduleIds;
                      const completedMods = moduleIds.map(id => {
                        const mp = getModuleProgress(id);
                        const mod = allModules.find(m => m.id === id);
                        return { title: mod?.title || id, score: mp?.max_score ? Math.round((mp.score / mp.max_score) * 100) : 0 };
                      });
                      const avgScore = Math.round(completedMods.reduce((s, m) => s + m.score, 0) / completedMods.length);
                      const totalMinutes = Math.round(moduleIds.reduce((s, id) => s + (getModuleProgress(id)?.time_spent_seconds || 0), 0) / 60);
                      const { data: profile } = await supabase.from('profiles').select('full_name, company_name').eq('id', user!.id).maybeSingle();
                      await generatePathCertificatePDF({
                        userName: profile?.full_name || user!.email || 'Utente',
                        companyName: profile?.company_name || '',
                        pathId: path.id,
                        pathTitle: path.title,
                        pathSubtitle: path.subtitle,
                        normativeRef: path.normativeRef,
                        hours: path.hours,
                        score: avgScore,
                        totalTimeMinutes: totalMinutes,
                        completedModules: completedMods,
                        date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }),
                      });
                      toast({ title: '🎓 Attestato generato!', description: `Attestato "${path.title}" scaricato con successo.` });
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" /> Scarica Attestato
                  </Button>
                )}
              </div>
              <div className="shrink-0">
                <Button variant={isExpanded ? 'default' : 'outline'} size="sm">
                  {isExpanded ? 'Chiudi' : 'Apri'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expanded modules */}
        {isExpanded && (
          <div className="pl-4 border-l-2 border-primary/20 space-y-4">
            {path.id === 'lavoratori' && (
              <>
                {/* General modules */}
                <h4 className="text-lg font-semibold flex items-center gap-2 mb-2">
                  <Scale className="w-5 h-5 text-primary" /> Parte Generale (4h)
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {allModules.filter(m => GENERAL_MODULES.includes(m.id)).map((mod, i) => renderModuleCard(mod, i, GENERAL_MODULES))}
                </div>

                {/* Specific modules - 3 macro-categories */}
                <h4 className="text-lg font-semibold flex items-center gap-2 mt-6 mb-2">
                  <Shield className="w-5 h-5 text-primary" /> Parte Specifica (3 macro-categorie)
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Scegli il modulo corrispondente al tuo settore lavorativo: Uffici (4h), Aziende (8-12h) o Ristorazione (8h).
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {allModules.filter(m => ['ls_uffici', 'ls_aziende', 'ls_ristorazione'].includes(m.id)).map((mod, i) => renderModuleCard(mod, i, ['ls_uffici', 'ls_aziende', 'ls_ristorazione']))}
                </div>
              </>
            )}

            {path.id !== 'lavoratori' && (
              <div className="grid md:grid-cols-2 gap-4">
                {allModules.filter(m => path.moduleIds.includes(m.id)).map((mod, i) => renderModuleCard(mod, i, path.moduleIds))}
              </div>
            )}
          </div>
        )}
      </div>
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
              <h1 className="text-3xl font-bold">Piano Formativo</h1>
              <p className="text-muted-foreground mt-1">Tutti i percorsi sono indipendenti • Accordo Stato-Regioni 2025</p>
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
              <div><p className="text-lg font-bold">{totalCompleted}</p><p className="text-xs text-muted-foreground">Moduli completati</p></div>
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

      {/* Training Paths */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {TRAINING_PATHS.map(path => renderPathCard(path))}
        </div>

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
