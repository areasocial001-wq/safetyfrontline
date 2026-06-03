import { Settings2, X, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useControlPreferences } from "@/hooks/useControlPreferences";

export const ControlsSettingsPanel = ({ floating = true }: { floating?: boolean }) => {
  const [open, setOpen] = useState(false);
  const { preferences, update, reset } = useControlPreferences();

  return (
    <>
      {floating && (
        <button
          aria-label="Impostazioni controlli"
          onClick={() => setOpen(true)}
          className="fixed top-4 right-4 z-40 rounded-full bg-background/80 backdrop-blur p-2 border shadow hover:bg-background"
        >
          <Settings2 className="w-5 h-5" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-background border shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Controlli 3D</h2>
              <button onClick={() => setOpen(false)} aria-label="Chiudi">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <Label>Sensibilità mouse: {preferences.mouse_sensitivity.toFixed(2)}x</Label>
              <Slider
                min={0.2}
                max={3}
                step={0.05}
                value={[preferences.mouse_sensitivity]}
                onValueChange={([v]) => update({ mouse_sensitivity: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Sensibilità touch: {preferences.touch_sensitivity.toFixed(2)}x</Label>
              <Slider
                min={0.2}
                max={3}
                step={0.05}
                value={[preferences.touch_sensitivity]}
                onValueChange={([v]) => update({ touch_sensitivity: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="invert-y">Inverti asse Y</Label>
              <Switch
                id="invert-y"
                checked={preferences.invert_y}
                onCheckedChange={(v) => update({ invert_y: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="gamepad-on">Gamepad abilitato</Label>
              <Switch
                id="gamepad-on"
                checked={preferences.gamepad_enabled}
                onCheckedChange={(v) => update({ gamepad_enabled: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Deadzone gamepad: {preferences.gamepad_deadzone.toFixed(2)}</Label>
              <Slider
                min={0}
                max={0.4}
                step={0.01}
                value={[preferences.gamepad_deadzone]}
                onValueChange={([v]) => update({ gamepad_deadzone: v })}
              />
            </div>

            <div className="text-xs text-muted-foreground border-t pt-3">
              Mappatura tastiera: <b>WASD</b> movimento · <b>Shift</b> sprint ·{" "}
              <b>Ctrl</b> crouch · <b>F</b> interagisci · <b>E</b> ispeziona
              <br />
              Gamepad: stick sx movimento · stick dx camera · <b>LB</b> sprint ·{" "}
              <b>R3</b> crouch · <b>A</b> interagisci · <b>Y</b> ispeziona
            </div>

            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-1" /> Ripristina
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>Fatto</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
