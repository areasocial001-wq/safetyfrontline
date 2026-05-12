import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock, Clock, Target, ArrowLeft, CheckCircle2, Play } from "lucide-react";
import { Sim3dPreview } from "@/components/Sim3dPreview";
import { SIM3D_PREVIEWS } from "@/data/sim3d-previews";
import { QuoteRequestDialog } from "@/components/QuoteRequestDialog";
import { Footer } from "@/components/Footer";

interface BonusModule {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  difficulty: string;
  description: string;
  highlights: string[];
  previewKey?: keyof typeof SIM3D_PREVIEWS;
  demoUrl?: string;
}

const BONUS_MODULES: BonusModule[] = [
  {
    id: "cybersecurity",
    title: "Cyber Security Office",
    subtitle: "Simulazione 3D di sicurezza informatica in ufficio",
    duration: "30-45 minuti",
    difficulty: "Medio",
    description:
      "Un percorso interattivo in un ufficio 3D dove l'utente deve identificare 8 rischi cyber realistici: post-it con password, schermi sbloccati, email di phishing, chiavette USB sospette, documenti riservati lasciati in vista, password deboli, hotspot personali e stampe abbandonate. Ogni rischio è accompagnato da un quiz contestuale con riferimenti normativi (GDPR, NIS2, policy aziendali).",
    highlights: [
      "8 rischi informatici da scoprire in ambiente 3D",
      "Quiz contestuale con spiegazioni normative",
      "Riferimenti a GDPR, NIS2 e clean desk policy",
      "Punteggio finale con badge dedicato",
    ],
    previewKey: "cybersecurity",
    demoUrl: "/demo-3d?scenario=cybersecurity",
  },
];

const BonusModules = () => {
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Moduli Bonus — Safety Frontline</title>
        <meta
          name="description"
          content="Moduli formativi extra opzionali di Safety Frontline: Cyber Security Office e altri contenuti aggiuntivi non inclusi nel piano standard."
        />
        <link rel="canonical" href="https://safetyfrontline.com/moduli-bonus" />
      </Helmet>

      {/* Header */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-fuchsia-500/10 via-purple-500/5 to-primary/10">
        <div className="container px-4 mx-auto py-16">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Torna alla home
            </Link>

            <Badge className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-500 hover:to-purple-600 text-white border-0 mb-4 gap-1">
              <Sparkles className="w-3 h-3" /> Contenuti Extra
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Moduli <span className="bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent">Bonus</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Contenuti formativi opzionali non inclusi nel piano standard. Attivali separatamente come extra
              per arricchire il percorso dei tuoi dipendenti con simulazioni e tematiche aggiuntive.
            </p>
          </div>
        </div>
      </section>

      {/* Modules list */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            {BONUS_MODULES.map((mod) => (
              <Card key={mod.id} className="overflow-hidden border-purple-500/20">
                <div className="grid md:grid-cols-2 gap-0">
                  {mod.previewKey && SIM3D_PREVIEWS[mod.previewKey] && (
                    <div className="relative">
                      <Sim3dPreview
                        meta={SIM3D_PREVIEWS[mod.previewKey]}
                        className="h-full min-h-[280px]"
                        showBadge={false}
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-500 hover:to-purple-600 text-white border-0 gap-1">
                          <Sparkles className="w-3 h-3" /> Modulo Bonus
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="p-6 md:p-8 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                        <Lock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold leading-tight">{mod.title}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{mod.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="gap-1">
                        <Clock className="w-3 h-3" /> {mod.duration}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Target className="w-3 h-3" /> Difficoltà: {mod.difficulty}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {mod.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {mod.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex flex-wrap gap-3">
                      <Button variant="hero" size="lg" onClick={() => setQuoteDialogOpen(true)}>
                        <Sparkles className="w-4 h-4" /> Attiva l'Extra
                      </Button>
                      {mod.demoUrl && (
                        <Button asChild variant="outline" size="lg">
                          <Link to={mod.demoUrl} className="gap-2">
                            <Play className="w-4 h-4" /> Prova la demo
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Info card */}
            <Card className="p-6 bg-muted/30 border-dashed">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" /> Come funzionano i moduli bonus?
              </h3>
              <p className="text-sm text-muted-foreground">
                I moduli bonus sono add-on opzionali che si affiancano ai pacchetti standard.
                Possono essere attivati per singoli dipendenti, gruppi o per l'intera azienda
                in base alle esigenze. Contattaci per ricevere un preventivo personalizzato.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
      <QuoteRequestDialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen} />
    </div>
  );
};

export default BonusModules;
