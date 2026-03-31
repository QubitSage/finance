import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './styles/global.css'

import LoginPage    from './pages/LoginPage'
import Layout       from './components/Layout'
import Dashboard    from './pages/Dashboard'
import Transactions from './pages/Transactions'

import {
  WifePage, SavingsPage, ReportsPage, ConfigPage,
  RulesPage, TripsPage, DesiresPage, QuizPage, DataPage,
  MarketPage, ApartmentPage, WeddingPage, GoalsPage,
  CommitmentsPage, PendingPage, SpreadsheetPage,
} from './pages/AllPages'

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
        <Route index            element={<Dashboard />} />
        <Route path="transacoes"  element={<Transactions />} />
        <Route path="esposa"      element={<WifePage />} />
        <Route path="poupanca"    element={<SavingsPage />} />
        <Route path="relatorios"  element={<ReportsPage />} />
                      <Route path="planilha"      element={<SpreadsheetPage />} />
        <Route path="config"      element={<ConfigPage />} />
        <Route path="regras"      element={<RulesPage />} />
        <Route path="viagens"     element={<TripsPage />} />
        <Route path="desejos"     element={<DesiresPage />} />
        <Route path="questionario" element={<QuizPage />} />
        <Route path="dados"       element={<DataPage />} />
        <Route path="mercado"     element={<MarketPage />} />
        <Route path="apartamento" element={<ApartmentPage />} />
        <Route path="casamento"   element={<WeddingPage />} />
        <Route path="metas"       element={<GoalsPage />} />
        <Route path="compromissos" element={<CommitmentsPage />} />
        <Route path="pendencias"  element={<PendingPage />} />
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
