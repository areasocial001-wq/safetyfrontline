import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Share2,
  Award,
  User,
  Droplets,
  Flame,
  Wind,
  FlaskConical,
  Zap,
  Package,
  ShieldAlert,
  PlayCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Scenario3D } from "@/data/scenarios3d";
import type { ExtinguisherType } from "./ExtinguisherSelection";
import { useLang, t, isRTL } from "@/lib/risk-i18n";
import { getNormative } from "@/lib/risk-normative";
import { BookOpen, XCircle } from "lucide-react";

export interface FirePerformanceData {
  extinguisherType: ExtinguisherType;
  firesExtinguished: number;
  totalFires: number;
  totalSpraysUsed: number;
  fireDetails: {
    fireIndex: number;
    fireClass: 'electrical' | 'solid' | 'liquid';
    hitsUsed: number;
    isExtinguished: boolean;
    isCorrectType: boolean;
  }[];
}

export interface CyberQuizStats {
  correct: number;
  total: number;
  bonusPoints: number;
}

interface GameResults3DProps {
  scenario: Scenario3D;
  score: number;
  timeElapsed: number;
  manualRisksFound: number;
  totalManualRisks: number;
  proceduralRisksFound: number;
  totalProceduralRisks: number;
  collisions: number;
  sprinklerBonusPoints: number;
  sprinklerRisksFound: number;
  cyberQuizStats?: CyberQuizStats;
  firePerformance?: FirePerformanceData;
  risksFoundIds?: string[];
  onRestart: () => void;
  onChangeScenario: () => void;
  onReplayBriefing?: () => void;
}

const FIRE_CLASS_LABELS: Record<string, { label: string; icon: typeof Zap }> = {
  electrical: { label: 'Elettrico', icon: Zap },
  solid: { label: 'Solido', icon: Package },
  liquid: { label: 'Liquido', icon: Droplets },
};

const EXT_LABELS: Record<string, string> = {
  co2: 'CO₂', powder: 'Polvere', foam: 'Schiuma', water: 'Acqua',
};

const EXT_ICONS: Record<string, typeof Wind> = {
  co2: Wind, powder: FlaskConical, foam: Droplets, water: Droplets,
};

