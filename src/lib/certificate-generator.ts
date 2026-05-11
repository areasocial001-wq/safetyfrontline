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
}

export const generateCertificatePDF = async (data: CertificateData) => {
  // Default customization values
  const template = data.template || 'formale';
  const themeColor = data.themeColor || '#3B82F6';
  const font = data.font || 'helvetica';
  const textLayout = data.textLayout || 'centered';
  const logoPosition = data.logoPosition || 'top-left';
  
  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 59, g: 130, b: 246 };
  };
  
  const rgb = hexToRgb(themeColor);
  
  const useTemplate = template !== 'personalizzato';
  // Generate unique certificate code
  const certificateCode = `CERT-${data.scenario.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  // Create verification hash
  const verificationData = `${certificateCode}-${data.userName}-${data.scenario}-${data.score}`;
  const verificationHash = btoa(verificationData);
  
  // Generate QR code with verification URL
  const verificationUrl = `${window.location.origin}/verify-certificate?code=${certificateCode}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 150,
    margin: 1,
    color: {
      dark: '#1a1a1a',
      light: '#ffffff',
    },
  });

  // Create PDF
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Prepare logo data URL if provided
  let logoDataUrl: string | undefined;
  if (data.companyLogoUrl) {
    try {
      const response = await fetch(data.companyLogoUrl);
      const blob = await response.blob();
      logoDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading company logo:', error);
    }
  }

  // Template data for rendering
  const templateData: TemplateData = {
    pageWidth,
    pageHeight,
    userName: data.userName,
    companyName: data.companyName,
    moduleName: data.moduleName,
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

  // Use template or custom rendering
  if (useTemplate && certificateTemplates[template]) {
    certificateTemplates[template].renderTemplate(pdf, templateData, rgb);
  } else {
    // Custom/personalized template rendering (existing code)
    // Background gradient effect (simulated with rectangles)
    pdf.setFillColor(245, 247, 250);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    pdf.rect(0, 0, pageWidth, 15, 'F');
    pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');

    // Border
    pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
    pdf.setLineWidth(1);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Logo area - position based on settings
    const getLogoPosition = () => {
      switch (logoPosition) {
        case 'top-left':
          return { x: 15, y: 20 };
        case 'top-right':
          return { x: pageWidth - 55, y: 20 };
        case 'top-center':
          return { x: pageWidth / 2 - 20, y: 20 };
        default:
          return { x: 15, y: 20 };
      }
    };
    
    const logoPos = getLogoPosition();
    
    if (logoDataUrl) {
      // Add logo with white background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(logoPos.x, logoPos.y, 40, 20, 'F');
      pdf.addImage(logoDataUrl, 'PNG', logoPos.x + 2, logoPos.y + 2, 36, 16, undefined, 'FAST');
    } else {
      // Default logo placeholder
      pdf.setFillColor(255, 255, 255);
      pdf.rect(logoPos.x, logoPos.y, 40, 15, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(rgb.r, rgb.g, rgb.b);
      pdf.setFont(font, 'bold');
      pdf.text('SAFETY', logoPos.x + 20, logoPos.y + 8, { align: 'center' });
      pdf.text('FRONTLINE', logoPos.x + 20, logoPos.y + 14, { align: 'center' });
    }

    // Text alignment based on layout
    const textAlign = textLayout === 'left-aligned' ? 'left' : 'center';
    const baseX = textLayout === 'left-aligned' ? 40 : pageWidth / 2;
    
    // Certificate title
    pdf.setFontSize(32);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(font, 'bold');
    pdf.text('CERTIFICATO DI COMPLETAMENTO', baseX, 50, { align: textAlign });

    // Subtitle
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont(font, 'normal');
    pdf.text('Questo certifica che', baseX, 65, { align: textAlign });

    // User name
    pdf.setFontSize(24);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(font, 'bold');
    pdf.text(data.userName, baseX, 80, { align: textAlign });

    // Company name
    if (data.companyName) {
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont(font, 'italic');
      pdf.text(data.companyName, baseX, 90, { align: textAlign });
    }

    // Module completion text
    pdf.setFontSize(12);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(font, 'normal');
    pdf.text('ha completato con successo il modulo formativo', baseX, 102, { align: textAlign });
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text('Verifica della Ricaduta sulla', baseX, 108, { align: textAlign });

    // Module name
    pdf.setFontSize(18);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(font, 'bold');
    pdf.text(data.moduleName, baseX, 118, { align: textAlign });

    // Score and completions
    pdf.setFontSize(12);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(font, 'normal');
    pdf.text(
      `Punteggio Migliore: ${data.score}% • Completamenti: ${data.completions}`,
      baseX,
      125,
      { align: textAlign }
    );

    // Date
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Data di emissione: ${data.date}`, baseX, 135, { align: textAlign });

    // Certificate code
    pdf.setFontSize(10);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(font, 'bold');
    pdf.text(`Codice Certificato: ${certificateCode}`, baseX, 145, { align: textAlign });

    // QR Code
    pdf.addImage(qrCodeDataUrl, 'PNG', pageWidth / 2 - 20, 155, 40, 40);
    
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Scansiona per verificare l\'autenticità', pageWidth / 2, 200, { align: 'center' });

    // Signature line
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.line(pageWidth - 80, pageHeight - 35, pageWidth - 30, pageHeight - 35);
    
    pdf.setFontSize(10);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Firma Digitale Verificata', pageWidth - 55, pageHeight - 30, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Safety Frontline Platform', pageWidth - 55, pageHeight - 25, { align: 'center' });
  }

  // Save certificate record to database via secure RPC
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

  // Save PDF
  pdf.save(`Certificato_${data.moduleName.replace(/\s+/g, '_')}_${certificateCode}.pdf`);
  
  return certificateCode;
};

// Export function to generate PDF as blob for batch operations
export const generateCertificatePDFBlob = async (data: Omit<CertificateData, 'scenario'> & { scenario: string }) => {
  // Generate unique certificate code
  const certificateCode = `CERT-${data.scenario.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  // Create verification hash
  const verificationData = `${certificateCode}-${data.userName}-${data.scenario}-${data.score}`;
  const verificationHash = btoa(verificationData);
  
  // Generate QR code with verification URL
  const verificationUrl = `${window.location.origin}/verify-certificate?code=${certificateCode}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 150,
    margin: 1,
    color: {
      dark: '#1a1a1a',
      light: '#ffffff',
    },
  });

  // Default customization values
  const template = data.template || 'formale';
  const themeColor = data.themeColor || '#3B82F6';
  const font = data.font || 'helvetica';
  const textLayout = data.textLayout || 'centered';
  const logoPosition = data.logoPosition || 'top-left';
  
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 59, g: 130, b: 246 };
  };
  
  const rgb = hexToRgb(themeColor);
  const useTemplate = template !== 'personalizzato';

  // Create PDF
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Prepare logo data URL if provided
  let logoDataUrl: string | undefined;
  if (data.companyLogoUrl) {
    try {
      const response = await fetch(data.companyLogoUrl);
      const blob = await response.blob();
      logoDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading company logo:', error);
    }
  }

  const templateData: TemplateData = {
    pageWidth,
    pageHeight,
    userName: data.userName,
    companyName: data.companyName,
    moduleName: data.moduleName,
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

  if (useTemplate && certificateTemplates[template]) {
    certificateTemplates[template].renderTemplate(pdf, templateData, rgb);
  } else {
    // Custom template rendering (same as main function)
    pdf.setFillColor(245, 247, 250);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    pdf.rect(0, 0, pageWidth, 15, 'F');
    pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');

    pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
    pdf.setLineWidth(1);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

    const getLogoPosition = () => {
      switch (logoPosition) {
        case 'top-left': return { x: 15, y: 20 };
        case 'top-right': return { x: pageWidth - 55, y: 20 };
        case 'top-center': return { x: pageWidth / 2 - 20, y: 20 };
        default: return { x: 15, y: 20 };
      }
    };
    
    const logoPos = getLogoPosition();
    
    if (logoDataUrl) {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(logoPos.x, logoPos.y, 40, 20, 'F');
      pdf.addImage(logoDataUrl, 'PNG', logoPos.x + 2, logoPos.y + 2, 36, 16, undefined, 'FAST');
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
    const baseX = textLayout === 'left-aligned' ? 40 : pageWidth / 2;
    
    pdf.setFontSize(32);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(font, 'bold');
    pdf.text('CERTIFICATO DI COMPLETAMENTO', baseX, 50, { align: textAlign });

    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont(font, 'normal');
    pdf.text('Questo certifica che', baseX, 65, { align: textAlign });

    pdf.setFontSize(24);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(font, 'bold');
    pdf.text(data.userName, baseX, 80, { align: textAlign });

    if (data.companyName) {
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont(font, 'italic');
      pdf.text(data.companyName, baseX, 90, { align: textAlign });
    }

    pdf.setFontSize(12);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(font, 'normal');
    pdf.text('ha completato con successo il modulo formativo', baseX, 102, { align: textAlign });
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text('Verifica della Ricaduta sulla', baseX, 108, { align: textAlign });

    pdf.setFontSize(18);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(font, 'bold');
    pdf.text(data.moduleName, baseX, 118, { align: textAlign });

    pdf.setFontSize(12);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(font, 'normal');
    pdf.text(
      `Punteggio Migliore: ${data.score}% • Completamenti: ${data.completions}`,
      baseX,
      125,
      { align: textAlign }
    );

    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Data di emissione: ${data.date}`, baseX, 135, { align: textAlign });

    pdf.setFontSize(10);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(font, 'bold');
    pdf.text(`Codice Certificato: ${certificateCode}`, baseX, 145, { align: textAlign });

    pdf.addImage(qrCodeDataUrl, 'PNG', pageWidth / 2 - 20, 155, 40, 40);
    
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Scansiona per verificare l\'autenticità', pageWidth / 2, 200, { align: 'center' });

    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.line(pageWidth - 80, pageHeight - 35, pageWidth - 30, pageHeight - 35);
    
    pdf.setFontSize(10);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Firma Digitale Verificata', pageWidth - 55, pageHeight - 30, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Safety Frontline Platform', pageWidth - 55, pageHeight - 25, { align: 'center' });
  }

  // Return PDF as blob
  return pdf.output('blob');
};
