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
  version?: string;
  certificateVerifyUrl?: string;
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
  version?: string;
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
  version: "1.0",
  certificateVerifyUrl:
    "https://safetyfrontline.lovable.app/verify-certificate?code=FACSIMILE",
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
  version: "1.0",
};

const ORANGE: [number, number, number] = [255, 103, 31];
const GREEN: [number, number, number] = [34, 197, 94];
const DARK: [number, number, number] = [26, 26, 26];
const GREY: [number, number, number] = [100, 100, 100];

function drawWatermark(pdf: jsPDF, w: number, h: number) {
  pdf.saveGraphicsState();
  const anyPdf = pdf as any;
  if (typeof anyPdf.GState === "function") {
    anyPdf.setGState(new anyPdf.GState({ opacity: 0.08 }));
  }
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
  pdf.roundedRect(boxX, y, boxW, boxH, 3, 3, "FD");

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

  // Version + generation date (bottom center)
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(...GREY);
  const genStr = new Date().toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  pdf.text(
    `Fac-simile v${settings.version ?? "1.0"} · Generato il ${genStr}`,
    w / 2,
    h - 8,
    { align: "center" }
  );

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
  pdf.roundedRect(18, y, w - 36, 14, 2, 2, "FD");
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

  // Sample questions bank
  y += 4;
  const questionBank = [
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
    {
      q: "Cosa indica il pittogramma triangolare giallo con bordo nero?",
      a: ["Divieto", "Obbligo", "Avvertimento/Pericolo", "Salvataggio"],
      correct: 2,
    },
    {
      q: "In caso di incendio, quale è la prima azione da compiere?",
      a: [
        "Tentare di spegnerlo da soli",
        "Allertare i presenti e attivare la procedura di emergenza",
        "Continuare il lavoro",
        "Prendere effetti personali",
      ],
      correct: 1,
    },
    {
      q: "Il Documento di Valutazione dei Rischi (DVR) deve essere redatto da:",
      a: ["Il lavoratore", "Il datore di lavoro", "Il medico competente", "Il RLS"],
      correct: 1,
    },
    {
      q: "Il Preposto ha il compito di:",
      a: [
        "Redigere il DVR",
        "Sovrintendere e vigilare sull'osservanza delle disposizioni",
        "Nominare il RSPP",
        "Erogare la formazione",
      ],
      correct: 1,
    },
    {
      q: "La segnaletica di sicurezza di colore verde indica:",
      a: ["Divieto", "Pericolo", "Salvataggio o soccorso", "Obbligo"],
      correct: 2,
    },
    {
      q: "Ogni quanti anni va aggiornata la formazione del lavoratore?",
      a: ["Ogni anno", "Ogni 3 anni", "Ogni 5 anni", "Mai"],
      correct: 2,
    },
    {
      q: "Il Medico Competente è obbligatorio quando:",
      a: [
        "L'azienda ha più di 100 dipendenti",
        "È prevista la sorveglianza sanitaria",
        "Solo se richiesto dai lavoratori",
        "Mai",
      ],
      correct: 1,
    },
    {
      q: "Cosa significa la sigla RSPP?",
      a: [
        "Responsabile Servizio Prevenzione e Protezione",
        "Rappresentante Sicurezza Pubblica Privata",
        "Responsabile Sanitario Pronto Pericolo",
        "Referente Sicurezza Posto di lavoro",
      ],
      correct: 0,
    },
    {
      q: "Il rischio è definito come:",
      a: [
        "Probabilità per magnitudo del danno",
        "Solo la probabilità di un evento",
        "Solo la gravità dell'evento",
        "Un sinonimo di pericolo",
      ],
      correct: 0,
    },
  ];

  const count = Math.max(1, Math.min(settings.questionsCount, questionBank.length));
  const sampleQs = questionBank.slice(0, count);

  sampleQs.forEach((item, i) => {
    // estimate space needed for this question
    const qLines = pdf.splitTextToSize(`${i + 1}. ${item.q}`, w - 36) as string[];
    const needed = qLines.length * 5 + item.a.length * 4.5 + 6;
    if (y + needed > h - 22) {
      pdf.addPage();
      // top decorations on new page
      pdf.setFillColor(...ORANGE);
      pdf.rect(0, 0, w, 3, "F");
      pdf.setFillColor(...GREEN);
      pdf.rect(0, h - 3, w, 3, "F");
      pdf.setDrawColor(...ORANGE);
      pdf.setLineWidth(0.6);
      pdf.rect(8, 8, w - 16, h - 16);
      drawWatermark(pdf, w, h);
      y = 22;
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...DARK);
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

  // ====== Closing section: scoring, answer key, signatures ======
  const ensureSpace = (need: number) => {
    if (y + need > h - 22) {
      pdf.addPage();
      pdf.setFillColor(...ORANGE);
      pdf.rect(0, 0, w, 3, "F");
      pdf.setFillColor(...GREEN);
      pdf.rect(0, h - 3, w, 3, "F");
      pdf.setDrawColor(...ORANGE);
      pdf.setLineWidth(0.6);
      pdf.rect(8, 8, w - 16, h - 16);
      drawWatermark(pdf, w, h);
      y = 22;
    }
  };

  // Scoring box
  ensureSpace(34);
  y += 4;
  pdf.setFillColor(247, 254, 247);
  pdf.setDrawColor(...GREEN);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(18, y, w - 36, 26, 2, 2, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...DARK);
  pdf.text("PUNTEGGIO FINALE", 24, y + 7);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...GREY);
  pdf.text(`Risposte corrette: ______ / ${sampleQs.length}`, 24, y + 14);
  pdf.text(
    `Percentuale: ______ %   (Soglia minima: ${settings.passingScorePercent}%)`,
    24,
    y + 21
  );
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...GREEN);
  pdf.text("ESITO:", w - 70, y + 9);
  pdf.setDrawColor(...GREY);
  pdf.rect(w - 55, y + 6, 4, 4);
  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("SUPERATO", w - 49, y + 9);
  pdf.rect(w - 55, y + 14, 4, 4);
  pdf.text("NON SUPERATO", w - 49, y + 17);
  y += 32;

  // Answer key
  ensureSpace(20 + Math.ceil(sampleQs.length / 5) * 5);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...ORANGE);
  pdf.text("CORRETTORE PER DOCENTE", 18, y);
  y += 5;
  pdf.setDrawColor(...ORANGE);
  pdf.setLineWidth(0.2);
  pdf.line(18, y - 2, w - 18, y - 2);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...DARK);
  const cols = 5;
  const colW = (w - 36) / cols;
  sampleQs.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = 18 + col * colW;
    const cy = y + row * 5;
    pdf.text(
      `Q${i + 1}: ${String.fromCharCode(65 + item.correct)}`,
      cx,
      cy
    );
  });
  y += Math.ceil(sampleQs.length / cols) * 5 + 4;

  // Signatures
  ensureSpace(34);
  y += 4;
  const colWidth = (w - 36 - 8) / 2;
  // Candidate
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...GREY);
  pdf.text("DATI CANDIDATO", 18, y);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...DARK);
  pdf.text("Cognome e Nome: ____________________________", 18, y + 7);
  pdf.text("Azienda: ____________________________________", 18, y + 13);
  pdf.text("Data: ____ / ____ / ________", 18, y + 19);
  pdf.setDrawColor(...GREY);
  pdf.setLineWidth(0.2);
  pdf.line(18, y + 28, 18 + colWidth, y + 28);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8);
  pdf.setTextColor(...GREY);
  pdf.text("Firma del candidato", 18, y + 32);

  // Examiner
  const ex = 18 + colWidth + 8;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...GREY);
  pdf.text("ESAMINATORE / DOCENTE", ex, y);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...DARK);
  pdf.text("Cognome e Nome: ____________________________", ex, y + 7);
  pdf.text("Qualifica: __________________________________", ex, y + 13);
  pdf.text("Data correzione: ____ / ____ / ________", ex, y + 19);
  pdf.setDrawColor(...GREY);
  pdf.line(ex, y + 28, ex + colWidth, y + 28);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8);
  pdf.setTextColor(...GREY);
  pdf.text("Firma e timbro esaminatore", ex, y + 32);
  y += 38;

  // Footer note
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8);
  pdf.setTextColor(...GREY);
  const footerLines = pdf.splitTextToSize(settings.footerNote, w - 36) as string[];
  let fy = Math.max(y + 4, h - 18 - footerLines.length * 4);
  footerLines.forEach((l) => {
    pdf.text(l, w / 2, fy, { align: "center" });
    fy += 4;
  });

  return pdf.output("blob");
}
