import { useState } from 'react'
import Layout from './components/Layout'
import RegrasPage from './features/RegrasPage'
import MesadaPage from './features/MesadaPage'
import PedidosPage from './features/PedidosPage'
import AgendaPage from './features/AgendaPage'

const PAGES = {
  regras: RegrasPage,
  mesada: MesadaPage,
  pedidos: PedidosPage,
  agenda: AgendaPage,
}

const DEFAULT_VIEW = 'regras'

export default function App() {
  const [active, setActive] = useState(DEFAULT_VIEW)
  const Page = PAGES[active] || RegrasPage

  return (
    <Layout active={active} onNavigate={setActive}>
      <Page />
    </Layout>
  )
}
