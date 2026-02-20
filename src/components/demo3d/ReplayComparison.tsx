import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Clock,
  Target,
  Shield,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeftRight
} from "lucide-react";
import { GameReplay } from "@/lib/replay-db";

interface ReplayComparisonProps {
  replay1: GameReplay;
  replay2: GameReplay;
  userName1?: string;
  userName2?: string;
}

export const ReplayComparison = ({ replay1, replay2, userName1, userName2 }: ReplayComparisonProps) => {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;
    
    if (video1 && video2) {
      // Set initial volume
      video1.volume = volume;
      video2.volume = volume;
      
      // Get duration from longer video
      const handleLoadedMetadata = () => {
        const maxDuration = Math.max(
          video1.duration || 0,
          video2.duration || 0
        );
        setDuration(maxDuration);
      };

      video1.addEventListener('loadedmetadata', handleLoadedMetadata);
      video2.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        video1.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video2.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [volume]);

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => {
      if (video1Ref.current && isPlaying) {
        setCurrentTime(video1Ref.current.currentTime);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;

    if (video1 && video2) {
      if (isPlaying) {
        video1.pause();
        video2.pause();
      } else {
        video1.play();
        video2.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;

    if (video1 && video2) {
      video1.currentTime = newTime;
      video2.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkip = (seconds: number) => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;

    if (video1 && video2) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      video1.currentTime = newTime;
      video2.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (video1Ref.current) video1Ref.current.volume = newVolume;
    if (video2Ref.current) video2Ref.current.volume = newVolume;
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (video1Ref.current) video1Ref.current.muted = newMuted;
    if (video2Ref.current) video2Ref.current.muted = newMuted;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getComparisonValue = (val1: number, val2: number) => {
    const diff = val1 - val2;
    const percentage = val2 !== 0 ? ((diff / val2) * 100).toFixed(1) : '0';
    return { diff, percentage };
  };

  const scoreComparison = getComparisonValue(replay1.score, replay2.score);
  const timeComparison = getComparisonValue(replay2.time_elapsed, replay1.time_elapsed); // Inverted: lower is better
  const collisionsComparison = getComparisonValue(replay2.collisions, replay1.collisions); // Inverted: lower is better

  return (
    <div className="space-y-6">
      {/* Comparison Header */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="text-center">
            <Badge variant="outline" className="mb-2">Tu</Badge>
            <h3 className="text-xl font-bold">{userName1 || 'Il Tuo Replay'}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(replay1.created_at).toLocaleDateString()}
            </p>
          </div>
        </Card>
        
        <Card className="p-4 bg-accent/5 border-accent/20">
          <div className="text-center">
            <Badge variant="outline" className="mb-2">Confronto</Badge>
            <h3 className="text-xl font-bold">{userName2 || 'Altro Replay'}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(replay2.created_at).toLocaleDateString()}
            </p>
          </div>
        </Card>
      </div>

      {/* Video Players Side-by-Side */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <video 
            ref={video1Ref}
            src={replay1.video_url}
            className="w-full aspect-video bg-black"
            onEnded={() => setIsPlaying(false)}
          />
        </Card>
        
        <Card className="overflow-hidden">
          <video 
            ref={video2Ref}
            src={replay2.video_url}
            className="w-full aspect-video bg-black"
            onEnded={() => setIsPlaying(false)}
          />
        </Card>
      </div>

      {/* Synchronized Controls */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={duration}
              step={0.1}
              className="cursor-pointer"
            />
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSkip(-10)}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              variant="hero"
              size="icon"
              className="w-12 h-12"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSkip(10)}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.01}
              className="w-32"
            />
          </div>
        </div>
      </Card>

      {/* Comparative Statistics */}
      <Card className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold flex items-center justify-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            Statistiche Comparative
          </h3>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {/* Score Comparison */}
          <div className="space-y-2">
            <div className="text-center">
              <Target className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Punteggio</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-primary/5 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{replay1.score}</p>
              </div>
              <div className="bg-accent/5 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{replay2.score}</p>
              </div>
            </div>
            <div className="text-center">
              {scoreComparison.diff > 0 ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{scoreComparison.percentage}%
                </Badge>
              ) : scoreComparison.diff < 0 ? (
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {scoreComparison.percentage}%
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Minus className="w-3 h-3 mr-1" />
                  Uguale
                </Badge>
              )}
            </div>
          </div>

          {/* Time Comparison */}
          <div className="space-y-2">
            <div className="text-center">
              <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Tempo</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-primary/5 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{formatTime(replay1.time_elapsed)}</p>
              </div>
              <div className="bg-accent/5 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{formatTime(replay2.time_elapsed)}</p>
              </div>
            </div>
            <div className="text-center">
              {timeComparison.diff > 0 ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{Math.abs(timeComparison.diff)}s
                </Badge>
              ) : timeComparison.diff < 0 ? (
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {Math.abs(timeComparison.diff)}s
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Minus className="w-3 h-3 mr-1" />
                  Uguale
                </Badge>
              )}
            </div>
          </div>

          {/* Collisions Comparison */}
          <div className="space-y-2">
            <div className="text-center">
              <Shield className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Collisioni</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-primary/5 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{replay1.collisions}</p>
              </div>
              <div className="bg-accent/5 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{replay2.collisions}</p>
              </div>
            </div>
            <div className="text-center">
              {collisionsComparison.diff > 0 ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {collisionsComparison.diff} meno
                </Badge>
              ) : collisionsComparison.diff < 0 ? (
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {Math.abs(collisionsComparison.diff)} più
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Minus className="w-3 h-3 mr-1" />
                  Uguale
                </Badge>
              )}
            </div>
          </div>

          {/* Achievements Comparison */}
          <div className="space-y-2">
            <div className="text-center">
              <Award className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Achievements</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-primary/5 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{replay1.achievements_unlocked.length}</p>
              </div>
              <div className="bg-accent/5 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{replay2.achievements_unlocked.length}</p>
              </div>
            </div>
            <div className="text-center">
              {replay1.achievements_unlocked.length > replay2.achievements_unlocked.length ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{replay1.achievements_unlocked.length - replay2.achievements_unlocked.length}
                </Badge>
              ) : replay1.achievements_unlocked.length < replay2.achievements_unlocked.length ? (
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {replay2.achievements_unlocked.length - replay1.achievements_unlocked.length}
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Minus className="w-3 h-3 mr-1" />
                  Uguale
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
