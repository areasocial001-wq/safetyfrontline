import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, Plus, Trash2, Building2, Users, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import { ALL_TRAINING_MODULES, getModuleInfo } from "@/data/all-training-modules";

interface TrainingPackage {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface PackageModule {
  id: string;
  package_id: string;
  module_id: string;
  module_order: number;
  grace_period_days: number;
  deadline_offset_days: number | null;
}

interface CompanyAssignment {
  id: string;
  company_id: string;
  package_id: string;
  deadline_date: string | null;
  assigned_at: string;
  companies?: { name: string };
}

interface Company {
  id: string;
  name: string;
}

export const TrainingPackagesManager = () => {
  const [packages, setPackages] = useState<TrainingPackage[]>([]);
  const [packageModules, setPackageModules] = useState<Record<string, PackageModule[]>>({});
  const [assignments, setAssignments] = useState<Record<string, CompanyAssignment[]>>({});
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // New package dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSelectedModules, setNewSelectedModules] = useState<Set<string>>(new Set());

  // Edit package
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  // Assign dialog
  const [assignDialogPackageId, setAssignDialogPackageId] = useState<string | null>(null);
  const [assignCompanyId, setAssignCompanyId] = useState<string>("");
  const [assignDeadline, setAssignDeadline] = useState<string>("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pkgRes, modRes, assignRes, compRes] = await Promise.all([
        supabase.from("training_packages").select("*").order("created_at", { ascending: false }),
        supabase.from("training_package_modules").select("*").order("module_order"),
        supabase
          .from("company_training_packages")
          .select("*")
          .order("assigned_at", { ascending: false }),
        supabase.from("companies").select("id, name").order("name"),
      ]);

      if (pkgRes.error) throw pkgRes.error;
      if (modRes.error) throw modRes.error;
      if (assignRes.error) throw assignRes.error;
      if (compRes.error) throw compRes.error;

      setPackages(pkgRes.data || []);
      setCompanies(compRes.data || []);

      const companyMap = new Map((compRes.data || []).map((c: Company) => [c.id, c.name]));

      const modsByPkg: Record<string, PackageModule[]> = {};
      (modRes.data || []).forEach((m: PackageModule) => {
        if (!modsByPkg[m.package_id]) modsByPkg[m.package_id] = [];
        modsByPkg[m.package_id].push(m);
      });
      setPackageModules(modsByPkg);

