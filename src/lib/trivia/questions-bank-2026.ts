import type { TriviaQuestionSeed } from './constants'

function q(
  id: string,
  question: string,
  correct: string,
  wrong: [string, string, string],
  difficulty: 'easy' | 'medium' | 'hard',
  category: string,
): TriviaQuestionSeed {
  const options = [correct, wrong[0], wrong[1], wrong[2]] as [string, string, string, string]
  return { id, question, options, correctIndex: 0, difficulty, category, worldCupYear: 2026 }
}

/** Preguntas originales del Mundial 2026: sedes, grupos, formato, calendario y selecciones. */
export const TRIVIA_QUESTIONS_2026: TriviaQuestionSeed[] = [
  // --- Formato y calendario ---
  q('wc26-001', '¿Cuántos equipos clasifican de cada grupo a la fase eliminatoria en 2026?', '2', ['3', '1', '4'], 'medium', 'mundial-2026-formato'),
  q('wc26-002', '¿Cuántos mejores terceros avanzan al cuadro de 32 en 2026?', '8', ['4', '12', '6'], 'hard', 'mundial-2026-formato'),
  q('wc26-003', '¿Cuántas selecciones disputan los 16avos de final en 2026?', '32', ['24', '48', '16'], 'medium', 'mundial-2026-formato'),
  q('wc26-004', '¿En qué mes comienza la fase de grupos del Mundial 2026?', 'Junio', ['Mayo', 'Julio', 'Agosto'], 'easy', 'mundial-2026-calendario'),
  q('wc26-005', '¿En qué mes se juega la final del Mundial 2026?', 'Julio', ['Junio', 'Agosto', 'Mayo'], 'easy', 'mundial-2026-calendario'),
  q('wc26-006', '¿Cuántos partidos de fase de grupos hay en el Mundial 2026?', '72', ['48', '96', '60'], 'hard', 'mundial-2026-formato'),
  q('wc26-007', '¿Cuántos partidos eliminatorios hay en el Mundial 2026 (sin contar el 3.er puesto)?', '31', ['32', '30', '28'], 'hard', 'mundial-2026-formato'),
  q('wc26-008', '¿El Mundial 2026 será el primero con sede en tres países de…?', 'CONCACAF', ['CONMEBOL', 'UEFA', 'CAF'], 'medium', 'mundial-2026-formato'),
  q('wc26-009', '¿Cuántos partidos jugará el campeón del Mundial 2026 si llega a la final?', '7', ['8', '6', '9'], 'medium', 'mundial-2026-formato'),
  q('wc26-010', '¿La fase de grupos del 2026 tiene cuántos partidos por selección?', '3', ['4', '2', '5'], 'easy', 'mundial-2026-formato'),

  // --- Sedes USA ---
  q('wc26-011', '¿En qué ciudad está el MetLife Stadium, sede de la final 2026?', 'East Rutherford (NY/NJ)', ['Los Ángeles', 'Miami', 'Dallas'], 'medium', 'mundial-2026-sedes'),
  q('wc26-012', '¿Qué estadio de Plot Mundial en LA alberga partidos del Grupo D?', 'Estadio Los Ángeles', ['Rose Bowl', 'SoFi Stadium', 'Stanford Stadium'], 'medium', 'mundial-2026-sedes'),
  q('wc26-013', '¿Qué sede de 2026 está en Seattle?', 'Estadio Seattle', ['Estadio Portland', 'Estadio Denver', 'Estadio Chicago'], 'easy', 'mundial-2026-sedes'),
  q('wc26-014', '¿Qué sede de 2026 está en Miami?', 'Estadio Miami', ['Estadio Orlando', 'Estadio Tampa', 'Estadio Jacksonville'], 'easy', 'mundial-2026-sedes'),
  q('wc26-015', '¿Qué sede de 2026 está en Atlanta?', 'Estadio Atlanta', ['Estadio Nashville', 'Estadio Charlotte', 'Estadio New Orleans'], 'easy', 'mundial-2026-sedes'),
  q('wc26-016', '¿Qué sede de 2026 está en Dallas?', 'Estadio Dallas', ['Estadio Houston', 'Estadio San Antonio', 'Estadio Austin'], 'easy', 'mundial-2026-sedes'),
  q('wc26-017', '¿Qué sede de 2026 está en Houston?', 'Estadio Houston', ['Estadio Dallas', 'Estadio Kansas City', 'Estadio Phoenix'], 'easy', 'mundial-2026-sedes'),
  q('wc26-018', '¿Qué sede de 2026 está en Filadelfia?', 'Estadio Filadelfia', ['Estadio Baltimore', 'Estadio Washington', 'Estadio Pittsburgh'], 'medium', 'mundial-2026-sedes'),
  q('wc26-019', '¿Qué sede de 2026 está en Kansas City?', 'Estadio Kansas City', ['Estadio Chicago', 'Estadio Denver', 'Estadio Minneapolis'], 'medium', 'mundial-2026-sedes'),
  q('wc26-020', '¿Qué sede de 2026 está en Boston?', 'Estadio Boston', ['Estadio Nueva York', 'Estadio Montreal', 'Estadio Detroit'], 'medium', 'mundial-2026-sedes'),
  q('wc26-021', '¿Qué sede de 2026 está en la Bahía de San Francisco?', 'Estadio Bahía de San Francisco', ['Estadio Sacramento', 'Estadio San Diego', 'Estadio Las Vegas'], 'medium', 'mundial-2026-sedes'),
  q('wc26-022', '¿Cuántas sedes en Estados Unidos tendrá el Mundial 2026?', '11', ['8', '14', '9'], 'hard', 'mundial-2026-sedes'),
  q('wc26-023', '¿Cuántas sedes en México tendrá el Mundial 2026?', '3', ['2', '4', '5'], 'medium', 'mundial-2026-sedes'),
  q('wc26-024', '¿Cuántas sedes en Canadá tendrá el Mundial 2026?', '2', ['3', '1', '4'], 'medium', 'mundial-2026-sedes'),

  // --- Sedes México y Canadá ---
  q('wc26-025', '¿Qué estadio mexicano abre el torneo con México vs Sudáfrica?', 'Estadio Ciudad de México', ['Estadio Guadalajara', 'Estadio Monterrey', 'Estadio Azteca histórico solo'], 'easy', 'mundial-2026-sedes'),
  q('wc26-026', '¿Qué otra ciudad mexicana es sede además de Ciudad de México?', 'Guadalajara y Monterrey', ['Tijuana y Puebla', 'Cancún y León', 'Querétaro y Mérida'], 'medium', 'mundial-2026-sedes'),
  q('wc26-027', '¿Qué estadio canadiense está en Vancouver?', 'Estadio BC Place Vancouver', ['Estadio BMO Field', 'Estadio Olympic', 'Estadio Rogers Centre'], 'medium', 'mundial-2026-sedes'),
  q('wc26-028', '¿Qué estadio canadiense está en Toronto?', 'Estadio Toronto', ['Estadio Montreal', 'Estadio Calgary', 'Estadio Ottawa'], 'medium', 'mundial-2026-sedes'),
  q('wc26-029', '¿Canadá comparte sedes en 2026 con…?', 'Toronto y Vancouver', ['Montreal y Ottawa', 'Calgary y Edmonton', 'Quebec y Winnipeg'], 'easy', 'mundial-2026-sedes'),

  // --- Grupo A ---
  q('wc26-030', '¿Qué selección NO está en el Grupo A de 2026?', 'Brasil', ['México', 'Sudáfrica', 'Rep. de Corea'], 'easy', 'mundial-2026-grupos'),
  q('wc26-031', '¿Rep. Checa comparte grupo en 2026 con México y…?', 'Sudáfrica y Corea del Sur', ['Canadá y Suiza', 'Estados Unidos y Paraguay', 'España y Uruguay'], 'medium', 'mundial-2026-grupos'),
  q('wc26-032', '¿Sudáfrica vuelve al Mundial en 2026 en el grupo de…?', 'México', ['Brasil', 'Francia', 'Alemania'], 'easy', 'mundial-2026-grupos'),

  // --- Grupo B ---
  q('wc26-033', '¿Canadá comparte Grupo B con Catar, Suiza y…?', 'Bosnia y Herzegovina', ['Turquía', 'Ghana', 'Japón'], 'medium', 'mundial-2026-grupos'),
  q('wc26-034', '¿Catar clasificó al Mundial 2026 en el grupo…?', 'B', ['A', 'H', 'K'], 'hard', 'mundial-2026-grupos'),
  q('wc26-035', '¿Qué europeo está en el Grupo B junto a Canadá?', 'Suiza', ['Suecia', 'Polonia', 'Serbia'], 'medium', 'mundial-2026-grupos'),

  // --- Grupo C ---
  q('wc26-036', '¿Haití comparte grupo en 2026 con Brasil, Marruecos y…?', 'Escocia', ['Chile', 'Perú', 'Costa Rica'], 'medium', 'mundial-2026-grupos'),
  q('wc26-037', '¿Escocia juega el Mundial 2026 en el grupo de…?', 'Brasil', ['Inglaterra', 'Alemania', 'España'], 'medium', 'mundial-2026-grupos'),
  q('wc26-038', '¿Marruecos repite grupo con Brasil en 2026 tras ser semifinalista en…?', '2022', ['2018', '2014', '2010'], 'medium', 'mundial-2026-grupos'),

  // --- Grupo D ---
  q('wc26-039', '¿Estados Unidos comparte Grupo D con Paraguay, Australia y…?', 'Turquía', ['México', 'Canadá', 'Colombia'], 'easy', 'mundial-2026-grupos'),
  q('wc26-040', '¿Paraguay está en el Grupo D junto al anfitrión…?', 'Estados Unidos', ['México', 'Canadá', 'Brasil'], 'medium', 'mundial-2026-grupos'),
  q('wc26-041', '¿Australia juega en 2026 el grupo del anfitrión…?', 'Estados Unidos', ['Inglaterra', 'Francia', 'Alemania'], 'medium', 'mundial-2026-grupos'),

  // --- Grupo E ---
  q('wc26-042', '¿Curazao debuta en Mundiales en el Grupo E con Alemania y…?', 'Costa de Marfil y Ecuador', ['Francia y Senegal', 'España y Uruguay', 'Portugal y Colombia'], 'hard', 'mundial-2026-grupos'),
  q('wc26-043', '¿Ecuador comparte grupo en 2026 con Alemania y…?', 'Curazao y Costa de Marfil', ['Japón y Países Bajos', 'México y Sudáfrica', 'Ghana e Inglaterra'], 'medium', 'mundial-2026-grupos'),
  q('wc26-044', '¿Alemania encabeza el Grupo…?', 'E', ['D', 'G', 'I'], 'easy', 'mundial-2026-grupos'),

  // --- Grupo F ---
  q('wc26-045', '¿Países Bajos comparte Grupo F con Japón, Suecia y…?', 'Túnez', ['Senegal', 'Marruecos', 'Ghana'], 'medium', 'mundial-2026-grupos'),
  q('wc26-046', '¿Japón está en el Grupo F con Países Bajos y…?', 'Suecia y Túnez', ['Corea del Sur y México', 'Irán y Arabia Saudí', 'Qatar y Australia'], 'medium', 'mundial-2026-grupos'),
  q('wc26-047', '¿Suecia clasificó al Mundial 2026 en el grupo…?', 'F', ['B', 'L', 'H'], 'hard', 'mundial-2026-grupos'),

  // --- Grupo G ---
  q('wc26-048', '¿Bélgica encabeza el Grupo G con Egipto, Irán y…?', 'Nueva Zelanda', ['Canadá', 'Ghana', 'Arabia Saudí'], 'medium', 'mundial-2026-grupos'),
  q('wc26-049', '¿Irán comparte grupo en 2026 con Bélgica y…?', 'Egipto y Nueva Zelanda', ['Irak y Noruega', 'Qatar y Jordania', 'Turquía y Australia'], 'medium', 'mundial-2026-grupos'),
  q('wc26-050', '¿Nueva Zelanda vuelve a un Mundial en el grupo de…?', 'Bélgica', ['Argentina', 'Brasil', 'Francia'], 'medium', 'mundial-2026-grupos'),

  // --- Grupo H ---
  q('wc26-051', '¿Uruguay comparte Grupo H con España, Arabia Saudita y…?', 'Cabo Verde', ['Chile', 'Perú', 'Paraguay'], 'medium', 'mundial-2026-grupos'),
  q('wc26-052', '¿Cabo Verde hace su debut mundialista en el grupo de…?', 'España', ['Portugal', 'Francia', 'Brasil'], 'hard', 'mundial-2026-grupos'),
  q('wc26-053', '¿España encabeza el Grupo…?', 'H', ['F', 'J', 'L'], 'easy', 'mundial-2026-grupos'),

  // --- Grupo I ---
  q('wc26-054', '¿Francia comparte Grupo I con Senegal, Irak y…?', 'Noruega', ['Marruecos', 'Camerún', 'Ghana'], 'medium', 'mundial-2026-grupos'),
  q('wc26-055', '¿Noruega está en el grupo de Francia y Senegal en…?', '2026', ['2022', '2018', '2014'], 'medium', 'mundial-2026-grupos'),
  q('wc26-056', '¿Irak comparte grupo en 2026 con Francia y…?', 'Senegal y Noruega', ['Irán y Arabia Saudí', 'Qatar y Jordania', 'Egipto y Túnez'], 'hard', 'mundial-2026-grupos'),

  // --- Grupo J (Argentina) ---
  q('wc26-057', '¿Jordania hace su debut en Mundiales en el Grupo J con…?', 'Argentina y Argelia', ['Brasil y Marruecos', 'Francia y Senegal', 'España y Uruguay'], 'hard', 'mundial-2026-argentina'),
  q('wc26-058', '¿Argelia es rival de Argentina en el debut albiceleste de 2026 en…?', 'Kansas City', ['Dallas', 'Miami', 'Los Ángeles'], 'medium', 'mundial-2026-argentina'),
  q('wc26-059', '¿Argentina juega su segundo partido de grupos 2026 contra…?', 'Austria', ['Jordania', 'Argelia', 'Alemania'], 'medium', 'mundial-2026-argentina'),
  q('wc26-060', '¿El tercer partido de Argentina en 2026 es contra…?', 'Jordania', ['Argelia', 'Austria', 'Marruecos'], 'medium', 'mundial-2026-argentina'),
  q('wc26-061', '¿Argentina cierra la fase de grupos 2026 en el estadio de…?', 'Dallas (AT&T Stadium)', ['Kansas City', 'Miami', 'Nueva York'], 'medium', 'mundial-2026-argentina'),
  q('wc26-062', '¿Austria comparte grupo con la campeona defensora…?', 'Argentina', ['Francia', 'España', 'Alemania'], 'easy', 'mundial-2026-argentina'),
  q('wc26-063', '¿Cuántos rivales europeos tiene Argentina en el Grupo J?', '1 (Austria)', ['2', 'Ninguno', '3'], 'medium', 'mundial-2026-argentina'),
  q('wc26-064', '¿Cuántos rivales africanos tiene Argentina en el Grupo J?', '1 (Argelia)', ['2', 'Ninguno', '3'], 'medium', 'mundial-2026-argentina'),
  q('wc26-065', '¿Cuántos rivales asiáticos tiene Argentina en el Grupo J?', '1 (Jordania)', ['2', 'Ninguno', '3'], 'medium', 'mundial-2026-argentina'),

  // --- Grupo K ---
  q('wc26-066', '¿Portugal encabeza el Grupo K con Colombia, RD Congo y…?', 'Uzbekistán', ['Brasil', 'Uruguay', 'Chile'], 'medium', 'mundial-2026-grupos'),
  q('wc26-067', '¿Uzbekistán haría su primer Mundial en el grupo de…?', 'Portugal', ['España', 'Francia', 'Alemania'], 'hard', 'mundial-2026-grupos'),
  q('wc26-068', '¿Colombia comparte grupo en 2026 con Portugal y…?', 'RD Congo y Uzbekistán', ['Brasil y Uruguay', 'México y EE.UU.', 'Ghana e Inglaterra'], 'medium', 'mundial-2026-grupos'),

  // --- Grupo L ---
  q('wc26-069', '¿Inglaterra encabeza el Grupo L con Croacia, Ghana y…?', 'Panamá', ['Gales', 'Serbia', 'Costa Rica'], 'medium', 'mundial-2026-grupos'),
  q('wc26-070', '¿Croacia repite en 2026 el grupo de…?', 'Inglaterra', ['Alemania', 'España', 'Francia'], 'medium', 'mundial-2026-grupos'),
  q('wc26-071', '¿Panamá comparte grupo en 2026 con Inglaterra y…?', 'Croacia y Ghana', ['Estados Unidos y México', 'Brasil y Argentina', 'Japón y Corea del Sur'], 'medium', 'mundial-2026-grupos'),
  q('wc26-072', '¿Ghana está en el Grupo L con Inglaterra y…?', 'Croacia y Panamá', ['Senegal y Marruecos', 'Nigeria y Camerún', 'Estados Unidos y México'], 'medium', 'mundial-2026-grupos'),

  // --- Campeón defensor y favoritos ---
  q('wc26-073', '¿Quién es campeón defensor en el Mundial 2026?', 'Argentina', ['Francia', 'Brasil', 'Alemania'], 'easy', 'mundial-2026-favoritos'),
  q('wc26-074', '¿Francia es la campeona defensora del Mundial 2026?', 'No — lo es Argentina', ['Sí', 'Comparte el título con Brasil', 'Ganó Qatar 2022'], 'medium', 'mundial-2026-favoritos'),
  q('wc26-075', '¿Brasil busca su sexto título en el Mundial…?', '2026', ['2022', '2030', '2018'], 'easy', 'mundial-2026-favoritos'),
  q('wc26-076', '¿Inglaterra busca su segundo título en…?', '2026', ['2022', '2018', 'Nunca ganó más de uno'], 'medium', 'mundial-2026-favoritos'),
  q('wc26-077', '¿España intentará repetir la gesta de 2010 en…?', '2026', ['2022', '2018', '2014'], 'medium', 'mundial-2026-favoritos'),

  // --- Eliminatorias y fases ---
  q('wc26-078', '¿Cómo se llama la primera ronda eliminatoria en el fixture Plot Mundial 2026?', '16avos de final', ['Octavos', 'Dieciseisavos', '32avos'], 'easy', 'mundial-2026-formato'),
  q('wc26-079', '¿Cuántos partidos de 16avos hay en el Mundial 2026?', '16', ['8', '32', '12'], 'medium', 'mundial-2026-formato'),
  q('wc26-080', '¿Cuántos partidos de octavos (8vos) hay en el Mundial 2026?', '8', ['16', '4', '12'], 'medium', 'mundial-2026-formato'),
  q('wc26-081', '¿Cuántos partidos de cuartos hay en el Mundial 2026?', '4', ['8', '2', '6'], 'easy', 'mundial-2026-formato'),
  q('wc26-082', '¿Cuántas semifinales hay en el Mundial 2026?', '2', ['4', '1', '3'], 'easy', 'mundial-2026-formato'),
  q('wc26-083', '¿Se juega partido por el tercer puesto en el Mundial 2026?', 'Sí', ['No', 'Solo si hay empate', 'Solo en CONCACAF'], 'easy', 'mundial-2026-formato'),
  q('wc26-084', '¿La final del 2026 se juega en julio de…?', '2026', ['2025', '2027', '2024'], 'easy', 'mundial-2026-calendario'),

  // --- Selecciones debutantes / curiosidades ---
  q('wc26-085', '¿Qué selección caribeña debuta en el Mundial 2026?', 'Curazao', ['Jamaica', 'Trinidad y Tobago', 'Haití ya debutó antes'], 'hard', 'mundial-2026-curiosidades'),
  q('wc26-086', '¿Haití clasificó al Mundial 2026 en el grupo de Brasil y…?', 'Marruecos y Escocia', ['México y Sudáfrica', 'Francia y Senegal', 'Alemania y Ecuador'], 'medium', 'mundial-2026-curiosidades'),
  q('wc26-087', '¿Bosnia y Herzegovina comparte grupo con anfitrión…?', 'Canadá', ['Estados Unidos', 'México', 'Brasil'], 'medium', 'mundial-2026-curiosidades'),
  q('wc26-088', '¿Qué selección africana debuta en 2026 en el grupo de España?', 'Cabo Verde', ['Senegal', 'Ghana', 'Nigeria'], 'hard', 'mundial-2026-curiosidades'),
  q('wc26-089', '¿Qué selección asiática debuta en 2026 en el grupo de Argentina?', 'Jordania', ['Uzbekistán', 'Irak', 'Qatar'], 'medium', 'mundial-2026-curiosidades'),
  q('wc26-090', '¿Qué selección centroasiática haría su primer Mundial en 2026?', 'Uzbekistán', ['Irán', 'Qatar', 'Jordania'], 'hard', 'mundial-2026-curiosidades'),
  q('wc26-091', '¿Rep. de Corea está en el Grupo A con anfitrión…?', 'México', ['Japón', 'Estados Unidos', 'Canadá'], 'easy', 'mundial-2026-curiosidades'),
  q('wc26-092', '¿Túnez comparte grupo con europeos Países Bajos y…?', 'Suecia', ['Alemania', 'Francia', 'Italia'], 'medium', 'mundial-2026-curiosidades'),

  // --- Partidos icónicos del fixture Plot ---
  q('wc26-093', '¿El primer partido del fixture Plot Mundial 2026 es…?', 'México vs Sudáfrica', ['Estados Unidos vs Paraguay', 'Canadá vs Bosnia', 'Brasil vs Marruecos'], 'easy', 'mundial-2026-calendario'),
  q('wc26-094', '¿Brasil debuta en 2026 contra…?', 'Marruecos', ['Haití', 'Escocia', 'Uruguay'], 'medium', 'mundial-2026-calendario'),
  q('wc26-095', '¿Francia debuta en 2026 contra…?', 'Senegal', ['Irak', 'Noruega', 'Marruecos'], 'medium', 'mundial-2026-calendario'),
  q('wc26-096', '¿Alemania debuta en 2026 contra…?', 'Curazao', ['Ecuador', 'Costa de Marfil', 'Estados Unidos'], 'medium', 'mundial-2026-calendario'),
  q('wc26-097', '¿Inglaterra debuta en 2026 contra…?', 'Croacia', ['Ghana', 'Panamá', 'Escocia'], 'medium', 'mundial-2026-calendario'),
  q('wc26-098', '¿Portugal debuta en 2026 contra…?', 'RD Congo', ['Colombia', 'Uzbekistán', 'Brasil'], 'medium', 'mundial-2026-calendario'),
  q('wc26-099', '¿España debuta en 2026 contra…?', 'Cabo Verde', ['Uruguay', 'Arabia Saudita', 'Chile'], 'medium', 'mundial-2026-calendario'),
  q('wc26-100', '¿Estados Unidos debuta en 2026 contra…?', 'Paraguay', ['México', 'Canadá', 'Colombia'], 'easy', 'mundial-2026-calendario'),

  // --- CONCACAF anfitriones ---
  q('wc26-101', '¿Los tres anfitriones del 2026 clasifican automáticamente como…?', 'Estados Unidos, México y Canadá', ['Solo México', 'México y EE.UU.', 'Los 6 de CONCACAF'], 'easy', 'mundial-2026-formato'),
  q('wc26-102', '¿México juega en casa en el Grupo…?', 'A', ['B', 'D', 'F'], 'easy', 'mundial-2026-grupos'),
  q('wc26-103', '¿Canadá juega en casa en el Grupo…?', 'B', ['A', 'D', 'H'], 'easy', 'mundial-2026-grupos'),
  q('wc26-104', '¿Estados Unidos juega como local en el Grupo…?', 'D', ['A', 'B', 'L'], 'easy', 'mundial-2026-grupos'),

  // --- Más sedes y partidos ---
  q('wc26-105', '¿El Estadio Nueva York Nueva Jersey alberga partidos de 2026 en…?', 'Estados Unidos', ['Canadá', 'México', 'Ningún partido'], 'medium', 'mundial-2026-sedes'),
  q('wc26-106', '¿El Estadio Guadalajara es sede en…?', 'México', ['Estados Unidos', 'Canadá', 'Guatemala'], 'easy', 'mundial-2026-sedes'),
  q('wc26-107', '¿El Estadio Monterrey es sede en…?', 'México', ['Estados Unidos', 'Canadá', 'Colombia'], 'easy', 'mundial-2026-sedes'),
  q('wc26-108', '¿Cuántos grupos tiene letra de la A a la…?', 'L', ['K', 'M', 'J'], 'easy', 'mundial-2026-formato'),
  q('wc26-109', '¿Cuántas confederaciones están representadas en el Mundial 2026?', '6', ['5', '7', '4'], 'hard', 'mundial-2026-formato'),
  q('wc26-110', '¿El Mundial 2026 duplica respecto a 2022 la cantidad de…?', 'Equipos (32 → 48)', ['Partidos por equipo', 'Sedes', 'Grupos de 3'], 'medium', 'mundial-2026-formato'),

  // --- Situaciones y records del torneo actual ---
  q('wc26-111', '¿Qué selección europea está en el grupo de Brasil en 2026?', 'Escocia', ['Croacia', 'Suiza', 'Serbia'], 'medium', 'mundial-2026-situaciones'),
  q('wc26-112', '¿Qué selección africana está en el grupo de España en 2026?', 'Cabo Verde', ['Senegal', 'Ghana', 'Marruecos'], 'medium', 'mundial-2026-situaciones'),
  q('wc26-113', '¿Qué selección asiática está en el grupo de Alemania en 2026?', 'Ninguna (grupo sin asiáticos)', ['Japón', 'Irán', 'Qatar'], 'hard', 'mundial-2026-situaciones'),
  q('wc26-114', '¿Qué par de anfitriones NO comparten grupo en 2026?', 'México y Canadá', ['México y EE.UU.', 'Canadá y EE.UU.', 'Todos comparten CONCACAF'], 'medium', 'mundial-2026-situaciones'),
  q('wc26-115', '¿Qué campeón del mundo está en el Grupo J?', 'Argentina', ['Francia', 'Alemania', 'España'], 'easy', 'mundial-2026-situaciones'),
  q('wc26-116', '¿Qué ex campeón está en el Grupo H?', 'España', ['Uruguay', 'Inglaterra', 'Francia'], 'medium', 'mundial-2026-situaciones'),
  q('wc26-117', '¿Qué ex campeón está en el Grupo E?', 'Alemania', ['Brasil', 'Italia', 'Argentina'], 'medium', 'mundial-2026-situaciones'),
  q('wc26-118', '¿Italia clasificó al Mundial 2026?', 'No (según el fixture Plot)', ['Sí, Grupo B', 'Sí, Grupo F', 'Sí, repechaje'], 'medium', 'mundial-2026-situaciones'),
  q('wc26-119', '¿Qué selección sudamericana está en el Grupo H con España?', 'Uruguay', ['Brasil', 'Colombia', 'Chile'], 'easy', 'mundial-2026-situaciones'),
  q('wc26-120', '¿Qué selección sudamericana está en el Grupo K con Portugal?', 'Colombia', ['Uruguay', 'Paraguay', 'Chile'], 'medium', 'mundial-2026-situaciones'),

  // --- Más calendario Argentina ---
  q('wc26-121', '¿Argentina juega en Kansas City en su primer partido de 2026 contra…?', 'Argelia', ['Austria', 'Jordania', 'Marruecos'], 'medium', 'mundial-2026-argentina'),
  q('wc26-122', '¿Argentina vs Austria en 2026 se juega en…?', 'Dallas', ['Kansas City', 'Miami', 'Atlanta'], 'hard', 'mundial-2026-argentina'),
  q('wc26-123', '¿Jordania vs Argentina en 2026 se juega en…?', 'Dallas', ['Kansas City', 'Boston', 'Seattle'], 'hard', 'mundial-2026-argentina'),
  q('wc26-124', '¿Argelia comparte grupo con campeona defensora y…?', 'Austria y Jordania', ['Brasil y Marruecos', 'Francia y Senegal', 'España y Uruguay'], 'easy', 'mundial-2026-argentina'),

  // --- Eliminatorias detalle ---
  q('wc26-125', '¿Los 16avos de final del 2026 comienzan tras la fase de…?', 'Grupos', ['Repechaje', 'Naciones League', 'Copa Oro'], 'easy', 'mundial-2026-formato'),
  q('wc26-126', '¿Cuántos equipos quedan eliminados en fase de grupos en 2026?', '16', ['24', '8', '32'], 'hard', 'mundial-2026-formato'),
  q('wc26-127', '¿El cuadro eliminatorio de 2026 arranca con…?', '32 equipos', ['48 equipos', '16 equipos', '24 equipos'], 'medium', 'mundial-2026-formato'),
  q('wc26-128', '¿La ronda de 8vos en el fixture Plot se llama…?', 'Octavos de final', ['Cuartos', '16avos', 'Semifinal'], 'easy', 'mundial-2026-formato'),

  // --- Preguntas de sedes vs partidos ---
  q('wc26-129', '¿Qué sede alberga partidos de Argentina en fase de grupos?', 'Kansas City y Dallas', ['Solo Miami', 'Los Ángeles y Seattle', 'Nueva York y Boston'], 'hard', 'mundial-2026-sedes'),
  q('wc26-130', '¿Qué sede mexicana recibe partidos del Grupo A además de Ciudad de México?', 'Guadalajara', ['Monterrey solamente', 'Tijuana', 'Cancún'], 'medium', 'mundial-2026-sedes'),
  q('wc26-131', '¿Brasil puede jugar partidos de grupos en…?', 'Nueva York, Boston o Filadelfia', ['Solo México', 'Solo Canadá', 'Solo Los Ángeles'], 'hard', 'mundial-2026-sedes'),
  q('wc26-132', '¿El Grupo B tiene partidos programados en…?', 'Toronto y Vancouver', ['Solo México', 'Solo Miami', 'Solo Dallas'], 'medium', 'mundial-2026-sedes'),

  // --- Equipos y contexto ---
  q('wc26-133', '¿RD Congo comparte grupo con Portugal y Colombia en…?', '2026', ['2022', '2018', '2014'], 'medium', 'mundial-2026-grupos'),
  q('wc26-134', '¿Arabia Saudita comparte grupo en 2026 con España y…?', 'Cabo Verde y Uruguay', ['Francia y Senegal', 'Alemania y Ecuador', 'Brasil y Marruecos'], 'medium', 'mundial-2026-grupos'),
  q('wc26-135', '¿Senegal comparte grupo en 2026 con…?', 'Francia', ['Marruecos', 'Ghana', 'Camerún'], 'easy', 'mundial-2026-grupos'),
  q('wc26-136', '¿Egipto comparte grupo con Bélgica e Irán en…?', '2026', ['2022', '2018', 'Nunca'], 'medium', 'mundial-2026-grupos'),
  q('wc26-137', '¿Costa de Marfil está en el grupo de Alemania en…?', '2026', ['2022', '2018', '2014'], 'medium', 'mundial-2026-grupos'),
  q('wc26-138', '¿Paraguay está en el grupo del anfitrión estadounidense en…?', '2026', ['2022', '2010', '2014'], 'easy', 'mundial-2026-grupos'),
  q('wc26-139', '¿Turquía está en el Grupo D con…?', 'Estados Unidos y Paraguay', ['México y Canadá', 'Brasil y Marruecos', 'Francia y Senegal'], 'medium', 'mundial-2026-grupos'),
  q('wc26-140', '¿Suiza está en el Grupo B con anfitrión…?', 'Canadá', ['México', 'Estados Unidos', 'Brasil'], 'medium', 'mundial-2026-grupos'),

  // --- Plot Mundial / prode ---
  q('wc26-141', '¿Cuántos partidos podés pronosticar en Plot Mundial 2026?', '104', ['72', '96', '48'], 'easy', 'mundial-2026-plot'),
  q('wc26-142', '¿Plot Mundial replica el fixture oficial FIFA…?', '2026', ['2022', '2030', '2018'], 'easy', 'mundial-2026-plot'),
  q('wc26-143', '¿Los puntos de trivia en Plot van…?', 'Aparte del prode del fixture', ['Se suman al mismo ranking', 'Solo en ligas', 'Solo en store'], 'easy', 'mundial-2026-plot'),
  q('wc26-144', '¿La llave eliminatoria en Plot Mundial incluye hasta la…?', 'Final', ['Solo octavos', 'Solo cuartos', 'Solo semifinales'], 'easy', 'mundial-2026-plot'),

  // --- Más preguntas variadas ---
  q('wc26-145', '¿Qué grupo tiene a tres confederaciones distintas en el Grupo J?', 'Grupo J (UEFA, CAF, AFC + CONMEBOL)', ['Grupo A', 'Grupo B', 'Grupo C'], 'hard', 'mundial-2026-grupos'),
  q('wc26-146', '¿Qué grupo NO tiene selección sudamericana?', 'Grupo B', ['Grupo D', 'Grupo H', 'Grupo K'], 'hard', 'mundial-2026-grupos'),
  q('wc26-147', '¿Qué grupo tiene a Escocia y Haití?', 'Grupo C', ['Grupo L', 'Grupo F', 'Grupo G'], 'medium', 'mundial-2026-grupos'),
  q('wc26-148', '¿Qué grupo tiene a Qatar y Bosnia?', 'Grupo B', ['Grupo A', 'Grupo I', 'Grupo G'], 'medium', 'mundial-2026-grupos'),
  q('wc26-149', '¿Qué grupo tiene a Curazao y Costa de Marfil?', 'Grupo E', ['Grupo G', 'Grupo I', 'Grupo K'], 'medium', 'mundial-2026-grupos'),
  q('wc26-150', '¿Qué grupo tiene a Uzbekistán y RD Congo?', 'Grupo K', ['Grupo E', 'Grupo I', 'Grupo G'], 'medium', 'mundial-2026-grupos'),

  // --- Fechas clave ---
  q('wc26-151', '¿La fase de grupos del 2026 termina a fines de…?', 'Junio', ['Mayo', 'Julio', 'Agosto'], 'medium', 'mundial-2026-calendario'),
  q('wc26-152', '¿Los 16avos de final del 2026 se juegan a partir de…?', 'Finales de junio', ['Mediados de junio', 'Principios de julio solamente', 'Mayo'], 'hard', 'mundial-2026-calendario'),
  q('wc26-153', '¿Las semifinales del 2026 están programadas para…?', 'Mediados de julio', ['Principios de junio', 'Finales de mayo', 'Agosto'], 'hard', 'mundial-2026-calendario'),
  q('wc26-154', '¿El partido por el tercer puesto del 2026 es en…?', 'Julio', ['Junio', 'Agosto', 'Mayo'], 'medium', 'mundial-2026-calendario'),

  // --- Último lote: sedes y selecciones ---
  q('wc26-155', '¿Marruecos puede jugar en Filadelfia o Nueva York en el grupo de…?', 'Brasil', ['Francia', 'España', 'Alemania'], 'hard', 'mundial-2026-sedes'),
  q('wc26-156', '¿Uruguay puede jugar en Miami o Atlanta en el grupo de…?', 'España', ['Brasil', 'Argentina', 'Portugal'], 'hard', 'mundial-2026-sedes'),
  q('wc26-157', '¿Ghana e Inglaterra se cruzan en fase de grupos en…?', '2026', ['2022', '2010', '2014'], 'medium', 'mundial-2026-situaciones'),
  q('wc26-158', '¿Croacia e Inglaterra se cruzan en fase de grupos en…?', '2026', ['2018 semifinal', '2022', '2014'], 'medium', 'mundial-2026-situaciones'),
  q('wc26-159', '¿Colombia y Portugal se cruzan en fase de grupos en…?', '2026', ['2014', '2022', '2018'], 'medium', 'mundial-2026-situaciones'),
  q('wc26-160', '¿Ecuador y Alemania se cruzan en fase de grupos en…?', '2026', ['2022', '2014', '2018'], 'medium', 'mundial-2026-situaciones'),
  q('wc26-161', '¿Noruega e Irak comparten grupo con…?', 'Francia y Senegal', ['Alemania y Ecuador', 'España y Uruguay', 'Brasil y Marruecos'], 'medium', 'mundial-2026-grupos'),
  q('wc26-162', '¿Panamá clasificó al 2026 en el grupo de…?', 'Inglaterra', ['Estados Unidos', 'México', 'Brasil'], 'medium', 'mundial-2026-grupos'),
  q('wc26-163', '¿Rep. Checa está en el grupo del anfitrión…?', 'México', ['Canadá', 'Estados Unidos', 'Alemania'], 'medium', 'mundial-2026-grupos'),
  q('wc26-164', '¿Corea del Sur está en el grupo de…?', 'México', ['Japón', 'Estados Unidos', 'Australia'], 'medium', 'mundial-2026-grupos'),
  q('wc26-165', '¿Nueva Zelanda está en el grupo de…?', 'Bélgica', ['Australia', 'Japón', 'Estados Unidos'], 'medium', 'mundial-2026-grupos'),
  q('wc26-166', '¿Túnez está en el grupo de…?', 'Países Bajos', ['Francia', 'Alemania', 'España'], 'medium', 'mundial-2026-grupos'),
  q('wc26-167', '¿Suecia está en el grupo de…?', 'Países Bajos', ['Inglaterra', 'Alemania', 'Bélgica'], 'medium', 'mundial-2026-grupos'),
  q('wc26-168', '¿Egipto está en el grupo de…?', 'Bélgica', ['Senegal', 'Marruecos', 'Francia'], 'medium', 'mundial-2026-grupos'),
  q('wc26-169', '¿Irán está en el grupo de…?', 'Bélgica', ['Irak', 'Qatar', 'Arabia Saudita'], 'medium', 'mundial-2026-grupos'),
  q('wc26-170', '¿Arabia Saudita está en el grupo de…?', 'España', ['Irán', 'Qatar', 'Francia'], 'medium', 'mundial-2026-grupos'),

  // --- Formato avanzado ---
  q('wc26-171', '¿En 2026 avanzan 32 de 48 equipos a eliminatorias directas: eso es el…?', '66,7% aprox. del total', ['50%', '75%', '40%'], 'hard', 'mundial-2026-formato'),
  q('wc26-172', '¿Cada grupo de 2026 tiene exactamente…?', '4 selecciones', ['3 selecciones', '5 selecciones', '6 selecciones'], 'easy', 'mundial-2026-formato'),
  q('wc26-173', '¿El Mundial 2026 tendrá más partidos que Qatar 2022 en…?', '40 partidos (64 → 104)', ['20 partidos', '10 partidos', 'Igual cantidad'], 'medium', 'mundial-2026-formato'),
  q('wc26-174', '¿La expansión a 48 equipos fue confirmada por FIFA para el Mundial…?', '2026', ['2022', '2030', '2024'], 'easy', 'mundial-2026-formato'),
  q('wc26-175', '¿El Estadio Ciudad de México en Plot Mundial corresponde al histórico…?', 'Estadio Azteca', ['Estadio Olímpico', 'Estadio Jalisco', 'Estadio BBVA'], 'medium', 'mundial-2026-sedes'),

  // --- Cierre ---
  q('wc26-176', '¿Cuál es el lema de sedes del Mundial 2026 en Plot?', 'USA · México · Canadá', ['Solo EE.UU.', 'América unida', 'North America Cup'], 'easy', 'mundial-2026-curiosidades'),
  q('wc26-177', '¿Qué selección africana está con Francia en el Grupo I?', 'Senegal', ['Camerún', 'Ghana', 'Marruecos'], 'easy', 'mundial-2026-grupos'),
  q('wc26-178', '¿Qué selección europea comparte Grupo H con España en 2026?', 'Ninguna además de España', ['Croacia', 'Portugal', 'Italia'], 'hard', 'mundial-2026-grupos'),
  q('wc26-179', '¿Qué selección NO está en el Grupo J de 2026?', 'Brasil', ['Jordania', 'Argelia', 'Austria'], 'easy', 'mundial-2026-grupos'),
  q('wc26-180', '¿Plot Mundial usa horarios oficiales FIFA del 2026 en zona…?', 'Argentina (ART)', ['UTC solamente', 'Hora de México', 'Hora de Nueva York'], 'medium', 'mundial-2026-plot'),

  // --- Fecha 2 y 3 del fixture Plot ---
  q('wc26-181', '¿En la fecha 2 del 2026, México juega contra Corea del Sur en…?', 'Guadalajara', ['Ciudad de México', 'Monterrey', 'Atlanta'], 'medium', 'mundial-2026-calendario'),
  q('wc26-182', '¿En la fecha 2, Argentina enfrenta a Austria en…?', 'Dallas', ['Kansas City', 'Miami', 'Los Ángeles'], 'medium', 'mundial-2026-calendario'),
  q('wc26-183', '¿En la fecha 2, Brasil juega contra Haití en…?', 'Filadelfia', ['Nueva York', 'Boston', 'Miami'], 'hard', 'mundial-2026-calendario'),
  q('wc26-184', '¿En la fecha 2, Alemania vs Costa de Marfil se juega en…?', 'Toronto', ['Vancouver', 'Montreal', 'Boston'], 'hard', 'mundial-2026-calendario'),
  q('wc26-185', '¿En la fecha 3, Uruguay cierra el grupo contra España en…?', 'Guadalajara', ['Miami', 'Atlanta', 'Houston'], 'hard', 'mundial-2026-calendario'),
  q('wc26-186', '¿En la fecha 3, Colombia vs Portugal es en…?', 'Miami', ['Atlanta', 'Houston', 'Dallas'], 'medium', 'mundial-2026-calendario'),
  q('wc26-187', '¿En la fecha 3, Jordania vs Argentina se juega en…?', 'Dallas', ['Kansas City', 'San Francisco', 'Seattle'], 'medium', 'mundial-2026-calendario'),
  q('wc26-188', '¿En la fecha 3, Turquía vs Estados Unidos es en…?', 'Los Ángeles', ['Seattle', 'Dallas', 'Kansas City'], 'medium', 'mundial-2026-calendario'),
  q('wc26-189', '¿En la fecha 3, Escocia vs Brasil se juega en…?', 'Miami', ['Boston', 'Nueva York', 'Filadelfia'], 'hard', 'mundial-2026-calendario'),
  q('wc26-190', '¿En la fecha 3, Noruega vs Francia se juega en…?', 'Boston', ['Nueva York', 'Toronto', 'Filadelfia'], 'hard', 'mundial-2026-calendario'),
  q('wc26-191', '¿Cuántos partidos de fase de grupos hay por fecha en el 2026?', '24 por fecha (3 jornadas)', ['16 por fecha', '32 por fecha', '12 por fecha'], 'hard', 'mundial-2026-formato'),
  q('wc26-192', '¿La tercera fecha de grupos del 2026 se concentra en…?', '25-28 de junio', ['11-14 de junio', '1-4 de julio', 'Mayo'], 'medium', 'mundial-2026-calendario'),

  // --- Eliminatorias: cruces y sedes ---
  q('wc26-193', '¿El cruce m73 de 16avos enfrenta a…?', '2º Grupo A vs 2º Grupo B', ['1º Grupo A vs 3º', '1º Grupo C vs 2º F', 'Ganador 74 vs 77'], 'hard', 'mundial-2026-eliminatorias'),
  q('wc26-194', '¿El 1º del Grupo J en 16avos podría jugar en…?', 'Miami (m86)', ['Solo Kansas City', 'Toronto', 'Vancouver'], 'hard', 'mundial-2026-eliminatorias'),
  q('wc26-195', '¿El 1º del Grupo A en 16avos juega en Ciudad de México (m79) contra un…?', 'Mejor tercero', ['Segundo de otro grupo', 'Ganador previo', 'Repechaje'], 'medium', 'mundial-2026-eliminatorias'),
  q('wc26-196', '¿Los octavos m90 cruzan ganadores de los partidos…?', '73 y 75', ['74 y 77', '76 y 78', '79 y 80'], 'hard', 'mundial-2026-eliminatorias'),
  q('wc26-197', '¿Los octavos en Houston (m90) son el…?', '4 de julio', ['5 de julio', '3 de julio', '6 de julio'], 'hard', 'mundial-2026-calendario'),
  q('wc26-198', '¿Los cuartos de final en Boston (m97) son el…?', '10 de julio', ['11 de julio', '12 de julio', '9 de julio'], 'hard', 'mundial-2026-calendario'),
  q('wc26-199', '¿Los cuartos en Miami (m99) son el…?', '12 de julio', ['10 de julio', '11 de julio', '15 de julio'], 'hard', 'mundial-2026-calendario'),
  q('wc26-200', '¿Una semifinal del 2026 se juega en Dallas (m101)?', 'Sí', ['No, solo Atlanta', 'No, solo Nueva York', 'No hay semifinales'], 'medium', 'mundial-2026-eliminatorias'),
  q('wc26-201', '¿La otra semifinal del 2026 es en…?', 'Atlanta', ['Dallas', 'Miami', 'Los Ángeles'], 'medium', 'mundial-2026-eliminatorias'),
  q('wc26-202', '¿El partido por el tercer puesto 2026 es en…?', 'Miami', ['Dallas', 'Nueva York', 'Los Ángeles'], 'medium', 'mundial-2026-eliminatorias'),
  q('wc26-203', '¿El tercer puesto enfrenta a los perdedores de…?', 'Semifinales 101 y 102', ['Cuartos 97 y 98', 'Octavos 89 y 90', '16avos 73 y 74'], 'hard', 'mundial-2026-eliminatorias'),
  q('wc26-204', '¿La final del 2026 en Plot Mundial es en…?', 'MetLife Stadium (NY/NJ)', ['Estadio Azteca', 'Hard Rock Miami', 'SoFi Los Ángeles'], 'easy', 'mundial-2026-eliminatorias'),
  q('wc26-205', '¿La final del 2026 enfrenta ganadores de semifinales…?', '101 y 102', ['97 y 98', '103 y 104', '99 y 100'], 'medium', 'mundial-2026-eliminatorias'),
  q('wc26-206', '¿Cuántos partidos de octavos hay en el fixture 2026?', '8', ['16', '4', '12'], 'easy', 'mundial-2026-formato'),
  q('wc26-207', '¿Cuántos partidos de cuartos hay en el fixture 2026?', '4', ['8', '2', '6'], 'easy', 'mundial-2026-formato'),

  // --- Argentina y favoritos 2026 ---
  q('wc26-208', '¿Argentina llega al 2026 como campeona de…?', 'Qatar 2022', ['Rusia 2018', 'Brasil 2014', 'Sudáfrica 2010'], 'easy', 'mundial-2026-argentina'),
  q('wc26-209', '¿Lionel Scaloni sigue como DT de Argentina rumbo al…?', '2026', ['2022 solamente', '2028', '2018'], 'easy', 'mundial-2026-argentina'),
  q('wc26-210', '¿Messi puede sumar goles en su cuarto Mundial consecutivo en…?', '2026', ['Ya no juega', 'Solo amistosos', '2030'], 'medium', 'mundial-2026-argentina'),
  q('wc26-211', '¿Mbappé puede superar sus 8 goles de Qatar en el…?', '2026', ['2022', '2030', '2018'], 'medium', 'mundial-2026-favoritos'),
  q('wc26-212', '¿Francia busca un bicampeonato en el Mundial…?', '2026 (tras ser subcampeona 2022)', ['2022', '2018', '2030'], 'medium', 'mundial-2026-favoritos'),
  q('wc26-213', '¿Inglaterra comparte grupo con ex rival Ghana en…?', '2026', ['2022', '2010', '2014'], 'medium', 'mundial-2026-favoritos'),
  q('wc26-214', '¿Croacia, subcampeona 2018, está en el grupo de Inglaterra en…?', '2026', ['2022', '2014', '2010'], 'medium', 'mundial-2026-favoritos'),

  // --- Selecciones ausentes y presentes ---
  q('wc26-215', '¿Italia clasificó al Mundial 2026 en el fixture Plot?', 'No', ['Sí, Grupo E', 'Sí, repechaje', 'Sí, Grupo B'], 'medium', 'mundial-2026-situaciones'),
  q('wc26-216', '¿Cuántas selecciones sudamericanas hay en el fixture 2026?', '6 (ARG, BRA, URU, COL, PAR, ECU)', ['4', '8', '10'], 'hard', 'mundial-2026-situaciones'),
  q('wc26-217', '¿Chile está en el Mundial 2026 del fixture Plot?', 'No', ['Sí, Grupo C', 'Sí, Grupo H', 'Sí, repechaje'], 'medium', 'mundial-2026-situaciones'),
  q('wc26-218', '¿Perú está en el Mundial 2026 del fixture Plot?', 'No', ['Sí', 'Sí, Grupo K', 'Sí, Grupo D'], 'medium', 'mundial-2026-situaciones'),
  q('wc26-219', '¿Nigeria está en el Mundial 2026 del fixture Plot?', 'No', ['Sí, Grupo I', 'Sí, Grupo L', 'Sí, Grupo G'], 'medium', 'mundial-2026-situaciones'),
  q('wc26-220', '¿Camerún está en el Mundial 2026 del fixture Plot?', 'No', ['Sí', 'Sí, Grupo J', 'Sí, Grupo C'], 'medium', 'mundial-2026-situaciones'),

  // --- Horarios y sede inaugural ---
  q('wc26-221', '¿El inaugural México vs Sudáfrica en Plot se muestra en hora…?', 'Argentina (ART)', ['Solo UTC', 'Hora CDMX', 'Hora EST'], 'easy', 'mundial-2026-calendario'),
  q('wc26-222', '¿El partido m1 (inaugural) se juega en sede…?', 'Mexicana', ['Estadounidense', 'Canadiense', 'Neutral en Miami'], 'easy', 'mundial-2026-sedes'),
  q('wc26-223', '¿El segundo partido del torneo (m2) es Corea vs Chequia en…?', 'Guadalajara', ['Ciudad de México', 'Monterrey', 'Los Ángeles'], 'hard', 'mundial-2026-calendario'),
  q('wc26-224', '¿Canadá debuta en 2026 en Toronto contra…?', 'Bosnia y Herzegovina', ['Suiza', 'Catar', 'Estados Unidos'], 'medium', 'mundial-2026-calendario'),
  q('wc26-225', '¿El primer partido en suelo estadounidense (m4) es…?', 'Estados Unidos vs Paraguay', ['México vs Sudáfrica', 'Canadá vs Bosnia', 'Brasil vs Marruecos'], 'medium', 'mundial-2026-calendario'),

  // --- Grupos detalle extra ---
  q('wc26-226', '¿Qué grupo tiene a dos anfitriones potenciales en la región CONCACAF?', 'Ninguno comparte grupo (Méx A, Can B, USA D)', ['Grupo A', 'Grupo D', 'Grupo B y D juntos'], 'hard', 'mundial-2026-grupos'),
  q('wc26-227', '¿Qué grupo reúne a Portugal y Colombia?', 'Grupo K', ['Grupo H', 'Grupo L', 'Grupo I'], 'easy', 'mundial-2026-grupos'),
  q('wc26-228', '¿Qué grupo reúne a España y Uruguay?', 'Grupo H', ['Grupo J', 'Grupo L', 'Grupo C'], 'easy', 'mundial-2026-grupos'),
  q('wc26-229', '¿Qué grupo reúne a Alemania y Ecuador?', 'Grupo E', ['Grupo F', 'Grupo I', 'Grupo G'], 'easy', 'mundial-2026-grupos'),
  q('wc26-230', '¿Qué grupo reúne a Países Bajos y Japón?', 'Grupo F', ['Grupo G', 'Grupo E', 'Grupo A'], 'easy', 'mundial-2026-grupos'),
  q('wc26-231', '¿Qué grupo tiene a Qatar como campeón defensor de…?', '2022 (Grupo B)', ['2018', '2010', 'No clasificó'], 'medium', 'mundial-2026-grupos'),
  q('wc26-232', '¿Qué grupo tiene más debutantes (Jordania, Cabo Verde, Uzbekistán no están juntos)?', 'Varios repartidos; J en J, CV en H, UZ en K', ['Todos en Grupo A', 'Todos en Grupo J', 'Ningún debutante'], 'hard', 'mundial-2026-grupos'),

  // --- Plot Mundial prode/bracket 2026 ---
  q('wc26-233', '¿En Plot Mundial, acertar un ganador de 16avos en la llave suma…?', '10 puntos', ['5 puntos', '20 puntos', '3 puntos'], 'medium', 'mundial-2026-plot'),
  q('wc26-234', '¿Acertar un octavo en la llave Plot 2026 suma…?', '20 puntos', ['10', '30', '15'], 'hard', 'mundial-2026-plot'),
  q('wc26-235', '¿Acertar un cuarto en la llave Plot 2026 suma…?', '30 puntos', ['20', '40', '25'], 'hard', 'mundial-2026-plot'),
  q('wc26-236', '¿Acertar semifinal en la llave Plot 2026 suma…?', '40 puntos', ['30', '50', '20'], 'hard', 'mundial-2026-plot'),
  q('wc26-237', '¿Acertar al campeón en la llave Plot 2026 suma…?', '50 puntos', ['40', '30', '100'], 'medium', 'mundial-2026-plot'),
  q('wc26-238', '¿Cuántos partidos eliminatorios podés pronosticar en la llave Plot?', '32 (m73 a m104)', ['16', '48', '72'], 'hard', 'mundial-2026-plot'),
  q('wc26-239', '¿El admin de Plot puede definir equipos reales en 16avos desde…?', 'Panel Admin → Resultados', ['Solo SQL', 'No se puede', 'Solo dashboard'], 'medium', 'mundial-2026-plot'),
  q('wc26-240', '¿Los cruces de 16avos en Plot siguen el formato…?', 'FIFA 2026 (48 equipos)', ['Copa América', 'Eurocopa', 'Formato 32 equipos'], 'medium', 'mundial-2026-plot'),

  // --- Sedes por partidos clave ---
  q('wc26-241', '¿Francia vs Senegal (fecha 1) se juega en…?', 'Nueva York / New Jersey', ['Boston', 'Filadelfia', 'Miami'], 'hard', 'mundial-2026-sedes'),
  q('wc26-242', '¿Países Bajos vs Japón (fecha 1) se juega en…?', 'Dallas', ['Houston', 'Kansas City', 'Atlanta'], 'hard', 'mundial-2026-sedes'),
  q('wc26-243', '¿Inglaterra vs Croacia (fecha 1) se juega en…?', 'Dallas', ['Boston', 'Toronto', 'Filadelfia'], 'hard', 'mundial-2026-sedes'),
  q('wc26-244', '¿España vs Cabo Verde (fecha 1) se juega en…?', 'Atlanta', ['Miami', 'Houston', 'Dallas'], 'hard', 'mundial-2026-sedes'),
  q('wc26-245', '¿Bélgica vs Egipto (fecha 1) se juega en…?', 'Seattle', ['Los Ángeles', 'Vancouver', 'San Francisco'], 'hard', 'mundial-2026-sedes'),

  // --- Curiosidades 2026 ---
  q('wc26-246', '¿El Mundial 2026 será el tercero en suelo mexicano tras…?', '1970 y 1986', ['1994', '2010', '1966'], 'medium', 'mundial-2026-curiosidades'),
  q('wc26-247', '¿Estados Unidos organiza su segundo Mundial masculino en…?', '2026 (tras 1994)', ['2010', '2022', '1986'], 'medium', 'mundial-2026-curiosidades'),
  q('wc26-248', '¿Canadá organiza por primera vez un Mundial masculino en…?', '2026', ['1994', '2022', '2010'], 'easy', 'mundial-2026-curiosidades'),
  q('wc26-249', '¿El torneo 2026 dura aproximadamente…?', '5 semanas (jun–jul)', ['2 semanas', '8 semanas', '10 días'], 'easy', 'mundial-2026-calendario'),
  q('wc26-250', '¿Cuántas ciudades sede aproximadamente tiene el 2026?', '16', ['12', '20', '8'], 'easy', 'mundial-2026-sedes'),

  // --- Más eliminatorias ---
  q('wc26-251', '¿El 16avos m86 puede tener al campeón del Grupo J en…?', 'Miami', ['Dallas', 'Kansas City', 'Toronto'], 'medium', 'mundial-2026-eliminatorias'),
  q('wc26-252', '¿El 16avos m88 cruza segundos del grupo…?', 'D y G', ['A y B', 'J y H', 'K y L'], 'hard', 'mundial-2026-eliminatorias'),
  q('wc26-253', '¿El octavo m92 en Ciudad de México cruza ganadores de…?', '79 y 80', ['73 y 75', '81 y 82', '77 y 78'], 'hard', 'mundial-2026-eliminatorias'),
  q('wc26-254', '¿El cuarto m100 en Kansas City cruza ganadores de octavos…?', '95 y 96', ['89 y 90', '91 y 92', '93 y 94'], 'hard', 'mundial-2026-eliminatorias'),
  q('wc26-255', '¿Hay octavos en Vancouver en el 2026?', 'Sí (m96)', ['No', 'Solo en Toronto', 'Solo en grupos'], 'medium', 'mundial-2026-eliminatorias'),
  q('wc26-256', '¿Hay octavos en Ciudad de México en el 2026?', 'Sí (m92)', ['No', 'Solo final', 'Solo grupos'], 'medium', 'mundial-2026-eliminatorias'),
  q('wc26-257', '¿Hay 16avos en Toronto en el 2026?', 'Sí (m83)', ['No', 'Solo grupos', 'Solo final'], 'medium', 'mundial-2026-eliminatorias'),
  q('wc26-258', '¿Hay 16avos en Vancouver en el 2026?', 'Sí (m85)', ['No', 'Solo octavos', 'No hay partidos en Canadá'], 'medium', 'mundial-2026-eliminatorias'),

  // --- Goles/prode contexto 2026 (sin resultados ficticios) ---
  q('wc26-259', '¿En Plot Mundial 2026 podés cargar marcadores desde el…?', 'Dashboard', ['Solo admin', 'Solo trivia', 'Solo store'], 'easy', 'mundial-2026-plot'),
  q('wc26-260', '¿Los goles oficiales del 2026 los carga el admin en…?', 'Panel Admin → Resultados', ['Automático FIFA', 'Usuarios', 'Trivia'], 'easy', 'mundial-2026-plot'),
  q('wc26-261', '¿Un marcador exacto en fase de grupos 2026 en Plot vale…?', '3 puntos prode', ['1 punto', '5 puntos', '10 puntos'], 'easy', 'mundial-2026-plot'),
  q('wc26-262', '¿Hasta cuándo podés pronosticar un partido pendiente en Plot?', 'Antes del pitazo inicial', ['Hasta el minuto 90', 'Después del partido', 'Solo una semana antes'], 'medium', 'mundial-2026-plot'),

  // --- Último bloque grupos/fechas ---
  q('wc26-263', '¿Ghana e Inglaterra se cruzan en fecha 2 en…?', 'Boston', ['London', 'Toronto', 'Miami'], 'hard', 'mundial-2026-calendario'),
  q('wc26-264', '¿Alemania vs Ecuador en fecha 2 es en…?', 'Kansas City', ['Dallas', 'Houston', 'Chicago'], 'hard', 'mundial-2026-calendario'),
  q('wc26-265', '¿Portugal vs Uzbekistán en fecha 2 es en…?', 'Houston', ['Dallas', 'Miami', 'Atlanta'], 'hard', 'mundial-2026-calendario'),
  q('wc26-266', '¿Panamá vs Inglaterra en fecha 3 es en…?', 'Nueva York / New Jersey', ['Boston', 'Filadelfia', 'Toronto'], 'hard', 'mundial-2026-calendario'),
  q('wc26-267', '¿Argelia vs Austria en fecha 3 es en…?', 'Kansas City', ['Dallas', 'Miami', 'San Francisco'], 'hard', 'mundial-2026-calendario'),
  q('wc26-268', '¿Suiza vs Canadá en fecha 3 es en…?', 'Vancouver', ['Toronto', 'Seattle', 'Los Ángeles'], 'medium', 'mundial-2026-calendario'),
  q('wc26-269', '¿Rep. Checa vs México en fecha 3 es en…?', 'Ciudad de México', ['Guadalajara', 'Monterrey', 'Atlanta'], 'medium', 'mundial-2026-calendario'),
  q('wc26-270', '¿Sudáfrica vs Corea en fecha 3 es en…?', 'Monterrey', ['Ciudad de México', 'Guadalajara', 'Houston'], 'hard', 'mundial-2026-calendario'),

  // --- Cierre 2026 ---
  q('wc26-271', '¿El fixture Plot Mundial 2026 tiene IDs de partido desde…?', 'm1 a m104', ['m1 a m72', 'm1 a m128', 'm73 a m200'], 'medium', 'mundial-2026-plot'),
  q('wc26-272', '¿Los partidos m1–m72 son fase de…?', 'Grupos', ['Eliminatorias', 'Amistosos', 'Repechaje'], 'easy', 'mundial-2026-formato'),
  q('wc26-273', '¿Los partidos m73–m88 son…?', '16avos de final', ['Octavos', 'Cuartos', 'Semifinales'], 'easy', 'mundial-2026-formato'),
  q('wc26-274', '¿Los partidos m89–m96 son…?', 'Octavos de final', ['16avos', 'Cuartos', 'Semifinales'], 'easy', 'mundial-2026-formato'),
  q('wc26-275', '¿Los partidos m97–m100 son…?', 'Cuartos de final', ['Octavos', 'Semifinales', '16avos'], 'easy', 'mundial-2026-formato'),
  q('wc26-276', '¿Los partidos m101–m102 son…?', 'Semifinales', ['Cuartos', 'Final', '16avos'], 'easy', 'mundial-2026-formato'),
  q('wc26-277', '¿El partido m103 es por el…?', 'Tercer puesto', ['Repechaje', 'Semifinal', 'Octavos'], 'easy', 'mundial-2026-formato'),
  q('wc26-278', '¿El partido m104 es la…?', 'Final', ['Semifinal', 'Tercer puesto', 'Inaugural'], 'easy', 'mundial-2026-formato'),
  q('wc26-279', '¿Plot Mundial muestra los cruces eliminatorios como…?', 'Ganador X / 2º Grupo Y', ['Solo TBD', 'Solo banderas', 'Aleatorio'], 'medium', 'mundial-2026-eliminatorias'),
  q('wc26-280', '¿El Mundial 2026 en Plot tiene trivia dedicada con categoría…?', 'Mundial 2026 / Grupos / Sedes / etc.', ['Solo goleadores históricos', 'Solo 2022', 'Sin categoría 2026'], 'easy', 'mundial-2026-curiosidades'),
]
