
-- 1. Create risk_sector enum
CREATE TYPE public.risk_sector AS ENUM ('basso', 'medio', 'alto');

-- 2. Create user_risk_sectors table (tracks which sector a user is assigned to)
CREATE TABLE public.user_risk_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sector risk_sector NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_self_assigned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. Enable RLS
ALTER TABLE public.user_risk_sectors ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can view own sector" ON public.user_risk_sectors
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sector" ON public.user_risk_sectors
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND is_self_assigned = true);

CREATE POLICY "Users can update own sector" ON public.user_risk_sectors
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND is_self_assigned = true);

CREATE POLICY "Admins can manage all sectors" ON public.user_risk_sectors
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Company admins can view employee sectors" ON public.user_risk_sectors
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM company_users cu1
      JOIN company_users cu2 ON cu1.company_id = cu2.company_id
      WHERE cu1.user_id = auth.uid() AND cu1.is_admin = true
      AND cu2.user_id = user_risk_sectors.user_id
    )
  );

CREATE POLICY "Company admins can assign sectors" ON public.user_risk_sectors
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_users cu1
      JOIN company_users cu2 ON cu1.company_id = cu2.company_id
      WHERE cu1.user_id = auth.uid() AND cu1.is_admin = true
      AND cu2.user_id = user_risk_sectors.user_id
    )
  );

CREATE POLICY "Company admins can update employee sectors" ON public.user_risk_sectors
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM company_users cu1
      JOIN company_users cu2 ON cu1.company_id = cu2.company_id
      WHERE cu1.user_id = auth.uid() AND cu1.is_admin = true
      AND cu2.user_id = user_risk_sectors.user_id
    )
  );

-- 5. Add sector column to training_modules
ALTER TABLE public.training_modules ADD COLUMN sector risk_sector DEFAULT NULL;

-- 6. Add updated_at trigger
CREATE TRIGGER handle_updated_at_user_risk_sectors
  BEFORE UPDATE ON public.user_risk_sectors
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 7. Insert sector-specific training modules

-- RISCHIO BASSO (4h) - 4 modules
INSERT INTO public.training_modules (id, title, subtitle, description, module_order, style, icon_name, min_duration_minutes, passing_score, sector)
VALUES
  ('rb_videoterminali', 'Videoterminali e Postura', 'Rischi da VDT e Ergonomia', 'Utilizzo corretto del videoterminale, pause, postura e illuminazione per prevenire disturbi muscoloscheletrici e visivi.', 1, '2d', 'Monitor', 60, 70, 'basso'),
  ('rb_stress_lavoro', 'Stress Lavoro-Correlato', 'Benessere Organizzativo', 'Identificazione, prevenzione e gestione dello stress da lavoro. Burnout, mobbing e rischi psicosociali.', 2, 'hybrid', 'Brain', 60, 70, 'basso'),
  ('rb_rischio_elettrico', 'Rischio Elettrico Base', 'Sicurezza negli Ambienti Civili', 'Rischi elettrici in ufficio e ambienti civili, comportamenti corretti e primo intervento.', 3, '3d', 'Zap', 60, 70, 'basso'),
  ('rb_microclima_ergonomia', 'Microclima ed Emergenze', 'Comfort Ambientale e Evacuazione', 'Gestione del microclima, illuminazione, rumore in ufficio. Procedure di evacuazione e primo soccorso base.', 4, '3d', 'Thermometer', 60, 70, 'basso');

-- RISCHIO MEDIO (8h) - 8 modules
INSERT INTO public.training_modules (id, title, subtitle, description, module_order, style, icon_name, min_duration_minutes, passing_score, sector)
VALUES
  ('rm_rischi_meccanici', 'Rischi Meccanici', 'Attrezzature e Macchinari', 'Identificazione e prevenzione dei rischi legati all''uso di attrezzature di lavoro, macchine e utensili.', 1, '3d', 'Cog', 60, 70, 'medio'),
  ('rm_movimentazione', 'Movimentazione Manuale Carichi', 'Sollevamento e Trasporto', 'Tecniche corrette di sollevamento, trasporto e movimentazione. Metodo NIOSH e prevenzione patologie dorso-lombari.', 2, '3d', 'Package', 60, 70, 'medio'),
  ('rm_rischio_elettrico', 'Rischio Elettrico Avanzato', 'Impianti e Manutenzione', 'Lavori elettrici in prossimità, categorie di rischio PES/PAV, interventi in sicurezza su impianti.', 3, 'hybrid', 'Zap', 60, 70, 'medio'),
  ('rm_agenti_fisici', 'Agenti Fisici', 'Rumore, Vibrazioni, Radiazioni', 'Esposizione a rumore, vibrazioni meccaniche, campi elettromagnetici. Valori limite e DPI specifici.', 4, '2d', 'Volume2', 60, 70, 'medio'),
  ('rm_sostanze_pericolose', 'Sostanze Pericolose', 'Classificazione CLP e SDS', 'Etichettatura GHS/CLP, schede di sicurezza, stoccaggio e manipolazione di sostanze chimiche.', 5, 'hybrid', 'FlaskConical', 60, 70, 'medio'),
  ('rm_cadute_alto', 'Cadute dall''Alto', 'Lavori in Quota e DPI III Cat.', 'Prevenzione cadute, sistemi di protezione collettiva e individuale, parapetti e reti.', 6, '3d', 'ArrowDown', 60, 70, 'medio'),
  ('rm_incendio', 'Rischio Incendio', 'Prevenzione e Gestione Emergenze', 'Triangolo del fuoco, classi di incendio, estintori, piani di emergenza e prove di evacuazione.', 7, '3d', 'Flame', 60, 70, 'medio'),
  ('rm_primo_soccorso', 'Primo Soccorso Aziendale', 'Procedure e Interventi', 'Attivazione catena del soccorso, BLS, gestione emorragie, fratture, ustioni e shock.', 8, '3d', 'Heart', 60, 70, 'medio');

