import jsPDF from 'jspdf';

export interface TemplateConfig {
  name: string;
  description: string;
  renderTemplate: (pdf: jsPDF, data: TemplateData, rgb: RGB) => void;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface TemplateData {
  pageWidth: number;
  pageHeight: number;
  userName: string;
  companyName: string;
  moduleName: string;
  score: number;
  completions: number;
  date: string;
  certificateCode: string;
  qrCodeDataUrl: string;
  logoDataUrl?: string;
  logoPosition: string;
  font: string;
  textLayout: string;
}

const getLogoPosition = (logoPosition: string, pageWidth: number) => {
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

const renderLogo = (pdf: jsPDF, data: TemplateData, logoPos: { x: number; y: number }, rgb: RGB) => {
  if (data.logoDataUrl) {
    pdf.setFillColor(255, 255, 255);
    pdf.rect(logoPos.x, logoPos.y, 40, 20, 'F');
    pdf.addImage(data.logoDataUrl, 'PNG', logoPos.x + 2, logoPos.y + 2, 36, 16, undefined, 'FAST');
  } else {
    pdf.setFillColor(255, 255, 255);
    pdf.rect(logoPos.x, logoPos.y, 40, 15, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(data.font, 'bold');
    pdf.text('SAFETY', logoPos.x + 20, logoPos.y + 8, { align: 'center' });
    pdf.text('FRONTLINE', logoPos.x + 20, logoPos.y + 14, { align: 'center' });
  }
};

// Template Formale (Classico)
export const formaleTemplate: TemplateConfig = {
  name: 'Formale',
  description: 'Design classico e professionale, ideale per certificazioni ufficiali',
  renderTemplate: (pdf, data, rgb) => {
    const { pageWidth, pageHeight } = data;

    // Background
    pdf.setFillColor(245, 247, 250);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Top and bottom borders
    pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    pdf.rect(0, 0, pageWidth, 15, 'F');
    pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');

    // Main border
    pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
    pdf.setLineWidth(1);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Inner decorative border
    pdf.setLineWidth(0.3);
    pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Logo
    const logoPos = getLogoPosition(data.logoPosition, pageWidth);
    renderLogo(pdf, data, logoPos, rgb);

    // Content - centered
    const baseX = pageWidth / 2;
    
    pdf.setFontSize(32);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'bold');
    pdf.text('CERTIFICATO DI COMPLETAMENTO', baseX, 50, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont(data.font, 'normal');
    pdf.text('Questo certifica che', baseX, 65, { align: 'center' });

    pdf.setFontSize(24);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(data.font, 'bold');
    pdf.text(data.userName, baseX, 80, { align: 'center' });

    if (data.companyName) {
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont(data.font, 'italic');
      pdf.text(data.companyName, baseX, 90, { align: 'center' });
    }

    pdf.setFontSize(12);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'normal');
    pdf.text('ha completato con successo', baseX, 102, { align: 'center' });
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Verifica della Ricaduta sulla', baseX, 108, { align: 'center' });

    pdf.setFontSize(18);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(data.font, 'bold');
    pdf.text(data.moduleName, baseX, 118, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'normal');
    pdf.text(
      `Punteggio Migliore: ${data.score}% • Completamenti: ${data.completions}`,
      baseX,
      125,
      { align: 'center' }
    );

    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Data di emissione: ${data.date}`, baseX, 135, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(data.font, 'bold');
    pdf.text(`Codice Certificato: ${data.certificateCode}`, baseX, 145, { align: 'center' });

    // QR Code
    pdf.addImage(data.qrCodeDataUrl, 'PNG', baseX - 20, 155, 40, 40);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont(data.font, 'normal');
    pdf.text('Scansiona per verificare l\'autenticità', baseX, 200, { align: 'center' });

    // Signature line
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.line(pageWidth - 80, pageHeight - 35, pageWidth - 30, pageHeight - 35);
    pdf.setFontSize(10);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'italic');
    pdf.text('Firma Digitale Verificata', pageWidth - 55, pageHeight - 30, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Safety Frontline Platform', pageWidth - 55, pageHeight - 25, { align: 'center' });
  }
};

// Template Moderno
export const modernoTemplate: TemplateConfig = {
  name: 'Moderno',
  description: 'Design contemporaneo con elementi grafici dinamici',
  renderTemplate: (pdf, data, rgb) => {
    const { pageWidth, pageHeight } = data;

    // Gradient background simulation
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Geometric background elements
    pdf.setFillColor(rgb.r, rgb.g, rgb.b, 0.1);
    pdf.circle(pageWidth - 30, 30, 60, 'F');
    pdf.circle(30, pageHeight - 30, 50, 'F');
    
    // Diagonal stripe
    pdf.setFillColor(rgb.r, rgb.g, rgb.b, 0.05);
    pdf.setGState(pdf.GState({ opacity: 0.1 }));
    for (let i = 0; i < 10; i++) {
      pdf.rect(i * 40 - 20, 0, 15, pageHeight, 'F');
    }
    pdf.setGState(pdf.GState({ opacity: 1 }));

    // Top accent bar
    pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    pdf.rect(0, 0, pageWidth, 8, 'F');

    // Logo in modern card style
    const logoPos = getLogoPosition(data.logoPosition, pageWidth);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(logoPos.x - 2, logoPos.y - 2, 44, 24, 3, 3, 'FD');
    pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(logoPos.x - 2, logoPos.y - 2, 44, 24, 3, 3, 'D');
    renderLogo(pdf, data, logoPos, rgb);

    // Content with modern alignment
    const baseX = pageWidth / 2;
    
    // Badge style title
    pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    pdf.roundedRect(baseX - 80, 45, 160, 12, 2, 2, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont(data.font, 'bold');
    pdf.text('CERTIFICATO DI COMPLETAMENTO', baseX, 53, { align: 'center' });

    pdf.setFontSize(28);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'bold');
    pdf.text(data.userName, baseX, 75, { align: 'center' });

    if (data.companyName) {
      pdf.setFontSize(12);
      pdf.setTextColor(rgb.r, rgb.g, rgb.b);
      pdf.setFont(data.font, 'normal');
      pdf.text(data.companyName, baseX, 85, { align: 'center' });
    }

    // Info box
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(40, 95, pageWidth - 80, 40, 3, 3, 'F');
    pdf.setDrawColor(rgb.r, rgb.g, rgb.b, 0.2);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(40, 95, pageWidth - 80, 40, 3, 3, 'D');

    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont(data.font, 'normal');
    pdf.text('Ha completato con successo', baseX, 104, { align: 'center' });
    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 120);
    pdf.text('Verifica della Ricaduta sulla', baseX, 110, { align: 'center' });

    pdf.setFontSize(16);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(data.font, 'bold');
    pdf.text(data.moduleName, baseX, 120, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'normal');
    pdf.text(
      `Score: ${data.score}% | Completamenti: ${data.completions} | ${data.date}`,
      baseX,
      128,
      { align: 'center' }
    );

    // Certificate code with modern style
    pdf.setFillColor(rgb.r, rgb.g, rgb.b, 0.1);
    pdf.roundedRect(baseX - 60, 140, 120, 8, 2, 2, 'F');
    pdf.setFontSize(9);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(data.font, 'bold');
    pdf.text(data.certificateCode, baseX, 146, { align: 'center' });

    // QR Code in card
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(baseX - 25, 155, 50, 50, 3, 3, 'F');
    pdf.setDrawColor(rgb.r, rgb.g, rgb.b, 0.2);
    pdf.roundedRect(baseX - 25, 155, 50, 50, 3, 3, 'D');
    pdf.addImage(data.qrCodeDataUrl, 'PNG', baseX - 20, 160, 40, 40);
  }
};

// Template Minimalista
export const minimalistaTemplate: TemplateConfig = {
  name: 'Minimalista',
  description: 'Design pulito ed essenziale, focus sul contenuto',
  renderTemplate: (pdf, data, rgb) => {
    const { pageWidth, pageHeight } = data;

    // Clean white background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Subtle border
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.rect(20, 20, pageWidth - 40, pageHeight - 40);

    // Minimal accent line
    pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
    pdf.setLineWidth(2);
    pdf.line(40, 40, 100, 40);

    // Logo - minimal
    const logoPos = { x: 40, y: 25 };
    if (data.logoDataUrl) {
      pdf.addImage(data.logoDataUrl, 'PNG', logoPos.x, logoPos.y, 30, 12, undefined, 'FAST');
    } else {
      pdf.setFontSize(8);
      pdf.setTextColor(rgb.r, rgb.g, rgb.b);
      pdf.setFont(data.font, 'bold');
      pdf.text('SF', logoPos.x, logoPos.y + 8);
    }

    // Content - left aligned, clean
    const baseX = 40;
    
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.setFont(data.font, 'normal');
    pdf.text('CERTIFICATO', baseX, 60);

    pdf.setFontSize(32);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'bold');
    pdf.text(data.userName, baseX, 80);

    if (data.companyName) {
      pdf.setFontSize(11);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont(data.font, 'normal');
      pdf.text(data.companyName, baseX, 90);
    }

    // Divider line
    pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
    pdf.setLineWidth(1);
    pdf.line(baseX, 95, baseX + 80, 95);

    pdf.setFontSize(11);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'normal');
    pdf.text('Ha completato', baseX, 107);
    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 120);
    pdf.text('Verifica della Ricaduta sulla', baseX, 114);

    pdf.setFontSize(18);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(data.font, 'bold');
    pdf.text(data.moduleName, baseX, 128);

    // Stats in clean format
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont(data.font, 'normal');
    pdf.text(`Punteggio: ${data.score}%`, baseX, 140);
    pdf.text(`Completamenti: ${data.completions}`, baseX, 148);
    pdf.text(`Data: ${data.date}`, baseX, 156);

    // Code minimalist
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(data.certificateCode, baseX, 170);

    // QR Code - bottom right, minimal
    pdf.addImage(data.qrCodeDataUrl, 'PNG', pageWidth - 60, pageHeight - 60, 35, 35);
    pdf.setFontSize(7);
    pdf.setTextColor(180, 180, 180);
    pdf.text('Verifica', pageWidth - 42, pageHeight - 20, { align: 'center' });
  }
};

export const certificateTemplates: Record<string, TemplateConfig> = {
  formale: formaleTemplate,
  moderno: modernoTemplate,
  minimalista: minimalistaTemplate,
};
