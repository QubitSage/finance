import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './styles/global.css'
import { registerSW } from './lib/notifications'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import {
  ReportsPage, ConfigPage,
  DataPage, MarketPage, ApartmentPage,
  SpreadsheetPage, WifePage, SavingsPage
} from './pages/AllPages'
import { TodoPage } from './pages/TodoPage'
import { VidaLivrePage } from './pages/VidaLivrePage'
import { PotenciaisPage } from './pages/PotenciaisPage'
import { ViagensPage } from './pages/ViagensPage'
import { CasamentoPage } from './pages/CasamentoPage'
import { MetasPage } from './pages/MetasPage'
import { AgendaPage } from './pages/AgendaPage'
import { MemoriasPage } from './pages/MemoriasPage'
import { FinancePage } from './pages/FinancePage'
import { CompromissosPage } from './pages/CompromissosPage'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => registerSW())
}

function Guard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-sm text-stone-300">Carregando...</p>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
    </div>
  )
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<Guard><Layout /></Guard>}>
        <Route index element={<Dashboard />} />
        <Route path="financas" element={<FinancePage />} />
        <Route path="relatorios" element={<ReportsPage />} />
        <Route path="planilha" element={<SpreadsheetPage />} />
        <Route path="config" element={<ConfigPage />} />
        <Route path="viagens" element={<ViagensPage />} />
        <Route path="dados" element={<DataPage />} />
        <Route path="mercado" element={<MarketPage />} />
        <Route path="apartamento" element={<ApartmentPage />} />
        <Route path="casamento" element={<CasamentoPage />} />
        <Route path="metas" element={<MetasPage />} />
        <Route path="compromissos" element={<CompromissosPage />} />
        <Route path="todo" element={<TodoPage />} />
        <Route path="vida-livre" element={<VidaLivrePage />} />
        <Route path="potenciais" element={<PotenciaisPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="memorias" element={<MemoriasPage />} />
        <Route path="transacoes" element={<Navigate to="/financas" replace />} />
        <Route path="esposa" element={<Navigate to="/financas" replace />} />
        <Route path="poupanca" element={<Navigate to="/financas" replace />} />
        <Route path="regras" element={<Navigate to="/vida-livre" replace />} />
        <Route path="desejos" element={<Navigate to="/vida-livre" replace />} />
        <Route path="questionario" element={<Navigate to="/vida-livre" replace />} />
        <Route path="pendencias" element={<Navigate to="/compromissos" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