-- RISCHIO ALTO (12h) - 12 modules
INSERT INTO public.training_modules (id, title, subtitle, description, module_order, style, icon_name, min_duration_minutes, passing_score, sector)
VALUES
  ('ra_rischi_meccanici_avanzati', 'Rischi Meccanici Avanzati', 'Macchine Complesse e Automazione', 'Sicurezza su macchine industriali complesse, robot, presse e linee automatizzate. Direttiva Macchine 2006/42/CE.', 1, '3d', 'Cog', 60, 70, 'alto'),
  ('ra_rischio_chimico', 'Rischio Chimico Avanzato', 'Agenti Cancerogeni e Mutageni', 'Esposizione ad agenti chimici pericolosi, cancerogeni e mutageni. Valutazione REACH/CLP, monitoraggio biologico.', 2, 'hybrid', 'FlaskConical', 60, 70, 'alto'),
  ('ra_rischio_biologico', 'Rischio Biologico', 'Agenti Biologici e Biosicurezza', 'Classificazione agenti biologici, livelli di contenimento, DPI specifici, procedure di decontaminazione.', 3, '3d', 'Bug', 60, 70, 'alto'),
  ('ra_amianto', 'Amianto e Fibre Pericolose', 'Bonifica e Protezione', 'Riconoscimento materiali contenenti amianto, procedure di bonifica, DPI respiratori, sorveglianza sanitaria.', 4, 'hybrid', 'AlertTriangle', 60, 70, 'alto'),
  ('ra_spazi_confinati', 'Spazi Confinati', 'Accesso e Soccorso', 'Procedure di accesso in sicurezza a spazi confinati, rilevazione atmosfere, sistemi di recupero, squadre di soccorso.', 5, '3d', 'Box', 60, 70, 'alto'),
  ('ra_lavori_quota', 'Lavori in Quota Avanzato', 'Ponteggi e Funi', 'Montaggio/smontaggio ponteggi, lavori su fune, sistemi anticaduta avanzati, piani di montaggio (PiMUS).', 6, '3d', 'ArrowUp', 60, 70, 'alto'),
  ('ra_movimentazione_avanzata', 'Movimentazione Meccanica', 'Carrelli, Gru e Mezzi', 'Conduzione sicura di carrelli elevatori, gru, piattaforme aeree. Segnaletica e vie di transito.', 7, '3d', 'Truck', 60, 70, 'alto'),
  ('ra_atmosfere_esplosive', 'Atmosfere Esplosive (ATEX)', 'Zone a Rischio Esplosione', 'Classificazione zone ATEX, sorgenti di innesco, apparecchiature certificate, procedure operative.', 8, '3d', 'Bomb', 60, 70, 'alto'),
  ('ra_rumore_vibrazioni', 'Rumore e Vibrazioni Avanzato', 'Esposizione Prolungata', 'Valutazione approfondita esposizione a rumore e vibrazioni, audiometria, DPI uditivi, turni e rotazioni.', 9, '2d', 'Volume2', 60, 70, 'alto'),
  ('ra_radiazioni', 'Radiazioni Ionizzanti e Non', 'Protezione Radiologica', 'Sorgenti radiogene, dosimetria, protezione e schermatura, sorveglianza fisica e medica.', 10, 'hybrid', 'Radiation', 60, 70, 'alto'),
  ('ra_emergenze_complesse', 'Emergenze Complesse', 'Incidenti Rilevanti e SEVESO', 'Gestione emergenze industriali, Direttiva Seveso III, piani di emergenza interni/esterni, simulazioni.', 11, '3d', 'Siren', 60, 70, 'alto'),
  ('ra_cantiere', 'Sicurezza nei Cantieri', 'Titolo IV D.Lgs 81/08', 'Piani di sicurezza (PSC/POS), coordinamento, interferenze tra imprese, gestione del cantiere.', 12, '3d', 'HardHat', 60, 70, 'alto');
