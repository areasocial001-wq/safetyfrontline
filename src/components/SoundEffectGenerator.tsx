import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Download, Play, Pause, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeneratedSound {
  name: string;
  audioUrl: string;
  description: string;
}

const SOUND_PRESETS = [
  { 
    name: 'whoosh', 
    description: 'Deep spaceship whoosh, low rumbling engine passing by with metallic resonance',
    label: 'Whoosh Astronave'
  },
  { 
    name: 'pop', 
    description: 'Heavy mechanical pop, industrial door latch engaging with bass thump',
    label: 'Pop Meccanico'
  },
  { 
    name: 'sparkle', 
    description: 'Energy charge building up, electric hum with metallic shimmer',
    label: 'Carica Energia'
  },
  { 
    name: 'impact', 
    description: 'Ultra deep bass impact like Doom door opening, heavy metal slamming with reverb',
    label: 'Impatto Bass'
  },
  { 
    name: 'rise', 
    description: 'Spaceship engine startup sequence, ascending powerful growl from low to high',
    label: 'Motore Avvio'
  },
];

export const SoundEffectGenerator = () => {
  const [customDescription, setCustomDescription] = useState('');
  const [generatedSounds, setGeneratedSounds] = useState<GeneratedSound[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());

  const generateSound = async (description: string, name: string) => {
    setLoading(name);
    try {
      const { data, error } = await supabase.functions.invoke('generate-sound-effect', {
        body: { text: description }
      });

      if (error) throw error;

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Create audio URL from base64
      const audioBlob = await fetch(`data:audio/mp3;base64,${data.audioContent}`).then(r => r.blob());
      const audioUrl = URL.createObjectURL(audioBlob);

      const newSound: GeneratedSound = {
        name,
        audioUrl,
        description,
      };

      setGeneratedSounds(prev => {
        const filtered = prev.filter(s => s.name !== name);
        return [...filtered, newSound];
      });

      toast.success(`Effetto sonoro "${name}" generato!`);
    } catch (error) {
      console.error('Error generating sound:', error);
      toast.error('Errore nella generazione del suono');
    } finally {
      setLoading(null);
    }
  };

  const handleCustomGenerate = () => {
    if (!customDescription.trim()) {
      toast.error('Inserisci una descrizione');
      return;
    }
    const timestamp = Date.now();
    generateSound(customDescription, `custom-${timestamp}`);
  };

  const playSound = (sound: GeneratedSound) => {
    // Stop currently playing sound
    if (playingSound) {
      const currentAudio = audioElements.get(playingSound);
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    // Play new sound
    if (playingSound === sound.name) {
      setPlayingSound(null);
    } else {
      let audio = audioElements.get(sound.name);
      if (!audio) {
        audio = new Audio(sound.audioUrl);
        audio.addEventListener('ended', () => setPlayingSound(null));
        setAudioElements(new Map(audioElements.set(sound.name, audio)));
      }
      audio.play();
      setPlayingSound(sound.name);
    }
  };

  const downloadSound = (sound: GeneratedSound) => {
    const link = document.createElement('a');
    link.href = sound.audioUrl;
    link.download = `${sound.name}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download avviato');
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Generatore Effetti Sonori AI
          </h3>
          <p className="text-sm text-muted-foreground">
            Genera effetti sonori personalizzati con ElevenLabs AI
          </p>
        </div>

        {/* Preset Sounds */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Suoni Predefiniti</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SOUND_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                onClick={() => generateSound(preset.description, preset.name)}
                disabled={loading === preset.name}
                className="h-auto py-3 flex flex-col items-start gap-1"
              >
                {loading === preset.name ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="font-semibold">{preset.label}</span>
                )}
                <span className="text-xs text-muted-foreground text-left line-clamp-2">
                  {preset.description}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Sound Generator */}
        <div>
          <Label htmlFor="custom-description" className="text-base font-semibold mb-3 block">
            Genera Suono Personalizzato
          </Label>
          <div className="flex gap-2">
            <Input
              id="custom-description"
              placeholder="Es: Laser futuristico con riverbero metallico profondo..."
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomGenerate()}
            />
            <Button
              onClick={handleCustomGenerate}
              disabled={!customDescription.trim() || loading === 'custom'}
            >
              {loading?.startsWith('custom') ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Genera'
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Descrivi l'effetto sonoro che vuoi (più dettagli = risultato migliore)
          </p>
        </div>

        {/* Generated Sounds List */}
        {generatedSounds.length > 0 && (
          <div>
            <Label className="text-base font-semibold mb-3 block">Suoni Generati</Label>
            <div className="space-y-2">
              {generatedSounds.map((sound) => (
                <Card key={sound.name} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{sound.name}.mp3</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {sound.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => playSound(sound)}
                      >
                        {playingSound === sound.name ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadSound(sound)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground">
            <strong>Nota:</strong> Dopo aver generato i suoni, scaricali e posizionali nella cartella{' '}
            <code className="bg-background px-1 py-0.5 rounded">public/sounds/</code> del progetto 
            per usarli nell'applicazione.
          </p>
        </div>
      </div>
    </Card>
  );
};
