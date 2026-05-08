import { useEffect, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bug, Camera, RefreshCw, Save } from 'lucide-react';
import {
  toggleSceneDebug,
  isDebugActive,
} from './scene-modules/scene-debug';
import { runVisualRegression } from './scene-modules/visual-regression';
import type { SceneDensityMetrics } from './scene-modules/scene-metrics';
import {
  buildUniformFillConfig,
  type UniformFillDensity,
  type UniformFillPreset,
} from './scene-modules/uniform-fill-config';

interface SceneDebugOverlayProps {
  scenarioType: string;
  /** Reload the whole scene with a new uniform-fill config */
  onReseed?: (cfg: { preset: UniformFillPreset; density: UniformFillDensity; seed: number }) => void;
  initialPreset?: UniformFillPreset;
  initialDensity?: UniformFillDensity;
  initialSeed?: number;
}

const getActive = () =>
  (window as unknown as { __activeBabylon?: { scene: BABYLON.Scene; camera: BABYLON.UniversalCamera; engine: BABYLON.Engine } }).__activeBabylon;

export const SceneDebugOverlay = ({
  scenarioType,
  onReseed,
  initialPreset = 'office',
  initialDensity = 'medium',
  initialSeed = 1337,
}: SceneDebugOverlayProps) => {
  const [open, setOpen] = useState(false);
  const [debugOn, setDebugOn] = useState(false);
  const [metrics, setMetrics] = useState<SceneDensityMetrics | null>(null);
  const [preset, setPreset] = useState<UniformFillPreset>(initialPreset);
  const [density, setDensity] = useState<UniformFillDensity>(initialDensity);
  const [seed, setSeed] = useState(initialSeed);

  // Toggle with M key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyM' && (e.altKey || e.shiftKey)) {
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Subscribe to metrics updates
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

  const cfg = buildUniformFillConfig({ preset, density, seed });

  return (
    <div className="fixed bottom-3 left-3 z-50 w-80 rounded-lg border border-border bg-background/95 p-3 backdrop-blur shadow-xl text-xs">
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
            <div className="grid grid-cols-4 gap-1">
              {(['NW', 'NE', 'SW', 'SE'] as const).map((q) => (
                <Badge key={q} variant="outline">{q}:{metrics.perQuadrant[q]}</Badge>
              ))}
            </div>
            {metrics.warnings.length > 0 && (
              <ul className="mt-2 text-destructive list-disc pl-4 space-y-0.5">
                {metrics.warnings.slice(0, 4).map((w) => <li key={w}>{w}</li>)}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Reseed controls */}
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
        <Button size="sm" className="w-full h-7"
          onClick={() => {
            onReseed?.({ preset, density, seed });
            toast.success(`Reseeded · ${preset}/${density}/${seed} (wall=${cfg.wallSteps}, grid=${cfg.interiorGrid})`);
          }}>
          Apply & rebuild scene
        </Button>
      </div>

      {/* Debug toggles */}
      <div className="space-y-1">
        <Button size="sm" variant={debugOn ? 'default' : 'outline'} className="w-full h-7"
          onClick={() => {
            const s = sceneRef.current; if (!s) return;
            toggleSceneDebug(s);
            setDebugOn(isDebugActive());
          }}>
          {debugOn ? 'Hide' : 'Show'} collisions / shadow casters
        </Button>
        <Button size="sm" variant="outline" className="w-full h-7"
          onClick={async () => {
            const s = sceneRef.current, c = cameraRef.current, e = engineRef.current;
            if (!s || !c || !e) return;
            toast.info('Running visual regression…');
            const r = await runVisualRegression(s, c, e, scenarioType, { saveBaseline: false });
            const fails = r.diff?.filter((d) => d.distance > 12) ?? [];
            toast[fails.length ? 'error' : 'success'](
              fails.length ? `${fails.length}/${r.shots.length} shots differ` : `All ${r.shots.length} shots match baseline`
            );
          }}>
          <Camera className="h-3 w-3 mr-1" /> Run visual regression
        </Button>
        <Button size="sm" variant="ghost" className="w-full h-7"
          onClick={async () => {
            const s = sceneRef.current, c = cameraRef.current, e = engineRef.current;
            if (!s || !c || !e) return;
            await runVisualRegression(s, c, e, scenarioType, { saveBaseline: true });
            toast.success('Baseline saved');
          }}>
          <Save className="h-3 w-3 mr-1" /> Save current as baseline
        </Button>
      </div>
    </div>
  );
};
