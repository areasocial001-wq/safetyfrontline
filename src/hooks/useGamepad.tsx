import { useEffect, useRef, useState } from "react";
import type { GamepadBindings } from "./useControlPreferences";

export type GamepadState = {
  connected: boolean;
  id: string | null;
  moveX: number; // -1..1 (left stick X)
  moveY: number; // -1..1 (left stick Y, forward=+1)
  lookX: number; // -1..1 (right stick X)
  lookY: number; // -1..1 (right stick Y)
  sprint: boolean;
  crouch: boolean;
  interactJustPressed: boolean;
  inspectJustPressed: boolean;
};

type Options = {
  enabled: boolean;
  deadzone: number;
  bindings: GamepadBindings;
};

const applyDeadzone = (v: number, dz: number) =>
  Math.abs(v) < dz ? 0 : (v - Math.sign(v) * dz) / (1 - dz);

export const useGamepad = ({ enabled, deadzone, bindings }: Options) => {
  const stateRef = useRef<GamepadState>({
    connected: false,
    id: null,
    moveX: 0,
    moveY: 0,
    lookX: 0,
    lookY: 0,
    sprint: false,
    crouch: false,
    interactJustPressed: false,
    inspectJustPressed: false,
  });
  const [connected, setConnected] = useState(false);
  const [padId, setPadId] = useState<string | null>(null);
  const prevButtons = useRef<Record<number, boolean>>({});
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      stateRef.current.connected = false;
      setConnected(false);
      return;
    }
    const onConn = () => {/* will be picked up next poll */};
    window.addEventListener("gamepadconnected", onConn);
    window.addEventListener("gamepaddisconnected", onConn);

    const loop = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const pad = Array.from(pads).find((p): p is Gamepad => !!p && p.connected);
      const s = stateRef.current;
      if (!pad) {
        if (s.connected) {
          s.connected = false;
          s.id = null;
          s.moveX = s.moveY = s.lookX = s.lookY = 0;
          s.sprint = s.crouch = false;
          setConnected(false);
          setPadId(null);
        }
      } else {
        if (!s.connected || s.id !== pad.id) {
          s.connected = true;
          s.id = pad.id;
          setConnected(true);
          setPadId(pad.id);
        }
        s.moveX = applyDeadzone(pad.axes[0] ?? 0, deadzone);
        s.moveY = -applyDeadzone(pad.axes[1] ?? 0, deadzone); // forward = +1
        s.lookX = applyDeadzone(pad.axes[2] ?? 0, deadzone);
        s.lookY = applyDeadzone(pad.axes[3] ?? 0, deadzone);

        const btn = (i: number) => !!pad.buttons[i]?.pressed;
        s.sprint = btn(bindings.sprint);
        s.crouch = btn(bindings.crouch);

        const wasInter = prevButtons.current[bindings.interact] || false;
        const isInter = btn(bindings.interact);
        s.interactJustPressed = !wasInter && isInter;
        prevButtons.current[bindings.interact] = isInter;

        const wasInsp = prevButtons.current[bindings.inspect] || false;
        const isInsp = btn(bindings.inspect);
        s.inspectJustPressed = !wasInsp && isInsp;
        prevButtons.current[bindings.inspect] = isInsp;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("gamepadconnected", onConn);
      window.removeEventListener("gamepaddisconnected", onConn);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, deadzone, bindings.sprint, bindings.crouch, bindings.interact, bindings.inspect]);

  return { stateRef, connected, padId };
};
