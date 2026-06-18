import { MoreHorizontal } from 'lucide-react'
import { getMobilePrimaryTabs, isMobilePrimaryTab } from '../lib/views'

export default function MobileBottomNav({ active, isHer, pendingCount, icons, onNavigate, onOpenMore }) {
  const tabs = getMobilePrimaryTabs(isHer)
  const moreActive = !isMobilePrimaryTab(active, isHer)

  return (
    <nav
      className="vl-bottom-nav fixed inset-x-0 bottom-0 z-40 md:hidden"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {tabs.map((tab) => {
          const Icon = icons[tab.icon]
          const isActive = active === tab.id
          const badge = tab.showBadge && pendingCount > 0 ? pendingCount : null
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`vl-tab-btn relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 ${isActive ? 'vl-tab-btn-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="relative flex h-8 w-10 items-center justify-center">
                <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
                {badge != null && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </span>
              <span className="max-w-full truncate text-[10px] font-medium leading-tight">{tab.label}</span>
            </button>
          )
        })}
        <button
          type="button"
          onClick={onOpenMore}
          className={`vl-tab-btn flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 ${moreActive ? 'vl-tab-btn-active' : ''}`}
          aria-label="Mais opções"
        >
          <span className="flex h-8 w-10 items-center justify-center">
            <MoreHorizontal size={22} strokeWidth={moreActive ? 2.25 : 1.75} />
          </span>
          <span className="text-[10px] font-medium leading-tight">Mais</span>
        </button>
      </div>
    </nav>
  )
}
