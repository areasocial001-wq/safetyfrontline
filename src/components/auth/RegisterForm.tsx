import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Shield, Building, Users } from 'lucide-react';
import { 
  companyClientSignUpSchema, 
  employeeSignUpSchema, 
  CompanyClientSignUpFormData, 
  EmployeeSignUpFormData 
} from '@/lib/auth-validation';

type UserType = 'company' | 'employee';

export const RegisterForm = () => {
  const [userType, setUserType] = useState<UserType>('company');
  const [loading, setLoading] = useState(false);
  
  const [companyFormData, setCompanyFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
    vatNumber: '',
  });

  const [employeeFormData, setEmployeeFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    employeeId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const validationResult = companyClientSignUpSchema.safeParse(companyFormData);
      
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
        validationResult.data.fullName,
        'company_client',
        {
          company_name: validationResult.data.companyName,
          phone: validationResult.data.phone || undefined,
          vat_number: validationResult.data.vatNumber || undefined,
        }
      );

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Questo indirizzo email è già registrato. Prova ad accedere.');
        } else {
          toast.error(error.message || 'Errore durante la registrazione');
        }
        setLoading(false);
        return;
      }

      toast.success('Registrazione completata! Benvenuto su Safety Frontline.');
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Si è verificato un errore. Riprova.');
      setLoading(false);
    }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const validationResult = employeeSignUpSchema.safeParse(employeeFormData);
      
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
        validationResult.data.fullName,
        'employee',
        {
          company_name: validationResult.data.companyName,
          employee_id: validationResult.data.employeeId || undefined,
        }
      );

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Questo indirizzo email è già registrato. Prova ad accedere.');
        } else {
          toast.error(error.message || 'Errore durante la registrazione');
        }
        setLoading(false);
        return;
      }

      toast.success('Registrazione completata! Benvenuto su Safety Frontline.');
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Si è verificato un errore. Riprova.');
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl p-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-2">Crea il tuo Account</h2>
        <p className="text-muted-foreground">
          Scegli il tipo di account e completa la registrazione
        </p>
      </div>

      <Tabs value={userType} onValueChange={(v) => setUserType(v as UserType)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="company" className="gap-2">
            <Building className="w-4 h-4" />
            Azienda Cliente
          </TabsTrigger>
          <TabsTrigger value="employee" className="gap-2">
            <Users className="w-4 h-4" />
            Dipendente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <form onSubmit={handleCompanySubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-fullName">Nome e Cognome *</Label>
                <Input
                  id="company-fullName"
                  type="text"
                  value={companyFormData.fullName}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, fullName: e.target.value })}
                  placeholder="Mario Rossi"
                  disabled={loading}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="company-email">Email *</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={companyFormData.email}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, email: e.target.value })}
                  placeholder="mario.rossi@azienda.it"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-companyName">Nome Azienda *</Label>
                <Input
                  id="company-companyName"
                  type="text"
                  value={companyFormData.companyName}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, companyName: e.target.value })}
                  placeholder="Azienda S.r.l."
                  disabled={loading}
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive mt-1">{errors.companyName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="company-phone">Telefono</Label>
                <Input
                  id="company-phone"
                  type="tel"
                  value={companyFormData.phone}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, phone: e.target.value })}
                  placeholder="+39 123 456 7890"
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="company-vatNumber">Partita IVA</Label>
              <Input
                id="company-vatNumber"
                type="text"
                value={companyFormData.vatNumber}
                onChange={(e) => setCompanyFormData({ ...companyFormData, vatNumber: e.target.value })}
                placeholder="12345678901"
                disabled={loading}
              />
              {errors.vatNumber && (
                <p className="text-sm text-destructive mt-1">{errors.vatNumber}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-password">Password *</Label>
                <Input
                  id="company-password"
                  type="password"
                  value={companyFormData.password}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, password: e.target.value })}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
                {!errors.password && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Min 8 caratteri, con maiuscole, minuscole e numeri
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="company-confirmPassword">Conferma Password *</Label>
                <Input
                  id="company-confirmPassword"
                  type="password"
                  value={companyFormData.confirmPassword}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

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
                  Registrazione in corso...
                </>
              ) : (
                'Registra Azienda'
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="employee">
          <form onSubmit={handleEmployeeSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee-fullName">Nome e Cognome *</Label>
                <Input
                  id="employee-fullName"
                  type="text"
                  value={employeeFormData.fullName}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, fullName: e.target.value })}
                  placeholder="Mario Rossi"
                  disabled={loading}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="employee-email">Email *</Label>
                <Input
                  id="employee-email"
                  type="email"
                  value={employeeFormData.email}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
                  placeholder="mario.rossi@azienda.it"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee-companyName">Nome Azienda *</Label>
                <Input
                  id="employee-companyName"
                  type="text"
                  value={employeeFormData.companyName}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, companyName: e.target.value })}
                  placeholder="Azienda S.r.l."
                  disabled={loading}
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive mt-1">{errors.companyName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="employee-employeeId">Codice Dipendente</Label>
                <Input
                  id="employee-employeeId"
                  type="text"
                  value={employeeFormData.employeeId}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, employeeId: e.target.value })}
                  placeholder="EMP-001"
                  disabled={loading}
                />
                {errors.employeeId && (
                  <p className="text-sm text-destructive mt-1">{errors.employeeId}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee-password">Password *</Label>
                <Input
                  id="employee-password"
                  type="password"
                  value={employeeFormData.password}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, password: e.target.value })}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
                {!errors.password && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Min 8 caratteri, con maiuscole, minuscole e numeri
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="employee-confirmPassword">Conferma Password *</Label>
                <Input
                  id="employee-confirmPassword"
                  type="password"
                  value={employeeFormData.confirmPassword}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

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
                  Registrazione in corso...
                </>
              ) : (
                'Registra Dipendente'
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Hai già un account?{' '}
          <Link to="/auth" className="text-primary hover:underline font-medium">
            Accedi
          </Link>
        </p>
      </div>
    </Card>
  );
};
