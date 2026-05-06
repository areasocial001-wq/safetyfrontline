import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SpotTheHazardGame from "@/components/training/SpotTheHazardGame";
import { CARTOON_LEVELS } from "@/data/cartoon-hazard-levels";

const SpotTheHazardPage = () => {
  const [levelId, setLevelId] = useState<string | null>(null);
  const level = levelId ? CARTOON_LEVELS[levelId] : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" />Home</Link>
            </Button>
            <h1 className="font-bold text-lg">Spot the Hazard</h1>
          </div>
          {level && (
            <Button variant="outline" size="sm" onClick={() => setLevelId(null)}>Cambia livello</Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!level ? (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Trova tutti i rischi</h2>
              <p className="text-muted-foreground">
                Mini-game 2D illustrato. Esplora la scena, clicca su ogni pericolo e leggi
                la spiegazione educativa. Attento alle vite!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(CARTOON_LEVELS).map(l => (
                <Card key={l.level_id} className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all" onClick={() => setLevelId(l.level_id)}>
                  <div className="relative aspect-video overflow-hidden">
                    <img src={l.background_image_url} alt={l.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-bold text-lg">{l.title}</h3>
                      <div className="flex items-center gap-3 text-xs opacity-90 mt-1">
                        <span>🎯 {l.total_hazards} rischi</span>
                        <span>❤️ {l.lives} vite</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-3">{l.description}</p>
                    <Button className="w-full"><Play className="h-4 w-4 mr-1" />Inizia</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-bold">{level.title}</h2>
              <p className="text-sm text-muted-foreground italic">"{level.intro_dialogue.text}" — {level.intro_dialogue.speaker}</p>
            </div>
            <SpotTheHazardGame level={level} onExit={() => setLevelId(null)} />
          </div>
        )}
      </main>
    </div>
  );
};

export default SpotTheHazardPage;
