import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock,
  Star, Heart, AlertTriangle, Zap, Trophy, BookOpen,
  MessageSquare, Timer, RotateCcw, Flame, Sparkles, PartyPopper
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { getModuleContent, type TrainingSection, type QuizQuestion } from '@/data/training-content';
import { getReinforcementForQuestion } from '@/data/reinforcement-content';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AITutorChat from '@/components/training/AITutorChat';
import AdaptiveLearningCard from '@/components/training/AdaptiveLearningCard';
import TrainingAchievementPopup from '@/components/training/TrainingAchievementPopup';
import PointAndClickLevel from '@/components/training/PointAndClickLevel';

// Floating XP component
const FloatingXP = ({ amount, id }: { amount: number; id: number }) => (
  <span key={id} className="absolute -top-2 right-0 text-game-xp font-bold text-lg game-xp-float pointer-events-none">
    +{amount} XP
  </span>
);

// Streak indicator
const StreakIndicator = ({ streak }: { streak: number }) => {
  if (streak < 2) return null;
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-game-streak/10 border border-game-streak/30 game-bounce ${streak >= 5 ? 'game-streak-glow' : ''}`}>
      <Flame className="w-4 h-4 text-game-streak" />
      <span className="text-sm font-bold text-game-streak">{streak}x Streak!</span>
      {streak >= 5 && <Sparkles className="w-3 h-3 text-game-xp" />}
    </div>
  );
};

// Section type emoji/icon mapping
const SECTION_ICONS: Record<string, { emoji: string; label: string; gradient: string }> = {
  boss_test: { emoji: '🐉', label: 'Boss Fight', gradient: 'from-destructive/20 to-destructive/5' },
  interactive: { emoji: '🎮', label: 'Interattivo', gradient: 'from-game-combo/20 to-game-combo/5' },
  point_and_click: { emoji: '🔍', label: 'Caccia ai Rischi', gradient: 'from-game-xp/20 to-game-xp/5' },
  quiz: { emoji: '🧠', label: 'Quiz', gradient: 'from-secondary/20 to-secondary/5' },
  scenario_3d: { emoji: '🌐', label: 'Scenario 3D', gradient: 'from-primary/20 to-primary/5' },
  lesson: { emoji: '📖', label: 'Lezione', gradient: 'from-accent/20 to-accent/5' },
};

const TrainingModule = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { initializeProgress, updateProgress, addXp, getModuleProgress } = useTrainingProgress();

  const moduleContent = moduleId ? getModuleContent(moduleId) : undefined;
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionTimeSpent, setSectionTimeSpent] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [timeOverrides, setTimeOverrides] = useState<Record<string, number>>({});
  const [canProceed, setCanProceed] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [healthBar, setHealthBar] = useState(100);
  const [sessionXp, setSessionXp] = useState(0);
  const [perfectQuiz, setPerfectQuiz] = useState(true);
  const [bossTestScore, setBossTestScore] = useState(0);
  const [bossTestMaxScore, setBossTestMaxScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [wrongByTopic, setWrongByTopic] = useState<Record<string, number>>({});
  const [activeReinforcement, setActiveReinforcement] = useState<{ topicId: string; title: string; content: string; wrongCount: number } | null>(null);
  const [dismissedTopics, setDismissedTopics] = useState<Set<string>>(new Set());
  const [achievementPopup, setAchievementPopup] = useState<'perfect_section' | 'boss_first_try' | 'full_health' | null>(null);
  const [bossAttemptCount, setBossAttemptCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [floatingXps, setFloatingXps] = useState<Array<{ id: number; amount: number }>>([]);
  const [lastCorrectAnim, setLastCorrectAnim] = useState(false);
  const [lastWrongAnim, setLastWrongAnim] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const xpIdRef = useRef(0);

  const currentSection = moduleContent?.sections[currentSectionIndex];
  const totalSections = moduleContent?.sections.length || 0;

  // Fetch admin time overrides from DB
  useEffect(() => {
    if (!moduleId) return;
    const fetchTimeOverrides = async () => {
      const { data } = await supabase
        .from('training_time_config')
        .select('section_id, min_time_seconds')
        .eq('module_id', moduleId);
      if (data) {
        const map: Record<string, number> = {};
        data.forEach((row: any) => { map[row.section_id] = row.min_time_seconds; });
        setTimeOverrides(map);
      }
    };
    fetchTimeOverrides();
  }, [moduleId]);

  // TODO: restore min time after testing — set to 0 to bypass timer
  const effectiveMinTime = 0;

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSectionTimeSpent(prev => prev + 1);
      setTotalTimeSpent(prev => prev + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const allQuestionsAnswered = currentSection?.questions
    ? currentSection.questions.every(q => answeredQuestions[q.id] !== undefined)
    : true;

  useEffect(() => {
    if (!currentSection || canProceed) return;
    const timeMet = sectionTimeSpent >= effectiveMinTime;
    if (!currentSection.questions || currentSection.questions.length === 0) {
      if (timeMet) setCanProceed(true);
    } else if (currentSection.type !== 'boss_test') {
      if (timeMet && allQuestionsAnswered) setCanProceed(true);
    }
  }, [sectionTimeSpent, currentSection, allQuestionsAnswered, canProceed]);

  useEffect(() => {
    if (moduleId && user && moduleContent) {
      initializeProgress(moduleId, moduleContent.sections.length);
      const mp = getModuleProgress(moduleId);
      if (mp && mp.current_section > 0) {
        setCurrentSectionIndex(mp.current_section);
        setTotalTimeSpent(mp.time_spent_seconds);
        setSessionXp(mp.xp_earned);
      }
    }
  }, [moduleId, user]);

  const showFloatingXp = (amount: number) => {
    const id = xpIdRef.current++;
    setFloatingXps(prev => [...prev, { id, amount }]);
    setTimeout(() => setFloatingXps(prev => prev.filter(f => f.id !== id)), 1200);
  };

  const handleAnswerSelect = useCallback((questionIndex: number, answerIndex: number) => {
    if (!currentSection?.questions) return;
    const question = currentSection.questions[questionIndex];
    if (answeredQuestions[question.id] !== undefined) return;

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    const isCorrect = answerIndex === question.correctIndex;
    setAnsweredQuestions(prev => ({ ...prev, [question.id]: answerIndex }));

    if (isCorrect) {
      const bonusMultiplier = streak >= 5 ? 1.5 : streak >= 3 ? 1.2 : 1;
      const xpGained = Math.round(question.xpReward * bonusMultiplier);
      setSessionXp(prev => prev + xpGained);
      addXp(xpGained);
      setStreak(prev => prev + 1);
      showFloatingXp(xpGained);
      setLastCorrectAnim(true);
      setTimeout(() => setLastCorrectAnim(false), 600);
      if (currentSection.type === 'boss_test') {
        setBossTestScore(prev => prev + question.xpReward);
      }
    } else {
      setHealthBar(prev => Math.max(0, prev - 10));
      setPerfectQuiz(false);
      setStreak(0);
      setLastWrongAnim(true);
      setTimeout(() => setLastWrongAnim(false), 500);
      const reinforcement = getReinforcementForQuestion(question.id);
      if (reinforcement) {
        const newCount = (wrongByTopic[reinforcement.topicId] || 0) + 1;
        setWrongByTopic(prev => ({ ...prev, [reinforcement.topicId]: newCount }));
        if (newCount >= 2 && !dismissedTopics.has(reinforcement.topicId)) {
          setActiveReinforcement({ topicId: reinforcement.topicId, title: reinforcement.title, content: reinforcement.content, wrongCount: newCount });
        }
      }
    }

    if (currentSection.type === 'boss_test') {
      setBossTestMaxScore(prev => prev + question.xpReward);
    }
  }, [currentSection, answeredQuestions, addXp, streak]);

  const handleNextQuestion = useCallback(() => {
    if (!currentSection?.questions) return;
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const minTimeMet = sectionTimeSpent >= effectiveMinTime;
      if (minTimeMet) setCanProceed(true);
      if (currentSection.type === 'boss_test') {
        setShowResults(true);
        if (user && moduleId) {
          supabase.from('boss_test_results').insert({
            user_id: user.id, module_id: moduleId, score: bossTestScore, max_score: bossTestMaxScore,
            passed: (bossTestScore / bossTestMaxScore) >= 0.7, answers: answeredQuestions, time_taken_seconds: sectionTimeSpent,
          });
        }
      }
    }
  }, [currentSection, currentQuestionIndex, sectionTimeSpent, user, moduleId, bossTestScore, bossTestMaxScore, answeredQuestions]);

  const handleNextSection = useCallback(async () => {
    if (!moduleId || !moduleContent) return;
    if (currentSection?.questions && currentSection.questions.length > 0 && perfectQuiz && currentSection.type !== 'boss_test') {
      setAchievementPopup('perfect_section');
      addXp(25);
    }
    const nextIndex = currentSectionIndex + 1;
    if (nextIndex >= totalSections && healthBar === 100) {
      setTimeout(() => setAchievementPopup('full_health'), achievementPopup ? 4500 : 0);
      addXp(30);
    }
    if (nextIndex >= totalSections) {
      await updateProgress(moduleId, { status: 'completed', current_section: totalSections, xp_earned: sessionXp, time_spent_seconds: totalTimeSpent, completed_at: new Date().toISOString() });
      toast({ title: '🎉 Modulo Completato!', description: `Hai guadagnato ${sessionXp} XP` });
      if (user) {
        const moduleTitle = ({ giuridico_normativo: 'Giuridico e Normativo', gestione_organizzazione: 'Gestione ed Organizzazione', valutazione_rischi: 'Valutazione dei Rischi', dpi_protezione: 'DPI e Protezione' } as Record<string, string>)[moduleId] || moduleId;
        supabase.from('employee_notifications').insert({ user_id: user.id, type: 'module_completed', title: `🎉 Modulo completato: ${moduleTitle}`, message: `Complimenti! Hai completato il modulo "${moduleTitle}" e guadagnato ${sessionXp} XP.`, metadata: { module_id: moduleId, xp_earned: sessionXp, score: bossTestScore, max_score: bossTestMaxScore } });
        supabase.from('training_progress').select('module_id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed').then(({ count }) => {
          if (count && count >= 4) { supabase.from('employee_notifications').insert({ user_id: user.id, type: 'all_modules_completed', title: '🏆 Formazione completata!', message: 'Hai completato tutti i moduli formativi.', metadata: { total_modules: count } }); }
        });
        const mp = getModuleProgress(moduleId);
        supabase.functions.invoke('notify-module-completion', { body: { userId: user.id, moduleId, moduleTitle: ({ giuridico_normativo: 'Giuridico e Normativo', gestione_organizzazione: 'Gestione ed Organizzazione', valutazione_rischi: 'Valutazione dei Rischi', dpi_protezione: 'DPI e Protezione' } as Record<string, string>)[moduleId] || moduleId, score: mp?.score || bossTestScore || 0, maxScore: mp?.max_score || bossTestMaxScore || 0, xpEarned: sessionXp, timeSpentMinutes: Math.round(totalTimeSpent / 60) } });
      }
      setTimeout(() => navigate('/formazione'), achievementPopup ? 4500 : 500);
      return;
    }
    await updateProgress(moduleId, { current_section: nextIndex, xp_earned: sessionXp, time_spent_seconds: totalTimeSpent });
    setCurrentSectionIndex(nextIndex);
    setSectionTimeSpent(0);
    setCanProceed(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setBossTestScore(0);
    setBossTestMaxScore(0);
    setPerfectQuiz(true);
    setStreak(0);
  }, [moduleId, moduleContent, currentSectionIndex, totalSections, sessionXp, totalTimeSpent, updateProgress, navigate, currentSection, perfectQuiz, healthBar, achievementPopup, addXp]);

  if (!moduleContent || !currentSection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Modulo non trovato</h2>
            <p className="text-muted-foreground mb-4">Questo modulo potrebbe non essere ancora disponibile.</p>
            <Button onClick={() => navigate('/formazione')}>Torna alla Formazione</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const remainingTime = Math.max(0, effectiveMinTime - sectionTimeSpent);
  const sectionConfig = SECTION_ICONS[currentSection.type] || SECTION_ICONS.lesson;

  // Progress dots for section map
  const renderProgressMap = () => (
    <div className="flex items-center gap-1">
      {moduleContent!.sections.map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            i < currentSectionIndex ? 'bg-accent scale-100' :
            i === currentSectionIndex ? 'bg-primary scale-125 ring-2 ring-primary/30' :
            'bg-muted'
          }`}
        />
      ))}
    </div>
  );

  // Hearts display
  const hearts = Math.ceil(healthBar / 20);

  return (
    <div className="min-h-screen bg-background">
      {/* Top HUD - Duolingo style */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Exit */}
            <Button variant="ghost" size="icon" onClick={() => navigate('/formazione')} className="shrink-0">
              <XCircle className="w-5 h-5 text-muted-foreground" />
            </Button>

            {/* Progress bar - Duolingo style */}
            <div className="flex-1 max-w-md">
              <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-game-health transition-all duration-700 ease-out relative"
                  style={{ width: `${((currentSectionIndex + 1) / totalSections) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full" style={{ height: '50%' }} />
                </div>
              </div>
            </div>

            {/* Hearts */}
            <div className="flex items-center gap-1 shrink-0">
              {[...Array(5)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-all duration-300 ${
                    i < hearts ? 'text-destructive fill-destructive' : 'text-muted'
                  } ${lastWrongAnim && i === hearts ? 'game-wrong-shake' : ''}`}
                />
              ))}
            </div>

            {/* XP counter */}
            <div className="relative shrink-0">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-game-xp/10 border border-game-xp/30 ${lastCorrectAnim ? 'game-correct-pulse' : ''}`}>
                <Star className="w-4 h-4 text-game-xp fill-game-xp" />
                <span className="text-sm font-bold text-game-xp">{sessionXp}</span>
              </div>
              {floatingXps.map(f => <FloatingXP key={f.id} id={f.id} amount={f.amount} />)}
            </div>
          </div>
        </div>
      </div>

      {/* Streak indicator */}
      {streak >= 2 && (
        <div className="flex justify-center py-2 bg-game-streak/5 border-b border-game-streak/10">
          <StreakIndicator streak={streak} />
        </div>
      )}

      {/* Content Area */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Section Header - playful */}
        <div className="mb-8 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r ${sectionConfig.gradient} mb-4`}>
            <span className="text-2xl">{sectionConfig.emoji}</span>
            <span className="text-sm font-semibold">{sectionConfig.label}</span>
          </div>
          <h2 className="text-2xl font-bold mt-2">{currentSection.title}</h2>
          {/* Section map */}
          <div className="flex justify-center mt-4">
            {renderProgressMap()}
          </div>
        </div>

        {/* Adaptive Learning Reinforcement */}
        {activeReinforcement && (
          <AdaptiveLearningCard
            topic={activeReinforcement.title}
            wrongCount={activeReinforcement.wrongCount}
            reinforcementContent={activeReinforcement.content}
            onDismiss={() => {
              setDismissedTopics(prev => new Set([...prev, activeReinforcement.topicId]));
              setActiveReinforcement(null);
            }}
          />
        )}

        {/* Lesson Content - cleaner, more readable */}
        {(currentSection.type === 'lesson' || (currentSection.type === 'interactive' && currentSection.content && !currentSection.questions)) && currentSection.content && (
          <Card className="mb-6 border-none shadow-md">
            <CardContent className="p-8">
              <div className="prose prose-sm max-w-none">
                {currentSection.content.split('\n\n').map((paragraph, i) => (
                  <div key={i} className="mb-4">
                    {paragraph.split('\n').map((line, j) => {
                      const parts = line.split(/(\*\*[^*]+\*\*)/g);
                      return (
                        <p key={j} className="text-base leading-relaxed mb-2 text-foreground/90">
                          {parts.map((part, k) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={k} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
                            }
                            if (part.startsWith('_') && part.endsWith('_')) {
                              return <em key={k}>{part.slice(1, -1)}</em>;
                            }
                            return <span key={k}>{part}</span>;
                          })}
                        </p>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Point and Click Level */}
        {currentSection.type === 'point_and_click' && moduleId && (
          <div className="mb-6">
            <PointAndClickLevel levelData={getRiskHuntLevelForModule(moduleId)} />
          </div>
        )}

        {/* NPC Dialogues - chat bubble style */}
        {currentSection.npcDialogue && (
          <div className="space-y-4 mb-6">
            {currentSection.npcDialogue.map((npc, i) => (
              <div key={i} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-md">
                  <span className="text-primary-foreground text-xs font-bold">{npc.speaker.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{npc.speaker}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{npc.role}</Badge>
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3 border">
                    <p className="text-sm text-foreground/80 leading-relaxed">{npc.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3D Scenario */}
        {currentSection.type === 'scenario_3d' && (
          <Card className="mb-6 border-none shadow-lg overflow-hidden">
            <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 rotate-3 hover:rotate-0 transition-transform">
                <span className="text-4xl">🌐</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Ispezione 3D</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Esplora l'ambiente virtuale e identifica tutti i pericoli nascosti.
              </p>
              <div className="flex gap-3 justify-center">
                <Button size="lg" className="rounded-xl shadow-md" onClick={() => navigate('/demo-3d')}>
                  <Zap className="w-5 h-5 mr-2" /> Avvia Ispezione 3D
                </Button>
                <Button variant="ghost" size="lg" onClick={() => setCanProceed(true)}>
                  Salta per ora
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Quiz / Interactive / Boss Test Questions - Duolingo style */}
        {currentSection.questions && currentSection.questions.length > 0 && !showResults && (
          <div className="space-y-6">
            {/* Question counter dots */}
            {currentSection.questions.length > 1 && (
              <div className="flex items-center justify-center gap-2">
                {currentSection.questions.map((_, i) => {
                  const q = currentSection.questions![i];
                  const isAnswered = answeredQuestions[q.id] !== undefined;
                  const isCorrect = isAnswered && answeredQuestions[q.id] === q.correctIndex;
                  return (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i === currentQuestionIndex ? 'scale-125 ring-2 ring-offset-2' : ''
                      } ${
                        !isAnswered ? 'bg-muted' + (i === currentQuestionIndex ? ' ring-primary bg-primary' : '') :
                        isCorrect ? 'bg-game-correct' : 'bg-game-wrong'
                      }`}
                    />
                  );
                })}
              </div>
            )}

            {(() => {
              const question = currentSection.questions[currentQuestionIndex];
              const answered = answeredQuestions[question.id] !== undefined;
              const isCorrect = answered && answeredQuestions[question.id] === question.correctIndex;

              return (
                <div className={`space-y-4 ${answered && isCorrect ? 'game-correct-pulse' : answered && !isCorrect ? 'game-wrong-shake' : ''}`}>
                  {/* Question */}
                  <div className="text-center px-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Badge variant={question.difficulty === 'hard' ? 'destructive' : question.difficulty === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                        {question.difficulty === 'hard' ? '🔴 Difficile' : question.difficulty === 'medium' ? '🟡 Media' : '🟢 Facile'}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold leading-snug">{question.question}</h3>
                  </div>

                  {/* Options - big, tappable, Duolingo-style */}
                  <div className="space-y-3">
                    {question.options.map((option, oi) => {
                      const isSelected = selectedAnswer === oi || answeredQuestions[question.id] === oi;
                      const isCorrectAnswer = oi === question.correctIndex;
                      const letter = String.fromCharCode(65 + oi);

                      return (
                        <button
                          key={oi}
                          onClick={() => !answered && handleAnswerSelect(currentQuestionIndex, oi)}
                          disabled={answered}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                            answered
                              ? isCorrectAnswer
                                ? 'border-game-correct bg-game-correct/10 shadow-md'
                                : isSelected
                                  ? 'border-game-wrong bg-game-wrong/10'
                                  : 'border-border/50 opacity-40'
                              : 'border-border hover:border-primary/50 hover:bg-muted/30 active:scale-[0.98] game-option-hover'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                              answered && isCorrectAnswer ? 'bg-game-correct text-white' :
                              answered && isSelected ? 'bg-game-wrong text-white' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {answered && isCorrectAnswer ? <CheckCircle className="w-5 h-5" /> :
                               answered && isSelected && !isCorrectAnswer ? <XCircle className="w-5 h-5" /> :
                               letter}
                            </div>
                            <span className="text-base font-medium">{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation - playful */}
                  {showExplanation && answered && (
                    <div className={`p-5 rounded-2xl border-2 ${isCorrect ? 'border-game-correct/40 bg-game-correct/5' : 'border-game-wrong/40 bg-game-wrong/5'} animate-fade-in`}>
                      <div className="flex items-center gap-2 mb-2">
                        {isCorrect ? (
                          <>
                            <span className="text-2xl">🎉</span>
                            <span className="font-bold text-game-correct">Fantastico! +{Math.round(question.xpReward * (streak >= 5 ? 1.5 : streak >= 3 ? 1.2 : 1))} XP</span>
                            {streak >= 3 && <Badge className="bg-game-streak/20 text-game-streak border-game-streak/30 text-xs">Streak x{streak}</Badge>}
                          </>
                        ) : (
                          <>
                            <span className="text-2xl">😅</span>
                            <span className="font-bold text-game-wrong">Ops! -1 ❤️</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>
                    </div>
                  )}

                  {answered && (
                    <Button 
                      className={`w-full h-14 text-base font-bold rounded-2xl shadow-md transition-all ${isCorrect ? 'bg-game-correct hover:bg-game-correct/90' : 'bg-primary hover:bg-primary/90'}`}
                      onClick={handleNextQuestion}
                    >
                      {currentQuestionIndex < currentSection.questions.length - 1 ? 'CONTINUA' : 'CONTROLLA'}
                    </Button>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Boss Test Results - celebratory */}
        {showResults && currentSection.type === 'boss_test' && (
          <Card className="mb-6 border-none shadow-xl overflow-hidden">
            <div className={`p-10 text-center ${(bossTestScore / (bossTestMaxScore || 1)) >= 0.7 ? 'bg-gradient-to-br from-game-correct/10 via-accent/5 to-game-xp/10' : 'bg-gradient-to-br from-game-wrong/10 via-destructive/5 to-muted'}`}>
              <div className="w-24 h-24 rounded-3xl bg-card flex items-center justify-center mx-auto mb-6 shadow-lg game-bounce">
                <span className="text-5xl">{(bossTestScore / (bossTestMaxScore || 1)) >= 0.7 ? '🏆' : '💪'}</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {(bossTestScore / (bossTestMaxScore || 1)) >= 0.7 ? 'Boss Sconfitto!' : 'Riprova!'}
              </h3>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">{Math.round((bossTestScore / (bossTestMaxScore || 1)) * 100)}%</p>
                  <p className="text-xs text-muted-foreground">Punteggio</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="text-4xl font-bold text-game-xp">{bossTestScore}</p>
                  <p className="text-xs text-muted-foreground">XP guadagnati</p>
                </div>
              </div>
              {(bossTestScore / (bossTestMaxScore || 1)) >= 0.7 ? (
                <Button size="lg" className="rounded-2xl shadow-md h-14 px-8 text-base font-bold" onClick={() => {
                  if (bossAttemptCount === 0) { setAchievementPopup('boss_first_try'); addXp(50); }
                  setCanProceed(true);
                }}>
                  <PartyPopper className="w-5 h-5 mr-2" /> Prosegui
                </Button>
              ) : (
                <Button variant="destructive" size="lg" className="rounded-2xl shadow-md h-14 px-8 text-base font-bold" onClick={() => {
                  setBossAttemptCount(prev => prev + 1);
                  setCurrentQuestionIndex(0);
                  setShowResults(false);
                  setBossTestScore(0);
                  setBossTestMaxScore(0);
                  const questionIds = currentSection.questions?.map(q => q.id) || [];
                  setAnsweredQuestions(prev => {
                    const next = { ...prev };
                    questionIds.forEach(id => delete next[id]);
                    return next;
                  });
                }}>
                  <RotateCcw className="w-5 h-5 mr-2" /> Riprova
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Navigation - bottom bar Duolingo style */}
        <div className="flex justify-between items-center mt-8 pt-6">
          <Button
            variant="ghost"
            size="lg"
            className="rounded-2xl"
            disabled={currentSectionIndex === 0}
            onClick={() => {
              setCurrentSectionIndex(prev => prev - 1);
              setSectionTimeSpent(0);
              setCanProceed(false);
              setCurrentQuestionIndex(0);
              setShowResults(false);
              setStreak(0);
            }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Indietro
          </Button>

          <Button
            size="lg"
            className={`rounded-2xl h-14 px-8 text-base font-bold shadow-md ${canProceed ? 'bg-accent hover:bg-accent/90' : ''}`}
            disabled={!canProceed || remainingTime > 0}
            onClick={handleNextSection}
          >
            {currentSectionIndex === totalSections - 1 ? (
              <><Trophy className="w-5 h-5 mr-2" /> Completa!</>
            ) : (
              <><ArrowRight className="w-5 h-5 mr-2" /> Avanti</>
            )}
          </Button>
        </div>
      </div>

      {/* AI Tutor */}
      <AITutorChat moduleContext={moduleContent?.moduleId} sectionTitle={currentSection?.title} />

      {/* Achievement Popup */}
      {achievementPopup && (
        <TrainingAchievementPopup type={achievementPopup} onClose={() => setAchievementPopup(null)} />
      )}
    </div>
  );
};

export default TrainingModule;
