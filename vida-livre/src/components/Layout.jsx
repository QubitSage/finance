import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, CalendarHeart, BookOpen, Sparkles, Heart,
  Star, Map, Wallet, Gift, Lock, Menu, X, LogOut, Trophy, ScrollText, Globe, Bell, HelpCircle,
} from 'lucide-react'
import { getModulesForSession } from '../lib/views'
import { useSession } from '../contexts/SessionContext'
import { subscribe } from '../lib/storage'
import { getPartnerPendingCount } from '../lib/pendencias'
import SyncIndicator from './SyncIndicator'

const ICONS = {
  Home, CalendarHeart, BookOpen, Sparkles, Heart,
  Star, Map, Wallet, Gift, Trophy, ScrollText, Globe, Bell, HelpCircle,
}

export default function Layout({ active, onNavigate, children }) {
  const { sessionUser, isHer, user2, logout } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [, tick] = useState(0)
  const modules = getModulesForSession(isHer)
  const activeMod = modules.find((m) => m.id === active)
  const pendingCount = !isHer ? getPartnerPendingCount(user2) : 0

  useEffect(() => subscribe(() => tick((n) => n + 1)), [])

  const handleLogout = () => {
    logout()
    menuOpen && setMenuOpen(false)
  }

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-[var(--color-vl-border)] bg-[var(--color-vl-surface)] p-4 md:flex">
        <div className="mb-6 px-2">
          <h1 className="bg-gradient-to-r from-fuchsia-300 to-violet-300 bg-clip-text text-lg font-bold text-transparent">
            Vida Livre
          </h1>
          <p className="mt-1 text-sm font-medium text-fuchsia-200/90">{sessionUser}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-vl-muted)]">
            <Lock size={10} /> {isHer ? 'Seu espaço privado' : 'Painel do parceiro'}
          </p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {modules.map((m) => {
            const Icon = ICONS[m.icon]
            const badge = m.id === 'pendencias' && pendingCount > 0 ? pendingCount : null
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onNavigate(m.id)}
                className={`relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active === m.id
                    ? 'bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 text-fuchsia-200'
                    : 'text-[var(--color-vl-muted)] hover:bg-[var(--color-vl-elevated)] hover:text-[var(--color-vl-text)]'
                }`}
              >
                <Icon size={16} />
                {m.label}
                {badge != null && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
        <button type="button" onClick={handleLogout} className="vl-btn-ghost mt-4 w-full text-xs">
          <LogOut size={14} /> Trocar usuário
        </button>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:ml-60">
        <header className="sticky top-0 z-20 border-b border-[var(--color-vl-border)] bg-[var(--color-vl-bg)]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <div>
              <h2 className="text-base font-semibold md:text-lg">{activeMod?.label}</h2>
              <p className="text-xs text-[var(--color-vl-muted)] md:hidden">{sessionUser}</p>
            </div>
            <div className="flex items-center gap-2">
              <SyncIndicator />
              <button type="button" className="vl-btn-icon hidden md:flex" onClick={handleLogout} title="Trocar usuário">
                <LogOut size={16} />
              </button>
              <button type="button" className="vl-btn-icon md:hidden" onClick={() => setMenuOpen(true)} aria-label="Menu">
                <Menu size={18} />
              </button>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 no-scrollbar md:hidden">
            {modules.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onNavigate(m.id)}
                className={`vl-pill ${active === m.id ? 'vl-pill-active' : 'vl-pill-inactive'}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${sessionUser}-${active}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-[var(--color-vl-border)] bg-[var(--color-vl-surface)] p-4 md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold">{sessionUser}</span>
                <button type="button" className="vl-btn-icon" onClick={() => setMenuOpen(false)}><X size={16} /></button>
              </div>
              <nav className="flex-1 space-y-0.5 overflow-y-auto">
                {modules.map((m) => {
                  const Icon = ICONS[m.icon]
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { onNavigate(m.id); setMenuOpen(false) }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm ${
                        active === m.id ? 'bg-fuchsia-500/20 text-fuchsia-200' : 'text-[var(--color-vl-muted)]'
                      }`}
                    >
                      <Icon size={16} /> {m.label}
                    </button>
                  )
                })}
              </nav>
              <button type="button" onClick={handleLogout} className="vl-btn-ghost mt-4 w-full text-xs">
                <LogOut size={14} /> Trocar usuário
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
