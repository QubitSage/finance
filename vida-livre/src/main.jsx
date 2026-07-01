import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ActorProvider } from './contexts/ActorContext'
import App from './App.jsx'
import { ensureCreditoMensal } from './lib/ledger'
import { isCloudConfigured } from './lib/supabase'

function Root() {
  useEffect(() => {
    if (isCloudConfigured) {
      ensureCreditoMensal().catch((err) => console.error('Falha ao creditar mesada mensal:', err.message))
    }
  }, [])

  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ActorProvider>
      <Root />
    </ActorProvider>
  </StrictMode>,
)
