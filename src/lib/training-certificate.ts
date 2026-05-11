import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';

interface TrainingCertificateData {
  userName: string;
  companyName: string;
  score: number;
  totalTimeMinutes: number;
  completedModules: string[];
  date: string;
}

export const generateTrainingCertificatePDF = async (data: TrainingCertificateData) => {
  const certificateCode = `FLAV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const verificationHash = btoa(`${certificateCode}-${data.userName}-${data.score}`);
  const verificationUrl = `${window.location.origin}/verify-certificate?code=${certificateCode}`;
  
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 150,
    margin: 1,
    color: { dark: '#1a1a1a', light: '#ffffff' },
  });

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  // Background
  pdf.setFillColor(250, 251, 252);
  pdf.rect(0, 0, w, h, 'F');

  // Top accent bar
  pdf.setFillColor(255, 103, 31); // primary orange
  pdf.rect(0, 0, w, 8, 'F');

  // Bottom accent bar
  pdf.setFillColor(34, 197, 94); // green accent
  pdf.rect(0, h - 8, w, 8, 'F');

  // Border
  pdf.setDrawColor(255, 103, 31);
  pdf.setLineWidth(0.8);
  pdf.rect(12, 12, w - 24, h - 24);

  // Inner border
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.3);
  pdf.rect(15, 15, w - 30, h - 30);

  // Logo text
  pdf.setFontSize(11);
  pdf.setTextColor(255, 103, 31);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SAFETY FRONTLINE', 25, 28);
  pdf.setFontSize(7);
  pdf.setTextColor(120, 120, 120);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Piattaforma Formazione Sicurezza', 25, 33);

  // Compliance badge
  pdf.setFontSize(8);
  pdf.setTextColor(34, 197, 94);
  pdf.setFont('helvetica', 'bold');
  pdf.text('✓ Conforme D.Lgs 81/08', w - 25, 28, { align: 'right' });
  pdf.text('✓ Accordo Stato-Regioni 2025', w - 25, 33, { align: 'right' });

  // Title
  pdf.setFontSize(28);
  pdf.setTextColor(26, 26, 26);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ATTESTATO DI FORMAZIONE', w / 2, 52, { align: 'center' });

  pdf.setFontSize(14);
  pdf.setTextColor(255, 103, 31);
  pdf.text('Verifica della Ricaduta sulla', w / 2, 60, { align: 'center' });

  pdf.setFontSize(14);
  pdf.setTextColor(255, 103, 31);
  pdf.text('FORMAZIONE GENERALE LAVORATORI', w / 2, 68, { align: 'center' });

  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'normal');
  pdf.text('(Art. 37 D.Lgs 81/2008 - Durata 4 ore)', w / 2, 75, { align: 'center' });

  // Separator
  pdf.setDrawColor(255, 103, 31);
  pdf.setLineWidth(0.5);
  pdf.line(w / 2 - 40, 73, w / 2 + 40, 73);

  // "This certifies that"
  pdf.setFontSize(11);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Si certifica che', w / 2, 82, { align: 'center' });

  // User name
  pdf.setFontSize(22);
  pdf.setTextColor(26, 26, 26);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.userName.toUpperCase(), w / 2, 93, { align: 'center' });

  // Company
  if (data.companyName) {
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'italic');
    pdf.text(data.companyName, w / 2, 101, { align: 'center' });
  }

  // Completion text
  const yAfterName = data.companyName ? 112 : 106;
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  pdf.setFont('helvetica', 'normal');
  pdf.text('ha completato con successo il corso di Formazione Generale Lavoratori', w / 2, yAfterName, { align: 'center' });
  pdf.text('superando tutti i moduli formativi previsti:', w / 2, yAfterName + 6, { align: 'center' });

  // Module list
  let yMod = yAfterName + 15;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  data.completedModules.forEach((mod, i) => {
    pdf.setTextColor(34, 197, 94);
    pdf.text('✓', w / 2 - 50, yMod);
    pdf.setTextColor(60, 60, 60);
    pdf.text(`Modulo ${i + 1}: ${mod}`, w / 2 - 44, yMod);
    yMod += 5;
  });

  // Stats
  yMod += 5;
  pdf.setFontSize(10);
  pdf.setTextColor(26, 26, 26);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Punteggio complessivo: ${data.score}%  •  Tempo totale: ${data.totalTimeMinutes} minuti`, w / 2, yMod, { align: 'center' });

  // Date
  yMod += 8;
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Data di emissione: ${data.date}`, w / 2, yMod, { align: 'center' });

  // Certificate code
  yMod += 6;
  pdf.setFontSize(8);
  pdf.setTextColor(255, 103, 31);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Codice Attestato: ${certificateCode}`, w / 2, yMod, { align: 'center' });

  // QR Code
  pdf.addImage(qrCodeDataUrl, 'PNG', w / 2 - 15, h - 55, 30, 30);
  pdf.setFontSize(7);
  pdf.setTextColor(120, 120, 120);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Scansiona per verificare', w / 2, h - 22, { align: 'center' });

  // Signature line
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
      _scenario: 'formazione_generale',
      _score: data.score,
      _certificate_code: certificateCode,
      _verification_hash: verificationHash,
      _completions: 1,
    });
  }

  pdf.save(`Attestato_Formazione_Generale_${certificateCode}.pdf`);
  return certificateCode;
};
