import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, FileText, Sparkles, Minimize2 } from "lucide-react";
import { certificateTemplates } from "@/lib/certificate-templates";

interface CertificateEditorProps {
  companyId: string;
  currentSettings: {
    certificate_template: string;
    certificate_theme_color: string;
    certificate_font: string;
    certificate_text_layout: string;
    certificate_logo_position: string;
    logo_url?: string | null;
  };
  onUpdate: () => void;
}

export const CertificateEditor = ({ companyId, currentSettings, onUpdate }: CertificateEditorProps) => {
  const [template, setTemplate] = useState(currentSettings.certificate_template || 'formale');
  const [themeColor, setThemeColor] = useState(currentSettings.certificate_theme_color || '#3B82F6');
  const [font, setFont] = useState(currentSettings.certificate_font || 'helvetica');
  const [textLayout, setTextLayout] = useState(currentSettings.certificate_text_layout || 'centered');
  const [logoPosition, setLogoPosition] = useState(currentSettings.certificate_logo_position || 'top-left');
  const [saving, setSaving] = useState(false);

  const isCustomTemplate = template === 'personalizzato';

  useEffect(() => {
    setTemplate(currentSettings.certificate_template || 'formale');
    setThemeColor(currentSettings.certificate_theme_color || '#3B82F6');
    setFont(currentSettings.certificate_font || 'helvetica');
    setTextLayout(currentSettings.certificate_text_layout || 'centered');
    setLogoPosition(currentSettings.certificate_logo_position || 'top-left');
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
        })
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

  const getLogoPositionStyle = () => {
    switch (logoPosition) {
      case 'top-left':
        return { top: '20px', left: '20px' };
      case 'top-right':
        return { top: '20px', right: '20px' };
      case 'top-center':
        return { top: '20px', left: '50%', transform: 'translateX(-50%)' };
      default:
        return { top: '20px', left: '20px' };
    }
  };

  const getTextAlignStyle = () => {
    switch (textLayout) {
      case 'centered':
        return 'center';
      case 'left-aligned':
        return 'left';
      case 'modern':
        return 'center';
      default:
        return 'center';
    }
  };

  const getFontFamily = () => {
    switch (font) {
      case 'helvetica':
        return 'Arial, sans-serif';
      case 'times':
        return 'Times New Roman, serif';
      case 'courier':
        return 'Courier New, monospace';
      default:
        return 'Arial, sans-serif';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Personalizza Certificato</CardTitle>
          <CardDescription>
            Configura l'aspetto dei certificati aziendali
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="template">Modello Certificato</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger id="template">
                <SelectValue />
              </SelectTrigger>
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
                  <div className="font-medium">Personalizzato</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCustomTemplate && (
            <>
          <div className="space-y-2">
            <Label htmlFor="theme-color">Colore Tema</Label>
            <div className="flex gap-2">
              <Input
                id="theme-color"
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font">Font</Label>
            <Select value={font} onValueChange={setFont}>
              <SelectTrigger id="font">
                <SelectValue />
              </SelectTrigger>
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
              <SelectTrigger id="layout">
                <SelectValue />
              </SelectTrigger>
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
              <SelectTrigger id="logo-position">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">In Alto a Sinistra</SelectItem>
                <SelectItem value="top-right">In Alto a Destra</SelectItem>
                <SelectItem value="top-center">In Alto al Centro</SelectItem>
              </SelectContent>
            </Select>
          </div>

            </>
          )}

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full"
          >
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
            Visualizzazione in tempo reale delle modifiche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="relative w-full aspect-[1.414/1] border-2 rounded-lg overflow-hidden"
            style={{ 
              backgroundColor: '#f5f7fa',
              fontFamily: getFontFamily(),
            }}
          >
            {/* Top Border */}
            <div 
              className="absolute top-0 left-0 right-0 h-4"
              style={{ backgroundColor: themeColor }}
            />
            
            {/* Bottom Border */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-4"
              style={{ backgroundColor: themeColor }}
            />

            {/* Border Frame */}
            <div 
              className="absolute inset-3 border-2 rounded"
              style={{ borderColor: themeColor }}
            />

            {/* Logo */}
            {currentSettings.logo_url ? (
              <div 
                className="absolute w-16 h-10 flex items-center justify-center bg-white rounded shadow-sm"
                style={getLogoPositionStyle()}
              >
                <img 
                  src={currentSettings.logo_url} 
                  alt="Logo" 
                  className="max-w-full max-h-full object-contain p-1"
                />
              </div>
            ) : (
              <div 
                className="absolute w-16 h-10 flex flex-col items-center justify-center bg-white rounded shadow-sm text-xs font-bold"
                style={{ ...getLogoPositionStyle(), color: themeColor }}
              >
                <div>SAFETY</div>
                <div>FRONTLINE</div>
              </div>
            )}

            {/* Content */}
            <div 
              className={`absolute inset-0 flex flex-col justify-center px-8 ${
                textLayout === 'left-aligned' ? 'items-start' : 'items-center'
              }`}
              style={{ paddingTop: '60px' }}
            >
              <h1 
                className="text-xl font-bold mb-2"
                style={{ textAlign: getTextAlignStyle() }}
              >
                CERTIFICATO DI COMPLETAMENTO
              </h1>
              
              <p className="text-xs text-gray-600 mb-3" style={{ textAlign: getTextAlignStyle() }}>
                Questo certifica che
              </p>
              
              <h2 
                className="text-lg font-bold mb-2"
                style={{ color: themeColor, textAlign: getTextAlignStyle() }}
              >
                Mario Rossi
              </h2>
              
              <p className="text-xs italic text-gray-600 mb-3" style={{ textAlign: getTextAlignStyle() }}>
                Azienda Esempio S.r.l.
              </p>
              
              <p className="text-xs mb-2" style={{ textAlign: getTextAlignStyle() }}>
                ha completato con successo il modulo formativo
              </p>
              
              <h3 
                className="text-base font-bold mb-2"
                style={{ color: themeColor, textAlign: getTextAlignStyle() }}
              >
                Safety Run - Rischi Generali
              </h3>
              
              <p className="text-xs mb-2" style={{ textAlign: getTextAlignStyle() }}>
                Punteggio Migliore: 85% • Completamenti: 3
              </p>
              
              <p className="text-xs text-gray-500 mb-2" style={{ textAlign: getTextAlignStyle() }}>
                Data di emissione: {new Date().toLocaleDateString('it-IT')}
              </p>
              
              <div className="text-xs font-bold mt-2" style={{ color: themeColor, textAlign: getTextAlignStyle() }}>
                Codice: CERT-OFFICE-XXXXX
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
