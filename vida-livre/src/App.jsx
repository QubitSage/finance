import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import { useSession } from './contexts/SessionContext'
import { getModulesForSession } from './lib/views'
import RegrasPage from './features/RegrasPage'
import MesadaPage from './features/MesadaPage'
import SaidasPlanejamentoPage from './features/SaidasPlanejamentoPage'
import MimosPage from './features/MimosPage'
import AgendaPage from './features/AgendaPage'

const PAGES = {
  regras: RegrasPage,
  mesada: MesadaPage,
  saidas: SaidasPlanejamentoPage,
  mimos: MimosPage,
  agenda: AgendaPage,
}

const DEFAULT_VIEW = 'regras'

export default function App() {
  const { isHer } = useSession()
  const modules = getModulesForSession(isHer)
  const [active, setActive] = useState(DEFAULT_VIEW)

  useEffect(() => {
    setActive(DEFAULT_VIEW)
  }, [isHer])

  const allowed = new Set(modules.map((m) => m.id))
  const safeActive = allowed.has(active) ? active : DEFAULT_VIEW
  const Page = PAGES[safeActive] || RegrasPage

  return (
    <Layout active={safeActive} onNavigate={setActive}>
      <Page />
    </Layout>
  )
}
