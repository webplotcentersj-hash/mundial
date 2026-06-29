insert into public.trivia_questions (id, question, options, correct_index, difficulty, world_cup_year, category)
values
('gol-132', '¿Roger Milla marcó en el Mundial 1990 siendo…?', '["El jugador más veterano en marcar (38 años)","El más joven","Capitán de Camerún","Arquero"]'::jsonb, 0, 'medium', 1990, 'goleadores'),
('gol-133', '¿Cuántos goles marcó Roger Milla en Italia 1990?', '["4","3","5","2"]'::jsonb, 0, 'hard', 1990, 'goleadores'),
('gol-134', '¿Cuántos goles marcó Milla en el Mundial 1994 a los 42 años?', '["1","2","3","0"]'::jsonb, 0, 'hard', 1994, 'goleadores'),
('gol-135', '¿El arquero José Luis Chilavert marcó un gol de…?', '["Tiro libre en eliminatorias (no en Mundial)","Penal en Mundial","Cabeza en Mundial","Corner en Mundial"]'::jsonb, 0, 'hard', null, 'goles-records'),
('gol-136', '¿Cuántos goles marcó Hristo Stoichkov en USA 94?', '["6","5","4","7"]'::jsonb, 0, 'hard', 1994, 'goleadores'),
('gol-137', '¿Cuántos goles marcó Bebeto en el Mundial 1994?', '["3","5","2","4"]'::jsonb, 0, 'hard', 1994, 'goleadores'),
('gol-138', '¿Cuántos goles marcó Klinsmann en el Mundial 1990?', '["3","5","2","4"]'::jsonb, 0, 'hard', 1990, 'goleadores'),
('gol-139', '¿Cuántos goles marcó Lothar Matthäus en el Mundial 1990?', '["4","3","5","2"]'::jsonb, 0, 'hard', 1990, 'goleadores'),
('gol-140', '¿Cuántos goles marcó Michel Platini en el Mundial 1982?', '["2","4","6","0"]'::jsonb, 0, 'hard', 1982, 'goleadores')
on conflict (id) do update set
  question = excluded.question,
  options = excluded.options,
  correct_index = excluded.correct_index,
  difficulty = excluded.difficulty,
  world_cup_year = excluded.world_cup_year,
  category = excluded.category;