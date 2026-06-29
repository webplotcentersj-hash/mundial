-- Backfill: Canadá (ganador m73) avanza a octavos m90 como local
UPDATE matches SET home_team_id = 'ca' WHERE id = 'm90';
