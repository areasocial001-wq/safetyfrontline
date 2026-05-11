import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ArrowLeft, Settings, Calendar, Building2, Plus, Trash2, Save, Package, FileText } from "lucide-react";
import { TrainingPackagesManager } from "@/components/admin/TrainingPackagesManager";
import { FacSimilePreview } from "@/components/admin/FacSimilePreview";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplianceReport } from "@/components/company/ComplianceReport";
import { SectionTimeConfig } from "@/components/admin/SectionTimeConfig";

const ALL_MODULES = [
  { id: "office", name: "Office Hazard Quest - Sicurezza in Ufficio", icon: "🏢" },
  { id: "warehouse", name: "Magazzino 2.5D - Movimentazione Merci", icon: "📦" },
  { id: "general", name: "Safety Run - Rischi Generali", icon: "⚠️" },
];

interface ReminderConfig {
  id: string;
  frequency: string;
  enabled: boolean;
  last_run_at: string | null;
}

interface Company {
  id: string;
  name: string;
}

interface MandatoryModule {
  id: string;
  company_id: string;
  module_id: string;
  is_mandatory: boolean;
  deadline_date: string | null;
  grace_period_days: number;
}

const TrainingConfig = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const [reminderConfig, setReminderConfig] = useState<ReminderConfig | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [companyModules, setCompanyModules] = useState<MandatoryModule[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    if (!isAdmin) {
      toast.error("Accesso negato. Solo gli amministratori possono accedere a questa pagina.");
      navigate("/");
      return;
    }
  }, [isAdmin, authLoading, roleLoading, user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchReminderConfig();
      fetchCompanies();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchCompanyModules(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const fetchReminderConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("training_reminder_config")
        .select("*")
        .single();

      if (error) throw error;
      setReminderConfig(data);
    } catch (error) {
      console.error("Error fetching reminder config:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCompanies(data || []);
      if (data && data.length > 0) {
        setSelectedCompanyId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchCompanyModules = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from("company_mandatory_modules")
        .select("*")
        .eq("company_id", companyId);

      if (error) throw error;
      setCompanyModules(data || []);
    } catch (error) {
      console.error("Error fetching company modules:", error);
    }
  };

  const handleSaveReminderConfig = async () => {
    if (!reminderConfig) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("training_reminder_config")
        .update({
          frequency: reminderConfig.frequency,
          enabled: reminderConfig.enabled,
        })
        .eq("id", reminderConfig.id);

      if (error) throw error;
      toast.success("✅ Configurazione promemoria salvata con successo!");
    } catch (error) {
      console.error("Error saving reminder config:", error);
      toast.error("❌ Errore nel salvataggio della configurazione.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddModule = async (moduleId: string) => {
    if (!selectedCompanyId) return;

    try {
      const { error } = await supabase
        .from("company_mandatory_modules")
        .insert({
          company_id: selectedCompanyId,
          module_id: moduleId,
          is_mandatory: true,
          grace_period_days: 30,
        });

      if (error) throw error;
      await fetchCompanyModules(selectedCompanyId);
      toast.success("✅ Modulo aggiunto con successo!");
    } catch (error: any) {
      console.error("Error adding module:", error);
      if (error.code === "23505") {
        toast.error("❌ Questo modulo è già configurato per questa azienda.");
      } else {
        toast.error("❌ Errore nell'aggiunta del modulo.");
      }
    }
  };

  const handleUpdateModule = async (
    moduleId: string,
    field: string,
    value: any
  ) => {
    if (!selectedCompanyId) return;

    try {
      const { error } = await supabase
        .from("company_mandatory_modules")
        .update({ [field]: value })
        .eq("company_id", selectedCompanyId)
        .eq("id", moduleId);

      if (error) throw error;
      await fetchCompanyModules(selectedCompanyId);
      toast.success("✅ Modulo aggiornato!");
    } catch (error) {
      console.error("Error updating module:", error);
      toast.error("❌ Errore nell'aggiornamento del modulo.");
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!selectedCompanyId) return;

    try {
      const { error } = await supabase
        .from("company_mandatory_modules")
        .delete()
        .eq("id", moduleId);

      if (error) throw error;
      await fetchCompanyModules(selectedCompanyId);
      toast.success("✅ Modulo rimosso!");
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error("❌ Errore nella rimozione del modulo.");
    }
  };

  if (authLoading || roleLoading || !isAdmin) {
    return null;
  }

  const availableModules = ALL_MODULES.filter(
    (module) => !companyModules.some((cm) => cm.module_id === module.id)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-primary" />
              <div>
                <h1 className="font-bold text-xl">Configurazione Training</h1>
                <p className="text-xs text-muted-foreground">
                  Gestione promemoria e moduli obbligatori
                </p>
              </div>
            </div>
            <Link to="/admin">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4" />
                Dashboard Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="config">
              <Settings className="w-4 h-4 mr-2" />
              Configurazione
            </TabsTrigger>
            <TabsTrigger value="packages">
              <Package className="w-4 h-4 mr-2" />
              Pacchetti
            </TabsTrigger>
            <TabsTrigger value="facsimile">
              <FileText className="w-4 h-4 mr-2" />
              Fac-simile
            </TabsTrigger>
            <TabsTrigger value="times">
              <Calendar className="w-4 h-4 mr-2" />
              Tempi Sezioni
            </TabsTrigger>
            <TabsTrigger value="reports">
              <Building2 className="w-4 h-4 mr-2" />
              Report Compliance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="packages">
            <TrainingPackagesManager />
          </TabsContent>

          <TabsContent value="facsimile">
            <FacSimilePreview />
          </TabsContent>

          <TabsContent value="config" className="space-y-8">
          {/* Global Reminder Configuration */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-2xl font-bold">Configurazione Promemoria Globale</h2>
                <p className="text-sm text-muted-foreground">
                  Imposta la frequenza dei promemoria automatici per tutti i dipendenti
                </p>
              </div>
            </div>

            {reminderConfig && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequenza Invio Promemoria</Label>
                    <Select
                      value={reminderConfig.frequency}
                      onValueChange={(value) =>
                        setReminderConfig({ ...reminderConfig, frequency: value })
                      }
                    >
                      <SelectTrigger id="frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Giornaliero</SelectItem>
                        <SelectItem value="weekly">Settimanale (Lunedì)</SelectItem>
                        <SelectItem value="biweekly">Bisettimanale</SelectItem>
                        <SelectItem value="monthly">Mensile (1° del mese)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enabled">Stato Promemoria</Label>
                    <div className="flex items-center gap-3 h-10">
                      <Switch
                        id="enabled"
                        checked={reminderConfig.enabled}
                        onCheckedChange={(checked) =>
                          setReminderConfig({ ...reminderConfig, enabled: checked })
                        }
                      />
                      <span className="text-sm">
                        {reminderConfig.enabled ? (
                          <Badge variant="default">Attivo</Badge>
                        ) : (
                          <Badge variant="secondary">Disattivato</Badge>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {reminderConfig.last_run_at && (
                  <p className="text-sm text-muted-foreground">
                    Ultimo invio:{" "}
                    {new Date(reminderConfig.last_run_at).toLocaleString("it-IT")}
                  </p>
                )}

                <Button
                  onClick={handleSaveReminderConfig}
                  disabled={isSaving}
                  variant="professional"
                  size="lg"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? "Salvataggio..." : "Salva Configurazione"}
                </Button>
              </div>
            )}
          </Card>

          <Separator />

          {/* Company-Specific Module Configuration */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-secondary" />
              <div>
                <h2 className="text-2xl font-bold">Moduli Obbligatori per Azienda</h2>
                <p className="text-sm text-muted-foreground">
                  Configura quali moduli sono obbligatori per ciascuna azienda e imposta le scadenze
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Company Selector */}
              <div className="space-y-2">
                <Label htmlFor="company">Seleziona Azienda</Label>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Seleziona un'azienda" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCompanyId && (
                <>
                  {/* Add Module Section */}
                  {availableModules.length > 0 && (
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <h3 className="font-semibold mb-3">Aggiungi Modulo Obbligatorio</h3>
                      <div className="flex flex-wrap gap-2">
                        {availableModules.map((module) => (
                          <Button
                            key={module.id}
                            onClick={() => handleAddModule(module.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="w-4 h-4" />
                            {module.icon} {module.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Configured Modules */}
                  {companyModules.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Moduli Configurati</h3>
                      {companyModules.map((companyModule) => {
                        const module = ALL_MODULES.find(
                          (m) => m.id === companyModule.module_id
                        );
                        if (!module) return null;

                        return (
                          <Card key={companyModule.id} className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{module.icon}</span>
                                  <div>
                                    <h4 className="font-semibold">{module.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      ID Modulo: {module.id}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handleDeleteModule(companyModule.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label>Obbligatorio</Label>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={companyModule.is_mandatory}
                                      onCheckedChange={(checked) =>
                                        handleUpdateModule(
                                          companyModule.id,
                                          "is_mandatory",
                                          checked
                                        )
                                      }
                                    />
                                    <span className="text-sm">
                                      {companyModule.is_mandatory ? "Sì" : "No"}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`deadline-${companyModule.id}`}>
                                    Scadenza
                                  </Label>
                                  <Input
                                    id={`deadline-${companyModule.id}`}
                                    type="date"
                                    value={
                                      companyModule.deadline_date
                                        ? new Date(companyModule.deadline_date)
                                            .toISOString()
                                            .split("T")[0]
                                        : ""
                                    }
                                    onChange={(e) =>
                                      handleUpdateModule(
                                        companyModule.id,
                                        "deadline_date",
                                        e.target.value
                                          ? new Date(e.target.value).toISOString()
                                          : null
                                      )
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`grace-${companyModule.id}`}>
                                    Periodo di Grazia (giorni)
                                  </Label>
                                  <Input
                                    id={`grace-${companyModule.id}`}
                                    type="number"
                                    min="0"
                                    value={companyModule.grace_period_days}
                                    onChange={(e) =>
                                      handleUpdateModule(
                                        companyModule.id,
                                        "grace_period_days",
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nessun modulo obbligatorio configurato per questa azienda</p>
                      <p className="text-sm mt-2">
                        Aggiungi moduli obbligatori usando i pulsanti sopra
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Report di Compliance Aziendale</h2>
                <p className="text-sm text-muted-foreground">
                  Seleziona un'azienda per visualizzare il report dettagliato di compliance
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-company">Seleziona Azienda per Report</Label>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger id="report-company">
                    <SelectValue placeholder="Seleziona un'azienda" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {selectedCompanyId && <ComplianceReport companyId={selectedCompanyId} />}
        </TabsContent>

          <TabsContent value="times">
            <SectionTimeConfig />
          </TabsContent>
      </Tabs>
    </main>
    </div>
  );
};

export default TrainingConfig;
