import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, ArrowRight, GraduationCap, Shield, Flame, Cross, Monitor, Building2, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";

const PREVIEW_MODULES = [
  { icon: Shield, label: "Formazione Generale" },
  { icon: Building2, label: "Specifica Aziende" },
  { icon: Flame, label: "Antincendio" },
  { icon: Cross, label: "Primo Soccorso" },
  { icon: Heart, label: "RLS" },
  { icon: Monitor, label: "Cybersecurity" },
];

export const DemoCTA = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative">
        <Card className="border-2 border-primary/20 bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                NUOVO • Anteprima interattiva
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                Prova il <span className="text-primary">Percorso Demo</span> completo
              </h2>
              <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                Esplora liberamente un esempio di Pacchetto Formativo Personalizzato:
                tutti i moduli, le lezioni e i test che riceveranno i tuoi dipendenti.
                Senza registrazione, senza tempi di attesa.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-xl font-bold shadow-lg">
                  <Link to="/demo-percorso">
                    <Play className="w-4 h-4 mr-2" />
                    Avvia il Percorso Demo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl">
                  <Link to="/demo-3d">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Vedi le Sim 3D
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: module preview grid */}
            <div className="grid grid-cols-3 gap-3">
              {PREVIEW_MODULES.map((m, i) => {
                const Icon = m.icon;
                return (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl border-2 border-border bg-gradient-to-br from-card to-muted/30 flex flex-col items-center justify-center gap-2 p-3 hover:border-primary/40 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-semibold text-center text-muted-foreground leading-tight">
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
