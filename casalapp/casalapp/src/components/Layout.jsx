import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSettings } from '../hooks/useSettings'
import {
  LayoutDashboard, ArrowLeftRight, Heart, PiggyBank, BarChart2,
  Globe, Sparkles, HelpCircle, User, ShoppingCart, Home,
  Gem, CalendarDays, Target, ClipboardList, Settings, LogOut, Menu, X, Table2, ListTodo, Flame as FlameIcon,
  Camera,
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard',       group: 'Finanças' },
  { to: '/transacoes',    icon: ArrowLeftRight,  label: 'Entradas & Saídas', group: 'Finanças' },
  { to: '/esposa',        icon: Heart,           label: 'Mimos da Esposa', group: 'Finanças' },
  { to: '/poupanca',      icon: PiggyBank,       label: 'Poupança',        group: 'Finanças' },
  { to: '/relatorios',    icon: BarChart2,       label: 'Relatórios',      group: 'Finanças' },
  { to: '/planilha',    icon: Table2,       label: 'Planilha',      group: 'Finanças' },
  { to: '/regras',        icon: ClipboardList,   label: 'Regras',          group: 'Casal' },
  { to: '/viagens',       icon: Globe,           label: 'Viagens',         group: 'Casal' },
  { to: '/desejos',       icon: Sparkles,        label: 'Desejos',         group: 'Casal' },
  { to: '/questionario',  icon: HelpCircle,      label: 'Questionário',    group: 'Casal' },
  { to: '/dados',         icon: User,            label: 'Dados',           group: 'Casal' },
  { to: '/mercado',       icon: ShoppingCart,    label: 'Mercado',         group: 'Casa' },
  { to: '/apartamento',   icon: Home,            label: 'Apartamento',     group: 'Casa' },
  { to: '/casamento',     icon: Gem,             label: 'Casamento',       group: 'Casa' },
  { to: '/metas',         icon: Target,          label: 'Metas',           group: 'Pessoal' },
  { to: '/compromissos',  icon: CalendarDays,    label: 'Compromissos',    group: 'Pessoal' },
  { to: '/pendencias',    icon: ClipboardList,   label: 'Pendências',      group: 'Pessoal' },
  { to: '/todo',         icon: ListTodo,        label: 'To-Do List',    group: 'Casa' },
  { to: '/vida-livre',   icon: FlameIcon,       label: 'Vida Livre',     group: 'Casal' },
  { to: '/agenda', icon: CalendarDays, label: 'Agenda', group: 'Casal' },
  { to: '/memorias', icon: Camera, label: 'Memórias', group: 'Casal' },
  { to: '/config',        icon: Settings,        label: 'Configurações',   group: '' },
]

// Bottom bar shows only top 5 for mobile
const BOTTOM_NAV = [
  { to: '/',             icon: LayoutDashboard, label: 'Home' },
  { to: '/transacoes',   icon: ArrowLeftRight,  label: 'Finanças' },
  { to: '/viagens',      icon: Globe,           label: 'Viagens' },
  { to: '/metas',        icon: Target,          label: 'Metas' },
  { to: '/menu',         icon: Menu,            label: 'Menu', isMenu: true },
]

const GROUPS = ['Finanças','Casal','Casa','Pessoal','']

export default function Layout() {
  const { signOut, user } = useAuth()
  const { settings } = useSettings()
  const [mobileMenu, setMobileMenu] = useState(false)
  const location = useLocation()

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-stone-100">
        <p className="font-display text-xl font-semibold text-stone-800 italic">Casal App</p>
        <p className="text-xs text-stone-400 mt-0.5 truncate">{settings?.couple_name || 'Nosso Casal'}</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {GROUPS.map(group => {
          const items = NAV.filter(n => n.group === group)
          if (!items.length) return null
          return (
            <div key={group} className="mb-4">
              {group && (
                <p className="text-xs font-medium text-stone-300 uppercase tracking-wider px-3 mb-1">{group}</p>
              )}
              {items.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} end={to === '/'}
                  onClick={() => setMobileMenu(false)}
                  className={({ isActive }) => `nav-item mb-0.5 ${isActive ? 'active' : ''}`}>
                  <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>

      <div className="p-3 border-t border-stone-100">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-700">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <p className="text-xs text-stone-400 truncate flex-1">{user?.email}</p>
          <button onClick={signOut} className="text-stone-300 hover:text-blush-500 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-stone-100 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile full-screen menu overlay */}
      {mobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenu(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-warm-lg">
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <p className="font-display text-lg font-semibold text-stone-800 italic">Menu</p>
              <button onClick={() => setMobileMenu(false)} className="btn-icon">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {GROUPS.map(group => {
                const items = NAV.filter(n => n.group === group)
                if (!items.length) return null
                return (
                  <div key={group} className="mb-4">
                    {group && <p className="text-xs font-medium text-stone-300 uppercase tracking-wider px-3 mb-1">{group}</p>}
                    {items.map(({ to, icon: Icon, label }) => (
                      <NavLink key={to} to={to} end={to === '/'}
                        onClick={() => setMobileMenu(false)}
                        className={({ isActive }) => `nav-item mb-0.5 ${isActive ? 'active' : ''}`}>
                        <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                        <span>{label}</span>
                      </NavLink>
                    ))}
                  </div>
                )
              })}
            </div>
            <div className="p-3 border-t border-stone-100">
              <button onClick={signOut} className="flex items-center gap-2 text-sm text-stone-400 hover:text-blush-500 px-3 py-2 w-full">
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </main>

        {/* Bottom nav - mobile only */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 z-40 safe-area-inset-bottom">
          <div className="flex">
            {BOTTOM_NAV.map(({ to, icon: Icon, label, isMenu }) => {
              if (isMenu) return (
                <button key="menu" onClick={() => setMobileMenu(true)}
                  className={`bottom-nav-item flex-1 ${mobileMenu ? 'text-amber-600' : ''}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                  <span className="text-xs">{label}</span>
                </button>
              )
              return (
                <NavLink key={to} to={to} end={to === '/'}
                  className={({ isActive }) => `bottom-nav-item flex-1 ${isActive ? 'active' : ''}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                  <span className="text-xs">{label}</span>
                </NavLink>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
