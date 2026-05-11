import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, FileText, Sparkles, Minimize2, Palette, QrCode } from "lucide-react";

interface CertificateEditorProps {
  companyId: string;
  currentSettings: {
    certificate_template: string;
    certificate_theme_color: string;
    certificate_font: string;
    certificate_text_layout: string;
    certificate_logo_position: string;
    certificate_module_prefix: string;
    certificate_orientation: string;
    logo_url?: string | null;
  };
  onUpdate: () => void;
}

const TEMPLATE_DEFAULTS: Record<string, string> = {
  formale: '#1E3A8A',
  moderno: '#7C3AED',
  minimalista: '#0F172A',
  personalizzato: '#3B82F6',
};

export const CertificateEditor = ({ companyId, currentSettings, onUpdate }: CertificateEditorProps) => {
  const [template, setTemplate] = useState(currentSettings.certificate_template || 'formale');
  const [themeColor, setThemeColor] = useState(currentSettings.certificate_theme_color || '#3B82F6');
  const [font, setFont] = useState(currentSettings.certificate_font || 'helvetica');
  const [textLayout, setTextLayout] = useState(currentSettings.certificate_text_layout || 'centered');
  const [logoPosition, setLogoPosition] = useState(currentSettings.certificate_logo_position || 'top-left');
  const [modulePrefix, setModulePrefix] = useState(currentSettings.certificate_module_prefix ?? 'Verifica della Ricaduta sulla');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    (currentSettings.certificate_orientation as 'portrait' | 'landscape') || 'portrait'
  );
  const [saving, setSaving] = useState(false);

  const isCustomTemplate = template === 'personalizzato';

  useEffect(() => {
    setTemplate(currentSettings.certificate_template || 'formale');
    setThemeColor(currentSettings.certificate_theme_color || '#3B82F6');
    setFont(currentSettings.certificate_font || 'helvetica');
    setTextLayout(currentSettings.certificate_text_layout || 'centered');
    setLogoPosition(currentSettings.certificate_logo_position || 'top-left');
    setModulePrefix(currentSettings.certificate_module_prefix ?? 'Verifica della Ricaduta sulla');
    setOrientation((currentSettings.certificate_orientation as 'portrait' | 'landscape') || 'portrait');
  }, [currentSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          certificate_template: template,
          certificate_theme_color: themeColor,
          certificate_font: font,
          certificate_text_layout: textLayout,
          certificate_logo_position: logoPosition,
          certificate_module_prefix: modulePrefix,
          certificate_orientation: orientation,
        } as any)
        .eq('id', companyId);

      if (error) throw error;

      toast.success("Impostazioni certificato salvate con successo");
      onUpdate();
    } catch (error) {
      console.error('Error saving certificate settings:', error);
      toast.error("Errore nel salvataggio delle impostazioni");
    } finally {
      setSaving(false);
    }
  };

  const getFontFamily = () => {
    switch (font) {
      case 'helvetica': return 'Arial, sans-serif';
      case 'times': return 'Georgia, "Times New Roman", serif';
      case 'courier': return '"Courier New", monospace';
      default: return 'Arial, sans-serif';
    }
  };

  // ---- Live preview renderer (CSS-based mock that mirrors PDF templates) ----
  const aspectClass = orientation === 'portrait' ? 'aspect-[1/1.414]' : 'aspect-[1.414/1]';

  const Logo = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => {
    const w = size === 'md' ? 'w-20 h-12' : 'w-16 h-10';
    return currentSettings.logo_url ? (
      <div className={`${w} flex items-center justify-center bg-white rounded shadow-sm border`}>
        <img src={currentSettings.logo_url} alt="Logo" className="max-w-full max-h-full object-contain p-1" />
      </div>
    ) : (
      <div
        className={`${w} flex flex-col items-center justify-center bg-white rounded shadow-sm border text-[8px] font-bold leading-tight`}
        style={{ color: themeColor }}
      >
        <div>SAFETY</div>
        <div>FRONTLINE</div>
      </div>
    );
  };

  const QrPlaceholder = () => (
    <div className="absolute bottom-4 left-4 flex flex-col items-center gap-1">
      <div
        className="w-14 h-14 bg-white border-2 flex items-center justify-center"
        style={{ borderColor: themeColor }}
      >
        <QrCode className="w-10 h-10" style={{ color: themeColor }} />
      </div>
      <div className="text-[7px] text-muted-foreground">Verifica online</div>
    </div>
  );

  const logoPosClass =
    logoPosition === 'top-right' ? 'top-4 right-4'
    : logoPosition === 'top-center' ? 'top-4 left-1/2 -translate-x-1/2'
    : 'top-4 left-4';

  const renderPreview = () => {
    const common = (
      <>
        <div className={`absolute ${logoPosClass}`}>
          <Logo />
        </div>
        <QrPlaceholder />
      </>
    );

    if (template === 'minimalista') {
      return (
        <div className="absolute inset-0 bg-white p-8 flex flex-col" style={{ fontFamily: getFontFamily() }}>
          <div className="absolute inset-5 border" style={{ borderColor: '#e5e5e5' }} />
          <div className="absolute top-12 left-8 w-16 h-1" style={{ backgroundColor: themeColor }} />
          {common}
          <div className="mt-20 px-2">
            <div className="text-[10px] tracking-widest text-muted-foreground">CERTIFICATO</div>
            <div className="text-2xl font-bold mt-2 text-foreground">Mario Rossi</div>
            <div className="text-xs text-muted-foreground">Azienda Esempio S.r.l.</div>
            <div className="w-20 h-0.5 my-3" style={{ backgroundColor: themeColor }} />
            <div className="text-xs">Ha completato</div>
            {modulePrefix && <div className="text-[10px] text-muted-foreground italic">{modulePrefix}</div>}
            <div className="text-base font-bold mt-1" style={{ color: themeColor }}>
              Safety Run - Rischi Generali
            </div>
            <div className="text-[10px] text-muted-foreground mt-3">Punteggio: 85%</div>
            <div className="text-[10px] text-muted-foreground">Completamenti: 3</div>
            <div className="text-[10px] text-muted-foreground">Data: {new Date().toLocaleDateString('it-IT')}</div>
            <div className="text-[8px] text-muted-foreground/70 mt-2">CERT-DEMO-XXXXX</div>
          </div>
        </div>
      );
    }

    if (template === 'moderno') {
      return (
        <div className="absolute inset-0 bg-white overflow-hidden" style={{ fontFamily: getFontFamily() }}>
          <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: themeColor }} />
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
            style={{ backgroundColor: themeColor }}
          />
          <div
            className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-10"
            style={{ backgroundColor: themeColor }}
          />
          {common}
          <div className="absolute inset-0 flex flex-col items-center pt-20 px-6 text-center">
            <div
              className="px-4 py-1 rounded text-[10px] font-bold text-white"
              style={{ backgroundColor: themeColor }}
            >
              CERTIFICATO DI COMPLETAMENTO
            </div>
            <div className="text-2xl font-bold mt-4">Mario Rossi</div>
            <div className="text-xs mt-1" style={{ color: themeColor }}>Azienda Esempio S.r.l.</div>
            <div className="mt-4 w-full bg-muted/40 rounded-md p-3 border" style={{ borderColor: `${themeColor}33` }}>
              <div className="text-[11px] text-muted-foreground">Ha completato con successo</div>
              {modulePrefix && <div className="text-[9px] text-muted-foreground italic">{modulePrefix}</div>}
              <div className="text-sm font-bold mt-1" style={{ color: themeColor }}>
                Safety Run - Rischi Generali
              </div>
              <div className="text-[10px] mt-1">Score: 85% | Completamenti: 3 | {new Date().toLocaleDateString('it-IT')}</div>
            </div>
            <div
              className="mt-3 px-4 py-1 rounded text-[10px] font-bold"
              style={{ backgroundColor: `${themeColor}22`, color: themeColor }}
            >
              CERT-DEMO-XXXXX
            </div>
          </div>
        </div>
      );
    }

    // formale + personalizzato (similar)
    const align = textLayout === 'left-aligned' ? 'items-start text-left' : 'items-center text-center';
    return (
      <div className="absolute inset-0" style={{ backgroundColor: '#f5f7fa', fontFamily: getFontFamily() }}>
        <div className="absolute top-0 left-0 right-0 h-3" style={{ backgroundColor: themeColor }} />
        <div className="absolute bottom-0 left-0 right-0 h-3" style={{ backgroundColor: themeColor }} />
        <div className="absolute inset-2.5 border-2 rounded-sm" style={{ borderColor: themeColor }} />
        <div className="absolute inset-4 border" style={{ borderColor: '#e5e5e5' }} />
        {common}
        <div className={`absolute inset-0 flex flex-col justify-start pt-20 px-6 ${align}`}>
          <h1 className="text-lg font-bold leading-tight">CERTIFICATO DI<br />COMPLETAMENTO</h1>
          <p className="text-[10px] text-muted-foreground mt-3">Si certifica che</p>
          <h2 className="text-xl font-bold mt-1" style={{ color: themeColor }}>Mario Rossi</h2>
          <p className="text-[10px] italic text-muted-foreground">Azienda Esempio S.r.l.</p>
          <p className="text-[10px] mt-3">ha completato con successo la</p>
          {modulePrefix && (
            <p className="text-[9px] text-muted-foreground">{modulePrefix}</p>
          )}
          <h3 className="text-base font-bold mt-1" style={{ color: themeColor }}>
            Safety Run - Rischi Generali
          </h3>
          <p className="text-[10px] mt-3">Punteggio: 85% • Completamenti: 3</p>
          <p className="text-[9px] text-muted-foreground">Data: {new Date().toLocaleDateString('it-IT')}</p>
          <p className="text-[9px] font-bold mt-2" style={{ color: themeColor }}>Codice: CERT-DEMO-XXXXX</p>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Personalizza Certificato</CardTitle>
          <CardDescription>
            Configura l'aspetto dei certificati aziendali. L'anteprima si aggiorna in tempo reale.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="template">Stile Certificato</Label>
            <Select
              value={template}
              onValueChange={(v) => {
                setTemplate(v);
                if (v !== 'personalizzato' && TEMPLATE_DEFAULTS[v]) {
                  setThemeColor(TEMPLATE_DEFAULTS[v]);
                }
              }}
            >
              <SelectTrigger id="template"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="formale">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Formale</div>
                      <div className="text-xs text-muted-foreground">Classico e professionale</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="moderno">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Moderno</div>
                      <div className="text-xs text-muted-foreground">Contemporaneo e dinamico</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="minimalista">
                  <div className="flex items-center gap-2">
                    <Minimize2 className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Minimalista</div>
                      <div className="text-xs text-muted-foreground">Pulito ed essenziale</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="personalizzato">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Personalizzato</div>
                      <div className="text-xs text-muted-foreground">Tutte le opzioni configurabili</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orientation">Orientamento</Label>
              <Select value={orientation} onValueChange={(v) => setOrientation(v as 'portrait' | 'landscape')}>
                <SelectTrigger id="orientation"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Verticale (A4)</SelectItem>
                  <SelectItem value="landscape">Orizzontale (A4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme-color-quick">Colore</Label>
              <div className="flex gap-2">
                <Input
                  id="theme-color-quick"
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-12 h-10 cursor-pointer p-1"
                />
                <Input
                  type="text"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="module-prefix">Testo prima del titolo del modulo</Label>
            <Input
              id="module-prefix"
              value={modulePrefix}
              onChange={(e) => setModulePrefix(e.target.value)}
              placeholder="Es. Verifica della Ricaduta sulla"
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground">
              Riga introduttiva mostrata sopra il nome del modulo. Lascia vuoto per nasconderla.
            </p>
          </div>

          {isCustomTemplate && (
            <>
              <div className="space-y-2">
                <Label htmlFor="font">Font</Label>
                <Select value={font} onValueChange={setFont}>
                  <SelectTrigger id="font"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="helvetica">Helvetica (Sans-serif)</SelectItem>
                    <SelectItem value="times">Times New Roman (Serif)</SelectItem>
                    <SelectItem value="courier">Courier New (Monospace)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="layout">Layout Testo</Label>
                <Select value={textLayout} onValueChange={setTextLayout}>
                  <SelectTrigger id="layout"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="centered">Centrato (Classico)</SelectItem>
                    <SelectItem value="left-aligned">Allineato a Sinistra</SelectItem>
                    <SelectItem value="modern">Moderno (Centrato con spaziatura)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-position">Posizione Logo</Label>
                <Select value={logoPosition} onValueChange={setLogoPosition}>
                  <SelectTrigger id="logo-position"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">In Alto a Sinistra</SelectItem>
                    <SelectItem value="top-right">In Alto a Destra</SelectItem>
                    <SelectItem value="top-center">In Alto al Centro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salva Impostazioni
          </Button>
        </CardContent>
      </Card>

      {/* Preview Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Anteprima Certificato</CardTitle>
          <CardDescription>
            Visualizzazione in tempo reale di stile, colori e testo configurabile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mx-auto" style={{ maxWidth: orientation === 'portrait' ? '320px' : '100%' }}>
            <div className={`relative w-full ${aspectClass} border-2 rounded-lg overflow-hidden shadow-sm`}>
              {renderPreview()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
