import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building2, Save, Info } from 'lucide-react';
import { getSpecificaFromAteco, SPECIFICA_CATEGORIES } from '@/lib/ateco-mapping';

interface AtecoCodeInputProps {
  companyId: string;
  currentAtecoCode: string | null;
  onUpdate: () => void;
}

export const AtecoCodeInput = ({ companyId, currentAtecoCode, onUpdate }: AtecoCodeInputProps) => {
  const [atecoCode, setAtecoCode] = useState(currentAtecoCode || '');
  const [saving, setSaving] = useState(false);

  const detectedCategory = getSpecificaFromAteco(atecoCode);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({ ateco_code: atecoCode.trim() || null })
        .eq('id', companyId);

      if (error) throw error;
      toast.success('Codice ATECO aggiornato');
      onUpdate();
    } catch (error) {
      console.error('Error saving ATECO code:', error);
      toast.error('Errore nel salvataggio del codice ATECO');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Codice ATECO
        </h3>
        <p className="text-sm text-muted-foreground">
          Inserisci il codice ATECO dell'azienda per assegnare automaticamente il modulo di Formazione Specifica ai dipendenti.
        </p>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block">Codice ATECO</label>
          <Input
            placeholder="Es. 56.10, 62.01, 25.11..."
            value={atecoCode}
            onChange={(e) => setAtecoCode(e.target.value)}
            className="font-mono"
          />
        </div>
        <Button onClick={handleSave} disabled={saving} size="default">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvataggio...' : 'Salva'}
        </Button>
      </div>

      {detectedCategory && (
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Modulo Specifica associato:</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">{SPECIFICA_CATEGORIES[detectedCategory].label}</Badge>
            <span className="text-sm text-muted-foreground">
              {SPECIFICA_CATEGORIES[detectedCategory].description} • {SPECIFICA_CATEGORIES[detectedCategory].hours}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
