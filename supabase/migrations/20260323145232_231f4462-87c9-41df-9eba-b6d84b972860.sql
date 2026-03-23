
-- Remove old generic module
DELETE FROM training_modules WHERE id = 'ls_rischi_settore';

-- Insert new specific modules
INSERT INTO training_modules (id, title, subtitle, description, module_order, min_duration_minutes, passing_score, style, icon_name)
VALUES 
  ('ls_uffici', 'Specifica Uffici', 'Rischio Basso - 4 ore', 'VDT, ergonomia, microclima, stress lavoro-correlato, rischio elettrico e incendio in ambiente d''ufficio.', 50, 30, 70, '2d', 'Monitor'),
  ('ls_aziende', 'Specifica Aziende', 'Rischio Medio/Alto - 8-12 ore', 'Rischio meccanico, LOTO, movimentazione carichi, carrello elevatore, rischio chimico, emergenze industriali.', 51, 45, 70, '2d', 'Factory'),
  ('ls_ristorazione', 'Specifica Ristorazione', 'ATECO 55-56 - 8 ore', 'Ustioni, tagli, scivolamento, HACCP, rischio biologico, detergenti professionali, sicurezza in cucina.', 52, 45, 70, '2d', 'FlaskConical')
ON CONFLICT (id) DO NOTHING;
