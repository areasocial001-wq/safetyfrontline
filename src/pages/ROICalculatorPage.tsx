import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { ROICalculator } from "@/components/ROICalculator";
import { SECTOR_PACKAGES, PLAN_TIERS } from "@/data/sector-packages";
import { QuoteRequestDialog } from "@/components/QuoteRequestDialog";
import { Footer } from "@/components/Footer";

const fmt = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const ROICalculatorPage = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    document.title = "ROI & Pacchetti per Settore | Safety Frontline";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-20">
        <div className="container px-4 mx-auto py-3 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-4 h-4" /> Torna alla home
          </Link>
          <Button variant="hero" size="sm" onClick={() => setQuoteOpen(true)}>
            Richiedi preventivo
          </Button>
        </div>
      </header>

      <ROICalculator />

      {/* Sector Packages */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Pacchetti per <span className="text-primary">settore</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Listino indicativo €/dipendente/anno per il piano <strong>Professional</strong>. Starter -30%, Enterprise +40%.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTOR_PACKAGES.map((s) => {
              const colorMap: Record<string, string> = {
                basso: "border-accent/30 bg-accent/5",
                medio: "border-secondary/30 bg-secondary/5",
                alto: "border-destructive/30 bg-destructive/5",
              };
              return (
                <Card key={s.id} className={`p-6 ${colorMap[s.riskLevel]} hover:shadow-lg transition`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{s.icon}</div>
                    <Badge variant="outline" className="capitalize">rischio {s.riskLevel}</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{s.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{s.description}</p>

                  <div className="mb-4">
                    <p className="text-3xl font-black text-primary tabular-nums">{fmt(s.pricePerEmployee)}</p>
                    <p className="text-xs text-muted-foreground">per dipendente / anno</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs uppercase font-bold text-muted-foreground mb-2">Moduli inclusi · {s.totalHours}h</p>
                    <ul className="space-y-1 text-sm">
                      {s.modules.map((m, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className="flex-1">{m.name}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">{m.hours}h</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-[11px] text-muted-foreground italic mb-4">Ideale per: {s.recommendedFor}</p>

                  <Button variant="outline" className="w-full" onClick={() => setQuoteOpen(true)}>
                    Richiedi preventivo
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plan Tiers */}
      <section className="py-16 bg-background">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Tre livelli, un'unica piattaforma</h2>
            <p className="text-muted-foreground">Il moltiplicatore si applica al prezzo del settore selezionato.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLAN_TIERS.map((t) => (
              <Card key={t.id} className={`p-6 ${t.id === "professional" ? "border-primary/40 shadow-lg scale-105 bg-primary/5" : ""}`}>
                {t.id === "professional" && (
                  <Badge className="mb-3 bg-primary text-primary-foreground"><Sparkles className="w-3 h-3 mr-1" />Più scelto</Badge>
                )}
                <h3 className="text-2xl font-bold mb-1">{t.name}</h3>
                <p className="text-3xl font-black text-primary mb-4 tabular-nums">×{t.multiplier}</p>
                <ul className="space-y-2 text-sm mb-6">
                  {t.perks.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={t.id === "professional" ? "hero" : "outline"} className="w-full" onClick={() => setQuoteOpen(true)}>
                  Scegli {t.name}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <QuoteRequestDialog open={quoteOpen} onOpenChange={setQuoteOpen} />
      <Footer />
    </div>
  );
};

export default ROICalculatorPage;