      const assignByPkg: Record<string, CompanyAssignment[]> = {};
      (assignRes.data || []).forEach((a: any) => {
        const enriched = { ...a, companies: { name: companyMap.get(a.company_id) || "—" } };
        if (!assignByPkg[a.package_id]) assignByPkg[a.package_id] = [];
        assignByPkg[a.package_id].push(enriched);
      });
      setAssignments(assignByPkg);
    } catch (e) {
      console.error(e);
      toast.error("Errore nel caricamento dei pacchetti");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async () => {
    if (!newName.trim()) {
      toast.error("Inserisci un nome per il pacchetto");
      return;
    }
    if (newSelectedModules.size === 0) {
      toast.error("Seleziona almeno un modulo");
      return;
    }

    try {
      const { data: pkg, error: pkgErr } = await supabase
        .from("training_packages")
        .insert({ name: newName.trim(), description: newDescription.trim() || null })
        .select()
        .single();
      if (pkgErr) throw pkgErr;

      const modulesToInsert = Array.from(newSelectedModules).map((moduleId, idx) => ({
        package_id: pkg.id,
        module_id: moduleId,
        module_order: idx,
        grace_period_days: 30,
      }));

      const { error: modErr } = await supabase
        .from("training_package_modules")
        .insert(modulesToInsert);
      if (modErr) throw modErr;

      toast.success("✅ Pacchetto creato con successo");
      setCreateOpen(false);
      setNewName("");
      setNewDescription("");
      setNewSelectedModules(new Set());
      fetchAll();
    } catch (e: any) {
      console.error(e);
      toast.error("❌ Errore nella creazione: " + e.message);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Eliminare definitivamente questo pacchetto e tutte le sue assegnazioni?")) return;
    try {
      const { error } = await supabase.from("training_packages").delete().eq("id", id);
      if (error) throw error;
      toast.success("Pacchetto eliminato");
      fetchAll();
    } catch (e: any) {
      toast.error("Errore: " + e.message);
    }
  };

  const handleToggleModuleInPackage = async (packageId: string, moduleId: string, present: boolean) => {
    try {
      if (present) {
        const { error } = await supabase
          .from("training_package_modules")
          .delete()
          .eq("package_id", packageId)
          .eq("module_id", moduleId);
        if (error) throw error;
      } else {
        const currentCount = packageModules[packageId]?.length || 0;
        const { error } = await supabase.from("training_package_modules").insert({
          package_id: packageId,
          module_id: moduleId,
          module_order: currentCount,
          grace_period_days: 30,
        });
        if (error) throw error;
      }
      fetchAll();
    } catch (e: any) {
      toast.error("Errore: " + e.message);
    }
  };

  const handleAssignToCompany = async () => {
    if (!assignDialogPackageId || !assignCompanyId) return;

    try {
      // Insert assignment record
      const { error: assignErr } = await supabase.from("company_training_packages").insert({
        company_id: assignCompanyId,
        package_id: assignDialogPackageId,
        deadline_date: assignDeadline ? new Date(assignDeadline).toISOString() : null,
      });
      if (assignErr) throw assignErr;

      // Expand modules into company_mandatory_modules
      const modules = packageModules[assignDialogPackageId] || [];
      const rows = modules.map((m) => ({
        company_id: assignCompanyId,
        module_id: m.module_id,
        is_mandatory: true,
        grace_period_days: m.grace_period_days,
        deadline_date: assignDeadline ? new Date(assignDeadline).toISOString() : null,
      }));

      if (rows.length > 0) {
        // Insert one-by-one, ignore duplicate-key errors so re-assigning is idempotent
        for (const row of rows) {
          const { error } = await supabase.from("company_mandatory_modules").insert(row);
          if (error && error.code !== "23505") {
            console.warn("Module insert warning:", error);
          }
        }
      }

      toast.success("✅ Pacchetto assegnato all'azienda");
      setAssignDialogPackageId(null);
      setAssignCompanyId("");
      setAssignDeadline("");
      fetchAll();
    } catch (e: any) {
      console.error(e);
      toast.error("❌ Errore nell'assegnazione: " + e.message);
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    if (!confirm("Rimuovere l'assegnazione del pacchetto a questa azienda?")) return;
    try {
      const { error } = await supabase
        .from("company_training_packages")
        .delete()
        .eq("id", assignmentId);
      if (error) throw error;
      toast.success("Assegnazione rimossa");
      fetchAll();
    } catch (e: any) {
      toast.error("Errore: " + e.message);
    }
  };

  const groupedModules = ALL_TRAINING_MODULES.reduce<Record<string, typeof ALL_TRAINING_MODULES>>(
    (acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Pacchetti Formativi Personalizzati</h2>
              <p className="text-sm text-muted-foreground">
                Crea pacchetti riutilizzabili contenenti più moduli e assegnali alle aziende
              </p>
            </div>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="professional">
                <Plus className="w-4 h-4 mr-2" />
                Nuovo Pacchetto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh]">
              <DialogHeader>
                <DialogTitle>Crea Nuovo Pacchetto Formativo</DialogTitle>
                <DialogDescription>
                  Definisci un template riutilizzabile con più moduli da assegnare poi alle aziende
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pkg-name">Nome Pacchetto *</Label>
                  <Input
                    id="pkg-name"
                    placeholder="es. Onboarding Ufficio Completo"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pkg-desc">Descrizione</Label>
                  <Textarea
                    id="pkg-desc"
                    placeholder="A chi è destinato e cosa include..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Moduli inclusi ({newSelectedModules.size} selezionati)
                  </Label>
                  <ScrollArea className="h-[320px] border rounded-md p-3">
                    {Object.entries(groupedModules).map(([category, mods]) => (
                      <div key={category} className="mb-4">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                          {category}
                        </h4>
                        <div className="space-y-1">
                          {mods.map((mod) => (
                            <label
                              key={mod.id}
                              className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer"
                            >
                              <Checkbox
                                checked={newSelectedModules.has(mod.id)}
                                onCheckedChange={(checked) => {
                                  const next = new Set(newSelectedModules);
                                  if (checked) next.add(mod.id);
                                  else next.delete(mod.id);
                                  setNewSelectedModules(next);
                                }}
                              />
                              <span className="text-lg">{mod.icon}</span>
                              <span className="text-sm">{mod.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Annulla
                </Button>
                <Button variant="professional" onClick={handleCreatePackage}>
                  <Save className="w-4 h-4 mr-2" />
                  Crea Pacchetto
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Caricamento...</p>
        ) : packages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nessun pacchetto creato</p>
            <p className="text-sm mt-1">Crea il primo pacchetto formativo riutilizzabile</p>
          </div>
        ) : (
          <div className="space-y-4">
            {packages.map((pkg) => {
              const mods = packageModules[pkg.id] || [];
              const assigns = assignments[pkg.id] || [];
              const isEditing = editingPackageId === pkg.id;

              return (
                <Card key={pkg.id} className="p-5 border-2">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold">{pkg.name}</h3>
                        <Badge variant="secondary">{mods.length} moduli</Badge>
                        <Badge variant="outline">
                          <Building2 className="w-3 h-3 mr-1" />
                          {assigns.length} aziende
                        </Badge>
                      </div>
                      {pkg.description && (
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPackageId(isEditing ? null : pkg.id)}
                      >
                        {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAssignDialogPackageId(pkg.id)}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Assegna
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  {isEditing ? (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Modifica moduli inclusi:</h4>
                      <ScrollArea className="h-[260px] border rounded-md p-3">
                        {Object.entries(groupedModules).map(([category, catMods]) => (
                          <div key={category} className="mb-3">
                            <h5 className="font-semibold text-xs text-muted-foreground mb-1">
                              {category}
                            </h5>
                            {catMods.map((mod) => {
                              const present = mods.some((m) => m.module_id === mod.id);
                              return (
                                <label
                                  key={mod.id}
                                  className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm"
                                >
                                  <Checkbox
                                    checked={present}
                                    onCheckedChange={() =>
                                      handleToggleModuleInPackage(pkg.id, mod.id, present)
                                    }
                                  />
                                  <span>{mod.icon}</span>
                                  <span>{mod.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {mods.map((m) => {
                          const info = getModuleInfo(m.module_id);
                          return (
                            <Badge key={m.id} variant="outline" className="text-xs">
                              {info?.icon} {info?.name || m.module_id}
                            </Badge>
                          );
                        })}
                      </div>

                      {assigns.length > 0 && (
                        <div className="bg-muted/30 rounded-md p-3 space-y-1">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                            Aziende assegnate
                          </h4>
                          {assigns.map((a) => (
                            <div
                              key={a.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <Building2 className="w-3 h-3" />
                                <span className="font-medium">
                                  {a.companies?.name || "—"}
                                </span>
                                {a.deadline_date && (
                                  <Badge variant="secondary" className="text-xs">
                                    Scadenza:{" "}
                                    {new Date(a.deadline_date).toLocaleDateString("it-IT")}
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-destructive"
                                onClick={() => handleUnassign(a.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Assign Dialog */}
      <Dialog
        open={!!assignDialogPackageId}
        onOpenChange={(o) => !o && setAssignDialogPackageId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assegna Pacchetto ad un'Azienda</DialogTitle>
            <DialogDescription>
              I moduli del pacchetto verranno aggiunti come obbligatori per l'azienda selezionata
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Azienda</Label>
              <Select value={assignCompanyId} onValueChange={setAssignCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona azienda" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Scadenza (opzionale)</Label>
              <Input
                type="date"
                value={assignDeadline}
                onChange={(e) => setAssignDeadline(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogPackageId(null)}>
              Annulla
            </Button>
            <Button variant="professional" onClick={handleAssignToCompany}>
              Assegna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
