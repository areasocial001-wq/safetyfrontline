// Multi-language support for 3D risk simulations (Guida mode, tooltips, popups)
// Supported: Italian (default), English, Romanian, Arabic (RTL)

import { useEffect, useState } from 'react';

export type Lang = 'it' | 'en' | 'ro' | 'ar';

export const LANGUAGES: { code: Lang; label: string; flag: string; rtl?: boolean }[] = [
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ro', label: 'Română', flag: '🇷🇴' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', rtl: true },
];

export const isRTL = (lang: Lang) => lang === 'ar';

type UIStrings = {
  guideMode: string;
  guideOn: string;
  guideOff: string;
  riskFound: string;
  guideTooltip: string;
  normativeRef: string;
  nextSteps: string;
  tip: string;
  remaining: string; // for "X seconds remaining"
  seconds: string;
  // Final summary
  summaryTitle: string;
  identifiedRisks: string;
  missedRisks: string;
  errors: string;
  scoreBreakdown: string;
  noErrors: string;
  errorReason: string;
  found: string;
  missed: string;
  // Generic risk action steps
  step_isolate: string;
  step_signal: string;
  step_report: string;
  step_evacuate: string;
  step_protect: string;
};

const STRINGS: Record<Lang, UIStrings> = {
  it: {
    guideMode: 'Guida',
    guideOn: 'ON', guideOff: 'OFF',
    riskFound: 'Rischio individuato',
    guideTooltip: 'Modalità Guida: evidenzia l\'area e mostra la spiegazione normativa',
    normativeRef: 'Riferimento normativo',
    nextSteps: 'Cosa fare adesso',
    tip: 'Suggerimento',
    remaining: 'rimanenti', seconds: 's',
    summaryTitle: 'Riepilogo formativo',
    identifiedRisks: 'Rischi identificati',
    missedRisks: 'Rischi NON individuati',
    errors: 'Errori commessi',
    scoreBreakdown: 'Dettaglio punteggio',
    noErrors: 'Nessun errore — ottimo lavoro!',
    errorReason: 'Motivo',
    found: 'Trovato', missed: 'Mancato',
    step_isolate: 'Isola la zona e impedisci l\'accesso ad altri lavoratori',
    step_signal: 'Segnala il pericolo con cartelli, coni o nastro',
    step_report: 'Comunica subito al preposto / RSPP la non conformità',
    step_evacuate: 'In caso di pericolo grave avvia la procedura di evacuazione',
    step_protect: 'Indossa i DPI previsti prima di qualunque intervento',
  },
  en: {
    guideMode: 'Guide',
    guideOn: 'ON', guideOff: 'OFF',
    riskFound: 'Hazard identified',
    guideTooltip: 'Guide Mode: highlights the area and shows the legal reference',
    normativeRef: 'Legal reference',
    nextSteps: 'What to do next',
    tip: 'Tip',
    remaining: 'remaining', seconds: 's',
    summaryTitle: 'Training summary',
    identifiedRisks: 'Hazards identified',
    missedRisks: 'Hazards MISSED',
    errors: 'Mistakes',
    scoreBreakdown: 'Score breakdown',
    noErrors: 'No mistakes — great job!',
    errorReason: 'Reason',
    found: 'Found', missed: 'Missed',
    step_isolate: 'Isolate the area and keep other workers away',
    step_signal: 'Mark the hazard with signs, cones or tape',
    step_report: 'Immediately report the non-conformity to the supervisor / safety officer',
    step_evacuate: 'In case of serious danger, start the evacuation procedure',
    step_protect: 'Wear the required PPE before any action',
  },
  ro: {
    guideMode: 'Ghid',
    guideOn: 'ON', guideOff: 'OFF',
    riskFound: 'Risc identificat',
    guideTooltip: 'Mod Ghid: evidențiază zona și afișează referința normativă',
    normativeRef: 'Referință normativă',
    nextSteps: 'Ce ai de făcut',
    tip: 'Sfat',
    remaining: 'rămase', seconds: 's',
    summaryTitle: 'Recapitulare formativă',
    identifiedRisks: 'Riscuri identificate',
    missedRisks: 'Riscuri NEIDENTIFICATE',
    errors: 'Greșeli',
    scoreBreakdown: 'Detalii punctaj',
    noErrors: 'Nicio greșeală — excelent!',
    errorReason: 'Motiv',
    found: 'Găsit', missed: 'Pierdut',
    step_isolate: 'Izolează zona și ține departe ceilalți lucrători',
    step_signal: 'Semnalează pericolul cu indicatoare, conuri sau bandă',
    step_report: 'Anunță imediat șeful de echipă / responsabilul SSM',
    step_evacuate: 'În caz de pericol grav, începe procedura de evacuare',
    step_protect: 'Poartă EIP-ul cerut înainte de orice intervenție',
  },
  ar: {
    guideMode: 'الدليل',
    guideOn: 'تشغيل', guideOff: 'إيقاف',
    riskFound: 'تم تحديد الخطر',
    guideTooltip: 'وضع الدليل: يبرز المنطقة ويعرض المرجع القانوني',
    normativeRef: 'المرجع القانوني',
    nextSteps: 'الإجراء التالي',
    tip: 'نصيحة',
    remaining: 'متبقي', seconds: 'ث',
    summaryTitle: 'ملخص التدريب',
    identifiedRisks: 'المخاطر المحددة',
    missedRisks: 'المخاطر غير المحددة',
    errors: 'الأخطاء',
    scoreBreakdown: 'تفاصيل النقاط',
    noErrors: 'لا أخطاء — عمل رائع!',
    errorReason: 'السبب',
    found: 'موجود', missed: 'فائت',
    step_isolate: 'اعزل المنطقة وامنع وصول العمال الآخرين',
    step_signal: 'حدد الخطر بعلامات أو مخاريط أو شريط',
    step_report: 'أبلغ المشرف / مسؤول السلامة فوراً',
    step_evacuate: 'في حالة الخطر الجسيم، ابدأ إجراء الإخلاء',
    step_protect: 'ارتدِ معدات الحماية المطلوبة قبل أي تدخل',
  },
};

export const t = (lang: Lang, key: keyof UIStrings): string => STRINGS[lang]?.[key] ?? STRINGS.it[key];

const STORAGE_KEY = 'safetyfrontline.lang';

export const getStoredLang = (): Lang => {
  if (typeof window === 'undefined') return 'it';
  const v = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
  return v && ['it', 'en', 'ro', 'ar'].includes(v) ? v : 'it';
};

export const setStoredLang = (lang: Lang) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new CustomEvent('lang-change', { detail: { lang } }));
};

export const useLang = (): [Lang, (l: Lang) => void] => {
  const [lang, setLang] = useState<Lang>(getStoredLang);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { lang: Lang };
      if (detail?.lang) setLang(detail.lang);
    };
    window.addEventListener('lang-change', handler);
    return () => window.removeEventListener('lang-change', handler);
  }, []);
  return [lang, (l: Lang) => setStoredLang(l)];
};
