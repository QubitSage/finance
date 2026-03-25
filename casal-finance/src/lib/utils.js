export const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

export const fmtShort = (v) => {
  const n = Math.abs(v || 0)
  if (n >= 1000) return `R$ ${(n / 1000).toFixed(1)}k`
  return fmt(v)
}

export const CATEGORIES = {
  work:     { label: 'Trabalho',        color: 'bg-blue-50 text-blue-700',   dot: 'bg-blue-400' },
  personal: { label: 'Pessoal',         color: 'bg-purple-50 text-purple-700', dot: 'bg-purple-400' },
  wife:     { label: 'Mimos da esposa', color: 'bg-rose-50 text-rose-700',   dot: 'bg-rose-400' },
  savings:  { label: 'Poupança',        color: 'bg-green-50 text-green-700', dot: 'bg-green-400' },
  company:  { label: 'Empresa',         color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400' },
}

export const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

export const monthLabel = (yyyymm) => {
  if (!yyyymm) return ''
  const [y, m] = yyyymm.split('-')
  return `${MONTHS_PT[parseInt(m) - 1]} ${y}`
}
