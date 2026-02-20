import { Shield, CheckCircle, FileCheck, Award } from "lucide-react";

export const Compliance = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-800 border-[3px] border-black dark:border-white mb-6 animate-pulse shadow-[0_0_25px_rgba(0,0,0,0.4)] dark:shadow-[0_0_25px_rgba(255,255,255,0.4)]">
              <Shield className="w-7 h-7 text-black dark:text-white animate-pulse" />
              <span className="font-bold text-xl text-black dark:text-white">Conformità Normativa</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Allineamento con <span className="text-accent">Accordo Stato-Regioni 2025</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Il Game Frontale è perfettamente aderente ai tre punti cardine del nuovo Accordo.
            </p>
          </div>

          {/* Three Pillars */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-8 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Metodologie Attive</h3>
              <p className="text-muted-foreground leading-relaxed">
                Il discente partecipa, decide, valuta. Non è uno spettatore passivo ma un protagonista attivo 
                del processo di apprendimento.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <FileCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Gamification Didattica</h3>
              <p className="text-muted-foreground leading-relaxed">
                Il gioco non è intrattenimento fine a se stesso, ma uno strumento di valutazione e 
                consolidamento delle competenze acquisite.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Simulazione Guidata</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ogni livello rappresenta una micro-simulazione coerente con la realtà produttiva, 
                rispettando i contesti operativi reali.
              </p>
            </div>
          </div>

          {/* Compliance Details */}
          <div className="p-8 rounded-xl bg-card border border-border">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Shield className="w-8 h-8 text-accent" />
              Conformità D.Lgs. 81/08
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-lg">✓ Requisiti Soddisfatti</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Formazione generale e specifica</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Valutazione dell'apprendimento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Registro formazione automatico</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Tracciabilità completa delle attività</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-lg">✓ Report e Documentazione</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Export Excel per DVR</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Matrice rischio/formazione</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Report per audit ispettivi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Attestati di partecipazione automatici</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Statement */}
          <div className="mt-12 text-center p-8 rounded-xl bg-gradient-safe text-accent-foreground">
            <p className="text-2xl font-bold mb-2">
              Non usiamo "giochi per far ridere"
            </p>
            <p className="text-xl">
              ma giochi per far capire.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
