import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package, Building2, Warehouse, AlertCircle, Settings,
  Shield, Monitor, Brain, Zap, Thermometer,
  Cog, FlaskConical, Volume2, Truck, Flame, Heart,
  Box, ArrowUp, Bug, AlertTriangle,
  Bell, Bot, Trophy, Users, FileCheck, Gamepad2,
  GraduationCap, Target, Lock, ShieldAlert, Wifi, KeyRound, Mail,
  Briefcase, Crown, Eye
} from "lucide-react";
import officeModule from "@/assets/office-module.jpg";
import warehouseModule from "@/assets/warehouse-module.jpg";
import { QuoteRequestDialog } from "@/components/QuoteRequestDialog";

type TabKey = 'generale' | 'basso' | 'medio' | 'alto' | 'ruolo' | 'cybersecurity' | 'simulazioni' | 'piattaforma';

export const Modules = () => {
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('generale');

  const tabs: { key: TabKey; label: string; icon: typeof Shield; badge?: string }[] = [
    { key: 'generale', label: 'Formazione Generale', icon: GraduationCap, badge: '7 moduli' },
    { key: 'basso', label: 'Rischio Basso', icon: Building2, badge: '4 moduli' },
    { key: 'medio', label: 'Rischio Medio', icon: Cog, badge: '8 moduli' },
    { key: 'alto', label: 'Rischio Alto', icon: AlertTriangle, badge: '8 moduli' },
    { key: 'ruolo', label: 'Corsi di Ruolo', icon: Crown, badge: '3 corsi' },
    { key: 'cybersecurity', label: 'Cybersecurity', icon: Lock, badge: 'nuovo' },
    { key: 'simulazioni', label: 'Simulazioni 3D', icon: Gamepad2, badge: '4 scenari' },
    { key: 'piattaforma', label: 'Piattaforma', icon: Settings },
  ];

  const modules: Record<TabKey, { icon: typeof Shield; title: string; subtitle: string; description: string; color: string; image?: string | null }[]> = {
    generale: [
      { icon: Shield, title: "Concetti Base", subtitle: "Legislazione e Obblighi", description: "D.Lgs 81/08, diritti e doveri dei lavoratori, organigramma della sicurezza e figure chiave.", color: "primary" },
      { icon: AlertCircle, title: "Rischi e Prevenzione", subtitle: "Valutazione dei Rischi", description: "Identificazione dei pericoli, valutazione dei rischi, misure di prevenzione e protezione.", color: "secondary" },
      { icon: Flame, title: "Emergenze", subtitle: "Procedure di Evacuazione", description: "Piano di emergenza, vie di fuga, punti di raccolta, primo soccorso base e antincendio.", color: "destructive" },
      { icon: FileCheck, title: "Test Finale", subtitle: "Verifica Apprendimento", description: "Boss test con domande avanzate, punteggio minimo 70%, certificato digitale con QR code.", color: "accent" },
      { icon: Briefcase, title: "Lavoratori Specifica", subtitle: "Formazione Specifica per Settore di Rischio", description: "Formazione obbligatoria ai sensi dell'art. 37 D.Lgs 81/08 e Accordo Stato-Regioni. Contenuti calibrati sul livello di rischio aziendale (basso 4h, medio 8h, alto 12h): rischi specifici della mansione, DPI dedicati, procedure operative di sicurezza, gestione emergenze settoriali e aggiornamento quinquennale di 6 ore.", color: "muted" },
    ],
    basso: [
      { icon: Monitor, title: "Videoterminali e Postura", subtitle: "Rischi da VDT e Ergonomia", description: "Utilizzo corretto del videoterminale, pause, postura e illuminazione per prevenire disturbi.", color: "primary" },
      { icon: Brain, title: "Stress Lavoro-Correlato", subtitle: "Benessere Organizzativo", description: "Identificazione, prevenzione e gestione dello stress da lavoro. Burnout e rischi psicosociali.", color: "secondary" },
      { icon: Zap, title: "Rischio Elettrico Base", subtitle: "Sicurezza Ambienti Civili", description: "Rischi elettrici in ufficio e ambienti civili, comportamenti corretti e primo intervento.", color: "accent" },
      { icon: Thermometer, title: "Microclima ed Emergenze", subtitle: "Comfort Ambientale", description: "Gestione del microclima, illuminazione, rumore in ufficio. Procedure di evacuazione.", color: "muted" },
    ],
    medio: [
      { icon: Cog, title: "Rischi Meccanici", subtitle: "Attrezzature e Macchinari", description: "Identificazione e prevenzione rischi legati all'uso di attrezzature di lavoro e macchine.", color: "primary" },
      { icon: Package, title: "Movimentazione Manuale", subtitle: "Sollevamento e Trasporto", description: "Tecniche corrette di sollevamento, metodo NIOSH e prevenzione patologie dorso-lombari.", color: "secondary" },
      { icon: Zap, title: "Rischio Elettrico Avanzato", subtitle: "Impianti e Manutenzione", description: "Lavori elettrici in prossimità, categorie PES/PAV, interventi in sicurezza su impianti.", color: "accent" },
      { icon: Volume2, title: "Agenti Fisici", subtitle: "Rumore, Vibrazioni, Radiazioni", description: "Esposizione a rumore, vibrazioni meccaniche, campi elettromagnetici. Valori limite e DPI.", color: "destructive" },
      { icon: FlaskConical, title: "Sostanze Pericolose", subtitle: "Classificazione CLP e SDS", description: "Etichettatura GHS/CLP, schede di sicurezza, stoccaggio e manipolazione sostanze chimiche.", color: "primary" },
      { icon: AlertCircle, title: "Cadute dall'Alto", subtitle: "Lavori in Quota e DPI III Cat.", description: "Prevenzione cadute, sistemi di protezione collettiva e individuale, parapetti e reti.", color: "destructive" },
      { icon: Flame, title: "Rischio Incendio", subtitle: "Prevenzione e Gestione", description: "Triangolo del fuoco, classi di incendio, estintori, piani di emergenza ed evacuazione.", color: "secondary" },
      { icon: Heart, title: "Primo Soccorso", subtitle: "BLS e Gestione Emergenze", description: "Attivazione catena del soccorso, BLS, gestione emorragie, fratture, ustioni e shock.", color: "accent" },
    ],
    alto: [
      { icon: Cog, title: "Rischi Meccanici Avanzati", subtitle: "Macchine Complesse", description: "Sicurezza su macchine industriali, robot, presse e linee automatizzate. Direttiva Macchine.", color: "destructive" },
      { icon: FlaskConical, title: "Rischio Chimico Avanzato", subtitle: "Agenti Cancerogeni", description: "Esposizione ad agenti chimici pericolosi, cancerogeni e mutageni. REACH/CLP.", color: "primary" },
      { icon: Bug, title: "Rischio Biologico", subtitle: "Agenti Biologici", description: "Classificazione agenti biologici, livelli di contenimento, DPI specifici, decontaminazione.", color: "accent" },
      { icon: AlertTriangle, title: "Amianto e Fibre", subtitle: "Bonifica e Protezione", description: "Riconoscimento materiali con amianto, procedure di bonifica, DPI respiratori.", color: "destructive" },
      { icon: Box, title: "Spazi Confinati", subtitle: "Accesso e Soccorso", description: "Procedure di accesso in sicurezza, rilevazione atmosfere, sistemi di recupero.", color: "secondary" },
      { icon: ArrowUp, title: "Lavori in Quota Avanzato", subtitle: "Ponteggi e Funi", description: "Montaggio/smontaggio ponteggi, lavori su fune, sistemi anticaduta avanzati (PiMUS).", color: "primary" },
      { icon: Truck, title: "Movimentazione Meccanica", subtitle: "Carrelli, Gru e Mezzi", description: "Conduzione sicura di carrelli elevatori, gru, piattaforme aeree. Segnaletica.", color: "accent" },
      { icon: Heart, title: "Primo Soccorso Avanzato", subtitle: "Emergenze Industriali", description: "Gestione emergenze in ambienti ad alto rischio, triage, decontaminazione e DAE.", color: "muted" },
    ],
    ruolo: [
      { icon: Crown, title: "RSPP Datore di Lavoro", subtitle: "Art. 34 D.Lgs 81/08", description: "Il DL come RSPP: responsabilità, DVR, gestione rischi, ciclo PDCA, near miss reporting. 16-48 ore per livello di rischio.", color: "destructive" },
      { icon: Users, title: "RLS", subtitle: "Rappresentante Lavoratori", description: "Corso 32 ore: elezione, attribuzioni art. 50, consultazione preventiva, accesso DVR, ricorso alle autorità competenti.", color: "accent" },
      { icon: Eye, title: "Corso Preposto", subtitle: "Vigilanza e Intervento", description: "Obblighi aggiornati alla L. 215/2021: vigilanza, intervento diretto, interruzione attività, aggiornamento biennale.", color: "secondary" },
    ],
    cybersecurity: [
      { icon: Mail, title: "Phishing & Social Engineering", subtitle: "Riconoscere le Trappole", description: "Identificare email fraudolente, spear phishing, vishing e tecniche di manipolazione. Scenari interattivi realistici.", color: "destructive" },
      { icon: KeyRound, title: "Password & Autenticazione", subtitle: "Credenziali Sicure", description: "Creare password robuste, usare password manager e autenticazione a due fattori (2FA). Best practice quotidiane.", color: "primary" },
      { icon: ShieldAlert, title: "Ransomware & Malware", subtitle: "Difesa e Reazione", description: "Come si viene infettati, prevenzione, procedure di emergenza. Numeri e impatto economico sulle PMI italiane.", color: "accent" },
      { icon: Wifi, title: "Protezione Dati & GDPR", subtitle: "Smart Working Sicuro", description: "Classificazione dati, clean desk policy, VPN, WiFi pubbliche. Obblighi GDPR e sanzioni per le aziende.", color: "secondary" },
      { icon: Shield, title: "Incident Response", subtitle: "Reagire agli Attacchi", description: "Catena di segnalazione, cosa fare (e non fare) in caso di incidente. Scenari con dialoghi NPC realistici.", color: "muted" },
      { icon: Trophy, title: "Boss Test Finale", subtitle: "Verifica Cybersecurity", description: "6 domande avanzate su scenari reali: CEO Fraud, baiting, data breach. Punteggio minimo 70% per il certificato.", color: "primary" },
    ],
    simulazioni: [
      { icon: Package, title: "Safety Run", subtitle: "Rischi Generali 3D", description: "Percorso in prima persona con cadute, inciampi, ordine & pulizia e valutazione rischi in tempo reale.", color: "primary" },
      { icon: Building2, title: "Office Hazard Quest", subtitle: "Uffici & VDT", description: "Simulazione 3D per PMI del terziario: postura, videoterminale, pause, micro-ergonomia.", color: "secondary", image: officeModule },
      { icon: Warehouse, title: "Magazzino 2.5D", subtitle: "Carrelli & Movimentazione", description: "Muletti, movimentazione manuale, segnaletica, interazione pedoni/mezzi in ambiente 3D.", color: "accent", image: warehouseModule },
      { icon: Lock, title: "Cyber Security Office", subtitle: "Rischi Informatici 3D", description: "Identifica post-it con password, schermi non bloccati, email di phishing e chiavette USB sospette in un ufficio 3D.", color: "destructive" },
    ],
    piattaforma: [
      { icon: Bell, title: "Notifiche Smart", subtitle: "In-App & Email", description: "Notifiche automatiche per completamento moduli, scadenze, assegnazione settori e promemoria giornalieri.", color: "primary" },
      { icon: Bot, title: "AI Tutor", subtitle: "Assistente Intelligente", description: "Tutor AI integrato che risponde a domande sulla sicurezza e guida il percorso formativo.", color: "secondary" },
      { icon: Trophy, title: "Gamification", subtitle: "XP, Badge e Leaderboard", description: "Sistema di punti esperienza, badge di completamento, livelli e classifiche tra colleghi.", color: "accent" },
      { icon: Users, title: "Sfide Multiplayer", subtitle: "Competizioni tra Colleghi", description: "Sfida i colleghi sui moduli formativi, confronta punteggi e scala la classifica aziendale.", color: "destructive" },
      { icon: FileCheck, title: "Certificati Digitali", subtitle: "QR Code Verificabile", description: "Certificati con QR code univoco, esportazione batch per l'azienda e verifica pubblica online.", color: "primary" },
      { icon: Target, title: "Percorsi Adattivi", subtitle: "Formazione Personalizzata", description: "Contenuti che si adattano al settore di rischio e al ruolo del dipendente in azienda.", color: "muted" },
    ],
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      primary: "from-primary/10 to-primary/5 border-primary/20",
      secondary: "from-secondary/10 to-secondary/5 border-secondary/20",
      accent: "from-accent/10 to-accent/5 border-accent/20",
      destructive: "from-destructive/10 to-destructive/5 border-destructive/20",
      muted: "from-muted to-muted/50 border-border"
    };
    return colors[color] || colors.muted;
  };

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      primary: "text-primary",
      secondary: "text-secondary",
      accent: "text-accent",
      destructive: "text-destructive",
      muted: "text-muted-foreground"
    };
    return colors[color] || colors.muted;
  };

  const currentModules = modules[activeTab];

  return (
    <section className="py-20 bg-muted/30" id="moduli">
      <div className="container px-4 mx-auto">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              I Moduli del Sistema <span className="text-primary">Safety Frontline</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              29 moduli formativi, 4 simulazioni 3D e una piattaforma completa per la formazione sulla sicurezza nelle PMI italiane.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge && (
                    <Badge variant={isActive ? "secondary" : "outline"} className="text-xs px-1.5 py-0">
                      {tab.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Modules Grid */}
          <div className={`grid gap-6 ${currentModules.length <= 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            {currentModules.map((module, index) => (
              <Card
                key={`${activeTab}-${index}`}
                className={`p-5 bg-gradient-to-br ${getColorClasses(module.color)} border hover:shadow-lg transition-all duration-300 animate-scale-in group`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {module.image && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={module.image}
                      alt={module.title}
                      className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-background/50 shrink-0">
                    <module.icon className={`w-6 h-6 ${getIconColor(module.color)}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold leading-tight">{module.title}</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{module.subtitle}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {module.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 mb-8">
            {[
              { value: "29+", label: "Moduli Formativi", icon: GraduationCap },
              { value: "4", label: "Simulazioni 3D", icon: Gamepad2 },
              { value: "3", label: "Settori di Rischio", icon: Shield },
              { value: "∞", label: "Personalizzazioni", icon: Settings },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-background/50 border border-border">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center p-8 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-border">
            <h3 className="text-2xl font-bold mb-3">
              Tutti i moduli sono economicamente sostenibili per le PMI
            </h3>
            <p className="text-muted-foreground mb-6">
              Grafica semplice e adattabile, con notifiche automatiche, AI tutor e certificati digitali inclusi.
            </p>
            <Button variant="hero" size="lg" onClick={() => setQuoteDialogOpen(true)}>
              Scopri i Piani Disponibili
            </Button>
          </div>

          <QuoteRequestDialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen} />
        </div>
      </div>
    </section>
  );
};
