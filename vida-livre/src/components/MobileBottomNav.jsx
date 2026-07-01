import { MODULES } from '../lib/constants'

export default function MobileBottomNav({ active, icons, onNavigate }) {
  return (
    <nav className="vl-bottom-nav fixed inset-x-0 bottom-0 z-40 md:hidden" aria-label="Navegação principal">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-0.5 pt-1">
        {MODULES.map((m) => {
          const Icon = icons[m.icon]
          const isActive = active === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onNavigate(m.id)}
              className={`vl-tab-btn relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-1 ${isActive ? 'vl-tab-btn-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="relative flex h-8 w-9 items-center justify-center">
                <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
              </span>
              <span className="max-w-full truncate text-[11px] font-medium leading-tight">{m.shortLabel}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
