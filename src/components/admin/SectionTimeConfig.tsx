import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Clock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import {
  modulo1Content,
  modulo2Content,
  modulo3Content,
  modulo4Content,
  type ModuleContent,
} from '@/data/training-content';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const ALL_MODULES: ModuleContent[] = [
  modulo1Content,
  modulo2Content,
  modulo3Content,
  modulo4Content,
];

const MODULE_LABELS: Record<string, string> = {
  giuridico_normativo: '1. Giuridico e Normativo',
  gestione_organizzazione: '2. Gestione ed Organizzazione',
  valutazione_rischi: '3. Valutazione dei Rischi',
  dpi_protezione: '4. DPI e Protezione',
};

const TYPE_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  lesson: { label: 'Lezione', variant: 'outline' },
  quiz: { label: 'Quiz', variant: 'secondary' },
  interactive: { label: 'Interattivo', variant: 'secondary' },
  boss_test: { label: 'Boss Test', variant: 'default' },
  scenario_3d: { label: '3D', variant: 'default' },
};

interface TimeOverride {
  module_id: string;
  section_id: string;
  min_time_seconds: number;
}

export const SectionTimeConfig = () => {
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [dbOverrides, setDbOverrides] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOverrides();
  }, []);

  const fetchOverrides = async () => {
    const { data, error } = await supabase
      .from('training_time_config')
      .select('module_id, section_id, min_time_seconds');
    
    if (error) {
      console.error('Error fetching time config:', error);
      return;
    }

    const map: Record<string, number> = {};
    (data || []).forEach((row: any) => {
      map[`${row.module_id}__${row.section_id}`] = row.min_time_seconds;
    });
    setDbOverrides(map);
    setOverrides(map);
  };

  const getKey = (moduleId: string, sectionId: string) => `${moduleId}__${sectionId}`;

  const handleChange = (moduleId: string, sectionId: string, value: string) => {
    const key = getKey(moduleId, sectionId);
    const numVal = parseInt(value, 10);
    if (isNaN(numVal) || numVal < 0) return;
    setOverrides(prev => ({ ...prev, [key]: numVal }));
  };

  const handleReset = (moduleId: string, sectionId: string) => {
    const key = getKey(moduleId, sectionId);
    setOverrides(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const hasChanges = () => {
    const allKeys = new Set([...Object.keys(overrides), ...Object.keys(dbOverrides)]);
    for (const key of allKeys) {
      if (overrides[key] !== dbOverrides[key]) return true;
    }
    return false;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Find all changes
      const allKeys = new Set([...Object.keys(overrides), ...Object.keys(dbOverrides)]);
      
      for (const key of allKeys) {
        const [moduleId, sectionId] = key.split('__');
        const newVal = overrides[key];
        const oldVal = dbOverrides[key];

        if (newVal === oldVal) continue;

        if (newVal === undefined) {
          // Delete override
          await supabase
            .from('training_time_config')
            .delete()
            .eq('module_id', moduleId)
            .eq('section_id', sectionId);
        } else if (oldVal === undefined) {
          // Insert new override
          await supabase
            .from('training_time_config')
            .insert({ module_id: moduleId, section_id: sectionId, min_time_seconds: newVal });
        } else {
          // Update existing
          await supabase
            .from('training_time_config')
            .update({ min_time_seconds: newVal })
            .eq('module_id', moduleId)
            .eq('section_id', sectionId);
        }
      }

      toast.success('✅ Tempi minimi aggiornati!');
      await fetchOverrides();
    } catch (err) {
      console.error('Error saving time config:', err);
      toast.error('❌ Errore nel salvataggio.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Tempi Minimi per Sezione</h2>
            <p className="text-sm text-muted-foreground">
              Configura il tempo minimo di permanenza (in secondi) per ogni sezione. Lascia vuoto per usare il valore predefinito del codice.
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges()}
          variant="professional"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvataggio...' : 'Salva Modifiche'}
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {ALL_MODULES.map((mod) => (
          <AccordionItem key={mod.moduleId} value={mod.moduleId} className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">
              {MODULE_LABELS[mod.moduleId] || mod.moduleId}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {mod.sections.map((section) => {
                  const key = getKey(mod.moduleId, section.id);
                  const override = overrides[key];
                  const defaultVal = section.minTimeSeconds;
                  const isOverridden = override !== undefined;
                  const typeBadge = TYPE_BADGE[section.type] || { label: section.type, variant: 'outline' as const };

                  return (
                    <div
                      key={section.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border"
                    >
                      <Badge variant={typeBadge.variant} className="min-w-[80px] justify-center text-xs">
                        {typeBadge.label}
                      </Badge>
                      <span className="flex-1 text-sm font-medium truncate" title={section.title}>
                        {section.title}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        Default: {defaultVal}s
                      </span>
                      <Input
                        type="number"
                        min={0}
                        className="w-24 text-center"
                        placeholder={String(defaultVal)}
                        value={isOverridden ? override : ''}
                        onChange={(e) => handleChange(mod.moduleId, section.id, e.target.value)}
                      />
                      <span className="text-xs text-muted-foreground">sec</span>
                      {isOverridden && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReset(mod.moduleId, section.id)}
                          title="Ripristina default"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
