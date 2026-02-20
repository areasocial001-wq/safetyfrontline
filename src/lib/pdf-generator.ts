import { jsPDF } from "jspdf";

export const generateTechnicalSheetPDF = async (logoUrl: string) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      checkPageBreak(fontSize * 0.5);
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
  };

  // Add logo at the top
  try {
    doc.addImage(logoUrl, "PNG", pageWidth / 2 - 20, yPosition, 40, 40);
    yPosition += 45;
  } catch (error) {
    console.error("Error adding logo:", error);
    yPosition += 10;
  }

  // Badge - Conforme Accordo Stato-Regioni 2025
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(pageWidth / 2 - 50, yPosition, 100, 10, 5, 5, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Conforme Accordo Stato-Regioni 2025", pageWidth / 2, yPosition + 7, { align: "center" });
  yPosition += 15;

  // Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Safety Frontline", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Piattaforma di Formazione Sicurezza Gamificata", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 6;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 103, 31);
  doc.text("Scheda Tecnica di Presentazione", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 12;

  // Overview Section
  doc.setDrawColor(255, 103, 31);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  addText("PANORAMICA DELLA PIATTAFORMA", 14, true, [255, 103, 31]);
  yPosition += 2;

  addText(
    "Safety Frontline è la prima piattaforma italiana di formazione sulla sicurezza sul lavoro completamente gamificata, progettata specificamente per PMI e aziende che necessitano di strumenti formativi efficaci, coinvolgenti e conformi alla normativa vigente.",
    10,
    false
  );
  yPosition += 3;

  addText(
    "La piattaforma trasforma l'obbligo formativo in un'esperienza interattiva dove i partecipanti imparano riconoscendo rischi reali in ambienti simulati, consolidando competenze attraverso la pratica guidata invece della teoria passiva.",
    10,
    false
  );
  yPosition += 8;

  // Key Strengths
  checkPageBreak(50);
  doc.setDrawColor(255, 103, 31);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  addText("PUNTI DI FORZA DISTINTIVI", 14, true, [255, 103, 31]);
  yPosition += 4;

  const strengths = [
    { title: "100% Browser-Based", desc: "Nessuna installazione richiesta. Funziona su qualsiasi dispositivo con un browser." },
    { title: "Deployment Flessibile", desc: "Modalità aula per sessioni di gruppo e modalità individuale per formazione autonoma." },
    { title: "Rapido da Implementare", desc: "Deploy immediato: basta un computer e un proiettore." },
    { title: "Tracciabilità Completa", desc: "Registro formazione automatico, export Excel, matrici rischio/formazione." },
    { title: "Gamification Didattica", desc: "Strumento di valutazione, non intrattenimento." },
    { title: "Multi-Tenant Sicuro", desc: "Architettura multi-aziendale con gestione ruoli completa." },
  ];

  strengths.forEach((strength, index) => {
    checkPageBreak(15);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, yPosition, contentWidth, 12, 2, 2, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`✓ ${strength.title}`, margin + 3, yPosition + 5);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const descLines = doc.splitTextToSize(strength.desc, contentWidth - 6);
    doc.text(descLines, margin + 3, yPosition + 9);
    yPosition += 14;
  });

  yPosition += 5;

  // Training Modules
  checkPageBreak(50);
  doc.setDrawColor(255, 103, 31);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  addText("MODULI FORMATIVI DISPONIBILI", 14, true, [255, 103, 31]);
  yPosition += 4;

  const modules = [
    { icon: "🏃", title: "Safety Run - Rischi Generali", desc: "Identificazione rischi comuni: cadute, inciampi, comportamenti rischiosi." },
    { icon: "🏢", title: "Office Hazard Quest - Uffici VDT", desc: "Postura corretta, lavoro al videoterminale, ergonomia postazione." },
    { icon: "📦", title: "Magazzino 2.5D - Gestione Materiali", desc: "Carrelli elevatori, movimentazione carichi, interazione pedoni/mezzi." },
    { icon: "🚨", title: "Emergenza! - Procedure Evacuazione", desc: "Allarmi, evacuazione, riconoscimento ostacoli, percorsi sicuri." },
    { icon: "⚙️", title: "Personalizzazioni Custom", desc: "Ambienti e scenari specifici del cliente in grafica 2.5D/3D." },
  ];

  modules.forEach((module) => {
    checkPageBreak(15);
    doc.setFillColor(255, 245, 240);
    doc.roundedRect(margin, yPosition, contentWidth, 12, 2, 2, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 103, 31);
    doc.text(`${module.icon} ${module.title}`, margin + 3, yPosition + 5);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const descLines = doc.splitTextToSize(module.desc, contentWidth - 6);
    doc.text(descLines, margin + 3, yPosition + 9);
    yPosition += 14;
  });

  yPosition += 5;

  // Regulatory Compliance
  checkPageBreak(60);
  doc.setDrawColor(255, 103, 31);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  addText("CONFORMITÀ NORMATIVA", 14, true, [255, 103, 31]);
  yPosition += 4;

  addText("Accordo Stato-Regioni 2025", 12, true);
  yPosition += 1;
  addText(
    "Piattaforma progettata in piena conformità con l'Accordo Stato-Regioni 2025, che riconosce ufficialmente la gamification come metodologia didattica per la formazione obbligatoria sulla sicurezza sul lavoro.",
    9,
    false
  );
  yPosition += 3;

  const compliance = [
    "✓ Metodologie Attive - Partecipazione diretta e decisioni attive",
    "✓ Gamification Didattica - Strumento di valutazione, non intrattenimento",
    "✓ Simulazione Guidata - Scenari realistici di produzione",
  ];

  compliance.forEach((item) => {
    checkPageBreak(6);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(item, margin + 3, yPosition);
    yPosition += 5;
  });

  yPosition += 3;

  addText("D.Lgs. 81/08", 12, true);
  yPosition += 1;

  const requirements = [
    "✓ Formazione generale e specifica",
    "✓ Valutazione dell'apprendimento",
    "✓ Registro formazione automatico",
    "✓ Export Excel per DVR",
    "✓ Report per audit ispettivi",
    "✓ Attestati di partecipazione automatici",
  ];

  requirements.forEach((req) => {
    checkPageBreak(6);
    doc.setFontSize(9);
    doc.text(req, margin + 3, yPosition);
    yPosition += 5;
  });

  yPosition += 5;

  // Technical Features
  checkPageBreak(50);
  doc.setDrawColor(255, 103, 31);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  addText("CARATTERISTICHE TECNICHE", 14, true, [255, 103, 31]);
  yPosition += 4;

  const techFeatures = [
    "Frontend: React + TypeScript + Vite",
    "3D Engine: Three.js (@react-three/fiber)",
    "Backend: Supabase (PostgreSQL, Auth, Storage)",
    "Audio: Sistema audio spaziale 3D (Web Audio API)",
    "Certificati: Generazione PDF con QR code e firma digitale",
    "Sistema achievements e leaderboard globale",
    "Replay gameplay con export video MP4 (1080p)",
    "Confronto performance side-by-side",
    "Mini-mappa con indicatori di rischio",
    "Sistema di collisione fisica realistica",
    "Notifiche email automatiche",
  ];

  techFeatures.forEach((feature) => {
    checkPageBreak(6);
    doc.setFontSize(9);
    doc.text(`• ${feature}`, margin + 3, yPosition);
    yPosition += 5;
  });

  yPosition += 5;

  // Value Proposition
  checkPageBreak(50);
  doc.setDrawColor(255, 103, 31);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  addText("PERCHÉ SCEGLIERE SAFETY FRONTLINE?", 14, true, [255, 103, 31]);
  yPosition += 4;

  const benefits = [
    "Deploy in meno di 5 minuti",
    "Nessuna formazione IT richiesta",
    "+70% engagement vs formazione tradizionale",
    "Riduzione tempi formativi del 40%",
    "Tracciabilità e compliance garantiti",
    "Miglioramento retention conoscenze",
  ];

  benefits.forEach((benefit) => {
    checkPageBreak(6);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`✓ ${benefit}`, margin + 3, yPosition);
    yPosition += 6;
  });

  yPosition += 8;

  // Footer
  checkPageBreak(20);
  doc.setFillColor(255, 103, 31);
  doc.rect(margin, yPosition, contentWidth, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Trasforma la Formazione Sicurezza", pageWidth / 2, yPosition + 8, { align: "center" });
  doc.text("in un'Esperienza Coinvolgente", pageWidth / 2, yPosition + 14, { align: "center" });

  // Add footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Safety Frontline - Scheda Tecnica | Pagina ${i} di ${pageCount} | © 2025 SicurAzienda`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Save PDF
  const fileName = `Safety_Frontline_Scheda_Tecnica_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
