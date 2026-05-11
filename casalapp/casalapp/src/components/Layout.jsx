import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSettings } from '../hooks/useSettings'
import {
  LayoutDashboard, ArrowLeftRight, Heart, PiggyBank, BarChart2,
  Globe, Sparkles, HelpCircle, User, ShoppingCart, Home,
  Gem, CalendarDays, Target, ClipboardList, Settings, LogOut, Menu, X, Table2, ListTodo, Flame as FlameIcon,
  Camera, Moon, Sun, Users,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const NAV = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard',       group: 'Finanças' },
  { to: '/financas',      icon: ArrowLeftRight,  label: 'Finanças',        group: 'Finanças' },
  { to: '/relatorios',    icon: BarChart2,        label: 'Relatórios',      group: 'Finanças' },
  { to: '/planilha',      icon: Table2,           label: 'Planilha',        group: 'Finanças' },
  { to: '/viagens',       icon: Globe,            label: 'Viagens',         group: 'Casal' },
  { to: '/casamento',     icon: Gem,              label: 'Casamento',       group: 'Casal' },
  { to: '/vida-livre',    icon: FlameIcon,        label: 'Vida Livre',      group: 'Casal' },
  { to: '/dados',         icon: User,             label: 'Dados',           group: 'Casa' },
  { to: '/mercado',       icon: ShoppingCart,     label: 'Mercado',         group: 'Casa' },
  { to: '/apartamento',   icon: Home,             label: 'Apartamento',     group: 'Casa' },
  { to: '/pendencias',    icon: ListTodo,         label: 'Pendências',      group: 'Casa' },
  { to: '/config',        icon: Settings,         label: 'Configurações',   group: '' },
]

// Bottom bar shows only top 5 for mobile
const BOTTOM_NAV = [
  { to: '/',             icon: LayoutDashboard, label: 'Home' },
  { to: '/financas',     icon: ArrowLeftRight,  label: 'Finanças' },
  { to: '/viagens',      icon: Globe,           label: 'Viagens' },
  { to: '/pendencias',   icon: ListTodo,        label: 'Pendências' },
  { to: '/menu',         icon: Menu,            label: 'Menu', isMenu: true },
]

const GROUPS = ['Finanças','Casal','Casa','']

export default function Layout() {
  const { signOut, user } = useAuth()
  const { settings } = useSettings()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  useEffect(() => {
    if (dark) { document.documentElement.classList.add('dark'); localStorage.setItem('theme','dark') }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme','light') }
  }, [dark])


  return (
    <div className="flex min-h-screen w-full max-w-full bg-stone-50 dark:bg-stone-900 overflow-x-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 bg-white dark:bg-stone-800 border-r border-stone-100 dark:border-stone-700 flex-col py-6 px-3 fixed inset-y-0">
        <div className="px-3 mb-8">
          <h1 className="text-lg font-display font-bold text-stone-800 dark:text-stone-100">💑 CasalApp</h1>
          {settings?.user1_name && settings?.user2_name && (
            <p className="text-xs text-stone-400 mt-0.5">{settings.user1_name} & {settings.user2_name}</p>
          )}
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto">
          {GROUPS.map(group => {
            const groupItems = NAV.filter(n => n.group === group)
            if (!groupItems.length) return null
            return (
              <div key={group}>
                {group && <p className="text-xs font-semibold text-stone-300 uppercase tracking-wider px-3 mb-1">{group}</p>}
                {groupItems.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to} end={to === '/'}
                    className={({ isActive }) => 'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ' + (isActive ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700')}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>
        <button onClick={() => setDark(d => !d)} className="flex items-center gap-2 px-3 py-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm transition-colors mb-1">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {dark ? 'Modo claro' : 'Modo escuro'}
        </button>
        <button onClick={signOut} className="flex items-center gap-2 px-3 py-2 text-stone-400 hover:text-rose-500 text-sm transition-colors">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </aside>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60" onClick={() => setMenuOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-stone-800 flex flex-col py-6 px-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-stone-800 dark:text-stone-100">Menu</h2>
              <button onClick={() => setMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>
            <nav className="flex-1 space-y-5">
              {GROUPS.map(group => {
                const groupItems = NAV.filter(n => n.group === group)
                if (!groupItems.length) return null
                return (
                  <div key={group}>
                    {group && <p className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">{group}</p>}
                    {groupItems.map(({ to, icon: Icon, label }) => (
                      <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}
                        className={({ isActive }) => 'flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm transition-colors ' + (isActive ? 'bg-stone-900 dark:bg-stone-700 text-white' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700')}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{label}</span>
                      </NavLink>
                    ))}
                  </div>
                )
              })}
            </nav>
          <button onClick={() => setDark(d => !d)} className="flex items-center gap-2 py-2 px-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? 'Modo claro' : 'Modo escuro'}
          </button>
            <button onClick={signOut} className="flex items-center gap-2 py-2 px-3 text-stone-400 hover:text-rose-500 text-sm mt-4">
              <LogOut className="w-4 h-4" /> Sair da conta
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 w-full md:ml-56 dark:text-stone-100 pb-24 md:pb-0 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-800 border-t border-stone-100 dark:border-stone-700 flex items-center z-40 pb-safe">
        {BOTTOM_NAV.map(({ to, icon: Icon, label, isMenu }) => {
          if (isMenu) return (
            <button key="menu" onClick={() => setMenuOpen(true)} className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-stone-400">
              <Menu className="w-5 h-5" />
              <span className="text-[10px]">{label}</span>
            </button>
          )
          return (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => 'flex-1 flex flex-col items-center gap-0.5 py-3 min-h-[56px] transition-colors ' + (isActive ? 'text-stone-900' : 'text-stone-400 dark:text-stone-500')}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
