export const MODULES_HER = [
  { id: 'home', label: 'Meu espaço', icon: 'Home' },
  { id: 'planejamento', label: 'Planejamento', icon: 'Wallet' },
  { id: 'agenda', label: 'Minha agenda', icon: 'CalendarHeart' },
  { id: 'registros', label: 'Meus registros', icon: 'BookOpen' },
  { id: 'mimos', label: 'Mimos & acordo', icon: 'Heart' },
  { id: 'em-aberto', label: 'Combinados', icon: 'HelpCircle' },
  { id: 'fantasias', label: 'Minhas fantasias', icon: 'Sparkles' },
  { id: 'recompensas', label: 'Meus marcos', icon: 'Trophy' },
  { id: 'ela', label: 'Minhas conquistas', icon: 'Star' },
  { id: 'regras', label: 'Nossas regras', icon: 'ScrollText' },
  { id: 'objetivos', label: 'Nossa visão', icon: 'Map' },
  { id: 'viagens', label: 'Viagens & gastos', icon: 'Globe' },
]

export const MODULES_PARTNER = [
  { id: 'home', label: 'Painel', icon: 'Home' },
  { id: 'pendencias', label: 'Pendências', icon: 'Bell' },
  { id: 'planejamento', label: 'Planejamento', icon: 'Wallet' },
  { id: 'mimos', label: 'Mimos & acordo', icon: 'Heart' },
  { id: 'em-aberto', label: 'Combinados', icon: 'HelpCircle' },
  { id: 'recompensas', label: 'Marcos & prêmios', icon: 'Trophy' },
  { id: 'agenda', label: 'Agenda dela', icon: 'CalendarHeart' },
  { id: 'regras', label: 'Regras', icon: 'ScrollText' },
  { id: 'objetivos', label: 'Nossa visão', icon: 'Map' },
  { id: 'viagens', label: 'Viagens & gastos', icon: 'Globe' },
  { id: 'sim-mimos', label: 'Sim. mimos', icon: 'Gift' },
]

export function getModulesForSession(isHer) {
  return isHer ? MODULES_HER : MODULES_PARTNER
}

/** Abas principais no mobile — resto fica em “Mais” */
export const MOBILE_PRIMARY_HER = [
  { id: 'home', label: 'Início', icon: 'Home' },
  { id: 'planejamento', label: 'Plano', icon: 'Wallet' },
  { id: 'agenda', label: 'Agenda', icon: 'CalendarHeart' },
  { id: 'mimos', label: 'Mimos', icon: 'Heart' },
]

export const MOBILE_PRIMARY_PARTNER = [
  { id: 'home', label: 'Início', icon: 'Home' },
  { id: 'pendencias', label: 'Pendências', icon: 'Bell', showBadge: true },
  { id: 'planejamento', label: 'Plano', icon: 'Wallet' },
  { id: 'mimos', label: 'Mimos', icon: 'Heart' },
]

export function getMobilePrimaryTabs(isHer) {
  return isHer ? MOBILE_PRIMARY_HER : MOBILE_PRIMARY_PARTNER
}

export function getMobileMoreModules(isHer) {
  const primary = new Set(getMobilePrimaryTabs(isHer).map((m) => m.id))
  return getModulesForSession(isHer).filter((m) => !primary.has(m.id))
}

export function isMobilePrimaryTab(active, isHer) {
  return getMobilePrimaryTabs(isHer).some((m) => m.id === active)
}
