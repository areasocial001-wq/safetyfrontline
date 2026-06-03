import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type KeyBindings = {
  forward: string;
  backward: string;
  left: string;
  right: string;
  sprint: string;
  crouch: string;
  interact: string;
  inspect: string;
};

export type GamepadBindings = {
  // Standard gamepad button indices (XInput-like)
  sprint: number; // default LB (4)
  crouch: number; // default RS click (11)
  interact: number; // default A (0)
  inspect: number; // default Y (3)
};

export type ControlPreferences = {
  mouse_sensitivity: number;
  invert_y: boolean;
  touch_sensitivity: number;
  gamepad_enabled: boolean;
  gamepad_deadzone: number;
  key_bindings: KeyBindings;
  gamepad_bindings: GamepadBindings;
  controls_revision: number;
};

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  forward: "KeyW",
  backward: "KeyS",
  left: "KeyA",
  right: "KeyD",
  sprint: "ShiftLeft",
  crouch: "ControlLeft",
  interact: "KeyF",
  inspect: "KeyE",
};

export const DEFAULT_GAMEPAD_BINDINGS: GamepadBindings = {
  sprint: 4,
  crouch: 11,
  interact: 0,
  inspect: 3,
};

export const DEFAULT_PREFERENCES: ControlPreferences = {
  mouse_sensitivity: 1.0,
  invert_y: false,
  touch_sensitivity: 1.0,
  gamepad_enabled: true,
  gamepad_deadzone: 0.15,
  key_bindings: DEFAULT_KEY_BINDINGS,
  gamepad_bindings: DEFAULT_GAMEPAD_BINDINGS,
  controls_revision: 1,
};

const STORAGE_KEY = "sf:control-preferences:v1";

const readCache = (): ControlPreferences | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return null;
  }
};

const writeCache = (prefs: ControlPreferences) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
};

export const useControlPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<ControlPreferences>(
    () => readCache() ?? DEFAULT_PREFERENCES,
  );
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<number | null>(null);

  // Restore on login (or first mount if already logged in)
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setLoaded(true);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("user_control_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (!error && data) {
        const merged: ControlPreferences = {
          ...DEFAULT_PREFERENCES,
          mouse_sensitivity: Number(data.mouse_sensitivity) || 1,
          invert_y: !!data.invert_y,
          touch_sensitivity: Number(data.touch_sensitivity) || 1,
          gamepad_enabled: !!data.gamepad_enabled,
          gamepad_deadzone: Number(data.gamepad_deadzone) || 0.15,
          key_bindings: {
            ...DEFAULT_KEY_BINDINGS,
            ...(data.key_bindings as Partial<KeyBindings> | null ?? {}),
          },
          gamepad_bindings: {
            ...DEFAULT_GAMEPAD_BINDINGS,
            ...(data.gamepad_bindings as Partial<GamepadBindings> | null ?? {}),
          },
          controls_revision: data.controls_revision ?? 1,
        };
        setPreferences(merged);
        writeCache(merged);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const persist = useCallback(
    (next: ControlPreferences) => {
      writeCache(next);
      if (!user) return;
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(async () => {
        await supabase.from("user_control_preferences").upsert(
          {
            user_id: user.id,
            mouse_sensitivity: next.mouse_sensitivity,
            invert_y: next.invert_y,
            touch_sensitivity: next.touch_sensitivity,
            gamepad_enabled: next.gamepad_enabled,
            gamepad_deadzone: next.gamepad_deadzone,
            key_bindings: next.key_bindings,
            gamepad_bindings: next.gamepad_bindings,
            controls_revision: next.controls_revision,
          },
          { onConflict: "user_id" },
        );
      }, 600);
    },
    [user?.id],
  );

  const update = useCallback(
    (patch: Partial<ControlPreferences>) => {
      setPreferences((prev) => {
        const next = { ...prev, ...patch };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const reset = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    persist(DEFAULT_PREFERENCES);
  }, [persist]);

  return { preferences, update, reset, loaded };
};
