import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Play, CheckCircle, Lock, Sparkles, Trophy,
  Flame, Heart, Shield, Monitor, Cross, Building2, Clock,
  Award, Download, Home, PartyPopper, Star, Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getModuleInfo } from "@/data/all-training-modules";
import { generateCertificatePdf, DEFAULT_CERTIFICATE_SETTINGS } from "@/lib/facsimile-pdf";
import { toast } from "sonner";

const DEFAULT_DEMO_PACKAGE_ID = "8829ce9f-3bd3-4322-9f5a-1b29237076a2"; // IRM
const STORAGE_KEY = "demo-completed-modules";

const MODULE_ICONS: Record<string, any> = {
  formazione_alto: Shield,
  specifica_aziende: Building2,
  antincendio_m2: Flame,
  primo_soccorso_m2: Cross,
  rls_m2: Heart,
  cybersecurity: Monitor,
};

const MODULE_DURATIONS: Record<string, number> = {
  formazione_alto: 15,
  specifica_aziende: 15,
  antincendio_m2: 12,
  primo_soccorso_m2: 12,
  rls_m2: 10,
  cybersecurity: 8,
};

interface DemoModule {
  id: string;
  order: number;
  name: string;
  icon: string;
}

const DemoPath = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<DemoModule[]>([]);
  const [packageName, setPackageName] = useState("Pacchetto Formativo Demo");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load completed modules from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCompleted(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  // Fetch demo package and its modules
  useEffect(() => {
    const fetchPackage = async () => {
      const { data: settings } = await supabase
        .from("platform_settings")
        .select("demo_package_id")
        .maybeSingle();

      const packageId = settings?.demo_package_id || DEFAULT_DEMO_PACKAGE_ID;

      const { data: pkg } = await supabase
        .from("training_packages")
        .select("name")
        .eq("id", packageId)
        .maybeSingle();

      if (pkg?.name) setPackageName(pkg.name);

      const { data: pkgModules } = await supabase
        .from("training_package_modules")
        .select("module_id, module_order")
        .eq("package_id", packageId)
        .order("module_order", { ascending: true });

      if (pkgModules) {
        const enriched: DemoModule[] = pkgModules.map((m: any) => {
          const info = getModuleInfo(m.module_id);
          return {
            id: m.module_id,
            order: m.module_order,
            name: info?.name || m.module_id,
            icon: info?.icon || "📘",
          };
        });
        setModules(enriched);
      }
      setLoading(false);
    };
    fetchPackage();
  }, []);

  const resetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCompleted(new Set());
  };

  const startModule = (moduleId: string) => {
    navigate(`/formazione/${moduleId}?demo=1`);
  };

  const completedCount = modules.filter((m) => completed.has(m.id)).length;
  const totalCount = modules.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary">
            <Sparkles className="w-3 h-3 mr-1" /> Modalità DEMO
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            ANTEPRIMA INTERATTIVA
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            {packageName}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Esplora liberamente l'intero percorso formativo che riceveranno i tuoi dipendenti.
            Nessuna registrazione richiesta, tempi minimi disattivati.
          </p>

          {/* Progress card */}
          <Card className="mt-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-game-xp" />
                  <span className="font-bold">
                    {completedCount} / {totalCount} moduli completati
                  </span>
                </div>
                {completedCount > 0 && (
                  <Button size="sm" variant="ghost" onClick={resetProgress} className="text-xs">
                    Resetta progressi
                  </Button>
                )}
              </div>
              <Progress value={progressPercent} className="h-3" />
              {allDone && (
                <div className="mt-4 p-3 rounded-lg bg-game-xp/10 border border-game-xp/30 text-sm font-semibold text-game-xp text-center">
                  🎉 Hai completato tutto il percorso DEMO! Contattaci per attivare la versione reale.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vertical path */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Caricamento percorso...</div>
        ) : (
          <div className="space-y-4 relative">
            {modules.map((mod, index) => {
              const isCompleted = completed.has(mod.id);
              const Icon = MODULE_ICONS[mod.id] || Shield;
              const duration = MODULE_DURATIONS[mod.id] || 10;

              return (
                <div key={mod.id} className="relative group">
                  {/* Connector */}
                  {index > 0 && (
                    <div className="absolute -top-4 left-9 w-0.5 h-4 bg-border" />
                  )}
                  <Card
                    className={`relative overflow-hidden transition-all duration-300 border-2 rounded-2xl ${
                      isCompleted
                        ? "border-accent/60 bg-accent/5"
                        : "border-border hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5"
                    }`}
                  >
                    <div
                      className={`h-1.5 ${
                        isCompleted
                          ? "bg-gradient-to-r from-accent to-game-health"
                          : "bg-gradient-to-r from-primary to-secondary"
                      }`}
                    />
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Node icon */}
                        <div
                          className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                            isCompleted ? "bg-accent/20" : "bg-primary/10 group-hover:bg-primary/15"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-7 h-7 text-accent" />
                          ) : (
                            <Icon className="w-7 h-7 text-primary" />
                          )}
                          <div
                            className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCompleted ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
                            }`}
                          >
                            {isCompleted ? "✓" : index + 1}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base mb-1 flex items-center gap-2">
                            <span>{mod.icon}</span>
                            <span className="truncate">{mod.name}</span>
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              <Clock className="w-3 h-3" />~{duration} min
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-game-xp/10 text-game-xp">
                              <Sparkles className="w-3 h-3" /> Demo libera
                            </span>
                          </div>

                          <Button
                            className="w-full rounded-xl h-10 font-bold"
                            variant={isCompleted ? "outline" : "default"}
                            onClick={() => startModule(mod.id)}
                          >
                            {isCompleted ? (
                              <><Play className="w-4 h-4 mr-2" /> Rivedi modulo</>
                            ) : (
                              <><Play className="w-4 h-4 mr-2" /> Inizia modulo</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Vuoi attivare il percorso completo per la tua azienda?
          </p>
          <Button asChild size="lg" variant="default">
            <Link to="/#contact">Richiedi un preventivo</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default DemoPath;
