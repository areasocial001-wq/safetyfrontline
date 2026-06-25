import { useEffect, useState, useCallback } from 'react';
import type { DPISeason, HiVisColor } from '@/components/training/DPIDressingGame';

export interface DPIPreferences {
  season: DPISeason;
  hivis: HiVisColor;
  autoplay: boolean;
}

const DEFAULTS: DPIPreferences = { season: 'estivo', hivis: 'arancio', autoplay: false };

function storageKey(companyId?: string | null) {
  return `dpi-preferences:${companyId || 'default'}`;
}

export function readDpiPreferences(companyId?: string | null): DPIPreferences {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(storageKey(companyId));
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      season: parsed.season === 'invernale' ? 'invernale' : 'estivo',
      hivis: ['arancio', 'giallo', 'lime'].includes(parsed.hivis) ? parsed.hivis : 'arancio',
      autoplay: Boolean(parsed.autoplay),
    };
  } catch {
    return DEFAULTS;
  }
}

export function writeDpiPreferences(prefs: DPIPreferences, companyId?: string | null) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(companyId), JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent('dpi-preferences-changed', { detail: { companyId } }));
  } catch {
    /* no-op */
  }
}

export function useDpiPreferences(companyId?: string | null) {
  const [prefs, setPrefs] = useState<DPIPreferences>(() => readDpiPreferences(companyId));

  useEffect(() => {
    setPrefs(readDpiPreferences(companyId));
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ companyId?: string | null }>;
      if (!ce.detail || ce.detail.companyId === companyId) {
        setPrefs(readDpiPreferences(companyId));
      }
    };
    window.addEventListener('dpi-preferences-changed', handler as EventListener);
    return () => window.removeEventListener('dpi-preferences-changed', handler as EventListener);
  }, [companyId]);

  const update = useCallback(
    (patch: Partial<DPIPreferences>) => {
      const next = { ...readDpiPreferences(companyId), ...patch };
      writeDpiPreferences(next, companyId);
      setPrefs(next);
    },
    [companyId],
  );

  return { prefs, update };
}
