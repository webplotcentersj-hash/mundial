import fs from 'fs'

const file = 'src/app/admin/page.tsx'
let content = fs.readFileSync(file, 'utf-8')

content = content.replace(
  "import { mockMatches, mockUsers } from '@/lib/mockData'",
  "import { getMatches, getRanking, updateMatchScore } from '@/lib/actions'"
)
content = content.replace(
  "import { Settings, CheckCircle2, Save, ShieldAlert, Users, Trophy, Download, Eye, Mail } from 'lucide-react'",
  "import { Settings, CheckCircle2, Save, ShieldAlert, Users, Trophy, Download, Eye, Mail, Loader2 } from 'lucide-react'"
)

content = content.replace(
  "  const [matches, setMatches] = useState(mockMatches)\n  const [results, setResults] = useState<Record<string, { home: string, away: string }>>({})\n  const [activeTab, setActiveTab] = useState<'results' | 'users' | 'podium'>('results')",
  `  const [matches, setMatches] = useState<any[]>([])\n  const [users, setUsers] = useState<any[]>([])\n  const [results, setResults] = useState<Record<string, { home: string, away: string }>>({})\n  const [activeTab, setActiveTab] = useState<'results' | 'users' | 'podium'>('results')\n  const [isSaving, setIsSaving] = useState<string | null>(null)\n\n  import('react').then(({useEffect}) => {\n    useEffect(() => {\n      async function loadData() {\n        const [m, u] = await Promise.all([getMatches(), getRanking()])\n        setMatches(m)\n        setUsers(u)\n      }\n      loadData()\n    }, [])\n  })`
)

content = content.replace(
  "  const saveResult = (matchId: string) => {\n    const res = results[matchId]\n    if (res && res.home !== '' && res.away !== '') {\n      setMatches(prev => prev.map(m => \n        m.id === matchId \n          ? { ...m, status: 'finished', homeScore: parseInt(res.home), awayScore: parseInt(res.away) } \n          : m\n      ))\n      alert('Resultado real guardado y puntos calculados (simulación)')\n    }\n  }",
  `  const saveResult = async (matchId: string) => {\n    const res = results[matchId]\n    if (res && res.home !== '' && res.away !== '') {\n      setIsSaving(matchId)\n      try {\n        await updateMatchScore(matchId, parseInt(res.home), parseInt(res.away))\n        setMatches(prev => prev.map(m => \n          m.id === matchId \n            ? { ...m, status: 'finished', home_score: parseInt(res.home), away_score: parseInt(res.away) } \n            : m\n        ))\n        alert('Resultado real guardado y puntos calculados')\n      } catch(err: any) {\n        alert(err.message)\n      } finally {\n        setIsSaving(null)\n      }\n    }\n  }`
)

content = content.replace(/homeScore/g, "home_score")
content = content.replace(/awayScore/g, "away_score")
content = content.replace(/mockUsers/g, "users")

content = content.replace(
  `<button \n                      onClick={() => saveResult(match.id)}`,
  `<button \n                      onClick={() => saveResult(match.id)}\n                      disabled={isSaving === match.id}`
)

content = content.replace(
  `<Save className="w-4 h-4" />\n                      {match.status === 'finished' ? 'Actualizar Resultado' : 'Cargar Resultado Real'}`,
  `{isSaving === match.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}\n                      {isSaving === match.id ? 'Guardando...' : match.status === 'finished' ? 'Actualizar Resultado' : 'Cargar Resultado Real'}`
)

fs.writeFileSync(file, content)
console.log('Admin page updated')
