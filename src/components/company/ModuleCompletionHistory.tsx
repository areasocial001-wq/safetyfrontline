import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, CheckCircle, Clock, Trophy, User, BookOpen, 
  ChevronDown, ChevronUp, Eye, Filter, Search, X, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Notification {
  id: string;
  employee_name: string;
  module_id: string;
  module_title: string;
  score: number;
  max_score: number;
  xp_earned: number;
  time_spent_minutes: number;
  is_read: boolean;
  created_at: string;
}

interface Props {
  companyId: string;
}

const MODULE_OPTIONS = [
  { value: 'all', label: 'Tutti i moduli' },
  { value: 'giuridico_normativo', label: 'Giuridico e Normativo' },
  { value: 'gestione_organizzazione', label: 'Gestione ed Organizzazione' },
  { value: 'valutazione_rischi', label: 'Valutazione dei Rischi' },
  { value: 'dpi_protezione', label: 'DPI e Protezione' },
];

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Tutto il periodo' },
  { value: '7d', label: 'Ultimi 7 giorni' },
  { value: '30d', label: 'Ultimi 30 giorni' },
  { value: '90d', label: 'Ultimi 3 mesi' },
];

export const ModuleCompletionHistory = ({ companyId }: Props) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterModule, setFilterModule] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);
          toast.success(`📊 ${newNotif.employee_name} ha completato "${newNotif.module_title}"`, {
            duration: 6000,
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [companyId]);

  const markAsRead = async (id: string) => {
    await supabase.from('admin_notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('admin_notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success('Tutte le notifiche segnate come lette');
  };

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (filterModule !== 'all') {
      result = result.filter(n => n.module_id === filterModule);
    }

    if (filterEmployee.trim()) {
      const q = filterEmployee.toLowerCase();
      result = result.filter(n => n.employee_name.toLowerCase().includes(q));
    }

    if (filterPeriod !== 'all') {
      const now = new Date();
      const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
      const days = daysMap[filterPeriod] || 0;
      const cutoff = new Date(now.getTime() - days * 86400000);
      result = result.filter(n => new Date(n.created_at) >= cutoff);
    }

    return result;
  }, [notifications, filterModule, filterEmployee, filterPeriod]);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const displayedNotifications = expanded ? filteredNotifications : filteredNotifications.slice(0, 5);
  const hasActiveFilters = filterModule !== 'all' || filterEmployee.trim() !== '' || filterPeriod !== 'all';

  const clearFilters = () => {
    setFilterModule('all');
    setFilterEmployee('');
    setFilterPeriod('all');
  };

  const exportToExcel = () => {
    if (filteredNotifications.length === 0) return;
    const rows = filteredNotifications.map(n => ({
      'Dipendente': n.employee_name,
      'Modulo': n.module_title,
      'Punteggio': `${n.score}/${n.max_score}`,
      'Percentuale': n.max_score > 0 ? `${Math.round((n.score / n.max_score) * 100)}%` : '0%',
      'XP': n.xp_earned,
      'Tempo (min)': n.time_spent_minutes,
      'Data': new Date(n.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      'Letto': n.is_read ? 'Sì' : 'No',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Completamenti');
    XLSX.writeFile(wb, `storico-completamenti-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Report esportato con successo');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Adesso';
    if (diffMin < 60) return `${diffMin} min fa`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h fa`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}g fa`;
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Storico Completamenti
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-2 py-0.5">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant={showFilters ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              {hasActiveFilters && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary" />}
            </Button>
            {filteredNotifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={exportToExcel} title="Esporta in Excel">
                <Download className="w-4 h-4" />
              </Button>
            )}
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <Eye className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Cerca dipendente..."
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger className="h-9 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODULE_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="h-9 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="text-xs h-7 w-full" onClick={clearFilters}>
                <X className="w-3 h-3 mr-1" /> Rimuovi filtri
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-muted-foreground py-4">Caricamento...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{hasActiveFilters ? 'Nessun risultato per i filtri selezionati' : 'Nessun completamento registrato'}</p>
            {!hasActiveFilters && <p className="text-xs">Le notifiche appariranno quando i dipendenti completano i moduli</p>}
          </div>
        ) : (
          <>
            <ScrollArea className={expanded ? 'max-h-[500px]' : ''}>
              <div className="space-y-3">
                {displayedNotifications.map((notif) => {
                  const percentage = notif.max_score > 0 
                    ? Math.round((notif.score / notif.max_score) * 100) 
                    : 0;

                  return (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        notif.is_read 
                          ? 'bg-background border-border' 
                          : 'bg-primary/5 border-primary/20'
                      }`}
                      onClick={() => !notif.is_read && markAsRead(notif.id)}
                    >
                      <div className={`p-2 rounded-full shrink-0 ${
                        percentage >= 70 ? 'bg-accent/20' : 'bg-muted'
                      }`}>
                        {percentage >= 90 ? (
                          <Trophy className="w-4 h-4 text-accent" />
                        ) : percentage >= 70 ? (
                          <CheckCircle className="w-4 h-4 text-accent" />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{notif.employee_name}</span>
                          {!notif.is_read && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Ha completato <span className="font-medium">{notif.module_title}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <Badge variant={percentage >= 70 ? 'default' : 'secondary'} className="text-[10px]">
                            {percentage}%
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {notif.time_spent_minutes} min
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            +{notif.xp_earned} XP
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                        {formatDate(notif.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            {filteredNotifications.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <><ChevronUp className="w-4 h-4 mr-1" /> Mostra meno</>
                ) : (
                  <><ChevronDown className="w-4 h-4 mr-1" /> Mostra tutti ({filteredNotifications.length})</>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
