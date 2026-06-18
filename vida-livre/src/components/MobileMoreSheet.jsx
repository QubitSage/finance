import { motion, AnimatePresence } from 'framer-motion'
import { X, LogOut, Lock } from 'lucide-react'
import { getMobileMoreModules } from '../lib/views'
import SyncIndicator from './SyncIndicator'

export default function MobileMoreSheet({
  open,
  onClose,
  active,
  isHer,
  sessionUser,
  pendingCount,
  icons,
  onNavigate,
  onLogout,
}) {
  const modules = getMobileMoreModules(isHer)

  const go = (id) => {
    onNavigate(id)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-[1.75rem] border border-b-0 border-[var(--color-vl-border)] bg-[var(--color-vl-surface)] shadow-2xl shadow-black/50 md:hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 380 }}
            role="dialog"
            aria-modal="true"
            aria-label="Mais opções"
          >
            <div className="flex shrink-0 items-center justify-center py-3">
              <span className="h-1 w-10 rounded-full bg-[var(--color-vl-border)]" />
            </div>

            <div className="flex items-start justify-between gap-3 px-5 pb-3">
              <div>
                <p className="text-lg font-bold text-fuchsia-200">Mais</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-vl-muted)]">
                  <Lock size={10} /> {sessionUser} · {isHer ? 'seu espaço' : 'painel'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <SyncIndicator />
                <button type="button" onClick={onClose} className="vl-btn-icon" aria-label="Fechar">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
              <div className="grid grid-cols-3 gap-2">
                {modules.map((m) => {
                  const Icon = icons[m.icon]
                  const isActive = active === m.id
                  const badge = m.id === 'pendencias' && pendingCount > 0 ? pendingCount : null
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => go(m.id)}
                      className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all active:scale-[0.97] ${
                        isActive
                          ? 'border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-200'
                          : 'border-[var(--color-vl-border)] bg-[var(--color-vl-elevated)] text-[var(--color-vl-muted)]'
                      }`}
                    >
                      {badge != null && (
                        <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                          {badge}
                        </span>
                      )}
                      <Icon size={22} />
                      <span className="line-clamp-2 text-[11px] font-medium leading-tight">{m.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="shrink-0 border-t border-[var(--color-vl-border)] p-4 pb-safe">
              <button type="button" onClick={onLogout} className="vl-btn-ghost w-full text-sm">
                <LogOut size={16} /> Trocar usuário
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
