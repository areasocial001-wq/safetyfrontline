import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileCheck2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface Props {
  companyId: string;
  companyName: string;
  companyVat?: string | null;
  ownerName?: string | null;
}

/**
 * Report Finale Formativo per il Datore di Lavoro.
 * Documento aggregato unico che combina:
 *  - Frontespizio azienda + periodo
 *  - KPI globali (dipendenti, ore formative, % completamento, punteggio medio)
 *  - Tabella dipendenti con moduli, punteggi, date, ore
 *  - Stato conformità moduli obbligatori
 *  - Elenco certificati emessi
 *  - Spazio per firma del Datore di Lavoro
 */
export const FinalTrainingReport = ({ companyId, companyName, companyVat, ownerName }: Props) => {
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      // --- Fetch data in parallel ---
      const [
        { data: companyUsers },
        { data: notifs },
        { data: certs },
        { data: mandatoryModules },
      ] = await Promise.all([
        supabase
          .from('company_users')
          .select('user_id, profiles:profiles!company_users_user_id_fkey(id, full_name, email)')
          .eq('company_id', companyId),
        supabase
          .from('admin_notifications')
          .select('employee_name, employee_email, module_title, score, max_score, xp_earned, time_spent_minutes, created_at')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false }),
        supabase
          .from('certificates')
          .select('user_id, scenario, score, certificate_code, created_at, profiles:profiles!certificates_user_id_fkey(full_name, email)')
          .order('created_at', { ascending: false }),
        supabase
          .from('company_mandatory_modules')
          .select('module_id, module_title, deadline_days')
          .eq('company_id', companyId),
      ]);

      // Restrict certs to employees of this company
      const employeeIds = new Set((companyUsers || []).map((cu: any) => cu.user_id));
      const companyCerts = (certs || []).filter((c: any) => employeeIds.has(c.user_id));

      // --- Aggregations ---
      const totalEmployees = companyUsers?.length || 0;
      const totalCompletions = notifs?.length || 0;
      const totalMinutes = (notifs || []).reduce((s, n: any) => s + (n.time_spent_minutes || 0), 0);
      const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
      const avgScore = totalCompletions > 0
        ? Math.round((notifs || []).reduce((s, n: any) => s + (n.max_score > 0 ? (n.score / n.max_score) * 100 : 0), 0) / totalCompletions)
        : 0;

      // Per-employee aggregation
      const empMap = new Map<string, { name: string; email: string; completions: number; avgPct: number; minutes: number; xp: number; certs: number }>();
      (companyUsers || []).forEach((cu: any) => {
        const p = cu.profiles;
        if (!p) return;
        empMap.set(cu.user_id, {
          name: p.full_name || p.email || 'N/D',
          email: p.email || '',
          completions: 0,
          avgPct: 0,
          minutes: 0,
          xp: 0,
          certs: 0,
        });
      });
      const empCompletionsAcc = new Map<string, { sumPct: number; count: number }>();
      (notifs || []).forEach((n: any) => {
        // Match by email since admin_notifications does not store user_id directly here
        const entry = Array.from(empMap.entries()).find(([, v]) => v.email === n.employee_email);
        if (!entry) return;
        const [uid, v] = entry;
        v.completions += 1;
        v.minutes += n.time_spent_minutes || 0;
        v.xp += n.xp_earned || 0;
        const pct = n.max_score > 0 ? (n.score / n.max_score) * 100 : 0;
        const acc = empCompletionsAcc.get(uid) || { sumPct: 0, count: 0 };
        acc.sumPct += pct; acc.count += 1;
        empCompletionsAcc.set(uid, acc);
      });
      empCompletionsAcc.forEach((acc, uid) => {
        const v = empMap.get(uid);
        if (v) v.avgPct = acc.count > 0 ? Math.round(acc.sumPct / acc.count) : 0;
      });
      companyCerts.forEach((c: any) => {
        const v = empMap.get(c.user_id);
        if (v) v.certs += 1;
      });

      // --- PDF generation ---
      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 16;
      let y = 20;

      const ensure = (need: number) => {
        if (y + need > pageH - 25) { doc.addPage(); y = 20; }
      };
      const section = (title: string) => {
        ensure(18);
        doc.setFillColor(20, 50, 90);
        doc.rect(margin, y - 5, pageW - margin * 2, 9, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 3, y + 1);
        doc.setTextColor(0, 0, 0);
        y += 12;
      };

      // === COVER ===
      doc.setFillColor(20, 50, 90);
      doc.rect(0, 0, pageW, 60, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORT FINALE FORMATIVO', pageW / 2, 28, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Documento riepilogativo per il Datore di Lavoro', pageW / 2, 38, { align: 'center' });
      doc.text('D.Lgs. 81/2008 — Formazione Sicurezza sul Lavoro', pageW / 2, 46, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      y = 80;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(companyName, margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (companyVat) { doc.text(`P.IVA: ${companyVat}`, margin, y); y += 6; }
      if (ownerName) { doc.text(`Datore di Lavoro: ${ownerName}`, margin, y); y += 6; }
      doc.text(`Data emissione: ${new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, y);
      y += 14;

      // === KPI ===
      section('Indicatori di Sintesi');
      doc.setFontSize(10);
      const kpis: [string, string][] = [
        ['Dipendenti coinvolti', String(totalEmployees)],
        ['Moduli completati (totale)', String(totalCompletions)],
        ['Ore di formazione erogate', `${totalHours} h`],
        ['Punteggio medio', `${avgScore}%`],
        ['Certificati emessi', String(companyCerts.length)],
      ];
      kpis.forEach(([k, v]) => {
        ensure(7);
        doc.setFont('helvetica', 'normal');
        doc.text(k, margin + 2, y);
        doc.setFont('helvetica', 'bold');
        doc.text(v, pageW - margin - 2, y, { align: 'right' });
        y += 7;
      });
      y += 4;

      // === PER-EMPLOYEE ===
      section('Riepilogo per Dipendente');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(235, 235, 240);
      doc.rect(margin, y - 4, pageW - margin * 2, 7, 'F');
      const eCols = [margin + 1, margin + 60, margin + 95, margin + 120, margin + 145, margin + 170];
      doc.text('Dipendente', eCols[0], y);
      doc.text('Moduli', eCols[1], y);
      doc.text('Media %', eCols[2], y);
      doc.text('Minuti', eCols[3], y);
      doc.text('XP', eCols[4], y);
      doc.text('Certif.', eCols[5], y);
      y += 7;

      doc.setFont('helvetica', 'normal');
      Array.from(empMap.values())
        .sort((a, b) => b.completions - a.completions)
        .forEach(v => {
          ensure(6);
          const nm = v.name.length > 28 ? v.name.slice(0, 26) + '…' : v.name;
          doc.text(nm, eCols[0], y);
          doc.text(String(v.completions), eCols[1], y);
          doc.text(`${v.avgPct}%`, eCols[2], y);
          doc.text(String(v.minutes), eCols[3], y);
          doc.text(String(v.xp), eCols[4], y);
          doc.text(String(v.certs), eCols[5], y);
          y += 6;
        });
      y += 6;

      // === MANDATORY MODULES COMPLIANCE ===
      if (mandatoryModules && mandatoryModules.length > 0) {
        section('Stato Conformità — Moduli Obbligatori');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(235, 235, 240);
        doc.rect(margin, y - 4, pageW - margin * 2, 7, 'F');
        doc.text('Modulo', margin + 1, y);
        doc.text('Completati', margin + 110, y);
        doc.text('Mancanti', margin + 145, y);
        doc.text('% Copertura', margin + 170, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        mandatoryModules.forEach((m: any) => {
          ensure(6);
          const compNames = new Set(
            (notifs || []).filter((n: any) => n.module_title === m.module_title).map((n: any) => n.employee_email)
          );
          const done = Array.from(empMap.values()).filter(v => compNames.has(v.email)).length;
          const missing = Math.max(0, totalEmployees - done);
          const pct = totalEmployees > 0 ? Math.round((done / totalEmployees) * 100) : 0;
          const t = m.module_title.length > 50 ? m.module_title.slice(0, 48) + '…' : m.module_title;
          doc.text(t, margin + 1, y);
          doc.text(String(done), margin + 110, y);
          doc.text(String(missing), margin + 145, y);
          doc.text(`${pct}%`, margin + 170, y);
          y += 6;
        });
        y += 6;
      }

      // === CERTIFICATES ===
      if (companyCerts.length > 0) {
        section('Certificati Emessi');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(235, 235, 240);
        doc.rect(margin, y - 4, pageW - margin * 2, 7, 'F');
        doc.text('Dipendente', margin + 1, y);
        doc.text('Percorso/Scenario', margin + 65, y);
        doc.text('Punt.', margin + 140, y);
        doc.text('Data', margin + 160, y);
        doc.text('Codice', margin + 180, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        companyCerts.forEach((c: any) => {
          ensure(6);
          const nm = (c.profiles?.full_name || c.profiles?.email || 'N/D').slice(0, 30);
          const sc = String(c.scenario).slice(0, 32);
          const date = new Date(c.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
          doc.text(nm, margin + 1, y);
          doc.text(sc, margin + 65, y);
          doc.text(String(c.score ?? '-'), margin + 140, y);
          doc.text(date, margin + 160, y);
          doc.text(String(c.certificate_code || '').slice(0, 12), margin + 180, y);
          y += 6;
        });
        y += 6;
      }

      // === SIGNATURE BLOCK ===
      ensure(50);
      section('Attestazione e Firma');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const declaration =
        `Il sottoscritto Datore di Lavoro dichiara di aver preso visione del presente report ` +
        `relativo all'attività formativa svolta in materia di salute e sicurezza sul lavoro ` +
        `(D.Lgs. 81/2008) presso ${companyName}, e ne conferma la veridicità ai fini documentali.`;
      const lines = doc.splitTextToSize(declaration, pageW - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 16;

      doc.setDrawColor(120, 120, 120);
      doc.line(margin, y, margin + 70, y);
      doc.line(pageW - margin - 70, y, pageW - margin, y);
      y += 5;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Luogo e Data', margin, y);
      doc.text('Firma del Datore di Lavoro', pageW - margin - 70, y);

      // Footer
      const total = doc.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `${companyName} — Report Finale Formativo — Pagina ${i} di ${total}`,
          pageW / 2,
          pageH - 10,
          { align: 'center' }
        );
      }

      doc.save(`report-finale-${companyName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('Report Finale generato con successo');
    } catch (err) {
      console.error('FinalTrainingReport error:', err);
      toast.error('Errore nella generazione del Report Finale');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button onClick={generate} disabled={generating} variant="default" size="sm">
      {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileCheck2 className="w-4 h-4 mr-2" />}
      Report Finale (Datore di Lavoro)
    </Button>
  );
};
