import { Monitor, Users, Target, BarChart3 } from "lucide-react";

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Come Funziona il <span className="text-primary">Game Frontale</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Immagina l'aula: luci leggermente abbassate, proiettore acceso, tutti che guardano lo schermo.
            </p>
          </div>

          {/* Main Flow */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Step 1 */}
            <div className="p-8 rounded-xl bg-card border border-border animate-slide-in-left">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <Monitor className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Ambiente 2.5D</h3>
              <p className="text-muted-foreground leading-relaxed">
                Sul maxi-schermo appare un ambiente in stile anni '90: corridoi di magazzino, uffici, 
                reparti produttivi, scale, aree esterne.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-xl bg-card border border-border animate-slide-in-right">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-secondary">2</span>
                </div>
                <Target className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Riconosci i Rischi</h3>
              <p className="text-muted-foreground leading-relaxed">
                Il partecipante non deve "sparare" — deve scegliere, evitare, rispondere, osservare, 
                riconoscere i rischi presenti nella scena.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-xl bg-card border border-border animate-slide-in-left">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent">3</span>
                </div>
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Interazione di Gruppo</h3>
              <p className="text-muted-foreground leading-relaxed">
                Con un click del docente o un controller passabile tra partecipanti: 
                si avanza solo se si abbina l'azione giusta al rischio presente.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-8 rounded-xl bg-card border border-border animate-slide-in-right">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Dati Immediati</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ogni scelta viene registrata automaticamente. Report esportabili per DVR, 
                audit e registro formazione.
              </p>
            </div>
          </div>

          {/* Challenge Types */}
          <div className="p-8 rounded-xl bg-muted/50 border border-border">
            <h3 className="text-2xl font-bold mb-6 text-center">Ogni Stanza è una Micro-Sfida</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "Postura sbagliata",
                "Carico sollevato male",
                "Cavo a terra",
                "Mulettista distratto",
                "Via di esodo bloccata",
                "Comportamento frettoloso",
                "DPI dimenticato",
                "Area non segnalata"
              ].map((challenge, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg bg-background border border-border text-center"
                >
                  <p className="text-sm font-medium">{challenge}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Benefits */}
          <div className="mt-12 grid md:grid-cols-5 gap-4 text-center">
            {[
              "Immediato",
              "Leggero",
              "Comprensibile",
              "Zero Installazioni",
              "100% Browser"
            ].map((benefit, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20"
              >
                <p className="font-semibold text-primary">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
