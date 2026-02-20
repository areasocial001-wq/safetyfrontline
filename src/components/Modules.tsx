import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Building2, Warehouse, AlertCircle, Settings } from "lucide-react";
import officeModule from "@/assets/office-module.jpg";
import warehouseModule from "@/assets/warehouse-module.jpg";
import { QuoteRequestDialog } from "@/components/QuoteRequestDialog";

export const Modules = () => {
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const modules = [
    {
      icon: Package,
      title: "Safety Run",
      subtitle: "Rischi Generali",
      description: "Percorso base con cadute, inciampi, ordine & pulizia, comportamenti corretti e valutazione rischi in tempo reale.",
      color: "primary",
      image: null
    },
    {
      icon: Building2,
      title: "Office Hazard Quest",
      subtitle: "Uffici & VDT",
      description: "Perfetto per PMI del terziario: postura, videoterminale, pause, micro-ergonomia e analisi degli ambienti ufficio.",
      color: "secondary",
      image: officeModule
    },
    {
      icon: Warehouse,
      title: "Magazzino 2.5D",
      subtitle: "Carrelli & Movimentazione",
      description: "Muletti, movimentazione manuale, segnaletica, interazione pedoni/mezzi e gestione aree di stoccaggio.",
      color: "accent",
      image: warehouseModule
    },
    {
      icon: AlertCircle,
      title: "Emergenza!",
      subtitle: "Vie di fuga e Comportamenti",
      description: "Simulazioni rapide di allarme, evacuazione, riconoscimento ostacoli e percorsi sicuri in situazioni di emergenza.",
      color: "destructive",
      image: null
    },
    {
      icon: Settings,
      title: "Personalizzazioni",
      subtitle: "Aziendali",
      description: "Riproduciamo corridoi, reparti, aree esterne e procedure specifiche del cliente in grafica semplice e sostenibile.",
      color: "muted",
      image: null
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      primary: "from-primary/10 to-primary/5 border-primary/20",
      secondary: "from-secondary/10 to-secondary/5 border-secondary/20",
      accent: "from-accent/10 to-accent/5 border-accent/20",
      destructive: "from-destructive/10 to-destructive/5 border-destructive/20",
      muted: "from-muted to-muted/50 border-border"
    };
    return colors[color] || colors.muted;
  };

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      primary: "text-primary",
      secondary: "text-secondary",
      accent: "text-accent",
      destructive: "text-destructive",
      muted: "text-muted-foreground"
    };
    return colors[color] || colors.muted;
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              I Moduli del Sistema <span className="text-primary">Safety Frontline</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ogni modulo è progettato per rispondere a specifiche esigenze formative delle PMI italiane.
            </p>
          </div>

          {/* Modules Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {modules.map((module, index) => (
              <Card 
                key={index}
                className={`p-6 bg-gradient-to-br ${getColorClasses(module.color)} border hover:shadow-lg transition-all duration-300 animate-scale-in group`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image if available */}
                {module.image && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img 
                      src={module.image} 
                      alt={module.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                {/* Icon and Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-background/50">
                    <module.icon className={`w-8 h-8 ${getIconColor(module.color)}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{module.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{module.subtitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {module.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center p-8 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-border">
            <h3 className="text-2xl font-bold mb-3">
              Tutti i moduli sono economicamente sostenibili per le PMI
            </h3>
            <p className="text-muted-foreground mb-6">
              Grafica semplice e adattabile, senza compromessi sull'efficacia formativa.
            </p>
            <Button variant="hero" size="lg" onClick={() => setQuoteDialogOpen(true)}>
              Scopri i Piani Disponibili
            </Button>
          </div>

          <QuoteRequestDialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen} />
        </div>
      </div>
    </section>
  );
};
