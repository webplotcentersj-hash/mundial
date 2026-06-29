export const groupColors: Record<string, string> = {
  A: 'from-emerald-400 to-emerald-600',
  B: 'from-red-500 to-red-700',
  C: 'from-orange-400 to-orange-600',
  D: 'from-blue-500 to-blue-700',
  E: 'from-purple-500 to-purple-700',
  F: 'from-lime-400 to-lime-600',
  G: 'from-pink-500 to-pink-700',
  H: 'from-cyan-400 to-cyan-600',
  I: 'from-fuchsia-500 to-fuchsia-700',
  J: 'from-sky-400 to-sky-600',
  K: 'from-amber-500 to-amber-700',
  L: 'from-indigo-400 to-indigo-600',
  'KO': 'from-yellow-400 to-yellow-600',
}

export type Team = {
  id: string;
  name: string;
  group: string;
  code: string;
}

export const mockTeams: Team[] = [
  { id: 'mx', name: 'México', group: 'A', code: 'mx' },
  { id: 'za', name: 'Sudáfrica', group: 'A', code: 'za' },
  { id: 'kr', name: 'Rep. de Corea', group: 'A', code: 'kr' },
  { id: 'cz', name: 'Rep. Checa', group: 'A', code: 'cz' },
  { id: 'ca', name: 'Canadá', group: 'B', code: 'ca' },
  { id: 'ba', name: 'Bosnia y Herz.', group: 'B', code: 'ba' },
  { id: 'qa', name: 'Catar', group: 'B', code: 'qa' },
  { id: 'ch', name: 'Suiza', group: 'B', code: 'ch' },
  { id: 'br', name: 'Brasil', group: 'C', code: 'br' },
  { id: 'ma', name: 'Marruecos', group: 'C', code: 'ma' },
  { id: 'ht', name: 'Haití', group: 'C', code: 'ht' },
  { id: 'gb-sct', name: 'Escocia', group: 'C', code: 'gb-sct' },
  { id: 'us', name: 'Estados Unidos', group: 'D', code: 'us' },
  { id: 'py', name: 'Paraguay', group: 'D', code: 'py' },
  { id: 'au', name: 'Australia', group: 'D', code: 'au' },
  { id: 'tr', name: 'Turquía', group: 'D', code: 'tr' },
  { id: 'de', name: 'Alemania', group: 'E', code: 'de' },
  { id: 'cw', name: 'Curazao', group: 'E', code: 'cw' },
  { id: 'ci', name: 'C. de Marfil', group: 'E', code: 'ci' },
  { id: 'ec', name: 'Ecuador', group: 'E', code: 'ec' },
  { id: 'nl', name: 'Países Bajos', group: 'F', code: 'nl' },
  { id: 'jp', name: 'Japón', group: 'F', code: 'jp' },
  { id: 'se', name: 'Suecia', group: 'F', code: 'se' },
  { id: 'tn', name: 'Túnez', group: 'F', code: 'tn' },
  { id: 'be', name: 'Bélgica', group: 'G', code: 'be' },
  { id: 'eg', name: 'Egipto', group: 'G', code: 'eg' },
  { id: 'ir', name: 'RI de Irán', group: 'G', code: 'ir' },
  { id: 'nz', name: 'N. Zelanda', group: 'G', code: 'nz' },
  { id: 'es', name: 'España', group: 'H', code: 'es' },
  { id: 'cv', name: 'Cabo Verde', group: 'H', code: 'cv' },
  { id: 'sa', name: 'Arabia Saudí', group: 'H', code: 'sa' },
  { id: 'uy', name: 'Uruguay', group: 'H', code: 'uy' },
  { id: 'fr', name: 'Francia', group: 'I', code: 'fr' },
  { id: 'sn', name: 'Senegal', group: 'I', code: 'sn' },
  { id: 'iq', name: 'Irak', group: 'I', code: 'iq' },
  { id: 'no', name: 'Noruega', group: 'I', code: 'no' },
  { id: 'ar', name: 'Argentina', group: 'J', code: 'ar' },
  { id: 'dz', name: 'Argelia', group: 'J', code: 'dz' },
  { id: 'at', name: 'Austria', group: 'J', code: 'at' },
  { id: 'jo', name: 'Jordania', group: 'J', code: 'jo' },
  { id: 'pt', name: 'Portugal', group: 'K', code: 'pt' },
  { id: 'cd', name: 'RD Congo', group: 'K', code: 'cd' },
  { id: 'uz', name: 'Uzbekistán', group: 'K', code: 'uz' },
  { id: 'co', name: 'Colombia', group: 'K', code: 'co' },
  { id: 'gb-eng', name: 'Inglaterra', group: 'L', code: 'gb-eng' },
  { id: 'hr', name: 'Croacia', group: 'L', code: 'hr' },
  { id: 'gh', name: 'Ghana', group: 'L', code: 'gh' },
  { id: 'pa', name: 'Panamá', group: 'L', code: 'pa' },
];

