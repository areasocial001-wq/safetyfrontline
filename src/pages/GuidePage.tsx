import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Download, Shield, Gamepad2, GraduationCap, Building2,
  Cog, AlertTriangle, Crown, Lock, Settings, Users, Database,
  Zap, Monitor, Brain, FlaskConical, Volume2, Heart, Box, Truck,
  Flame, Bug, ArrowUp, FileCheck, Bell, Bot, Trophy, Target,
  Eye, Mail, KeyRound, ShieldAlert, Wifi, Briefcase, BookOpen,
  Layers, Cpu, Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const GuidePage = () => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const generatePDF = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      const addPage = () => { doc.addPage(); y = 20; };
      const checkPage = (needed: number) => { if (y + needed > 275) addPage(); };

      const addTitle = (text: string, size = 18) => {
        checkPage(15);
        doc.setFontSize(size);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 64, 175);
        doc.text(text, margin, y);
        y += size * 0.5 + 4;
      };

      const addSubtitle = (text: string) => {
        checkPage(12);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text(text, margin, y);
        y += 8;
      };

      const addBody = (text: string) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        const lines = doc.splitTextToSize(text, contentWidth);
        for (const line of lines) {
          checkPage(6);
          doc.text(line, margin, y);
          y += 5;
        }
        y += 3;
      };

      const addBullet = (text: string) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        const lines = doc.splitTextToSize(text, contentWidth - 6);
        checkPage(6);
        doc.text("•", margin + 2, y);
        for (let i = 0; i < lines.length; i++) {
          if (i > 0) checkPage(5);
          doc.text(lines[i], margin + 7, y);
          y += 5;
        }
      };

      // Cover
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 64, 175);
      doc.text("Safety Frontline", pageWidth / 2, 60, { align: "center" });
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Guida Completa alla Piattaforma", pageWidth / 2, 72, { align: "center" });
      doc.setFontSize(10);
      doc.text("Formazione sulla sicurezza sul lavoro per PMI italiane", pageWidth / 2, 82, { align: "center" });
      doc.text(`Versione aggiornata al ${new Date().toLocaleDateString("it-IT")}`, pageWidth / 2, 92, { align: "center" });
      
      // Content
      addPage();

      addTitle("Panoramica");
      addBody("Safety Frontline è una piattaforma completa per la formazione obbligatoria sulla sicurezza nelle PMI italiane, conforme al D.Lgs 81/08 e all'Accordo Stato-Regioni.");
      addBullet("29+ moduli formativi organizzati per livello di rischio");
      addBullet("4 simulazioni 3D in prima persona con motore Babylon.js");
      addBullet("Quiz cybersecurity con 30 varianti per rigiocabilità");
      addBullet("Certificati digitali con QR code verificabile");
      addBullet("AI Tutor integrato per assistenza formativa");
      addBullet("Gamification: XP, badge, leaderboard, sfide multiplayer");
      y += 5;

      addTitle("Moduli Formativi");

      addSubtitle("Formazione Generale (5 moduli)");
      addBullet("Concetti Base — D.Lgs 81/08, diritti/doveri, organigramma sicurezza");
      addBullet("Rischi e Prevenzione — Valutazione rischi, misure di prevenzione");
      addBullet("Emergenze — Piano emergenza, evacuazione, primo soccorso base");
      addBullet("Test Finale — Boss test, punteggio min. 70%, certificato QR");
      addBullet("Lavoratori Specifica — Art. 37 D.Lgs 81/08, rischio basso 4h, medio 8h, alto 12h");
      y += 3;

      addSubtitle("Rischio Basso (4 moduli)");
      addBody("Videoterminali e postura, stress lavoro-correlato, rischio elettrico base, microclima ed emergenze.");

      addSubtitle("Rischio Medio (8 moduli)");
      addBody("Rischi meccanici, movimentazione manuale (NIOSH), rischio elettrico avanzato, agenti fisici, sostanze pericolose (CLP), cadute dall'alto, rischio incendio, primo soccorso (BLS).");

      addSubtitle("Rischio Alto (8 moduli)");
      addBody("Macchine industriali, rischio chimico/cancerogeni (REACH/CLP), rischio biologico, amianto, spazi confinati, lavori in quota (PiMUS), movimentazione meccanica, primo soccorso avanzato.");

      addSubtitle("Corsi di Ruolo (3 corsi)");
      addBullet("RSPP Datore di Lavoro — Art. 34, DVR, PDCA, 16-48h per rischio");
      addBullet("RLS — 32h, art. 50, consultazione preventiva");
      addBullet("Preposto — L. 215/2021, vigilanza, aggiornamento biennale");
      y += 5;

      addTitle("Simulazioni 3D");
      addBullet("Safety Run — Rischi generali, cadute, inciampi, valutazione real-time");
      addBullet("Office Hazard Quest — Uffici, postura, videoterminale, micro-ergonomia");
      addBullet("Magazzino 2.5D — Carrelli, movimentazione, segnaletica, interazione pedoni/mezzi");
      addBullet("Cyber Security Office — Post-it password, schermi non bloccati, phishing, USB sospette");
      y += 3;
      addSubtitle("Funzionalità 3D");
      addBullet("Controlli: WASD + mouse, joystick virtuale touch, giroscopio mobile");
      addBullet("NPC interattivi con dialoghi e quiz contestuali");
      addBullet("Sistema antincendio: selezione estintori per classe fuoco");
      addBullet("HUD: minimap, radar prossimità, barra pericolo, contatore evacuazione");
      addBullet("Replay: registrazione, confronto sessioni, picture-in-picture");
      addBullet("LOD system: livelli di dettaglio adattivi per performance");
      y += 5;

      addTitle("Sistema Cybersecurity");
      addBody("6 sezioni formative: Phishing & Social Engineering, Password & Autenticazione, Ransomware & Malware, Protezione Dati & GDPR, Incident Response, Boss Test Finale.");
      addBody("30 varianti di domande nel quiz 3D distribuite su 8 categorie di rischio: Social Engineering, Sicurezza Tecnica, Sicurezza di Rete, Conformità Fisica.");
      y += 5;

      addTitle("Gamification");
      addBullet("XP e Livelli per completamento moduli e simulazioni");
      addBullet("Badge per categorie (completamento, velocità, punteggio perfetto)");
      addBullet("Leaderboard tra colleghi della stessa azienda");
      addBullet("Sfide Multiplayer su moduli specifici");
      addBullet("Percorsi Adattivi per settore di rischio e ruolo");
      y += 5;

      addTitle("Dashboard e Ruoli");
      addSubtitle("Admin");
      addBody("Statistiche globali, gestione utenti/ruoli, configurazione tempi, analytics formazione, controllo promemoria.");
      addSubtitle("Azienda");
      addBody("Statistiche aziendali, gestione dipendenti, assegnazione settori, report compliance, certificati batch, export PDF.");
      addSubtitle("Dipendente");
      addBody("Statistiche personali (XP, livello), progresso moduli, sessioni recenti, certificati, notifiche.");
      y += 5;

      addTitle("Funzionalità Piattaforma");
      addBullet("Notifiche Smart in-app ed email");
      addBullet("AI Tutor per assistenza formativa");
      addBullet("Certificati Digitali con QR code e verifica pubblica");
      addBullet("Sound Studio per generazione effetti sonori");
      addBullet("Profilo Giocatore con statistiche 3D e achievement");
      addBullet("Reset Password con email di recupero");

      // Footer on every page
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Safety Frontline — Guida Completa`, margin, 290);
        doc.text(`Pagina ${i} di ${totalPages}`, pageWidth - margin, 290, { align: "right" });
      }

      doc.save("Safety_Frontline_Guida.pdf");
    } finally {
      setDownloading(false);
    }
  };

  const sections = [
    {
      id: "panoramica",
      title: "Panoramica",
      icon: Shield,
      content: (
        <div className="space-y-3">
          <p className="text-muted-foreground">Safety Frontline è una piattaforma completa per la formazione obbligatoria sulla sicurezza nelle PMI italiane, conforme al <strong>D.Lgs 81/08</strong> e all'<strong>Accordo Stato-Regioni</strong>.</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" /><span><strong>29+ moduli formativi</strong> organizzati per livello di rischio (basso, medio, alto)</span></li>
            <li className="flex items-start gap-2"><Gamepad2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /><span><strong>4 simulazioni 3D</strong> in prima persona con motore Babylon.js</span></li>
            <li className="flex items-start gap-2"><Lock className="w-4 h-4 text-primary mt-0.5 shrink-0" /><span><strong>Quiz cybersecurity</strong> con 30 varianti per massima rigiocabilità</span></li>
            <li className="flex items-start gap-2"><FileCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" /><span><strong>Certificati digitali</strong> con QR code verificabile pubblicamente</span></li>
            <li className="flex items-start gap-2"><Bot className="w-4 h-4 text-primary mt-0.5 shrink-0" /><span><strong>AI Tutor</strong> integrato per assistenza formativa</span></li>
            <li className="flex items-start gap-2"><Trophy className="w-4 h-4 text-primary mt-0.5 shrink-0" /><span><strong>Gamification completa</strong>: XP, badge, leaderboard, sfide multiplayer</span></li>
          </ul>
        </div>
      ),
    },
    {
      id: "moduli",
      title: "Moduli Formativi",
      icon: GraduationCap,
      content: (
        <div className="space-y-6">
          {[
            { label: "Formazione Generale", badge: "5 moduli", icon: GraduationCap, items: [
              { icon: Shield, name: "Concetti Base", desc: "D.Lgs 81/08, diritti/doveri, organigramma sicurezza" },
              { icon: AlertTriangle, name: "Rischi e Prevenzione", desc: "Valutazione rischi, misure di prevenzione" },
              { icon: Flame, name: "Emergenze", desc: "Piano emergenza, evacuazione, primo soccorso base" },
              { icon: FileCheck, name: "Test Finale", desc: "Boss test, punteggio min. 70%, certificato QR" },
              { icon: Briefcase, name: "Lavoratori Specifica", desc: "Art. 37, rischio basso 4h, medio 8h, alto 12h" },
            ]},
            { label: "Rischio Basso", badge: "4 moduli", icon: Building2, items: [
              { icon: Monitor, name: "Videoterminali e Postura", desc: "VDT, ergonomia, illuminazione" },
              { icon: Brain, name: "Stress Lavoro-Correlato", desc: "Burnout, rischi psicosociali" },
              { icon: Zap, name: "Rischio Elettrico Base", desc: "Sicurezza ambienti civili" },
              { icon: Settings, name: "Microclima ed Emergenze", desc: "Comfort ambientale, evacuazione" },
            ]},
            { label: "Rischio Medio", badge: "8 moduli", icon: Cog, items: [
              { icon: Cog, name: "Rischi Meccanici", desc: "Attrezzature e macchinari" },
              { icon: Box, name: "Movimentazione Manuale", desc: "NIOSH, patologie dorso-lombari" },
              { icon: Zap, name: "Rischio Elettrico Avanzato", desc: "PES/PAV, impianti" },
              { icon: Volume2, name: "Agenti Fisici", desc: "Rumore, vibrazioni, radiazioni" },
              { icon: FlaskConical, name: "Sostanze Pericolose", desc: "CLP, schede di sicurezza" },
              { icon: AlertTriangle, name: "Cadute dall'Alto", desc: "DPI III Cat., parapetti" },
              { icon: Flame, name: "Rischio Incendio", desc: "Classi, estintori, evacuazione" },
              { icon: Heart, name: "Primo Soccorso", desc: "BLS, emorragie, fratture" },
            ]},
            { label: "Rischio Alto", badge: "8 moduli", icon: AlertTriangle, items: [
              { icon: Cog, name: "Rischi Meccanici Avanzati", desc: "Direttiva Macchine, robot" },
              { icon: FlaskConical, name: "Rischio Chimico Avanzato", desc: "REACH/CLP, cancerogeni" },
              { icon: Bug, name: "Rischio Biologico", desc: "Agenti biologici, contenimento" },
              { icon: AlertTriangle, name: "Amianto e Fibre", desc: "Bonifica, DPI respiratori" },
              { icon: Box, name: "Spazi Confinati", desc: "Atmosfere, sistemi recupero" },
              { icon: ArrowUp, name: "Lavori in Quota", desc: "Ponteggi, funi, PiMUS" },
              { icon: Truck, name: "Movimentazione Meccanica", desc: "Carrelli, gru, piattaforme" },
              { icon: Heart, name: "Primo Soccorso Avanzato", desc: "Triage, decontaminazione, DAE" },
            ]},
            { label: "Corsi di Ruolo", badge: "3 corsi", icon: Crown, items: [
              { icon: Crown, name: "RSPP Datore di Lavoro", desc: "Art. 34, DVR, PDCA, 16-48h" },
              { icon: Users, name: "RLS", desc: "32h, art. 50, consultazione preventiva" },
              { icon: Eye, name: "Preposto", desc: "L. 215/2021, vigilanza, aggiorn. biennale" },
            ]},
          ].map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-3">
                <group.icon className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">{group.label}</h3>
                <Badge variant="secondary" className="text-xs">{group.badge}</Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <div key={item.name} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                    <item.icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "simulazioni",
      title: "Simulazioni 3D",
      icon: Gamepad2,
      content: (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { name: "Safety Run", sub: "Rischi Generali", desc: "Cadute, inciampi, valutazione rischi real-time" },
              { name: "Office Hazard Quest", sub: "Uffici & VDT", desc: "Postura, videoterminale, micro-ergonomia" },
              { name: "Magazzino 2.5D", sub: "Carrelli & Movimentazione", desc: "Muletti, segnaletica, interazione pedoni/mezzi" },
              { name: "Cyber Security Office", sub: "Rischi Informatici", desc: "Post-it password, phishing, USB sospette" },
            ].map((s) => (
              <Card key={s.name} className="p-3 bg-muted/30 border">
                <p className="font-semibold text-sm">{s.name}</p>
                <p className="text-xs text-primary font-medium">{s.sub}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
              </Card>
            ))}
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-sm mb-2">Funzionalità 3D</h4>
            <div className="grid sm:grid-cols-2 gap-1.5 text-xs text-muted-foreground">
              {[
                "Controlli WASD + mouse, joystick touch, giroscopio",
                "NPC interattivi con dialoghi e quiz",
                "Sistema antincendio con selezione estintori",
                "HUD: minimap, radar, barra pericolo",
                "Replay con confronto sessioni e PiP",
                "LOD system per performance adattive",
                "Generazione procedurale rischi",
                "Calibrazione mouse e impostazioni grafiche",
              ].map((f) => (
                <div key={f} className="flex items-start gap-1.5">
                  <span className="text-primary">•</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "cybersecurity",
      title: "Sistema Cybersecurity",
      icon: Lock,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">6 Sezioni Formative</h4>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                { icon: Mail, name: "Phishing & Social Engineering" },
                { icon: KeyRound, name: "Password & Autenticazione" },
                { icon: ShieldAlert, name: "Ransomware & Malware" },
                { icon: Wifi, name: "Protezione Dati & GDPR" },
                { icon: Shield, name: "Incident Response" },
                { icon: Trophy, name: "Boss Test Finale" },
              ].map((s) => (
                <div key={s.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <s.icon className="w-4 h-4 text-destructive shrink-0" />
                  <span className="text-sm">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-sm mb-1">30 Varianti Quiz 3D</h4>
            <p className="text-xs text-muted-foreground">Distribuite su 8 categorie: Social Engineering (CEO Fraud, smishing, baiting), Sicurezza Tecnica (credential stuffing, 2FA), Sicurezza di Rete (Evil Twin, VPN), Conformità Fisica (dumpster diving, Clean Desk Policy, GDPR).</p>
          </div>
        </div>
      ),
    },
    {
      id: "gamification",
      title: "Gamification",
      icon: Trophy,
      content: (
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            { icon: Zap, name: "XP e Livelli", desc: "Punti esperienza per completamento moduli e simulazioni" },
            { icon: Trophy, name: "Badge", desc: "Traguardi per completamento, velocità, punteggio perfetto" },
            { icon: Users, name: "Leaderboard", desc: "Classifiche tra colleghi della stessa azienda" },
            { icon: Gamepad2, name: "Sfide Multiplayer", desc: "Confronta punteggi su moduli specifici" },
            { icon: Target, name: "Percorsi Adattivi", desc: "Contenuti personalizzati per settore e ruolo" },
            { icon: Bell, name: "Achievement Popup", desc: "Notifiche in-app per traguardi sbloccati" },
          ].map((item) => (
            <div key={item.name} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
              <item.icon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "dashboard",
      title: "Dashboard e Ruoli",
      icon: Users,
      content: (
        <div className="space-y-4">
          {[
            { role: "Admin", path: "/admin", desc: "Statistiche globali, gestione utenti/ruoli, configurazione tempi, analytics formazione, controllo promemoria." },
            { role: "Azienda", path: "/company", desc: "Statistiche aziendali, gestione dipendenti, assegnazione settori, report compliance, certificati batch, export PDF." },
            { role: "Dipendente", path: "/employee", desc: "Statistiche personali (XP, livello), progresso moduli, sessioni recenti, certificati, notifiche." },
          ].map((d) => (
            <div key={d.role} className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{d.role}</Badge>
                <code className="text-xs text-muted-foreground">{d.path}</code>
              </div>
              <p className="text-sm text-muted-foreground">{d.desc}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "piattaforma",
      title: "Funzionalità Piattaforma",
      icon: Settings,
      content: (
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            { icon: Bell, name: "Notifiche Smart", desc: "In-app ed email per completamenti e scadenze" },
            { icon: Bot, name: "AI Tutor", desc: "Assistente intelligente per domande sulla sicurezza" },
            { icon: FileCheck, name: "Certificati Digitali", desc: "QR code univoco con verifica pubblica" },
            { icon: Globe, name: "Scheda Tecnica", desc: "Documentazione tecnica online" },
            { icon: Layers, name: "Sound Studio", desc: "Generazione e test effetti sonori" },
            { icon: Cpu, name: "Profilo Giocatore", desc: "Statistiche 3D, achievement, replay" },
          ].map((item) => (
            <div key={item.name} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
              <item.icon className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "tech",
      title: "Stack Tecnologico",
      icon: Cpu,
      content: (
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          {[
            { label: "Frontend", value: "React 18, TypeScript, Vite" },
            { label: "UI", value: "Tailwind CSS, shadcn/ui, Lucide Icons" },
            { label: "3D Engine", value: "Babylon.js, Three.js/R3F" },
            { label: "State", value: "TanStack React Query" },
            { label: "Backend", value: "Lovable Cloud" },
            { label: "PDF", value: "jsPDF (certificati, report)" },
            { label: "Charts", value: "Recharts" },
            { label: "Routing", value: "React Router v6" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <span className="font-medium text-foreground">{t.label}:</span>
              <span className="text-muted-foreground">{t.value}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Homepage</span>
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="font-bold text-lg">Guida Safety Frontline</h1>
            </div>
            <Button onClick={generatePDF} disabled={downloading} size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{downloading ? "Generazione..." : "Scarica PDF"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 mx-auto py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quick nav */}
          <div className="flex flex-wrap gap-2 mb-8">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.title}
              </a>
            ))}
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <Card key={section.id} id={section.id} className="p-6 scroll-mt-20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">{section.title}</h2>
              </div>
              {section.content}
            </Card>
          ))}

          {/* Footer */}
          <div className="text-center py-8 text-sm text-muted-foreground">
            <p>Safety Frontline — Formazione sulla sicurezza intelligente per le PMI italiane 🇮🇹</p>
            <p className="mt-1">Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
