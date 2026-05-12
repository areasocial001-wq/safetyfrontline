import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Save, RotateCcw, Loader2, FileText, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  generateCertificatePdf,
  generateTestPdf,
  DEFAULT_CERTIFICATE_SETTINGS,
  DEFAULT_TEST_SETTINGS,
  type CertificateFacsimileSettings,
  type TestFacsimileSettings,
} from "@/lib/facsimile-pdf";

const useDebounced = <T,>(value: T, delay = 400) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

export const FacSimilePreview = () => {
  const [test, setTest] = useState<TestFacsimileSettings>(DEFAULT_TEST_SETTINGS);
  const [cert, setCert] = useState<CertificateFacsimileSettings>(DEFAULT_CERTIFICATE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [testUrl, setTestUrl] = useState<string>("");
  const [certUrl, setCertUrl] = useState<string>("");
  const lastTestBlob = useRef<Blob | null>(null);
  const lastCertBlob = useRef<Blob | null>(null);

  const debTest = useDebounced(test, 350);
  const debCert = useDebounced(cert, 350);

  // Load settings + role
  useEffect(() => {
    (async () => {
      const { data: roleData } = await supabase.rpc("has_role", {
        _user_id: (await supabase.auth.getUser()).data.user?.id,
        _role: "admin" as const,
      });
      setIsAdmin(!!roleData);

      const { data } = await supabase
        .from("facsimile_settings")
        .select("test_settings, certificate_settings")
        .eq("singleton", true)
        .maybeSingle();
      if (data) {
        setTest({ ...DEFAULT_TEST_SETTINGS, ...((data.test_settings as any) || {}) });
        setCert({ ...DEFAULT_CERTIFICATE_SETTINGS, ...((data.certificate_settings as any) || {}) });
      }
      setLoading(false);
    })();
  }, []);

  // Regenerate previews on debounced change
  useEffect(() => {
    let cancelled = false;
    generateTestPdf(debTest).then((blob) => {
      if (cancelled) return;
      lastTestBlob.current = blob;
      const url = URL.createObjectURL(blob);
      setTestUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [debTest]);

  useEffect(() => {
    let cancelled = false;
    generateCertificatePdf(debCert).then((blob) => {
      if (cancelled) return;
      lastCertBlob.current = blob;
      const url = URL.createObjectURL(blob);
      setCertUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [debCert]);

  const downloadBlob = (blob: Blob | null, filename: string) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("facsimile_settings")
      .update({ test_settings: test as any, certificate_settings: cert as any })
      .eq("singleton", true);
    setSaving(false);
    if (error) toast.error("Errore nel salvataggio");
    else toast.success("Impostazioni salvate");
  };

  const resetTest = () => setTest(DEFAULT_TEST_SETTINGS);
  const resetCert = () => setCert(DEFAULT_CERTIFICATE_SETTINGS);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Fac-simile Test e Certificato
            </CardTitle>
            <CardDescription>
              Personalizza titoli, soglie e diciture. Il layout grafico del PDF resta coerente.
            </CardDescription>
          </div>
          {isAdmin && (
            <Button onClick={save} disabled={saving} variant="professional">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salva
            </Button>
          )}
        </CardHeader>
      </Card>

      <Tabs defaultValue="cert" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cert">
            <Award className="w-4 h-4 mr-2" /> Certificato
          </TabsTrigger>
          <TabsTrigger value="test">
            <FileText className="w-4 h-4 mr-2" /> Test Finale
          </TabsTrigger>
        </TabsList>

        {/* Certificate */}
        <TabsContent value="cert">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Contenuti certificato</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetCert} disabled={!isAdmin}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Default
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Titolo" value={cert.title} onChange={(v) => setCert({ ...cert, title: v })} disabled={!isAdmin} />
                <Field label="Sottotitolo" value={cert.subtitle} onChange={(v) => setCert({ ...cert, subtitle: v })} disabled={!isAdmin} />
                <Field label="Riferimento normativo" value={cert.legalReference} onChange={(v) => setCert({ ...cert, legalReference: v })} disabled={!isAdmin} />
                <Field label="Nome modulo (placeholder esempio)" value={cert.moduleName} onChange={(v) => setCert({ ...cert, moduleName: v })} disabled={!isAdmin} />
                <div className="space-y-1">
                  <Label className="text-xs">Frase di completamento <span className="text-muted-foreground">(usa <code>{"{module}"}</code>)</span></Label>
                  <Textarea
                    rows={3}
                    value={cert.completionPhrase}
                    onChange={(e) => setCert({ ...cert, completionPhrase: e.target.value })}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Etichetta ore" value={cert.hoursLabel} onChange={(v) => setCert({ ...cert, hoursLabel: v })} disabled={!isAdmin} />
                  <Field label="Valore ore" value={cert.hoursValue} onChange={(v) => setCert({ ...cert, hoursValue: v })} disabled={!isAdmin} />
                </div>
                <Field label="Nota tracciamento" value={cert.trackedNote} onChange={(v) => setCert({ ...cert, trackedNote: v })} disabled={!isAdmin} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Etichetta esito" value={cert.outcomeLabel} onChange={(v) => setCert({ ...cert, outcomeLabel: v })} disabled={!isAdmin} />
                  <Field label="Valore esito" value={cert.outcomeValue} onChange={(v) => setCert({ ...cert, outcomeValue: v })} disabled={!isAdmin} />
                </div>
                <Field label="Nota punteggio" value={cert.scoreNote} onChange={(v) => setCert({ ...cert, scoreNote: v })} disabled={!isAdmin} />
                <Field label="Riga firma" value={cert.signatureLine} onChange={(v) => setCert({ ...cert, signatureLine: v })} disabled={!isAdmin} />
                <Field label="Footer" value={cert.footerNote} onChange={(v) => setCert({ ...cert, footerNote: v })} disabled={!isAdmin} />
                <Field label="Versione fac-simile" value={cert.version ?? "1.0"} onChange={(v) => setCert({ ...cert, version: v })} disabled={!isAdmin} />
              </CardContent>
            </Card>

            <PreviewPane
              url={certUrl}
              onDownload={() => downloadBlob(lastCertBlob.current, "facsimile-certificato.pdf")}
              badge="Conforme D.Lgs. 81/08"
            />
          </div>
        </TabsContent>

        {/* Test */}
        <TabsContent value="test">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Contenuti test</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetTest} disabled={!isAdmin}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Default
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Titolo" value={test.title} onChange={(v) => setTest({ ...test, title: v })} disabled={!isAdmin} />
                <Field label="Sottotitolo" value={test.subtitle} onChange={(v) => setTest({ ...test, subtitle: v })} disabled={!isAdmin} />
                <Field label="Modulo" value={test.moduleName} onChange={(v) => setTest({ ...test, moduleName: v })} disabled={!isAdmin} />
                <div className="grid grid-cols-3 gap-3">
                  <NumField label="Quesiti" value={test.questionsCount} onChange={(v) => setTest({ ...test, questionsCount: v })} disabled={!isAdmin} />
                  <NumField label="Durata (min)" value={test.durationMinutes} onChange={(v) => setTest({ ...test, durationMinutes: v })} disabled={!isAdmin} />
                  <NumField label="Soglia (%)" value={test.passingScorePercent} onChange={(v) => setTest({ ...test, passingScorePercent: v })} disabled={!isAdmin} max={100} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Istruzioni</Label>
                  <Textarea rows={4} value={test.instructions} onChange={(e) => setTest({ ...test, instructions: e.target.value })} disabled={!isAdmin} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nota footer</Label>
                  <Textarea rows={2} value={test.footerNote} onChange={(e) => setTest({ ...test, footerNote: e.target.value })} disabled={!isAdmin} />
                </div>
              </CardContent>
            </Card>

            <PreviewPane
              url={testUrl}
              onDownload={() => downloadBlob(lastTestBlob.current, "facsimile-test-finale.pdf")}
              badge={`${test.questionsCount} quesiti · ${test.passingScorePercent}%`}
            />
          </div>
        </TabsContent>
      </Tabs>

      {!isAdmin && (
        <Card className="p-4 bg-muted/30 border-dashed">
          <p className="text-xs text-muted-foreground">
            Solo gli amministratori possono modificare e salvare i fac-simile. Puoi comunque scaricare il PDF corrente.
          </p>
        </Card>
      )}
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) => (
  <div className="space-y-1">
    <Label className="text-xs">{label}</Label>
    <Input value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
  </div>
);

const NumField = ({
  label,
  value,
  onChange,
  disabled,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  max?: number;
}) => (
  <div className="space-y-1">
    <Label className="text-xs">{label}</Label>
    <Input
      type="number"
      min={0}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      disabled={disabled}
    />
  </div>
);

const PreviewPane = ({
  url,
  onDownload,
  badge,
}: {
  url: string;
  onDownload: () => void;
  badge: string;
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between">
      <div className="flex items-center gap-2">
        <CardTitle className="text-base">Anteprima live</CardTitle>
        <Badge variant="secondary">{badge}</Badge>
      </div>
      <Button onClick={onDownload} variant="professional" size="sm">
        <Download className="w-4 h-4 mr-2" /> Scarica PDF
      </Button>
    </CardHeader>
    <CardContent className="p-0">
      <div className="bg-muted/20 border-t">
        {url ? (
          <iframe src={`${url}#view=FitH&toolbar=0`} title="anteprima" className="w-full h-[640px] bg-white" />
        ) : (
          <div className="h-[640px] flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);
