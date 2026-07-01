export const MODULES = [
  { id: 'regras', label: 'Regras', shortLabel: 'Regras', icon: 'ScrollText' },
  { id: 'mesada', label: 'Saldo de mesada', shortLabel: 'Mesada', icon: 'Wallet' },
  { id: 'saidas', label: 'Planejamento de Saídas', shortLabel: 'Saídas', icon: 'Shirt' },
  { id: 'mimos', label: 'Mimos', shortLabel: 'Mimos', icon: 'Heart' },
  { id: 'agenda', label: 'Agenda', shortLabel: 'Agenda', icon: 'CalendarHeart' },
]

export function getModulesForSession(isHer) {
  return MODULES.map((m) => ({
    ...m,
    showBadge: !isHer && m.id === 'mimos',
  }))
}

export function getMobileTabs(isHer) {
  return getModulesForSession(isHer).map((m) => ({
    ...m,
    label: m.shortLabel,
  }))
}
