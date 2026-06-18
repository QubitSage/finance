export const MODULES_HER = [
  { id: 'home', label: 'Meu espaço', icon: 'Home' },
  { id: 'agenda', label: 'Minha agenda', icon: 'CalendarHeart' },
  { id: 'registros', label: 'Meus registros', icon: 'BookOpen' },
  { id: 'mimos', label: 'Mimos & acordo', icon: 'Heart' },
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
  { id: 'mimos', label: 'Mimos & acordo', icon: 'Heart' },
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
