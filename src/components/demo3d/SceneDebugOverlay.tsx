import { useEffect, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Bug, Camera, RefreshCw, Save, Settings2 } from 'lucide-react';
import {
  toggleSceneDebug,
  isDebugActive,
} from './scene-modules/scene-debug';
import { runVisualRegression } from './scene-modules/visual-regression';
import type { SceneDensityMetrics } from './scene-modules/scene-metrics';
import {
  buildUniformFillConfig,
  savePersistedSettings,
  type UniformFillDensity,
  type UniformFillPreset,
  type PerWallMultipliers,
  DEFAULT_PER_WALL,
} from './scene-modules/uniform-fill-config';

interface SceneDebugOverlayProps {
  scenarioType: string;
  onReseed?: (cfg: {
    preset: UniformFillPreset;
    density: UniformFillDensity;
    seed: number;
    perWall: PerWallMultipliers;
  }) => void;
  initialPreset?: UniformFillPreset;
  initialDensity?: UniformFillDensity;
  initialSeed?: number;
  initialPerWall?: PerWallMultipliers;
}

const getActive = () =>
  (window as unknown as { __activeBabylon?: { scene: BABYLON.Scene; camera: BABYLON.UniversalCamera; engine: BABYLON.Engine } }).__activeBabylon;

export const SceneDebugOverlay = ({
  scenarioType,
  onReseed,
  initialPreset = 'office',
  initialDensity = 'medium',
  initialSeed = 1337,
  initialPerWall = DEFAULT_PER_WALL,
}: SceneDebugOverlayProps) => {
  const [open, setOpen] = useState(false);
  const [debugOn, setDebugOn] = useState(false);
  const [metrics, setMetrics] = useState<SceneDensityMetrics | null>(null);
  const [preset, setPreset] = useState<UniformFillPreset>(initialPreset);
  const [density, setDensity] = useState<UniformFillDensity>(initialDensity);
  const [seed, setSeed] = useState(initialSeed);
  const [perWall, setPerWall] = useState<PerWallMultipliers>(initialPerWall);
  const [showWallPanel, setShowWallPanel] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyM' && (e.altKey || e.shiftKey)) setOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const update = () => {
      const w = window as unknown as { __sceneMetrics?: Record<string, SceneDensityMetrics> };
      const m = w.__sceneMetrics?.[scenarioType];
      if (m) setMetrics(m);
    };
    update();
    window.addEventListener('scene-metrics-updated', update);
    return () => window.removeEventListener('scene-metrics-updated', update);
  }, [scenarioType]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-3 left-3 z-50 rounded-full bg-background/80 p-2 backdrop-blur border border-border shadow-md hover:bg-accent"
        title="Debug overlay (Alt+M)"
      >
        <Bug className="h-4 w-4" />
      </button>
    );
  }

  const cfg = buildUniformFillConfig({ preset, density, seed, perWall });
  const apply = (persist: boolean) => {
    onReseed?.({ preset, density, seed, perWall });
    if (persist) {
      savePersistedSettings(scenarioType, {
        preset, density, seed, perWall,
        centerExclusionRadius: cfg.centerExclusionRadius,
      });
    }
    toast.success(
      `Reseeded · ${preset}/${density}/${seed} · walls N:${perWall.N} S:${perWall.S} E:${perWall.E} W:${perWall.W}`
    );
  };

  const updateWall = (key: keyof PerWallMultipliers, value: number) => {
    setPerWall((prev) => ({ ...prev, [key]: Number(value.toFixed(2)) }));
  };

  const wallEmpties = (w: 'N' | 'S' | 'E' | 'W') =>
    metrics?.segments.filter((s) => s.wall === w && s.empty).length ?? 0;

  return (
    <div className="fixed bottom-3 left-3 z-50 w-[22rem] rounded-lg border border-border bg-background/95 p-3 backdrop-blur shadow-xl text-xs max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-semibold">
          <Bug className="h-3.5 w-3.5" /> Scene Debug
        </div>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">×</button>
      </div>

      {/* Density metrics */}
      <div className="mb-3">
        <div className="font-medium mb-1">Density · {metrics?.total ?? 0} props</div>
        {metrics && (
          <>
            <div className="grid grid-cols-5 gap-1 mb-1">
              {(['N', 'E', 'S', 'W', 'interior'] as const).map((w) => {
                const v = metrics.perWall[w];
                const lo = v < metrics.thresholds.min;
                const hi = v > metrics.thresholds.max;
                return (
                  <Badge key={w} variant={lo ? 'destructive' : hi ? 'secondary' : 'outline'}>
                    {w}:{v}
                  </Badge>
                );
              })}
            </div>
            <div className="grid grid-cols-4 gap-1 mb-1">
              {(['NW', 'NE', 'SW', 'SE'] as const).map((q) => (
                <Badge key={q} variant="outline">{q}:{metrics.perQuadrant[q]}</Badge>
              ))}
            </div>
            {/* Per-wall empty segment indicator */}
            <div className="grid grid-cols-4 gap-1">
              {(['N', 'E', 'S', 'W'] as const).map((w) => {
                const empties = wallEmpties(w);
                return (
                  <Badge key={`seg-${w}`} variant={empties > 0 ? 'destructive' : 'outline'}>
                    {w} empty:{empties}
                  </Badge>
                );
              })}
            </div>
            {metrics.warnings.length > 0 && (
              <ul className="mt-2 text-destructive list-disc pl-4 space-y-0.5">
                {metrics.warnings.slice(0, 5).map((w) => <li key={w}>{w}</li>)}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Preset / density / seed */}
      <div className="mb-3 space-y-2">
        <div className="font-medium">Uniform fill</div>
        <div className="flex gap-1">
          {(['office', 'aula'] as UniformFillPreset[]).map((p) => (
            <Button key={p} size="sm" variant={preset === p ? 'default' : 'outline'} className="h-6 px-2 text-[10px]"
              onClick={() => setPreset(p)}>{p}</Button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['low', 'medium', 'high'] as UniformFillDensity[]).map((d) => (
            <Button key={d} size="sm" variant={density === d ? 'default' : 'outline'} className="h-6 px-2 text-[10px]"
              onClick={() => setDensity(d)}>{d}</Button>
          ))}
        </div>
        <div className="flex gap-1 items-center">
          <input
            type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value))}
            className="flex-1 h-6 px-2 rounded border border-input bg-background text-xs"
          />
          <Button size="sm" variant="outline" className="h-6 px-2"
            onClick={() => setSeed(Math.floor(Math.random() * 1e9))}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>

        {/* Per-wall multipliers */}
        <Button size="sm" variant="ghost" className="w-full h-6 justify-between text-[10px]"
          onClick={() => setShowWallPanel((v) => !v)}>
          <span><Settings2 className="h-3 w-3 inline mr-1" /> Per-wall density</span>
          <span>{showWallPanel ? '▴' : '▾'}</span>
        </Button>
        {showWallPanel && (
          <div className="space-y-1.5 rounded border border-border p-2">
            {(['N', 'S', 'E', 'W', 'interior'] as const).map((w) => (
              <div key={w} className="flex items-center gap-2">
                <span className="w-16 text-muted-foreground">{w}</span>
                <Slider
                  value={[perWall[w] * 100]}
                  onValueChange={([v]) => updateWall(w, v / 100)}
                  min={0} max={200} step={5}
                  className="flex-1"
                />
                <span className="w-10 text-right tabular-nums">{perWall[w].toFixed(2)}×</span>
              </div>
            ))}
            <Button size="sm" variant="ghost" className="w-full h-5 text-[10px]"
              onClick={() => setPerWall(DEFAULT_PER_WALL)}>Reset</Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-1">
          <Button size="sm" className="h-7" onClick={() => apply(false)}>Apply</Button>
          <Button size="sm" variant="secondary" className="h-7" onClick={() => apply(true)}>Apply &amp; save</Button>
        </div>
        <div className="text-[10px] text-muted-foreground">
          wallSteps={cfg.wallSteps} · grid={cfg.interiorGrid} · exclR={cfg.centerExclusionRadius}
        </div>
      </div>

      {/* Debug toggles */}
      <div className="space-y-1">
        <Button size="sm" variant={debugOn ? 'default' : 'outline'} className="w-full h-7"
          onClick={() => {
            const a = getActive(); if (!a) return;
            toggleSceneDebug(a.scene, scenarioType);
            setDebugOn(isDebugActive());
          }}>
          {debugOn ? 'Hide' : 'Show'} heatmap / bbox / no-go
        </Button>
        <Button size="sm" variant="outline" className="w-full h-7"
          onClick={async () => {
            const a = getActive(); if (!a) return;
            toast.info('Running visual regression…');
            const r = await runVisualRegression(a.scene, a.camera, a.engine, scenarioType, { saveBaseline: false });
            const visualFails = r.diff?.filter((d) => d.distance > 12) ?? [];
            const wallFails = r.wallCoverage?.filter((w) => w.uncovered) ?? [];
            const fail = r.wallRegression || visualFails.length > 0;
            const msg = fail
              ? `${wallFails.length ? `Walls uncovered: ${wallFails.map((w) => w.wall).join(',')} · ` : ''}${visualFails.length ? `${visualFails.length}/${r.shots.length} pixel diffs` : ''}`
              : `OK · ${r.shots.length} shots · walls match`;
            toast[fail ? 'error' : 'success'](msg);
          }}>
          <Camera className="h-3 w-3 mr-1" /> Run visual regression
        </Button>
        <Button size="sm" variant="ghost" className="w-full h-7"
          onClick={async () => {
            const a = getActive(); if (!a) return;
            await runVisualRegression(a.scene, a.camera, a.engine, scenarioType, { saveBaseline: true });
            toast.success('Baseline saved (visual + per-wall counts)');
          }}>
          <Save className="h-3 w-3 mr-1" /> Save current as baseline
        </Button>
      </div>
    </div>
  );
};
