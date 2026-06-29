-- Cruces de 16avos de final Mundial 2026 (fase de 32, 28 jun – 3 jul)
-- Fuente: llaves confirmadas tras fase de grupos

UPDATE matches AS m SET
  home_team_id = v.home_id,
  away_team_id = v.away_id,
  home_score = v.home_score,
  away_score = v.away_score,
  status = v.status
FROM (VALUES
  ('m73', 'za', 'ca', 0, 1, 'finished'),
  ('m74', 'de', 'py', NULL, NULL, 'pending'),
  ('m75', 'nl', 'ma', NULL, NULL, 'pending'),
  ('m76', 'br', 'jp', NULL, NULL, 'pending'),
  ('m77', 'fr', 'se', NULL, NULL, 'pending'),
  ('m78', 'ci', 'no', NULL, NULL, 'pending'),
  ('m79', 'mx', 'ec', NULL, NULL, 'pending'),
  ('m80', 'gb-eng', 'cd', NULL, NULL, 'pending'),
  ('m81', 'us', 'ba', NULL, NULL, 'pending'),
  ('m82', 'be', 'sn', NULL, NULL, 'pending'),
  ('m83', 'pt', 'hr', NULL, NULL, 'pending'),
  ('m84', 'es', 'at', NULL, NULL, 'pending'),
  ('m85', 'ch', 'dz', NULL, NULL, 'pending'),
  ('m86', 'ar', 'cv', NULL, NULL, 'pending'),
  ('m87', 'co', 'gh', NULL, NULL, 'pending'),
  ('m88', 'au', 'eg', NULL, NULL, 'pending')
) AS v(id, home_id, away_id, home_score, away_score, status)
WHERE m.id = v.id;
