import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface Props {
  companyId: string;
  companyName: string;
  stats: {
    totalEmployees: number;
    activeSessions: number;
    averageScore: number;
    completedModules: number;
  };
}

export const DashboardPDFExport = ({ companyId, companyName, stats }: Props) => {
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      // Fetch notifications
      const { data: notifs } = await supabase
        .from('admin_notifications')
        .select('employee_name, module_title, score, max_score, xp_earned, time_spent_minutes, created_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(200);

      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 16;
      let y = 20;

      const addPageIfNeeded = (needed: number) => {
        if (y + needed > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          y = 20;
        }
      };

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(`Report Dashboard - ${companyName}`, margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(`Generato il ${new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, y);
      y += 14;
      doc.setTextColor(0, 0, 0);

      // Stats section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Statistiche Generali', margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const statsRows = [
        ['Dipendenti totali', String(stats.totalEmployees)],
        ['Sessioni attive', String(stats.activeSessions)],
        ['Punteggio medio', `${stats.averageScore}%`],
        ['Moduli completati', String(stats.completedModules)],
      ];

      // Stats table
      const colW = (pageW - margin * 2) / 2;
      statsRows.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'bold');
        doc.text(value, margin + colW, y);
        y += 6;
      });
      y += 8;

      // Completions by module summary
      if (notifs && notifs.length > 0) {
        const moduleMap = new Map<string, { count: number; totalPct: number; totalXp: number; totalMin: number }>();
        notifs.forEach(n => {
          const e = moduleMap.get(n.module_title) || { count: 0, totalPct: 0, totalXp: 0, totalMin: 0 };
          e.count++;
          e.totalPct += n.max_score > 0 ? Math.round((n.score / n.max_score) * 100) : 0;
          e.totalXp += n.xp_earned;
          e.totalMin += n.time_spent_minutes;
          moduleMap.set(n.module_title, e);
        });

        addPageIfNeeded(30);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Riepilogo per Modulo', margin, y);
        y += 8;

        // Table header
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y - 4, pageW - margin * 2, 7, 'F');
        const cols = [margin, margin + 60, margin + 90, margin + 115, margin + 140];
        doc.text('Modulo', cols[0], y);
        doc.text('Compl.', cols[1], y);
        doc.text('Media %', cols[2], y);
        doc.text('XP Tot.', cols[3], y);
        doc.text('Min Tot.', cols[4], y);
        y += 7;

        doc.setFont('helvetica', 'normal');
        Array.from(moduleMap.entries())
          .sort((a, b) => b[1].count - a[1].count)
          .forEach(([title, v]) => {
            addPageIfNeeded(7);
            const shortTitle = title.length > 30 ? title.slice(0, 28) + '…' : title;
            doc.text(shortTitle, cols[0], y);
            doc.text(String(v.count), cols[1], y);
            doc.text(`${Math.round(v.totalPct / v.count)}%`, cols[2], y);
            doc.text(String(v.totalXp), cols[3], y);
            doc.text(String(v.totalMin), cols[4], y);
            y += 6;
          });

        y += 10;

        // Detailed history
        addPageIfNeeded(30);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Storico Completamenti', margin, y);
        y += 8;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y - 4, pageW - margin * 2, 7, 'F');
        const hCols = [margin, margin + 35, margin + 90, margin + 115, margin + 135, margin + 155];
        doc.text('Dipendente', hCols[0], y);
        doc.text('Modulo', hCols[1], y);
        doc.text('Punteggio', hCols[2], y);
        doc.text('XP', hCols[3], y);
        doc.text('Min', hCols[4], y);
        doc.text('Data', hCols[5], y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        notifs.forEach(n => {
          addPageIfNeeded(6);
          const pct = n.max_score > 0 ? Math.round((n.score / n.max_score) * 100) : 0;
          const name = n.employee_name.length > 18 ? n.employee_name.slice(0, 16) + '…' : n.employee_name;
          const mod = n.module_title.length > 28 ? n.module_title.slice(0, 26) + '…' : n.module_title;
          const date = new Date(n.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });

          doc.text(name, hCols[0], y);
          doc.text(mod, hCols[1], y);
          doc.text(`${n.score}/${n.max_score} (${pct}%)`, hCols[2], y);
          doc.text(String(n.xp_earned), hCols[3], y);
          doc.text(String(n.time_spent_minutes), hCols[4], y);
          doc.text(date, hCols[5], y);
          y += 5;
        });
      }

      // Footer on each page
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 160);
        doc.text(
          `Pagina ${i} di ${totalPages} — SicurAzienda`,
          pageW / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`report-dashboard-${companyName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('Report PDF generato con successo');
    } catch (err) {
      console.error(err);
      toast.error('Errore nella generazione del report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button onClick={generate} disabled={generating} variant="outline" size="sm">
      {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
      Scarica Report PDF
    </Button>
  );
};
