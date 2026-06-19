import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarHeart, Heart, Wallet, Lock, LogOut, ScrollText, Shirt,
} from 'lucide-react'
import { getModulesForSession } from '../lib/views'
import { useSession } from '../contexts/SessionContext'
import { subscribe } from '../lib/storage'
import { getPartnerPendingCount } from '../lib/pendencias'
import SyncIndicator from './SyncIndicator'
import MobileBottomNav from './MobileBottomNav'

const ICONS = {
  CalendarHeart, Heart, Wallet, ScrollText, Shirt,
}

export default function Layout({ active, onNavigate, children }) {
  const { sessionUser, isHer, user2, logout } = useSession()
  const [, tick] = useState(0)
  const modules = getModulesForSession(isHer)
  const activeMod = modules.find((m) => m.id === active)
  const pendingCount = !isHer ? getPartnerPendingCount(user2) : 0

  useEffect(() => subscribe(() => tick((n) => n + 1)), [])

  return (
    <div className="vl-app-shell flex min-h-[100dvh]">
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
            const badge = m.showBadge && pendingCount > 0 ? pendingCount : null
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
        <button type="button" onClick={logout} className="vl-btn-ghost mt-4 w-full text-xs">
          <LogOut size={14} /> Trocar usuário
        </button>
      </aside>

      <div className="flex min-h-[100dvh] flex-1 flex-col md:ml-60">
        <header className="vl-mobile-header sticky top-0 z-30 md:hidden">
          <div className="flex items-center gap-3 px-4 pb-3 pt-safe">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-violet-500/20 text-xs font-bold text-fuchsia-200 ring-1 ring-fuchsia-500/20">
              VL
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold leading-tight">{activeMod?.label}</h2>
              <p className="truncate text-[11px] text-[var(--color-vl-muted)]">{sessionUser}</p>
            </div>
            <SyncIndicator />
          </div>
        </header>

        <header className="sticky top-0 z-20 hidden border-b border-[var(--color-vl-border)] bg-[var(--color-vl-bg)]/80 backdrop-blur-xl md:block">
          <div className="flex items-center justify-between px-6 py-3">
            <h2 className="text-lg font-semibold">{activeMod?.label}</h2>
            <div className="flex items-center gap-2">
              <SyncIndicator />
              <button type="button" className="vl-btn-icon" onClick={logout} title="Trocar usuário">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        <main className="vl-main-content flex-1 px-4 py-4 md:px-6 md:py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${sessionUser}-${active}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <MobileBottomNav
          active={active}
          isHer={isHer}
          pendingCount={pendingCount}
          icons={ICONS}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  )
}
