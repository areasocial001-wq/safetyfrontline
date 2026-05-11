import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { getLabFireClass, FIRE_CLASS_INFO, type FireClassKey } from "@/data/fire-classes";

interface FireClassHUDProps {
  /** Currently aimed fire emitter index (or null if not aiming at one) */
  aimedFireIndex: number | null;
  /** Override class key (e.g. for forced display in tutorial). When set, ignores index */
  forcedClass?: FireClassKey | null;
  /** Compact placement; default is bottom-center */
  position?: "top" | "bottom";
}

/**
 * HUD that displays the active fire class (A/B/C/D/E) during the antincendio
 * micro-challenge. Colors mirror the visual flame so the player can build
 * the visual → classification association.
 */
export const FireClassHUD = ({
  aimedFireIndex,
  forcedClass = null,
  position = "bottom",
}: FireClassHUDProps) => {
  const [lastSeen, setLastSeen] = useState<ReturnType<typeof getLabFireClass>>(null);

  // Keep last seen class visible briefly after the player looks away to
  // avoid flicker while sweeping the gaze.
  useEffect(() => {
    if (forcedClass) {
      setLastSeen(FIRE_CLASS_INFO[forcedClass]);
      return;
    }
    const info = getLabFireClass(aimedFireIndex);
    if (info) {
      setLastSeen(info);
      return;
    }
    const t = setTimeout(() => setLastSeen(null), 1200);
    return () => clearTimeout(t);
  }, [aimedFireIndex, forcedClass]);

  if (!lastSeen) return null;

  const visible = forcedClass !== null || aimedFireIndex !== null;

  return (
    <div
      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 z-40 px-4 ${
        position === "top" ? "top-20" : "bottom-28"
      }`}
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 backdrop-blur-md bg-background/90 shadow-lg ring-2 ${lastSeen.ringClass} transition-all duration-300 ${
          visible ? "opacity-100 scale-100" : "opacity-60 scale-95"
        }`}
        style={{ borderColor: `hsl(${lastSeen.colorHsl})` }}
      >
        {/* Class chip */}
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-lg font-black text-2xl ${lastSeen.chipBg} ${lastSeen.chipText}`}
          aria-label={`Classe di fuoco ${lastSeen.key}`}
        >
          {lastSeen.key}
        </div>
        <div className="min-w-0 max-w-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Flame className="w-3 h-3" style={{ color: `hsl(${lastSeen.colorHsl})` }} />
            <span>{lastSeen.label}</span>
          </div>
          <div className="text-sm font-bold leading-tight">{lastSeen.fullLabel}</div>
          <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">
            {lastSeen.hint}
          </div>
        </div>
      </div>
    </div>
  );
};
