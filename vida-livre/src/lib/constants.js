export const MODULES = [
  { id: 'regras', label: 'Regras', shortLabel: 'Regras', icon: 'ScrollText' },
  { id: 'mesada', label: 'Mesada', shortLabel: 'Mesada', icon: 'Wallet' },
  { id: 'pedidos', label: 'Pedidos', shortLabel: 'Pedidos', icon: 'Heart' },
  { id: 'agenda', label: 'Agenda', shortLabel: 'Agenda', icon: 'CalendarHeart' },
]

export const CONTEXTO = {
  comigo: { label: 'Comigo', desc: 'Com o marido — sai do saldo dele', className: 'vl-badge-info' },
  sozinha: { label: 'Sozinha', desc: 'Sozinha — sai da mesada dela', className: 'vl-badge-accent' },
  outro: { label: 'Com outro', desc: 'Com outra pessoa — sai da mesada dela', className: 'vl-badge-warm' },
}

export const LADO_LABEL = { marido: 'Saldo do marido', esposa: 'Mesada da esposa' }

export const REGRA_CATEGORIA = {
  permitido: { label: 'Permitido', className: 'vl-badge-success' },
  proibido: { label: 'Não permitido', className: 'vl-badge-danger' },
  liberdade: { label: 'Liberdade', className: 'vl-badge-info' },
  protocolo: { label: 'Protocolo', className: 'vl-badge-warning' },
}

export const PEDIDO_STATUS = {
  pendente: { label: 'Pendente', className: 'vl-badge-warning' },
  aprovado: { label: 'Aprovado', className: 'vl-badge-info' },
  negado: { label: 'Negado', className: 'vl-badge-danger' },
  disponivel: { label: 'Disponível', className: 'vl-badge-info' },
  resgatado: { label: 'Resgatado', className: 'vl-badge-accent' },
  realizado: { label: 'Realizado', className: 'vl-badge-success' },
}

export const PEDIDO_PRIORIDADE = {
  baixa: { label: 'Baixa', className: 'vl-badge-neutral' },
  media: { label: 'Média', className: 'vl-badge-warning' },
  alta: { label: 'Alta', className: 'vl-badge-warm' },
  urgente: { label: 'Urgente', className: 'vl-badge-danger' },
}

export const PEDIDO_PERIODICIDADE = {
  mensal: { label: 'Mensal' },
  semestral: { label: 'Semestral' },
  anual: { label: 'Anual' },
}

export const ENCONTRO_TIPO = {
  saida: { label: 'Saída' },
  date: { label: 'Date' },
}

export const ENCONTRO_STATUS = {
  planejado: { label: 'Planejado', className: 'vl-badge-info' },
  aconteceu: { label: 'Aprovado', className: 'vl-badge-warning' },
  realizado: { label: 'Realizado', className: 'vl-badge-success' },
  cancelado: { label: 'Cancelado', className: 'vl-badge-danger' },
}

export const PRESENTE_TIPO = {
  presente: { label: 'Presente' },
  pix: { label: 'Pix' },
}

// Conteúdo de referência — ritual combinado antes/durante/depois de um encontro.
// Absorvido da antiga página "Saídas" (planejamento), agora vive como referência
// estática dentro da Agenda, não como dado transacional.
export const RITUAL_ENCONTRO = {
  titulo: 'Ritual do encontro',
  intro: 'Sempre que ela tiver date, jantar, encontro ou saída — o combinado em três momentos.',
  fases: [
    { id: 'antes', titulo: 'Antes — preparar ela', itens: ['Dou banho nela', 'Arrumo ela', 'Preparo ela para o compromisso'] },
    { id: 'durante', titulo: 'Enquanto ela está fora', itens: ['Cuido de arrumar toda a casa', 'Estendo toalha', 'Arrumo a cama', 'Deixo pia e ambiente prontos'] },
    { id: 'depois', titulo: 'Quando ela chegar', itens: ['Dou banho nela', 'Limpo ela e seco'] },
  ],
}

export function fmtBRL(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

export function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}
