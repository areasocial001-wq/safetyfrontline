import jsPDF from "jspdf";
import QRCode from "qrcode";

export interface TestFacsimileSettings {
  title: string;
  subtitle: string;
  moduleName: string;
  passingScorePercent: number;
  questionsCount: number;
  durationMinutes: number;
  instructions: string;
  footerNote: string;
}

export interface CertificateFacsimileSettings {
  title: string;
  subtitle: string;
  legalReference: string;
  moduleName: string;
  completionPhrase: string; // supports {module}
  hoursLabel: string;
  hoursValue: string;
  trackedNote: string;
  outcomeLabel: string;
  outcomeValue: string;
  scoreNote: string;
  signatureLine: string;
  footerNote: string;
}

export const DEFAULT_TEST_SETTINGS: TestFacsimileSettings = {
  title: "TEST FINALE DI VALUTAZIONE",
  subtitle: "Verifica di apprendimento",
  moduleName: "Formazione Generale Lavoratori",
  passingScorePercent: 80,
  questionsCount: 10,
  durationMinutes: 20,
  instructions:
    "Rispondere a tutte le domande. Una sola risposta è corretta per ciascun quesito. Il test si considera superato al raggiungimento della soglia minima.",
  footerNote:
    "Documento dimostrativo. Il test reale viene erogato in piattaforma con tracciamento dei tempi e delle risposte.",
};

export const DEFAULT_CERTIFICATE_SETTINGS: CertificateFacsimileSettings = {
  title: "ATTESTATO DI FORMAZIONE",
  subtitle: "Formazione Generale Lavoratori",
  legalReference: "(Art. 37 D.Lgs 81/2008)",
  moduleName: "Formazione Generale Lavoratori",
  completionPhrase:
    'ha completato con esito positivo la Verifica della Ricaduta sulla "{module}"',
  hoursLabel: "ORE SVOLTE",
  hoursValue: "4 ore (240 minuti)",
  trackedNote: "di cui tracciate attivamente: 30 minuti",
  outcomeLabel: "ESITO",
  outcomeValue: "SUPERATO",
  scoreNote: "Punteggio: 92%",
  signatureLine: "Firma Digitale Verificata",
  footerNote: "Safety Frontline Platform",
};

const ORANGE: [number, number, number] = [255, 103, 31];
const GREEN: [number, number, number] = [34, 197, 94];
const DARK: [number, number, number] = [26, 26, 26];
const GREY: [number, number, number] = [100, 100, 100];

function drawWatermark(pdf: jsPDF, w: number, h: number) {
  pdf.saveGraphicsState();
  // @ts-expect-error jspdf typings
  pdf.setGState(new (jsPDF.GState as any)({ opacity: 0.08 }));
  pdf.setTextColor(...ORANGE);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(110);
  pdf.text("FAC SIMILE", w / 2, h / 2, { align: "center", angle: 30 });
  pdf.restoreGraphicsState();
}

