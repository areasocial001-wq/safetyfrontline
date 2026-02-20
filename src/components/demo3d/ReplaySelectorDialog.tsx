import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Target, Clock, Shield } from "lucide-react";
import { GameReplay } from "@/lib/replay-db";

interface ReplaySelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replays: GameReplay[];
  selectedReplay: GameReplay | null;
  onSelectReplay: (replay: GameReplay) => void;
  currentUserId?: string;
}

export const ReplaySelectorDialog = ({
  open,
  onOpenChange,
  replays,
  selectedReplay,
  onSelectReplay,
  currentUserId,
}: ReplaySelectorDialogProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Seleziona Replay Picture-in-Picture
          </DialogTitle>
          <DialogDescription>
            Scegli un replay da visualizzare durante il gioco per apprendere strategie vincenti
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3 pr-4">
            {replays.map((replay, index) => (
              <div
                key={replay.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-lg ${
                  selectedReplay?.id === replay.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => {
                  onSelectReplay(replay);
                  onOpenChange(false);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">#{index + 1}</span>
                  </div>

                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Punti</p>
                        <p className="font-bold">{replay.score}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Tempo</p>
                        <p className="font-bold">{formatTime(replay.time_elapsed)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Collisioni</p>
                        <p className="font-bold">{replay.collisions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {replay.user_id === currentUserId ? (
                      <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
                        Il Tuo
                      </Badge>
                    ) : replay.is_personal_record ? (
                      <Badge variant="outline" className="bg-accent/10 border-accent/30 text-accent">
                        <Trophy className="w-3 h-3 mr-1" />
                        Top
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          {selectedReplay && (
            <Button
              onClick={() => {
                onSelectReplay(selectedReplay);
                onOpenChange(false);
              }}
            >
              Conferma Selezione
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
