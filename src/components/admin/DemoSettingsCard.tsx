import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sparkles, Save, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface PlatformSettings {
  bypass_min_times: boolean;
  demo_package_id: string | null;
}

interface PackageOption {
  id: string;
  name: string;
}

export const DemoSettingsCard = () => {
  const [settings, setSettings] = useState<PlatformSettings>({
    bypass_min_times: true,
    demo_package_id: null,
  });
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: s }, { data: pkgs }] = await Promise.all([
        supabase.from("platform_settings").select("bypass_min_times, demo_package_id").maybeSingle(),
        supabase.from("training_packages").select("id, name").order("name"),
      ]);
      if (s) setSettings({ bypass_min_times: s.bypass_min_times, demo_package_id: s.demo_package_id });
      if (pkgs) setPackages(pkgs);
      setLoading(false);
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("platform_settings")
      .update({
        bypass_min_times: settings.bypass_min_times,
        demo_package_id: settings.demo_package_id,
        updated_at: new Date().toISOString(),
      })
      .eq("singleton", true);
    setSaving(false);
    if (error) {
      toast.error("Errore nel salvataggio");
      console.error(error);
    } else {
      toast.success("✅ Impostazioni demo salvate");
    }
  };

  if (loading) return null;

  return (
    <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-primary" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Modalità DEMO & Tempi minimi</h2>
          <p className="text-sm text-muted-foreground">
            Configura il pacchetto mostrato nella demo pubblica e il bypass dei tempi di attesa
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/demo-percorso" target="_blank">
            <ExternalLink className="w-4 h-4 mr-2" />
            Apri Demo
          </Link>
        </Button>
      </div>

      <div className="space-y-5">
        {/* Demo package selector */}
        <div className="space-y-2">
          <Label htmlFor="demo-package" className="font-semibold">
            Pacchetto Formativo per la DEMO
          </Label>
          <Select
            value={settings.demo_package_id || ""}
            onValueChange={(v) => setSettings((s) => ({ ...s, demo_package_id: v }))}
          >
            <SelectTrigger id="demo-package">
              <SelectValue placeholder="Seleziona un pacchetto..." />
            </SelectTrigger>
            <SelectContent>
              {packages.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Il pacchetto selezionato verrà mostrato nella sezione DEMO della Home Page (accessibile senza login).
          </p>
        </div>

        {/* Bypass min times toggle */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-card border">
          <div className="flex-1">
            <Label htmlFor="bypass-times" className="font-semibold cursor-pointer">
              Disattiva tempi minimi di permanenza
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Quando attivo, i tempi minimi configurati per le sezioni vengono ignorati per tutti gli utenti.
              Utile per presentazioni dal vivo e demo. Disattivalo in produzione per garantire il rispetto della normativa.
            </p>
          </div>
          <Switch
            id="bypass-times"
            checked={settings.bypass_min_times}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, bypass_min_times: v }))}
          />
        </div>

        <Button onClick={save} disabled={saving} variant="default" className="w-full md:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvataggio..." : "Salva impostazioni"}
        </Button>
      </div>
    </Card>
  );
};