export async function generateCertificatePdf(
  settings: CertificateFacsimileSettings
): Promise<Blob> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  // Bars
  pdf.setFillColor(...ORANGE);
  pdf.rect(0, 0, w, 3, "F");
  pdf.setFillColor(...GREEN);
  pdf.rect(0, h - 3, w, 3, "F");

  // Borders
  pdf.setDrawColor(...ORANGE);
  pdf.setLineWidth(0.6);
  pdf.rect(8, 8, w - 16, h - 16);
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.2);
  pdf.rect(11, 11, w - 22, h - 22);

  // Header
  pdf.setTextColor(...ORANGE);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("SAFETY FRONTLINE", 18, 20);
  pdf.setFontSize(7);
  pdf.setTextColor(...GREY);
  pdf.setFont("helvetica", "normal");
  pdf.text("Piattaforma Formazione Sicurezza", 18, 25);

  pdf.setTextColor(...GREEN);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("Conforme D.Lgs 81/08", w - 18, 20, { align: "right" });
  pdf.text("Accordo Stato-Regioni 2025", w - 18, 25, { align: "right" });

  drawWatermark(pdf, w, h);

  // Title
  let y = 50;
  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text(settings.title.toUpperCase(), w / 2, y, { align: "center" });
  y += 10;
  pdf.setFontSize(13);
  pdf.setTextColor(...ORANGE);
  pdf.text(settings.subtitle.toUpperCase(), w / 2, y, { align: "center" });
  y += 6;
  pdf.setFontSize(9);
  pdf.setTextColor(...GREY);
  pdf.setFont("helvetica", "normal");
  pdf.text(settings.legalReference, w / 2, y, { align: "center" });

  y += 6;
  pdf.setDrawColor(...ORANGE);
  pdf.setLineWidth(0.5);
  pdf.line(w / 2 - 40, y, w / 2 + 40, y);

  // Recipient
  y += 18;
  pdf.setFontSize(11);
  pdf.setTextColor(...GREY);
  pdf.text("Si certifica che", w / 2, y, { align: "center" });
  y += 14;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(...DARK);
  pdf.text("MARIO ROSSI", w / 2, y, { align: "center" });
  y += 8;
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(11);
  pdf.setTextColor(...GREY);
  pdf.text("Azienda Esempio S.r.l.", w / 2, y, { align: "center" });

  // Completion phrase (split lines, supports {module})
  y += 18;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(...DARK);
  const phrase = settings.completionPhrase.replace(/\{module\}/g, settings.moduleName);
  const lines = pdf.splitTextToSize(phrase, w - 60) as string[];
  lines.forEach((line) => {
    pdf.text(line, w / 2, y, { align: "center" });
    y += 6;
  });

  // Info box
  y += 12;
  const boxW = 160;
  const boxX = (w - boxW) / 2;
  const boxH = 28;
  pdf.setFillColor(255, 247, 242);
  pdf.setDrawColor(...ORANGE);
  pdf.setLineWidth(0.4);
  pdf.roundRect(boxX, y, boxW, boxH, 3, 3, "FD");

  pdf.setFontSize(9);
  pdf.setTextColor(...GREY);
  pdf.setFont("helvetica", "bold");
  pdf.text(settings.hoursLabel, boxX + 6, y + 7);
  pdf.setFontSize(13);
  pdf.setTextColor(...DARK);
  pdf.text(settings.hoursValue, boxX + 6, y + 16);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...GREY);
  pdf.text(settings.trackedNote, boxX + 6, y + 23);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...GREY);
  pdf.text(settings.outcomeLabel, boxX + boxW - 6, y + 7, { align: "right" });
  pdf.setFontSize(13);
  pdf.setTextColor(...GREEN);
  pdf.text(settings.outcomeValue, boxX + boxW - 6, y + 16, { align: "right" });
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...GREY);
  pdf.text(settings.scoreNote, boxX + boxW - 6, y + 23, { align: "right" });

  y += boxH + 12;
  pdf.setFontSize(10);
  pdf.setTextColor(...GREY);
  pdf.text(`Data di emissione: ${new Date().toLocaleDateString("it-IT")}`, w / 2, y, {
    align: "center",
  });
  y += 6;
  pdf.setFontSize(9);
  pdf.setTextColor(...ORANGE);
  pdf.setFont("helvetica", "bold");
  pdf.text("Codice Attestato: FLAV-FACSIMILE-0001", w / 2, y, { align: "center" });

  // QR bottom-left
  const qrUrl = `https://safetyfrontline.lovable.app/verify-certificate?code=FACSIMILE`;
  const qrData = await QRCode.toDataURL(qrUrl, {
    margin: 1,
    width: 200,
    color: { dark: "#1a1a1a", light: "#ffffff" },
  });
  pdf.addImage(qrData, "PNG", 18, h - 50, 28, 28);
  pdf.setFontSize(7);
  pdf.setTextColor(...GREY);
  pdf.setFont("helvetica", "normal");
  pdf.text("Scansiona per verificare", 18, h - 18);

  // Signature bottom-right
  pdf.setDrawColor(...GREY);
  pdf.setLineWidth(0.2);
  pdf.line(w - 80, h - 32, w - 18, h - 32);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(9);
  pdf.setTextColor(...DARK);
  pdf.text(settings.signatureLine, w - 18, h - 26, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(...GREY);
  pdf.text(settings.footerNote, w - 18, h - 22, { align: "right" });

  return pdf.output("blob");
}

