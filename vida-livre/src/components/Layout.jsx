import { motion } from 'framer-motion'
import { CalendarHeart, Heart, Wallet, ScrollText } from 'lucide-react'
import { MODULES } from '../lib/constants'
import { useActor } from '../contexts/ActorContext'
import SyncIndicator from './SyncIndicator'
import MobileBottomNav from './MobileBottomNav'

const ICONS = { CalendarHeart, Heart, Wallet, ScrollText }

export default function Layout({ active, onNavigate, children }) {
  const { actor, setActor, actors } = useActor()
  const activeMod = MODULES.find((m) => m.id === active)

  return (
    <div className="vl-app-shell flex min-h-[100dvh]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-[var(--color-vl-border)] bg-[var(--color-vl-surface)] p-4 md:flex">
        <div className="mb-6 px-2">
          <h1 className="text-lg font-semibold text-[var(--color-vl-text)]">Vida Livre</h1>
          <div className="mt-2 flex gap-1.5">
            {actors.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setActor(a.id)}
                className={`vl-pill ${actor === a.id ? 'vl-pill-active' : 'vl-pill-inactive'}`}
              >
                {a.nome}
              </button>
            ))}
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {MODULES.map((m) => {
            const Icon = ICONS[m.icon]
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onNavigate(m.id)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active === m.id
                    ? 'bg-[var(--color-vl-accent-soft)] text-[var(--color-vl-accent)]'
                    : 'text-[var(--color-vl-muted)] hover:bg-[var(--color-vl-elevated)] hover:text-[var(--color-vl-text)]'
                }`}
              >
                <Icon size={16} />
                {m.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-h-[100dvh] flex-1 flex-col md:ml-60">
        <header className="vl-mobile-header sticky top-0 z-30 md:hidden">
          <div className="flex items-center gap-3 px-4 pb-3 pt-safe">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl vl-tone-accent text-xs font-semibold">
              VL
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold leading-tight">{activeMod?.label}</h2>
              <div className="mt-0.5 flex gap-1">
                {actors.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setActor(a.id)}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${actor === a.id ? 'vl-tone-accent' : 'text-[var(--color-vl-muted)]'}`}
                  >
                    {a.nome}
                  </button>
                ))}
              </div>
            </div>
            <SyncIndicator />
          </div>
        </header>

        <header className="sticky top-0 z-20 hidden border-b border-[var(--color-vl-border)] bg-[var(--color-vl-bg)]/80 backdrop-blur-xl md:block">
          <div className="flex items-center justify-between px-6 py-3">
            <h2 className="text-lg font-semibold">{activeMod?.label}</h2>
            <SyncIndicator />
          </div>
        </header>

        <main className="vl-main-content flex-1 px-4 py-4 md:px-6 md:py-6">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            {children}
          </motion.div>
        </main>

        <MobileBottomNav active={active} icons={ICONS} onNavigate={onNavigate} />
      </div>
    </div>
  )
}
