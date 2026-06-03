import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Move, Eye, Hand } from "lucide-react";

const STORAGE_KEY = "sf:mobile-3d-tutorial-seen:v1";

type Props = {
  /** Pass true only on touch devices and when a 3D scenario is active. */
  show: boolean;
  /** Optional override to force re-show (e.g. from a help button). */
  forceShow?: boolean;
  onClose?: () => void;
};

/**
 * One-time mobile tutorial explaining the joystick + LookPad controls.
 * Renders nothing if the user has already dismissed it (unless forceShow).
 * Avoids any permission prompts (no gyroscope, no fullscreen).
 */
export const MobileControlsTutorial = ({ show, forceShow, onClose }: Props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setOpen(true);
      return;
    }
    if (!show) {
      setOpen(false);
      return;
    }
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [show, forceShow]);

  const close = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {/* ignore */}
    setOpen(false);
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background border shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold">Controlli mobile</h2>
          <p className="text-sm text-muted-foreground">
            Ecco come muoverti nelle simulazioni 3D dal tuo telefono. Nessun
            permesso richiesto.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3 items-start">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Move className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">Joystick (sinistra)</div>
              <p className="text-sm text-muted-foreground">
                Tieni il pollice nell'area in basso a sinistra e trascina per
                muoverti avanti, indietro o lateralmente.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">LookPad (destra)</div>
              <p className="text-sm text-muted-foreground">
                Trascina nella metà destra dello schermo per ruotare la camera.
                Più velocemente trascini, più rapidamente ruoti.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Hand className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">Tap per interagire</div>
              <p className="text-sm text-muted-foreground">
                Tocca un oggetto sospetto per identificarlo come rischio. Un
                tap breve sulla destra serve a interagire, un trascinamento a
                guardarti intorno.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          Suggerimento: per la migliore esperienza, gira il telefono in
          orizzontale. Puoi sempre regolare la sensibilità dal menu impostazioni
          (icona ingranaggio in alto a destra).
        </div>

        <Button className="w-full" onClick={close}>
          Ho capito, iniziamo
        </Button>
      </div>
    </div>
  );
};
