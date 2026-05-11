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
import cartoonConstruction from "@/assets/cartoon-construction.jpg";
import cartoonOffice from "@/assets/cartoon-office.jpg";
import cartoonWarehouse from "@/assets/cartoon-warehouse.jpg";
import cartoonKitchen from "@/assets/cartoon-kitchen.jpg";
import cartoonFactory from "@/assets/cartoon-factory.jpg";
import { SIM3D_PREVIEWS } from "@/data/sim3d-previews";
import { Sim3dPreview } from "@/components/Sim3dPreview";
import { QuoteRequestDialog } from "@/components/QuoteRequestDialog";

type TabKey = 'generale' | 'basso' | 'medio' | 'alto' | 'figure' | 'attrezzature' | 'cybersecurity' | 'simulazioni' | 'minigame2d' | 'piattaforma';

export const Modules = () => {
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('generale');

  const tabs: { key: TabKey; label: string; icon: typeof Shield; badge?: string }[] = [
    { key: 'generale', label: 'Formazione Generale', icon: GraduationCap, badge: '7 moduli' },
    { key: 'basso', label: 'Rischio Basso', icon: Building2, badge: '4 moduli' },
    { key: 'medio', label: 'Rischio Medio', icon: Cog, badge: '8 moduli' },
    { key: 'alto', label: 'Rischio Alto', icon: AlertTriangle, badge: '8 moduli' },
    { key: 'figure', label: 'Figure Sicurezza', icon: Crown, badge: '8 percorsi' },
    { key: 'attrezzature', label: 'Attrezzature', icon: Truck, badge: '8 abilitazioni' },
    { key: 'cybersecurity', label: 'Cybersecurity', icon: Lock, badge: 'nuovo' },
    { key: 'simulazioni', label: 'Simulazioni 3D', icon: Gamepad2, badge: '5 scenari' },
    { key: 'minigame2d', label: 'Spot the Hazard 2D', icon: Target, badge: '5 livelli' },
    { key: 'piattaforma', label: 'Piattaforma', icon: Settings },
  ];

  const modules: Record<TabKey, { icon: typeof Shield; title: string; subtitle: string; description: string; color: string; image?: string | null; comingSoon?: boolean }[]> = {
    generale: [
      { icon: Shield, title: "Concetti Base", subtitle: "Legislazione e Obblighi", description: "D.Lgs 81/08, diritti e doveri dei lavoratori, organigramma della sicurezza e figure chiave.", color: "primary" },
      { icon: AlertCircle, title: "Rischi e Prevenzione", subtitle: "Valutazione dei Rischi", description: "Identificazione dei pericoli, valutazione dei rischi, misure di prevenzione e protezione.", color: "secondary" },
      { icon: Flame, title: "Emergenze", subtitle: "Procedure di Evacuazione", description: "Piano di emergenza, vie di fuga, punti di raccolta, primo soccorso base e antincendio.", color: "destructive" },
      { icon: FileCheck, title: "Test Finale", subtitle: "Verifica Apprendimento", description: "Boss test con domande avanzate, punteggio minimo 70%, certificato digitale con QR code.", color: "accent" },
      { icon: Monitor, title: "Specifica Uffici", subtitle: "Rischio Basso – ATECO Uffici e Servizi", description: "Rischi VDT, ergonomia, microclima, stress lavoro-correlato, rischio elettrico e incendio in ambiente d'ufficio. 4 ore di formazione specifica.", color: "muted" },
      { icon: FlaskConical, title: "Specifica Aziende", subtitle: "Rischio Medio-Alto – Manifattura e Logistica", description: "Rischi meccanici, chimici, movimentazione carichi, rumore, vibrazioni, cadute dall'alto, macchine e attrezzature industriali. 8-12 ore.", color: "accent" },
      { icon: Flame, title: "Specifica Ristorazione", subtitle: "Rischio Medio – ATECO 55/56", description: "Rischi da taglio, ustione, scivolamento, agenti chimici alimentari, HACCP, movimentazione manuale e stress da servizio. 8 ore.", color: "destructive" },
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
    figure: [
      { icon: Crown, title: "RSPP Datore di Lavoro", subtitle: "Art. 34 D.Lgs 81/08", description: "Il DL come RSPP: responsabilità, DVR, gestione rischi, ciclo PDCA, near miss reporting. 16-48 ore per livello di rischio.", color: "destructive" },
      { icon: Users, title: "RLS", subtitle: "Rappresentante Lavoratori", description: "Corso 32 ore: elezione, attribuzioni art. 50, consultazione preventiva, accesso DVR, ricorso alle autorità competenti.", color: "accent" },
      { icon: Eye, title: "Corso Preposto", subtitle: "L. 215/2021", description: "Vigilanza, intervento diretto, interruzione attività pericolose, aggiornamento biennale obbligatorio.", color: "secondary" },
      { icon: Flame, title: "Addetto Antincendio", subtitle: "D.M. 2 Settembre 2021", description: "Prevenzione incendi, protezione attiva/passiva, esercitazioni pratiche con estintori in scenari 3D first-person.", color: "destructive" },
      { icon: Heart, title: "Addetto Primo Soccorso", subtitle: "D.M. 388/2003", description: "Allertamento soccorsi, BLS-DAE, gestione traumi, emorragie, ustioni, intossicazioni. Gruppi A, B e C.", color: "accent" },
      { icon: Shield, title: "ASPP Mod. A-B-C", subtitle: "Addetto SPP", description: "Supporto all'RSPP nelle attività di prevenzione: modulo base, specialistico per macrosettore e abilità relazionali.", color: "primary", comingSoon: true },
      { icon: Crown, title: "Dirigente per la Sicurezza", subtitle: "Art. 37 D.Lgs 81/08", description: "Organizzazione e gestione dei processi in materia di salute e sicurezza, deleghe, modello 231, appalti.", color: "destructive", comingSoon: true },
      { icon: Heart, title: "Lavoratrici Gestanti", subtitle: "D.Lgs 151/2001", description: "Tutela maternità: modifica mansioni, visite prenatali, divieto lavoro notturno, rischi specifici in gravidanza.", color: "accent", comingSoon: true },
    ],
    attrezzature: [
      { icon: Truck, title: "Carrelli Elevatori", subtitle: "Abilitazione conduttore — 12h", description: "Uso in sicurezza di carrelli industriali semoventi, controlli pre-operativi, manovre e gestione del carico.", color: "secondary", comingSoon: true },
      { icon: Box, title: "Carroponte", subtitle: "Operatore gru a ponte — 8h", description: "Imbracatura carichi, uso radiocomando, segnaletica gestuale, controllo aree di manovra.", color: "secondary", comingSoon: true },
      { icon: ArrowUp, title: "PLE — Piattaforme Elevabili", subtitle: "Con e senza stabilizzatori — 10h", description: "Piattaforme di lavoro mobili elevabili: verifiche, posizionamento, uso in sicurezza, emergenze.", color: "primary", comingSoon: true },
      { icon: ArrowUp, title: "Gru (Torre / Mobile)", subtitle: "Operatore gru — 14h", description: "Gru a torre e gru mobili: stabilità, calcolo carichi, ancoraggio, manovre con vento.", color: "destructive", comingSoon: true },
      { icon: ArrowUp, title: "Scale e Trabattelli", subtitle: "Lavori in quota mobili — 4h", description: "Scale portatili, trabattelli, ponti su ruote: montaggio, uso e DPI anticaduta.", color: "primary", comingSoon: true },
      { icon: Truck, title: "Trattori Agricoli e Forestali", subtitle: "Ruote e cingoli — 13h", description: "Conduzione in sicurezza di trattori, attrezzature accoppiate, prevenzione ribaltamento e cinture.", color: "secondary", comingSoon: true },
      { icon: AlertTriangle, title: "Escavatori e MMT", subtitle: "Macchine Movimento Terra — 10-16h", description: "Escavatori idraulici, pale, terne, autoribaltabili: stabilità, manovre, lavori vicino reti.", color: "destructive", comingSoon: true },
      { icon: Cog, title: "Pompe per Calcestruzzo", subtitle: "Autopompe e bracci — 14h", description: "Posizionamento, stabilizzatori, gestione braccio, comunicazione di cantiere e procedure di emergenza.", color: "secondary", comingSoon: true },
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
      { icon: Building2, title: "Ufficio Amministrativo", subtitle: "Rischi d'Ufficio 3D", description: "Scenario facile in ambiente office: cavi scoperti, estintori bloccati, uscite ostruite, scaffalature instabili. 6 rischi da identificare.", color: "primary", image: sim3dOffice },
      { icon: Warehouse, title: "Magazzino Logistica", subtitle: "Movimentazione & Stoccaggio", description: "Magazzino industriale con bancali, muletti, materiali infiammabili. Rischi manuali + procedurali generati dinamicamente.", color: "secondary", image: sim3dWarehouse },
      { icon: AlertTriangle, title: "Cantiere Edile", subtitle: "Lavori in Quota & DPI", description: "Scenario hard con macchinari pesanti, ponteggi, lavori in quota e rischi procedurali. Per formazione Rischio Alto.", color: "accent", image: sim3dConstruction },
      { icon: Flame, title: "Simulazione Antincendio", subtitle: "Estintore First-Person", description: "Esercitazione realistica con estintore in prima persona: classi di fuoco, particelle, quiz contestuali e procedure di evacuazione.", color: "destructive", image: sim3dFire },
      { icon: Lock, title: "Cyber Security Office", subtitle: "Rischi Informatici 3D", description: "8 rischi cyber da identificare in un ufficio 3D: post-it con password, schermi sbloccati, email di phishing, chiavette USB sospette.", color: "muted", image: sim3dCyber },
    ],
    minigame2d: [
      { icon: Building2, title: "Cantiere Cartoon", subtitle: "7 rischi · 3 vite", description: "Caccia ai rischi 2D in stile cartoon: imbracatura, carichi sospesi, ferri d'armatura, quadri elettrici. Spiegazione educativa con riferimenti normativi.", color: "destructive", image: cartoonConstruction },
      { icon: Monitor, title: "Ufficio Cartoon", subtitle: "8 rischi · 3 vite", description: "Cavi a terra, postura scorretta, uscite ostruite, ciabatte sovraccariche, ergonomia VDT. Modale didattico per ogni hotspot.", color: "primary", image: cartoonOffice },
      { icon: Warehouse, title: "Magazzino Cartoon", subtitle: "8 rischi · 3 vite", description: "Muletti, cataste instabili, pavimenti oleosi, cavi sospesi, sollevamento manuale errato. Punteggio e tentativi limitati.", color: "accent", image: cartoonWarehouse },
      { icon: Flame, title: "Cucina Ristorante Cartoon", subtitle: "8 rischi · 3 vite", description: "Pentole in fiamme, affettatrici incustodite, pavimenti grassi, cavi vicino al lavello, estintori bloccati. HACCP e D.Lgs. 81/08.", color: "destructive", image: cartoonKitchen },
      { icon: Cog, title: "Officina Meccanica Cartoon", subtitle: "8 rischi · 3 vite", description: "Carichi sospesi, saldatori senza maschera, torni senza protezione, oli sul pavimento, segnaletica usurata. Macchine utensili e carroponte.", color: "secondary", image: cartoonFactory },
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
              35+ moduli formativi, 8 percorsi figura, 8 abilitazioni attrezzature, 5 simulazioni 3D e 5 mini-game 2D. Conforme Accordo Stato-Regioni 2025.
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
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="text-lg font-bold leading-tight">{module.title}</h3>
                      {module.comingSoon && (
                        <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-0 text-[10px] px-1.5 py-0">🚧 In rilascio</Badge>
                      )}
                    </div>
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
              { value: "35+", label: "Moduli Formativi", icon: GraduationCap },
              { value: "16", label: "Percorsi & Abilitazioni", icon: Crown },
              { value: "5", label: "Simulazioni 3D", icon: Gamepad2 },
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
