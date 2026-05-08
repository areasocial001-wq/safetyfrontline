import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings, Zap, Eye, Sparkles, Crown, Activity, Volume2, VolumeX, Subtitles, Target, Snail, Users, Rocket, Trophy, Sun, Contrast, RefreshCw } from "lucide-react";
import { GraphicsQuality } from "@/hooks/useGraphicsSettings";
import type { AudioSettings, VisualSettings } from "@/hooks/useGraphicsSettings";

type SensitivityPreset = {
  label: string;
  value: number;
  icon: typeof Snail;
  description: string;
};

const SENSITIVITY_PRESETS: SensitivityPreset[] = [
  { label: "Lento", value: 850, icon: Snail, description: "Precisione massima" },
  { label: "Normale", value: 500, icon: Users, description: "Bilanciato" },
  { label: "Veloce", value: 300, icon: Rocket, description: "Movimenti rapidi" },
  { label: "Competitivo", value: 150, icon: Trophy, description: "Massima reattività" },
];

interface GraphicsSettingsProps {
  currentQuality: GraphicsQuality;
  onQualityChange: (quality: GraphicsQuality) => void;
  audioSettings: AudioSettings;
  onAudioSettingsChange: (settings: Partial<AudioSettings>) => void;
  visualSettings?: VisualSettings;
  onVisualSettingsChange?: (settings: Partial<VisualSettings>) => void;
  onRecalibrateExposure?: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onRunBenchmark?: () => void;
}

