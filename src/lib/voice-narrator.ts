// Voice narrator system for dramatic risk announcements
// Uses Web Speech Synthesis API for text-to-speech

export class VoiceNarrator {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private isInitialized = false;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  // Initialize and select best Italian voice (or deep English voice)
  async initialize() {
    if (this.isInitialized) return;

    // Wait for voices to load
    await new Promise<void>((resolve) => {
      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        resolve();
      } else {
        this.synth.onvoiceschanged = () => {
          resolve();
        };
      }
    });

    const voices = this.synth.getVoices();
    console.log('[VoiceNarrator] Available voices:', voices.map(v => `${v.name} (${v.lang})`));

    // Priority order for voice selection:
    // 1. Italian male voices (natural, deep)
    // 2. English male voices with deep tone
    // 3. Any available voice

    const italianMaleVoices = voices.filter(v => 
      v.lang.startsWith('it') && v.name.toLowerCase().includes('male')
    );

    const italianVoices = voices.filter(v => v.lang.startsWith('it'));
    
    const englishMaleVoices = voices.filter(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('male') || 
       v.name.toLowerCase().includes('daniel') ||
       v.name.toLowerCase().includes('christopher'))
    );

    // Select best available voice
    this.voice = 
      italianMaleVoices[0] || 
      italianVoices[0] || 
      englishMaleVoices[0] || 
      voices[0];

    console.log('[VoiceNarrator] Selected voice:', this.voice?.name, this.voice?.lang);
    this.isInitialized = true;
  }

  // Generate dramatic announcement text based on risk data
  private generateAnnouncement(riskData: {
    id: string;
    type: string;
    description: string;
    severity: 'critical' | 'moderate';
  }): string {
    const isCritical = riskData.severity === 'critical';
    
    // Dramatic introductions based on severity
    const criticalIntros = [
      "ATTENZIONE! PERICOLO CRITICO RILEVATO!",
      "ALLARME ROSSO! RISCHIO GRAVE!",
      "EMERGENZA! MINACCIA CRITICA IDENTIFICATA!",
      "PERICOLO ESTREMO! AZIONE IMMEDIATA RICHIESTA!"
    ];

    const moderateIntros = [
      "Attenzione. Rischio individuato.",
      "Rilevato potenziale pericolo.",
      "Allerta. Situazione a rischio.",
      "Attenzione operatore. Anomalia rilevata."
    ];

    const intro = isCritical 
      ? criticalIntros[Math.floor(Math.random() * criticalIntros.length)]
      : moderateIntros[Math.floor(Math.random() * moderateIntros.length)];

    // Risk type mapping to technical descriptions
    const riskDescriptions: Record<string, string> = {
      'fall': 'rischio di caduta dall\'alto. Assicurare dispositivi anticaduta.',
      'electrical': 'rischio elettrico. Interrompere alimentazione immediatamente.',
      'fire': 'pericolo di incendio. Evacuare l\'area e attivare estintori.',
      'chemical': 'esposizione a sostanze chimiche. Utilizzare protezione respiratoria.',
      'machinery': 'macchinario non protetto. Attivare sistemi di sicurezza.',
      'slip': 'superficie scivolosa. Prestare attenzione al cammino.',
      'collision': 'rischio di collisione con veicoli. Mantenere distanza di sicurezza.',
      'ergonomic': 'postura scorretta. Correggere immediatamente.',
      'noise': 'livello di rumore pericoloso. Indossare protezioni acustiche.',
      'confined': 'spazio confinato. Verificare ossigenazione.',
      'lifting': 'movimentazione manuale scorretta. Richiedere assistenza.',
      'ppe': 'dispositivi di protezione individuale mancanti. Equipaggiarsi prima di procedere.'
    };

    // Extract risk type from description or ID
    let technicalDesc = riskData.description;
    
    // Try to match with predefined technical descriptions
    for (const [type, desc] of Object.entries(riskDescriptions)) {
      if (riskData.id.toLowerCase().includes(type) || 
          riskData.description.toLowerCase().includes(type)) {
        technicalDesc = desc;
        break;
      }
    }

    // Build dramatic announcement
    const announcement = `${intro} ${technicalDesc}`;
    
    return announcement;
  }

  // Speak announcement with dramatic parameters
  speak(riskData: {
    id: string;
    type: string;
    description: string;
    severity: 'critical' | 'moderate';
  }, options?: { subtitlesOnly?: boolean }) {
    if (!this.isInitialized || !this.voice) {
      console.warn('[VoiceNarrator] Not initialized');
      return { text: '', shouldSpeak: false };
    }

    const text = this.generateAnnouncement(riskData);
    
    // If subtitles-only mode, return text without speaking
    if (options?.subtitlesOnly) {
      console.log('[VoiceNarrator] Subtitles only mode:', text);
      return { text, shouldSpeak: false };
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    console.log('[VoiceNarrator] Speaking:', text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    
    // Dramatic voice parameters
    const isCritical = riskData.severity === 'critical';
    
    utterance.rate = isCritical ? 1.1 : 0.95;  // Faster for critical risks
    utterance.pitch = isCritical ? 0.8 : 0.9;  // Lower pitch for drama
    utterance.volume = isCritical ? 1.0 : 0.85; // Louder for critical
    
    // Add emphasis for critical risks
    if (isCritical) {
      utterance.rate = 1.15; // Urgency
    }

    this.synth.speak(utterance);
    return { text, shouldSpeak: true };
  }

  // Stop any ongoing speech
  stop() {
    this.synth.cancel();
  }

  // Check if currently speaking
  isSpeaking(): boolean {
    return this.synth.speaking;
  }
}

// Singleton instance
let narratorInstance: VoiceNarrator | null = null;

export function getVoiceNarrator(): VoiceNarrator {
  if (!narratorInstance) {
    narratorInstance = new VoiceNarrator();
  }
  return narratorInstance;
}
