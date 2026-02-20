import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const TrainingRemindersControl = () => {
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<{
    sent: number;
    totalEmployees: number;
    employeesWithMissing: number;
    timestamp: string;
  } | null>(null);

  const handleSendReminders = async () => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-training-reminders', {
        body: { manual: true }
      });

      if (error) throw error;

      setLastResult({
        sent: data.sent,
        totalEmployees: data.totalEmployees,
        employeesWithMissing: data.employeesWithMissing,
        timestamp: new Date().toISOString(),
      });

      toast.success(
        `✅ Promemoria inviati con successo! ${data.sent} email inviate a dipendenti con moduli incompleti.`
      );
    } catch (error) {
      console.error('Error sending training reminders:', error);
      toast.error("❌ Errore nell'invio dei promemoria. Riprova.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Promemoria Training Automatici</h3>
              <p className="text-sm text-muted-foreground">
                Sistema di notifiche automatiche per moduli incompleti
              </p>
            </div>
          </div>
        </div>

        {/* Cron Schedule Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-semibold">Promemoria Settimanale</span>
              <Badge variant="outline" className="ml-auto">Attivo</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Ogni <strong>Lunedì alle 09:00</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Invia notifiche ai dipendenti con moduli incompleti
            </p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-secondary" />
              <span className="font-semibold">Promemoria Mensile</span>
              <Badge variant="outline" className="ml-auto">Attivo</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Primo giorno del mese alle 09:00</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Promemoria di riepilogo mensile
            </p>
          </div>
        </div>

        {/* Last Result Stats */}
        {lastResult && (
          <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Ultimo Invio Completato</h4>
                <p className="text-xs text-muted-foreground">
                  {new Date(lastResult.timestamp).toLocaleString('it-IT', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="text-center p-2 bg-background/50 rounded">
                <p className="text-2xl font-bold text-primary">{lastResult.sent}</p>
                <p className="text-xs text-muted-foreground">Email Inviate</p>
              </div>
              <div className="text-center p-2 bg-background/50 rounded">
                <p className="text-2xl font-bold text-accent">{lastResult.employeesWithMissing}</p>
                <p className="text-xs text-muted-foreground">Con Moduli Mancanti</p>
              </div>
              <div className="text-center p-2 bg-background/50 rounded">
                <p className="text-2xl font-bold text-secondary">{lastResult.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">Dipendenti Totali</p>
              </div>
            </div>
          </div>
        )}

        {/* Manual Send Section */}
        <div className="pt-4 border-t">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Invio Manuale</h4>
              <p className="text-xs text-muted-foreground">
                Puoi inviare i promemoria immediatamente a tutti i dipendenti con moduli incompleti
              </p>
            </div>
          </div>
          <Button
            onClick={handleSendReminders}
            disabled={isSending}
            variant="professional"
            size="lg"
            className="w-full"
          >
            {isSending ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                Invio in corso...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Invia Promemoria Ora
              </>
            )}
          </Button>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>ℹ️ Come funziona:</strong> Il sistema identifica automaticamente i dipendenti 
            che non hanno completato tutti i moduli obbligatori (Office, Warehouse, General) e 
            invia loro un'email di promemoria con la lista dei moduli da completare.
          </p>
        </div>
      </div>
    </Card>
  );
};
