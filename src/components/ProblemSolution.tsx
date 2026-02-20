import { AlertTriangle, Zap, Users, TrendingUp } from "lucide-react";

export const ProblemSolution = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Problem Section */}
          <div className="mb-16 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold">Il Problema</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-lg bg-card border border-border">
                <h3 className="text-xl font-semibold mb-3 text-destructive">
                  Formazione Tradizionale
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Aule noiose, attenzione che crolla dopo 10 minuti</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Slides infinite senza coinvolgimento reale</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Obbligo percepito, zero motivazione intrinseca</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Difficile misurare l'apprendimento reale</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-lg bg-card border border-border">
                <h3 className="text-xl font-semibold mb-3 text-muted-foreground">
                  VR Complesso
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Costi proibitivi per le PMI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Setup tecnico complesso, serve personale specializzato</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Dispositivi costosi e manutenzione continua</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Inadatto per aule con più partecipanti</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Solution Section */}
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-8 h-8 text-accent" />
              <h2 className="text-3xl md:text-4xl font-bold">La Soluzione SicurAzienda</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <Users className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Perfetto per PMI</h3>
                <p className="text-muted-foreground">
                  Nessun setup complesso. Basta un computer e un proiettore. Zero costi nascosti.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20">
                <TrendingUp className="w-12 h-12 text-secondary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Massimo Engagement</h3>
                <p className="text-muted-foreground">
                  Gamification che funziona davvero. L'aula si accende, le persone partecipano.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20">
                <Zap className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-xl font-semibold mb-3">Dati Concreti</h3>
                <p className="text-muted-foreground">
                  Statistiche immediate. Report per DVR e audit. Tutto tracciato automaticamente.
                </p>
              </div>
            </div>

            {/* Key Insight */}
            <div className="mt-12 p-8 rounded-xl bg-gradient-hero text-primary-foreground text-center">
              <p className="text-2xl font-bold mb-2">
                Le PMI non hanno bisogno di mondi 3D ultra-realistici.
              </p>
              <p className="text-lg opacity-90">
                Hanno bisogno di attenzione, partecipazione, risate, confronto diretto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
