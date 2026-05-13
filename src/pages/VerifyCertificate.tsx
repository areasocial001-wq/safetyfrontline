import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, CheckCircle, XCircle, Search, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Seo } from '@/components/Seo';

interface CertificateInfo {
  certificate_code: string;
  issued_at: string;
  scenario: string;
  score: number;
  completions: number;
  user_id: string;
}

const VerifyCertificate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [certificateCode, setCertificateCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<CertificateInfo | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setCertificateCode(code);
      verifyCertificate(code);
    }
  }, [searchParams]);

  const verifyCertificate = async (code: string) => {
    if (!code.trim()) {
      toast.error('Inserisci un codice certificato valido');
      return;
    }

    setLoading(true);
    setCertificate(null);
    setVerified(null);

    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_code', code)
        .single();

      if (error || !data) {
        setVerified(false);
        toast.error('Certificato non trovato');
      } else {
        setCertificate(data);
        setVerified(true);
        toast.success('Certificato verificato con successo!');
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setVerified(false);
      toast.error('Errore nella verifica del certificato');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCertificate(certificateCode);
  };

  const getModuleName = (scenario: string) => {
    const moduleNames: Record<string, string> = {
      general: 'Safety Run',
      office: 'Office Hazard Quest',
      warehouse: 'Magazzino 2.5D',
    };
    return moduleNames[scenario] || scenario;
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Verifica Attestato | Safety Frontline"
        description="Verifica l'autenticità di un attestato di formazione sulla sicurezza emesso da Safety Frontline."
        path="/verify-certificate"
      />
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Verifica Certificato
              </h1>
              <p className="text-sm text-muted-foreground">
                Verifica l'autenticità di un certificato Safety Frontline
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-2">
                Codice Certificato
              </label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  type="text"
                  placeholder="CERT-XXXX-XXXX-XXXX"
                  value={certificateCode}
                  onChange={(e) => setCertificateCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? 'Verifica...' : 'Verifica'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Inserisci il codice del certificato o scansiona il QR code presente sul certificato
              </p>
            </div>
          </form>

          {/* Verification Result */}
          {verified !== null && (
            <div className="mt-6 pt-6 border-t border-border">
              {verified && certificate ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle className="w-8 h-8" />
                    <div>
                      <h3 className="text-lg font-bold">Certificato Verificato</h3>
                      <p className="text-sm text-muted-foreground">
                        Questo certificato è autentico e valido
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Codice Certificato</p>
                        <p className="font-mono font-semibold text-sm">
                          {certificate.certificate_code}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Data di Emissione</p>
                        <p className="font-semibold text-sm">
                          {new Date(certificate.issued_at).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Modulo Completato</p>
                        <p className="font-semibold text-sm">
                          {getModuleName(certificate.scenario)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Punteggio</p>
                        <p className="font-semibold text-sm">{certificate.score}%</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Completamenti</p>
                      <p className="font-semibold text-sm">{certificate.completions}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-destructive">
                    <XCircle className="w-8 h-8" />
                    <div>
                      <h3 className="text-lg font-bold">Certificato Non Valido</h3>
                      <p className="text-sm text-muted-foreground">
                        Questo certificato non è stato trovato nel sistema
                      </p>
                    </div>
                  </div>
                  <div className="bg-destructive/10 rounded-lg p-4">
                    <p className="text-sm">
                      Il codice inserito non corrisponde ad alcun certificato emesso dalla
                      piattaforma Safety Frontline. Verifica di aver inserito il codice
                      corretto o contatta l'assistenza.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default VerifyCertificate;
