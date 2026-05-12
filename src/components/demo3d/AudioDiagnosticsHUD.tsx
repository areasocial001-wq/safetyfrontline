import { useEffect, useState } from 'react';
import { Volume2, VolumeX, AlertTriangle, CheckCircle2, MicOff } from 'lucide-react';
import {
  subscribeAudioStats,
  unlockAllAudioContexts,
  type AudioCtxStats,
} from '@/lib/audio-context-unlock';

/**
 * Floating diagnostics chip showing the live state of every WebAudio
 * AudioContext registered through `registerAudioContext`. Helps verify
 * that the procedural sound system (fire ambience, NPCs, extinguisher
 * SFX, soundtrack) is actually running during the /demo-3d session.
 *
 * States:
 *  - none      → no contexts created yet
 *  - suspended → blocked by browser autoplay policy (click to resume)
 *  - running   → audio is active
 *  - mixed     → some contexts running, some suspended
 *  - closed    → all contexts have been disposed
 */
export function AudioDiagnosticsHUD() {
  const [stats, setStats] = useState<AudioCtxStats>({
    total: 0, running: 0, suspended: 0, closed: 0,
    allRunning: false, state: 'none',
  });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => subscribeAudioStats(setStats), []);

  const palette: Record<AudioCtxStats['state'], { bg: string; text: string; border: string; label: string; Icon: typeof Volume2 }> = {
    none:      { bg: 'bg-muted/80',          text: 'text-muted-foreground',   border: 'border-border',         label: 'Audio: in attesa', Icon: MicOff },
    suspended: { bg: 'bg-amber-500/15',      text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/40', label: 'Audio sospeso (click)', Icon: VolumeX },
    running:   { bg: 'bg-emerald-500/15',    text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/40', label: 'Audio attivo', Icon: CheckCircle2 },
    mixed:     { bg: 'bg-amber-500/15',      text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/40', label: 'Audio parziale', Icon: AlertTriangle },
    closed:    { bg: 'bg-muted/60',          text: 'text-muted-foreground',   border: 'border-border',         label: 'Audio chiuso', Icon: VolumeX },
  };

  const cfg = palette[stats.state];
  const Icon = cfg.Icon;

  const handleClick = () => {
    if (stats.state === 'suspended' || stats.state === 'mixed') {
      unlockAllAudioContexts();
    }
    setExpanded(e => !e);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 select-none">
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold backdrop-blur-md shadow-md transition-all hover:scale-105 ${cfg.bg} ${cfg.text} ${cfg.border}`}
        title="Diagnostica WebAudio — click per espandere / sbloccare"
      >
        <Icon className={`h-4 w-4 ${stats.state === 'running' ? 'animate-pulse' : ''}`} />
        <span>{cfg.label}</span>
        <span className="ml-1 rounded-full bg-background/40 px-1.5 py-0.5 text-[10px] font-mono">
          {stats.running}/{Math.max(stats.total - stats.closed, 0)}
        </span>
      </button>

      {expanded && (
        <div className={`mt-2 w-56 rounded-lg border p-3 text-xs backdrop-blur-md shadow-lg bg-background/85 ${cfg.border}`}>
          <div className="mb-2 font-bold uppercase tracking-wide text-foreground">
            WebAudio diagnostics
          </div>
          <div className="space-y-1 font-mono text-[11px] text-foreground/80">
            <div className="flex justify-between"><span>Contesti totali</span><span>{stats.total}</span></div>
            <div className="flex justify-between"><span>Running</span><span className="text-emerald-500">{stats.running}</span></div>
            <div className="flex justify-between"><span>Suspended</span><span className="text-amber-500">{stats.suspended}</span></div>
            <div className="flex justify-between"><span>Closed</span><span className="text-muted-foreground">{stats.closed}</span></div>
          </div>
          {(stats.state === 'suspended' || stats.state === 'mixed') && (
            <p className="mt-2 text-[10px] text-amber-600 dark:text-amber-400">
              Click qualunque punto della scena per sbloccare l'audio (policy autoplay del browser).
            </p>
          )}
          {stats.state === 'running' && (
            <p className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400">
              Tutti i contesti audio sono attivi. Effetti sonori operativi.
            </p>
          )}
          {stats.state === 'none' && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Nessun contesto audio creato. Avvia uno scenario 3D per attivare il sound system.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
