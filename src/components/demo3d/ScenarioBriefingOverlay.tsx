import { Risk3D } from "@/data/scenarios3d";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldCheck, X } from "lucide-react";

interface ScenarioBriefingOverlayProps {
  risk: Risk3D;
  index: number;
  total: number;
  onSkip: () => void;
  onClose: () => void;
}

const SEVERITY_STYLES: Record<Risk3D["severity"], { label: string; chip: string; glow: string }> = {
  critical: {
    label: "Critico",
    chip: "bg-destructive text-destructive-foreground",
    glow: "shadow-[0_0_40px_-10px_hsl(var(--destructive))]",
  },
  high: {
    label: "Alto",
    chip: "bg-orange-500 text-white",
    glow: "shadow-[0_0_40px_-10px_rgb(249,115,22)]",
  },
  medium: {
    label: "Medio",
    chip: "bg-yellow-500 text-black",
    glow: "shadow-[0_0_40px_-10px_rgb(234,179,8)]",
  },
  low: {
    label: "Basso",
    chip: "bg-primary text-primary-foreground",
    glow: "shadow-[0_0_30px_-10px_hsl(var(--primary))]",
  },
};

const CORRECT_BEHAVIOR: Record<Risk3D["severity"], string> = {
  critical: "Interrompere immediatamente l'attività, segnalare al preposto/RSPP e mettere in sicurezza l'area prima di procedere.",
  high: "Segnalare il rischio al preposto, delimitare l'area e ripristinare le condizioni di sicurezza prima di riprendere l'attività.",
  medium: "Segnalare con cartello apposito, informare i colleghi e provvedere alla rimozione/ripristino in tempi brevi.",
  low: "Annotare la non conformità nel registro e pianificare l'intervento di ripristino.",
};

export const ScenarioBriefingOverlay = ({
  risk,
  index,
  total,
  onSkip,
  onClose,
}: ScenarioBriefingOverlayProps) => {
  const style = SEVERITY_STYLES[risk.severity];

  return (
    <>
      {/* Top progress bar */}
      <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="h-1 bg-background/30">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-6 py-3 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border">
            <span className="text-xs font-mono text-muted-foreground">BRIEFING</span>
            <span className="text-sm font-bold">
              {index + 1} / {total}
            </span>
          </div>
          <Button size="sm" variant="secondary" onClick={onClose} className="gap-1">
            <X className="w-4 h-4" />
            Termina
          </Button>
        </div>
      </div>

      {/* Bottom annotation card */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-fade-in">
        <div className={`rounded-2xl border border-border bg-background/95 backdrop-blur-xl p-6 ${style.glow}`}>
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${style.chip}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${style.chip}`}>
                  {style.label}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Rischio identificato
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{risk.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{risk.description}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                Comportamento corretto
              </div>
              <p className="text-sm leading-relaxed">{CORRECT_BEHAVIOR[risk.severity]}</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button size="sm" variant="outline" onClick={onSkip}>
              Avanti →
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
