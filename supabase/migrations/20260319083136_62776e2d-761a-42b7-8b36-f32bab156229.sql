INSERT INTO public.training_modules (id, title, subtitle, description, module_order, min_duration_minutes, passing_score, style, icon_name)
VALUES
  ('ls_rischi_settore', 'Formazione Specifica Lavoratori', 'Rischi per Settore e Mansione', 'Corso completo sulla formazione specifica per settore: analisi rischi per mansione, DPI specifici, procedure di emergenza settoriali.', 26, 60, 70, '2d', 'Briefcase'),
  ('rspp_dl_giuridico', 'RSPP Datore di Lavoro', 'Corso per DL che assume ruolo RSPP', 'Responsabilità del DL-RSPP, DVR, gestione rischi, ciclo PDCA, near miss reporting e comunicazione della sicurezza.', 27, 60, 70, '2d', 'Crown'),
  ('rls_ruolo_compiti', 'RLS - Rappresentante Lavoratori', 'Ruolo, Attribuzioni e Compiti', 'Corso completo per RLS: elezione, attribuzioni art. 50, consultazione preventiva, accesso DVR e segnalazione alle autorità.', 28, 60, 70, '2d', 'Users'),
  ('preposto_ruolo_obblighi', 'Corso Preposto', 'Vigilanza e Intervento Diretto', 'Obblighi del Preposto aggiornati alla L. 215/2021: vigilanza, intervento diretto, interruzione attività, emergenze.', 29, 60, 70, '2d', 'Eye')
ON CONFLICT (id) DO NOTHING;