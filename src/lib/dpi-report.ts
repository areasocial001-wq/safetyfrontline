import jsPDF from 'jspdf';

export interface DPIReportData {
  scenarioTitle: string;
  scenarioId: string;
  userName?: string;
  companyName?: string;
  season: string;
  hivis: string;
  totalSeconds: number;
  mistakes: number;
  score: number; // 0-100
  sequence: { key: string; label: string; normativa?: string }[];
  events: { tsSeconds: number; type: 'ok' | 'ko'; label: string; note?: string }[];
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function exportDpiReportCsv(data: DPIReportData): Blob {
  const rows: string[] = [];
  const esc = (v: string | number | undefined) =>
    `"${String(v ?? '').replace(/"/g, '""')}"`;

  rows.push('SicurAzienda — Report Vestizione DPI');
  rows.push(`Scenario,${esc(data.scenarioTitle)}`);
  rows.push(`Utente,${esc(data.userName || '-')}`);
  rows.push(`Azienda,${esc(data.companyName || '-')}`);
  rows.push(`Variante stagionale,${esc(data.season)}`);
  rows.push(`Colore hi-vis,${esc(data.hivis)}`);
  rows.push(`Tempo totale,${esc(fmtTime(data.totalSeconds))}`);
  rows.push(`Errori,${esc(data.mistakes)}`);
  rows.push(`Punteggio,${esc(data.score + '/100')}`);
  rows.push('');
  rows.push('Sequenza DPI prevista');
  rows.push('Ordine,DPI,Normativa');
  data.sequence.forEach((d, i) => rows.push(`${i + 1},${esc(d.label)},${esc(d.normativa || '')}`));
  rows.push('');
  rows.push('Eventi registrati');
  rows.push('Tempo,Esito,DPI,Note');
  data.events.forEach(e =>
    rows.push(`${fmtTime(e.tsSeconds)},${e.type === 'ok' ? 'OK' : 'KO'},${esc(e.label)},${esc(e.note || '')}`),
  );

  return new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
}

const BORDEAUX: [number, number, number] = [107, 22, 34];
const GREEN: [number, number, number] = [31, 122, 58];

export function exportDpiReportPdf(data: DPIReportData): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  let y = 14;

  doc.setFillColor(...BORDEAUX);
  doc.rect(0, 0, W, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SicurAzienda — Report Vestizione DPI', 12, 14);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Documento di audit per DVR e formazione D.Lgs. 81/08', 12, 19);

  y = 30;
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(data.scenarioTitle, 12, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const meta: [string, string][] = [
    ['Utente', data.userName || '-'],
    ['Azienda', data.companyName || '-'],
    ['Variante stagionale', data.season],
    ['Colore hi-vis', data.hivis],
    ['Tempo totale', fmtTime(data.totalSeconds)],
    ['Errori', String(data.mistakes)],
    ['Punteggio', `${data.score}/100`],
    ['Data', new Date().toLocaleString('it-IT')],
  ];
  meta.forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${k}:`, 12, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(v), 55, y);
    y += 5;
  });

  y += 4;
  doc.setFillColor(...GREEN);
  doc.rect(12, y - 4, W - 24, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Sequenza DPI prevista', 14, y);
  y += 6;
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'normal');
  data.sequence.forEach((d, i) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(`${i + 1}. ${d.label}${d.normativa ? `  —  ${d.normativa}` : ''}`, 16, y);
    y += 5;
  });

  y += 4;
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFillColor(...BORDEAUX);
  doc.rect(12, y - 4, W - 24, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Eventi registrati', 14, y);
  y += 6;
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'normal');
  data.events.forEach(e => {
    if (y > 280) { doc.addPage(); y = 20; }
    const line = `${fmtTime(e.tsSeconds)}  ${e.type === 'ok' ? '✓' : '✗'}  ${e.label}${e.note ? ` — ${e.note}` : ''}`;
    doc.text(line, 16, y);
    y += 5;
  });

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('SicurAzienda • Generato automaticamente • Conservare ai fini DVR.', 12, 290);

  return doc.output('blob');
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
