import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, Clock, AlertTriangle, ShieldCheck, ArrowRight, Sparkles, Check } from "lucide-react";
import { SECTOR_PACKAGES, PLAN_TIERS, getSector, getTier, type PlanTier, type SectorPackage } from "@/data/sector-packages";
import { QuoteRequestDialog } from "@/components/QuoteRequestDialog";

const fmt = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

function computeROI(sector: SectorPackage, tier: PlanTier, employees: number, hourlyCost: number) {
  const pricePerEmp = Math.round(sector.pricePerEmployee * tier.multiplier);
  const platformCost = pricePerEmp * employees;
  const tradTotal = sector.totalHours * (hourlyCost + sector.tradAvgHourCost) * employees;
  const baselineIncidentRate = sector.riskLevel === "alto" ? 0.08 : sector.riskLevel === "medio" ? 0.04 : 0.015;
  const incidentsAvoided = Math.max(0, Math.round(employees * baselineIncidentRate * 0.6));
  const incidentSavings = incidentsAvoided * 1500;
  const hoursSaved = sector.totalHours * 0.55 * employees;
  const timeSavings = hoursSaved * hourlyCost;
  const totalSavings = tradTotal - platformCost + incidentSavings + timeSavings;
  const roi = platformCost > 0 ? (totalSavings / platformCost) * 100 : 0;
  const paybackMonths = totalSavings > 0 ? Math.max(1, Math.round((platformCost / (totalSavings / 12)) * 10) / 10) : 12;
  return { pricePerEmp, platformCost, tradTotal, incidentsAvoided, incidentSavings, hoursSaved: Math.round(hoursSaved), timeSavings, totalSavings, roi, paybackMonths };
}

export const ROICalculator = () => {
  const [employees, setEmployees] = useState(20);
  const [sectorId, setSectorId] = useState("logistica");
  const [tierId, setTierId] = useState<"starter" | "professional" | "enterprise">("professional");
  const [hourlyCost, setHourlyCost] = useState(28); // costo orario medio dipendente
  const [quoteOpen, setQuoteOpen] = useState(false);

  const calc = useMemo(() => {
    const sector = getSector(sectorId)!;
    const tier = getTier(tierId)!;
    return { sector, tier, ...computeROI(sector, tier, employees, hourlyCost) };
  }, [employees, sectorId, tierId, hourlyCost]);

  const comparison = useMemo(() => {
    const sector = getSector(sectorId)!;
    return PLAN_TIERS.map((t) => ({ tier: t, ...computeROI(sector, t, employees, hourlyCost) }));
  }, [sectorId, employees, hourlyCost]);

  return (
    <section className="py-16 bg-background">
      <div className="container px-4 mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-4">
            <Calculator className="w-4 h-4" />
            Calcolatore ROI
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Quanto puoi <span className="text-primary">risparmiare</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stima il beneficio economico annuo per la tua PMI in base al settore, ai dipendenti e al piano scelto.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Inputs */}
          <Card className="lg:col-span-2 p-6 space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              I tuoi dati
            </h3>

            <div className="space-y-2">
              <Label>Settore di attività</Label>
              <Select value={sectorId} onValueChange={setSectorId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECTOR_PACKAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.icon} {s.name} · rischio {s.riskLevel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{calc.sector.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Numero dipendenti</Label>
                <span className="text-sm font-bold tabular-nums">{employees}</span>
              </div>
              <Slider value={[employees]} min={1} max={250} step={1} onValueChange={(v) => setEmployees(v[0])} />
            </div>

            <div className="space-y-2">
              <Label>Piano</Label>
              <Select value={tierId} onValueChange={(v) => setTierId(v as typeof tierId)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLAN_TIERS.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                {calc.tier.perks.map((p, i) => <li key={i}>• {p}</li>)}
              </ul>
            </div>

            <div className="space-y-2">
              <Label>Costo orario medio dipendente (€)</Label>
              <Input type="number" min={10} max={150} value={hourlyCost} onChange={(e) => setHourlyCost(Number(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground">Include retribuzione + oneri. Default 28 €/h.</p>
            </div>
          </Card>

          {/* Outputs */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Risparmio annuo stimato</p>
                  <p className="text-4xl md:text-5xl font-black text-primary tabular-nums">{fmt(calc.totalSavings)}</p>
                </div>
                <Badge className="bg-accent/15 text-accent border-accent/30">
                  ROI {Math.round(calc.roi)}%
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Costo piattaforma</p>
                  <p className="font-bold tabular-nums">{fmt(calc.platformCost)}</p>
                  <p className="text-[10px] text-muted-foreground">{fmt(calc.pricePerEmp)} / dip / anno</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Costo formazione tradizionale</p>
                  <p className="font-bold tabular-nums line-through opacity-70">{fmt(calc.tradTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payback</p>
                  <p className="font-bold tabular-nums">{calc.paybackMonths} mesi</p>
                </div>
              </div>
            </Card>

            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="p-4">
                <Clock className="w-5 h-5 text-secondary mb-2" />
                <p className="text-2xl font-bold tabular-nums">{calc.hoursSaved}h</p>
                <p className="text-xs text-muted-foreground">Ore lavoro recuperate (~{fmt(calc.timeSavings)})</p>
              </Card>
              <Card className="p-4">
                <ShieldCheck className="w-5 h-5 text-accent mb-2" />
                <p className="text-2xl font-bold tabular-nums">{calc.incidentsAvoided}</p>
                <p className="text-xs text-muted-foreground">Incidenti lievi evitati (~{fmt(calc.incidentSavings)})</p>
              </Card>
              <Card className="p-4">
                <TrendingUp className="w-5 h-5 text-primary mb-2" />
                <p className="text-2xl font-bold tabular-nums">+60%</p>
                <p className="text-xs text-muted-foreground">Retention vs aula tradizionale</p>
              </Card>
            </div>

            <Card className="p-5">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                {calc.sector.icon} Pacchetto consigliato: {calc.sector.name}
                <Badge variant="outline" className="ml-auto">{calc.sector.totalHours}h totali</Badge>
              </h4>
              <ul className="text-sm space-y-1.5 mb-4">
                {calc.sector.modules.map((m, i) => (
                  <li key={i} className="flex justify-between text-muted-foreground">
                    <span>• {m.name}</span>
                    <span className="tabular-nums">{m.hours}h</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground italic mb-4">Ideale per: {calc.sector.recommendedFor}</p>
              <Button variant="hero" className="w-full" onClick={() => setQuoteOpen(true)}>
                Richiedi preventivo personalizzato <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Card>

            <p className="text-[11px] text-muted-foreground flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              Stime indicative basate su benchmark di settore (formazione aula media 45-65 €/h, costo medio infortunio lieve INAIL ~1.500€, riduzione errori 60% da gamification). Il preventivo finale dipende da volumi, durata contrattuale e personalizzazioni.
            </p>
          </div>
        </div>

        <QuoteRequestDialog open={quoteOpen} onOpenChange={setQuoteOpen} />
      </div>
    </section>
  );
};
