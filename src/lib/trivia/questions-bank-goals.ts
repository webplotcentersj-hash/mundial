import type { TriviaQuestionSeed } from './constants'

function q(
  id: string,
  question: string,
  correct: string,
  wrong: [string, string, string],
  difficulty: 'easy' | 'medium' | 'hard',
  category: string,
  worldCupYear?: number,
): TriviaQuestionSeed {
  const options = [correct, wrong[0], wrong[1], wrong[2]] as [string, string, string, string]
  return { id, question, options, correctIndex: 0, difficulty, category, worldCupYear }
}

/** Goleadores, goles, minutos y récords mundialistas. */
export const TRIVIA_QUESTIONS_GOALS: TriviaQuestionSeed[] = [
  // --- Goleadores por Mundial (huecos no repetidos) ---
  q('gol-001', '¿Quién fue el máximo goleador del primer Mundial (1930)?', 'Guillermo Stábile', ['Lucien Laurent', 'José Leandro Andrade', 'Pedro Cea'], 'hard', 'goleadores', 1930),
  q('gol-002', '¿Cuántos goles marcó Stábile en el Mundial 1930?', '8', ['6', '10', '5'], 'hard', 'goleadores', 1930),
  q('gol-003', '¿Quién fue el máximo goleador del Mundial 1950?', 'Ademir', ['Zizinho', 'Juan Schiaffino', 'Alcides Ghiggia'], 'hard', 'goleadores', 1950),
  q('gol-004', '¿Cuántos goles marcó Ademir en el Mundial 1950?', '9', ['7', '11', '6'], 'hard', 'goleadores', 1950),
  q('gol-005', '¿Quién fue el máximo goleador del Mundial 1954?', 'Sándor Kocsis', ['Ferenc Puskás', 'Max Morlock', 'Helmut Rahn'], 'hard', 'goleadores', 1954),
  q('gol-006', '¿Cuántos goles marcó Kocsis en Suiza 1954?', '11', ['9', '13', '8'], 'hard', 'goleadores', 1954),
  q('gol-007', '¿Quién fue el máximo goleador del Mundial 1966?', 'Eusébio', ['Geoff Hurst', 'Franz Beckenbauer', 'Pelé'], 'medium', 'goleadores', 1966),
  q('gol-008', '¿Cuántos goles marcó Eusébio en Inglaterra 1966?', '9', ['7', '11', '6'], 'hard', 'goleadores', 1966),
  q('gol-009', '¿Quién fue el máximo goleador del Mundial 1970?', 'Gerd Müller', ['Pelé', 'Jairzinho', 'Tostão'], 'medium', 'goleadores', 1970),
  q('gol-010', '¿Cuántos goles marcó Gerd Müller en México 1970?', '10', ['8', '12', '7'], 'hard', 'goleadores', 1970),
  q('gol-011', '¿Quién fue el máximo goleador del Mundial 1974?', 'Grzegorz Lato', ['Johan Cruyff', 'Paul Breitner', 'Gerd Müller'], 'hard', 'goleadores', 1974),
  q('gol-012', '¿Quién fue el máximo goleador del Mundial 1982?', 'Paolo Rossi', ['Karl-Heinz Rummenigge', 'Zico', 'Michel Platini'], 'medium', 'goleadores', 1982),
  q('gol-013', '¿Cuántos goles marcó Paolo Rossi en España 1982?', '6', ['5', '7', '8'], 'medium', 'goleadores', 1982),
  q('gol-014', '¿Quién fue el máximo goleador del Mundial 1994?', 'Hristo Stoichkov y Oleg Salenko (6)', ['Romário', 'Roberto Baggio', 'Dennis Bergkamp'], 'hard', 'goleadores', 1994),
  q('gol-015', '¿Quién fue el máximo goleador del Mundial 1998?', 'Davor Šuker', ['Ronaldo', 'Dennis Bergkamp', 'Gabriel Batistuta'], 'medium', 'goleadores', 1998),
  q('gol-016', '¿Cuántos goles marcó Šuker en Francia 1998?', '6', ['5', '7', '8'], 'hard', 'goleadores', 1998),
  q('gol-017', '¿Cuántos goles marcó Miroslav Klose como goleador del Mundial 2006?', '5', ['6', '4', '7'], 'medium', 'goleadores', 2006),
  q('gol-018', '¿Cuántos goles marcó Thomas Müller en Sudáfrica 2010?', '5', ['4', '6', '7'], 'medium', 'goleadores', 2010),
  q('gol-019', '¿Quién fue el máximo goleador del Mundial 2010?', 'Diego Forlán, Wesley Sneijder, David Villa y Thomas Müller (5)', ['Lionel Messi', 'David Villa solo', 'Diego Forlán solo'], 'hard', 'goleadores', 2010),
  q('gol-020', '¿Cuántos goles marcó Mbappé en todo Qatar 2022?', '8', ['6', '7', '9'], 'medium', 'goleadores', 2022),
  q('gol-021', '¿Cuántos goles marcó Lionel Messi en Qatar 2022?', '7', ['5', '8', '6'], 'medium', 'goleadores', 2022),
  q('gol-022', '¿Cuántos goles marcó Julián Álvarez en Qatar 2022?', '4', ['3', '5', '6'], 'medium', 'goleadores', 2022),
  q('gol-023', '¿Cuántos goles marcó Olivier Giroud en Qatar 2022?', '4', ['3', '5', '2'], 'medium', 'goleadores', 2022),

  // --- Récords históricos de goleadores ---
  q('gol-024', '¿Quién tiene el récord de más goles en un solo Mundial (13)?', 'Just Fontaine', ['Miroslav Klose', 'Ronaldo', 'Gerd Müller'], 'medium', 'goles-records', 1958),
  q('gol-025', '¿En qué Mundial Fontaine marcó sus 13 goles?', '1958', ['1962', '1954', '1966'], 'medium', 'goles-records', 1958),
  q('gol-026', '¿Quién superó a Ronaldo (15) como goleador histórico en 2014?', 'Miroslav Klose', ['Lionel Messi', 'Thomas Müller', 'Pelé'], 'easy', 'goleadores', 2014),
  q('gol-027', '¿En qué partido Klose igualó el récord de Ronaldo y luego lo superó?', 'Semifinal 2014 vs Brasil', ['Final 2014', 'Cuartos 2014', 'Grupos 2010'], 'hard', 'goleadores', 2014),
  q('gol-028', '¿Cuántos goles marcó Pelé en finales de Mundial?', '3', ['2', '4', '5'], 'hard', 'goles-records'),
  q('gol-029', '¿Cuántos Mundiales distintos marcó gol Miroslav Klose?', '4', ['3', '5', '2'], 'medium', 'goleadores'),
  q('gol-030', '¿Cuántos Mundiales distintos marcó gol Lionel Messi?', '5', ['4', '3', '6'], 'medium', 'goleadores'),
  q('gol-031', '¿Cuántos goles marcó Cristiano Ronaldo en Mundiales (hasta 2022)?', '8', ['7', '9', '10'], 'medium', 'goleadores'),
  q('gol-032', '¿Cuántos goles marcó Kylian Mbappé en Mundiales (hasta 2022)?', '12', ['10', '8', '14'], 'medium', 'goleadores'),
  q('gol-033', '¿Quién es el máximo goleador de Brasil en Mundiales?', 'Ronaldo con 15', ['Pelé', 'Romário', 'Neymar'], 'medium', 'goleadores'),
  q('gol-034', '¿Cuántos goles mundialistas tiene Neymar (hasta 2022)?', '8', ['10', '6', '7'], 'medium', 'goleadores'),
  q('gol-035', '¿Cuántos goles marcó Diego Maradona en Mundiales?', '8', ['10', '6', '12'], 'medium', 'goleadores'),
  q('gol-036', '¿Cuántos goles marcó Gabriel Batistuta en Mundiales?', '10', ['8', '12', '6'], 'hard', 'goleadores'),
  q('gol-037', '¿Cuántos goles marcó Jürgen Klinsmann en Mundiales?', '11', ['9', '13', '8'], 'hard', 'goleadores'),
  q('gol-038', '¿Cuántos goles marcó Teófilo Cubillas en Mundiales?', '10', ['8', '12', '6'], 'hard', 'goleadores'),

  // --- Goles en un partido / hat-tricks ---
  q('gol-039', '¿Quién marcó 5 goles en un partido del Mundial 1994?', 'Oleg Salenko', ['Romário', 'Hristo Stoichkov', 'Dennis Bergkamp'], 'medium', 'goles-records', 1994),
  q('gol-040', '¿Contra qué selección Salenko marcó 5 goles en 1994?', 'Camerún', ['México', 'Suecia', 'Colombia'], 'hard', 'goles-records', 1994),
  q('gol-041', '¿Cuál es el resultado más abultado en un Mundial?', 'Hungria 10-1 El Salvador (1982)', ['Alemania 8-0 Arabia Saudita', 'Yugoslavia 9-0 Zaire', 'Uruguay 7-0 Escocia'], 'hard', 'goles-records', 1982),
  q('gol-042', '¿Geoff Hurst marcó un hat-trick en la final de…?', '1966', ['1970', '1962', '1974'], 'easy', 'goles-finales', 1966),
  q('gol-043', '¿Antes de Mbappé en 2022, ¿quién había hecho hat-trick en una final?', 'Geoff Hurst (1966)', ['Pelé', 'Ronaldo', 'Zidane'], 'medium', 'goles-finales', 2022),
  q('gol-044', '¿Mbappé anotó 3 goles en la final 2022 pero…?', 'Francia igual perdió en penales', ['Francia ganó', 'Fue expulsado', 'No hubo prórroga'], 'easy', 'goles-finales', 2022),
  q('gol-045', '¿Cuántos goles marcó Rusia (URSS) en el partido vs Camerún en 1994?', '6', ['5', '7', '4'], 'hard', 'goles-records', 1994),
  q('gol-046', '¿Alemania marcó 7 goles contra Brasil en semifinales de…?', '2014', ['2010', '2018', '2002'], 'easy', 'goles-records', 2014),
  q('gol-047', '¿España marcó 7-0 a Costa Rica en el Mundial…?', '2022', ['2010', '2014', '2018'], 'easy', 'goles-records', 2022),
  q('gol-048', '¿Quién marcó dos goles en la final de 1978 para Argentina?', 'Mario Kempes', ['Leopoldo Luque', 'Daniel Passarella', 'Daniel Bertoni'], 'hard', 'goles-finales', 1978),

  // --- Minutos: más rápido, más tarde, tiempo extra ---
  q('gol-049', '¿Cuál es el gol más rápido en la historia del Mundial?', 'Hakan Şükür (~11 segundos)', ['Clint Dempsey (~29 seg)', 'Bryan Robson (~27 seg)', 'Emile Mpenza (~20 seg)'], 'hard', 'goles-minutos', 2002),
  q('gol-050', '¿Şükür marcó el gol más rápido en 2002 contra…?', 'Corea del Sur', ['Turquía no — Turquía marcó', 'Brasil', 'Senegal'], 'hard', 'goles-minutos', 2002),
  q('gol-051', '¿Clint Dempsey marcó el gol más rápido de USA en 2014 al minuto…?', '29 segundos', ['11 segundos', '45 segundos', '2 minutos'], 'hard', 'goles-minutos', 2014),
  q('gol-052', '¿Iniesta marcó el gol del título español en el minuto…?', '116 (alargue)', ['90', '105', '120 en penales'], 'medium', 'goles-minutos', 2010),
  q('gol-053', '¿Götze marcó el gol de Alemania en la final 2014 en el minuto…?', '113', ['90', '105', '120'], 'medium', 'goles-minutos', 2014),
  q('gol-054', '¿Messi abrió el marcador en la final 2022 en el minuto…?', '23', ['10', '36', '45+2'], 'medium', 'goles-minutos', 2022),
  q('gol-055', '¿Di María marcó el 2-0 de Argentina en la final 2022 al minuto…?', '36', ['23', '45', '55'], 'medium', 'goles-minutos', 2022),
  q('gol-056', '¿Mbappé descontó el 2-1 en la final 2022 al minuto…?', '80', ['70', '90', '65'], 'hard', 'goles-minutos', 2022),
  q('gol-057', '¿Mbappé igualó 3-3 en la final 2022 al minuto…?', '81', ['90', '85', '88'], 'hard', 'goles-minutos', 2022),
  q('gol-058', '¿Messi puso 4-3 en la final 2022 en el minuto…?', '108 (alargue)', ['90', '95', '115'], 'hard', 'goles-minutos', 2022),
  q('gol-059', '¿Mbappé completó su hat-trick en la final 2022 al minuto…?', '118 (alargue)', ['90', '105', '120'], 'hard', 'goles-minutos', 2022),
  q('gol-060', '¿Maradona marcó la “Mano de Dios” aproximadamente al minuto…?', '51', ['30', '70', '90'], 'medium', 'goles-minutos', 1986),
  q('gol-061', '¿Maradona marcó el “Gol del Siglo” vs Inglaterra al minuto…?', '55', ['51', '70', '45'], 'medium', 'goles-minutos', 1986),
  q('gol-062', '¿El “gol del siglo” de Maxi Rodríguez vs México en 2006 fue en…?', 'Tiempo extra (alargue)', ['Primer tiempo', 'Segundo tiempo', 'Penales'], 'hard', 'goles-minutos', 2006),
  q('gol-063', '¿En qué minuto Zidane cabeceó a Materazzi en la final 2006?', '110', ['90', '105', '120'], 'hard', 'goles-minutos', 2006),

  // --- Penales, autogoles, tipos de gol ---
  q('gol-064', '¿Quién erró el penal decisivo en la final 1994?', 'Roberto Baggio', ['Roberto Donadoni', 'Daniele Massaro', 'Franco Baresi'], 'easy', 'goles-finales', 1994),
  q('gol-065', '¿Cuántos penales falló Baggio en la tanda de 1994?', '1 (el último)', ['2', 'Ninguno', '3'], 'medium', 'goles-finales', 1994),
  q('gol-066', '¿El primer gol de Francia en la final 2018 fue…?', 'Autogol de Mandžukić', ['Gol de Griezmann', 'Gol de Mbappé', 'Gol de Pogba'], 'medium', 'goles-finales', 2018),
  q('gol-067', '¿Cuántos goles en contra hubo en el Mundial 2018?', '12 (récord hasta entonces)', ['8', '15', '5'], 'hard', 'goles-records', 2018),
  q('gol-068', '¿Messi convirtió su primer gol en Mundiales de qué forma en 2006?', 'Penal', ['Tiro libre', 'Cabeza', 'Remate de área'], 'medium', 'goleadores', 2006),
  q('gol-069', '¿El gol de Messi en la final 2022 fue de…?', 'Penal', ['Remate cruzado', 'Cabezazo', 'Tiro libre'], 'easy', 'goles-finales', 2022),
  q('gol-070', '¿El segundo gol de Argentina en la final 2022 fue de…?', 'Di María (contragolpe)', ['Messi', 'Álvarez', 'Enzo Fernández'], 'medium', 'goles-finales', 2022),

  // --- Qatar 2022 goles memorables ---
  q('gol-071', '¿Quién marcó el gol de Richarlison de tijera en 2022?', 'Richarlison (Brasil vs Serbia)', ['Vinicius Jr.', 'Neymar', 'Raphinha'], 'easy', 'goles-mundial-2022', 2022),
  q('gol-072', '¿Arabia Saudita venció 2-1 a Argentina con goles de…?', 'Al-Shehri y Al-Dawsari', ['Al-Otaibi y Al-Faraj', 'Salman y Al-Burayk', 'Al-Muwallad y Al-Harbi'], 'hard', 'goles-mundial-2022', 2022),
  q('gol-073', '¿Japón remontó 2-1 a Alemania en 2022 con goles de…?', 'Doan y Asano', ['Minamino e Ito', 'Kubo y Kamada', 'Osako y Tomiyasu'], 'hard', 'goles-mundial-2022', 2022),
  q('gol-074', '¿Marruecos eliminó a Portugal en 2022 con gol de…?', 'En-Nesyri', ['Ziyech', 'Hakimi', 'Amrabat'], 'medium', 'goles-mundial-2022', 2022),
  q('gol-075', '¿Croacia empató 3-3 con España en 2022 con un gol de…?', 'Oršić (al 90+11)', ['Modrić', 'Perišić', 'Kramarić'], 'hard', 'goles-minutos', 2022),
  q('gol-076', '¿Países Bajos empató 3-3 con Argentina en cuartos 2022 con gol de…?', 'Weghorst (2 goles)', ['Depay', 'Gakpo', 'Van Dijk'], 'medium', 'goles-mundial-2022', 2022),
  q('gol-077', '¿Quién marcó el penal decisivo en la tanda Argentina vs Países Bajos 2022?', 'Lautaro Martínez', ['Messi', 'Dybala', 'Fernández'], 'hard', 'goles-mundial-2022', 2022),
  q('gol-078', '¿Gonzalo Montiel convirtió el penal del título en la final…?', '2022', ['2014', '2018', '2010'], 'easy', 'goles-finales', 2022),
  q('gol-079', '¿Cuántos goles en total se marcaron en Qatar 2022?', '172', ['171', '160', '185'], 'hard', 'goles-records', 2022),
  q('gol-080', '¿Cuántos goles promedio por partido hubo en Qatar 2022?', '2,69', ['2,10', '3,20', '2,00'], 'hard', 'goles-records', 2022),

  // --- Más goleadores y situaciones ---
  q('gol-081', '¿Ronaldo (Brasil) marcó 8 goles en un solo Mundial en…?', '2002', ['1998', '2006', '1994'], 'medium', 'goleadores', 2002),
  q('gol-082', '¿Cuántos goles marcó Rivaldo en el Mundial 2002?', '5', ['4', '6', '8'], 'hard', 'goleadores', 2002),
  q('gol-083', '¿Cuántos goles marcó Jairzinho en el tricampeonato de 1970?', '7', ['5', '9', '6'], 'hard', 'goleadores', 1970),
  q('gol-084', '¿Cuántos goles marcó Teófilo Cubillas en el Mundial 1970?', '5', ['3', '7', '4'], 'hard', 'goleadores', 1970),
  q('gol-085', '¿Cuántos goles marcó Gary Lineker en el Mundial 1986?', '6', ['5', '4', '8'], 'medium', 'goleadores', 1986),
  q('gol-086', '¿Cuántos goles marcó Diego Maradona en México 86?', '5', ['6', '4', '8'], 'medium', 'goleadores', 1986),
  q('gol-087', '¿Cuántos goles marcó Careca en el Mundial 1990?', '5', ['4', '6', '3'], 'hard', 'goleadores', 1990),
  q('gol-088', '¿Cuántos goles marcó Romário en el Mundial 1994?', '5', ['6', '4', '7'], 'medium', 'goleadores', 1994),
  q('gol-089', '¿Cuántos goles marcó Dennis Bergkamp en el Mundial 1998?', '3', ['5', '2', '4'], 'hard', 'goleadores', 1998),
  q('gol-090', '¿Cuántos goles marcó Luis Hernández en el Mundial 1998?', '4', ['3', '5', '6'], 'hard', 'goleadores', 1998),

  // --- Minutos y reglas ---
  q('gol-091', '¿El “gol de oro” en Mundiales se usó entre 1998 y…?', '2002', ['2006', '2010', '1994'], 'hard', 'goles-minutos', 1998),
  q('gol-092', '¿En qué Mundiales se aplicó la regla del “gol de oro” en alargue?', '2002 y 2006', ['1998 solamente', '2010 y 2014', 'Nunca en Mundiales'], 'hard', 'goles-minutos'),
  q('gol-093', '¿Cuántos minutos dura un partido de fase de grupos en el Mundial (reglamento)?', '90 + alargue del árbitro', ['80', '100 fijos', '120 siempre'], 'easy', 'goles-minutos'),
  q('gol-094', '¿En eliminatorias directas, si hay empate tras 90 minutos se juegan…?', '30 minutos de alargue', ['Penales directo', '15 minutos', 'Replay'], 'easy', 'goles-minutos'),
  q('gol-095', '¿Desde 2022, ¿cuántos cambios puede hacer un DT en partido de Mundial?', '5 (con 6to en alargue)', ['3', '4', 'Ilimitados'], 'medium', 'goles-minutos', 2022),
  q('gol-096', '¿El tiempo añadido récord en un partido de 2022 superó los…?', '10 minutos (varios partidos)', ['5 minutos siempre', '20 minutos en todos', 'No hubo alargue'], 'hard', 'goles-minutos', 2022),

  // --- Argentina goles ---
  q('gol-097', '¿Cuántos goles marcó Mario Kempes en el Mundial 1978?', '6', ['5', '7', '4'], 'medium', 'goleadores', 1978),
  q('gol-098', '¿Cuántos goles marcó Batistuta en el Mundial 1998?', '5', ['4', '6', '3'], 'hard', 'goleadores', 1998),
  q('gol-099', '¿Cuántos goles marcó Higuaín en el Mundial 2014?', '1', ['3', '0', '2'], 'hard', 'goleadores', 2014),
  q('gol-100', '¿Cuántos goles marcó Di María en Mundiales (hasta 2022)?', '5', ['3', '7', '4'], 'hard', 'goleadores'),
  q('gol-101', '¿El gol de Di María en la final 2022 fue asistido por…?', 'Messi', ['Álvarez', 'Mac Allister', 'Molina'], 'easy', 'goles-finales', 2022),
  q('gol-102', '¿Cuántos penales convirtió Messi en la tanda final 2022?', '1 (el primero)', ['2', 'Ninguno', 'El último'], 'medium', 'goles-finales', 2022),

  // --- Totales por edición ---
  q('gol-103', '¿Qué Mundial tuvo más goles totales hasta 2018?', 'Francia 1998 y Brasil 2014 (171)', ['Sudáfrica 2010', 'Rusia 2018', 'Alemania 2006'], 'hard', 'goles-records'),
  q('gol-104', '¿Cuántos goles hubo en Rusia 2018?', '169', ['171', '160', '172'], 'hard', 'goles-records', 2018),
  q('gol-105', '¿Cuántos goles hubo en Brasil 2014?', '171', ['169', '172', '160'], 'hard', 'goles-records', 2014),
  q('gol-106', '¿Cuántos goles hubo en Sudáfrica 2010?', '145', ['171', '160', '130'], 'hard', 'goles-records', 2010),
  q('gol-107', '¿Cuántos goles hubo en Alemania 2006?', '147', ['171', '160', '130'], 'hard', 'goles-records', 2006),
  q('gol-108', '¿El Mundial 1990 fue famoso por tener pocos goles: ¿cuántos en total?', '115', ['145', '171', '130'], 'hard', 'goles-records', 1990),

  // --- Más minutos y finales ---
  q('gol-109', '¿Petit marcó el 3-0 de Francia en la final 1998 al minuto…?', '90+3', ['85', '105', '75'], 'hard', 'goles-minutos', 1998),
  q('gol-110', '¿Breitner descontó para Alemania en la final 1986 al minuto…?', '74', ['90', '60', '85'], 'hard', 'goles-minutos', 1986),
  q('gol-111', '¿Burruchaga marcó el 3-2 definitivo de Argentina en 1986 al minuto…?', '84', ['90', '74', '70'], 'hard', 'goles-minutos', 1986),
  q('gol-112', '¿Rahn marcó el gol de Alemania en la “Final del Milagro” 1954 al minuto…?', '84', ['90', '70', '60'], 'hard', 'goles-minutos', 1954),
  q('gol-113', '¿Carlos Alberto cerró el 4-1 de Brasil vs Italia 1970 al minuto…?', '86', ['90', '70', '80'], 'hard', 'goles-minutos', 1970),

  // --- Goleadores 2018 ---
  q('gol-114', '¿Cuántos goles marcó Harry Kane en Rusia 2018?', '6', ['5', '7', '4'], 'medium', 'goleadores', 2018),
  q('gol-115', '¿Cuántos goles marcó Romelu Lukaku en Rusia 2018?', '4', ['6', '3', '5'], 'hard', 'goleadores', 2018),
  q('gol-116', '¿Cuántos goles marcó Antoine Griezmann en Rusia 2018?', '4', ['6', '3', '5'], 'hard', 'goleadores', 2018),
  q('gol-117', '¿Cuántos goles marcó Cristiano Ronaldo en Rusia 2018?', '4', ['3', '5', '6'], 'medium', 'goleadores', 2018),
  q('gol-118', '¿Ronaldo marcó hat-trick vs España en 2018 en el minuto…?', 'Varios (44, 55 pen y 88)', ['Solo uno', 'Primer tiempo únicamente', 'Alargue'], 'hard', 'goles-minutos', 2018),

  // --- Goleadores 2014 ---
  q('gol-119', '¿Cuántos goles marcó Thomas Müller en Brasil 2014?', '5', ['6', '4', '7'], 'medium', 'goleadores', 2014),
  q('gol-120', '¿Cuántos goles marcó Neymar en Brasil 2014?', '4', ['6', '3', '5'], 'medium', 'goleadores', 2014),
  q('gol-121', '¿Cuántos goles marcó Lionel Messi en Brasil 2014?', '4', ['5', '3', '6'], 'medium', 'goleadores', 2014),
  q('gol-122', '¿Robin van Persie marcó el “gol volador” vs España 2014 al minuto…?', '44', ['30', '60', '70'], 'hard', 'goles-minutos', 2014),

  // --- Plot / prode goles ---
  q('gol-123', '¿En Plot Mundial, un marcador exacto en prode vale…?', '3 puntos', ['1 punto', '5 puntos', '2 puntos'], 'easy', 'goles-plot'),
  q('gol-124', '¿En Plot Mundial, acertar solo el ganador o empate vale…?', '1 punto', ['3 puntos', '2 puntos', '0 puntos'], 'easy', 'goles-plot'),
  q('gol-125', '¿Cuántos goles máximo puede tener un partido en el prode de Plot?', 'Sin límite numérico (marcador libre)', ['5 por equipo', '3 por equipo', '10 total'], 'easy', 'goles-plot'),

  // --- Extra variedad ---
  q('gol-126', '¿Quién marcó el primer gol de Uruguay en el Maracanazo 1950?', 'Juan Schiaffino', ['Alcides Ghiggia', 'Ademir', 'Friaca'], 'hard', 'goles-finales', 1950),
  q('gol-127', '¿Ghiggia marcó el 2-1 de Uruguay en el Maracanazo al minuto…?', '79', ['90', '70', '85'], 'hard', 'goles-minutos', 1950),
  q('gol-128', '¿Cuántos goles marcó Pelé en el Mundial 1958 siendo adolescente?', '6', ['4', '8', '5'], 'medium', 'goleadores', 1958),
  q('gol-129', '¿Cuántos goles marcó Pelé en el Mundial 1970?', '4', ['6', '3', '5'], 'hard', 'goleadores', 1970),
  q('gol-130', '¿Cuántos goles marcó Vavá en finales de Mundial?', '3', ['2', '4', '5'], 'hard', 'goles-records'),
  q('gol-131', '¿Cuántos goles marcó Geoff Hurst en el Mundial 1966?', '6', ['5', '7', '4'], 'hard', 'goleadores', 1966),
  q('gol-132', '¿Roger Milla marcó en el Mundial 1990 siendo…?', 'El jugador más veterano en marcar (38 años)', ['El más joven', 'Capitán de Camerún', 'Arquero'], 'medium', 'goleadores', 1990),
  q('gol-133', '¿Cuántos goles marcó Roger Milla en Italia 1990?', '4', ['3', '5', '2'], 'hard', 'goleadores', 1990),
  q('gol-134', '¿Cuántos goles marcó Milla en el Mundial 1994 a los 42 años?', '1', ['2', '3', '0'], 'hard', 'goleadores', 1994),
  q('gol-135', '¿El arquero José Luis Chilavert marcó un gol de…?', 'Tiro libre en eliminatorias (no en Mundial)', ['Penal en Mundial', 'Cabeza en Mundial', 'Corner en Mundial'], 'hard', 'goles-records'),
  q('gol-136', '¿Cuántos goles marcó Hristo Stoichkov en USA 94?', '6', ['5', '4', '7'], 'hard', 'goleadores', 1994),
  q('gol-137', '¿Cuántos goles marcó Bebeto en el Mundial 1994?', '3', ['5', '2', '4'], 'hard', 'goleadores', 1994),
  q('gol-138', '¿Cuántos goles marcó Klinsmann en el Mundial 1990?', '3', ['5', '2', '4'], 'hard', 'goleadores', 1990),
  q('gol-139', '¿Cuántos goles marcó Lothar Matthäus en el Mundial 1990?', '4', ['3', '5', '2'], 'hard', 'goleadores', 1990),
  q('gol-140', '¿Cuántos goles marcó Michel Platini en el Mundial 1982?', '2', ['4', '6', '0'], 'hard', 'goleadores', 1982),
]