export const GameResults3D = ({
  scenario,
  score,
  timeElapsed,
  manualRisksFound,
  totalManualRisks,
  proceduralRisksFound,
  totalProceduralRisks,
  collisions,
  sprinklerBonusPoints,
  sprinklerRisksFound,
  cyberQuizStats,
  firePerformance,
  risksFoundIds = [],
  onRestart,
  onChangeScenario,
  onReplayBriefing,
}: GameResults3DProps) => {
  const [lang] = useLang();
  const rtl = isRTL(lang);
  // ... keep existing code (percentages and effectiveness calculation)
  const manualPercentage = totalManualRisks > 0 
    ? Math.round((manualRisksFound / totalManualRisks) * 100) 
    : 0;
  const proceduralPercentage = totalProceduralRisks > 0 
    ? Math.round((proceduralRisksFound / totalProceduralRisks) * 100) 
    : 0;
  const overallPercentage = Math.round(
    ((manualRisksFound + proceduralRisksFound) / (totalManualRisks + totalProceduralRisks)) * 100
  );

  const getTrainingEffectiveness = () => {
    if (manualPercentage >= 90) {
      return {
        level: "ECCELLENTE",
        message: "Obiettivi didattici critici completamente raggiunti",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: "🎓",
      };
    }
    if (manualPercentage >= 70) {
      return {
        level: "BUONO",
        message: "Obiettivi didattici critici in gran parte raggiunti",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: "✅",
      };
    }
    if (manualPercentage >= 50) {
      return {
        level: "SUFFICIENTE",
        message: "Obiettivi didattici critici parzialmente raggiunti",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: "⚠️",
      };
    }
    return {
      level: "INSUFFICIENTE",
      message: "Obiettivi didattici critici non raggiunti - ripetere il training",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      icon: "❌",
    };
  };

  const effectiveness = getTrainingEffectiveness();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6 animate-fade-in">
      {/* Training Effectiveness Banner */}
      <Card className={`p-6 border-2 ${effectiveness.borderColor} ${effectiveness.bgColor}`}>
        <div className="flex items-center gap-4">
          <div className="text-5xl">{effectiveness.icon}</div>
          <div className="flex-1">
            <h2 className={`text-2xl font-black mb-1 ${effectiveness.color}`}>
              EFFICACIA TRAINING: {effectiveness.level}
            </h2>
            <p className={`text-base font-semibold ${effectiveness.color}`}>
              {effectiveness.message}
            </p>
          </div>
        </div>
      </Card>

      {/* Main Results Card */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="text-center mb-6">
          <h3 className="text-3xl font-black mb-2">Scenario Completato</h3>
          <p className="text-muted-foreground">
            <span className="font-semibold">{scenario.title}</span>
          </p>
        </div>

        {/* Overall Score Display */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-40 h-40 rounded-full bg-gradient-hero flex items-center justify-center shadow-lg">
              <div className="text-center text-primary-foreground">
                <p className="text-5xl font-black">{overallPercentage}%</p>
                <p className="text-sm font-semibold">Totale</p>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Stats Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h4 className="text-lg font-black text-red-600">
              🚨 RISCHI CRITICI (Obiettivi Didattici)
            </h4>
          </div>
          <Card className="p-6 bg-red-50 dark:bg-red-950/20 border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-4xl font-black text-red-600">
                    {manualRisksFound}/{totalManualRisks}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-600">Rischi Manuali Identificati</p>
                    <p className="text-xs text-muted-foreground">Pericoli specifici del training</p>
                  </div>
                </div>
                <div className="h-3 bg-red-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600 transition-all duration-500"
                    style={{ width: `${manualPercentage}%` }}
                  />
                </div>
              </div>
              <Badge 
                variant="outline" 
                className="ml-4 text-2xl font-black px-4 py-2 border-2 border-red-600 text-red-600"
              >
                {manualPercentage}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic">
              * I rischi manuali rappresentano i pericoli chiave su cui si concentra l'obiettivo didattico del training
            </p>
          </Card>
        </div>

        {/* Procedural Stats Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-orange-600" />
            <h4 className="text-lg font-black text-orange-600">
              ⚠️ RISCHI GENERICI (Esplorazione)
            </h4>
          </div>
          <Card className="p-6 bg-orange-50 dark:bg-orange-950/20 border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-4xl font-black text-orange-600">
                    {proceduralRisksFound}/{totalProceduralRisks}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-600">Rischi Procedurali Identificati</p>
                    <p className="text-xs text-muted-foreground">Pericoli generati dinamicamente</p>
                  </div>
                </div>
                <div className="h-3 bg-orange-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-600 transition-all duration-500"
                    style={{ width: `${proceduralPercentage}%` }}
                  />
                </div>
              </div>
              <Badge 
                variant="outline" 
                className="ml-4 text-2xl font-black px-4 py-2 border-2 border-orange-600 text-orange-600"
              >
                {proceduralPercentage}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic">
              * I rischi procedurali misurano la capacità di esplorazione generale dell'ambiente
            </p>
          </Card>
        </div>

        {/* Additional Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-black">{score}</p>
            <p className="text-sm text-muted-foreground">Punti Totali</p>
          </Card>

          <Card className="p-4 text-center">
            <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-black">{formatTime(timeElapsed)}</p>
            <p className="text-sm text-muted-foreground">Tempo Impiegato</p>
          </Card>

          <Card className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-black">{collisions}</p>
            <p className="text-sm text-muted-foreground">Collisioni</p>
          </Card>

          <Card className={`p-4 text-center ${sprinklerBonusPoints > 0 ? 'border-sky-400/50 bg-sky-50 dark:bg-sky-950/20' : ''}`}>
            <Droplets className={`w-8 h-8 mx-auto mb-2 ${sprinklerBonusPoints > 0 ? 'text-sky-500' : 'text-muted-foreground'}`} />
            <p className={`text-2xl font-black ${sprinklerBonusPoints > 0 ? 'text-sky-600' : ''}`}>
              +{sprinklerBonusPoints}
            </p>
            <p className="text-sm text-muted-foreground">
              Bonus Sprinkler ({sprinklerRisksFound} rischi)
            </p>
          </Card>
        </div>
      </Card>

      {/* 🧯 Extinguisher Performance Recap */}
      {firePerformance && (
        <Card className="p-6 border-2 border-orange-300 bg-orange-50 dark:bg-orange-950/10">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-600" />
            <h4 className="text-lg font-black text-orange-700">Riepilogo Antincendio</h4>
          </div>
          
          {/* Extinguisher used */}
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-card border border-border">
            {(() => { const ExtIcon = EXT_ICONS[firePerformance.extinguisherType]; return <ExtIcon className="w-6 h-6 text-primary" />; })()}
            <div>
              <p className="font-semibold text-sm">Estintore utilizzato: <span className="text-primary">{EXT_LABELS[firePerformance.extinguisherType]}</span></p>
              <p className="text-xs text-muted-foreground">
                {firePerformance.firesExtinguished}/{firePerformance.totalFires} focolai spenti • {firePerformance.totalSpraysUsed} spruzzi totali
              </p>
            </div>
          </div>

          {/* Per-fire breakdown */}
          <div className="space-y-2">
            {firePerformance.fireDetails.map((fire) => {
              const classInfo = FIRE_CLASS_LABELS[fire.fireClass];
              const ClassIcon = classInfo?.icon || Flame;
              return (
                <div key={fire.fireIndex} className={`flex items-center gap-3 p-3 rounded-lg border ${
                  fire.isExtinguished
                    ? fire.isCorrectType ? 'bg-green-50 dark:bg-green-950/10 border-green-300' : 'bg-amber-50 dark:bg-amber-950/10 border-amber-300'
                    : 'bg-red-50 dark:bg-red-950/10 border-red-300'
                }`}>
                  <ClassIcon className={`w-5 h-5 flex-shrink-0 ${
                    fire.isCorrectType ? 'text-green-600' : 'text-amber-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">
                      Focolaio #{fire.fireIndex + 1} — {classInfo?.label || fire.fireClass}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fire.isExtinguished 
                        ? `Spento con ${Math.ceil(fire.hitsUsed)} spruzzi`
                        : `Non spento (${Math.ceil(fire.hitsUsed)} spruzzi usati)`
                      }
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${
                    fire.isCorrectType 
                      ? 'border-green-500 text-green-600' 
                      : 'border-amber-500 text-amber-600'
                  }`}>
                    {fire.isCorrectType ? '✅ Tipo corretto' : '⚠️ Tipo sbagliato'}
                  </Badge>
                </div>
              );
            })}
          </div>

          {/* Summary verdict */}
          {(() => {
            const correctCount = firePerformance.fireDetails.filter(f => f.isCorrectType).length;
            const allCorrect = correctCount === firePerformance.totalFires;
            return (
              <div className={`mt-4 p-3 rounded-lg text-center text-sm font-semibold ${
                allCorrect 
                  ? 'bg-green-100 dark:bg-green-950/20 text-green-700'
                  : 'bg-amber-100 dark:bg-amber-950/20 text-amber-700'
              }`}>
                {allCorrect 
                  ? '🎯 Scelta estintore perfetta per tutti i focolai!'
                  : `⚠️ Estintore adatto a ${correctCount}/${firePerformance.totalFires} focolai — ripassare le classi di fuoco`
                }
              </div>
            );
          })()}
        </Card>
      )}

      {/* 🛡️ Cybersecurity Quiz Recap */}
      {cyberQuizStats && cyberQuizStats.total > 0 && (
        <Card className="p-6 border-2 border-violet-300 bg-violet-50 dark:bg-violet-950/10">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-violet-600" />
            <h4 className="text-lg font-black text-violet-700">Riepilogo Quiz Cybersecurity</h4>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl font-black text-violet-600">
                {cyberQuizStats.correct}/{cyberQuizStats.total}
              </div>
              <div>
                <p className="text-sm font-semibold text-violet-600">Risposte Corrette</p>
                <p className="text-xs text-muted-foreground">Quiz contestuali completati</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-2xl font-black px-4 py-2 border-2 border-violet-600 text-violet-600"
            >
              {Math.round((cyberQuizStats.correct / cyberQuizStats.total) * 100)}%
            </Badge>
          </div>

          <div className="h-3 bg-violet-200 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-violet-600 transition-all duration-500"
              style={{ width: `${(cyberQuizStats.correct / cyberQuizStats.total) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Bonus ottenuto: <span className="font-bold text-violet-600">+{cyberQuizStats.bonusPoints} punti</span>
            </span>
            <span className={`font-semibold ${
              cyberQuizStats.correct === cyberQuizStats.total
                ? 'text-green-600'
                : cyberQuizStats.correct >= cyberQuizStats.total * 0.7
                  ? 'text-violet-600'
                  : 'text-amber-600'
            }`}>
              {cyberQuizStats.correct === cyberQuizStats.total
                ? '🌟 Perfetto!'
                : cyberQuizStats.correct >= cyberQuizStats.total * 0.7
                  ? '✅ Buona preparazione'
                  : '⚠️ Da approfondire'}
            </span>
          </div>
        </Card>
      )}

      {/* Training Insights */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-primary" />
          <h4 className="text-lg font-black">Analisi Performance Training</h4>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Focus sui Rischi Critici</p>
              <p className="text-xs text-muted-foreground">
                Hai identificato <span className="font-bold text-red-600">{manualPercentage}%</span> dei 
                pericoli chiave del training, essenziali per la sicurezza sul lavoro.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Capacità di Esplorazione</p>
              <p className="text-xs text-muted-foreground">
                Hai scoperto <span className="font-bold text-orange-600">{proceduralPercentage}%</span> dei 
                rischi generici{proceduralPercentage >= 70
                  ? ', dimostrando ottima attitudine all\'osservazione dell\'ambiente.'
                  : proceduralPercentage >= 40
                    ? ', mostrando una discreta capacità di esplorazione. Prova a esplorare più a fondo l\'ambiente.'
                    : proceduralPercentage > 0
                      ? '. L\'esplorazione è risultata limitata — cerca di ispezionare ogni area dello scenario.'
                      : '. Nessun rischio generico individuato — esplora l\'ambiente con più attenzione.'}
              </p>
            </div>
          </div>
          {manualPercentage < 70 && (
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-red-600">Raccomandazione</p>
                <p className="text-xs text-muted-foreground">
                  Si consiglia di ripetere il training focalizzandosi sui rischi critici contrassegnati 
                  con bordo rosso lampeggiante per raggiungere gli obiettivi didattici.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Riepilogo formativo finale per rischio */}
      {(() => {
        const allRisks = scenario.risks || [];
        const foundSet = new Set(risksFoundIds);
        const found = allRisks.filter(r => foundSet.has(r.id));
        const missed = allRisks.filter(r => !foundSet.has(r.id));
        const severityBadge = (s: string) => {
          const map: Record<string, string> = {
            critical: 'border-red-600 text-red-700 bg-red-50',
            high: 'border-orange-500 text-orange-700 bg-orange-50',
            medium: 'border-yellow-500 text-yellow-700 bg-yellow-50',
            low: 'border-blue-400 text-blue-700 bg-blue-50',
          };
          return map[s] || 'border-muted-foreground text-muted-foreground';
        };
        const missReason = (sev: string) => {
          if (sev === 'critical') return lang === 'en'
            ? 'Critical hazard not detected: directly compromises the training learning objective.'
            : lang === 'ro'
              ? 'Risc critic neidentificat: compromite direct obiectivul didactic al formării.'
              : lang === 'ar'
                ? 'خطر حرج لم يُكتشف: يُخل مباشرة بالهدف التعليمي للتدريب.'
                : 'Rischio critico non rilevato: compromette direttamente l\'obiettivo didattico del training.';
          if (sev === 'high') return lang === 'en'
            ? 'High-severity hazard missed: requires more careful environmental scanning.'
            : lang === 'ro'
              ? 'Risc cu severitate mare ratat: necesită o analiză mai atentă a mediului.'
              : lang === 'ar'
                ? 'خطر بدرجة خطورة عالية فات: يتطلب فحصًا أكثر دقة للبيئة.'
                : 'Rischio ad alta gravità mancato: richiede un\'analisi più attenta dell\'ambiente.';
          return lang === 'en'
            ? 'Hazard not identified — review training material to recognise this category.'
            : lang === 'ro'
              ? 'Risc neidentificat — revezi materialul pentru a recunoaște această categorie.'
              : lang === 'ar'
                ? 'لم يتم تحديد الخطر — راجع المادة التدريبية للتعرف على هذه الفئة.'
                : 'Rischio non identificato — ripassa il materiale per riconoscere questa categoria.';
        };
        return (
          <Card className="p-6 border-2 border-primary/30" dir={rtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-black text-primary">{t(lang, 'summaryTitle')}</h4>
            </div>

            {/* Identificati */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <h5 className="font-black text-green-700">
                  {t(lang, 'identifiedRisks')} ({found.length}/{allRisks.length})
                </h5>
              </div>
              {found.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">—</p>
              ) : (
                <div className="space-y-3">
                  {found.map(r => {
                    const norm = getNormative(lang, r.label, r.description, r.severity);
                    return (
                      <div key={r.id} className="p-4 rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-950/10">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-sm">{r.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                          </div>
                          <Badge variant="outline" className={`text-[10px] uppercase ${severityBadge(r.severity)}`}>
                            {r.severity}
                          </Badge>
                        </div>
                        <div className="mt-2 pl-3 border-l-2 border-primary/40 space-y-1">
                          <p className="text-xs font-semibold text-primary">
                            📖 {t(lang, 'normativeRef')}: {norm.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            <span className="font-semibold">{norm.articles}</span>
                          </p>
                          <p className="text-xs text-foreground/80">{norm.obligation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mancati */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-red-600" />
                <h5 className="font-black text-red-700">
                  {t(lang, 'missedRisks')} ({missed.length}/{allRisks.length})
                </h5>
              </div>
              {missed.length === 0 ? (
                <p className="text-sm text-green-700 font-semibold italic">{t(lang, 'noErrors')}</p>
              ) : (
                <div className="space-y-3">
                  {missed.map(r => {
                    const norm = getNormative(lang, r.label, r.description, r.severity);
                    return (
                      <div key={r.id} className="p-4 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-950/10">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-sm">{r.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                          </div>
                          <Badge variant="outline" className={`text-[10px] uppercase ${severityBadge(r.severity)}`}>
                            {r.severity}
                          </Badge>
                        </div>
                        <div className="mt-2 p-2 rounded bg-red-100/60 dark:bg-red-950/20 border border-red-200">
                          <p className="text-xs">
                            <span className="font-bold text-red-700">⚠️ {t(lang, 'errorReason')}:</span>{' '}
                            <span className="text-foreground/80">{missReason(r.severity)}</span>
                          </p>
                        </div>
                        <div className="mt-2 pl-3 border-l-2 border-red-400/50 space-y-1">
                          <p className="text-xs font-semibold text-red-700">
                            📖 {t(lang, 'normativeRef')}: {norm.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            <span className="font-semibold">{norm.articles}</span>
                          </p>
                          <p className="text-xs text-foreground/80">{norm.obligation}</p>
                          {norm.nextSteps?.length > 0 && (
                            <ul className="text-xs list-disc pl-4 mt-1 space-y-0.5 text-foreground/80">
                              {norm.nextSteps.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        );
      })()}

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onRestart}
            variant="professional"
            size="lg"
            className="flex-1"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Rigioca Questo Scenario
          </Button>
          <Button
            onClick={onChangeScenario}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            Prova Altro Scenario
          </Button>
        </div>
        {onReplayBriefing && (
          <Button
            onClick={onReplayBriefing}
            variant="outline"
            size="lg"
            className="w-full border-primary/50 hover:bg-primary/5"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Rivedi spiegazione 3D dei rischi
          </Button>
        )}
        <Button
          asChild
          variant="outline"
          size="lg"
          className="w-full border-primary/50 hover:bg-primary/5"
        >
          <Link to="/player-profile">
            <User className="w-5 h-5 mr-2" />
            Visualizza Profilo Giocatore
          </Link>
        </Button>
      </div>
    </div>
  );
};
