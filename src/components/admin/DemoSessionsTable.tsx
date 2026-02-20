import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Gamepad2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface DemoSession {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  scenario: string;
  score: number;
  max_score: number;
  completion_time: number | null;
  risks_identified: number | null;
  risks_missed: number | null;
  completed: boolean | null;
  created_at: string;
}

export const DemoSessionsTable = () => {
  const [sessions, setSessions] = useState<DemoSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof DemoSession>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  const handleSort = (field: keyof DemoSession) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: keyof DemoSession) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-40" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1 inline" />
      : <ArrowDown className="w-4 h-4 ml-1 inline" />;
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('demo_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching demo sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter((session) =>
    session.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Applica ordinamento
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' 
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
  });

  // Calcola paginazione
  const totalPages = Math.ceil(sortedSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSessions = sortedSessions.slice(startIndex, endIndex);

  // Reset alla prima pagina quando cambia il filtro di ricerca
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getScenarioLabel = (scenario: string) => {
    switch (scenario) {
      case 'office':
        return 'Ufficio';
      case 'warehouse':
        return 'Magazzino';
      default:
        return scenario;
    }
  };

  const getScorePercentage = (score: number, maxScore: number) => {
    return Math.round((score / maxScore) * 100);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Caricamento sessioni demo...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold">Sessioni Demo</h3>
        </div>
        <Badge variant="secondary">{sessions.length} totali</Badge>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per email, nome o azienda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('created_at')}
              >
                Data {getSortIcon('created_at')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('full_name')}
              >
                Nome {getSortIcon('full_name')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('email')}
              >
                Email {getSortIcon('email')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('company_name')}
              >
                Azienda {getSortIcon('company_name')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('scenario')}
              >
                Scenario {getSortIcon('scenario')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('score')}
              >
                Punteggio {getSortIcon('score')}
              </TableHead>
              <TableHead>Rischi</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('completed')}
              >
                Stato {getSortIcon('completed')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {filteredSessions.length === 0 ? 'Nessuna sessione trovata' : 'Nessun risultato per questa pagina'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    {new Date(session.created_at).toLocaleDateString('it-IT')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {session.full_name || '-'}
                  </TableCell>
                  <TableCell>{session.email || '-'}</TableCell>
                  <TableCell>{session.company_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getScenarioLabel(session.scenario)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {session.score}/{session.max_score}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getScorePercentage(session.score, session.max_score)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {session.risks_identified || 0} trovati, {session.risks_missed || 0} persi
                    </span>
                  </TableCell>
                  <TableCell>
                    {session.completed ? (
                      <Badge variant="default">Completato</Badge>
                    ) : (
                      <Badge variant="secondary">In corso</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginazione */}
      {filteredSessions.length > 0 && (
        <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1}-{Math.min(endIndex, sortedSessions.length)} di {sortedSessions.length} sessioni
            </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Precedente
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-9"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Successiva
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
