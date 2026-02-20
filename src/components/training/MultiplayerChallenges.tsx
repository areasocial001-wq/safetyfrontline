import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Swords, Trophy, Clock, Users, Send, CheckCircle, XCircle, 
  ArrowRight, Star, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  module_id: string;
  challenger_score: number | null;
  challenged_score: number | null;
  status: string;
  expires_at: string;
  created_at: string;
  completed_at: string | null;
}

interface ChallengeWithProfiles extends Challenge {
  challenger_name?: string;
  challenged_name?: string;
  challenger_email?: string;
  challenged_email?: string;
}

const MODULE_NAMES: Record<string, string> = {
  giuridico_normativo: 'Giuridico e Normativo',
  gestione_organizzazione: 'Gestione e Organizzazione',
  valutazione_rischi: 'Valutazione dei Rischi',
  dpi_protezione: 'DPI e Protezione',
};

export const MultiplayerChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeWithProfiles[]>([]);
  const [challengeEmail, setChallengeEmail] = useState('');
  const [selectedModule, setSelectedModule] = useState('giuridico_normativo');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('training_challenges')
      .select('*')
      .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      // Fetch profile names
      const userIds = [...new Set(data.flatMap(c => [c.challenger_id, c.challenged_id]))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const enriched: ChallengeWithProfiles[] = data.map(c => ({
        ...c,
        challenger_name: profileMap.get(c.challenger_id)?.full_name || 'Sconosciuto',
        challenged_name: profileMap.get(c.challenged_id)?.full_name || 'Sconosciuto',
        challenger_email: profileMap.get(c.challenger_id)?.email,
        challenged_email: profileMap.get(c.challenged_id)?.email,
      }));
      
      setChallenges(enriched);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const sendChallenge = async () => {
    if (!user || !challengeEmail.trim()) return;
    setSending(true);

    // Find user by email
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', challengeEmail.trim())
      .maybeSingle();

    if (!targetProfile) {
      toast({ title: 'Utente non trovato', description: 'Nessun utente registrato con questa email.', variant: 'destructive' });
      setSending(false);
      return;
    }

    if (targetProfile.id === user.id) {
      toast({ title: 'Non puoi sfidare te stesso!', variant: 'destructive' });
      setSending(false);
      return;
    }

    const { error } = await supabase.from('training_challenges').insert({
      challenger_id: user.id,
      challenged_id: targetProfile.id,
      module_id: selectedModule,
    });

    if (error) {
      toast({ title: 'Errore', description: 'Impossibile inviare la sfida.', variant: 'destructive' });
    } else {
      toast({ title: '⚔️ Sfida Inviata!', description: `Sfida su "${MODULE_NAMES[selectedModule]}" inviata a ${challengeEmail}` });
      setChallengeEmail('');
      fetchChallenges();
    }
    setSending(false);
  };

  const acceptChallenge = async (challengeId: string) => {
    await supabase
      .from('training_challenges')
      .update({ status: 'accepted' })
      .eq('id', challengeId);
    
    toast({ title: '✅ Sfida Accettata!', description: 'Completa il modulo per registrare il tuo punteggio.' });
    fetchChallenges();
  };

  const submitScore = async (challengeId: string, score: number, isChallenger: boolean) => {
    const updates: any = isChallenger 
      ? { challenger_score: score }
      : { challenged_score: score };

    // Check if both scores are now present
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      const otherScore = isChallenger ? challenge.challenged_score : challenge.challenger_score;
      if (otherScore !== null) {
        updates.status = 'completed';
        updates.completed_at = new Date().toISOString();
      }
    }

    await supabase
      .from('training_challenges')
      .update(updates)
      .eq('id', challengeId);

    fetchChallenges();
  };

  if (!user) return null;

  const pendingReceived = challenges.filter(c => c.status === 'pending' && c.challenged_id === user.id);
  const activeChallenges = challenges.filter(c => c.status === 'accepted');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Send Challenge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            Sfida un Collega
          </CardTitle>
          <CardDescription>
            Inserisci l'email del collega e scegli il modulo per la sfida.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Email del collega..."
              value={challengeEmail}
              onChange={(e) => setChallengeEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={sendChallenge} disabled={sending || !challengeEmail.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Sfida
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MODULE_NAMES).map(([id, name]) => (
              <Button
                key={id}
                variant={selectedModule === id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedModule(id)}
              >
                {name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Challenges (Received) */}
      {pendingReceived.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <AlertTriangle className="w-5 h-5" />
              Sfide Ricevute ({pendingReceived.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingReceived.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div>
                  <p className="font-medium">{c.challenger_name} ti ha sfidato!</p>
                  <p className="text-sm text-muted-foreground">
                    Modulo: {MODULE_NAMES[c.module_id]} • Scade: {new Date(c.expires_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
                <Button size="sm" onClick={() => acceptChallenge(c.id)}>
                  <CheckCircle className="w-4 h-4 mr-1" /> Accetta
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              Sfide in Corso ({activeChallenges.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeChallenges.map(c => {
              const isChallenger = c.challenger_id === user.id;
              const myScore = isChallenger ? c.challenger_score : c.challenged_score;
              const opponentScore = isChallenger ? c.challenged_score : c.challenger_score;
              const opponentName = isChallenger ? c.challenged_name : c.challenger_name;

              return (
                <div key={c.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">vs {opponentName}</p>
                    <Badge variant="outline">{MODULE_NAMES[c.module_id]}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-2 rounded bg-primary/5">
                      <p className="text-xs text-muted-foreground">Tu</p>
                      <p className="text-lg font-bold">{myScore !== null ? `${myScore}%` : '—'}</p>
                    </div>
                    <div className="text-center p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">{opponentName}</p>
                      <p className="text-lg font-bold">{opponentScore !== null ? `${opponentScore}%` : '—'}</p>
                    </div>
                  </div>
                  {myScore === null && (
                    <p className="text-xs text-primary mt-2 text-center">
                      Completa il modulo per registrare il tuo punteggio!
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              Sfide Completate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedChallenges.slice(0, 5).map(c => {
              const isChallenger = c.challenger_id === user.id;
              const myScore = isChallenger ? c.challenger_score : c.challenged_score;
              const opponentScore = isChallenger ? c.challenged_score : c.challenger_score;
              const opponentName = isChallenger ? c.challenged_name : c.challenger_name;
              const won = (myScore || 0) > (opponentScore || 0);
              const tied = myScore === opponentScore;

              return (
                <div key={c.id} className={`p-3 rounded-lg border ${won ? 'border-accent/30 bg-accent/5' : tied ? 'border-border' : 'border-destructive/30 bg-destructive/5'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {won ? <Trophy className="w-4 h-4 text-accent" /> : tied ? <Users className="w-4 h-4" /> : <XCircle className="w-4 h-4 text-destructive" />}
                      <span className="font-medium">{won ? 'Vittoria' : tied ? 'Pareggio' : 'Sconfitta'} vs {opponentName}</span>
                    </div>
                    <span className="text-sm font-bold">{myScore}% vs {opponentScore}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{MODULE_NAMES[c.module_id]}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
