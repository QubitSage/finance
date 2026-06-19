import { getMobileTabs } from '../lib/views'

export default function MobileBottomNav({ active, isHer, pendingCount, icons, onNavigate }) {
  const tabs = getMobileTabs(isHer)

  return (
    <nav
      className="vl-bottom-nav fixed inset-x-0 bottom-0 z-40 md:hidden"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-0.5 pt-1">
        {tabs.map((tab) => {
          const Icon = icons[tab.icon]
          const isActive = active === tab.id
          const badge = tab.showBadge && pendingCount > 0 ? pendingCount : null
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`vl-tab-btn relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-1 ${isActive ? 'vl-tab-btn-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="relative flex h-8 w-9 items-center justify-center">
                <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
                {badge != null && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </span>
              <span className="max-w-full truncate text-[9px] font-medium leading-tight">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
