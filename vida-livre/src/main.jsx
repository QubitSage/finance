import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SessionProvider, useSession } from './contexts/SessionContext'
import LoginPage from './features/LoginPage'
import App from './App.jsx'
import { runPendingBatchImports } from './lib/runBatchImports'

function Root() {
  const { isLoggedIn } = useSession()

  useEffect(() => {
    runPendingBatchImports()
  }, [])

  return isLoggedIn ? <App /> : <LoginPage />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionProvider>
      <Root />
    </SessionProvider>
  </StrictMode>,
)
