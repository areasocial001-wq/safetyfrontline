import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Smartphone, Tv, Projector, Monitor, ArrowLeft } from "lucide-react";
import PointAndClickLevel from "@/components/training/PointAndClickLevel";
import { RISK_HUNT_LEVELS } from "@/data/risk-hunt-levels";

type DevicePreset = "mobile" | "desktop" | "tv" | "projector";

const PREVIEWS: { preset: DevicePreset; label: string; width: number; icon: typeof Smartphone }[] = [
  { preset: "mobile", label: "Mobile (390px)", width: 390, icon: Smartphone },
  { preset: "desktop", label: "Desktop (1280px)", width: 1280, icon: Monitor },
  { preset: "tv", label: "TV (1920px)", width: 1920, icon: Tv },
  { preset: "projector", label: "Proiettore (2560px)", width: 2560, icon: Projector },
];

const PresetTestPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const levelKeys = Object.keys(RISK_HUNT_LEVELS);
  const initial = params.get("level") || levelKeys[0];
  const [levelKey, setLevelKey] = useState(initial);
  const level = RISK_HUNT_LEVELS[levelKey];

  const handleLevel = (k: string) => {
    setLevelKey(k);
    setParams({ level: k });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-[1800px] mx-auto space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />Indietro
          </Button>
          <h1 className="text-2xl font-bold">Test Preset Hotspot</h1>
          <p className="text-sm text-muted-foreground">
            Anteprima simultanea su mobile / desktop / TV / proiettore. Le hitbox sono sempre visibili.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {levelKeys.map((k) => (
            <Button
              key={k}
              variant={k === levelKey ? "default" : "outline"}
              size="sm"
              onClick={() => handleLevel(k)}
            >
              {RISK_HUNT_LEVELS[k].title}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PREVIEWS.map(({ preset, label, width, icon: Icon }) => {
            // Scale large viewports down to fit the column
            const targetWidth = 420;
            const scale = Math.min(1, targetWidth / width);
            const scaledHeight = (width * 9) / 16 * scale;
            return (
              <div key={preset} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Icon className="h-4 w-4" />
                  {label}
                  <span className="text-xs text-muted-foreground ml-auto">
                    scala {(scale * 100).toFixed(0)}%
                  </span>
                </div>
                <div
                  className="relative border border-border rounded-lg overflow-hidden bg-muted"
                  style={{ width: targetWidth, height: scaledHeight }}
                >
                  <div
                    style={{
                      width,
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <PointAndClickLevel
                      key={`${levelKey}-${preset}`}
                      levelData={level}
                      forcedPreset={preset}
                      readOnly
                      forceShowHitboxes
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PresetTestPage;
