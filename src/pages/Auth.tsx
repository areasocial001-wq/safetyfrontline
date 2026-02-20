import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">SicurAzienda</span>
            </Link>
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4" />
                Torna alla Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md animate-fade-in">
          <AuthForm />
        </div>
      </main>
    </div>
  );
};

export default Auth;
