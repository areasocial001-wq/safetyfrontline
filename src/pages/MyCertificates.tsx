import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Award, Download, Home, ChevronRight, ArrowLeft, FileText, Calendar, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { generateCertificatePDF } from '@/lib/certificate-generator';
import { generateTrainingCertificatePDF } from '@/lib/training-certificate';

interface CertificateRecord {
  id: string;
  certificate_code: string;
  scenario: string;
  score: number;
  completions: number;
  issued_at: string;
}

const SCENARIO_LABELS: Record<string, string> = {
  general: 'Safety Run',
  office: 'Office Hazard Quest',
  warehouse: 'Magazzino 2.5D',
  formazione_generale: 'Formazione Generale Lavoratori',
};

const MyCertificates = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    fetchCertificates();
  }, [user, authLoading]);

  const fetchCertificates = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      toast.error('Errore nel caricamento degli attestati');
    } finally {
      setLoading(false);
    }
  };

  const handleRedownload = async (cert: CertificateRecord) => {
    if (!user) return;
    setRegenerating(cert.id);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, company_name')
        .eq('id', user.id)
        .single();

      if (!profile) { toast.error('Errore nel recupero dati utente'); return; }

      // Fetch company settings
      let companyLogoUrl: string | null = null;
      let certSettings = {
        template: 'formale', themeColor: '#3B82F6', font: 'helvetica',
        textLayout: 'centered', logoPosition: 'top-left',
      };

      const { data: companyUserData } = await supabase
        .from('company_users')
        .select(`company_id, companies(logo_url, certificate_template, certificate_theme_color, certificate_font, certificate_text_layout, certificate_logo_position, certificate_module_prefix, certificate_orientation)`)
        .eq('user_id', user.id)
        .single();

      if (companyUserData?.companies) {
        const c = companyUserData.companies as any;
        companyLogoUrl = c.logo_url;
        certSettings = {
          template: c.certificate_template || 'formale',
          themeColor: c.certificate_theme_color || '#3B82F6',
          font: c.certificate_font || 'helvetica',
          textLayout: c.certificate_text_layout || 'centered',
          logoPosition: c.certificate_logo_position || 'top-left',
          modulePrefix: c.certificate_module_prefix ?? 'Verifica della Ricaduta sulla',
          orientation: (c.certificate_orientation || 'portrait') as 'portrait' | 'landscape',
        };
      }

      toast.loading('Rigenerazione attestato in corso...');

      if (cert.scenario === 'formazione_generale') {
        // Training path certificate
        const { data: progress } = await supabase
          .from('training_progress')
          .select('module_id, time_spent_seconds')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        const completedModules = progress?.map(p => p.module_id) || [];
        const totalTime = progress?.reduce((s, p) => s + (p.time_spent_seconds || 0), 0) || 0;

        await generateTrainingCertificatePDF({
          userName: profile.full_name || 'Utente',
          companyName: profile.company_name || '',
          score: cert.score,
          totalTimeMinutes: Math.round(totalTime / 60),
          completedModules,
          date: new Date(cert.issued_at).toLocaleDateString('it-IT', {
            day: '2-digit', month: 'long', year: 'numeric',
          }),
        });
      } else {
        // Game scenario certificate
        await generateCertificatePDF({
          userName: profile.full_name || 'Utente',
          companyName: profile.company_name || '',
          moduleName: SCENARIO_LABELS[cert.scenario] || cert.scenario,
          scenario: cert.scenario,
          score: cert.score,
          completions: cert.completions,
          date: new Date(cert.issued_at).toLocaleDateString('it-IT', {
            day: '2-digit', month: 'long', year: 'numeric',
          }),
          companyLogoUrl,
          ...certSettings,
        });
      }

      toast.dismiss();
      toast.success('Attestato scaricato con successo!');
    } catch (err) {
      console.error('Error regenerating certificate:', err);
      toast.dismiss();
      toast.error('Errore nella rigenerazione dell\'attestato');
    } finally {
      setRegenerating(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Award className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                I Miei Attestati
              </h1>
              <p className="text-sm text-muted-foreground">
                Tutti gli attestati ottenuti con possibilità di ri-download
              </p>
            </div>
          </div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Home className="w-4 h-4" /><span>Home</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator><ChevronRight className="w-4 h-4" /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-1.5 font-semibold text-primary">
                  <Award className="w-4 h-4" /><span>I Miei Attestati</span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Caricamento attestati...</div>
        ) : certificates.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nessun attestato ancora</h2>
            <p className="text-muted-foreground mb-6">
              Completa i moduli formativi o ottieni almeno il 70% nelle simulazioni per ricevere un attestato.
            </p>
            <Link to="/formazione">
              <Button variant="default">Vai alla Formazione</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <Card key={cert.id} className="p-5 flex flex-col justify-between border-primary/20 hover:border-primary/40 transition-colors">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="default" className="text-xs">
                      {cert.score}%
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-1">
                    {SCENARIO_LABELS[cert.scenario] || cert.scenario}
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(cert.issued_at)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" />
                      <span className="font-mono text-xs">{cert.certificate_code}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-2 w-full"
                  disabled={regenerating === cert.id}
                  onClick={() => handleRedownload(cert)}
                >
                  <Download className="w-4 h-4" />
                  {regenerating === cert.id ? 'Generazione...' : 'Scarica di nuovo'}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyCertificates;
