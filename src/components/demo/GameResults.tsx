import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Clock, TrendingUp, Share2, RotateCcw } from "lucide-react";
import { GameSession } from "@/types/demo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface GameResultsProps {
  session: GameSession;
  completionTime: number;
  onRestart: () => void;
  onChangeScenario: () => void;
}

export const GameResults = ({ session, completionTime, onRestart, onChangeScenario }: GameResultsProps) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');

  const maxScore = session.scenario.risks.reduce((sum, risk) => sum + risk.points, 0);
  const percentage = Math.round((session.score / maxScore) * 100);
  const risksFound = session.risksFound.length;
  const risksMissed = session.scenario.risks.length - risksFound;

  const getPerformanceMessage = () => {
    if (percentage >= 90) return "🏆 Eccellente! Esperto della sicurezza!";
    if (percentage >= 70) return "👍 Ottimo lavoro! Ben fatto!";
    if (percentage >= 50) return "✅ Buon risultato! Continua così!";
    return "💪 Riprova! Puoi fare meglio!";
  };

  const handleSaveResult = async () => {
    // If user is authenticated, use their profile data
    let userEmail = email;
    let userName = fullName;
    let userCompany = companyName;
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name, company_name')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        userEmail = profile.email;
        userName = profile.full_name || '';
        userCompany = profile.company_name || '';
      }
    } else if (!email || !fullName) {
      toast.error("Inserisci email e nome per salvare il risultato");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('demo_sessions')
        .insert({
          user_id: user?.id || null,
          email: userEmail,
          full_name: userName,
          company_name: userCompany || null,
          scenario: session.scenario.type,
          score: session.score,
          max_score: maxScore,
          completion_time: completionTime,
          risks_identified: risksFound,
          risks_missed: risksMissed,
          completed: true
        });

      if (error) throw error;

      // If user is authenticated and qualified (>=70%), send email notification
      if (user && percentage >= 70) {
        try {
          const certificateUrl = `${window.location.origin}/employee`;
          
          await supabase.functions.invoke('send-certificate-notification', {
            body: {
              employeeEmail: userEmail,
              employeeName: userName,
              moduleName: session.scenario.title,
              score: session.score,
              maxScore: maxScore,
              percentage: percentage,
              certificateUrl: certificateUrl,
            },
          });
          
          toast.success("🎓 Certificato ottenuto! Controlla la tua email per i dettagli.");
        } catch (emailError) {
          console.error('Error sending notification email:', emailError);
          // Don't fail the entire operation if email fails
          toast.success("Risultato salvato! Certificato disponibile nella tua area riservata.");
        }
      } else {
        toast.success("Risultato salvato! Ti contatteremo presto.");
      }

      setEmail('');
      setFullName('');
      setCompanyName('');
    } catch (error) {
      console.error('Error saving demo result:', error);
      toast.error("Errore nel salvataggio. Riprova.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Main Results Card */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">{getPerformanceMessage()}</h2>
          <p className="text-muted-foreground">
            Hai completato: <span className="font-semibold">{session.scenario.title}</span>
          </p>
        </div>

        {/* Score Display */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-40 h-40 rounded-full bg-gradient-hero flex items-center justify-center shadow-lg">
              <div className="text-center text-primary-foreground">
                <p className="text-5xl font-bold">{percentage}%</p>
                <p className="text-sm">Accuratezza</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{session.score}</p>
            <p className="text-sm text-muted-foreground">Punti Totali</p>
          </Card>

          <Card className="p-4 text-center">
            <Target className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold">{risksFound}/{session.scenario.risks.length}</p>
            <p className="text-sm text-muted-foreground">Rischi Trovati</p>
          </Card>

          <Card className="p-4 text-center">
            <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold">{Math.floor(completionTime / 60)}:{(completionTime % 60).toString().padStart(2, '0')}</p>
            <p className="text-sm text-muted-foreground">Tempo Impiegato</p>
          </Card>
        </div>
      </Card>

      {/* Save Results Card */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          {user ? "Salva il tuo Risultato" : "Salva il tuo Risultato"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {user 
            ? percentage >= 70 
              ? "🎓 Hai ottenuto la qualifica! I tuoi dati verranno salvati automaticamente e riceverai una email di conferma."
              : "I tuoi risultati verranno salvati nel tuo profilo."
            : "Inserisci i tuoi dati per salvare il risultato e ricevere informazioni su SicurAzienda"
          }
        </p>
        {!user && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nome e Cognome *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Mario Rossi"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mario.rossi@esempio.it"
              />
            </div>
            <div>
              <Label htmlFor="companyName">Azienda (opzionale)</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nome Azienda Srl"
              />
            </div>
          </div>
        )}
        <Button
          onClick={handleSaveResult}
          disabled={isSaving}
          className="w-full mt-4"
          variant="hero"
          size="lg"
        >
          {isSaving ? "Salvataggio..." : user ? "Salva Risultato" : "Salva Risultato e Richiedi Info"}
        </Button>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onRestart}
          variant="professional"
          size="lg"
          className="flex-1"
        >
          <RotateCcw className="w-5 h-5" />
          Rigioca Questo Scenario
        </Button>
        <Button
          onClick={onChangeScenario}
          variant="secondary"
          size="lg"
          className="flex-1"
        >
          Prova Altro Scenario
        </Button>
      </div>
    </div>
  );
};
