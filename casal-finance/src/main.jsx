import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import './styles/global.css'

import AuthPage      from './pages/AuthPage'
import Layout        from './components/Layout'
import Dashboard     from './pages/Dashboard'
import Transactions  from './pages/Transactions'
import WifePage      from './pages/WifePage'
import SavingsPage   from './pages/SavingsPage'
import ReportsPage   from './pages/ReportsPage'
import SettingsPage  from './pages/SettingsPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <p className="text-ink-300 text-sm">Carregando...</p>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <p className="text-ink-300 text-sm">Carregando...</p>
    </div>
  )
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="transacoes" element={<Transactions />} />
        <Route path="esposa" element={<WifePage />} />
        <Route path="poupanca" element={<SavingsPage />} />
        <Route path="relatorios" element={<ReportsPage />} />
        <Route path="config" element={<SettingsPage />} />
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
