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

import { getLevelFromXp, getNextLevel, getModuleContent } from '@/data/training-content';
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
type PathCategory = 'generale' | 'figure' | 'attrezzature';

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
  category: PathCategory;
  comingSoon?: boolean;
}

const CATEGORY_META: Record<PathCategory, { title: string; subtitle: string; emoji: string }> = {
  generale: {
    title: 'Formazione Generale & Specifica',
    subtitle: 'Art. 37 D.Lgs 81/08 — Accordo Stato-Regioni 2025',
    emoji: '📘',
  },
  figure: {
    title: 'Figure della Sicurezza sul Lavoro',
    subtitle: 'Ruoli con responsabilità formative dedicate',
    emoji: '👥',
  },
  attrezzature: {
    title: 'Attrezzature & Abilitazioni',
    subtitle: 'Accordo Stato-Regioni — Abilitazioni operatore',
    emoji: '🛠️',
  },
};

const TRAINING_PATHS: TrainingPath[] = [
  // ===== 1) GENERALE & SPECIFICA =====
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
    category: 'generale',
  },
  {
    id: 'rischio_basso',
    title: 'Rischio Specifico Basso',
    subtitle: 'Settori a basso rischio — 4h',
    description: 'Videoterminali e postura, stress lavoro-correlato, rischio elettrico base, microclima ed ergonomia. Per uffici e attività amministrative.',
    icon: Monitor,
    hours: '4h',
    color: 'primary',
    moduleIds: ['rb_videoterminali', 'rb_stress_lavoro', 'rb_rischio_elettrico', 'rb_microclima_ergonomia'],
    normativeRef: 'Accordo Stato-Regioni 2025 — Rischio Basso',
    category: 'generale',
  },
  {
    id: 'rischio_medio',
    title: 'Rischio Specifico Medio',
    subtitle: 'Settori a medio rischio — 8h',
    description: 'Rischi meccanici, movimentazione manuale (NIOSH), agenti fisici, sostanze pericolose, cadute dall\'alto, incendio e primo soccorso.',
    icon: Cog,
    hours: '8h',
    color: 'secondary',
    moduleIds: ['rm_rischi_meccanici', 'rm_movimentazione', 'rm_rischio_elettrico', 'rm_agenti_fisici', 'rm_sostanze_pericolose', 'rm_cadute_alto', 'rm_incendio', 'rm_primo_soccorso'],
    normativeRef: 'Accordo Stato-Regioni 2025 — Rischio Medio',
    category: 'generale',
  },
  {
    id: 'rischio_alto',
    title: 'Rischio Specifico Alto',
    subtitle: 'Settori ad alto rischio — 12h',
    description: 'Rischi meccanici avanzati, chimico (REACH/CLP), biologico, amianto, spazi confinati, lavori in quota, atmosfere esplosive, cantieri.',
    icon: HardHat,
    hours: '12h',
    color: 'destructive',
    moduleIds: ['ra_rischi_meccanici_avanzati', 'ra_rischio_chimico', 'ra_rischio_biologico', 'ra_amianto', 'ra_spazi_confinati', 'ra_lavori_quota', 'ra_movimentazione_avanzata', 'ra_atmosfere_esplosive', 'ra_rumore_vibrazioni', 'ra_radiazioni', 'ra_emergenze_complesse', 'ra_cantiere'],
    normativeRef: 'Accordo Stato-Regioni 2025 — Rischio Alto',
    category: 'generale',
  },

  // ===== 2) FIGURE DELLA SICUREZZA =====
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
    category: 'figure',
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
    category: 'figure',
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
    category: 'figure',
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
    category: 'figure',
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
    category: 'figure',
  },
  // --- Figure in rilascio ---
  {
    id: 'aspp',
    title: 'ASPP Mod. A-B-C',
    subtitle: 'Addetto SPP — Moduli A, B, C',
    description: 'Supporto all\'RSPP nell\'attività di prevenzione e protezione dei rischi: modulo base, specialistico per macrosettore e abilità relazionali.',
    icon: Shield,
    hours: '28-100h',
    color: 'primary',
    moduleIds: [],
    normativeRef: 'Art. 32 D.Lgs 81/08 — Accordo S-R 7/7/2016',
    category: 'figure',
    comingSoon: true,
  },
  {
    id: 'dirigente',
    title: 'Dirigente per la Sicurezza',
    subtitle: 'Art. 37 D.Lgs 81/08',
    description: 'Organizzazione e gestione dei processi in materia di salute e sicurezza, deleghe, modello 231, gestione contrattualistica e appalti.',
    icon: Crown,
    hours: '16h',
    color: 'destructive',
    moduleIds: [],
    normativeRef: 'Art. 37 D.Lgs 81/08 — Accordo S-R 21/12/2011',
    category: 'figure',
    comingSoon: true,
  },
  {
    id: 'lavoratrici_gestanti',
    title: 'Lavoratrici Gestanti',
    subtitle: 'Tutela maternità',
    description: 'Modifica mansioni, visite prenatali, divieto lavoro notturno, rischi specifici in gravidanza e puerperio. D.Lgs 151/2001.',
    icon: Heart,
    hours: '2h',
    color: 'accent',
    moduleIds: [],
    normativeRef: 'D.Lgs 151/2001 — Art. 28 D.Lgs 81/08',
    category: 'figure',
    comingSoon: true,
  },

  // ===== 3) ATTREZZATURE & ABILITAZIONI =====
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
    category: 'attrezzature',
  },
  {
    id: 'attr_carrelli',
    title: 'Carrelli Elevatori',
    subtitle: 'Abilitazione conduttore',
    description: 'Uso in sicurezza di carrelli industriali semoventi, controlli pre-operativi, manovre e gestione del carico.',
    icon: Truck,
    hours: '12h',
    color: 'secondary',
    moduleIds: [],
    normativeRef: 'Accordo S-R 22/2/2012',
    category: 'attrezzature',
    comingSoon: true,
  },
  {
    id: 'attr_carroponte',
    title: 'Carroponte',
    subtitle: 'Operatore gru a ponte',
    description: 'Imbracatura carichi, uso radiocomando, segnaletica gestuale, controllo aree di manovra.',
    icon: Box,
    hours: '8h',
    color: 'secondary',
    moduleIds: [],
    normativeRef: 'D.Lgs 81/08 Art. 73',
    category: 'attrezzature',
    comingSoon: true,
  },
  {
    id: 'attr_ple',
    title: 'PLE — Piattaforme Elevabili',
    subtitle: 'Con e senza stabilizzatori',
    description: 'Piattaforme di lavoro mobili elevabili: verifiche, posizionamento, uso in sicurezza, emergenze.',
    icon: ArrowUp,
    hours: '10h',
    color: 'primary',
    moduleIds: [],
    normativeRef: 'Accordo S-R 22/2/2012',
    category: 'attrezzature',
    comingSoon: true,
  },
  {
    id: 'attr_gru',
    title: 'Gru (Torre / Mobile)',
    subtitle: 'Operatore gru',
    description: 'Gru a torre e gru mobili: stabilità, calcolo carichi, ancoraggio, manovre con vento.',
    icon: ArrowUp,
    hours: '14h',
    color: 'destructive',
    moduleIds: [],
    normativeRef: 'Accordo S-R 22/2/2012',
    category: 'attrezzature',
    comingSoon: true,
  },
  {
    id: 'attr_scale',
    title: 'Scale e Trabattelli',
    subtitle: 'Lavori in quota su attrezzature mobili',
    description: 'Scale portatili, trabattelli, ponti su ruote: montaggio, uso e DPI anticaduta.',
    icon: ArrowUp,
    hours: '4h',
    color: 'primary',
    moduleIds: [],
    normativeRef: 'D.Lgs 81/08 Titolo IV — Allegato XX',
    category: 'attrezzature',
    comingSoon: true,
  },
  {
    id: 'attr_trattori',
    title: 'Trattori Agricoli e Forestali',
    subtitle: 'A ruote e a cingoli',
    description: 'Conduzione in sicurezza di trattori, attrezzature accoppiate, ribaltamento e cinture.',
    icon: Truck,
    hours: '13h',
    color: 'secondary',
    moduleIds: [],
    normativeRef: 'Accordo S-R 22/2/2012',
    category: 'attrezzature',
    comingSoon: true,
  },
  {
    id: 'attr_mmt',
    title: 'Escavatori e MMT',
    subtitle: 'Macchine Movimento Terra',
    description: 'Escavatori idraulici, pale caricatrici, terne, autoribaltabili: stabilità, manovre, lavori vicino reti.',
    icon: HardHat,
    hours: '10-16h',
    color: 'destructive',
    moduleIds: [],
    normativeRef: 'Accordo S-R 22/2/2012',
    category: 'attrezzature',
    comingSoon: true,
  },
  {
    id: 'attr_pompe',
    title: 'Pompe per Calcestruzzo',
    subtitle: 'Autopompe e bracci distributori',
    description: 'Posizionamento, stabilizzatori, gestione braccio, comunicazione di cantiere e procedure di emergenza.',
    icon: Cog,
    hours: '14h',
    color: 'secondary',
    moduleIds: [],
    normativeRef: 'Accordo S-R 22/2/2012',
    category: 'attrezzature',
    comingSoon: true,
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
    const isInProgress = status === 'in_progress';
    const totalSections = getModuleContent(mod.id)?.sections.length || SECTION_COUNTS[mod.id] || 1;
    const sectionProgress = mp ? (mp.current_section / totalSections) * 100 : 0;

    return (
      <div key={mod.id} className={`relative group ${isLocked ? 'opacity-50' : ''}`}>
        {/* Connector line */}
        {index > 0 && (
          <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-border" />
        )}
        <Card className={`relative overflow-hidden transition-all duration-300 border-2 ${
          isCompleted ? 'border-accent/60 bg-accent/5 shadow-md' :
          isInProgress ? 'border-primary/50 bg-primary/5 shadow-lg ring-2 ring-primary/20' :
          isLocked ? 'border-muted bg-muted/5' :
          'border-border hover:border-primary/40 hover:shadow-lg hover:-translate-y-1'
        } rounded-2xl`}>
          {/* Top accent bar */}
          {!isLocked && (
            <div className={`h-1.5 ${isCompleted ? 'bg-gradient-to-r from-accent to-game-health' : isInProgress ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10'}`} />
          )}
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              {/* Icon circle - Duolingo node style */}
              <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                isCompleted ? 'bg-accent/20 shadow-inner' :
                isLocked ? 'bg-muted' :
                isInProgress ? 'bg-primary/15 shadow-md' :
                'bg-primary/10 group-hover:bg-primary/15'
              }`}>
                {isLocked ? (
                  <Lock className="w-6 h-6 text-muted-foreground" />
                ) : isCompleted ? (
                  <CheckCircle className="w-7 h-7 text-accent" />
                ) : (
                  <Icon className={`w-7 h-7 ${isInProgress ? 'text-primary' : 'text-primary/80'}`} />
                )}
                {/* Step number badge */}
                <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCompleted ? 'bg-accent text-accent-foreground' :
                  isLocked ? 'bg-muted-foreground/30 text-muted-foreground' :
                  'bg-primary text-primary-foreground'
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-base mb-0.5 ${isLocked ? 'text-muted-foreground' : ''}`}>{mod.title}</h4>
                {mod.subtitle && <p className="text-xs text-muted-foreground mb-2">{mod.subtitle}</p>}
                
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    <Clock className="w-3 h-3" />{mod.min_duration_minutes} min
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-game-xp/10 text-game-xp">
                    <Star className="w-3 h-3" />{mod.style === '3d' ? '3D' : mod.style === 'hybrid' ? 'Ibrido' : 'Interattivo'}
                  </span>
                </div>

                {/* Progress bar for in-progress */}
                {isInProgress && mp && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Sezione {mp.current_section}/{totalSections}</span>
                      <span className="font-semibold text-primary">{mp.xp_earned} XP</span>
                    </div>
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" style={{ width: `${sectionProgress}%` }}>
                        <div className="absolute inset-0 bg-white/20 rounded-full" style={{ height: '50%' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Completed stats */}
                {isCompleted && mp && (
                  <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-accent/10">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold">{mp.score}/{mp.max_score}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-game-xp fill-game-xp" />
                      <span className="text-xs font-medium text-game-xp">{mp.xp_earned} XP</span>
                    </div>
                  </div>
                )}

                <Button
                  className={`w-full rounded-xl h-10 font-bold transition-all ${
                    isCompleted ? 'bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30' :
                    isInProgress ? 'bg-primary shadow-md' :
                    isLocked ? '' : 'bg-primary shadow-sm'
                  }`}
                  variant={isLocked ? 'outline' : isCompleted ? 'ghost' : 'default'}
                  disabled={isLocked}
                  onClick={() => navigate(`/formazione/${mod.id}`)}
                >
                  {isLocked ? <><Lock className="w-4 h-4 mr-2" /> Sblocca</> :
                   isCompleted ? <><Award className="w-4 h-4 mr-2" /> Rivedi</> :
                   isInProgress ? <><Play className="w-4 h-4 mr-2" /> Continua</> :
                   <><Play className="w-4 h-4 mr-2" /> Inizia</>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPathCard = (path: TrainingPath) => {
    const Icon = path.icon;
    const pathProgress = getPathProgress(path);
    const isExpanded = expandedPath === path.id;
    const progressPercent = pathProgress.total > 0 ? (pathProgress.completed / pathProgress.total) * 100 : 0;
    const isComplete = pathProgress.completed === pathProgress.total && pathProgress.total > 0;

    const PATH_EMOJIS: Record<string, string> = {
      lavoratori: '🎓', rispp: '👑', rls: '🤝', preposto: '👁️',
      cybersecurity: '🛡️', antincendio: '🔥', primo_soccorso: '❤️‍🩹',
      rischio_basso: '🟢', rischio_medio: '🟡', rischio_alto: '🔴',
      rspp: '👑', aspp: '🛡️', dirigente: '🏛️', lavoratrici_gestanti: '🤰',
      attr_carrelli: '🚜', attr_carroponte: '🏗️', attr_ple: '🛗',
      attr_gru: '🏗️', attr_scale: '🪜', attr_trattori: '🚜',
      attr_mmt: '⛏️', attr_pompe: '🧱',
    };

    if (path.comingSoon) {
      return (
        <div key={path.id} className="opacity-90">
          <Card className="relative border-2 border-dashed border-amber-400/40 bg-amber-50/30 dark:bg-amber-950/10 rounded-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-500" />
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-3xl bg-amber-100 dark:bg-amber-900/30 grayscale-[30%]">
                  {PATH_EMOJIS[path.id] || '📚'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-xl font-bold">{path.title}</h3>
                    <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-0">🚧 In rilascio</Badge>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{path.subtitle}</p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{path.description}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                      <Clock className="w-3 h-3" />{path.hours}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold">
                      {path.normativeRef}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 w-full rounded-xl font-semibold" disabled title="Disponibile a breve">
                    <Lock className="w-4 h-4 mr-2" /> Disponibile a breve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div key={path.id} className="space-y-4">
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 rounded-2xl overflow-hidden ${
            isExpanded ? 'ring-2 ring-primary/30 border-primary/40' :
            isComplete ? 'border-accent/50' : 'border-border'
          }`}
          onClick={() => setExpandedPath(isExpanded ? null : path.id)}
        >
          {/* Top gradient bar */}
          <div className={`h-2 bg-gradient-to-r ${
            isComplete ? 'from-accent to-game-health' :
            progressPercent > 0 ? 'from-primary to-secondary' :
            'from-muted-foreground/20 to-muted-foreground/10'
          }`} />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-3xl ${
                isComplete ? 'bg-accent/15' : 'bg-primary/10'
              }`}>
                {PATH_EMOJIS[path.id] || '📚'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">{path.title}</h3>
                  {isComplete && <span className="text-lg">✅</span>}
                </div>
                <p className="text-sm font-medium text-muted-foreground">{path.subtitle}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{path.description}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                    <Clock className="w-3 h-3" />{path.hours}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${
                    isComplete ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
                  }`}>
                    {pathProgress.completed}/{pathProgress.total} moduli
                  </span>
                </div>
                {pathProgress.total > 0 && (
                  <div className="mt-3">
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${isComplete ? 'bg-gradient-to-r from-accent to-game-health' : 'bg-gradient-to-r from-primary to-secondary'}`} style={{ width: `${progressPercent}%` }}>
                        <div className="absolute inset-0 bg-white/20 rounded-full" style={{ height: '50%' }} />
                      </div>
                    </div>
                  </div>
                )}
                {isComplete && (
                  <Button
                    variant="default"
                    size="sm"
                    className="mt-3 w-full rounded-xl font-bold"
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
                    <Download className="w-4 h-4 mr-2" /> Scarica Attestato 🎉
                  </Button>
                )}
              </div>
              <div className="shrink-0">
                <Button variant={isExpanded ? 'default' : 'outline'} size="sm" className="rounded-xl">
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
                  <Shield className="w-5 h-5 text-primary" /> Parte Specifica
                </h4>

                {/* Auto-assignment info */}
                {assignedSpecifica && !specificaOverride && (
                  <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-semibold">
                          📋 Modulo assegnato automaticamente via codice ATECO:
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="default">{SPECIFICA_CATEGORIES[assignedSpecifica].label}</Badge>
                          <span className="text-xs text-muted-foreground">{SPECIFICA_CATEGORIES[assignedSpecifica].hours}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSpecificaOverride(assignedSpecifica)}>
                        Cambia modulo
                      </Button>
                    </div>
                  </div>
                )}

                {/* Manual selection - shown when no ATECO or when overriding */}
                {(!assignedSpecifica || specificaOverride) && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      {specificaOverride ? 'Seleziona un modulo diverso:' : 'Scegli il modulo corrispondente al tuo settore lavorativo:'}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(['ls_uffici', 'ls_aziende', 'ls_ristorazione'] as SpecificaCategory[]).map((cat) => (
                        <Button
                          key={cat}
                          variant={(specificaOverride || assignedSpecifica) === cat ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSpecificaOverride(cat);
                            setSpecificaSource('manual');
                          }}
                        >
                          {SPECIFICA_CATEGORIES[cat].label} • {SPECIFICA_CATEGORIES[cat].hours}
                        </Button>
                      ))}
                      {specificaOverride && assignedSpecifica && (
                        <Button variant="ghost" size="sm" onClick={() => { setSpecificaOverride(null); setSpecificaSource('ateco'); }}>
                          Ripristina ATECO
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Render the specific module cards */}
                {(() => {
                  const activeSpecifica = specificaOverride || assignedSpecifica;
                  const specificaModuleIds = activeSpecifica ? [activeSpecifica] : ['ls_uffici', 'ls_aziende', 'ls_ristorazione'];
                  return (
                    <div className="grid md:grid-cols-2 gap-4">
                      {allModules.filter(m => specificaModuleIds.includes(m.id)).map((mod, i) => renderModuleCard(mod, i, specificaModuleIds))}
                    </div>
                  );
                })()}
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
      {/* Header - gamified */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/5 border-b">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Torna alla Home
          </Button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-3xl">🎓</span> Piano Formativo
              </h1>
              <p className="text-muted-foreground mt-1">Completa i percorsi e guadagna XP • Accordo Stato-Regioni 2025</p>
            </div>
            {/* Level card - Duolingo style */}
            <Card className="min-w-[280px] border-2 border-primary/20 rounded-2xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary via-game-xp to-accent" />
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-game-xp/20 flex items-center justify-center">
                    <span className="text-2xl font-black text-primary">{currentLevel.level}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{currentLevel.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 text-game-xp fill-game-xp" /> {userXp.total_xp} XP totali
                    </p>
                  </div>
                </div>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-game-xp transition-all duration-700" style={{ width: `${xpProgress}%` }}>
                    <div className="absolute inset-0 bg-white/20 rounded-full" style={{ height: '50%' }} />
                  </div>
                </div>
                {nextLevel && <p className="text-[10px] text-muted-foreground mt-1.5 text-right">{nextLevel.minXp - userXp.total_xp} XP al prossimo livello</p>}
              </CardContent>
            </Card>
          </div>
          {/* Stats row - fun badges */}
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-accent/10 border border-accent/20">
              <CheckCircle className="w-5 h-5 text-accent" />
              <div><p className="text-lg font-bold leading-tight">{totalCompleted}</p><p className="text-[10px] text-muted-foreground">Completati</p></div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary/10 border border-secondary/20">
              <Clock className="w-5 h-5 text-secondary" />
              <div><p className="text-lg font-bold leading-tight">{totalTimeMinutes}m</p><p className="text-[10px] text-muted-foreground">Studio</p></div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-game-xp/10 border border-game-xp/30">
              <Zap className="w-5 h-5 text-game-xp" />
              <div><p className="text-lg font-bold leading-tight">{userXp.total_xp}</p><p className="text-[10px] text-muted-foreground">XP</p></div>
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
