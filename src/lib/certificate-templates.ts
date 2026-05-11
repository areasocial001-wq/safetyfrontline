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
  modulePrefix: string;
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
      return { x: 20, y: 20 };
    case 'top-right':
      return { x: pageWidth - 60, y: 20 };
    case 'top-center':
      return { x: pageWidth / 2 - 20, y: 20 };
    default:
      return { x: 20, y: 20 };
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

const renderQrBlock = (pdf: jsPDF, data: TemplateData, rgb: RGB) => {
  // Bottom-left QR
  const qrX = 22;
  const qrY = data.pageHeight - 55;
  pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
  pdf.setLineWidth(0.4);
  pdf.rect(qrX - 1, qrY - 1, 32, 32);
  pdf.addImage(data.qrCodeDataUrl, 'PNG', qrX, qrY, 30, 30);
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont(data.font, 'normal');
  pdf.text('Verifica online', qrX + 15, qrY + 36, { align: 'center' });
  pdf.text('scansiona il codice', qrX + 15, qrY + 39, { align: 'center' });
};

// Template Formale (Classico) — Portrait A4 (210 x 297)
export const formaleTemplate: TemplateConfig = {
  name: 'Formale',
  description: 'Design classico e professionale, ideale per certificazioni ufficiali',
  renderTemplate: (pdf, data, rgb) => {
    const { pageWidth, pageHeight } = data;

    pdf.setFillColor(245, 247, 250);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Top & bottom color bands
    pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    pdf.rect(0, 0, pageWidth, 14, 'F');
    pdf.rect(0, pageHeight - 14, pageWidth, 14, 'F');

    // Borders
    pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
    pdf.setLineWidth(1);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
    pdf.setLineWidth(0.3);
    pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

    const logoPos = getLogoPosition(data.logoPosition, pageWidth);
    renderLogo(pdf, data, logoPos, rgb);

    const baseX = pageWidth / 2;

    pdf.setFontSize(26);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'bold');
    pdf.text('CERTIFICATO DI', baseX, 70, { align: 'center' });
    pdf.text('COMPLETAMENTO', baseX, 82, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont(data.font, 'normal');
    pdf.text('Si certifica che', baseX, 102, { align: 'center' });

    pdf.setFontSize(22);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(data.font, 'bold');
    pdf.text(data.userName, baseX, 118, { align: 'center' });

    if (data.companyName) {
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont(data.font, 'italic');
      pdf.text(data.companyName, baseX, 128, { align: 'center' });
    }

    pdf.setFontSize(11);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'normal');
    pdf.text('ha completato con successo la', baseX, 145, { align: 'center' });

    if (data.modulePrefix) {
      pdf.setFontSize(11);
      pdf.setTextColor(120, 120, 120);
      pdf.text(data.modulePrefix, baseX, 154, { align: 'center' });
    }

    pdf.setFontSize(18);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(data.font, 'bold');
    pdf.text(data.moduleName, baseX, 165, { align: 'center', maxWidth: pageWidth - 50 });

    pdf.setFontSize(12);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'normal');
    pdf.text(
      `Punteggio: ${data.score}%  •  Completamenti: ${data.completions}`,
      baseX, 182, { align: 'center' }
    );

    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Data di emissione: ${data.date}`, baseX, 192, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(data.font, 'bold');
    pdf.text(`Codice: ${data.certificateCode}`, baseX, 202, { align: 'center' });

    // QR bottom-left
    renderQrBlock(pdf, data, rgb);

    // Signature bottom-right
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.line(pageWidth - 75, pageHeight - 35, pageWidth - 25, pageHeight - 35);
    pdf.setFontSize(10);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'italic');
    pdf.text('Firma Digitale Verificata', pageWidth - 50, pageHeight - 30, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Safety Frontline Platform', pageWidth - 50, pageHeight - 25, { align: 'center' });
  }
};

// Template Moderno — Portrait
export const modernoTemplate: TemplateConfig = {
  name: 'Moderno',
  description: 'Design contemporaneo con elementi grafici dinamici',
  renderTemplate: (pdf, data, rgb) => {
    const { pageWidth, pageHeight } = data;

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Decorative circles
    pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    pdf.setGState(pdf.GState({ opacity: 0.08 }));
    pdf.circle(pageWidth - 20, 30, 70, 'F');
    pdf.circle(20, pageHeight - 30, 60, 'F');
    pdf.setGState(pdf.GState({ opacity: 1 }));

    // Top accent
    pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    pdf.rect(0, 0, pageWidth, 8, 'F');

    const logoPos = getLogoPosition(data.logoPosition, pageWidth);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(logoPos.x - 2, logoPos.y - 2, 44, 24, 3, 3, 'FD');
    pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(logoPos.x - 2, logoPos.y - 2, 44, 24, 3, 3, 'D');
    renderLogo(pdf, data, logoPos, rgb);

    const baseX = pageWidth / 2;

    // Badge title
    pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    pdf.roundedRect(baseX - 70, 65, 140, 12, 2, 2, 'F');
    pdf.setFontSize(11);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont(data.font, 'bold');
    pdf.text('CERTIFICATO DI COMPLETAMENTO', baseX, 73, { align: 'center' });

    pdf.setFontSize(26);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'bold');
    pdf.text(data.userName, baseX, 95, { align: 'center' });

    if (data.companyName) {
      pdf.setFontSize(12);
      pdf.setTextColor(rgb.r, rgb.g, rgb.b);
      pdf.setFont(data.font, 'normal');
      pdf.text(data.companyName, baseX, 105, { align: 'center' });
    }

    // Info box
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(25, 120, pageWidth - 50, 60, 4, 4, 'F');
    pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
    pdf.setGState(pdf.GState({ opacity: 0.2 }));
    pdf.setLineWidth(0.5);
    pdf.roundedRect(25, 120, pageWidth - 50, 60, 4, 4, 'D');
    pdf.setGState(pdf.GState({ opacity: 1 }));

    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont(data.font, 'normal');
    pdf.text('Ha completato con successo', baseX, 132, { align: 'center' });

    if (data.modulePrefix) {
      pdf.setFontSize(10);
      pdf.setTextColor(120, 120, 120);
      pdf.text(data.modulePrefix, baseX, 140, { align: 'center' });
    }

    pdf.setFontSize(16);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(data.font, 'bold');
    pdf.text(data.moduleName, baseX, 152, { align: 'center', maxWidth: pageWidth - 60 });

    pdf.setFontSize(10);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'normal');
    pdf.text(
      `Score: ${data.score}%  |  Completamenti: ${data.completions}  |  ${data.date}`,
      baseX, 170, { align: 'center' }
    );

    // Code chip
    pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    pdf.setGState(pdf.GState({ opacity: 0.12 }));
    pdf.roundedRect(baseX - 60, 195, 120, 9, 2, 2, 'F');
    pdf.setGState(pdf.GState({ opacity: 1 }));
    pdf.setFontSize(9);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(data.font, 'bold');
    pdf.text(data.certificateCode, baseX, 201, { align: 'center' });

    renderQrBlock(pdf, data, rgb);
  }
};

// Template Minimalista — Portrait
export const minimalistaTemplate: TemplateConfig = {
  name: 'Minimalista',
  description: 'Design pulito ed essenziale, focus sul contenuto',
  renderTemplate: (pdf, data, rgb) => {
    const { pageWidth, pageHeight } = data;

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.rect(20, 20, pageWidth - 40, pageHeight - 40);

    pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
    pdf.setLineWidth(2);
    pdf.line(30, 50, 90, 50);

    const logoPos = { x: 30, y: 28 };
    if (data.logoDataUrl) {
      pdf.addImage(data.logoDataUrl, 'PNG', logoPos.x, logoPos.y, 30, 12, undefined, 'FAST');
    } else {
      pdf.setFontSize(9);
      pdf.setTextColor(rgb.r, rgb.g, rgb.b);
      pdf.setFont(data.font, 'bold');
      pdf.text('SAFETY FRONTLINE', logoPos.x, logoPos.y + 8);
    }

    const baseX = 30;

    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.setFont(data.font, 'normal');
    pdf.text('CERTIFICATO', baseX, 75);

    pdf.setFontSize(30);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'bold');
    pdf.text(data.userName, baseX, 95, { maxWidth: pageWidth - 60 });

    if (data.companyName) {
      pdf.setFontSize(11);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont(data.font, 'normal');
      pdf.text(data.companyName, baseX, 105);
    }

    pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
    pdf.setLineWidth(1);
    pdf.line(baseX, 115, baseX + 80, 115);

    pdf.setFontSize(11);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont(data.font, 'normal');
    pdf.text('Ha completato', baseX, 130);

    if (data.modulePrefix) {
      pdf.setFontSize(10);
      pdf.setTextColor(120, 120, 120);
      pdf.text(data.modulePrefix, baseX, 138);
    }

    pdf.setFontSize(20);
    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    pdf.setFont(data.font, 'bold');
    pdf.text(data.moduleName, baseX, 152, { maxWidth: pageWidth - 60 });

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont(data.font, 'normal');
    pdf.text(`Punteggio: ${data.score}%`, baseX, 175);
    pdf.text(`Completamenti: ${data.completions}`, baseX, 183);
    pdf.text(`Data: ${data.date}`, baseX, 191);

    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(data.certificateCode, baseX, 205);

    renderQrBlock(pdf, data, rgb);
  }
};

export const certificateTemplates: Record<string, TemplateConfig> = {
  formale: formaleTemplate,
  moderno: modernoTemplate,
  minimalista: minimalistaTemplate,
};