const getTeam = (id: string) => mockTeams.find(t => t.id === id)!

const createPlaceholderTeam = (name: string): Team => ({
  id: name,
  name,
  group: 'KO',
  code: 'tbd'
})

export const mockMatches = [
  // Fecha 1
  { id: 'm1', homeTeam: getTeam('mx'), awayTeam: getTeam('za'), date: '2026-06-12T01:00:00Z', stage: 'Grupo A', venue: 'Estadio Ciudad de México', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm2', homeTeam: getTeam('kr'), awayTeam: getTeam('cz'), date: '2026-06-12T08:00:00Z', stage: 'Grupo A', venue: 'Estadio Guadalajara', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm3', homeTeam: getTeam('ca'), awayTeam: getTeam('ba'), date: '2026-06-12T23:00:00Z', stage: 'Grupo B', venue: 'Estadio Toronto', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm4', homeTeam: getTeam('us'), awayTeam: getTeam('py'), date: '2026-06-13T08:00:00Z', stage: 'Grupo D', venue: 'Estadio Los Ángeles', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm5', homeTeam: getTeam('qa'), awayTeam: getTeam('ch'), date: '2026-06-14T02:00:00Z', stage: 'Grupo B', venue: 'Estadio Bahía de San Francisco', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm6', homeTeam: getTeam('br'), awayTeam: getTeam('ma'), date: '2026-06-14T02:00:00Z', stage: 'Grupo C', venue: 'Estadio Nueva York Nueva Jersey', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm7', homeTeam: getTeam('ht'), awayTeam: getTeam('gb-sct'), date: '2026-06-14T05:00:00Z', stage: 'Grupo C', venue: 'Estadio Boston', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm8', homeTeam: getTeam('au'), awayTeam: getTeam('tr'), date: '2026-06-14T11:00:00Z', stage: 'Grupo D', venue: 'Estadio BC Place Vancouver', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm9', homeTeam: getTeam('de'), awayTeam: getTeam('cw'), date: '2026-06-14T22:00:00Z', stage: 'Grupo E', venue: 'Estadio Houston', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm10', homeTeam: getTeam('nl'), awayTeam: getTeam('jp'), date: '2026-06-15T01:00:00Z', stage: 'Grupo F', venue: 'Estadio Dallas', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm11', homeTeam: getTeam('ci'), awayTeam: getTeam('ec'), date: '2026-06-15T03:00:00Z', stage: 'Grupo E', venue: 'Estadio Filadelfia', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm12', homeTeam: getTeam('se'), awayTeam: getTeam('tn'), date: '2026-06-15T08:00:00Z', stage: 'Grupo F', venue: 'Estadio Monterrey', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm13', homeTeam: getTeam('es'), awayTeam: getTeam('cv'), date: '2026-06-15T20:00:00Z', stage: 'Grupo H', venue: 'Estadio Atlanta', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm14', homeTeam: getTeam('be'), awayTeam: getTeam('eg'), date: '2026-06-16T02:00:00Z', stage: 'Grupo G', venue: 'Estadio Seattle', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm15', homeTeam: getTeam('sa'), awayTeam: getTeam('uy'), date: '2026-06-16T02:00:00Z', stage: 'Grupo H', venue: 'Estadio Miami', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm16', homeTeam: getTeam('ir'), awayTeam: getTeam('nz'), date: '2026-06-16T08:00:00Z', stage: 'Grupo G', venue: 'Estadio Los Ángeles', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm17', homeTeam: getTeam('fr'), awayTeam: getTeam('sn'), date: '2026-06-16T23:00:00Z', stage: 'Grupo I', venue: 'Estadio Nueva York Nueva Jersey', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm18', homeTeam: getTeam('iq'), awayTeam: getTeam('no'), date: '2026-06-17T02:00:00Z', stage: 'Grupo I', venue: 'Estadio Boston', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm19', homeTeam: getTeam('ar'), awayTeam: getTeam('dz'), date: '2026-06-17T06:00:00Z', stage: 'Grupo J', venue: 'Arrowhead Stadium, Kansas City', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm20', homeTeam: getTeam('at'), awayTeam: getTeam('jo'), date: '2026-06-17T11:00:00Z', stage: 'Grupo J', venue: 'Estadio Bahía de San Francisco', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm21', homeTeam: getTeam('pt'), awayTeam: getTeam('cd'), date: '2026-06-17T22:00:00Z', stage: 'Grupo K', venue: 'Estadio Houston', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm22', homeTeam: getTeam('gb-eng'), awayTeam: getTeam('hr'), date: '2026-06-18T01:00:00Z', stage: 'Grupo L', venue: 'Estadio Dallas', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm23', homeTeam: getTeam('gh'), awayTeam: getTeam('pa'), date: '2026-06-18T03:00:00Z', stage: 'Grupo L', venue: 'Estadio Toronto', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm24', homeTeam: getTeam('uz'), awayTeam: getTeam('co'), date: '2026-06-18T08:00:00Z', stage: 'Grupo K', venue: 'Estadio Ciudad de México', homeScore: null, awayScore: null, status: 'pending' },

  // Fecha 2
  { id: 'm25', homeTeam: getTeam('cz'), awayTeam: getTeam('za'), date: '2026-06-18T20:00:00Z', stage: 'Grupo A', venue: 'Estadio Atlanta', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm26', homeTeam: getTeam('ch'), awayTeam: getTeam('ba'), date: '2026-06-19T02:00:00Z', stage: 'Grupo B', venue: 'Estadio Los Ángeles', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm27', homeTeam: getTeam('ca'), awayTeam: getTeam('qa'), date: '2026-06-19T05:00:00Z', stage: 'Grupo B', venue: 'Estadio BC Place Vancouver', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm28', homeTeam: getTeam('mx'), awayTeam: getTeam('kr'), date: '2026-06-19T07:00:00Z', stage: 'Grupo A', venue: 'Estadio Guadalajara', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm29', homeTeam: getTeam('us'), awayTeam: getTeam('au'), date: '2026-06-20T02:00:00Z', stage: 'Grupo D', venue: 'Estadio Seattle', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm30', homeTeam: getTeam('gb-sct'), awayTeam: getTeam('ma'), date: '2026-06-20T02:00:00Z', stage: 'Grupo C', venue: 'Estadio Boston', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm31', homeTeam: getTeam('br'), awayTeam: getTeam('ht'), date: '2026-06-20T04:30:00Z', stage: 'Grupo C', venue: 'Estadio Filadelfia', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm32', homeTeam: getTeam('tr'), awayTeam: getTeam('py'), date: '2026-06-20T10:00:00Z', stage: 'Grupo D', venue: 'Estadio Bahía de San Francisco', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm33', homeTeam: getTeam('nl'), awayTeam: getTeam('se'), date: '2026-06-20T22:00:00Z', stage: 'Grupo F', venue: 'Estadio Houston', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm34', homeTeam: getTeam('de'), awayTeam: getTeam('ci'), date: '2026-06-21T00:00:00Z', stage: 'Grupo E', venue: 'Estadio Toronto', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm35', homeTeam: getTeam('ec'), awayTeam: getTeam('cw'), date: '2026-06-21T05:00:00Z', stage: 'Grupo E', venue: 'Estadio Kansas City', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm36', homeTeam: getTeam('tn'), awayTeam: getTeam('jp'), date: '2026-06-21T10:00:00Z', stage: 'Grupo F', venue: 'Estadio Monterrey', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm37', homeTeam: getTeam('es'), awayTeam: getTeam('sa'), date: '2026-06-21T20:00:00Z', stage: 'Grupo H', venue: 'Estadio Atlanta', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm38', homeTeam: getTeam('be'), awayTeam: getTeam('ir'), date: '2026-06-22T02:00:00Z', stage: 'Grupo G', venue: 'Estadio Los Ángeles', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm39', homeTeam: getTeam('uy'), awayTeam: getTeam('cv'), date: '2026-06-22T02:00:00Z', stage: 'Grupo H', venue: 'Estadio Miami', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm40', homeTeam: getTeam('nz'), awayTeam: getTeam('eg'), date: '2026-06-22T08:00:00Z', stage: 'Grupo G', venue: 'Estadio BC Place Vancouver', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm41', homeTeam: getTeam('ar'), awayTeam: getTeam('at'), date: '2026-06-22T22:00:00Z', stage: 'Grupo J', venue: 'AT&T Stadium, Dallas', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm42', homeTeam: getTeam('fr'), awayTeam: getTeam('iq'), date: '2026-06-23T01:00:00Z', stage: 'Grupo I', venue: 'Estadio Filadelfia', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm43', homeTeam: getTeam('no'), awayTeam: getTeam('sn'), date: '2026-06-23T04:00:00Z', stage: 'Grupo I', venue: 'Estadio Nueva York Nueva Jersey', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm44', homeTeam: getTeam('jo'), awayTeam: getTeam('dz'), date: '2026-06-23T10:00:00Z', stage: 'Grupo J', venue: 'Estadio Bahía de San Francisco', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm45', homeTeam: getTeam('pt'), awayTeam: getTeam('uz'), date: '2026-06-23T22:00:00Z', stage: 'Grupo K', venue: 'Estadio Houston', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm46', homeTeam: getTeam('gb-eng'), awayTeam: getTeam('gh'), date: '2026-06-24T00:00:00Z', stage: 'Grupo L', venue: 'Estadio Boston', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm47', homeTeam: getTeam('pa'), awayTeam: getTeam('hr'), date: '2026-06-24T03:00:00Z', stage: 'Grupo L', venue: 'Estadio Toronto', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm48', homeTeam: getTeam('co'), awayTeam: getTeam('cd'), date: '2026-06-24T08:00:00Z', stage: 'Grupo K', venue: 'Estadio Guadalajara', homeScore: null, awayScore: null, status: 'pending' },

  // Fecha 3
  { id: 'm49', homeTeam: getTeam('ch'), awayTeam: getTeam('ca'), date: '2026-06-25T02:00:00Z', stage: 'Grupo B', venue: 'Estadio BC Place Vancouver', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm50', homeTeam: getTeam('ba'), awayTeam: getTeam('qa'), date: '2026-06-25T02:00:00Z', stage: 'Grupo B', venue: 'Estadio Seattle', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm51', homeTeam: getTeam('gb-sct'), awayTeam: getTeam('br'), date: '2026-06-25T02:00:00Z', stage: 'Grupo C', venue: 'Estadio Miami', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm52', homeTeam: getTeam('ma'), awayTeam: getTeam('ht'), date: '2026-06-25T02:00:00Z', stage: 'Grupo C', venue: 'Estadio Atlanta', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm53', homeTeam: getTeam('cz'), awayTeam: getTeam('mx'), date: '2026-06-25T07:00:00Z', stage: 'Grupo A', venue: 'Estadio Ciudad de México', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm54', homeTeam: getTeam('za'), awayTeam: getTeam('kr'), date: '2026-06-25T07:00:00Z', stage: 'Grupo A', venue: 'Estadio Monterrey', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm55', homeTeam: getTeam('cw'), awayTeam: getTeam('ci'), date: '2026-06-26T00:00:00Z', stage: 'Grupo E', venue: 'Estadio Filadelfia', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm56', homeTeam: getTeam('ec'), awayTeam: getTeam('de'), date: '2026-06-26T00:00:00Z', stage: 'Grupo E', venue: 'Estadio Nueva York Nueva Jersey', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm57', homeTeam: getTeam('jp'), awayTeam: getTeam('se'), date: '2026-06-26T04:00:00Z', stage: 'Grupo F', venue: 'Estadio Dallas', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm58', homeTeam: getTeam('tn'), awayTeam: getTeam('nl'), date: '2026-06-26T04:00:00Z', stage: 'Grupo F', venue: 'Estadio Kansas City', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm59', homeTeam: getTeam('tr'), awayTeam: getTeam('us'), date: '2026-06-26T09:00:00Z', stage: 'Grupo D', venue: 'Estadio Los Ángeles', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm60', homeTeam: getTeam('py'), awayTeam: getTeam('au'), date: '2026-06-26T09:00:00Z', stage: 'Grupo D', venue: 'Estadio Bahía de San Francisco', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm61', homeTeam: getTeam('no'), awayTeam: getTeam('fr'), date: '2026-06-26T23:00:00Z', stage: 'Grupo I', venue: 'Estadio Boston', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm62', homeTeam: getTeam('sn'), awayTeam: getTeam('iq'), date: '2026-06-26T23:00:00Z', stage: 'Grupo I', venue: 'Estadio Toronto', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm63', homeTeam: getTeam('cv'), awayTeam: getTeam('sa'), date: '2026-06-27T05:00:00Z', stage: 'Grupo H', venue: 'Estadio Houston', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm64', homeTeam: getTeam('uy'), awayTeam: getTeam('es'), date: '2026-06-27T06:00:00Z', stage: 'Grupo H', venue: 'Estadio Guadalajara', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm65', homeTeam: getTeam('eg'), awayTeam: getTeam('ir'), date: '2026-06-27T10:00:00Z', stage: 'Grupo G', venue: 'Estadio Seattle', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm66', homeTeam: getTeam('nz'), awayTeam: getTeam('be'), date: '2026-06-27T10:00:00Z', stage: 'Grupo G', venue: 'Estadio BC Place Vancouver', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm67', homeTeam: getTeam('pa'), awayTeam: getTeam('gb-eng'), date: '2026-06-28T01:00:00Z', stage: 'Grupo L', venue: 'Estadio Nueva York Nueva Jersey', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm68', homeTeam: getTeam('hr'), awayTeam: getTeam('gh'), date: '2026-06-28T01:00:00Z', stage: 'Grupo L', venue: 'Estadio Filadelfia', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm69', homeTeam: getTeam('co'), awayTeam: getTeam('pt'), date: '2026-06-28T03:30:00Z', stage: 'Grupo K', venue: 'Estadio Miami', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm70', homeTeam: getTeam('cd'), awayTeam: getTeam('uz'), date: '2026-06-28T03:30:00Z', stage: 'Grupo K', venue: 'Estadio Atlanta', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm71', homeTeam: getTeam('dz'), awayTeam: getTeam('at'), date: '2026-06-28T07:00:00Z', stage: 'Grupo J', venue: 'Estadio Kansas City', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm72', homeTeam: getTeam('jo'), awayTeam: getTeam('ar'), date: '2026-06-28T07:00:00Z', stage: 'Grupo J', venue: 'AT&T Stadium, Dallas', homeScore: null, awayScore: null, status: 'pending' },

  // --- DIECISEISAVOS DE FINAL (cruces confirmados, 28 jun – 3 jul 2026) ---
  { id: 'm73', homeTeam: getTeam('za'), awayTeam: getTeam('ca'), date: '2026-06-29T02:00:00Z', stage: '16avos', venue: 'Estadio Los Ángeles', homeScore: 0, awayScore: 1, status: 'finished' },
  { id: 'm74', homeTeam: getTeam('de'), awayTeam: getTeam('py'), date: '2026-06-30T00:30:00Z', stage: '16avos', venue: 'Estadio Boston', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm75', homeTeam: getTeam('nl'), awayTeam: getTeam('ma'), date: '2026-06-30T07:00:00Z', stage: '16avos', venue: 'Estadio Monterrey', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm76', homeTeam: getTeam('br'), awayTeam: getTeam('jp'), date: '2026-06-29T22:00:00Z', stage: '16avos', venue: 'Estadio Houston', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm77', homeTeam: getTeam('fr'), awayTeam: getTeam('se'), date: '2026-07-01T01:00:00Z', stage: '16avos', venue: 'Estadio Nueva York Nueva Jersey', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm78', homeTeam: getTeam('ci'), awayTeam: getTeam('no'), date: '2026-06-30T22:00:00Z', stage: '16avos', venue: 'Estadio Dallas', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm79', homeTeam: getTeam('mx'), awayTeam: getTeam('ec'), date: '2026-07-01T07:00:00Z', stage: '16avos', venue: 'Estadio Ciudad de México', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm80', homeTeam: getTeam('gb-eng'), awayTeam: getTeam('cd'), date: '2026-07-01T20:00:00Z', stage: '16avos', venue: 'Estadio Atlanta', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm81', homeTeam: getTeam('us'), awayTeam: getTeam('ba'), date: '2026-07-02T07:00:00Z', stage: '16avos', venue: 'Estadio Bahía de San Francisco', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm82', homeTeam: getTeam('be'), awayTeam: getTeam('sn'), date: '2026-07-02T03:00:00Z', stage: '16avos', venue: 'Estadio Seattle', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm83', homeTeam: getTeam('pt'), awayTeam: getTeam('hr'), date: '2026-07-03T03:00:00Z', stage: '16avos', venue: 'Estadio Toronto', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm84', homeTeam: getTeam('es'), awayTeam: getTeam('at'), date: '2026-07-03T02:00:00Z', stage: '16avos', venue: 'Estadio Los Ángeles', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm85', homeTeam: getTeam('ch'), awayTeam: getTeam('dz'), date: '2026-07-03T10:00:00Z', stage: '16avos', venue: 'Estadio BC Place Vancouver', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm86', homeTeam: getTeam('ar'), awayTeam: getTeam('cv'), date: '2026-07-04T02:00:00Z', stage: '16avos', venue: 'Estadio Miami', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm87', homeTeam: getTeam('co'), awayTeam: getTeam('gh'), date: '2026-07-04T06:30:00Z', stage: '16avos', venue: 'Estadio Kansas City', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm88', homeTeam: getTeam('au'), awayTeam: getTeam('eg'), date: '2026-07-03T23:00:00Z', stage: '16avos', venue: 'Estadio Dallas', homeScore: null, awayScore: null, status: 'pending' },

  // --- OCTAVOS DE FINAL ---
  { id: 'm89', homeTeam: createPlaceholderTeam('Ganador 74'), awayTeam: createPlaceholderTeam('Ganador 77'), date: '2026-07-05T01:00:00Z', stage: 'Octavos', venue: 'Estadio Filadelfia', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm90', homeTeam: createPlaceholderTeam('Ganador 73'), awayTeam: createPlaceholderTeam('Ganador 75'), date: '2026-07-04T22:00:00Z', stage: 'Octavos', venue: 'Estadio Houston', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm91', homeTeam: createPlaceholderTeam('Ganador 76'), awayTeam: createPlaceholderTeam('Ganador 78'), date: '2026-07-06T00:00:00Z', stage: 'Octavos', venue: 'Estadio Nueva York Nueva Jersey', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm92', homeTeam: createPlaceholderTeam('Ganador 79'), awayTeam: createPlaceholderTeam('Ganador 80'), date: '2026-07-06T06:00:00Z', stage: 'Octavos', venue: 'Estadio Ciudad de México', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm93', homeTeam: createPlaceholderTeam('Ganador 83'), awayTeam: createPlaceholderTeam('Ganador 84'), date: '2026-07-07T00:00:00Z', stage: 'Octavos', venue: 'Estadio Dallas', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm94', homeTeam: createPlaceholderTeam('Ganador 81'), awayTeam: createPlaceholderTeam('Ganador 82'), date: '2026-07-07T07:00:00Z', stage: 'Octavos', venue: 'Estadio Seattle', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm95', homeTeam: createPlaceholderTeam('Ganador 86'), awayTeam: createPlaceholderTeam('Ganador 88'), date: '2026-07-07T20:00:00Z', stage: 'Octavos', venue: 'Estadio Atlanta', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm96', homeTeam: createPlaceholderTeam('Ganador 85'), awayTeam: createPlaceholderTeam('Ganador 87'), date: '2026-07-08T03:00:00Z', stage: 'Octavos', venue: 'Estadio BC Place Vancouver', homeScore: null, awayScore: null, status: 'pending' },

  // --- CUARTOS DE FINAL ---
  { id: 'm97', homeTeam: createPlaceholderTeam('Ganador 89'), awayTeam: createPlaceholderTeam('Ganador 90'), date: '2026-07-10T00:00:00Z', stage: 'Cuartos', venue: 'Estadio Boston', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm98', homeTeam: createPlaceholderTeam('Ganador 93'), awayTeam: createPlaceholderTeam('Ganador 94'), date: '2026-07-11T02:00:00Z', stage: 'Cuartos', venue: 'Estadio Los Ángeles', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm99', homeTeam: createPlaceholderTeam('Ganador 91'), awayTeam: createPlaceholderTeam('Ganador 92'), date: '2026-07-12T01:00:00Z', stage: 'Cuartos', venue: 'Estadio Miami', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm100', homeTeam: createPlaceholderTeam('Ganador 95'), awayTeam: createPlaceholderTeam('Ganador 96'), date: '2026-07-12T06:00:00Z', stage: 'Cuartos', venue: 'Estadio Kansas City', homeScore: null, awayScore: null, status: 'pending' },

  // --- SEMIFINALES ---
  { id: 'm101', homeTeam: createPlaceholderTeam('Ganador 97'), awayTeam: createPlaceholderTeam('Ganador 98'), date: '2026-07-15T00:00:00Z', stage: 'Semifinal', venue: 'Estadio Dallas', homeScore: null, awayScore: null, status: 'pending' },
  { id: 'm102', homeTeam: createPlaceholderTeam('Ganador 99'), awayTeam: createPlaceholderTeam('Ganador 100'), date: '2026-07-15T23:00:00Z', stage: 'Semifinal', venue: 'Estadio Atlanta', homeScore: null, awayScore: null, status: 'pending' },

  // --- TERCER PUESTO ---
  { id: 'm103', homeTeam: createPlaceholderTeam('Perdedor 101'), awayTeam: createPlaceholderTeam('Perdedor 102'), date: '2026-07-19T01:00:00Z', stage: '3er Puesto', venue: 'Estadio Miami', homeScore: null, awayScore: null, status: 'pending' },

  // --- FINAL ---
  { id: 'm104', homeTeam: createPlaceholderTeam('Ganador 101'), awayTeam: createPlaceholderTeam('Ganador 102'), date: '2026-07-19T23:00:00Z', stage: 'Final', venue: 'MetLife Stadium, New York/New Jersey', homeScore: null, awayScore: null, status: 'pending' },
];

export const mockUsers = [
  { id: 'u1', username: 'MatiasG', email: 'matiasg@plotmundial.com', total_points: 120, predicted_matches: 48, last_active: 'Hace 2 horas', avatar: 'M' },
  { id: 'u2', username: 'CaroProde', email: 'carolina.prode@gmail.com', total_points: 110, predicted_matches: 48, last_active: 'Ayer', avatar: 'C' },
  { id: 'u3', username: 'LeoMessi10', email: 'leo.m.10@hotmail.com', total_points: 95, predicted_matches: 45, last_active: 'Hace 5 horas', avatar: 'L' },
  { id: 'u4', username: 'PlotFan_26', email: 'fan.plot26@yahoo.com', total_points: 80, predicted_matches: 32, last_active: 'Hace 1 día', avatar: 'P' },
  { id: 'u5', username: 'DiegoArmando', email: 'diego.a.forever@gmail.com', total_points: 75, predicted_matches: 48, last_active: 'Hace 3 días', avatar: 'D' },
  { id: 'u6', username: 'CamilaWorldCup', email: 'cami.wc26@outlook.com', total_points: 40, predicted_matches: 12, last_active: 'Hace 1 semana', avatar: 'C' },
];

export const mockPredictions = [];
