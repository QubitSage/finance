import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSettings } from '../hooks/useSettings'
import {
  LayoutDashboard, ArrowLeftRight, Heart, PiggyBank,
  BarChart2, Settings, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transacoes', icon: ArrowLeftRight, label: 'Entradas e Saídas' },
  { to: '/esposa',    icon: Heart,           label: 'Mimos da Esposa' },
  { to: '/poupanca',  icon: PiggyBank,       label: 'Poupança & Metas' },
  { to: '/relatorios', icon: BarChart2,      label: 'Relatórios' },
  { to: '/config',    icon: Settings,        label: 'Configurações' },
]

export default function Layout() {
  const { signOut, user } = useAuth()
  const { settings } = useSettings()
  const [mobileOpen, setMobileOpen] = useState(false)

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-ink-100 w-60 min-w-[240px]">
      <div className="p-5 border-b border-ink-100">
        <p className="font-display text-xl font-bold text-rose-brand italic">Casal Finance</p>
        <p className="text-xs text-ink-400 mt-0.5 truncate">{settings.couple_name}</p>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-ink-100">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-rose-light flex items-center justify-center text-xs font-medium text-rose-dark">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <p className="text-xs text-ink-500 truncate flex-1">{user?.email}</p>
          <button onClick={signOut} className="text-ink-300 hover:text-rose-brand transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-ink-100">
          <p className="font-display text-lg font-bold text-rose-brand italic">Casal Finance</p>
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <main className="flex-1 overflow-y-auto bg-cream-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
