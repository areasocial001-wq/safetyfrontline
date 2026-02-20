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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, FileText, Eye, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuoteRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company_name: string;
  employees_count: string | null;
  training_type: string | null;
  modules: string[] | null;
  message: string | null;
  status: string | null;
  created_at: string;
}

export const QuoteRequestsTable = () => {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof QuoteRequest>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;
  const { toast } = useToast();

  const openRequestDetails = (request: QuoteRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleSort = (field: keyof QuoteRequest) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: keyof QuoteRequest) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-40" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1 inline" />
      : <ArrowDown className="w-4 h-4 ml-1 inline" />;
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching quote requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) =>
    request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Applica ordinamento
  const sortedRequests = [...filteredRequests].sort((a, b) => {
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
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = sortedRequests.slice(startIndex, endIndex);

  // Reset alla prima pagina quando cambia il filtro di ricerca
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const updateStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(requests.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ));

      toast({
        title: 'Stato aggiornato',
        description: 'Lo stato della richiesta preventivo è stato modificato con successo.',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare lo stato della richiesta.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'nuovo':
        return { label: 'Nuovo', variant: 'default' as const };
      case 'in_lavorazione':
        return { label: 'In Lavorazione', variant: 'secondary' as const };
      case 'completato':
        return { label: 'Completato', variant: 'outline' as const };
      case 'archiviato':
        return { label: 'Archiviato', variant: 'outline' as const };
      default:
        return { label: 'Nuovo', variant: 'default' as const };
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Caricamento richieste preventivo...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold">Richieste Preventivo</h3>
        </div>
        <Badge variant="secondary">{requests.length} totali</Badge>
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
                onClick={() => handleSort('employees_count')}
              >
                Dipendenti {getSortIcon('employees_count')}
              </TableHead>
              <TableHead>Moduli</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('status')}
              >
                Stato {getSortIcon('status')}
              </TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {filteredRequests.length === 0 ? 'Nessuna richiesta trovata' : 'Nessun risultato per questa pagina'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {new Date(request.created_at).toLocaleDateString('it-IT')}
                  </TableCell>
                  <TableCell className="font-medium">{request.full_name}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.company_name}</TableCell>
                  <TableCell>{request.employees_count || '-'}</TableCell>
                  <TableCell>
                    {request.modules && request.modules.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {request.modules.slice(0, 2).map((module, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {module}
                          </Badge>
                        ))}
                        {request.modules.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{request.modules.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={request.status || 'nuovo'}
                      onValueChange={(value) => updateStatus(request.id, value)}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nuovo">Nuovo</SelectItem>
                        <SelectItem value="in_lavorazione">In Lavorazione</SelectItem>
                        <SelectItem value="completato">Completato</SelectItem>
                        <SelectItem value="archiviato">Archiviato</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRequestDetails(request)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginazione */}
      {filteredRequests.length > 0 && (
        <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1}-{Math.min(endIndex, sortedRequests.length)} di {sortedRequests.length} richieste
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dettagli Richiesta Preventivo</DialogTitle>
            <DialogDescription>
              Richiesta ricevuta il {selectedRequest && new Date(selectedRequest.created_at).toLocaleDateString('it-IT')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                  <p className="text-base font-medium">{selectedRequest.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{selectedRequest.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefono</p>
                  <p className="text-base">{selectedRequest.phone || 'Non fornito'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Azienda</p>
                  <p className="text-base font-medium">{selectedRequest.company_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Numero Dipendenti</p>
                  <p className="text-base">{selectedRequest.employees_count || 'Non specificato'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo Formazione</p>
                  <p className="text-base">{selectedRequest.training_type || 'Non specificato'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Moduli Richiesti</p>
                {selectedRequest.modules && selectedRequest.modules.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.modules.map((module, idx) => (
                      <Badge key={idx} variant="secondary">
                        {module}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-base text-muted-foreground">Nessun modulo specificato</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Messaggio</p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-base whitespace-pre-wrap">
                    {selectedRequest.message || 'Nessun messaggio fornito'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Stato Attuale</p>
                <Select
                  value={selectedRequest.status || 'nuovo'}
                  onValueChange={(value) => {
                    updateStatus(selectedRequest.id, value);
                    setSelectedRequest({ ...selectedRequest, status: value });
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nuovo">Nuovo</SelectItem>
                    <SelectItem value="in_lavorazione">In Lavorazione</SelectItem>
                    <SelectItem value="completato">Completato</SelectItem>
                    <SelectItem value="archiviato">Archiviato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
