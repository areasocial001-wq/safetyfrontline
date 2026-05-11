import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';

export interface PathCertificateData {
  userName: string;
  companyName: string;
  pathId: string;
  pathTitle: string;
  pathSubtitle: string;
  normativeRef: string;
  hours: string;
  score: number;
  totalTimeMinutes: number;
  completedModules: { title: string; score: number }[];
  date: string;
}

const PATH_COLORS: Record<string, { primary: [number, number, number]; accent: [number, number, number] }> = {
  rspp: { primary: [220, 38, 38], accent: [239, 68, 68] },
  rls: { primary: [59, 130, 246], accent: [96, 165, 250] },
  preposto: { primary: [124, 58, 237], accent: [167, 139, 250] },
  antincendio: { primary: [234, 88, 12], accent: [251, 146, 60] },
  primo_soccorso: { primary: [16, 185, 129], accent: [52, 211, 153] },
  lavoratori: { primary: [255, 103, 31], accent: [255, 153, 102] },
  cybersecurity: { primary: [6, 182, 212], accent: [34, 211, 238] },
};

export const generatePathCertificatePDF = async (data: PathCertificateData) => {
  const certificateCode = `SF-${data.pathId.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const verificationHash = btoa(`${certificateCode}-${data.userName}-${data.pathId}-${data.score}`);
  const verificationUrl = `${window.location.origin}/verify-certificate?code=${certificateCode}`;

  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 150,
    margin: 1,
    color: { dark: '#1a1a1a', light: '#ffffff' },
  });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();
  const colors = PATH_COLORS[data.pathId] || PATH_COLORS.lavoratori;

  // Background
  pdf.setFillColor(250, 251, 252);
  pdf.rect(0, 0, w, h, 'F');

  // Top accent bar
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, w, 8, 'F');

  // Bottom accent bar
  pdf.setFillColor(...colors.accent);
  pdf.rect(0, h - 8, w, 8, 'F');

  // Border
  pdf.setDrawColor(...colors.primary);
  pdf.setLineWidth(0.8);
  pdf.rect(12, 12, w - 24, h - 24);

  // Inner border
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.3);
  pdf.rect(15, 15, w - 30, h - 30);

  // Logo
  pdf.setFontSize(11);
  pdf.setTextColor(...colors.primary);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SAFETY FRONTLINE', 25, 28);
  pdf.setFontSize(7);
  pdf.setTextColor(120, 120, 120);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Piattaforma Formazione Sicurezza', 25, 33);

  // Compliance
  pdf.setFontSize(8);
  pdf.setTextColor(34, 197, 94);
  pdf.setFont('helvetica', 'bold');
  pdf.text('✓ Conforme D.Lgs 81/08', w - 25, 28, { align: 'right' });
  pdf.text(`✓ ${data.normativeRef}`, w - 25, 33, { align: 'right' });

  // Title
  pdf.setFontSize(28);
  pdf.setTextColor(26, 26, 26);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ATTESTATO DI FORMAZIONE', w / 2, 52, { align: 'center' });

  pdf.setFontSize(14);
  pdf.setTextColor(...colors.primary);
  pdf.text(data.pathTitle.toUpperCase(), w / 2, 62, { align: 'center' });

  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`(${data.pathSubtitle} - Durata ${data.hours})`, w / 2, 69, { align: 'center' });

  // Separator
  pdf.setDrawColor(...colors.primary);
  pdf.setLineWidth(0.5);
  pdf.line(w / 2 - 40, 73, w / 2 + 40, 73);

  // Certifies
  pdf.setFontSize(11);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Si certifica che', w / 2, 82, { align: 'center' });

  // Name
  pdf.setFontSize(22);
  pdf.setTextColor(26, 26, 26);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.userName.toUpperCase(), w / 2, 93, { align: 'center' });

  // Company
  let yAfterName = 101;
  if (data.companyName) {
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'italic');
    pdf.text(data.companyName, w / 2, yAfterName, { align: 'center' });
    yAfterName += 9;
  } else {
    yAfterName += 3;
  }

  // Completion
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`ha completato con successo il percorso formativo "${data.pathTitle}"`, w / 2, yAfterName, { align: 'center' });
  pdf.text('superando tutti i moduli previsti:', w / 2, yAfterName + 6, { align: 'center' });

  // Modules - two columns if many
  let yMod = yAfterName + 14;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  const cols = data.completedModules.length > 4 ? 2 : 1;
  const colWidth = cols === 2 ? (w - 80) / 2 : w;
  
  data.completedModules.forEach((mod, i) => {
    const col = cols === 2 ? i % 2 : 0;
    const row = cols === 2 ? Math.floor(i / 2) : i;
    const xBase = cols === 2 ? (col === 0 ? 60 : 60 + colWidth) : w / 2 - 50;
    const yPos = yMod + row * 5;
    
    pdf.setTextColor(34, 197, 94);
    pdf.text('✓', xBase, yPos);
    pdf.setTextColor(60, 60, 60);
    pdf.text(`${mod.title} (${mod.score}%)`, xBase + 6, yPos);
  });

  const totalRows = cols === 2 ? Math.ceil(data.completedModules.length / 2) : data.completedModules.length;
  yMod += totalRows * 5 + 5;

  // Stats
  pdf.setFontSize(10);
  pdf.setTextColor(26, 26, 26);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Punteggio medio: ${data.score}%  •  Tempo totale: ${data.totalTimeMinutes} minuti`, w / 2, yMod, { align: 'center' });

  // Date
  yMod += 8;
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Data di emissione: ${data.date}`, w / 2, yMod, { align: 'center' });

  // Code
  yMod += 6;
  pdf.setFontSize(8);
  pdf.setTextColor(...colors.primary);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Codice Attestato: ${certificateCode}`, w / 2, yMod, { align: 'center' });

  // QR
  pdf.addImage(qrCodeDataUrl, 'PNG', w / 2 - 15, h - 55, 30, 30);
  pdf.setFontSize(7);
  pdf.setTextColor(120, 120, 120);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Scansiona per verificare', w / 2, h - 22, { align: 'center' });

  // Signature
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.3);
  pdf.line(w - 80, h - 35, w - 30, h - 35);
  pdf.setFontSize(8);
  pdf.setTextColor(60, 60, 60);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Firma Digitale Verificata', w - 55, h - 31, { align: 'center' });
  pdf.setFontSize(7);
  pdf.text('Safety Frontline Platform', w - 55, h - 27, { align: 'center' });

  // Save to DB via secure RPC
  const { data: authUser } = await supabase.auth.getUser();
  if (authUser.user) {
    await supabase.rpc('issue_certificate', {
      _scenario: `percorso_${data.pathId}`,
      _score: data.score,
      _certificate_code: certificateCode,
      _verification_hash: verificationHash,
      _completions: 1,
    });
  }

  pdf.save(`Attestato_${data.pathTitle.replace(/\s+/g, '_')}_${certificateCode}.pdf`);
  return certificateCode;
};
