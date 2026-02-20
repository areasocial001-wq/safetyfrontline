import { Shield, CheckCircle, Gamepad2, Users, BarChart3, Award, Clock, Download, FileCheck, Zap, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { generateTechnicalSheetPDF } from "@/lib/pdf-generator";
import { toast } from "sonner";
import logoSicurAzienda from "@/assets/logo-sicurazienda.png";

const TechnicalSheet = () => {
  const handleDownloadPDF = async () => {
    try {
      toast.info("Generazione PDF in corso...");
      await generateTechnicalSheetPDF(logoSicurAzienda);
      toast.success("PDF scaricato con successo!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Errore durante la generazione del PDF");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <h1 className="text-2xl font-bold">Safety Frontline</h1>
            </Link>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Scarica PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Title Section */}
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <img src={logoSicurAzienda} alt="SicurAzienda Logo" className="w-32 h-32 object-contain" />
          </div>
          
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-800 border-[3px] border-black dark:border-white mb-6 shadow-[0_0_25px_rgba(0,0,0,0.4)] dark:shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            <Shield className="w-6 h-6 text-black dark:text-white" />
            <span className="text-lg font-bold text-black dark:text-white">Conforme Accordo Stato-Regioni 2025</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Safety Frontline
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Piattaforma di Formazione Sicurezza Gamificata
          </p>
          <p className="text-lg font-semibold text-primary">
            Scheda Tecnica di Presentazione
          </p>
        </div>

        {/* Overview Section */}
        <section className="mb-12 p-8 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary" />
            Panoramica della Piattaforma
          </h2>
          <p className="text-lg leading-relaxed mb-4">
            <strong>Safety Frontline</strong> è la prima piattaforma italiana di formazione sulla sicurezza sul lavoro completamente gamificata, 
            progettata specificamente per PMI e aziende che necessitano di strumenti formativi efficaci, coinvolgenti e conformi alla normativa vigente.
          </p>
          <p className="text-lg leading-relaxed">
            La piattaforma trasforma l'obbligo formativo in un'esperienza interattiva dove i partecipanti imparano riconoscendo rischi reali 
            in ambienti simulati, consolidando competenze attraverso la pratica guidata invece della teoria passiva.
          </p>
        </section>

        {/* Key Strengths */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" />
            Punti di Forza Distintivi
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">100% Browser-Based</h3>
                  <p className="text-muted-foreground">
                    Nessuna installazione richiesta. Funziona su qualsiasi dispositivo (Windows, Mac, tablet, Smart TV) con un semplice browser web.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Deployment Flessibile</h3>
                  <p className="text-muted-foreground">
                    Modalità aula per sessioni di gruppo con proiettore/TV e modalità individuale per formazione autonoma in azienda.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Rapido da Implementare</h3>
                  <p className="text-muted-foreground">
                    Deploy immediato: basta un computer e un proiettore. Nessuna configurazione IT complessa o supporto tecnico necessario.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Tracciabilità Completa</h3>
                  <p className="text-muted-foreground">
                    Registro formazione automatico, export Excel per DVR, matrici rischio/formazione, report audit ispettivi.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Gamification Didattica</h3>
                  <p className="text-muted-foreground">
                    Non intrattenimento, ma strumento di valutazione. Meccaniche di gioco al servizio dell'apprendimento pratico.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Multi-Tenant Sicuro</h3>
                  <p className="text-muted-foreground">
                    Architettura multi-aziendale con gestione ruoli (admin, aziende clienti, dipendenti) e protezione dati completa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Training Modules */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary" />
            Moduli Formativi Disponibili
          </h2>
          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="text-xl font-bold mb-2">🏃 Safety Run - Rischi Generali</h3>
              <p className="text-muted-foreground mb-2">
                Modulo generale per identificazione rischi comuni: cadute, inciampi, ordine e pulizia, comportamenti rischiosi, valutazione rischi in tempo reale.
              </p>
              <span className="text-sm font-semibold text-primary">Target: Tutti i settori</span>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="text-xl font-bold mb-2">🏢 Office Hazard Quest - Uffici e Videoterminali</h3>
              <p className="text-muted-foreground mb-2">
                Ambienti office/VDT: postura corretta, lavoro al videoterminale, pause obbligatorie, ergonomia della postazione.
              </p>
              <span className="text-sm font-semibold text-primary">Target: Ambienti d'ufficio</span>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="text-xl font-bold mb-2">📦 Magazzino 2.5D - Gestione Materiali</h3>
              <p className="text-muted-foreground mb-2">
                Magazzino e movimentazione: carrelli elevatori, movimentazione manuale carichi, segnaletica, interazione pedoni/mezzi.
              </p>
              <span className="text-sm font-semibold text-primary">Target: Logistica e magazzini</span>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="text-xl font-bold mb-2">🚨 Emergenza! - Procedure di Evacuazione</h3>
              <p className="text-muted-foreground mb-2">
                Procedure di emergenza: allarmi, evacuazione, riconoscimento ostacoli, percorsi sicuri, comportamento in emergenza.
              </p>
              <span className="text-sm font-semibold text-primary">Target: Tutti i settori</span>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="text-xl font-bold mb-2">⚙️ Personalizzazioni Custom</h3>
              <p className="text-muted-foreground mb-2">
                Ambienti, procedure e scenari specifici del cliente renderizzati in grafica 2.5D/3D semplificata.
              </p>
              <span className="text-sm font-semibold text-primary">Target: Su richiesta cliente</span>
            </div>
          </div>
        </section>

        {/* Regulatory Compliance */}
        <section className="mb-12 p-8 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-accent" />
            Conformità Normativa
          </h2>
          
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">✅ Accordo Stato-Regioni 2025</h3>
            <p className="text-lg leading-relaxed mb-4">
              Piattaforma progettata in piena conformità con l'Accordo Stato-Regioni 2025, che riconosce ufficialmente la gamification 
              come metodologia didattica per la formazione obbligatoria sulla sicurezza sul lavoro.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-background/50">
                <CheckCircle className="w-6 h-6 text-accent mb-2" />
                <h4 className="font-bold mb-1">Metodologie Attive</h4>
                <p className="text-sm text-muted-foreground">Partecipazione diretta e decisioni attive</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <CheckCircle className="w-6 h-6 text-accent mb-2" />
                <h4 className="font-bold mb-1">Gamification Didattica</h4>
                <p className="text-sm text-muted-foreground">Strumento di valutazione, non intrattenimento</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <CheckCircle className="w-6 h-6 text-accent mb-2" />
                <h4 className="font-bold mb-1">Simulazione Guidata</h4>
                <p className="text-sm text-muted-foreground">Scenari realistici di produzione</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">✅ D.Lgs. 81/08</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-lg">Requisiti Soddisfatti:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Formazione generale e specifica</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Valutazione dell'apprendimento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Registro formazione automatico</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Tracciabilità completa delle attività</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-lg">Report e Documentazione:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Export Excel per DVR</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Matrice rischio/formazione</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Report per audit ispettivi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>Attestati di partecipazione automatici</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Features */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-primary" />
            Caratteristiche Tecniche
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Architettura e Tecnologia</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span><strong>Frontend:</strong> React + TypeScript + Vite</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span><strong>3D Engine:</strong> Three.js (@react-three/fiber)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span><strong>Backend:</strong> Supabase (PostgreSQL, Auth, Storage)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span><strong>Audio:</strong> Sistema audio spaziale 3D (Web Audio API)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span><strong>Certificati:</strong> Generazione PDF con QR code e firma digitale</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Funzionalità Avanzate</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Sistema achievements e leaderboard globale</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Replay gameplay con export video MP4 (1080p)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Confronto performance side-by-side</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Mini-mappa con indicatori di rischio</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Sistema di collisione fisica realistica</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Notifiche email automatiche (certificati, reminder)</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Target Market */}
        <section className="mb-12 p-8 rounded-xl bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Users className="w-8 h-8 text-secondary" />
            Target di Mercato
          </h2>
          <div className="space-y-4">
            <p className="text-lg leading-relaxed">
              <strong>Mercato Primario:</strong> PMI e piccole imprese italiane che necessitano di formazione obbligatoria sulla sicurezza 
              ma hanno budget e risorse IT limitate.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-background/50">
                <h4 className="font-bold mb-2">Settore Manifatturiero</h4>
                <p className="text-sm text-muted-foreground">Piccole e medie fabbriche, laboratori artigiani</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <h4 className="font-bold mb-2">Logistica e Magazzini</h4>
                <p className="text-sm text-muted-foreground">Centri distribuzione, depositi, autotrasporti</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <h4 className="font-bold mb-2">Servizi e Uffici</h4>
                <p className="text-sm text-muted-foreground">Aziende terziarie, studi professionali, coworking</p>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Perché Scegliere Safety Frontline?</h2>
          <div className="p-8 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Efficienza Operativa</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Deploy in <strong>meno di 5 minuti</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Nessuna formazione IT richiesta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Aggiornamenti automatici senza downtime</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Supporto multi-dispositivo nativo</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-accent">ROI Formativo</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">✓</span>
                    <span><strong>+70% engagement</strong> vs formazione tradizionale</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">✓</span>
                    <span>Riduzione tempi formativi del 40%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">✓</span>
                    <span>Tracciabilità e compliance garantiti</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">✓</span>
                    <span>Miglioramento retention conoscenze</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="text-center p-8 rounded-xl bg-gradient-to-br from-primary to-accent text-white">
          <h2 className="text-3xl font-bold mb-4">
            Trasforma la Formazione Sicurezza in un'Esperienza Coinvolgente
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Gamification professionale. Conformità normativa. Zero complessità tecnica.
          </p>
          <Link to="/">
            <Button size="lg" variant="secondary" className="font-bold">
              Richiedi Preventivo
            </Button>
          </Link>
        </section>

        {/* Print Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground print:hidden">
          <p>Per salvare questa scheda tecnica, utilizza il pulsante "Scarica PDF" in alto o stampa questa pagina (Ctrl+P / Cmd+P)</p>
        </div>
      </main>
    </div>
  );
};

export default TechnicalSheet;
