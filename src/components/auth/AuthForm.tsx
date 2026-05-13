import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Shield } from 'lucide-react';
import { signUpSchema, signInSchema, SignUpFormData, SignInFormData } from '@/lib/auth-validation';

type AuthMode = 'signin' | 'signup' | 'forgot';

export const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const emailResult = signInSchema.shape.email.safeParse(formData.email);
        if (!emailResult.success) {
          setErrors({ email: emailResult.error.errors[0]?.message || 'Email non valida' });
          setLoading(false);
          return;
        }

        const { error } = await resetPassword(formData.email);
        if (error) {
          console.error('[Auth] resetPassword error:', error);
          toast.error('Impossibile inviare l\'email di reset. Riprova più tardi.');
        } else {
          toast.success('Email di reset inviata! Controlla la tua casella di posta.');
          setMode('signin');
        }
        setLoading(false);
        return;
      }

      if (mode === 'signup') {
        const validationResult = signUpSchema.safeParse(formData);
        
        if (!validationResult.success) {
          const fieldErrors: Record<string, string> = {};
          validationResult.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0].toString()] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signUp(
          validationResult.data.email,
          validationResult.data.password,
          validationResult.data.fullName
        );

        if (error) {
          console.error('[Auth] signUp error:', error);
          if (error.message.includes('already registered') || error.message.toLowerCase().includes('already')) {
            toast.error('Questo indirizzo email è già registrato. Prova ad accedere.');
          } else {
            toast.error('Registrazione non riuscita. Verifica i dati e riprova.');
          }
          setLoading(false);
          return;
        }

        toast.success('Registrazione completata! Reindirizzamento...');
        setTimeout(() => navigate('/'), 1000);
      } else {
        const validationResult = signInSchema.safeParse(formData);
        
        if (!validationResult.success) {
          const fieldErrors: Record<string, string> = {};
          validationResult.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0].toString()] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(
          validationResult.data.email,
          validationResult.data.password
        );

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email o password non corretti');
          } else {
            toast.error(error.message || 'Errore durante l\'accesso');
          }
          setLoading(false);
          return;
        }

        toast.success('Accesso effettuato! Reindirizzamento...');
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (error) {
      toast.error('Si è verificato un errore. Riprova.');
      setLoading(false);
    }
  };

  const toggleMode = () => {
    const nextMode = mode === 'signin' ? 'signup' : 'signin';
    setMode(nextMode);
    setFormData({ email: '', password: '', confirmPassword: '', fullName: '' });
    setErrors({});
  };

  return (
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {mode === 'signin' ? 'Accedi' : mode === 'signup' ? 'Registrati' : 'Password Dimenticata'}
        </h2>
        <p className="text-muted-foreground">
          {mode === 'signin' 
            ? 'Benvenuto! Accedi al tuo account'
            : mode === 'signup'
            ? 'Crea il tuo account Safety Frontline'
            : 'Inserisci la tua email per ricevere il link di reset'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <Label htmlFor="fullName">Nome e Cognome *</Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Mario Rossi"
              disabled={loading}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="mario.rossi@esempio.it"
            disabled={loading}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email}</p>
          )}
        </div>

        {mode !== 'forgot' && (
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              disabled={loading}
            />
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password}</p>
            )}
            {mode === 'signup' && !errors.password && (
              <p className="text-xs text-muted-foreground mt-1">
                Minimo 8 caratteri, con maiuscole, minuscole e numeri
              </p>
            )}
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <Label htmlFor="confirmPassword">Conferma Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          variant="hero"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {mode === 'forgot' ? 'Invio in corso...' : mode === 'signin' ? 'Accesso in corso...' : 'Registrazione in corso...'}
            </>
          ) : (
            mode === 'forgot' ? 'Invia Link di Reset' : mode === 'signin' ? 'Accedi' : 'Registrati'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2">
        {mode === 'signin' && (
          <>
            <button
              onClick={() => { setMode('forgot'); setErrors({}); }}
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
              disabled={loading}
            >
              Password dimenticata?
            </button>
            <p className="text-sm text-muted-foreground">
              Non hai un account?{' '}
              <a href="/register" className="text-primary hover:underline font-medium">
                Registrati qui
              </a>
            </p>
          </>
        )}
        {mode === 'forgot' && (
          <button
            onClick={() => { setMode('signin'); setErrors({}); }}
            className="text-sm text-primary hover:underline"
            disabled={loading}
          >
            Torna al Login
          </button>
        )}
        {mode === 'signup' && (
          <button
            onClick={toggleMode}
            className="text-sm text-primary hover:underline"
            disabled={loading}
          >
            Hai già un account? Accedi
          </button>
        )}
      </div>
    </Card>
  );
};
