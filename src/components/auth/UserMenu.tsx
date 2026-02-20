import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Shield, Building, GraduationCap, Trophy, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, isCompanyClient, isEmployee } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Errore durante il logout');
    } else {
      toast.success('Logout effettuato');
      navigate('/');
    }
  };

  if (!user) {
    return (
      <Button variant="professional" onClick={() => navigate('/auth')}>
        Accedi
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Account</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem onClick={() => navigate('/admin')}>
              <Shield className="w-4 h-4 mr-2" />
              Dashboard Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {isCompanyClient && (
          <>
            <DropdownMenuItem onClick={() => navigate('/company')}>
              <Building className="w-4 h-4 mr-2" />
              Dashboard Azienda
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {isEmployee && (
          <>
            <DropdownMenuItem onClick={() => navigate('/employee')}>
              <GraduationCap className="w-4 h-4 mr-2" />
              La Mia Formazione
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <Settings className="w-4 h-4 mr-2" />
          Profilo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/player-profile')}>
          <Trophy className="w-4 h-4 mr-2" />
          Profilo Giocatore
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/formazione')}>
          <GraduationCap className="w-4 h-4 mr-2" />
          Formazione Generale
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
