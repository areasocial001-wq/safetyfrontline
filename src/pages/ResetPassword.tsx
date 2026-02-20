import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Shield, ArrowLeft, KeyRound } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.object({
  password: z.string()
    .min(8, { message: "La password deve contenere almeno 8 caratteri" })
    .max(72, { message: "La password non può superare 72 caratteri" })
    .regex(/[A-Z]/, { message: "Almeno una lettera maiuscola" })
    .regex(/[a-z]/, { message: "Almeno una lettera minuscola" })
    .regex(/[0-9]/, { message: "Almeno un numero" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const { updatePassword, session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!session) {
      // User needs to come from the reset email link
      const hash = window.location.hash;
      if (!hash.includes('type=recovery')) {
        toast.error('Link di reset non valido. Richiedi un nuovo link.');
        navigate('/auth');
      }
    }
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        toast.error(error.message || 'Errore durante il reset della password');
      } else {
        toast.success('Password aggiornata con successo!');
        navigate('/');
      }
    } catch {
      toast.error('Si è verificato un errore. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">SicurAzienda</span>
            </Link>
            <Link to="/auth">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4" />
                Torna al Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md p-8 animate-fade-in">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Nuova Password</h2>
            <p className="text-muted-foreground">Inserisci la tua nuova password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Nuova Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Minimo 8 caratteri, con maiuscole, minuscole e numeri
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Conferma Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full" variant="hero" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Aggiornamento in corso...
                </>
              ) : (
                'Aggiorna Password'
              )}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default ResetPassword;
