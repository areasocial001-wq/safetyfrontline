import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock,
  Star, Heart, AlertTriangle, Zap, Trophy, BookOpen,
  MessageSquare, Timer, RotateCcw
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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Effective min time per section (DB override > static default)
  const effectiveMinTime = currentSection
    ? (timeOverrides[currentSection.id] ?? currentSection.minTimeSeconds ?? 0)
    : 0;

  // Timer anti-cheat
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSectionTimeSpent(prev => prev + 1);
      setTotalTimeSpent(prev => prev + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Check if minimum time has passed
  const allQuestionsAnswered = currentSection?.questions 
    ? currentSection.questions.every(q => answeredQuestions[q.id] !== undefined)
    : true;

  useEffect(() => {
    if (!currentSection || canProceed) return;
    const timeMet = sectionTimeSpent >= effectiveMinTime;
    
    if (!currentSection.questions || currentSection.questions.length === 0) {
      // Lessons without questions: just need time
      if (timeMet) setCanProceed(true);
    } else if (currentSection.type !== 'boss_test') {
      // Quiz/interactive: need time AND all questions answered
      if (timeMet && allQuestionsAnswered) setCanProceed(true);
    }
  }, [sectionTimeSpent, currentSection, allQuestionsAnswered, canProceed]);

  // Initialize progress on mount
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

  const handleAnswerSelect = useCallback((questionIndex: number, answerIndex: number) => {
    if (!currentSection?.questions) return;
    const question = currentSection.questions[questionIndex];
    if (answeredQuestions[question.id] !== undefined) return; // already answered

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    const isCorrect = answerIndex === question.correctIndex;
    setAnsweredQuestions(prev => ({ ...prev, [question.id]: answerIndex }));

    if (isCorrect) {
      setSessionXp(prev => prev + question.xpReward);
      addXp(question.xpReward);
      if (currentSection.type === 'boss_test') {
        setBossTestScore(prev => prev + question.xpReward);
      }
    } else {
      setHealthBar(prev => Math.max(0, prev - 10));
      setPerfectQuiz(false);
      // Adaptive Learning: track wrong answers by topic
      const reinforcement = getReinforcementForQuestion(question.id);
      if (reinforcement) {
        const newCount = (wrongByTopic[reinforcement.topicId] || 0) + 1;
        setWrongByTopic(prev => ({ ...prev, [reinforcement.topicId]: newCount }));
        if (newCount >= 2 && !dismissedTopics.has(reinforcement.topicId)) {
          setActiveReinforcement({
            topicId: reinforcement.topicId,
            title: reinforcement.title,
            content: reinforcement.content,
            wrongCount: newCount,
          });
        }
      }
    }

    if (currentSection.type === 'boss_test') {
      setBossTestMaxScore(prev => prev + question.xpReward);
    }
  }, [currentSection, answeredQuestions, addXp]);

  const handleNextQuestion = useCallback(() => {
    if (!currentSection?.questions) return;
    setSelectedAnswer(null);
    setShowExplanation(false);

    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions answered
      const minTimeMet = sectionTimeSpent >= effectiveMinTime;
      if (minTimeMet) {
        setCanProceed(true);
      }
      if (currentSection.type === 'boss_test') {
        setShowResults(true);
        // Save boss test results
        if (user && moduleId) {
          supabase.from('boss_test_results').insert({
            user_id: user.id,
            module_id: moduleId,
            score: bossTestScore,
            max_score: bossTestMaxScore,
            passed: (bossTestScore / bossTestMaxScore) >= 0.7,
            answers: answeredQuestions,
            time_taken_seconds: sectionTimeSpent,
          });
        }
      }
    }
  }, [currentSection, currentQuestionIndex, sectionTimeSpent, user, moduleId, bossTestScore, bossTestMaxScore, answeredQuestions]);

  const handleNextSection = useCallback(async () => {
    if (!moduleId || !moduleContent) return;

    // Check for perfect section achievement (quiz/interactive with all correct)
    if (currentSection?.questions && currentSection.questions.length > 0 && perfectQuiz && currentSection.type !== 'boss_test') {
      setAchievementPopup('perfect_section');
      addXp(25); // bonus XP
    }

    // Check full health achievement at module end
    const nextIndex = currentSectionIndex + 1;
    if (nextIndex >= totalSections && healthBar === 100) {
      setTimeout(() => setAchievementPopup('full_health'), achievementPopup ? 4500 : 0);
      addXp(30);
    }
    
    if (nextIndex >= totalSections) {
      // Module completed
      await updateProgress(moduleId, {
        status: 'completed',
        current_section: totalSections,
        xp_earned: sessionXp,
        time_spent_seconds: totalTimeSpent,
        completed_at: new Date().toISOString(),
      });
      toast({ title: '🎉 Modulo Completato!', description: `Hai guadagnato ${sessionXp} XP` });

      // In-app congratulation notification + admin email (fire-and-forget)
      if (user) {
        const moduleTitle = ({ giuridico_normativo: 'Giuridico e Normativo', gestione_organizzazione: 'Gestione ed Organizzazione', valutazione_rischi: 'Valutazione dei Rischi', dpi_protezione: 'DPI e Protezione' } as Record<string, string>)[moduleId] || moduleId;
        supabase.from('employee_notifications').insert({
          user_id: user.id,
          type: 'module_completed',
          title: `🎉 Modulo completato: ${moduleTitle}`,
          message: `Complimenti! Hai completato il modulo "${moduleTitle}" e guadagnato ${sessionXp} XP.`,
          metadata: { module_id: moduleId, xp_earned: sessionXp, score: bossTestScore, max_score: bossTestMaxScore },
        }).then(({ error }) => { if (error) console.error('Notification insert error:', error); });

        const mp = getModuleProgress(moduleId);
        supabase.functions.invoke('notify-module-completion', {
          body: {
            userId: user.id,
            moduleId,
            moduleTitle: ({ giuridico_normativo: 'Giuridico e Normativo', gestione_organizzazione: 'Gestione ed Organizzazione', valutazione_rischi: 'Valutazione dei Rischi', dpi_protezione: 'DPI e Protezione' } as Record<string, string>)[moduleId] || moduleId,
            score: mp?.score || bossTestScore || 0,
            maxScore: mp?.max_score || bossTestMaxScore || 0,
            xpEarned: sessionXp,
            timeSpentMinutes: Math.round(totalTimeSpent / 60),
          },
        }).then(({ error }) => {
          if (error) console.error('Notification error:', error);
          else console.log('Admin notified of module completion');
        });
      }

      setTimeout(() => navigate('/formazione'), achievementPopup ? 4500 : 500);
      return;
    }

    await updateProgress(moduleId, {
      current_section: nextIndex,
      xp_earned: sessionXp,
      time_spent_seconds: totalTimeSpent,
    });

    setCurrentSectionIndex(nextIndex);
    setSectionTimeSpent(0);
    setCanProceed(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setBossTestScore(0);
    setBossTestMaxScore(0);
    setPerfectQuiz(true); // Reset for next section
  }, [moduleId, moduleContent, currentSectionIndex, totalSections, sessionXp, totalTimeSpent, updateProgress, navigate, currentSection, perfectQuiz, healthBar, achievementPopup, addXp]);

  if (!moduleContent || !currentSection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p>Modulo non trovato</p>
            <Button className="mt-4" onClick={() => navigate('/formazione')}>Torna alla Formazione</Button>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Top HUD */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/formazione')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Esci
            </Button>
            
            <div className="flex items-center gap-4">
              {/* Health Bar */}
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${healthBar > 50 ? 'text-accent' : healthBar > 25 ? 'text-yellow-500' : 'text-destructive'}`} />
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      healthBar > 50 ? 'bg-accent' : healthBar > 25 ? 'bg-yellow-500' : 'bg-destructive'
                    }`}
                    style={{ width: `${healthBar}%` }}
                  />
                </div>
              </div>

              {/* XP */}
              <Badge variant="outline" className="gap-1">
                <Star className="w-3 h-3 text-primary" />
                {sessionXp} XP
              </Badge>

              {/* Timer */}
              <Badge variant={remainingTime > 0 ? 'destructive' : 'secondary'} className="gap-1">
                <Timer className="w-3 h-3" />
                {remainingTime > 0 ? formatTime(remainingTime) : '✓ OK'}
              </Badge>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{currentSectionIndex + 1}/{totalSections}</span>
              <Progress value={((currentSectionIndex + 1) / totalSections) * 100} className="w-20 h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Anti-cheat timer warning */}
      {remainingTime > 0 ? (
        <div className="bg-primary/10 border-b border-primary/20">
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">
              Tempo minimo di permanenza: {formatTime(remainingTime)} rimanenti
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-accent/10 border-b border-accent/20">
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-accent" />
            <span className="text-accent font-medium">
              {canProceed 
                ? 'Tempo minimo completato — puoi procedere con il pulsante "Avanti" in basso'
                : currentSection?.questions 
                  ? 'Tempo minimo completato — rispondi alle domande per procedere'
                  : 'Tempo minimo completato — puoi procedere'}
            </span>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Section Title */}
        <div className="mb-8">
          <Badge className="mb-2" variant={
            currentSection.type === 'boss_test' ? 'destructive' :
            currentSection.type === 'interactive' || currentSection.type === 'point_and_click' ? 'default' :
            currentSection.type === 'quiz' ? 'secondary' : 'outline'
          }>
            {currentSection.type === 'boss_test' ? '🏆 Boss Test' :
             currentSection.type === 'interactive' ? '🎮 Interattivo' :
             currentSection.type === 'point_and_click' ? '🔍 Caccia ai Rischi' :
             currentSection.type === 'quiz' ? '📝 Quiz' :
             currentSection.type === 'scenario_3d' ? '🌐 Scenario 3D' : '📖 Lezione'}
          </Badge>
          <h2 className="text-2xl font-bold mt-2">{currentSection.title}</h2>
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

        {/* Lesson Content */}
        {(currentSection.type === 'lesson' || (currentSection.type === 'interactive' && currentSection.content && !currentSection.questions)) && currentSection.content && (
          <Card className="mb-6">
            <CardContent className="p-6 prose prose-sm max-w-none">
              {currentSection.content.split('\n\n').map((paragraph, i) => (
                <div key={i} className="mb-4">
                  {paragraph.split('\n').map((line, j) => {
                    // Bold text
                    const parts = line.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <p key={j} className="text-sm leading-relaxed mb-1">
                        {parts.map((part, k) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={k}>{part.slice(2, -2)}</strong>;
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
            </CardContent>
          </Card>
        )}

        {/* Point and Click Level */}
        {currentSection.type === 'point_and_click' && (
          <div className="mb-6">
            <PointAndClickLevel />
          </div>
        )}

        {/* NPC Dialogues */}
        {currentSection.npcDialogue && (
          <div className="space-y-4 mb-6">
            {currentSection.npcDialogue.map((npc, i) => (
              <Card key={i} className="border-l-4 border-l-primary">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/10 shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{npc.speaker}</span>
                      <Badge variant="outline" className="text-[10px]">{npc.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">"{npc.text}"</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 3D Scenario redirect */}
        {currentSection.type === 'scenario_3d' && (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ispezione 3D</h3>
              <p className="text-muted-foreground mb-4">
                Esplora l'ambiente virtuale e identifica tutti i pericoli nascosti.
                Il tuo punteggio verrà registrato nel progresso del modulo.
              </p>
              <Button size="lg" onClick={() => navigate('/demo-3d')}>
                Avvia Ispezione 3D
              </Button>
              <Button variant="ghost" className="ml-2" onClick={() => setCanProceed(true)}>
                Salta per ora
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quiz / Interactive / Boss Test Questions */}
        {currentSection.questions && currentSection.questions.length > 0 && !showResults && (
          <div className="space-y-4">
            {/* Question progress for multi-question sections */}
            {currentSection.questions.length > 1 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground">
                  Domanda {currentQuestionIndex + 1}/{currentSection.questions.length}
                </span>
                <Progress value={((currentQuestionIndex + 1) / currentSection.questions.length) * 100} className="flex-1 h-2" />
              </div>
            )}

            {(() => {
              const question = currentSection.questions[currentQuestionIndex];
              const answered = answeredQuestions[question.id] !== undefined;
              const isCorrect = answered && answeredQuestions[question.id] === question.correctIndex;

              return (
                <Card className={`transition-all ${
                  answered ? (isCorrect ? 'border-accent/50 bg-accent/5' : 'border-destructive/50 bg-destructive/5') : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={
                        question.difficulty === 'hard' ? 'destructive' :
                        question.difficulty === 'medium' ? 'secondary' : 'outline'
                      }>
                        {question.difficulty === 'hard' ? 'Difficile' : question.difficulty === 'medium' ? 'Media' : 'Facile'}
                      </Badge>
                      <Badge variant="outline">+{question.xpReward} XP</Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{question.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {question.options.map((option, oi) => {
                        const isSelected = selectedAnswer === oi || answeredQuestions[question.id] === oi;
                        const isCorrectAnswer = oi === question.correctIndex;
                        
                        return (
                          <button
                            key={oi}
                            onClick={() => !answered && handleAnswerSelect(currentQuestionIndex, oi)}
                            disabled={answered}
                            className={`w-full text-left p-4 rounded-lg border transition-all ${
                              answered
                                ? isCorrectAnswer
                                  ? 'border-accent bg-accent/10 text-accent-foreground'
                                  : isSelected
                                    ? 'border-destructive bg-destructive/10'
                                    : 'border-border opacity-50'
                                : isSelected
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                answered && isCorrectAnswer ? 'bg-accent text-accent-foreground' :
                                answered && isSelected ? 'bg-destructive text-destructive-foreground' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {answered && isCorrectAnswer ? <CheckCircle className="w-4 h-4" /> :
                                 answered && isSelected && !isCorrectAnswer ? <XCircle className="w-4 h-4" /> :
                                 String.fromCharCode(65 + oi)}
                              </div>
                              <span className="text-sm">{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {showExplanation && answered && (
                      <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-accent/10 border border-accent/30' : 'bg-destructive/10 border border-destructive/30'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {isCorrect ? (
                            <><CheckCircle className="w-4 h-4 text-accent" /><span className="font-semibold text-accent">Corretto! +{question.xpReward} XP</span></>
                          ) : (
                            <><XCircle className="w-4 h-4 text-destructive" /><span className="font-semibold text-destructive">Sbagliato! -10 Salute</span></>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{question.explanation}</p>
                      </div>
                    )}

                    {answered && (
                      <Button className="w-full mt-4" onClick={handleNextQuestion}>
                        {currentQuestionIndex < currentSection.questions.length - 1 ? (
                          <><ArrowRight className="w-4 h-4 mr-2" /> Prossima Domanda</>
                        ) : (
                          <><CheckCircle className="w-4 h-4 mr-2" /> Concludi</>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        )}

        {/* Boss Test Results */}
        {showResults && currentSection.type === 'boss_test' && (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Risultati Test</h3>
              <p className="text-4xl font-bold text-primary mb-2">
                {Math.round((bossTestScore / (bossTestMaxScore || 1)) * 100)}%
              </p>
              <p className="text-muted-foreground mb-4">
                {bossTestScore}/{bossTestMaxScore} punti
              </p>
              {(bossTestScore / (bossTestMaxScore || 1)) >= 0.7 ? (
                <Badge variant="default" className="text-lg px-4 py-1">✅ SUPERATO</Badge>
              ) : (
                <Badge variant="destructive" className="text-lg px-4 py-1">❌ NON SUPERATO</Badge>
              )}
              <div className="mt-4">
                {(bossTestScore / (bossTestMaxScore || 1)) >= 0.7 ? (
                  <Button onClick={() => {
                    if (bossAttemptCount === 0) {
                      setAchievementPopup('boss_first_try');
                      addXp(50);
                    }
                    setCanProceed(true);
                  }}>
                    Prosegui <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={() => {
                    setBossAttemptCount(prev => prev + 1);
                    setCurrentQuestionIndex(0);
                    setShowResults(false);
                    setBossTestScore(0);
                    setBossTestMaxScore(0);
                    // Reset answers for this section
                    const questionIds = currentSection.questions?.map(q => q.id) || [];
                    setAnsweredQuestions(prev => {
                      const next = { ...prev };
                      questionIds.forEach(id => delete next[id]);
                      return next;
                    });
                  }}>
                    <RotateCcw className="w-4 h-4 mr-2" /> Riprova
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t">
          <Button
            variant="ghost"
            disabled={currentSectionIndex === 0}
            onClick={() => {
              setCurrentSectionIndex(prev => prev - 1);
              setSectionTimeSpent(0);
              setCanProceed(false);
              setCurrentQuestionIndex(0);
              setShowResults(false);
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Precedente
          </Button>

          <Button
            disabled={!canProceed || remainingTime > 0}
            onClick={handleNextSection}
          >
            {currentSectionIndex === totalSections - 1 ? (
              <><Trophy className="w-4 h-4 mr-2" /> Completa Modulo</>
            ) : (
              <><ArrowRight className="w-4 h-4 mr-2" /> Avanti</>
            )}
          </Button>
        </div>
      </div>

      {/* AI Tutor Chatbot */}
      <AITutorChat moduleContext={moduleContent?.moduleId} sectionTitle={currentSection?.title} />

      {/* Achievement Popup */}
      {achievementPopup && (
        <TrainingAchievementPopup type={achievementPopup} onClose={() => setAchievementPopup(null)} />
      )}
    </div>
  );
};

export default TrainingModule;
