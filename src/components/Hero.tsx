import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { Gamepad2, Play, Pause, Shield, Sparkles, Zap, Target, Trophy, Volume2, VolumeX, Maximize, Minimize, Volume, GraduationCap, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import heroImage from "@/assets/hero-game-corridor.jpg";
import { UserMenu } from "@/components/auth/UserMenu";
import { QuoteRequestDialog } from "@/components/QuoteRequestDialog";
import { RippleEffect } from "@/components/RippleEffect";
import { useIntroMusic } from "@/hooks/useIntroMusic";
import { AudioFrequencyVisualizer } from "@/components/AudioFrequencyVisualizer";

export const Hero = () => {
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  
  // Video controls state
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);

  // Ripple effects for titles
  const [titleRippleActive, setTitleRippleActive] = useState(false);
  const [subtitleRippleActive, setSubtitleRippleActive] = useState(false);

  // Intro music - sci-fi/spaceship theme
  const { 
    isPlaying: isMusicPlaying,
    musicEnabled,
    toggleMusic,
    setVolumeLevel: setMusicVolume,
    audioElement,
  } = useIntroMusic({ enabled: true, volume: 0.15, autoplay: true });

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      // Stop background intro music when the demo video starts
      if (audioElement && !audioElement.paused) {
        audioElement.pause();
      }
    };
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [audioElement]);

  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Trigger ripple effects synchronized with animations (visual only, no sound effects)
  useEffect(() => {
    const rippleTimings = [
      { 
        delay: 300, 
        action: () => {
          setTitleRippleActive(true);
          setTimeout(() => setTitleRippleActive(false), 2000);
        }, 
      },    // SicurAzienda appears with ripple
      { 
        delay: 700, 
        action: () => {
          setSubtitleRippleActive(true);
          setTimeout(() => setSubtitleRippleActive(false), 2000);
        }, 
      },      // Safety Frontline appears with ripple
    ];

    const timeouts = rippleTimings.map(({ delay, action }) =>
      setTimeout(() => action(), delay)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    video.volume = newVolume / 100;
    
    if (newVolume === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };

  const toggleFullscreen = async () => {
    const container = videoContainerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* User Menu and Sound Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMusic}
          className="bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors"
          title={musicEnabled ? "Disattiva musica" : "Attiva musica"}
        >
          {musicEnabled && isMusicPlaying ? (
            <Volume2 className="w-5 h-5 text-primary animate-pulse" />
          ) : (
            <VolumeX className="w-5 h-5 text-muted-foreground" />
          )}
        </Button>
        <UserMenu />
      </div>

      {/* Background with Video/Image */}
      <div className="absolute inset-0 z-0">
        {/* 
          TODO: Replace with actual gameplay video
          Add your video file to public/ folder and update src below
          Example: <source src="/gameplay-demo.mp4" type="video/mp4" />
        */}
        <div className="relative w-full h-full">
          {/* Fallback Image */}
          <img
            src={heroImage}
            alt="Safety training game environment"
            className="w-full h-full object-cover opacity-40"
          />
          {/* Video would go here when available */}
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-primary/20 to-secondary/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Animated Decorative Elements */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        {/* Floating Sparkles */}
        <div className="absolute top-20 left-[10%] w-4 h-4 bg-primary/30 rounded-full blur-sm animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute top-40 right-[15%] w-3 h-3 bg-accent/40 rounded-full blur-sm animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-[20%] w-5 h-5 bg-secondary/30 rounded-full blur-sm animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 mx-auto">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Badge with Glow - Animated entrance */}
          <div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-800 border-[3px] border-black dark:border-white backdrop-blur-sm opacity-0 animate-badge-pop shadow-[0_0_25px_rgba(0,0,0,0.4)] dark:shadow-[0_0_25px_rgba(255,255,255,0.4)]" 
            style={{ animationDelay: '0.1s' }}
          >
            <Shield className="w-6 h-6 text-black dark:text-white animate-pulse" />
            <span className="text-lg font-bold text-black dark:text-white">Conforme Accordo Stato-Regioni 2025</span>
            <Sparkles className="w-6 h-6 text-black dark:text-white animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Main Heading with Staggered Entrance and Ripple Effect */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight relative">
            <span 
              className="block text-foreground drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] opacity-0 animate-title-entrance relative inline-block" 
              style={{ 
                textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.2)',
                animationDelay: '0.3s'
              }}
            >
              <RippleEffect 
                isActive={titleRippleActive} 
                color="primary" 
                intensity={1}
                delay={0}
              />
              SicurAzienda
            </span>
            <span 
              className="block bg-gradient-hero bg-clip-text text-transparent mt-2 opacity-0 animate-title-entrance relative inline-block" 
              style={{ 
                animationDelay: '0.7s',
                WebkitTextStroke: '1px rgba(255,103,31,0.3)',
                filter: 'drop-shadow(0 4px 20px rgba(255,103,31,0.6)) drop-shadow(0 0 40px rgba(255,103,31,0.4))'
              }}
            >
              <RippleEffect 
                isActive={subtitleRippleActive} 
                color="accent" 
                intensity={1.2}
                delay={0}
              />
              Safety Frontline
            </span>
          </h1>

          {/* Subheading - Delayed entrance */}
          <p 
            className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground max-w-3xl mx-auto leading-relaxed drop-shadow-md opacity-0 animate-subtitle-entrance"
            style={{ animationDelay: '1.1s' }}
          >
            La formazione sicurezza che <span className="font-extrabold text-primary drop-shadow-lg">si gioca</span>. Letteralmente.
            <br />
            <span className="text-lg md:text-xl lg:text-2xl">Gamification professionale per PMI.</span>
            <br />
            <span className="text-lg md:text-xl lg:text-2xl">Niente fronzoli, massima efficacia.</span>
          </p>

          {/* Key Points with Staggered Pop Animations */}
          <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base">
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/20 backdrop-blur-sm hover:bg-primary/10 transition-colors group opacity-0 animate-badge-pop"
              style={{ animationDelay: '1.4s' }}
            >
              <Gamepad2 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-bold">Game Frontale 3D</span>
              <Zap className="w-4 h-4 text-primary animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/5 border border-secondary/20 backdrop-blur-sm hover:bg-secondary/10 transition-colors group opacity-0 animate-badge-pop"
              style={{ animationDelay: '1.6s' }}
            >
              <Play className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
              <span className="font-bold">100% Browser-Based</span>
            </div>
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/5 border border-accent/20 backdrop-blur-sm hover:bg-accent/10 transition-colors group opacity-0 animate-badge-pop"
              style={{ animationDelay: '1.8s' }}
            >
              <Shield className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
              <span className="font-bold">D.Lgs. 81/08 Compliant</span>
            </div>
          </div>

          {/* Gameplay Video Demo Preview with Custom Controls */}
          <div className="max-w-4xl mx-auto mb-8 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div 
              ref={videoContainerRef}
              className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-[0_0_60px_rgba(255,103,31,0.3)] hover:shadow-[0_0_80px_rgba(255,103,31,0.4)] transition-all group"
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
            >
              {/* 
                Video Element - Replace src with actual gameplay video
                Add video file to public/ folder (e.g., public/gameplay-demo.mp4)
              */}
              <video
                ref={videoRef}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                preload="auto"
                className="w-full aspect-video object-cover bg-black"
                poster={heroImage}
              >
                <source src="/videos/safety-frontline-promo.mp4" type="video/mp4" />
              </video>
              
              {/* Video Overlay Effects */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
              
              {/* Center Play/Pause Button (Large) */}
              {!isPlaying && (
                <div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                  onClick={togglePlayPause}
                >
                  <div className="w-20 h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-[0_0_40px_rgba(255,103,31,0.8)] hover:scale-110 transition-transform animate-pulse">
                    <Play className="w-10 h-10 text-primary-foreground ml-1" />
                  </div>
                </div>
              )}

              {/* Live Badge */}
              <div className="absolute top-4 left-4 z-20">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur-sm border border-red-400/50 shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-white">GAMEPLAY DEMO</span>
                </div>
              </div>

              {/* Stats Overlay */}
              <div className={`absolute top-4 right-4 space-y-2 transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold">Identifica i Rischi</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span className="text-xs font-semibold">Sblocca Achievement</span>
                </div>
              </div>

              {/* Custom Video Controls */}
              <div 
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/80 to-transparent transition-all duration-300 z-30 ${
                  showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                {/* Progress Bar */}
                <div className="px-4 pt-3">
                  <div className="h-1 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Controls Bar */}
                <div className="flex items-center justify-between px-4 py-3">
                  {/* Left Controls */}
                  <div className="flex items-center gap-2">
                    {/* Play/Pause */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={togglePlayPause}
                      className="h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </Button>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={toggleMute}
                        className="h-10 w-10 rounded-lg bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 text-secondary"
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </Button>

                      {/* Volume Slider */}
                      <div className="w-24 hidden sm:block">
                        <Slider
                          value={[volume]}
                          onValueChange={handleVolumeChange}
                          max={100}
                          step={1}
                          className="cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-2">
                    {/* CTA Button */}
                    <NavLink to="/demo-3d">
                      <Button size="sm" variant="hero" className="shadow-lg hidden sm:flex">
                        <Gamepad2 className="w-4 h-4 mr-1" />
                        Gioca Ora
                      </Button>
                    </NavLink>

                    {/* Fullscreen */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={toggleFullscreen}
                      className="h-10 w-10 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent"
                    >
                      {isFullscreen ? (
                        <Minimize className="w-5 h-5" />
                      ) : (
                        <Maximize className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons with Enhanced Effects */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <NavLink to="/formazione">
              <Button variant="hero" size="xl" className="group shadow-[0_0_30px_rgba(255,103,31,0.3)] hover:shadow-[0_0_40px_rgba(255,103,31,0.5)] transition-all">
                <GraduationCap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Piano Formativo
                <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </NavLink>
            <NavLink to="/demo-3d">
              <Button variant="safe" size="xl" className="group shadow-lg hover:shadow-xl transition-all">
                <Gamepad2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Prova il Gioco 3D
              </Button>
            </NavLink>
            <NavLink to="/guida">
              <Button variant="outline" size="xl" className="group shadow-lg hover:shadow-xl transition-all">
                📖 Guida Completa
              </Button>
            </NavLink>
            <Button variant="professional" size="xl" onClick={() => setQuoteDialogOpen(true)} className="shadow-lg hover:shadow-xl transition-shadow">
              Richiedi Preventivo
            </Button>
          </div>

          <QuoteRequestDialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen} />

          {/* Audio Visualizer */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Audio Visualizer</span>
                </div>
                {!isMusicPlaying && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleMusic}
                    className="text-xs"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Attiva Musica
                  </Button>
                )}
              </div>
              <AudioFrequencyVisualizer 
                audioElement={audioElement}
                isPlaying={isMusicPlaying}
              />
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 text-sm text-muted-foreground">
            <p>Nessuna installazione • Zero complessità tecnica • Perfetto per PMI</p>
          </div>
        </div>
      </div>

      {/* Enhanced Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/50 to-transparent z-[2]" />
      
      {/* Glow Effect at Bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm z-[3]" />
    </section>
  );
};
