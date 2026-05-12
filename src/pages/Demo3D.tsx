import { useState, Suspense, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BabylonScene } from "@/components/demo3d/BabylonScene";
import { SceneDebugOverlay } from "@/components/demo3d/SceneDebugOverlay";
import { AudioDiagnosticsHUD } from "@/components/demo3d/AudioDiagnosticsHUD";
import {
  loadPersistedSettings,
  DEFAULT_PER_WALL,
  type UniformFillPreset,
  type UniformFillDensity,
  type PerWallMultipliers,
} from "@/components/demo3d/scene-modules/uniform-fill-config";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { ArrowLeft, Shield, Target, Award, ChevronRight, Clock, TrendingUp, Trophy, Play, Home, Flame, Star } from "lucide-react";
import { GameResults3D } from "@/components/demo3d/GameResults3D";
import { ScenarioBriefingOverlay } from "@/components/demo3d/ScenarioBriefingOverlay";
import { FireDangerBar } from "@/components/demo3d/FireDangerBar";
import { FireVignetteOverlay } from "@/components/demo3d/FireVignetteOverlay";
import { FireClassHUD } from "@/components/demo3d/FireClassHUD";
import { ReadabilityToggle } from "@/components/demo3d/ReadabilityToggle";
import { FireGameOver } from "@/components/demo3d/FireGameOver";
import { EvacuationCountdown } from "@/components/demo3d/EvacuationCountdown";
import { SprinklerStatusHUD } from "@/components/demo3d/SprinklerStatusHUD";
import { FirstPersonScene } from "@/components/demo3d/FirstPersonScene";
import { RiskIndicator } from "@/components/demo3d/RiskIndicator";
import { MiniMap } from "@/components/demo3d/MiniMap";
import { ProximityRadar } from "@/components/demo3d/ProximityRadar";
import { KeyboardIndicator } from "@/components/demo3d/KeyboardIndicator";
import { VirtualJoystick } from "@/components/demo3d/VirtualJoystick";
import { GyroscopeToggle } from "@/components/demo3d/GyroscopeToggle";
import { GraphicsSettings } from "@/components/demo3d/GraphicsSettings";
import { AchievementsPanel } from "@/components/demo3d/AchievementsPanel";
import { AchievementBadge } from "@/components/demo3d/AchievementBadge";
import { Leaderboard } from "@/components/demo3d/Leaderboard";
import { ReplayViewer } from "@/components/demo3d/ReplayViewer";
import { PictureInPictureReplay } from "@/components/demo3d/PictureInPictureReplay";
import { ReplaySelectorDialog } from "@/components/demo3d/ReplaySelectorDialog";
import { PerformanceBenchmark } from "@/components/demo3d/PerformanceBenchmark";
import { LoadingOverlay } from "@/components/demo3d/LoadingOverlay";
import { ContextualHints } from "@/components/demo3d/ContextualHints";
import { PlayerLevelIndicator } from "@/components/demo3d/PlayerLevelIndicator";
import { UserMenu } from "@/components/auth/UserMenu";
import { Toaster } from "@/components/ui/toaster";
import { scenarios3D, getScenarioById, Scenario3D, getDifficultyColor, getDifficultyLabel } from "@/data/scenarios3d";
import { getPreviewByScenarioId } from "@/data/sim3d-previews";
import { Sim3dPreview } from "@/components/Sim3dPreview";
import { achievements, GameStats } from "@/lib/achievements";
import { useToast } from "@/hooks/use-toast";
import { useTouchControls } from "@/hooks/useTouchControls";
import { useGyroscope } from "@/hooks/useGyroscope";
import { useGraphicsSettings } from "@/hooks/useGraphicsSettings";
import { usePerformanceBenchmark } from "@/hooks/usePerformanceBenchmark";
import { CollisionSystem } from "@/lib/collision-system";
import { ExtinguisherSelection, ExtinguisherType } from "@/components/demo3d/ExtinguisherSelection";
import { ExtinguisherChargeHUD } from "@/components/demo3d/ExtinguisherChargeHUD";
import { FireVictoryOverlay } from "@/components/demo3d/FireVictoryOverlay";
import { FireClassTutorial } from "@/components/demo3d/FireClassTutorial";
import { FireClassQuiz } from "@/components/demo3d/FireClassQuiz";
import { ExtinguisherTypeHUD } from "@/components/demo3d/ExtinguisherTypeHUD";
import { Crosshair } from "@/components/demo3d/Crosshair";
import { CyberRiskQuiz } from "@/components/demo3d/CyberRiskQuiz";
import { MachineryRiskQuiz } from "@/components/demo3d/MachineryRiskQuiz";
import { isMachineryRisk } from "@/data/machinery-quizzes";
import { CameraPresetsPanel, type CameraPresetName } from "@/components/demo3d/CameraPresetsPanel";
import type { FirePerformanceData } from "@/components/demo3d/GameResults3D";
import { 
  loadUserAchievements, 
  saveAchievement, 
  loadScenarioStats,
  saveScenarioStats,
  ScenarioStats 
} from "@/lib/achievements-db";
import {
  uploadReplayVideo,
  saveReplay,
  cleanupOldReplays,
  isPersonalRecord,
  getUserReplays,
  getTopReplays,
  GameReplay,
} from "@/lib/replay-db";
import { useAuth } from "@/hooks/useAuth";
import { useCanvasRecorder } from "@/hooks/useCanvasRecorder";

