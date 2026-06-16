import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import { useSession } from './contexts/SessionContext'
import { getModulesForSession } from './lib/views'
import HomePage from './features/HomePage'
import AgendaPage from './features/AgendaPage'
import RegistrosPage from './features/RegistrosPage'
import FantasiasPage from './features/FantasiasPage'
import MimosPage from './features/MimosPage'
import ElaPage from './features/ElaPage'
import ObjetivosPage from './features/ObjetivosPage'
import ViagensPage from './features/ViagensPage'
import RecompensasPage from './features/RecompensasPage'
import RegrasPage from './features/RegrasPage'
import SimulacaoPage from './features/SimulacaoPage'
import { MIMOS_SEED } from './lib/constants'

const PAGES = {
  home: HomePage,
  recompensas: RecompensasPage,
  agenda: AgendaPage,
  registros: RegistrosPage,
  fantasias: FantasiasPage,
  mimos: MimosPage,
  ela: ElaPage,
  objetivos: ObjetivosPage,
  viagens: ViagensPage,
  regras: RegrasPage,
  'sim-mimos': () => (
    <SimulacaoPage
      catCollection="mimos_categorias"
      itemCollection="mimos_itens"
      rendaKey="mimos_renda"
      seed={MIMOS_SEED}
      emptyTitulo="Simule os mimos do casal"
      emptySub="Categorias prontas e orçamento do mês."
      emptyEmoji="💝"
      rendaLabel="Orçamento mensal de mimos"
    />
  ),
}

export default function App() {
  const { isHer } = useSession()
  const modules = getModulesForSession(isHer)
  const [active, setActive] = useState('home')

  useEffect(() => {
    setActive('home')
  }, [isHer])

  const allowed = new Set(modules.map((m) => m.id))
  const safeActive = allowed.has(active) ? active : 'home'
  const Page = PAGES[safeActive] || HomePage

  return (
    <Layout active={safeActive} onNavigate={setActive}>
      <Page />
    </Layout>
  )
}