export async function generateTestPdf(
  settings: TestFacsimileSettings
): Promise<Blob> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  // Top bar
  pdf.setFillColor(...ORANGE);
  pdf.rect(0, 0, w, 3, "F");
  pdf.setFillColor(...GREEN);
  pdf.rect(0, h - 3, w, 3, "F");

  pdf.setDrawColor(...ORANGE);
  pdf.setLineWidth(0.6);
  pdf.rect(8, 8, w - 16, h - 16);

  // Header
  pdf.setTextColor(...ORANGE);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("SAFETY FRONTLINE", 18, 20);
  pdf.setFontSize(7);
  pdf.setTextColor(...GREY);
  pdf.setFont("helvetica", "normal");
  pdf.text("Piattaforma Formazione Sicurezza", 18, 25);

  pdf.setTextColor(...GREEN);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("Conforme D.Lgs 81/08", w - 18, 20, { align: "right" });

  drawWatermark(pdf, w, h);

  // Title
  let y = 45;
  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text(settings.title.toUpperCase(), w / 2, y, { align: "center" });
  y += 8;
  pdf.setFontSize(12);
  pdf.setTextColor(...ORANGE);
  pdf.text(settings.subtitle, w / 2, y, { align: "center" });
  y += 6;
  pdf.setFontSize(10);
  pdf.setTextColor(...GREY);
  pdf.setFont("helvetica", "italic");
  pdf.text(`Modulo: ${settings.moduleName}`, w / 2, y, { align: "center" });

  // Meta box
  y += 8;
  pdf.setFillColor(255, 247, 242);
  pdf.setDrawColor(...ORANGE);
  pdf.setLineWidth(0.3);
  pdf.roundRect(18, y, w - 36, 14, 2, 2, "FD");
  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text(`Quesiti: ${settings.questionsCount}`, 24, y + 9);
  pdf.text(`Durata: ${settings.durationMinutes} min`, w / 2, y + 9, { align: "center" });
  pdf.setTextColor(...GREEN);
  pdf.text(`Soglia di superamento: ${settings.passingScorePercent}%`, w - 24, y + 9, {
    align: "right",
  });

  // Instructions
  y += 22;
  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Istruzioni", 18, y);
  y += 5;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...GREY);
  const instr = pdf.splitTextToSize(settings.instructions, w - 36) as string[];
  instr.forEach((l) => {
    pdf.text(l, 18, y);
    y += 4.5;
  });

  // Sample questions
  y += 4;
  const sampleQs = [
    {
      q: "Quale è la durata minima della formazione generale dei lavoratori (D.Lgs 81/08)?",
      a: ["2 ore", "4 ore", "6 ore", "8 ore"],
      correct: 1,
    },
    {
      q: "I DPI devono essere forniti:",
      a: [
        "Solo su richiesta del lavoratore",
        "A spese del lavoratore",
        "Gratuitamente dal datore di lavoro",
        "Solo in caso di emergenza",
      ],
      correct: 2,
    },
    {
      q: "Chi è il RLS?",
      a: [
        "Responsabile Logistica e Sicurezza",
        "Rappresentante dei Lavoratori per la Sicurezza",
        "Referente della Linea di Sicurezza",
        "Responsabile del Lavoro Speciale",
      ],
      correct: 1,
    },
  ];

  sampleQs.forEach((item, i) => {
    if (y > h - 50) {
      pdf.addPage();
      y = 20;
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...DARK);
    const qLines = pdf.splitTextToSize(`${i + 1}. ${item.q}`, w - 36) as string[];
    qLines.forEach((l) => {
      pdf.text(l, 18, y);
      y += 5;
    });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    item.a.forEach((opt, idx) => {
      pdf.setTextColor(...GREY);
      pdf.rect(22, y - 3, 3, 3);
      pdf.text(`${String.fromCharCode(65 + idx)}) ${opt}`, 28, y);
      y += 4.5;
    });
    y += 3;
  });

  // Footer note
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8);
  pdf.setTextColor(...GREY);
  const footerLines = pdf.splitTextToSize(settings.footerNote, w - 36) as string[];
  let fy = h - 18 - footerLines.length * 4;
  footerLines.forEach((l) => {
    pdf.text(l, w / 2, fy, { align: "center" });
    fy += 4;
  });

  return pdf.output("blob");
}
