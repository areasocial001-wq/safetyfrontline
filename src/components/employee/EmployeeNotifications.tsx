import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Shield, Check, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export const EmployeeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    const channel = supabase
      .channel('employee-notifs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'employee_notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('employee_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    setNotifications((data as Notification[]) || []);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('employee_notifications')
      .update({ is_read: true })
      .eq('id', id);

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (!unreadIds.length) return;

    await supabase
      .from('employee_notifications')
      .update({ is_read: true })
      .in('id', unreadIds);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Adesso';
    if (diffMin < 60) return `${diffMin} min fa`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h fa`;
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'sector_assignment': return <Shield className="w-4 h-4 text-primary" />;
      case 'module_completed': return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'deadline_reminder': return <Clock className="w-4 h-4 text-destructive" />;
      case 'all_modules_completed': return <Award className="w-4 h-4 text-emerald-500" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-muted rounded w-1/3" />
          <div className="h-16 bg-muted rounded" />
          <div className="h-16 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Notifiche</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center text-[10px] px-1.5 rounded-full">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
            <Check className="w-3 h-3 mr-1" />
            Segna tutte lette
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Nessuna notifica
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                notif.is_read ? 'bg-transparent hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10'
              }`}
              onClick={() => !notif.is_read && markAsRead(notif.id)}
            >
              <div className="mt-0.5">{getIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${notif.is_read ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>
                    {notif.title}
                  </p>
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{formatDate(notif.created_at)}</p>
              </div>
              {notif.type === 'sector_assignment' && (
                <Link to="/formazione" onClick={e => e.stopPropagation()}>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