const Demo3D = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isTouchDevice, touchMovement, handleJoystickMove, resetMovement } = useTouchControls();
  const { 
    isSupported: isGyroSupported, 
    isEnabled: isGyroEnabled, 
    gyroscopeData, 
    enable: enableGyro, 
    disable: disableGyro 
  } = useGyroscope();
  const { quality, settings: graphicsSettings, setQuality, audioSettings, updateAudioSettings, visualSettings, updateVisualSettings, triggerRecalibration } = useGraphicsSettings();
  const [fillPreset, setFillPreset] = useState<UniformFillPreset>('office');
  const [fillDensity, setFillDensity] = useState<UniformFillDensity>('medium');
  const [fillSeed, setFillSeed] = useState<number>(1337);
  const [fillPerWall, setFillPerWall] = useState<PerWallMultipliers>(DEFAULT_PER_WALL);

  const { 
    isRunning: isBenchmarkRunning,
    progress: benchmarkProgress,
    results: benchmarkResults,
    runBenchmark,
    reset: resetBenchmark
  } = usePerformanceBenchmark();
  
  const [searchParams] = useSearchParams();
  const [selectedScenario, setSelectedScenario] = useState<Scenario3D | null>(null);

  // Load persisted per-scenario fill settings when scenario changes
  useEffect(() => {
    if (!selectedScenario) return;
    const saved = loadPersistedSettings(selectedScenario.type);
    if (saved) {
      if (saved.preset) setFillPreset(saved.preset);
      if (saved.density) setFillDensity(saved.density);
      if (typeof saved.seed === 'number') setFillSeed(saved.seed);
      if (saved.perWall) setFillPerWall({ ...DEFAULT_PER_WALL, ...saved.perWall });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScenario?.type]);
  const [gameStarted, setGameStarted] = useState(false);
  const [risksFound, setRisksFound] = useState(0);
  const [manualRisksFound, setManualRisksFound] = useState(0);
  const [proceduralRisksFound, setProceduralRisksFound] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showScenarioSelect, setShowScenarioSelect] = useState(true);
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 1.6, 0]);
  const [playerRotation, setPlayerRotation] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showReplays, setShowReplays] = useState(false);
  const [scenarioStats, setScenarioStats] = useState<ScenarioStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showGraphicsSettings, setShowGraphicsSettings] = useState(false);
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [benchmarkCompleted, setBenchmarkCompleted] = useState(() => {
    return localStorage.getItem('benchmark-completed') === 'true';
  });
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [briefingActive, setBriefingActive] = useState(false);
  const [briefingIndex, setBriefingIndex] = useState(0);
  
  // Keyboard state for HUD indicator
  const [keysPressed, setKeysPressed] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  
  // Replay recording
  const { isRecording, recordedBlob, startRecording, stopRecording, reset: resetRecording } = useCanvasRecorder();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isUploadingReplay, setIsUploadingReplay] = useState(false);
  const [firePropagationLevel, setFirePropagationLevel] = useState(0);
  const [sprinklersActive, setSprinklersActive] = useState(false);
  const [fireGameOver, setFireGameOver] = useState(false);
  const [selectedExtinguisher, setSelectedExtinguisher] = useState<ExtinguisherType | null>(null);
  const [showExtinguisherSelection, setShowExtinguisherSelection] = useState(false);
  const [showFireTutorial, setShowFireTutorial] = useState(false);
  const [showFireQuiz, setShowFireQuiz] = useState(false);
  const [extinguisherCharge, setExtinguisherCharge] = useState(100);
  const [extinguisherMaxCharge, setExtinguisherMaxCharge] = useState(100);
  const [aimingAtFire, setAimingAtFire] = useState(false);
  const [aimedFireIndex, setAimedFireIndex] = useState<number | null>(null);
  const [readabilityMode, setReadabilityMode] = useState(false);
  const [firesExtinguished, setFiresExtinguished] = useState(0);
  const [totalFires, setTotalFires] = useState(0);
  const [allFiresOut, setAllFiresOut] = useState(false);
  const [totalSpraysUsed, setTotalSpraysUsed] = useState(0);
  const [quizBonusPoints, setQuizBonusPoints] = useState(0);
  const [quizCorrectAnswers, setQuizCorrectAnswers] = useState(0);
  const [cyberQuizRiskId, setCyberQuizRiskId] = useState<string | null>(null);
  const [cyberQuizRiskLabel, setCyberQuizRiskLabel] = useState('');
  const [cyberQuizCorrect, setCyberQuizCorrect] = useState(0);
  const [cyberQuizTotal, setCyberQuizTotal] = useState(0);
  const [machineryQuizRiskId, setMachineryQuizRiskId] = useState<string | null>(null);
  const [machineryQuizRiskLabel, setMachineryQuizRiskLabel] = useState('');
  const [cameraPreset, setCameraPreset] = useState<import("@/components/demo3d/CameraPresetsPanel").CameraPresetName>("pedestrian");
  const prevChargeRef = useRef(100);
  const hasAutoSelected = useRef(false);
  // Picture-in-Picture replay (two replays for split-screen comparison)
  const [pipReplay1, setPipReplay1] = useState<GameReplay | null>(null);
  const [pipReplay2, setPipReplay2] = useState<GameReplay | null>(null);
  const [availableReplays, setAvailableReplays] = useState<GameReplay[]>([]);
  const [showReplaySelector1, setShowReplaySelector1] = useState(false);
  const [showReplaySelector2, setShowReplaySelector2] = useState(false);
  
  // Game stats for achievements
  const riskFoundOrder = useRef<string[]>([]);
  const exploredCells = useRef<Set<string>>(new Set());
  const collisionSystem = useRef<CollisionSystem | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const sprinklerRisksFoundRef = useRef(0);
  const sprinklerBonusPointsRef = useRef(0);

  const totalRisks = selectedScenario?.risks.length || 0;
  
  // Memoize risk arrays to prevent re-renders
  const criticalRisks = useMemo(
    () => selectedScenario?.risks.filter(r => r.severity === 'critical') || [],
    [selectedScenario?.id]
  );
  const manualRisks = useMemo(
    () => selectedScenario?.risks.filter(r => r.isManual) || [],
    [selectedScenario?.id]
  );
  const proceduralRisks = useMemo(
    () => selectedScenario?.risks.filter(r => !r.isManual) || [],
    [selectedScenario?.id]
  );
  
  const totalCriticalRisks = criticalRisks.length;
  const totalManualRisks = manualRisks.length;
  const totalProceduralRisks = proceduralRisks.length;

  // Memoize scenario to prevent infinite re-renders
  const memoizedScenario = useMemo(() => selectedScenario, [selectedScenario?.id]);
  
  // Memoize camera config to prevent Canvas remount
  const cameraConfig = useMemo(() => ({ position: [0, 1.6, 5] as [number, number, number], fov: 75 }), []);
  
  // Memoize GL config to prevent Canvas remount
  const glConfig = useMemo(() => ({
    antialias: graphicsSettings.antialiasing,
    powerPreference: (quality === 'low' ? 'low-power' : 'high-performance') as WebGLPowerPreference,
  }), [graphicsSettings.antialiasing, quality]);

  // Show benchmark on first visit - but NOT immediately
  useEffect(() => {
    if (!benchmarkCompleted && !showBenchmark && !selectedScenario) {
      // Only show benchmark when user hasn't selected a scenario yet
      const timer = setTimeout(() => {
        setShowBenchmark(true);
      }, 2000); // Delay 2 seconds
      return () => clearTimeout(timer);
    }
  }, [benchmarkCompleted, showBenchmark, selectedScenario]);
  // Auto-select scenario from query string (e.g. ?scenario=cybersecurity for bonus modules)
  useEffect(() => {
    if (hasAutoSelected.current) return;
    const scenarioId = searchParams.get('scenario');
    if (!scenarioId) return;
    const scenario = getScenarioById(scenarioId);
    if (scenario) {
      hasAutoSelected.current = true;
      setIsInitializing(true);
      setSelectedScenario(scenario);
      setShowScenarioSelect(false);
      if (scenario.type === 'laboratory') {
        setShowFireTutorial(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Handle benchmark completion
  const handleApplyRecommended = () => {
    if (benchmarkResults) {
      setQuality(benchmarkResults.recommendedQuality);
      localStorage.setItem('benchmark-completed', 'true');
      setBenchmarkCompleted(true);
      setShowBenchmark(false);
      toast({
        title: "Qualità grafica ottimizzata",
        description: `Impostata qualità ${benchmarkResults.recommendedQuality.toUpperCase()} basata sul benchmark del tuo dispositivo.`,
      });
    }
  };

  const handleSkipBenchmark = () => {
    localStorage.setItem('benchmark-completed', 'true');
    setBenchmarkCompleted(true);
    setShowBenchmark(false);
    resetBenchmark();
    toast({
      title: "Benchmark saltato",
      description: "Puoi sempre eseguirlo dalle impostazioni grafiche.",
    });
  };

  // Load achievements and stats when scenario is selected
  useEffect(() => {
    const loadScenarioData = async () => {
      if (selectedScenario && user) {
        console.log('[Demo3D] Loading data for scenario:', selectedScenario.id);
        setIsLoadingStats(true);
        setIsInitializing(true);
        
        // Safety timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn('[Demo3D] Loading timeout - forcing initialization complete');
          setIsLoadingStats(false);
          setIsInitializing(false);
          toast({
            title: "Attenzione",
            description: "Caricamento dati completato con timeout. Alcune funzionalità potrebbero essere limitate.",
            variant: "destructive",
          });
        }, 10000); // 10 seconds timeout
        
        try {
          await Promise.all([
            // Load previous achievements for this scenario
            loadUserAchievements(selectedScenario.id).then(achievementIds => {
              console.log('[Demo3D] Loaded achievements:', achievementIds.length);
              setUnlockedAchievements(achievementIds);
            }).catch(err => {
              console.error('[Demo3D] Error loading achievements:', err);
              return [];
            }),
            // Load scenario stats
            loadScenarioStats(selectedScenario.id).then(stats => {
              console.log('[Demo3D] Loaded stats:', stats);
              setScenarioStats(stats);
            }).catch(err => {
              console.error('[Demo3D] Error loading stats:', err);
              return null;
            }),
            // Load available replays for PiP
            loadAvailableReplays(),
          ]);
        } catch (error) {
          console.error('[Demo3D] Error loading scenario data:', error);
        } finally {
          clearTimeout(timeoutId);
          console.log('[Demo3D] Data loading complete');
          setIsLoadingStats(false);
          setIsInitializing(false);
        }
      } else if (selectedScenario && !user) {
        // Non-authenticated users don't need to load stats
        console.log('[Demo3D] Scenario selected without user, skipping data load');
        setIsInitializing(false);
      }
    };

    loadScenarioData();
  }, [selectedScenario?.id, user]); // Use selectedScenario.id instead of entire object

  // Listen for pointer lock changes
  useEffect(() => {
    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement !== null;
      setIsPointerLocked(isLocked);
      console.log('[Demo3D] Pointer lock state changed:', isLocked, 'Element:', document.pointerLockElement);
    };

    const handlePointerLockError = (e: Event) => {
      console.warn('[Demo3D] Pointer lock error (usually benign - user needs to click canvas again):', e);
      setIsPointerLocked(false);
      // Don't show destructive toast — this commonly happens after closing overlays (NPC dialogs, quizzes)
      // The "Clicca per giocare" overlay already guides the user to re-activate controls
    };

    const handleClick = (e: MouseEvent) => {
      console.log('[Demo3D] Canvas clicked!', {
        target: e.target,
        gameStarted,
        isPointerLocked,
        pointerLockElement: document.pointerLockElement
      });
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('pointerlockerror', handlePointerLockError);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('pointerlockerror', handlePointerLockError);
      document.removeEventListener('click', handleClick);
    };
  }, [gameStarted, isPointerLocked]);

  // ESC key to exit game: first ESC releases pointer lock, second ESC exits to scenario selection
  const escPressedAfterUnlockRef = useRef(false);
  
  useEffect(() => {
    if (isPointerLocked) {
      escPressedAfterUnlockRef.current = false;
    }
  }, [isPointerLocked]);
  
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;
    
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      
      if (!document.pointerLockElement) {
        if (escPressedAfterUnlockRef.current) {
          resetGame();
        } else {
          escPressedAfterUnlockRef.current = true;
        }
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [gameStarted, gameCompleted]);

  const loadAvailableReplays = async () => {
    if (!selectedScenario) return;

    try {
      console.log('[Demo3D] Loading replays for scenario:', selectedScenario.id);
      
      const [userReplays, topReplays] = await Promise.all([
        user ? getUserReplays(selectedScenario.id) : Promise.resolve([]),
        getTopReplays(selectedScenario.id, 5).catch(err => {
          console.error('[Demo3D] Error loading top replays:', err);
          return [];
        }),
      ]);

      // Combine and deduplicate
      const allReplays = [...userReplays, ...topReplays];
      const uniqueReplays = allReplays.filter((replay, index, self) => 
        index === self.findIndex(r => r.id === replay.id)
      );

      console.log('[Demo3D] Loaded replays:', uniqueReplays.length);
      setAvailableReplays(uniqueReplays);
    } catch (error) {
      console.error('[Demo3D] Error in loadAvailableReplays:', error);
      setAvailableReplays([]);
    }
  };

  // Get canvas element for recording
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvasRef.current = canvas;
    }
  }, [selectedScenario]);

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      timerInterval.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      
      // Start recording if user is logged in and canvas is available
      if (user && canvasRef.current && !isRecording) {
        startRecording(canvasRef.current, {
          videoBitsPerSecond: 8000000, // 8 Mbps for 1080p
        }).catch(error => {
          console.error('Failed to start recording:', error);
        });
      }
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      
      // Stop recording when game completes
      if (isRecording && gameCompleted) {
        stopRecording();
      }
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [gameStarted, gameCompleted, user, isRecording, startRecording, stopRecording]);

  const checkAchievements = useCallback(async () => {
    if (!selectedScenario) return;

    const stats: GameStats = {
      risksFound,
      totalRisks,
      criticalRisksFound: riskFoundOrder.current.filter(id => 
        criticalRisks.some(r => r.id === id)
      ).length,
      totalCriticalRisks,
      timeElapsed,
      collisions: collisionSystem.current?.getCollisionCount() || 0,
      exploredCells: exploredCells.current,
      totalCells: 225,
      riskFoundOrder: riskFoundOrder.current,
      sprinklerRisksFound: sprinklerRisksFoundRef.current,
    };

    // Save stats to database
    if (user && gameCompleted) {
      await saveScenarioStats(selectedScenario.id, stats);
      // Reload stats to show updated values
      const updatedStats = await loadScenarioStats(selectedScenario.id);
      setScenarioStats(updatedStats);
    }

    achievements.forEach(async (achievement) => {
      if (
        !unlockedAchievements.includes(achievement.id) &&
        achievement.condition(stats)
      ) {
        setUnlockedAchievements(prev => [...prev, achievement.id]);
        
        // Save to database if user is logged in
        if (user && selectedScenario) {
          await saveAchievement(achievement.id, selectedScenario.id);
        }
        
        // Show toast notification
        const Icon = achievement.icon;
        toast({
          title: "🏆 Achievement Sbloccato!",
          description: (
            <div className="flex items-center gap-3 mt-2">
              <Icon className="w-6 h-6 text-primary" />
              <div>
                <div className="font-bold">{achievement.name}</div>
                <div className="text-sm text-muted-foreground">{achievement.description}</div>
              </div>
            </div>
          ),
          duration: 5000,
        });
      }
    });
  }, [selectedScenario?.id, risksFound, totalRisks, totalCriticalRisks, timeElapsed, gameCompleted, user, unlockedAchievements, toast]);

  // Handle replay upload when recording is complete
  useEffect(() => {
    if (recordedBlob && gameCompleted && user && selectedScenario && !isUploadingReplay) {
      handleReplayUpload();
    }
  }, [recordedBlob, gameCompleted, user, selectedScenario]);

  const handleReplayUpload = async () => {
    if (!recordedBlob || !user || !selectedScenario) return;

    setIsUploadingReplay(true);

    try {
      // Check if this is a personal record
      const isRecord = await isPersonalRecord(user.id, selectedScenario.id, score);

      if (isRecord) {
        toast({
          title: "📹 Salvando replay...",
          description: "Il tuo record personale viene salvato",
        });

        // Upload video to storage
        const videoUrl = await uploadReplayVideo(recordedBlob, user.id, selectedScenario.id);

        if (videoUrl) {
          // Save replay metadata
          await saveReplay({
            user_id: user.id,
            scenario_id: selectedScenario.id,
            video_url: videoUrl,
            score,
            time_elapsed: timeElapsed,
            collisions: collisionSystem.current?.getCollisionCount() || 0,
            achievements_unlocked: unlockedAchievements,
            is_personal_record: true,
          });

          // Cleanup old replays (keep only top 5)
          await cleanupOldReplays(user.id, selectedScenario.id);

          toast({
            title: "🎉 Replay salvato!",
            description: "Il tuo record personale è stato registrato",
          });
        }
      }
    } catch (error) {
      console.error('Error uploading replay:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il replay",
        variant: "destructive",
      });
    } finally {
      setIsUploadingReplay(false);
      resetRecording();
    }
  };

  const handleRiskFound = useCallback((riskId?: string) => {
    setRisksFound(prev => {
      const newCount = prev + 1;
      
      // Base score + sprinkler bonus (50% extra when sprinklers active)
      const basePoints = 150;
      const sprinklerMult = sprinklersActive ? 1.5 : 1;
      const quizMult = 1 + (quizCorrectAnswers * 0.1); // +10% per correct answer
      const points = Math.round(basePoints * sprinklerMult * quizMult);
      setScore(s => s + points);
      
      // Show bonus toast when sprinklers active
      if (sprinklersActive) {
        sprinklerRisksFoundRef.current += 1;
        sprinklerBonusPointsRef.current += 75; // The bonus portion
        toast({
          title: "🚿 Bonus Sprinkler! +75 pts",
          description: `Rischio #${sprinklerRisksFoundRef.current} sotto pressione — punteggio bonus!`,
          duration: 3000,
        });
      }
      
      // Track risk found order and type (manual vs procedural)
      if (riskId) {
        riskFoundOrder.current.push(riskId);
        
        // Determine if risk is manual or procedural
        const risk = selectedScenario?.risks.find(r => r.id === riskId);
        if (risk?.isManual) {
          setManualRisksFound(prev => prev + 1);
        } else {
          setProceduralRisksFound(prev => prev + 1);
        }

        // Trigger contextual cyber quiz for cybersecurity scenario
        if (selectedScenario?.id === 'cybersecurity' && risk) {
          setCyberQuizRiskId(riskId);
          setCyberQuizRiskLabel(risk.label);
        }

        // Trigger machinery quiz for construction-specific machinery risks
        if (selectedScenario?.id === 'construction' && risk && isMachineryRisk(riskId)) {
          setMachineryQuizRiskId(riskId);
          setMachineryQuizRiskLabel(risk.label);
        }
      }

      // Check achievements after each risk found
      setTimeout(() => checkAchievements(), 100);
      
      if (newCount >= totalRisks) {
        setGameCompleted(true);
        setGameStarted(false);
        // Final achievement check
        setTimeout(() => checkAchievements(), 500);
      }
      
      return newCount;
    });
  }, [selectedScenario, totalRisks, checkAchievements, sprinklersActive, quizCorrectAnswers, toast]);

  const handleCriticalRiskFound = useCallback(() => {
    // Additional tracking for critical risks if needed
  }, []);

  const handleExplorationUpdate = useCallback((cells: Set<string>) => {
    exploredCells.current = cells;
    // Check achievements on exploration milestones
    if (cells.size % 20 === 0) {
      checkAchievements();
    }
  }, [checkAchievements]);

  const handlePlayerPositionUpdate = useCallback((position: [number, number, number], rotation: number) => {
    setPlayerPosition(position);
    setPlayerRotation(rotation);
  }, []);

  const selectScenario = (scenario: Scenario3D) => {
    setIsInitializing(true);
    setSelectedScenario(scenario);
    setShowScenarioSelect(false);
    // Show fire tutorial first for fire simulation
    if (scenario.type === 'laboratory') {
      setShowFireTutorial(true);
    }
  };

  const handleExtinguisherSelect = (type: ExtinguisherType) => {
    setSelectedExtinguisher(type);
    setShowExtinguisherSelection(false);
  };

  const startGame = () => {
    if (isInitializing) return; // Prevent starting while initializing
    
    setIsInitializing(false); // Ensure initialization overlay is hidden
    setGameStarted(true);
    setGameCompleted(false);
    setRisksFound(0);
    setManualRisksFound(0);
    setProceduralRisksFound(0);
    setScore(0);
    setTimeElapsed(0);
    setFirePropagationLevel(0);
    setSprinklersActive(false);
    setFireGameOver(false);
    setExtinguisherCharge(100);
    setExtinguisherMaxCharge(100);
    setTotalSpraysUsed(0);
    prevChargeRef.current = 100;
    setFiresExtinguished(0);
    setTotalFires(0);
    setAllFiresOut(false);
    setUnlockedAchievements([]);
    sprinklerRisksFoundRef.current = 0;
    sprinklerBonusPointsRef.current = 0;
    riskFoundOrder.current = [];
    exploredCells.current = new Set();
    
    // Reset collision counter
    if (collisionSystem.current) {
      collisionSystem.current.resetCollisionCount();
    }

  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setRisksFound(0);
    setManualRisksFound(0);
    setProceduralRisksFound(0);
    setScore(0);
    setSelectedScenario(null);
    setShowScenarioSelect(true);
    setShowLeaderboard(false);
    setShowReplays(false);
    resetRecording();
    
    // Disable gyroscope when resetting
    if (isGyroEnabled) {
      disableGyro();
    }
  };

  // Quick-swap extinguisher with number keys 1-4 during fire simulation
  useEffect(() => {
    if (!gameStarted || !selectedScenario || selectedScenario.type !== 'laboratory') return;
    const TYPES: ExtinguisherType[] = ['co2', 'powder', 'foam', 'water'];
    const LABELS: Record<ExtinguisherType, string> = { co2: 'CO₂', powder: 'Polvere', foam: 'Schiuma', water: 'Acqua' };
    const handleKey = (e: KeyboardEvent) => {
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < 4) {
        const newType = TYPES[idx];
        if (newType !== selectedExtinguisher) {
          setSelectedExtinguisher(newType);
          setExtinguisherCharge(100);
          setExtinguisherMaxCharge(100);
          toast({ title: `🧯 Estintore cambiato: ${LABELS[newType]}` });
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameStarted, selectedScenario, selectedExtinguisher]);

  // Handle gyroscope toggle
  const handleGyroscopeToggle = async () => {
    if (isGyroEnabled) {
      disableGyro();
      toast({
        title: "Giroscopio Disattivato",
        description: "I controlli giroscopici sono stati disabilitati",
      });
    } else {
      await enableGyro();
      toast({
        title: "Giroscopio Attivo",
        description: "Muovi il tuo dispositivo per controllare la telecamera",
        duration: 4000,
      });
    }
  };

  // Handle mouse calibration - apply recommended sensitivity
  const handleApplyCalibration = (sensitivity: number) => {
    updateAudioSettings({ mouseSensitivity: sensitivity });
    toast({
      title: "Sensibilità Applicata",
      description: `Sensibilità mouse impostata a ${sensitivity}`,
    });
  };

  // Handle mouse calibration - close overlay
  const handleCloseCalibration = () => {
    // Calibration data is stored, user chose to keep current settings
    toast({
      title: "Sensibilità Mantenuta",
      description: "Puoi modificarla nelle impostazioni quando vuoi",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Show loading state while auth is initializing */}
      {authLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground">Inizializzazione...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Performance Benchmark - Only show when no scenario selected */}
          {showBenchmark && !selectedScenario && (
        <PerformanceBenchmark
          isRunning={isBenchmarkRunning}
          progress={benchmarkProgress}
          results={benchmarkResults}
          onStart={runBenchmark}
          onApplyRecommended={handleApplyRecommended}
          onSkip={handleSkipBenchmark}
        />
      )}

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">SicurAzienda</span>
            </Link>
            <div className="flex items-center gap-4">
              {!showScenarioSelect && (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Classifica
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowReplays(!showReplays)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Replay
                  </Button>
                </>
              )}
              <Link to="/demo">
                <Button variant="ghost">
                  <ArrowLeft className="w-4 h-4" />
                  Demo 2D
                </Button>
              </Link>
              <UserMenu />
            </div>
          </div>
          
          {/* Breadcrumb Navigation */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-1.5 font-semibold text-primary">
                  <Target className="w-4 h-4" />
                  <span>Demo 3D</span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative w-full h-[calc(100vh-80px)]">
        {showScenarioSelect && (
          <div className="absolute inset-0 z-10 overflow-y-auto bg-background/95">
            <div className="min-h-full flex items-center justify-center py-8">
            <div className="max-w-6xl mx-4 w-full">
              <Card className="p-8">
                <div className="text-center space-y-6 mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
                    <Target className="w-4 h-4" />
                    <span className="text-sm font-semibold">Demo 3D - Seleziona Scenario</span>
                  </div>
                  
                  <h1 className="text-4xl font-bold">
                    Scegli il tuo <span className="text-primary">Ambiente</span>
                  </h1>
                  
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Ogni scenario presenta rischi specifici e livelli di difficoltà diversi. 
                    Inizia con l'ufficio per familiarizzare, poi sfida te stesso con ambienti più complessi!
                  </p>
                </div>

                {/* Scenario Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {scenarios3D.map((scenario, index) => {
                    const preview = getPreviewByScenarioId(scenario.id);
                    return (
                    <Card 
                      key={scenario.id}
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={() => selectScenario(scenario)}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {preview && (
                        <Sim3dPreview
                          meta={preview}
                          className="h-48 rounded-none"
                          priority={index < 2}
                        />
                      )}
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                                {scenario.title}
                              </h3>
                              <Badge 
                                variant="outline" 
                                className={getDifficultyColor(scenario.difficulty)}
                              >
                                {getDifficultyLabel(scenario.difficulty)}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">
                              {scenario.description}
                            </p>
                          </div>
                          <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{scenario.risks.length} rischi</span>
                          </div>
                          <div className="h-4 w-px bg-border" />
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-accent" />
                            <span className="font-semibold">
                              Max {scenario.risks.length * 150} punti
                            </span>
                          </div>
                        </div>

                        <Button 
                          className="w-full" 
                          variant="hero"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectScenario(scenario);
                          }}
                        >
                          Seleziona Scenario
                        </Button>
                      </div>
                    </Card>
                    );
                  })}
                </div>
              </Card>
            </div>
            </div>
          </div>
        )}

        {/* Fire Class Tutorial (for fire simulation - shown before quiz) */}
        {showFireTutorial && selectedScenario?.type === 'laboratory' && (
          <FireClassTutorial
            onComplete={() => {
              setShowFireTutorial(false);
              setShowFireQuiz(true);
            }}
            onBack={() => {
              setShowFireTutorial(false);
              setShowScenarioSelect(true);
              setSelectedScenario(null);
            }}
          />
        )}

        {/* Fire Class Quiz (after tutorial, before extinguisher selection) */}
        {showFireQuiz && selectedScenario?.type === 'laboratory' && (
          <FireClassQuiz
            onComplete={(correctScore, total) => {
              setShowFireQuiz(false);
              setShowExtinguisherSelection(true);
              setQuizCorrectAnswers(correctScore);
              const bonusPts = correctScore * 100;
              setQuizBonusPoints(bonusPts);
              if (bonusPts > 0) {
                setScore(s => s + bonusPts);
              }
              if (correctScore === total) {
                toast({
                  title: "🎯 Quiz Perfetto! +300 bonus",
                  description: `${correctScore}/${total} corrette — moltiplicatore x1.3 attivo durante la simulazione!`,
                });
              } else if (correctScore > 0) {
                toast({
                  title: `📝 Quiz: ${correctScore}/${total} — +${bonusPts} bonus`,
                  description: `Moltiplicatore x${(1 + correctScore * 0.1).toFixed(1)} attivo!`,
                });
              } else {
                toast({
                  title: `📝 Quiz completato: 0/${total}`,
                  description: "Nessun bonus. Ricorda le classi di fuoco!",
                });
              }
            }}
            onBack={() => {
              setShowFireQuiz(false);
              setShowFireTutorial(true);
            }}
          />
        )}

        {/* Extinguisher Selection (for fire simulation) */}
        {showExtinguisherSelection && selectedScenario?.type === 'laboratory' && (
          <ExtinguisherSelection
            onSelect={handleExtinguisherSelect}
            onBack={() => {
              setShowExtinguisherSelection(false);
              setShowFireQuiz(true);
            }}
          />
        )}

        {!gameStarted && !gameCompleted && selectedScenario && !showScenarioSelect && !showExtinguisherSelection && !showFireTutorial && !showFireQuiz && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/95">
            <Card className="p-8 max-w-2xl mx-4">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-semibold">Demo 3D - Prima Persona</span>
                </div>
                
                <h1 className="text-4xl font-bold">
                  {selectedScenario.title} <span className="text-primary">3D</span>
                </h1>
                
                <Badge 
                  variant="outline" 
                  className={`text-lg px-4 py-1 ${getDifficultyColor(selectedScenario.difficulty)}`}
                >
                  Difficoltà: {getDifficultyLabel(selectedScenario.difficulty)}
                </Badge>
                
                <p className="text-lg text-muted-foreground">
                  {selectedScenario.description}
                </p>

                <div className="bg-muted/30 rounded-lg p-6 space-y-4 text-left">
                  <h3 className="font-bold text-lg">Come Giocare:</h3>
                  <ul className="space-y-2 text-sm">
                    {!isTouchDevice ? (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="font-mono bg-primary/10 px-2 py-1 rounded">W A S D</span>
                          <span>Muoviti nell'ambiente (avanti, sinistra, indietro, destra)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-mono bg-primary/10 px-2 py-1 rounded">MOUSE</span>
                          <span>Guarda intorno e punta ai rischi</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-mono bg-primary/10 px-2 py-1 rounded">CLICK</span>
                          <span>Identifica i rischi di sicurezza (evidenziati in rosso)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-mono bg-primary/10 px-2 py-1 rounded">ESC</span>
                          <span>Esci dal controllo mouse (per tornare al menu)</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="font-mono bg-primary/10 px-2 py-1 rounded">JOYSTICK</span>
                          <span>Trascina il joystick virtuale per muoverti (in basso a sinistra)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-mono bg-primary/10 px-2 py-1 rounded">SWIPE</span>
                          <span>Scorri sullo schermo per guardare intorno</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-mono bg-primary/10 px-2 py-1 rounded">TAP</span>
                          <span>Tocca lo schermo per identificare i rischi di sicurezza</span>
                        </li>
                        {isGyroSupported && (
                          <li className="flex items-start gap-2">
                            <span className="font-mono bg-primary/10 px-2 py-1 rounded">GYRO</span>
                            <span>Attiva il giroscopio (pulsante in basso a destra) per ruotare la telecamera muovendo il dispositivo</span>
                          </li>
                        )}
                      </>
                    )}
                  </ul>
                </div>

                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>{totalRisks} rischi da trovare</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Max {totalRisks * 150} punti</span>
                  </div>
                </div>

                {/* Split-Screen Replay Selector */}
                {availableReplays.length > 0 && (
                  <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-accent" />
                        <h4 className="font-semibold text-sm">Confronto Split-Screen</h4>
                      </div>
                      {(pipReplay1 || pipReplay2) && (
                        <Badge variant="outline" className="text-xs">
                          {pipReplay1 && pipReplay2 ? '2 replay attivi' : '1 replay attivo'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Visualizza fino a due replay side-by-side durante il gioco per analisi comparativa avanzata
                    </p>
                    
                    {/* Replay 1 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Replay 1</span>
                        {pipReplay1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPipReplay1(null)}
                            className="h-6 text-xs text-destructive"
                          >
                            Rimuovi
                          </Button>
                        )}
                      </div>
                      {pipReplay1 ? (
                        <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded">
                          <Trophy className="w-3 h-3 text-primary" />
                          <span className="text-xs font-semibold">{pipReplay1.score} pts</span>
                          <span className="text-xs text-muted-foreground">
                            {Math.floor(pipReplay1.time_elapsed / 60)}:{(pipReplay1.time_elapsed % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowReplaySelector1(true)}
                          className="w-full text-xs"
                        >
                          Seleziona Replay 1
                        </Button>
                      )}
                    </div>

                    {/* Replay 2 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Replay 2</span>
                        {pipReplay2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPipReplay2(null)}
                            className="h-6 text-xs text-destructive"
                          >
                            Rimuovi
                          </Button>
                        )}
                      </div>
                      {pipReplay2 ? (
                        <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded">
                          <Trophy className="w-3 h-3 text-primary" />
                          <span className="text-xs font-semibold">{pipReplay2.score} pts</span>
                          <span className="text-xs text-muted-foreground">
                            {Math.floor(pipReplay2.time_elapsed / 60)}:{(pipReplay2.time_elapsed % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowReplaySelector2(true)}
                          className="w-full text-xs"
                        >
                          Seleziona Replay 2
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={startGame}
                    variant="hero"
                    size="lg"
                    className="text-lg px-8"
                    disabled={isInitializing}
                  >
                    {isInitializing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                        Caricamento...
                      </>
                    ) : (
                      'Inizia Demo 3D'
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowScenarioSelect(true)}
                    variant="outline"
                    size="lg"
                  >
                    Cambia Scenario
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {gameCompleted && !showAchievements && !briefingActive && selectedScenario && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/95 overflow-y-auto py-8">
            <GameResults3D
              scenario={selectedScenario}
              score={score}
              timeElapsed={timeElapsed}
              manualRisksFound={manualRisksFound}
              totalManualRisks={totalManualRisks}
              proceduralRisksFound={proceduralRisksFound}
              totalProceduralRisks={totalProceduralRisks}
              collisions={collisionSystem.current?.getCollisionCount() || 0}
              sprinklerBonusPoints={sprinklerBonusPointsRef.current}
              sprinklerRisksFound={sprinklerRisksFoundRef.current}
              risksFoundIds={riskFoundOrder.current}
              cyberQuizStats={selectedScenario.id === 'cybersecurity' && cyberQuizTotal > 0 ? {
                correct: cyberQuizCorrect,
                total: cyberQuizTotal,
                bonusPoints: cyberQuizCorrect * 75,
              } : undefined}
              firePerformance={selectedScenario.type === 'laboratory' && selectedExtinguisher ? {
                extinguisherType: selectedExtinguisher,
                firesExtinguished,
                totalFires,
                totalSpraysUsed,
                fireDetails: [
                  { fireIndex: 0, fireClass: 'electrical' as const, hitsUsed: 0, isExtinguished: firesExtinguished > 0, isCorrectType: selectedExtinguisher === 'co2' },
                  { fireIndex: 1, fireClass: 'solid' as const, hitsUsed: 0, isExtinguished: firesExtinguished > 1, isCorrectType: selectedExtinguisher === 'water' || selectedExtinguisher === 'powder' || selectedExtinguisher === 'foam' },
                  { fireIndex: 2, fireClass: 'electrical' as const, hitsUsed: 0, isExtinguished: firesExtinguished > 2, isCorrectType: selectedExtinguisher === 'co2' },
                ],
              } : undefined}
              onRestart={() => {
                setGameCompleted(false);
                startGame();
              }}
              onChangeScenario={() => {
                resetGame();
              }}
              onReplayBriefing={() => {
                setBriefingIndex(0);
                setBriefingActive(true);
              }}
            />
          </div>
        )}

        {/* Briefing 3D Overlay */}
        {briefingActive && selectedScenario && selectedScenario.risks[briefingIndex] && (
          <ScenarioBriefingOverlay
            risk={selectedScenario.risks[briefingIndex]}
            index={briefingIndex}
            total={selectedScenario.risks.length}
            onClose={() => setBriefingActive(false)}
          />
        )}

        {/* Achievements Panel */}
        {showAchievements && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/95 overflow-y-auto py-8">
            <div className="max-w-3xl mx-4 w-full space-y-4">
              <AchievementsPanel
                achievements={achievements}
                unlockedIds={unlockedAchievements}
              />
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setShowAchievements(false)} size="lg">
                  Chiudi
                </Button>
                <Button onClick={resetGame} variant="outline" size="lg">
                  Rigioca
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Panel */}
        {showLeaderboard && !gameStarted && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/95 overflow-y-auto py-8">
            <div className="max-w-4xl mx-4 w-full space-y-4">
              <Leaderboard />
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setShowLeaderboard(false)} size="lg">
                  Chiudi
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Replay Viewer Panel */}
        {showReplays && !gameStarted && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/95 overflow-y-auto py-8">
            <div className="max-w-5xl mx-4 w-full space-y-4">
              <ReplayViewer />
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setShowReplays(false)} size="lg">
                  Chiudi
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Replay Selector Dialogs */}
        <ReplaySelectorDialog
          open={showReplaySelector1}
          onOpenChange={setShowReplaySelector1}
          replays={availableReplays}
          selectedReplay={pipReplay1}
          onSelectReplay={setPipReplay1}
          currentUserId={user?.id}
        />
        <ReplaySelectorDialog
          open={showReplaySelector2}
          onOpenChange={setShowReplaySelector2}
          replays={availableReplays}
          selectedReplay={pipReplay2}
          onSelectReplay={setPipReplay2}
          currentUserId={user?.id}
        />

        {/* 3D Canvas */}
        {memoizedScenario && !showScenarioSelect && !isInitializing && (
          <div className="absolute inset-0 w-full h-full">
            {/* Instruction Overlay - appears before pointer lock is active */}
            {/* Hint overlay - non-blocking, just a small banner at top */}
            {gameStarted && !isPointerLocked && (
              <div 
                className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
              >
                <div className="bg-background/90 backdrop-blur-sm border border-primary/30 rounded-lg px-6 py-3 text-center shadow-lg animate-pulse">
                  <p className="text-sm text-muted-foreground">
                    Usa <span className="font-mono bg-primary/10 px-2 py-0.5 rounded font-bold">WASD</span> per muoverti e il <span className="font-bold">mouse</span> per guardarti intorno
                  </p>
                </div>
              </div>
            )}

            {/* Controls Status Indicator - Always visible when game started */}
            {gameStarted && (
              <div className="absolute top-4 right-4 z-40">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg backdrop-blur-md border-2 transition-all duration-300 shadow-lg bg-primary/20 border-primary text-primary">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Controlli Attivi</span>
                    <span className="text-xs opacity-80">WASD + Mouse</span>
                  </div>
                </div>
              </div>
            )}
        {/* Cybersecurity Contextual Quiz Overlay */}
        {cyberQuizRiskId && (
          <CyberRiskQuiz
            riskId={cyberQuizRiskId}
            riskLabel={cyberQuizRiskLabel}
            onClose={(bonusPoints, isCorrect) => {
              setCyberQuizTotal(prev => prev + 1);
              if (bonusPoints > 0) {
                setScore(s => s + bonusPoints);
                setCyberQuizCorrect(prev => prev + 1);
                setQuizCorrectAnswers(prev => prev + 1);
                setQuizBonusPoints(prev => prev + bonusPoints);
              }
              setCyberQuizRiskId(null);
              setCyberQuizRiskLabel('');
            }}
          />
        )}

        {/* Machinery Contextual Quiz Overlay (construction scenario) */}
        {machineryQuizRiskId && (
          <MachineryRiskQuiz
            riskId={machineryQuizRiskId}
            riskLabel={machineryQuizRiskLabel}
            onClose={(bonusPoints, isCorrect) => {
              if (bonusPoints !== 0) {
                setScore((s) => Math.max(0, s + bonusPoints));
                if (isCorrect) {
                  setQuizCorrectAnswers((p) => p + 1);
                  setQuizBonusPoints((p) => p + bonusPoints);
                }
              }
              setMachineryQuizRiskId(null);
              setMachineryQuizRiskLabel("");
            }}
          />
        )}

        {/* Camera presets — only for the construction scenario, only while playing */}
        {selectedScenario?.id === "construction" && gameStarted && !gameCompleted && (
          <div className="hidden sm:block absolute bottom-4 right-4 z-40 w-44">
            <CameraPresetsPanel
              active={cameraPreset}
              onChange={(name) => {
                setCameraPreset(name);
                window.dispatchEvent(
                  new CustomEvent("babylon-camera-preset", { detail: { name } })
                );
              }}
            />
          </div>
        )}


            <BabylonScene
              scenario={memoizedScenario}
              onRiskFound={handleRiskFound}
              risksFoundIds={riskFoundOrder.current}
              quality={quality}
              isActive={gameStarted}
              audioSettings={audioSettings}
              
              extinguisherType={selectedExtinguisher || undefined}
              onFirePropagationChange={(level: number) => {
                setFirePropagationLevel(level);
                // Trigger game over at 100% propagation
                if (level >= 1 && gameStarted && !fireGameOver && selectedScenario?.type === 'laboratory') {
                  setFireGameOver(true);
                  setGameStarted(false);
                  setScore(prev => Math.max(0, Math.floor(prev * 0.5)));
                }
              }}
              onSprinklerStatusChange={(active: boolean) => setSprinklersActive(active)}
              onChargeChange={(charge: number, max: number) => {
                // Track sprays used
                if (charge < prevChargeRef.current) {
                  setTotalSpraysUsed(prev => prev + 1);
                }
                prevChargeRef.current = charge;
                setExtinguisherCharge(charge);
                setExtinguisherMaxCharge(max);
              }}
              onFireExtinguished={(extinguished: number, total: number) => {
                setFiresExtinguished(extinguished);
                setTotalFires(total);
                if (extinguished >= total && total > 0 && !allFiresOut) {
                  setAllFiresOut(true);
                  // Victory bonus points
                  setScore(s => s + 500);
                }
              }}
              onExtinguisherSwap={(newType: ExtinguisherType) => {
                setSelectedExtinguisher(newType);
              }}
              onPositionUpdate={handlePlayerPositionUpdate}
              visualSettings={visualSettings}
              briefingActive={briefingActive}
              onBriefingStep={(idx) => setBriefingIndex(idx)}
              onBriefingComplete={() => setBriefingActive(false)}
              uniformFillConfig={{ preset: fillPreset, density: fillDensity, seed: fillSeed, perWall: fillPerWall }}
              onAimAtFire={setAimingAtFire}
              onAimAtFireIndex={setAimedFireIndex}
              readabilityMode={readabilityMode}
            />

            {gameStarted && memoizedScenario?.type === 'office' && (
              <SceneDebugOverlay
                scenarioType={memoizedScenario.type}
                initialPreset={fillPreset}
                initialDensity={fillDensity}
                initialSeed={fillSeed}
                initialPerWall={fillPerWall}
                onReseed={({ preset, density, seed, perWall }) => {
                  setFillPreset(preset);
                  setFillDensity(density);
                  setFillSeed(seed);
                  setFillPerWall(perWall);
                }}
              />
            )}

            {/* WebAudio diagnostics chip — verifies scenario sound effects */}
            <AudioDiagnosticsHUD />

            {/* Contextual Hints System */}
            {gameStarted && !gameCompleted && memoizedScenario && (
              <ContextualHints
                playerPosition={playerPosition}
                risksFound={risksFound}
                totalRisks={totalRisks}
                isActive={gameStarted}
                timeElapsed={timeElapsed}
                scenarioStats={scenarioStats}
                unlockedAchievements={unlockedAchievements}
              />
            )}

            {/* Player Level Indicator */}
            {gameStarted && user && (
              <PlayerLevelIndicator
                scenarioStats={scenarioStats}
                unlockedAchievements={unlockedAchievements}
              />
            )}

            {/* Graphics Settings */}
            <GraphicsSettings
              currentQuality={quality}
              onQualityChange={(newQuality) => {
                setQuality(newQuality);
                toast({
                  title: "Qualità grafica aggiornata",
                  description: `Impostata qualità ${newQuality.toUpperCase()}. Le modifiche si applicano al prossimo caricamento.`,
                });
              }}
              audioSettings={audioSettings}
              onAudioSettingsChange={updateAudioSettings}
              visualSettings={visualSettings}
              onVisualSettingsChange={updateVisualSettings}
              onRecalibrateExposure={triggerRecalibration}
              isOpen={showGraphicsSettings}
              onToggle={() => setShowGraphicsSettings(!showGraphicsSettings)}
              onRunBenchmark={() => {
                localStorage.removeItem('benchmark-completed');
                setBenchmarkCompleted(false);
                setShowBenchmark(true);
              }}
            />

            {/* Loading Overlay */}
            {isInitializing && !gameStarted && memoizedScenario && (
              <LoadingOverlay scenarioTitle={memoizedScenario.title} scenarioId={memoizedScenario.id} />
            )}



            {/* Picture-in-Picture Replay Overlays (Split-Screen) */}
            {pipReplay1 && gameStarted && (
              <PictureInPictureReplay
                replay={pipReplay1}
                userName={pipReplay1.user_id === user?.id ? "Il Tuo Replay #1" : `Top Player #1 (${pipReplay1.score} pts)`}
                onClose={() => setPipReplay1(null)}
                currentGameTime={timeElapsed}
                defaultPosition={{ x: 20, y: 20 }}
              />
            )}
            {pipReplay2 && gameStarted && (
              <PictureInPictureReplay
                replay={pipReplay2}
                userName={pipReplay2.user_id === user?.id ? "Il Tuo Replay #2" : `Top Player #2 (${pipReplay2.score} pts)`}
                onClose={() => setPipReplay2(null)}
                currentGameTime={timeElapsed}
                defaultPosition={{ x: -340, y: 20 }}
              />
            )}

            {/* Risk Indicator HUD */}
            {gameStarted && (
              <RiskIndicator
                playerPosition={playerPosition}
                playerRotation={playerRotation}
                risks={selectedScenario.risks}
                maxDistance={8}
              />
            )}

            {/* Proximity Radar */}
            {gameStarted && (
              <ProximityRadar
                playerPosition={playerPosition}
                playerRotation={playerRotation}
                risks={selectedScenario.risks}
                maxDistance={12}
              />
            )}

            {/* Fire Danger Bar HUD */}
            {gameStarted && (
              <FireDangerBar
                level={firePropagationLevel}
                visible={selectedScenario.type === 'laboratory'}
              />
            )}

            {/* Sprinkler Status HUD */}
            {gameStarted && (
              <SprinklerStatusHUD
                active={sprinklersActive}
                slowdownPercent={70}
                fireLevel={firePropagationLevel}
                visible={selectedScenario.type === 'laboratory'}
              />
            )}

            {/* Crosshair (precision aim) */}
            <Crosshair
              visible={gameStarted && selectedScenario.type === 'laboratory'}
              aimingAtFire={aimingAtFire}
              empty={extinguisherCharge <= 0}
            />

            {/* Extinguisher Type HUD */}
            {gameStarted && selectedExtinguisher && (
              <ExtinguisherTypeHUD
                type={selectedExtinguisher}
                visible={selectedScenario.type === 'laboratory'}
              />
            )}

            {/* No-extinguisher warning (always visible when laboratory & none selected) */}
            {gameStarted && !selectedExtinguisher && selectedScenario.type === 'laboratory' && (
              <div className="absolute bottom-36 right-4 z-30 pointer-events-none">
                <div className="px-3 py-2 rounded-lg bg-destructive/20 border-2 border-destructive backdrop-blur-md animate-pulse">
                  <span className="text-xs font-bold text-destructive">⚠️ Nessun estintore selezionato</span>
                </div>
              </div>
            )}

            {/* Extinguisher Charge HUD */}
            {gameStarted && selectedExtinguisher && (
              <ExtinguisherChargeHUD
                charge={extinguisherCharge}
                maxCharge={extinguisherMaxCharge}
                extinguisherType={selectedExtinguisher}
                visible={selectedScenario.type === 'laboratory'}
              />
            )}

            {/* Fire Vignette Overlay */}
            {gameStarted && (
              <FireVignetteOverlay
                level={firePropagationLevel}
                visible={selectedScenario.type === 'laboratory'}
              />
            )}

            {/* Fire Class HUD + Readability toggle (laboratory only) */}
            {gameStarted && selectedScenario.type === 'laboratory' && (
              <>
                <FireClassHUD aimedFireIndex={aimedFireIndex} />
                <ReadabilityToggle
                  enabled={readabilityMode}
                  onToggle={setReadabilityMode}
                />
              </>
            )}

            {/* Evacuation Countdown */}
            {gameStarted && (
              <EvacuationCountdown
                fireLevel={firePropagationLevel}
                visible={selectedScenario.type === 'laboratory'}
                totalSeconds={30}
                onCountdownEnd={() => {
                  if (!fireGameOver) {
                    setFireGameOver(true);
                    setGameStarted(false);
                    setScore(prev => Math.max(0, Math.floor(prev * 0.5)));
                  }
                }}
              />
            )}

            {/* Fire Game Over */}
            {fireGameOver && selectedScenario && (
              <FireGameOver
                score={score}
                risksFound={risksFound}
                totalRisks={totalRisks}
                timeElapsed={timeElapsed}
                onRestart={() => {
                  setFireGameOver(false);
                  startGame();
                }}
                onChangeScenario={() => {
                  setFireGameOver(false);
                  resetGame();
                }}
              />
            )}

            {/* Mini-Map */}
            {gameStarted && (
              <MiniMap
                playerPosition={playerPosition}
                playerRotation={playerRotation}
                risks={selectedScenario.risks}
                scenarioType={selectedScenario.type}
              />
            )}

            {/* Keyboard Indicator */}
            {gameStarted && !isTouchDevice && (
              <KeyboardIndicator keysPressed={keysPressed} />
            )}

            {/* Virtual Joystick (Touch Devices Only) */}
            {gameStarted && isTouchDevice && (
              <VirtualJoystick
                onMove={handleJoystickMove}
                onEnd={resetMovement}
              />
            )}

            {/* Gyroscope Toggle (Mobile Devices Only) */}
            {gameStarted && isTouchDevice && (
              <GyroscopeToggle
                isSupported={isGyroSupported}
                isEnabled={isGyroEnabled}
                onToggle={handleGyroscopeToggle}
              />
            )}
          </div>
        )}

        {/* HUD Overlay */}
        {gameStarted && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <Card className="px-6 py-3 bg-card/90 backdrop-blur-sm border-primary/20">
              <div className="flex items-center gap-6 text-sm">
                {isRecording && user && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="font-bold text-red-500">REC</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                  </>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-semibold">
                    {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-semibold">
                    Rischi: {risksFound}/{totalRisks}
                  </span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent" />
                  <span className="font-semibold">Punti: {score}</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold">{unlockedAchievements.length}</span>
                </div>
                {selectedScenario?.type === 'laboratory' && totalFires > 0 && (
                  <>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold">
                        {firesExtinguished}/{totalFires}
                      </span>
                      {allFiresOut && (
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
                      )}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Fire Victory Celebration Overlay */}
        {allFiresOut && gameStarted && (
          <FireVictoryOverlay 
            bonusPoints={500}
            onComplete={() => {/* overlay auto-hides */}}
          />
        )}

        {gameStarted && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-primary/20">
              <p className="text-xs text-muted-foreground text-center">
                Clicca per bloccare il mouse • ESC per uscire • WASD per muoverti
              </p>
            </div>
          </div>
        )}
      </main>
      <Toaster />
        </>
      )}
    </div>
  );
};

export default Demo3D;
