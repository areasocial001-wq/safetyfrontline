import { ArrowLeft, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SoundEffectGenerator } from '@/components/SoundEffectGenerator';

const SoundStudio = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Music className="w-6 h-6 text-primary" />
                  Sound Studio
                </h1>
                <p className="text-sm text-muted-foreground">
                  Genera effetti sonori brandizzati con AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SoundEffectGenerator />
      </main>
    </div>
  );
};

export default SoundStudio;
