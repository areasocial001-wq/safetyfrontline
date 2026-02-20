import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  GripVertical,
  Volume2,
  VolumeX,
  Trophy,
  Target,
  Clock
} from "lucide-react";
import { GameReplay } from "@/lib/replay-db";
import Draggable from "react-draggable";

interface PictureInPictureReplayProps {
  replay: GameReplay;
  userName?: string;
  onClose: () => void;
  currentGameTime?: number; // For syncing with game time
  defaultPosition?: { x: number; y: number }; // Custom default position
}

export const PictureInPictureReplay = ({ 
  replay, 
  userName, 
  onClose,
  currentGameTime,
  defaultPosition = { x: 20, y: 20 }
}: PictureInPictureReplayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Default muted to not interfere with game audio
  const [isExpanded, setIsExpanded] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video && isPlaying) {
      video.play().catch(err => console.error('PiP autoplay error:', err));
    }
  }, []);

  // Sync with game time if provided
  useEffect(() => {
    if (currentGameTime !== undefined && videoRef.current) {
      const video = videoRef.current;
      // Only sync if difference is more than 2 seconds
      if (Math.abs(video.currentTime - currentGameTime) > 2) {
        video.currentTime = Math.min(currentGameTime, video.duration || 0);
      }
    }
  }, [currentGameTime]);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Draggable
      handle=".drag-handle"
      bounds="parent"
      defaultPosition={defaultPosition}
    >
      <div 
        className={`fixed z-50 transition-all duration-300 ${
          isExpanded ? 'w-[600px]' : 'w-[320px]'
        }`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <Card className="overflow-hidden shadow-2xl border-2 border-primary/30 bg-card/95 backdrop-blur-sm">
          {/* Header with drag handle */}
          <div className="drag-handle cursor-move bg-primary/10 px-3 py-2 flex items-center justify-between border-b border-primary/20">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <Badge variant="outline" className="text-xs">
                <Trophy className="w-3 h-3 mr-1" />
                {userName || 'Replay'}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={toggleExpanded}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3 h-3" />
                ) : (
                  <Maximize2 className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Video */}
          <div className="relative group">
            <video
              ref={videoRef}
              src={replay.video_url}
              className="w-full aspect-video bg-black"
              loop
              muted={isMuted}
              playsInline
            />

            {/* Overlay controls */}
            <div 
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Stats overlay */}
              <div className="absolute top-2 left-2 right-2 flex justify-between text-xs">
                <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                  <Target className="w-3 h-3 mr-1" />
                  {replay.score} pts
                </Badge>
                <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(replay.time_elapsed)}
                </Badge>
              </div>

              {/* Bottom controls */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-black/50 hover:bg-black/70"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-black/50 hover:bg-black/70"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Expanded info */}
          {isExpanded && (
            <div className="p-3 bg-muted/30 border-t border-border">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-muted-foreground">Punti</p>
                  <p className="font-bold">{replay.score}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Tempo</p>
                  <p className="font-bold">{formatTime(replay.time_elapsed)}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Collisioni</p>
                  <p className="font-bold">{replay.collisions}</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Draggable>
  );
};