const QUALITY_INFO: Record<GraphicsQuality, {
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = {
  low: {
    label: 'Bassa',
    description: 'Massime prestazioni, minimo carico GPU',
    icon: <Zap className="w-4 h-4" />,
    color: 'text-blue-500',
  },
  medium: {
    label: 'Media',
    description: 'Bilanciamento tra prestazioni e qualità',
    icon: <Eye className="w-4 h-4" />,
    color: 'text-green-500',
  },
  high: {
    label: 'Alta',
    description: 'Qualità eccellente, buone prestazioni',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-orange-500',
  },
  ultra: {
    label: 'Ultra',
    description: 'Massima qualità visiva, alta richiesta GPU',
    icon: <Crown className="w-4 h-4" />,
    color: 'text-purple-500',
  },
};

export const GraphicsSettings = ({ 
  currentQuality, 
  onQualityChange,
  audioSettings,
  onAudioSettingsChange,
  isOpen,
  onToggle,
  onRunBenchmark
}: GraphicsSettingsProps) => {
  const qualities: GraphicsQuality[] = ['low', 'medium', 'high', 'ultra'];
  const currentIndex = qualities.indexOf(currentQuality);

  const handleSliderChange = (value: number[]) => {
    const newQuality = qualities[value[0]];
    onQualityChange(newQuality);
  };

  if (!isOpen) {
    return (
      <div className="absolute top-4 right-4 z-30">
        <Button
          onClick={onToggle}
          variant="outline"
          size="icon"
          className="bg-card/90 backdrop-blur-sm border-primary/20 hover:bg-card"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  const currentInfo = QUALITY_INFO[currentQuality];

  return (
    <div className="absolute top-4 right-4 z-30 animate-fade-in">
      <Card className="w-80 p-4 bg-card/95 backdrop-blur-md border-primary/20 shadow-xl">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base">Qualità Grafica</h3>
            </div>
            <Button
              onClick={onToggle}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              ✕
            </Button>
          </div>

          {/* Current Quality Badge */}
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
            <div className="flex items-center gap-2">
              <span className={currentInfo.color}>{currentInfo.icon}</span>
              <div>
                <p className="font-semibold text-sm">{currentInfo.label}</p>
                <p className="text-xs text-muted-foreground">{currentInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Quality Slider */}
          <div className="space-y-3">
            <Slider
              value={[currentIndex]}
              onValueChange={handleSliderChange}
              max={3}
              min={0}
              step={1}
              className="w-full"
            />
            
            {/* Quality Labels */}
            <div className="flex justify-between text-xs text-muted-foreground">
              {qualities.map((q) => {
                const info = QUALITY_INFO[q];
                return (
                  <button
                    key={q}
                    onClick={() => onQualityChange(q)}
                    className={`flex flex-col items-center gap-1 transition-colors ${
                      q === currentQuality ? info.color : 'hover:text-foreground'
                    }`}
                  >
                    {info.icon}
                    <span className="text-[10px] font-medium">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Dettagli Tecnici</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ombre:</span>
                <Badge variant={currentQuality === 'low' ? 'secondary' : 'default'} className="h-5 text-[10px]">
                  {currentQuality === 'low' ? 'OFF' : 'ON'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Anti-aliasing:</span>
                <Badge variant={currentQuality === 'low' || currentQuality === 'medium' ? 'secondary' : 'default'} className="h-5 text-[10px]">
                  {currentQuality === 'low' || currentQuality === 'medium' ? 'OFF' : 'ON'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Texture:</span>
                <Badge variant="outline" className="h-5 text-[10px]">
                  {currentQuality === 'low' ? '1x' : currentQuality === 'medium' ? '2x' : currentQuality === 'high' ? '4x' : '8x'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rischi Proc.:</span>
                <Badge variant={currentQuality === 'low' ? 'secondary' : 'default'} className="h-5 text-[10px]">
                  {currentQuality === 'low' ? 'OFF' : 'ON'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="space-y-3 pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Impostazioni Audio</p>
            
            {/* Voice-Over Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {audioSettings.voiceOverEnabled ? (
                  <Volume2 className="w-4 h-4 text-primary" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm">Voice-Over</span>
              </div>
              <Switch
                checked={audioSettings.voiceOverEnabled}
                onCheckedChange={(checked) => 
                  onAudioSettingsChange({ voiceOverEnabled: checked })
                }
              />
            </div>

            {/* Subtitles Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Subtitles className="w-4 h-4 text-primary" />
                <span className="text-sm">Sottotitoli</span>
              </div>
              <Switch
                checked={audioSettings.subtitlesEnabled}
                onCheckedChange={(checked) => 
                  onAudioSettingsChange({ subtitlesEnabled: checked })
                }
              />
            </div>

            {/* Music Volume */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Volume Musica</span>
                <span className="font-medium">{Math.round(audioSettings.musicVolume * 100)}%</span>
              </div>
              <Slider
                value={[audioSettings.musicVolume * 100]}
                onValueChange={(value) => 
                  onAudioSettingsChange({ musicVolume: value[0] / 100 })
                }
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            {/* Effects Volume */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Volume Effetti</span>
                <span className="font-medium">{Math.round(audioSettings.effectsVolume * 100)}%</span>
              </div>
              <Slider
                value={[audioSettings.effectsVolume * 100]}
                onValueChange={(value) => 
                  onAudioSettingsChange({ effectsVolume: value[0] / 100 })
                }
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          {/* Mouse Sensitivity */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Controlli Mouse</p>
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium">{audioSettings.mouseSensitivity}</span>
              </div>
            </div>
            
            {/* Preset Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {SENSITIVITY_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isActive = Math.abs(audioSettings.mouseSensitivity - preset.value) < 50;
                return (
                  <Button
                    key={preset.label}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => onAudioSettingsChange({ mouseSensitivity: preset.value })}
                    className="h-auto flex-col gap-1 py-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{preset.label}</span>
                    <span className="text-[10px] opacity-70">{preset.description}</span>
                  </Button>
                );
              })}
            </div>

            {/* Fine-tune Slider */}
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase">Regolazione Fine</span>
              <Slider
                value={[audioSettings.mouseSensitivity]}
                onValueChange={(value) => 
                  onAudioSettingsChange({ mouseSensitivity: value[0] })
                }
                max={1000}
                min={100}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Più sensibile (100)</span>
                <span>Meno sensibile (1000)</span>
              </div>
            </div>
          </div>

          {/* Performance Hint */}
          <div className="p-2 bg-accent/5 rounded border border-accent/20">
            <p className="text-[10px] text-muted-foreground text-center">
              💡 Le impostazioni si applicano automaticamente al prossimo caricamento
            </p>
          </div>

          {/* Benchmark Button */}
          {onRunBenchmark && (
            <Button
              onClick={() => {
                onToggle();
                onRunBenchmark();
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Activity className="w-4 h-4 mr-2" />
              Esegui Benchmark Prestazioni
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
