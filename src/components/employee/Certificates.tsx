import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Award, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { generateCertificatePDF } from '@/lib/certificate-generator';

interface Certificate {
  scenario: string;
  name: string;
  completions: number;
  bestScore: number;
  lastCompleted: string;
  qualified: boolean;
}

interface CertificatesProps {
  userId: string;
}

export const Certificates = ({ userId }: CertificatesProps) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, [userId]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const { data: sessions, error } = await supabase
        .from('demo_sessions')
        .select('scenario, score, max_score, created_at')
        .eq('user_id', userId)
        .eq('completed', true);

      if (error) throw error;

      const moduleNames: Record<string, string> = {
        general: 'Safety Run',
        office: 'Office Hazard Quest',
        warehouse: 'Magazzino 2.5D',
      };

      const certificatesData = Object.entries(moduleNames).map(([scenario, name]) => {
        const scenarioSessions = sessions?.filter((s) => s.scenario === scenario) || [];
        const completions = scenarioSessions.length;
        
        const scores = scenarioSessions.map((s) => (s.score / s.max_score) * 100);
        const bestScore = completions > 0 ? Math.round(Math.max(...scores)) : 0;
        
        const lastSession = scenarioSessions.length > 0 
          ? scenarioSessions.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]
          : null;

        return {
          scenario,
          name,
          completions,
          bestScore,
          lastCompleted: lastSession?.created_at || '',
          qualified: bestScore >= 70 && completions >= 1, // Qualifica con 70% e almeno 1 completamento
        };
      });

      setCertificates(certificatesData);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (certificate: Certificate) => {
    if (!certificate.qualified) {
      toast.error('Devi ottenere almeno il 70% per scaricare il certificato');
      return;
    }
    
    try {
      // Get user profile data and company info
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, company_name')
        .eq('id', userId)
        .single();

      if (!profile) {
        toast.error('Errore nel recupero dei dati utente');
        return;
      }

      // Fetch company settings and logo if user belongs to a company
      let companyLogoUrl = null;
      let certificateSettings = {
        template: 'formale',
        themeColor: '#3B82F6',
        font: 'helvetica',
        textLayout: 'centered',
        logoPosition: 'top-left',
      };
      
      const { data: companyUserData } = await supabase
        .from('company_users')
        .select(`
          company_id, 
          companies(
            logo_url,
            certificate_template,
            certificate_theme_color,
            certificate_font,
            certificate_text_layout,
            certificate_logo_position
          )
        `)
        .eq('user_id', userId)
        .single();

      if (companyUserData?.companies) {
        const company = companyUserData.companies as any;
        companyLogoUrl = company.logo_url;
        certificateSettings = {
          template: company.certificate_template || 'formale',
          themeColor: company.certificate_theme_color || '#3B82F6',
          font: company.certificate_font || 'helvetica',
          textLayout: company.certificate_text_layout || 'centered',
          logoPosition: company.certificate_logo_position || 'top-left',
        };
      }

      toast.loading('Generazione certificato in corso...');
      
      const certificateCode = await generateCertificatePDF({
        userName: profile.full_name || 'Utente',
        companyName: profile.company_name || '',
        moduleName: certificate.name,
        scenario: certificate.scenario,
        score: certificate.bestScore,
        completions: certificate.completions,
        date: new Date().toLocaleDateString('it-IT', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        companyLogoUrl,
        template: certificateSettings.template,
        themeColor: certificateSettings.themeColor,
        font: certificateSettings.font,
        textLayout: certificateSettings.textLayout,
        logoPosition: certificateSettings.logoPosition,
      });

      toast.dismiss();
      toast.success(`Certificato generato con successo! Codice: ${certificateCode}`);
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.dismiss();
      toast.error('Errore nella generazione del certificato');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non completato';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold">Certificati e Qualifiche</h3>
        <p className="text-sm text-muted-foreground">
          Ottieni almeno il 70% per qualificarti e scaricare il certificato
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert) => (
            <Card
              key={cert.scenario}
              className={`p-4 ${
                cert.qualified
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      cert.qualified
                        ? 'bg-primary/20'
                        : 'bg-muted'
                    }`}
                  >
                    <Award
                      className={`w-6 h-6 ${
                        cert.qualified ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{cert.name}</h4>
                      {cert.qualified && (
                        <Badge variant="default" className="gap-1">
                          <Award className="w-3 h-3" />
                          Qualificato
                        </Badge>
                      )}
                    </div>
                    
                    {cert.completions > 0 ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-2">
                          Miglior punteggio: <span className="font-semibold">{cert.bestScore}%</span>
                          {' • '}
                          {cert.completions} {cert.completions === 1 ? 'completamento' : 'completamenti'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Ultimo completamento: {formatDate(cert.lastCompleted)}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Non ancora completato
                      </p>
                    )}
                  </div>
                </div>
                
                <Button
                  variant={cert.qualified ? 'default' : 'outline'}
                  size="sm"
                  disabled={!cert.qualified}
                  onClick={() => handleDownloadCertificate(cert)}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  {cert.qualified ? 'Scarica' : 'Bloccato'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};
