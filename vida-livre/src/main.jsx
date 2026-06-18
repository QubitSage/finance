import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SessionProvider, useSession } from './contexts/SessionContext'
import LoginPage from './features/LoginPage'
import App from './App.jsx'
import { runPendingBatchImports } from './lib/runBatchImports'
import { initCloudSync, pushToCloud } from './lib/sync'
import { isCloudConfigured } from './lib/supabase'
import { ensureMesadaCredit } from './lib/mesada'

function BootScreen({ message, error, onRetry, onOffline }) {
  return (
    <div className="vl-app-shell flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center pt-safe pb-safe">
      {!error && (
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-fuchsia-400 border-t-transparent" />
      )}
      <p className="mt-4 text-sm text-[var(--color-vl-muted)]">{message}</p>
      {error && (
        <>
          <p className="mt-3 max-w-sm text-sm text-rose-300">{error}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {onRetry && (
              <button type="button" onClick={onRetry} className="rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white">
                Tentar de novo
              </button>
            )}
            {onOffline && (
              <button type="button" onClick={onOffline} className="rounded-xl border border-[var(--color-vl-border)] px-4 py-2 text-sm text-[var(--color-vl-muted)]">
                Usar só neste navegador
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Root() {
  const { isLoggedIn } = useSession()
  const [boot, setBoot] = useState({ ready: false, error: null, offline: false })
  const [bootKey, setBootKey] = useState(0)

  useEffect(() => {
    if (boot.offline) return

    let cancelled = false

    ;(async () => {
      try {
        if (isCloudConfigured) {
          await initCloudSync()
        }
        runPendingBatchImports()
        ensureMesadaCredit()
        if (isCloudConfigured) {
          await pushToCloud()
        }
        if (!cancelled) setBoot({ ready: true, error: null, offline: false })
      } catch (err) {
        if (!cancelled) {
          setBoot({ ready: false, error: err.message || 'Erro ao conectar', offline: false })
        }
      }
    })()

    return () => { cancelled = true }
  }, [bootKey, boot.offline])

  if (boot.offline) {
    return isLoggedIn ? <App /> : <LoginPage />
  }

  if (!boot.ready) {
    return (
      <BootScreen
        message={boot.error ? 'Não foi possível sincronizar' : 'Sincronizando dados do casal…'}
        error={boot.error}
        onRetry={boot.error ? () => setBootKey((k) => k + 1) : undefined}
        onOffline={boot.error ? () => {
          runPendingBatchImports()
          ensureMesadaCredit()
          setBoot({ ready: true, error: null, offline: true })
        } : undefined}
      />
    )
  }

  return isLoggedIn ? <App /> : <LoginPage />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionProvider>
      <Root />
    </SessionProvider>
  </StrictMode>,
)
