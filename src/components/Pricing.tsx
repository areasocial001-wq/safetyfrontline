import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Users, Building } from "lucide-react";
import { QuoteRequestDialog } from "@/components/QuoteRequestDialog";

export const Pricing = () => {
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const plans = [
    {
      name: "Versione Aula",
      icon: Users,
      price: "Su Richiesta",
      description: "Modulo aggiuntivo per la formazione classica in aula",
      features: [
        "Perfetto per corsi di gruppo",
        "Interazione collettiva gestita dal docente",
        "Proiettore/TV 55\" sufficiente",
        "Controller passabile tra partecipanti",
        "Report statistiche di gruppo",
        "Tutti i moduli disponibili",
        "Assistenza tecnica inclusa",
        "Aggiornamenti normativi automatici"
      ],
      highlight: false
    },
    {
      name: "Versione Individuale",
      icon: Building,
      price: "Abbonamento",
      description: "Formazione in azienda con accesso individuale",
      features: [
        "Accesso multi-utente per l'azienda",
        "Formazione autonoma dei dipendenti",
        "Dashboard aziendale con analytics",
        "Tracciamento individuale progressi",
        "Report esportabili per DVR",
        "Tutti i moduli inclusi",
        "Personalizzazioni aziendali disponibili",
        "Supporto dedicato"
      ],
      highlight: true
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Scegli la <span className="text-primary">Modalità</span> Giusta per Te
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Due opzioni flessibili per adattarsi perfettamente alle esigenze della tua azienda.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {plans.map((plan, index) => (
              <Card 
                key={index}
                className={`p-8 ${
                  plan.highlight 
                    ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 shadow-lg scale-105' 
                    : 'bg-card border-border'
                } hover:shadow-xl transition-all duration-300 animate-scale-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.highlight && (
                  <div className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold mb-4">
                    Più Popolare
                  </div>
                )}
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-full ${
                    plan.highlight ? 'bg-primary/10' : 'bg-secondary/10'
                  } flex items-center justify-center`}>
                    <plan.icon className={`w-8 h-8 ${
                      plan.highlight ? 'text-primary' : 'text-secondary'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-4xl font-bold mb-2">{plan.price}</div>
                  <p className="text-muted-foreground text-sm">
                    Contattaci per un preventivo personalizzato
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 mt-0.5 shrink-0 ${
                        plan.highlight ? 'text-primary' : 'text-accent'
                      }`} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button 
                  variant={plan.highlight ? "hero" : "professional"} 
                  className="w-full"
                  size="lg"
                  onClick={() => setQuoteDialogOpen(true)}
                >
                  Richiedi Informazioni
                </Button>
              </Card>
            ))}
          </div>

          <QuoteRequestDialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen} />

          {/* Additional Info */}
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-lg bg-card border border-border">
              <p className="text-3xl font-bold text-primary mb-2">Zero</p>
              <p className="text-muted-foreground">Installazioni necessarie</p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <p className="text-3xl font-bold text-secondary mb-2">100%</p>
              <p className="text-muted-foreground">Browser-based</p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <p className="text-3xl font-bold text-accent mb-2">24/7</p>
              <p className="text-muted-foreground">Supporto tecnico</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
