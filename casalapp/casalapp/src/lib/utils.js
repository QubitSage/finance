export const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

export const fmtDate = (d) => {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

export const monthKey = (d = new Date()) => d.toISOString().slice(0, 7)

export const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

export const monthLabel = (k) => {
  if (!k) return ''
  const [y, m] = k.split('-')
  return `${MONTHS_PT[+m - 1]} ${y}`
}

export const TX_CATEGORIES = {
  work:     { label: 'Trabalho',        color: '#3B82F6', bg: 'bg-blue-50',   text: 'text-blue-700' },
  personal: { label: 'Pessoal',         color: '#8B5CF6', bg: 'bg-violet-50', text: 'text-violet-700' },
  wife:     { label: 'Mimos da esposa', color: '#EC4899', bg: 'bg-pink-50',   text: 'text-pink-700' },
  savings:  { label: 'Poupança',        color: '#22C55E', bg: 'bg-green-50',  text: 'text-green-700' },
  company:  { label: 'Empresa',         color: '#F59E0B', bg: 'bg-amber-50',  text: 'text-amber-700' },
}

export const RULE_CATEGORIES = {
  permitido:       { label: 'Permitido',         color: 'bg-sage-100 text-sage-700',   dot: 'bg-sage-400',   icon: '✓' },
  proibido:        { label: 'Proibido',           color: 'bg-blush-100 text-blush-700', dot: 'bg-blush-400',  icon: '✕' },
  liberdade:       { label: 'Liberdade',          color: 'bg-blue-50 text-blue-700',    dot: 'bg-blue-400',   icon: '◎' },
  direitos:        { label: 'Direitos',           color: 'bg-amber-100 text-amber-800', dot: 'bg-amber-400',  icon: '★' },
  responsabilidade:{ label: 'Responsabilidade',   color: 'bg-violet-50 text-violet-700',dot: 'bg-violet-400', icon: '⚑' },
  legendas:        { label: 'Dever',           color: 'bg-teal-50 text-teal-700',    dot: 'bg-teal-400',   icon: '◈' },
  gostaria:        { label: 'Gostaria',           color: 'bg-pink-50 text-pink-700',    dot: 'bg-pink-400',   icon: '♡' },
}

export const TRIP_STATUS = {
  interesse:  { label: 'Interesse',  cls: 'bg-blue-50 text-blue-700' },
  planejando: { label: 'Planejando', cls: 'bg-amber-50 text-amber-700' },
  concluido:  { label: 'Concluído',  cls: 'bg-sage-100 text-sage-700' },
  cancelado:  { label: 'Cancelado',  cls: 'bg-blush-100 text-blush-700' },
}

export const TRIP_CATS = ['Sozinha','Acompanhada','Com o marido','Em família','Lua de mel','Comemoração','Feriado']

export const MARKET_PRIORITY = {
  Essencial:   'bg-sage-100 text-sage-700',
  Importante:  'bg-blue-50 text-blue-700',
  Extra:       'bg-violet-50 text-violet-700',
  Doce:        'bg-pink-50 text-pink-700',
}
export const MARKET_STATUS = {
  Comprar:      'bg-amber-50 text-amber-700',
  'Não precisa':'bg-stone-100 text-stone-500',
  Comprado:     'bg-sage-100 text-sage-700',
  Estragou:     'bg-blush-100 text-blush-700',
}

export const APT_STATUS = {
  Desejado:    'bg-violet-50 text-violet-700',
  Pesquisando: 'bg-amber-50 text-amber-700',
  Orçado:      'bg-blue-50 text-blue-700',
  Comprado:    'bg-sage-100 text-sage-700',
  Entregue:    'bg-sage-100 text-sage-800',
}

export const GOAL_STATUS = {
  'Em andamento': 'bg-amber-50 text-amber-700',
  'Concluída':    'bg-sage-100 text-sage-700',
  'Pausada':      'bg-stone-100 text-stone-500',
  'Cancelada':    'bg-blush-100 text-blush-700',
}

export const WHO_COLORS = {
  Bruno:  'bg-blue-50 text-blue-700',
  Vianka: 'bg-pink-50 text-pink-700',
  Ambos:  'bg-sage-100 text-sage-700',
}

export const PLANNER_COLS = ['atividade','companhia','visual','desejo','comunicacao','aprovacao']
export const PLANNER_COL_LABELS = {
  atividade:   'Atividade Principal',
  companhia:   'Companhia',
  visual:      'Visual',
  desejo:      'Desejo',
  comunicacao: 'Comunicação',
  aprovacao:   'Aprovação',
}
export const PLANNER_COL_COLORS = {
  atividade:   'bg-blue-50 text-blue-800',
  companhia:   'bg-violet-50 text-violet-800',
  visual:      'bg-pink-50 text-pink-800',
  desejo:      'bg-amber-50 text-amber-800',
  comunicacao: 'bg-sage-100 text-sage-800',
  aprovacao:   'bg-stone-100 text-stone-700',
}

export const DAYS_OF_WEEK = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo']
export const DAYS_SHORT    = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']

export function genTimeSlots() {
  const slots = []
  for (let h = 7; h <= 23; h++) {
    slots.push(`${String(h).padStart(2,'0')}:00`)
    if (h < 23) slots.push(`${String(h).padStart(2,'0')}:30`)
  }
  return slots
}
