import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Loader2, FileArchive } from "lucide-react";
import { generateCertificatePDFBlob } from "@/lib/certificate-generator";
import JSZip from "jszip";
import { Progress } from "@/components/ui/progress";

interface BatchCertificateExportProps {
  companyId: string;
}

export const BatchCertificateExport = ({ companyId }: BatchCertificateExportProps) => {
  const [scenario, setScenario] = useState<string>("all");
  const [minScore, setMinScore] = useState<string>("70");
  const [minDate, setMinDate] = useState<string>("");
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

  const moduleNames: Record<string, string> = {
    general: 'Safety Run',
    office: 'Office Hazard Quest',
    warehouse: 'Magazzino 2.5D',
  };

  const handleBatchExport = async () => {
    setExporting(true);
    setProgress(0);
    setCurrentStep("Recupero dipendenti...");

    try {
      // Get company employees
      const { data: companyUsers, error: companyUsersError } = await supabase
        .from('company_users')
        .select('user_id, profiles!inner(full_name, company_name)')
        .eq('company_id', companyId);

      if (companyUsersError) throw companyUsersError;

      if (!companyUsers || companyUsers.length === 0) {
        toast.error("Nessun dipendente trovato");
        setExporting(false);
        return;
      }

      const employeeIds = companyUsers.map(cu => cu.user_id);
      setProgress(10);
      setCurrentStep(`Trovati ${employeeIds.length} dipendenti. Recupero sessioni...`);

      // Get demo sessions with filters
      let query = supabase
        .from('demo_sessions')
        .select('user_id, scenario, score, max_score, created_at')
        .in('user_id', employeeIds)
        .eq('completed', true);

      if (scenario !== 'all') {
        query = query.eq('scenario', scenario as 'general' | 'office' | 'warehouse');
      }

      if (minDate) {
        query = query.gte('created_at', minDate);
      }

      const { data: sessions, error: sessionsError } = await query;

      if (sessionsError) throw sessionsError;

      if (!sessions || sessions.length === 0) {
        toast.error("Nessuna sessione trovata con i filtri selezionati");
        setExporting(false);
        return;
      }

      setProgress(20);
      setCurrentStep("Elaborazione certificati...");

      // Get company settings for certificate customization
      const { data: companyData } = await supabase
        .from('companies')
        .select(`
          logo_url,
          certificate_template,
          certificate_theme_color,
          certificate_font,
          certificate_text_layout,
          certificate_logo_position,
          certificate_module_prefix,
          certificate_orientation
        `)
        .eq('id', companyId)
        .single();

      const certificateSettings = companyData ? {
        template: (companyData as any).certificate_template || 'formale',
        themeColor: (companyData as any).certificate_theme_color || '#3B82F6',
        font: (companyData as any).certificate_font || 'helvetica',
        textLayout: (companyData as any).certificate_text_layout || 'centered',
        logoPosition: (companyData as any).certificate_logo_position || 'top-left',
        modulePrefix: (companyData as any).certificate_module_prefix ?? 'Verifica della Ricaduta sulla',
        orientation: ((companyData as any).certificate_orientation || 'portrait') as 'portrait' | 'landscape',
        logoUrl: (companyData as any).logo_url,
      } : undefined;

      // Group sessions by user and scenario
      const userCertificates = new Map<string, Map<string, any>>();

      sessions.forEach(session => {
        const scorePercentage = (session.score / session.max_score) * 100;
        
        if (scorePercentage < parseInt(minScore)) return;

        if (!userCertificates.has(session.user_id)) {
          userCertificates.set(session.user_id, new Map());
        }

        const userScenarios = userCertificates.get(session.user_id)!;
        const existing = userScenarios.get(session.scenario);

        if (!existing || scorePercentage > existing.bestScore) {
          const userData = companyUsers.find(cu => cu.user_id === session.user_id);
          userScenarios.set(session.scenario, {
            scenario: session.scenario,
            bestScore: Math.round(scorePercentage),
            completions: existing ? existing.completions + 1 : 1,
            lastCompleted: session.created_at,
            userName: (userData?.profiles as any)?.full_name || 'Utente',
            companyName: (userData?.profiles as any)?.company_name || '',
          });
        } else if (existing) {
          existing.completions += 1;
        }
      });

      // Calculate total certificates to generate
      let totalCertificates = 0;
      userCertificates.forEach(scenarios => {
        totalCertificates += scenarios.size;
      });

      if (totalCertificates === 0) {
        toast.error("Nessun certificato qualificato trovato");
        setExporting(false);
        return;
      }

      setProgress(30);
      setCurrentStep(`Generazione di ${totalCertificates} certificati...`);

      // Generate certificates
      const zip = new JSZip();
      let generatedCount = 0;

      for (const [userId, scenarios] of userCertificates) {
        for (const [scenarioKey, certData] of scenarios) {
          try {
            const pdfBlob = await generateCertificatePDFBlob({
              userName: certData.userName,
              companyName: certData.companyName,
              moduleName: moduleNames[scenarioKey] || scenarioKey,
              scenario: scenarioKey,
              score: certData.bestScore,
              completions: certData.completions,
              date: new Date(certData.lastCompleted).toLocaleDateString('it-IT', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }),
              companyLogoUrl: certificateSettings?.logoUrl,
              template: certificateSettings?.template,
              themeColor: certificateSettings?.themeColor,
              font: certificateSettings?.font,
              textLayout: certificateSettings?.textLayout,
              logoPosition: certificateSettings?.logoPosition,
              modulePrefix: certificateSettings?.modulePrefix,
              orientation: certificateSettings?.orientation,
            });

            // Sanitize filename
            const sanitizedName = certData.userName.replace(/[^a-z0-9]/gi, '_');
            const fileName = `${sanitizedName}_${moduleNames[scenarioKey]?.replace(/\s+/g, '_')}.pdf`;
            
            zip.file(fileName, pdfBlob);
            
            generatedCount++;
            const progressPercent = 30 + (generatedCount / totalCertificates) * 60;
            setProgress(progressPercent);
            setCurrentStep(`Generati ${generatedCount}/${totalCertificates} certificati...`);
          } catch (error) {
            console.error(`Error generating certificate for ${certData.userName}:`, error);
          }
        }
      }

      setProgress(95);
      setCurrentStep("Creazione file ZIP...");

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      setProgress(100);
      setCurrentStep("Download in corso...");

      // Download ZIP
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `Certificati_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast.success(`${generatedCount} certificati esportati con successo!`);
    } catch (error) {
      console.error('Error exporting certificates:', error);
      toast.error("Errore durante l'esportazione dei certificati");
    } finally {
      setExporting(false);
      setProgress(0);
      setCurrentStep("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileArchive className="w-5 h-5" />
          Esportazione Batch Certificati
        </CardTitle>
        <CardDescription>
          Esporta certificati multipli per i dipendenti in un file ZIP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="scenario-filter">Modulo</Label>
            <Select value={scenario} onValueChange={setScenario}>
              <SelectTrigger id="scenario-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i moduli</SelectItem>
                <SelectItem value="general">Safety Run</SelectItem>
                <SelectItem value="office">Office Hazard Quest</SelectItem>
                <SelectItem value="warehouse">Magazzino 2.5D</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min-score">Punteggio Minimo (%)</Label>
            <Input
              id="min-score"
              type="number"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              placeholder="70"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min-date">Data Minima Completamento</Label>
            <Input
              id="min-date"
              type="date"
              value={minDate}
              onChange={(e) => setMinDate(e.target.value)}
            />
          </div>
        </div>

        {exporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{currentStep}</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Button
          onClick={handleBatchExport}
          disabled={exporting}
          className="w-full"
          size="lg"
        >
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Esportazione in corso...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Esporta Certificati
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          Verranno esportati solo i certificati di dipendenti che hanno raggiunto il punteggio minimo richiesto
        </p>
      </CardContent>
    </Card>
  );
};
