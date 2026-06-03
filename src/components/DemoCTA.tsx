import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Sparkles, Play, Pause, ArrowRight, GraduationCap,
  Shield, Flame, Cross, Building2, Heart,
  Volume2, VolumeX, Maximize, RotateCcw, X,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const PREVIEW_MODULES = [
  { icon: Shield, label: "Formazione Generale" },
  { icon: Building2, label: "Specifica Aziende" },
  { icon: Flame, label: "Antincendio" },
  { icon: Cross, label: "Primo Soccorso" },
  { icon: Heart, label: "RLS" },
];

export const DemoCTA = () => {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setProgress((v.currentTime / (v.duration || 1)) * 100);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [showVideo]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const onVolume = (val: number[]) => {
    const v = videoRef.current;
    if (!v) return;
    const nv = val[0];
    setVolume(nv);
    v.volume = nv / 100;
    if (nv === 0) { setIsMuted(true); v.muted = true; }
    else if (isMuted) { setIsMuted(false); v.muted = false; }
  };

  const restart = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  };

  const toggleFullscreen = async () => {
    const c = containerRef.current;
    if (!c) return;
    try {
      if (!document.fullscreenElement) await c.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const bar = e.currentTarget;
    if (!v || !bar || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
  };

  const closeVideo = () => {
    const v = videoRef.current;
    if (v) v.pause();
    setShowVideo(false);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative">
        <Card className="border-2 border-primary/20 bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
          {showVideo ? (
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  Video Demo del Percorso Formativo
                </h3>
                <Button variant="ghost" size="icon" onClick={closeVideo} aria-label="Chiudi video">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div
                ref={containerRef}
                className="relative rounded-xl overflow-hidden border-2 border-primary/30 shadow-[0_0_40px_rgba(255,103,31,0.25)] bg-black"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-video object-contain bg-black"
                >
                  <source src="/videos/safety-frontline-demo.mp4" type="video/mp4" />
                </video>

                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center z-10"
                    aria-label="Riproduci"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-[0_0_40px_rgba(255,103,31,0.8)] hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-primary-foreground ml-1" />
                    </div>
                  </button>
                )}

                <div
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent transition-all duration-300 z-20 ${
                    showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <div className="px-4 pt-3">
                    <div
                      className="h-2 bg-muted/50 rounded-full overflow-hidden cursor-pointer relative group"
                      onClick={handleSeek}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-150 relative"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-foreground rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 gap-2">
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" onClick={togglePlay}
                        className="h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={restart}
                        className="h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary"
                        title="Riavvia">
                        <RotateCcw className="w-5 h-5" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={toggleMute}
                        className="h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary">
                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                      <div className="hidden sm:block w-24">
                        <Slider value={[isMuted ? 0 : volume]} max={100} step={1} onValueChange={onVolume} />
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={toggleFullscreen}
                      className="h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary">
                      <Maximize className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 p-5 sm:p-8 md:p-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  NUOVO • Anteprima interattiva
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                  Prova il <span className="text-primary">Percorso Demo</span> completo
                </h2>
                <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                  Esplora liberamente un esempio di Pacchetto Formativo Personalizzato:
                  tutti i moduli, le lezioni e i test che riceveranno i tuoi dipendenti.
                  Senza registrazione, senza tempi di attesa.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-xl font-bold shadow-lg">
                    <Link to="/demo-percorso">
                      <Play className="w-4 h-4 mr-2" />
                      Avvia il Percorso Demo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="rounded-xl font-bold"
                    onClick={() => setShowVideo(true)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Guarda il Video Demo
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-xl">
                    <Link to="/demo-3d">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Vedi le Sim 3D
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {PREVIEW_MODULES.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded-2xl border-2 border-border bg-gradient-to-br from-card to-muted/30 flex flex-col items-center justify-center gap-2 p-3 hover:border-primary/40 hover:shadow-md transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-[10px] font-semibold text-center text-muted-foreground leading-tight">
                        {m.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};
