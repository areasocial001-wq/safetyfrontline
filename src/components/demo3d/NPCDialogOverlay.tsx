import { X, Shield, Users, Stethoscope, HardHat, Briefcase, HeartPulse } from 'lucide-react';

export interface SafetyRoleInfo {
  role: string;
  fullTitle: string;
  icon: React.ReactNode;
  description: string;
  responsibilities: string[];
  legalRef: string;
}

const SAFETY_ROLES: Record<string, SafetyRoleInfo> = {
  RSPP: {
    role: 'RSPP',
    fullTitle: 'Responsabile del Servizio di Prevenzione e Protezione',
    icon: <Shield className="w-6 h-6" />,
    description:
      'È la figura tecnica nominata dal Datore di Lavoro che coordina il servizio di prevenzione e protezione dai rischi. Individua i fattori di rischio, elabora le misure preventive e propone programmi di formazione.',
    responsibilities: [
      'Effettua la valutazione dei rischi insieme al Datore di Lavoro',
      'Elabora le procedure di sicurezza aziendali',
      'Propone i programmi di informazione e formazione dei lavoratori',
      'Partecipa alla riunione periodica sulla sicurezza (art. 35)',
    ],
    legalRef: 'D.Lgs. 81/08, artt. 31-34',
  },
  RLS: {
    role: 'RLS',
    fullTitle: 'Rappresentante dei Lavoratori per la Sicurezza',
    icon: <Users className="w-6 h-6" />,
    description:
      'È il portavoce dei lavoratori in materia di salute e sicurezza. Viene eletto o designato dai colleghi e ha il diritto di accedere ai documenti sulla valutazione dei rischi e di partecipare alla riunione periodica.',
    responsibilities: [
      'Rappresenta i lavoratori per le questioni di sicurezza',
      'Accede alla documentazione sulla valutazione dei rischi',
      'È consultato sulla designazione degli addetti alla sicurezza',
      'Può fare ricorso alle autorità competenti se le misure sono inadeguate',
    ],
    legalRef: 'D.Lgs. 81/08, art. 47-50',
  },
  Medico: {
    role: 'Medico Competente',
    fullTitle: 'Medico Competente',
    icon: <Stethoscope className="w-6 h-6" />,
    description:
      'È il medico specializzato in medicina del lavoro che effettua la sorveglianza sanitaria. Collabora alla valutazione dei rischi ed esprime i giudizi di idoneità alla mansione specifica per ogni lavoratore.',
    responsibilities: [
      'Effettua le visite mediche preventive e periodiche',
      'Esprime il giudizio di idoneità alla mansione',
      'Collabora alla valutazione dei rischi aziendali',
      'Istituisce e aggiorna la cartella sanitaria di rischio',
    ],
    legalRef: 'D.Lgs. 81/08, artt. 38-42',
  },
  Preposto: {
    role: 'Preposto',
    fullTitle: 'Preposto alla Sicurezza',
    icon: <HardHat className="w-6 h-6" />,
    description:
      'È la persona che sovrintende all\'attività lavorativa e garantisce l\'attuazione delle direttive di sicurezza. Ha il dovere di vigilare sull\'osservanza delle norme da parte dei singoli lavoratori.',
    responsibilities: [
      'Sovrintende e vigila sull\'osservanza delle norme di sicurezza',
      'Verifica che i lavoratori utilizzino correttamente i DPI',
      'Segnala tempestivamente al datore di lavoro eventuali pericoli',
      'In caso di pericolo grave e immediato, interviene per limitare il rischio',
    ],
    legalRef: 'D.Lgs. 81/08, art. 19',
  },
  Dirigente: {
    role: 'Dirigente',
    fullTitle: 'Dirigente per la Sicurezza',
    icon: <Briefcase className="w-6 h-6" />,
    description:
      'È chi attua le direttive del Datore di Lavoro organizzando l\'attività lavorativa e vigilando su di essa. Ha obblighi specifici in materia di sicurezza e può essere delegato dal DdL per alcuni compiti.',
    responsibilities: [
      'Nomina il Medico Competente (se delegato)',
      'Designa i lavoratori addetti alla gestione delle emergenze',
      'Fornisce ai lavoratori i DPI necessari',
      'Adempie agli obblighi di formazione e informazione',
    ],
    legalRef: 'D.Lgs. 81/08, art. 18',
  },
  'Addetto PS': {
    role: 'Addetto PS',
    fullTitle: 'Addetto al Primo Soccorso',
    icon: <HeartPulse className="w-6 h-6" />,
    description:
      'È il lavoratore designato dal Datore di Lavoro per intervenire in caso di emergenza sanitaria. Ha ricevuto una formazione specifica per prestare le prime cure ai colleghi infortunati in attesa del 118.',
    responsibilities: [
      'Interviene in caso di malore o infortunio sul posto di lavoro',
      'Attiva la catena del soccorso (chiamata al 118)',
      'Utilizza la cassetta di primo soccorso e il defibrillatore (se abilitato)',
      'Frequenta corsi di aggiornamento periodici (ogni 3 anni)',
    ],
    legalRef: 'D.Lgs. 81/08, artt. 45-46 — D.M. 388/2003',
  },
};

export type ScenarioType = 'office' | 'warehouse' | 'construction' | 'laboratory';

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  office: '🏢 Ufficio',
  warehouse: '🏭 Magazzino',
  construction: '🏗️ Cantiere',
  laboratory: '🔬 Laboratorio',
};

interface NPCDialogOverlayProps {
  role: string | null;
  scenarioType?: ScenarioType;
  onClose: () => void;
}

export const NPCDialogOverlay = ({ role, scenarioType, onClose }: NPCDialogOverlayProps) => {
  if (!role) return null;

  const info = SAFETY_ROLES[role];
  if (!info) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="pointer-events-auto bg-background/95 backdrop-blur-md border border-primary/30 rounded-2xl shadow-2xl max-w-lg w-[90%] p-6 animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15 text-primary">
              {info.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{info.role}</h3>
              <p className="text-xs text-muted-foreground">{info.fullTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground/85 leading-relaxed mb-4">
          {info.description}
        </p>

        {/* Responsibilities */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Compiti principali
          </h4>
          <ul className="space-y-1.5">
            {info.responsibilities.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="text-primary mt-0.5 text-xs">●</span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Legal reference + scenario context */}
        <div className="pt-3 border-t border-border space-y-1">
          <p className="text-xs text-muted-foreground">
            📖 Riferimento normativo: <span className="font-medium text-foreground/70">{info.legalRef}</span>
          </p>
          {scenarioType && (
            <p className="text-xs text-muted-foreground">
              📍 Contesto: <span className="font-medium text-foreground/70">{SCENARIO_LABELS[scenarioType]}</span>
            </p>
          )}
        </div>

        {/* Close hint */}
        <p className="text-[10px] text-muted-foreground text-center mt-3">
          Clicca ✕ o premi ESC per chiudere
        </p>
      </div>
    </div>
  );
};
