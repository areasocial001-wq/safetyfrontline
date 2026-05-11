import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';
import { certificateTemplates, type TemplateData } from './certificate-templates';

interface CertificateData {
  userName: string;
  companyName: string;
  moduleName: string;
  scenario: string;
  score: number;
  completions: number;
  date: string;
  companyLogoUrl?: string | null;
  template?: string;
  themeColor?: string;
  font?: string;
  textLayout?: string;
  logoPosition?: string;
  modulePrefix?: string;
  orientation?: 'portrait' | 'landscape';
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 59, g: 130, b: 246 };
};

const loadLogo = async (url?: string | null): Promise<string | undefined> => {
  if (!url) return undefined;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading company logo:', error);
    return undefined;
  }
};

const renderCustomTemplate = (
  pdf: jsPDF,
  data: TemplateData,
  rgb: { r: number; g: number; b: number }
) => {
  const { pageWidth, pageHeight, font, textLayout } = data;

  pdf.setFillColor(245, 247, 250);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  pdf.setFillColor(rgb.r, rgb.g, rgb.b);
  pdf.rect(0, 0, pageWidth, 14, 'F');
  pdf.rect(0, pageHeight - 14, pageWidth, 14, 'F');
  pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
  pdf.setLineWidth(1);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Logo
  const logoPos = (() => {
    switch (data.logoPosition) {
      case 'top-right': return { x: pageWidth - 60, y: 22 };
      case 'top-center': return { x: pageWidth / 2 - 20, y: 22 };
      default: return { x: 20, y: 22 };
    }
  })();

  if (data.logoDataUrl) {
    pdf.setFillColor(255, 255, 255);
    pdf.rect(logoPos.x, logoPos.y, 40, 20, 'F');
    pdf.addImage(data.logoDataUrl, 'PNG', logoPos.x + 2, logoPos.y + 2, 36, 16, undefined, 'FAST');
  } else {
    pdf.setFillColor(255, 255, 255);
    pdf.rect(logoPos.x, logoPos.y, 40, 15, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(font, 'bold');
    pdf.text('SAFETY', logoPos.x + 20, logoPos.y + 8, { align: 'center' });
    pdf.text('FRONTLINE', logoPos.x + 20, logoPos.y + 14, { align: 'center' });
  }

  const textAlign = textLayout === 'left-aligned' ? 'left' : 'center';
  const baseX = textLayout === 'left-aligned' ? 30 : pageWidth / 2;

  pdf.setFontSize(26);
  pdf.setTextColor(26, 26, 26);
  pdf.setFont(font, 'bold');
  pdf.text('CERTIFICATO DI COMPLETAMENTO', baseX, 70, { align: textAlign, maxWidth: pageWidth - 40 });

  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont(font, 'normal');
  pdf.text('Si certifica che', baseX, 90, { align: textAlign });

  pdf.setFontSize(22);
  pdf.setTextColor(rgb.r, rgb.g, rgb.b);
  pdf.setFont(font, 'bold');
  pdf.text(data.userName, baseX, 105, { align: textAlign });

  if (data.companyName) {
    pdf.setFontSize(13);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont(font, 'italic');
    pdf.text(data.companyName, baseX, 115, { align: textAlign });
  }

  pdf.setFontSize(11);
  pdf.setTextColor(26, 26, 26);
  pdf.setFont(font, 'normal');
  pdf.text('ha completato con successo la', baseX, 132, { align: textAlign });

  if (data.modulePrefix) {
    pdf.setFontSize(11);
    pdf.setTextColor(120, 120, 120);
    pdf.text(data.modulePrefix, baseX, 141, { align: textAlign });
  }

  pdf.setFontSize(18);
  pdf.setTextColor(rgb.r, rgb.g, rgb.b);
  pdf.setFont(font, 'bold');
  pdf.text(data.moduleName, baseX, 152, { align: textAlign, maxWidth: pageWidth - 50 });

  pdf.setFontSize(12);
  pdf.setTextColor(26, 26, 26);
  pdf.setFont(font, 'normal');
  pdf.text(`Punteggio: ${data.score}% • Completamenti: ${data.completions}`, baseX, 170, { align: textAlign });

  pdf.setFontSize(11);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Data di emissione: ${data.date}`, baseX, 180, { align: textAlign });

  pdf.setFontSize(10);
  pdf.setTextColor(rgb.r, rgb.g, rgb.b);
  pdf.setFont(font, 'bold');
  pdf.text(`Codice: ${data.certificateCode}`, baseX, 190, { align: textAlign });

  // QR bottom-left
  const qrX = 22;
  const qrY = pageHeight - 55;
  pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
  pdf.rect(qrX - 1, qrY - 1, 32, 32);
  pdf.addImage(data.qrCodeDataUrl, 'PNG', qrX, qrY, 30, 30);
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Verifica online', qrX + 15, qrY + 36, { align: 'center' });

  // Signature bottom-right
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth - 75, pageHeight - 35, pageWidth - 25, pageHeight - 35);
  pdf.setFontSize(10);
  pdf.setTextColor(26, 26, 26);
  pdf.setFont(font, 'italic');
  pdf.text('Firma Digitale Verificata', pageWidth - 50, pageHeight - 30, { align: 'center' });
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Safety Frontline Platform', pageWidth - 50, pageHeight - 25, { align: 'center' });
};

const buildPdf = async (data: CertificateData, certificateCode: string) => {
  const template = data.template || 'formale';
  const themeColor = data.themeColor || '#3B82F6';
  const font = data.font || 'helvetica';
  const textLayout = data.textLayout || 'centered';
  const logoPosition = data.logoPosition || 'top-left';
  const modulePrefix = data.modulePrefix ?? 'Verifica della Ricaduta sulla';
  const orientation = data.orientation || 'portrait';
  const rgb = hexToRgb(themeColor);

  const verificationUrl = `${window.location.origin}/verify-certificate?code=${certificateCode}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 150,
    margin: 1,
    color: { dark: '#1a1a1a', light: '#ffffff' },
  });

  const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const logoDataUrl = await loadLogo(data.companyLogoUrl);

  const templateData: TemplateData = {
    pageWidth,
    pageHeight,
    userName: data.userName,
    companyName: data.companyName,
    moduleName: data.moduleName,
    modulePrefix,
    score: data.score,
    completions: data.completions,
    date: data.date,
    certificateCode,
    qrCodeDataUrl,
    logoDataUrl,
    logoPosition,
    font,
    textLayout,
  };

  if (template !== 'personalizzato' && certificateTemplates[template]) {
    certificateTemplates[template].renderTemplate(pdf, templateData, rgb);
  } else {
    renderCustomTemplate(pdf, templateData, rgb);
  }

  return pdf;
};

export const generateCertificatePDF = async (data: CertificateData) => {
  const certificateCode = `CERT-${data.scenario.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const verificationHash = btoa(`${certificateCode}-${data.userName}-${data.scenario}-${data.score}`);

  const pdf = await buildPdf(data, certificateCode);

  const { data: user } = await supabase.auth.getUser();
  if (user.user) {
    await supabase.rpc('issue_certificate', {
      _scenario: data.scenario,
      _score: data.score,
      _certificate_code: certificateCode,
      _verification_hash: verificationHash,
      _completions: data.completions,
    });
  }

  pdf.save(`Certificato_${data.moduleName.replace(/\s+/g, '_')}_${certificateCode}.pdf`);
  return certificateCode;
};

export const generateCertificatePDFBlob = async (
  data: Omit<CertificateData, 'scenario'> & { scenario: string }
) => {
  const certificateCode = `CERT-${data.scenario.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const pdf = await buildPdf(data, certificateCode);
  return pdf.output('blob');
};
