import type { TriviaDifficulty } from './constants'

export type TriviaQuestionSeed = {
  id: string
  question: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
  difficulty: TriviaDifficulty
  worldCupYear?: number
  category: string
}

function q(
  id: string,
  question: string,
  correct: string,
  wrong: [string, string, string],
  difficulty: TriviaDifficulty,
  category: string,
  worldCupYear?: number,
): TriviaQuestionSeed {
  const options = [correct, wrong[0], wrong[1], wrong[2]] as [string, string, string, string]
  const correctIndex = 0 as const
  return { id, question, options, correctIndex, difficulty, category, worldCupYear }
}

/** Banco de preguntas de Mundiales (español). Se siembra en Supabase al primer uso. */
export function buildTriviaQuestionsBank(): TriviaQuestionSeed[] {
  const items: TriviaQuestionSeed[] = []

  const hosts: { year: number; country: string; wrong: [string, string, string] }[] = [
    { year: 1930, country: 'Uruguay', wrong: ['Argentina', 'Italia', 'Brasil'] },
    { year: 1934, country: 'Italia', wrong: ['Francia', 'Alemania', 'España'] },
    { year: 1938, country: 'Francia', wrong: ['Italia', 'Suiza', 'Bélgica'] },
    { year: 1950, country: 'Brasil', wrong: ['Uruguay', 'Chile', 'Argentina'] },
    { year: 1954, country: 'Suiza', wrong: ['Alemania', 'Austria', 'Suecia'] },
    { year: 1958, country: 'Suecia', wrong: ['Noruega', 'Dinamarca', 'Finlandia'] },
    { year: 1962, country: 'Chile', wrong: ['Argentina', 'Perú', 'Colombia'] },
    { year: 1966, country: 'Inglaterra', wrong: ['Escocia', 'Irlanda', 'Gales'] },
    { year: 1970, country: 'México', wrong: ['Estados Unidos', 'Colombia', 'Cuba'] },
    { year: 1974, country: 'Alemania Occidental', wrong: ['Austria', 'Suiza', 'Países Bajos'] },
    { year: 1978, country: 'Argentina', wrong: ['Uruguay', 'Chile', 'Brasil'] },
    { year: 1982, country: 'España', wrong: ['Portugal', 'Italia', 'Francia'] },
    { year: 1986, country: 'México', wrong: ['Estados Unidos', 'Colombia', 'Brasil'] },
    { year: 1990, country: 'Italia', wrong: ['Francia', 'Alemania', 'España'] },
    { year: 1994, country: 'Estados Unidos', wrong: ['México', 'Canadá', 'Brasil'] },
    { year: 1998, country: 'Francia', wrong: ['Bélgica', 'Alemania', 'España'] },
    { year: 2002, country: 'Corea del Sur y Japón', wrong: ['China', 'Tailandia', 'Australia'] },
    { year: 2006, country: 'Alemania', wrong: ['Austria', 'Suiza', 'Polonia'] },
    { year: 2010, country: 'Sudáfrica', wrong: ['Nigeria', 'Egipto', 'Marruecos'] },
    { year: 2014, country: 'Brasil', wrong: ['Argentina', 'Chile', 'Colombia'] },
    { year: 2018, country: 'Rusia', wrong: ['Ucrania', 'Polonia', 'Turquía'] },
    { year: 2022, country: 'Qatar', wrong: ['Emiratos Árabes', 'Arabia Saudita', 'Baréin'] },
  ]

  hosts.forEach((h) => {
    items.push(
      q(
        `host-${h.year}`,
        `¿En qué país (o países) se disputó el Mundial ${h.year}?`,
        h.country,
        h.wrong,
        h.year >= 2010 ? 'easy' : 'medium',
        'sedes',
        h.year,
      ),
    )
  })

  const champions: { year: number; team: string; wrong: [string, string, string] }[] = [
    { year: 1930, team: 'Uruguay', wrong: ['Argentina', 'Brasil', 'Italia'] },
    { year: 1934, team: 'Italia', wrong: ['Checoslovaquia', 'Alemania', 'Austria'] },
    { year: 1938, team: 'Italia', wrong: ['Hungría', 'Brasil', 'Suecia'] },
    { year: 1950, team: 'Uruguay', wrong: ['Brasil', 'Suecia', 'España'] },
    { year: 1954, team: 'Alemania Occidental', wrong: ['Hungría', 'Austria', 'Uruguay'] },
    { year: 1958, team: 'Brasil', wrong: ['Suecia', 'Francia', 'Alemania'] },
    { year: 1962, team: 'Brasil', wrong: ['Checoslovaquia', 'Chile', 'Yugoslavia'] },
    { year: 1966, team: 'Inglaterra', wrong: ['Alemania', 'Portugal', 'Argentina'] },
    { year: 1970, team: 'Brasil', wrong: ['Italia', 'Alemania', 'Uruguay'] },
    { year: 1974, team: 'Alemania Occidental', wrong: ['Países Bajos', 'Polonia', 'Brasil'] },
    { year: 1978, team: 'Argentina', wrong: ['Países Bajos', 'Brasil', 'Italia'] },
    { year: 1982, team: 'Italia', wrong: ['Alemania', 'Francia', 'Polonia'] },
    { year: 1986, team: 'Argentina', wrong: ['Alemania', 'Francia', 'Bélgica'] },
    { year: 1990, team: 'Alemania Occidental', wrong: ['Argentina', 'Italia', 'Inglaterra'] },
    { year: 1994, team: 'Brasil', wrong: ['Italia', 'Suecia', 'Bulgaria'] },
    { year: 1998, team: 'Francia', wrong: ['Brasil', 'Croacia', 'Países Bajos'] },
    { year: 2002, team: 'Brasil', wrong: ['Alemania', 'Turquía', 'Corea del Sur'] },
    { year: 2006, team: 'Italia', wrong: ['Francia', 'Alemania', 'Portugal'] },
    { year: 2010, team: 'España', wrong: ['Países Bajos', 'Alemania', 'Uruguay'] },
    { year: 2014, team: 'Alemania', wrong: ['Argentina', 'Brasil', 'Países Bajos'] },
    { year: 2018, team: 'Francia', wrong: ['Croacia', 'Bélgica', 'Inglaterra'] },
    { year: 2022, team: 'Argentina', wrong: ['Francia', 'Croacia', 'Marruecos'] },
  ]

  champions.forEach((c) => {
    items.push(
      q(
        `champ-${c.year}`,
        `¿Qué selección ganó el Mundial ${c.year}?`,
        c.team,
        c.wrong,
        c.year >= 2006 ? 'easy' : 'medium',
        'campeones',
        c.year,
      ),
    )
  })

  const runners: { year: number; team: string; wrong: [string, string, string] }[] = [
    { year: 2014, team: 'Argentina', wrong: ['Brasil', 'Países Bajos', 'Alemania'] },
    { year: 2018, team: 'Croacia', wrong: ['Bélgica', 'Inglaterra', 'Francia'] },
    { year: 2022, team: 'Francia', wrong: ['Croacia', 'Marruecos', 'Argentina'] },
    { year: 2010, team: 'Países Bajos', wrong: ['Alemania', 'Uruguay', 'España'] },
    { year: 2006, team: 'Francia', wrong: ['Alemania', 'Portugal', 'Italia'] },
    { year: 2002, team: 'Alemania', wrong: ['Brasil', 'Turquía', 'Corea del Sur'] },
    { year: 1998, team: 'Brasil', wrong: ['Francia', 'Croacia', 'Países Bajos'] },
    { year: 1994, team: 'Italia', wrong: ['Brasil', 'Suecia', 'Bulgaria'] },
    { year: 1986, team: 'Alemania', wrong: ['Argentina', 'Francia', 'Bélgica'] },
    { year: 1982, team: 'Alemania', wrong: ['Italia', 'Polonia', 'Francia'] },
  ]

  runners.forEach((r) => {
    items.push(
      q(
        `sub-${r.year}`,
        `¿Qué selección fue subcampeona en el Mundial ${r.year}?`,
        r.team,
        r.wrong,
        'medium',
        'finales',
        r.year,
      ),
    )
  })

  const scorers: { year: number; name: string; wrong: [string, string, string] }[] = [
    { year: 2018, name: 'Harry Kane', wrong: ['Antoine Griezmann', 'Romelu Lukaku', 'Cristiano Ronaldo'] },
    { year: 2022, name: 'Kylian Mbappé', wrong: ['Lionel Messi', 'Olivier Giroud', 'Julián Álvarez'] },
    { year: 2014, name: 'James Rodríguez', wrong: ['Thomas Müller', 'Neymar', 'Lionel Messi'] },
    { year: 2010, name: 'Diego Forlán', wrong: ['David Villa', 'Wesley Sneijder', 'Thomas Müller'] },
    { year: 2006, name: 'Miroslav Klose', wrong: ['Ronaldo', 'Hernán Crespo', 'Thierry Henry'] },
    { year: 2002, name: 'Ronaldo', wrong: ['Rivaldo', 'Miroslav Klose', 'David Beckham'] },
    { year: 1998, name: 'Davor Šuker', wrong: ['Ronaldo', 'Dennis Bergkamp', 'Gabriel Batistuta'] },
    { year: 1990, name: 'Salvatore Schillaci', wrong: ['Lothar Matthäus', 'Roger Milla', 'Gary Lineker'] },
    { year: 1986, name: 'Gary Lineker', wrong: ['Diego Maradona', 'Emilio Butragueño', 'Careca'] },
    { year: 1982, name: 'Paolo Rossi', wrong: ['Karl-Heinz Rummenigge', 'Zico', 'Michel Platini'] },
    { year: 1970, name: 'Gerd Müller', wrong: ['Pelé', 'Jairzinho', 'Tostão'] },
    { year: 1966, name: 'Eusébio', wrong: ['Geoff Hurst', 'Franz Beckenbauer', 'Pelé'] },
  ]

  scorers.forEach((s) => {
    items.push(
      q(
        `scorer-${s.year}`,
        `¿Quién fue el máximo goleador del Mundial ${s.year}?`,
        s.name,
        s.wrong,
        'hard',
        'goleadores',
        s.year,
      ),
    )
  })

  const records: TriviaQuestionSeed[] = [
    q('rec-1', '¿Qué país ha ganado más Copas del Mundo?', 'Brasil', ['Alemania', 'Italia', 'Argentina'], 'easy', 'records'),
    q('rec-2', '¿Cuántas Copas del Mundo ganó Brasil hasta 2022?', '5', ['4', '6', '3'], 'medium', 'records'),
    q('rec-3', '¿Qué selección europea tiene más títulos mundiales?', 'Alemania', ['Italia', 'Francia', 'España'], 'medium', 'records'),
    q('rec-4', '¿En qué año se jugó el primer Mundial?', '1930', ['1928', '1934', '1926'], 'easy', 'records', 1930),
    q('rec-5', '¿Qué país organizó el primer Mundial?', 'Uruguay', ['Argentina', 'Italia', 'Brasil'], 'easy', 'records', 1930),
    q('rec-6', '¿Qué selección ganó el Mundial 1930?', 'Uruguay', ['Argentina', 'Estados Unidos', 'Yugoslavia'], 'medium', 'records', 1930),
    q('rec-7', '¿Pelé ganó cuántos Mundiales con Brasil?', '3', ['2', '4', '1'], 'medium', 'leyendas'),
    q('rec-8', '¿Diego Maradona levantó el Mundial en…?', '1986', ['1982', '1990', '1978'], 'easy', 'leyendas', 1986),
    q('rec-9', '¿Lionel Messi ganó su primer Mundial en…?', '2022', ['2014', '2018', '2010'], 'easy', 'leyendas', 2022),
    q('rec-10', '¿Qué país fue campeón en casa en 1966?', 'Inglaterra', ['Alemania', 'Portugal', 'Argentina'], 'medium', 'records', 1966),
    q('rec-11', '¿Brasil ganó su quinto título en…?', '2002', ['1994', '2006', '2010'], 'medium', 'records', 2002),
    q('rec-12', '¿España ganó su único Mundial en…?', '2010', ['2006', '2014', '2018'], 'easy', 'records', 2010),
    q('rec-13', '¿Francia ganó su segundo Mundial en…?', '2018', ['2006', '1998', '2022'], 'medium', 'records', 2018),
    q('rec-14', '¿Italia tiene cuántos títulos mundiales?', '4', ['3', '5', '2'], 'hard', 'records'),
    q('rec-15', '¿Argentina ganó el Mundial 2022 en la final contra…?', 'Francia', ['Croacia', 'Brasil', 'Marruecos'], 'easy', 'finales', 2022),
    q('rec-16', '¿El “Maracanazo” (1950) fue sorpresa de…?', 'Uruguay sobre Brasil', ['Suecia sobre Brasil', 'Alemania sobre Brasil', 'Italia sobre Brasil'], 'hard', 'historia', 1950),
    q('rec-17', '¿Cuántos equipos participaron en el Mundial 2022?', '32', ['24', '48', '16'], 'easy', 'formato', 2022),
    q('rec-18', '¿A partir de 2026 el Mundial tendrá cuántos equipos?', '48', ['32', '40', '36'], 'medium', 'formato'),
    q('rec-19', '¿Qué balón oficial usó el Mundial 2018?', 'Telstar 18', ['Brazuca', 'Al Rihla', 'Teamgeist'], 'hard', 'curiosidades', 2018),
    q('rec-20', '¿Qué mascota tuvo el Mundial 2010?', 'Zakumi', ['Fuleco', 'Zabivaka', 'La\'eeb'], 'medium', 'curiosidades', 2010),
  ]

  items.push(...records)

  const moments: TriviaQuestionSeed[] = [
    q('mom-1', '¿En qué Mundial Maradona marcó la “Mano de Dios”?', '1986', ['1982', '1990', '1978'], 'easy', 'momentos', 1986),
    q('mom-2', '¿En qué Mundial fue el “Gol del Siglo” de Maradona vs Inglaterra?', '1986', ['1982', '1990', '1978'], 'medium', 'momentos', 1986),
    q('mom-3', '¿Zinedine Zidane cabeceó a Materazzi en la final de…?', '2006', ['2002', '2010', '1998'], 'medium', 'momentos', 2006),
    q('mom-4', '¿Roberto Baggio erró el penal decisivo en la final de…?', '1994', ['1990', '1998', '2002'], 'hard', 'momentos', 1994),
    q('mom-5', '¿El Mundial con la “vaca loca” (vuvuzela) fue…?', '2010', ['2006', '2014', '2018'], 'easy', 'curiosidades', 2010),
    q('mom-6', '¿Croatia llegó a su primera final en…?', '2018', ['2022', '1998', '2014'], 'medium', 'momentos', 2018),
    q('mom-7', '¿Marruecos llegó a semifinales en…?', '2022', ['2018', '2010', '2006'], 'medium', 'momentos', 2022),
    q('mom-8', '¿Corea del Sur llegó a semifinales en casa en…?', '2002', ['2010', '1994', '2018'], 'hard', 'momentos', 2002),
    q('mom-9', '¿El “gol de plata” de Francia vs Alemania en semifinal fue en…?', '1982', ['1986', '1998', '2006'], 'hard', 'momentos', 1982),
    q('mom-10', '¿La final Alemania 7–1 Brasil fue en…?', '2014', ['2010', '2018', '2006'], 'easy', 'momentos', 2014),
    q('mom-11', '¿El penal de Grosso que definió Italia campeona fue en…?', '2006', ['2002', '2010', '1998'], 'hard', 'momentos', 2006),
    q('mom-12', '¿Iniesta marcó el gol del título español en…?', '2010', ['2006', '2014', '2008'], 'easy', 'momentos', 2010),
    q('mom-13', '¿Götze marcó el gol de Alemania en la final de…?', '2014', ['2010', '2018', '2006'], 'medium', 'momentos', 2014),
    q('mom-14', '¿Mbappé anotó un hat-trick en la final de…?', '2022', ['2018', '2014', '2006'], 'medium', 'momentos', 2022),
    q('mom-15', '¿El Mundial se suspendió en 1942 y 1946 por…?', 'Segunda Guerra Mundial', ['Crisis económica', 'Conflicto en Asia', 'Epidemia'], 'medium', 'historia'),
  ]

  items.push(...moments)

  const players: TriviaQuestionSeed[] = [
    q('ply-1', '¿Qué jugador es el máximo goleador histórico en Mundiales?', 'Miroslav Klose', ['Ronaldo', 'Pelé', 'Lionel Messi'], 'medium', 'goleadores'),
    q('ply-2', '¿Cuántos goles marcó Miroslav Klose en Mundiales?', '16', ['15', '14', '17'], 'hard', 'goleadores'),
    q('ply-3', '¿Ronaldo (Brasil) marcó cuántos goles en Mundiales?', '15', ['14', '16', '12'], 'hard', 'goleadores'),
    q('ply-4', '¿Pelé ganó Mundiales en 1958, 1962 y…?', '1970', ['1966', '1974', '1982'], 'medium', 'leyendas'),
    q('ply-5', '¿Franz Beckenbauer ganó como jugador y DT el Mundial en…?', '1974', ['1966', '1990', '1982'], 'hard', 'leyendas', 1974),
    q('ply-6', '¿Qué arquero atajó el penal a Baggio en 1994?', 'Claudio Taffarel', ['Dino Zoff', 'Lehmann', 'Buffon'], 'hard', 'leyendas', 1994),
    q('ply-7', '¿Quién fue capitán de España en 2010?', 'Iker Casillas', ['Xavi', 'Sergio Ramos', 'Iniesta'], 'medium', 'leyendas', 2010),
    q('ply-8', '¿Quién fue DT de Alemania campeona en 2014?', 'Joachim Löw', ['Klinsmann', 'Flick', 'Rummenigge'], 'medium', 'dt', 2014),
    q('ply-9', '¿Quién fue DT de Argentina campeona en 2022?', 'Lionel Scaloni', ['Sampaoli', 'Bielsa', 'Pekerman'], 'easy', 'dt', 2022),
    q('ply-10', '¿Vicente del Bosque dirigió a España campeona en…?', '2010', ['2008', '2012', '2014'], 'medium', 'dt', 2010),
  ]

  items.push(...players)

  const formatQs: TriviaQuestionSeed[] = [
    q('fmt-1', '¿Cuántos partidos jugó un campeón en el Mundial 2022 (incl. fase de grupos)?', '7', ['6', '8', '5'], 'hard', 'formato', 2022),
    q('fmt-2', '¿El formato de grupos de 4 equipos se estandarizó ampliamente desde…?', '1998', ['1986', '2002', '1978'], 'hard', 'formato'),
    q('fmt-3', '¿Cuántos confederaciones tienen cupos en el Mundial?', '6', ['5', '7', '4'], 'hard', 'formato'),
    q('fmt-4', '¿El trofeo original se llama…?', 'Copa Jules Rimet', ['Copa FIFA', 'Copa del Mundo', 'Copa Golden'], 'hard', 'curiosidades'),
    q('fmt-5', '¿El actual trofeo de oro se entrega desde…?', '1974', ['1966', '1982', '1958'], 'hard', 'curiosidades', 1974),
    q('fmt-6', '¿Qué país africano fue el primero en llegar a cuartos de final?', 'Camerún', ['Senegal', 'Ghana', 'Nigeria'], 'hard', 'records'),
    q('fmt-7', '¿Estados Unidos será coanfitrión del Mundial 2026 junto con…?', 'México y Canadá', ['Brasil y Argentina', 'Costa Rica y Panamá', 'Chile y Perú'], 'easy', 'sedes'),
    q('fmt-8', '¿La “Copa del Mundo” femenina FIFA es independiente desde…?', '1991', ['1985', '1995', '2000'], 'hard', 'curiosidades'),
  ]

  items.push(...formatQs)

  const extraBatch: TriviaQuestionSeed[] = [
    q('x-1', '¿Qué selección ganó el Mundial 1954 en la "Final del Milagio"?', 'Alemania Occidental', ['Hungría', 'Austria', 'Uruguay'], 'hard', 'historia', 1954),
    q('x-2', '¿Hungria era favorita y perdió la final de 1954 contra…?', 'Alemania', ['Brasil', 'Francia', 'Italia'], 'hard', 'historia', 1954),
    q('x-3', '¿El Mundial 1958 consagró a Pelé con solo…?', '17 años', ['19', '21', '15'], 'medium', 'leyendas', 1958),
    q('x-4', '¿Brasil ganó su primer título mundial en…?', '1958', ['1950', '1962', '1970'], 'medium', 'campeones', 1958),
    q('x-5', '¿Chile organizó el Mundial tras un terremoto en…?', '1960', ['1958', '1962', '1966'], 'hard', 'sedes', 1962),
    q('x-6', '¿Inglaterra ganó su único Mundial en casa en…?', '1966', ['1962', '1970', '1974'], 'easy', 'campeones', 1966),
    q('x-7', '¿Geoff Hurst marcó hat-trick en la final de…?', '1966', ['1970', '1962', '1974'], 'hard', 'momentos', 1966),
    q('x-8', '¿Brasil tricampeón con Pelé fue en México…?', '1970', ['1966', '1974', '1962'], 'easy', 'campeones', 1970),
    q('x-9', '¿Países Bajos llegó a dos finales seguidas en…?', '1974 y 1978', ['1970 y 1974', '1978 y 1982', '1982 y 1986'], 'hard', 'historia'),
    q('x-10', '¿Argentina ganó su primer Mundial de la mano de…?', 'César Luis Menotti', ['Bilardo', 'Bielsa', 'Sabella'], 'hard', 'dt', 1978),
    q('x-11', '¿Italia ganó su tercer Mundial en España…?', '1982', ['1978', '1986', '1990'], 'medium', 'campeones', 1982),
    q('x-12', '¿El Mundial 1986 se recuerda por Diego Maradona en…?', 'México', ['España', 'Argentina', 'Italia'], 'easy', 'sedes', 1986),
    q('x-13', '¿Alemania unificada ganó en Italia…?', '1990', ['1994', '1986', '1998'], 'medium', 'campeones', 1990),
    q('x-14', '¿El Mundial 1994 definió el título por…?', 'Penales', ['Gol de oro', 'Prórroga simple', 'Sorteo'], 'medium', 'finales', 1994),
    q('x-15', '¿Francia ganó en casa su primer título en…?', '1998', ['2006', '2018', '1994'], 'easy', 'campeones', 1998),
    q('x-16', '¿Zidane marcó dos goles de cabeza en la final de…?', '1998', ['2006', '2002', '2010'], 'medium', 'momentos', 1998),
    q('x-17', '¿Corea del Sur y Japón compartieron sede en…?', '2002', ['2010', '1998', '2018'], 'easy', 'sedes', 2002),
    q('x-18', '¿Turquía fue tercera en el Mundial…?', '2002', ['2006', '2010', '1998'], 'hard', 'records', 2002),
    q('x-19', '¿Alemania organizó el Mundial en…?', '2006', ['2010', '2014', '1998'], 'easy', 'sedes', 2006),
    q('x-20', '¿Ghana estuvo a un penal de semifinales en…?', '2010', ['2014', '2006', '2018'], 'hard', 'momentos', 2010),
    q('x-21', '¿Colombia fue anfitriona en…?', 'No fue anfitriona', ['2014', '1990', '1986'], 'medium', 'sedes'),
    q('x-22', '¿El VAR se usó de forma amplia por primera vez en…?', '2018', ['2014', '2022', '2010'], 'medium', 'formato', 2018),
    q('x-23', '¿Qatar fue el primer Mundial en Medio Oriente en…?', '2022', ['2018', '2010', '2006'], 'easy', 'sedes', 2022),
    q('x-24', '¿Argentina perdió la final 2014 contra…?', 'Alemania', ['Brasil', 'España', 'Francia'], 'easy', 'finales', 2014),
    q('x-25', '¿Messi ganó el Balón de Oro del torneo en…?', '2022', ['2014', '2010', '2018'], 'medium', 'leyendas', 2022),
    q('x-26', '¿Cuántas selecciones han ganado el Mundial?', '8', ['10', '6', '12'], 'hard', 'records'),
    q('x-27', '¿Uruguay fue campeón en…?', '1930 y 1950', ['1930 solamente', '1950 solamente', '1934'], 'hard', 'campeones'),
    q('x-28', '¿Italia y Brasil tienen cuántos títulos cada uno (hasta 2022)?', '4 y 5', ['3 y 5', '4 y 4', '5 y 5'], 'hard', 'records'),
    q('x-29', '¿El arquero Buffon nunca ganó un Mundial, pero jugó finales con…?', 'Italia', ['Francia', 'Alemania', 'España'], 'medium', 'leyendas'),
    q('x-30', '¿Cafu tiene cuántas medallas de campeón mundial?', '1', ['2', '3', '0'], 'hard', 'leyendas', 2002),
    q('x-31', '¿El primer Mundial con 32 equipos fue en…?', '1998', ['1994', '2002', '1986'], 'medium', 'formato', 1998),
    q('x-32', '¿El balón Jabulani fue polémico en…?', '2010', ['2006', '2014', '2018'], 'medium', 'curiosidades', 2010),
    q('x-33', '¿El balón Brazuca se usó en…?', '2014', ['2010', '2018', '2022'], 'easy', 'curiosidades', 2014),
    q('x-34', '¿El balón Al Rihla fue en…?', '2022', ['2018', '2014', '2010'], 'easy', 'curiosidades', 2022),
    q('x-35', '¿La mascota Zabivaka fue de…?', '2018', ['2014', '2022', '2010'], 'medium', 'curiosidades', 2018),
    q('x-36', '¿La mascota Fuleco era un armadillo de…?', '2014', ['2010', '2018', '2022'], 'medium', 'curiosidades', 2014),
    q('x-37', '¿La canción "Waka Waka" se asoció al Mundial…?', '2010', ['2014', '2018', '2006'], 'easy', 'curiosidades', 2010),
    q('x-38', '¿El estadio Maracaná fue sede de finales en…?', '1950 y 2014', ['2014 solamente', '1950 solamente', '2006'], 'hard', 'sedes'),
    q('x-39', '¿El Azteca albergó dos finales mundialistas en…?', '1970 y 1986', ['1986 solamente', '1970 solamente', '1994'], 'hard', 'sedes'),
    q('x-40', '¿El Wembley fue sede de la final en…?', '1966', ['2018', '1996', '2006'], 'medium', 'sedes', 1966),
    q('x-41', '¿Croatia fue subcampeona en su debut como independiente en…?', '2018', ['2022', '1998', '2006'], 'medium', 'records', 2018),
    q('x-42', '¿Senegal sorprendió al campeón Francia en el arranque de…?', '2002', ['2010', '2018', '2006'], 'medium', 'momentos', 2002),
    q('x-43', '¿Italia quedó fuera en fase de grupos siendo campeón defensor en…?', '2010', ['2006', '2014', '2018'], 'hard', 'momentos', 2010),
    q('x-44', '¿España quedó campeona defensora eliminada temprano en…?', '2014', ['2010', '2018', '2022'], 'medium', 'momentos', 2014),
    q('x-45', '¿Alemania campeona cayó en fase de grupos en…?', '2018', ['2014', '2022', '2010'], 'medium', 'momentos', 2018),
    q('x-46', '¿El primer Mundial transmitido en color en TV fue en…?', '1970', ['1966', '1974', '1982'], 'hard', 'curiosidades', 1970),
    q('x-47', '¿El "Grupo de la muerte" suele referirse a grupos muy competitivos; en 2014 uno incluía a Alemania, Portugal, Ghana y…?', 'Estados Unidos', ['España', 'Italia', 'Uruguay'], 'hard', 'formato', 2014),
    q('x-48', '¿Quién marcó el gol más rápido en una final (aprox. 90 segundos)?', 'Johan Neeskens (penal)', ['Pelé', 'Müller', 'Lineker'], 'hard', 'records'),
    q('x-49', '¿Miroslav Klose marcó goles en cuántos Mundiales distintos?', '4', ['3', '5', '2'], 'hard', 'goleadores'),
    q('x-50', '¿Cristiano Ronaldo marcó su primer gol mundialista en…?', '2006', ['2010', '2014', '2002'], 'medium', 'leyendas', 2006),
  ]

  const yBatch: TriviaQuestionSeed[] = [
    q('y-01', '¿Quién fue el máximo goleador del Mundial 2002?', 'Ronaldo', ['Rivaldo', 'Klose', 'Henry'], 'medium', 'goleadores', 2002),
    q('y-02', '¿Quién ganó el Balón de Oro del Mundial 2010?', 'Diego Forlán', ['Iniesta', 'Sneijder', 'Xavi'], 'hard', 'premios', 2010),
    q('y-03', '¿Cuántos goles marcó Just Fontaine en un solo Mundial?', '13', ['10', '11', '15'], 'hard', 'records', 1958),
    q('y-04', '¿En qué Mundial debutó el VAR en partidos oficiales?', '2018', ['2014', '2022', '2010'], 'medium', 'formato', 2018),
    q('y-05', '¿Qué selección ganó el Mundial 1958?', 'Brasil', ['Suecia', 'Francia', 'Alemania'], 'easy', 'campeones', 1958),
    q('y-06', '¿Qué país organizó el Mundial 1974?', 'Alemania Occidental', ['Holanda', 'Argentina', 'México'], 'medium', 'sedes', 1974),
    q('y-07', '¿Quién marcó el gol de la "Mano de Dios"?', 'Maradona', ['Valdano', 'Burruchaga', 'Caniggia'], 'easy', 'momentos', 1986),
    q('y-08', '¿Qué selección eliminó a Brasil en cuartos en 1998?', 'Francia', ['Holanda', 'Dinamarca', 'Italia'], 'medium', 'momentos', 1998),
    q('y-09', '¿Cuántas Copas del Mundo ganó Pelé como jugador?', '3', ['2', '4', '1'], 'medium', 'leyendas'),
    q('y-10', '¿En qué año Uruguay ganó su segunda Copa del Mundo?', '1950', ['1930', '1966', '1970'], 'medium', 'campeones', 1950),
    q('y-11', '¿Quién fue entrenador de España en el Mundial 2010?', 'Del Bosque', ['Aragonés', 'Lopetegui', 'Enrique'], 'medium', 'selecciones', 2010),
    q('y-12', '¿Qué país fue sede del Mundial 2002 junto a Corea del Sur?', 'Japón', ['China', 'Tailandia', 'Singapur'], 'easy', 'sedes', 2002),
    q('y-13', '¿Quién marcó el gol del 2-1 en la final 2014?', 'Götze', ['Schürrle', 'Kroos', 'Müller'], 'medium', 'finales', 2014),
    q('y-14', '¿Qué selección ganó el Mundial 1966?', 'Inglaterra', ['Alemania', 'Portugal', 'URSS'], 'easy', 'campeones', 1966),
    q('y-15', '¿Cuántos equipos participaron en el Mundial 1982?', '24', ['16', '32', '20'], 'hard', 'formato', 1982),
    q('y-16', '¿Quién fue el arquero de Argentina en la final 2022?', 'Martínez', ['Romero', 'Armani', 'Musso'], 'easy', 'selecciones', 2022),
    q('y-17', '¿Qué país africano llegó a semifinales en 2022?', 'Marruecos', ['Senegal', 'Camerún', 'Ghana'], 'easy', 'records', 2022),
    q('y-18', '¿En qué Mundial Zidane cabeceó a Materazzi y fue expulsado?', '2006', ['2002', '1998', '2010'], 'easy', 'momentos', 2006),
    q('y-19', '¿Quién ganó el Mundial 1978?', 'Argentina', ['Holanda', 'Brasil', 'Italia'], 'easy', 'campeones', 1978),
    q('y-20', '¿Qué selección ganó el Mundial 1934?', 'Italia', ['Checoslovaquia', 'Alemania', 'Austria'], 'hard', 'campeones', 1934),
    q('y-21', '¿Cuántos Mundiales ganó Alemania (incl. Alemania Occidental)?', '4', ['3', '5', '2'], 'medium', 'campeones'),
    q('y-22', '¿Quién marcó el primer gol en la historia de los Mundiales?', 'Lucien Laurent', ['Pelé', 'Stábile', 'Meazza'], 'hard', 'records', 1930),
    q('y-23', '¿Qué país organizó el Mundial 1994?', 'Estados Unidos', ['México', 'Brasil', 'Canadá'], 'easy', 'sedes', 1994),
    q('y-24', '¿Quién fue el goleador del Mundial 1986 con 6 goles?', 'Lineker', ['Maradona', 'Butragueño', 'Careca'], 'hard', 'goleadores', 1986),
    q('y-25', '¿En qué Mundial se usó por primera vez la tanda de penales en final?', '1994', ['1986', '1990', '1998'], 'hard', 'finales', 1994),
    q('y-26', '¿Qué selección ganó el Mundial 1982?', 'Italia', ['Alemania', 'Brasil', 'Francia'], 'medium', 'campeones', 1982),
    q('y-27', '¿Quién marcó el hat-trick de España en el 7-0 a Costa Rica en 2022?', 'Ferran Torres', ['Morata', 'Olmo', 'Asensio'], 'medium', 'momentos', 2022),
    q('y-28', '¿Qué país fue campeón en 1990?', 'Alemania Occidental', ['Argentina', 'Italia', 'Inglaterra'], 'medium', 'campeones', 1990),
    q('y-29', '¿Cuántos goles marcó James Rodríguez en el Mundial 2014?', '6', ['5', '7', '4'], 'medium', 'goleadores', 2014),
    q('y-30', '¿Qué selección ganó el Mundial 1954?', 'Alemania Occidental', ['Hungría', 'Austria', 'Uruguay'], 'hard', 'campeones', 1954),
    q('y-31', '¿En qué Mundial debutó Messi con la albiceleste?', '2006', ['2010', '2014', '2002'], 'easy', 'leyendas', 2006),
    q('y-32', '¿Quién ganó el Mundial 1938?', 'Italia', ['Hungría', 'Brasil', 'Francia'], 'hard', 'campeones', 1938),
    q('y-33', '¿Qué país organizó el Mundial 2010?', 'Sudáfrica', ['Egipto', 'Marruecos', 'Nigeria'], 'easy', 'sedes', 2010),
    q('y-34', '¿Quién fue capitán de Francia en la final 2018?', 'Lloris', ['Griezmann', 'Pogba', 'Varane'], 'medium', 'selecciones', 2018),
    q('y-35', '¿Cuántos Mundiales ganó Brasil?', '5', ['4', '6', '3'], 'easy', 'campeones'),
    q('y-36', '¿Qué país eliminó a Alemania en semifinales en 2010?', 'España', ['Argentina', 'Holanda', 'Uruguay'], 'medium', 'momentos', 2010),
    q('y-37', '¿Quién marcó el gol de la victoria en la final 1998?', 'Zidane', ['Henry', 'Petit', 'Trezeguet'], 'medium', 'finales', 1998),
    q('y-38', '¿En qué Mundial se jugó el partido "Maracanazo"?', '1950', ['1930', '1962', '1970'], 'medium', 'momentos', 1950),
    q('y-39', '¿Qué selección ganó el Mundial 1962?', 'Brasil', ['Chile', 'Checoslovaquia', 'Yugoslavia'], 'medium', 'campeones', 1962),
    q('y-40', '¿Quién fue el máximo goleador del Mundial 2018?', 'Kane', ['Lukaku', 'Griezmann', 'Mbappé'], 'medium', 'goleadores', 2018),
    q('y-41', '¿Qué país organizó el Mundial 1986?', 'México', ['Colombia', 'Estados Unidos', 'Argentina'], 'easy', 'sedes', 1986),
    q('y-42', '¿Cuántos goles marcó Mbappé en la final 2022?', '3', ['2', '4', '1'], 'medium', 'finales', 2022),
    q('y-43', '¿Quién ganó el Mundial 2006?', 'Italia', ['Francia', 'Alemania', 'Brasil'], 'easy', 'campeones', 2006),
    q('y-44', '¿Qué país fue subcampeón en 1974?', 'Holanda', ['Brasil', 'Polonia', 'Alemania Oriental'], 'medium', 'campeones', 1974),
    q('y-45', '¿En qué Mundial Bélgica terminó tercera?', '2018', ['1986', '2002', '2022'], 'medium', 'records', 2018),
    q('y-46', '¿Quién marcó el gol del 1-0 en la final 2010 para España?', 'Iniesta', ['Villa', 'Puyol', 'Torres'], 'easy', 'finales', 2010),
    q('y-47', '¿Qué selección ganó el Mundial 1970?', 'Brasil', ['Italia', 'Alemania', 'Uruguay'], 'easy', 'campeones', 1970),
    q('y-48', '¿Cuántos equipos habrá en el Mundial 2026?', '48', ['40', '32', '36'], 'medium', 'formato', 2026),
    q('y-49', '¿Quién fue el entrenador de Alemania en 2014?', 'Löw', ['Klinsmann', 'Flick', 'Nagelsmann'], 'medium', 'selecciones', 2014),
    q('y-50', '¿Qué país ganó el Mundial 1998?', 'Francia', ['Brasil', 'Croacia', 'Holanda'], 'easy', 'campeones', 1998),
    q('y-51', '¿En qué Mundial Corea del Sur llegó a semifinales?', '2002', ['2010', '2006', '2018'], 'medium', 'records', 2002),
    q('y-52', '¿Quién marcó el penal decisivo en la final 2006?', 'Grosso', ['Del Piero', 'Totti', 'Cannavaro'], 'hard', 'finales', 2006),
    q('y-53', '¿Qué país organizó el Mundial 1978?', 'Argentina', ['Brasil', 'Uruguay', 'Chile'], 'easy', 'sedes', 1978),
    q('y-54', '¿Cuántos Mundiales ganó Argentina hasta 2022?', '3', ['2', '4', '1'], 'medium', 'campeones'),
    q('y-55', '¿Quién fue el goleador del Mundial 2006?', 'Klose', ['Ronaldo', 'Podolski', 'Ribéry'], 'medium', 'goleadores', 2006),
    q('y-56', '¿Qué selección ganó el Mundial 1950 en Brasil?', 'Uruguay', ['Brasil', 'España', 'Suecia'], 'hard', 'campeones', 1950),
    q('y-57', '¿En qué Mundial se introdujo el sistema de dos grupos en segunda fase?', '1982', ['1978', '1986', '1990'], 'hard', 'formato', 1982),
    q('y-58', '¿Quién marcó el gol de cabeza famoso en 1970 contra Italia?', 'Pelé', ['Jairzinho', 'Tostão', 'Rivelino'], 'medium', 'momentos', 1970),
    q('y-59', '¿Qué país fue sede del Mundial 1966?', 'Inglaterra', ['Francia', 'Alemania', 'España'], 'easy', 'sedes', 1966),
    q('y-60', '¿Quién ganó el Mundial 2018?', 'Francia', ['Croacia', 'Bélgica', 'Inglaterra'], 'easy', 'campeones', 2018),
    q('y-61', '¿Cuántos goles marcó Pelé en Mundiales?', '12', ['10', '15', '8'], 'hard', 'leyendas'),
    q('y-62', '¿Qué país eliminó a España en octavos en 2022?', 'Marruecos', ['Croacia', 'Brasil', 'Alemania'], 'medium', 'momentos', 2022),
    q('y-63', '¿En qué Mundial debutó la mascota World Cup Willie?', '1966', ['1958', '1970', '1974'], 'hard', 'curiosidades', 1966),
    q('y-64', '¿Quién fue el máximo goleador del Mundial 1990?', 'Schillaci', ['Lineker', 'Matthäus', 'Voller'], 'medium', 'goleadores', 1990),
    q('y-65', '¿Qué selección ganó el Mundial 2002?', 'Brasil', ['Alemania', 'Turquía', 'Corea del Sur'], 'easy', 'campeones', 2002),
    q('y-66', '¿Cuántas finales mundialistas perdió Holanda?', '3', ['2', '4', '1'], 'hard', 'records'),
    q('y-67', '¿Quién marcó el gol del 3-2 en la final 2022 en tiempo extra?', 'Messi', ['Di María', 'Álvarez', 'Mac Allister'], 'easy', 'finales', 2022),
    q('y-68', '¿Qué país organizó el Mundial 1950?', 'Brasil', ['Uruguay', 'Argentina', 'Chile'], 'medium', 'sedes', 1950),
    q('y-69', '¿En qué Mundial Italia ganó en casa?', '1934', ['1990', '1982', '2006'], 'hard', 'campeones', 1934),
    q('y-70', '¿Quién fue el arquero de Brasil en 2002?', 'Marcos', ['Dida', 'Cássio', 'Taffarel'], 'hard', 'selecciones', 2002),
    q('y-71', '¿Qué país ganó el Mundial 2014?', 'Alemania', ['Argentina', 'Brasil', 'Holanda'], 'easy', 'campeones', 2014),
    q('y-72', '¿Cuántos goles marcó Miroslav Klose en total en Mundiales?', '16', ['15', '14', '17'], 'medium', 'goleadores'),
    q('y-73', '¿En qué Mundial se jugó el partido "La Mano de Dios" y el "Gol del Siglo"?', '1986', ['1982', '1990', '1978'], 'easy', 'momentos', 1986),
    q('y-74', '¿Quién fue subcampeón en 2010?', 'Holanda', ['Alemania', 'Uruguay', 'España'], 'medium', 'campeones', 2010),
    q('y-75', '¿Qué país organizó el Mundial 2006?', 'Alemania', ['Francia', 'Italia', 'España'], 'easy', 'sedes', 2006),
    q('y-76', '¿Quién marcó el primer gol de Francia en la final 2018?', 'Mandžukić (en contra)', ['Griezmann', 'Mbappé', 'Pogba'], 'hard', 'finales', 2018),
    q('y-77', '¿Cuántos Mundiales ganó Italia?', '4', ['3', '5', '2'], 'medium', 'campeones'),
    q('y-78', '¿En qué Mundial EEUU llegó a cuartos de final?', '2002', ['1994', '2010', '2014'], 'medium', 'records', 2002),
    q('y-79', '¿Quién fue el entrenador de Argentina en 2022?', 'Scaloni', ['Sampaoli', 'Sabella', 'Bielsa'], 'easy', 'selecciones', 2022),
    q('y-80', '¿Qué selección ganó el primer Mundial en 1930?', 'Uruguay', ['Argentina', 'Estados Unidos', 'Yugoslavia'], 'easy', 'campeones', 1930),
  ]

  items.push(...extraBatch, ...yBatch)

  // Dedupe by id
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

export const TRIVIA_QUESTIONS_BANK = buildTriviaQuestionsBank()
