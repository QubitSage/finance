export const PARTNER_ACCESS_CODE = '160497'
export const HER_ACCESS_CODE = '220696'

export function resolveUserFromCode(code, user1, user2) {
  const digits = String(code).replace(/\D/g, '')
  if (digits === HER_ACCESS_CODE) return user2
  if (digits === PARTNER_ACCESS_CODE) return user1
  return null
}

export const STATUS_SAIDA = {
  planejado: { label: 'Planejado', className: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  aconteceu: { label: 'Aprovado', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  realizado: { label: 'Realizado', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  cancelado: { label: 'Cancelado', className: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
}

export const TIPO_AGENDA = {
  saida: { label: 'Saída', emoji: '🚗', desc: 'Sair sozinha ou acompanhada — prioridade dela', className: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  date: { label: 'Date', emoji: '💕', desc: 'Encontro romântico com alguém', className: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
}

export const MIMO_VARIAVEL_STATUS = {
  disponivel: { label: 'Disponível', className: 'bg-cyan-500/15 text-cyan-300' },
  resgatado: { label: 'Resgatado', className: 'bg-violet-500/15 text-violet-300' },
  usado: { label: 'Usado', className: 'bg-emerald-500/15 text-emerald-300' },
}

export const SHARE_NIVEL = {
  contou: { label: 'Contou tudo' },
  resumo: { label: 'Resumo' },
  privado: { label: 'Privado' },
}

export const CAT_COMBINADO = {
  permitido: { label: 'Permitido', dot: 'bg-emerald-400' },
  proibido: { label: 'Proibido', dot: 'bg-rose-400' },
  liberdade: { label: 'Liberdade', dot: 'bg-cyan-400' },
  protocolo: { label: 'Protocolo', dot: 'bg-amber-400' },
}

export const CAT_FANTASIA = {
  casal: { label: 'A dois', className: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
  livre: { label: 'Vida livre', className: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  viagem: { label: 'Em viagem', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  novo: { label: 'Novo', className: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
}

export const Q_CATS = ['planejamento', 'desejo', 'limite', 'fantasia', 'sentimento', 'combinado', 'outro']

export const OBJ_CORES = {
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400', title: 'text-amber-200' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', dot: 'bg-violet-400', title: 'text-violet-200' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', dot: 'bg-rose-400', title: 'text-rose-200' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'bg-blue-400', title: 'text-blue-200' },
  teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', dot: 'bg-teal-400', title: 'text-teal-200' },
  green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400', title: 'text-emerald-200' },
}

export const OBJ_EMOJIS = ['🌟', '🗺️', '💑', '🏠', '✈️', '💰', '🌸', '🔥', '💎', '🎯']

export const SIM_CORES = {
  blue: { dot: 'bg-blue-400', header: 'text-blue-300' },
  green: { dot: 'bg-emerald-400', header: 'text-emerald-300' },
  rose: { dot: 'bg-rose-400', header: 'text-rose-300' },
  violet: { dot: 'bg-violet-400', header: 'text-violet-300' },
  amber: { dot: 'bg-amber-400', header: 'text-amber-300' },
  teal: { dot: 'bg-teal-400', header: 'text-teal-300' },
  stone: { dot: 'bg-stone-400', header: 'text-stone-300' },
}

export const SIM_SEED = [
  { cat: { nome: 'Moradia', emoji: '🏠', cor: 'blue', ordem: 0 }, itens: ['Aluguel', 'Condomínio', 'IPTU', 'Energia', 'Água e Esgoto', 'Gás', 'Internet e Wi-Fi', 'Streaming'] },
  { cat: { nome: 'Supermercado', emoji: '🛒', cor: 'green', ordem: 1 }, itens: ['Alimentação', 'Higiene e Limpeza'] },
  { cat: { nome: 'Saúde', emoji: '💊', cor: 'rose', ordem: 2 }, itens: ['Plano de Saúde', 'Farmácia'] },
  { cat: { nome: 'Telefone', emoji: '📱', cor: 'violet', ordem: 3 }, itens: ['Plano Individual / Familiar'] },
  { cat: { nome: 'Pet', emoji: '🐾', cor: 'amber', ordem: 4 }, itens: ['Ração', 'Veterinário'] },
  { cat: { nome: 'Transporte', emoji: '🚗', cor: 'teal', ordem: 5 }, itens: ['Combustível ou Apps', 'Seguro Auto e IPVA', 'Manutenção do Veículo'] },
  { cat: { nome: 'Estilo de Vida e Futuro', emoji: '🎯', cor: 'stone', ordem: 6 }, itens: ['Lazer e Jantares', 'Academia e Cuidados Pessoais', 'Reserva de Emergência', 'Fundo Casamento / Viagens'] },
]

export const MIMOS_SEED = [
  { cat: { nome: 'Mimos', emoji: '💝', cor: 'rose', ordem: 0 }, itens: [] },
  { cat: { nome: 'Saídas', emoji: '🍽️', cor: 'amber', ordem: 1 }, itens: [] },
  { cat: { nome: 'Encontros', emoji: '💕', cor: 'violet', ordem: 2 }, itens: [] },
  { cat: { nome: 'Desejos', emoji: '⭐', cor: 'teal', ordem: 3 }, itens: [] },
  { cat: { nome: 'Estéticas', emoji: '💄', cor: 'green', ordem: 4 }, itens: [] },
]

export const MANIFESTO_INICIAL = `noivar
Casar
Nosso apto
Apto funcional pra nós
Viver em paz no interior
Trabalhar e fazer dinheiro com propósito
Paz

Daqui uns 6 anos nos preparar pra partir e morar em um lugar de 1° mundo.
Enquanto isso, viajar, conhecer lugares — de preferência os que queremos morar no futuro.

Morar em casa sem muro, com grama verde, quintal fofo e talvez um pet prático.

Depois pensar em filhos.`

export const REGRAS_INTRO_DEFAULT = `Este é o nosso acordo — vivo, revisado com carinho e respeito ao ritmo de cada um.

Princípios:
• Comunicação honesta, sem pressa
• Ela define o ritmo dos passos
• Celebramos cada conquista, por menor que seja
• Privacidade é sagrada — o que é privado, fica privado`

export const MARCO_TIPO = {
  conquista: { label: 'Conquista', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  ousadia: { label: 'Ousadia', className: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30' },
}

export const MIMO_PERIODICIDADE = {
  mensal: { label: 'Mensal', className: 'bg-rose-500/15 text-rose-300' },
  semestral: { label: 'Semestral', className: 'bg-violet-500/15 text-violet-300' },
  anual: { label: 'Anual', className: 'bg-blue-500/15 text-blue-300' },
  saida: { label: 'Por saída', className: 'bg-amber-500/15 text-amber-300' },
}

export const MIMO_CATEGORIA = {
  unhas: 'Unhas & pé',
  rosto: 'Rosto',
  corpo: 'Corpo',
  cabelo: 'Cabelo',
  fitness: 'Fitness',
  roupa: 'Roupa',
  outro: 'Outro',
}

/** Legenda de contexto dos mimos — Sozinha vs Comigo */
export const MIMO_CONTEXTO = {
  sozinha: {
    label: 'Sozinha',
    short: 'Sozinha / acompanhada',
    desc: 'Ela sozinha ou acompanhada de alguém. O mimo é para ela ou para além do casal.',
    mesada: 'Desconta da mesada dela',
    emoji: '🌙',
    className: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  },
  comigo: {
    label: 'Comigo',
    short: 'Comigo / nós',
    desc: 'Para o marido, para o trabalho ou para nós — usa junto ou no dia a dia do casal.',
    mesada: 'Não desconta da mesada — só avisar aqui',
    emoji: '💑',
    className: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  },
}

/** Mesada acumulativa — referência de alocação mensal (total R$2.000) */
export const MESADA_CREDITO_CICLO = 2000

export const MESADA_ORCAMENTO = {
  estetica: {
    label: 'Estética',
    desc: 'Salão, manutenção, unha, pé, cílios e derivados',
    limite: 500,
    emoji: '💅',
    className: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    bar: 'bg-rose-400',
  },
  looks: {
    label: 'Looks',
    desc: 'Roupas, sapatos, vestidos e derivados',
    limite: 600,
    emoji: '👗',
    className: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
    bar: 'bg-fuchsia-400',
  },
  dates: {
    label: 'Dates & jantares',
    desc: 'Até 2–3×/mês — ele paga só o seu',
    limite: 500,
    emoji: '💕',
    className: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    bar: 'bg-pink-400',
  },
  saida_livre: {
    label: 'Saídas livres',
    desc: 'Imprevistos e última hora',
    limite: 400,
    emoji: '🚗',
    className: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    bar: 'bg-cyan-400',
  },
}

/** Mapeia categoria de mimo fixo → bucket da mesada */
export const FIXO_MESADA_BUCKET = {
  unhas: 'estetica',
  rosto: 'estetica',
  corpo: 'estetica',
  cabelo: 'estetica',
  fitness: 'estetica',
  roupa: 'looks',
  outro: 'saida_livre',
}

/** Viés de planejamento — regras acordadas */
export const VIES_PLANEJAMENTO = [
  {
    id: 'agenda',
    titulo: 'Agenda & saídas',
    emoji: '📅',
    regra: 'Preferência por sair sozinha e ter dates. Sair com o marido só se ela quiser — avisa bem antes, sem pressão.',
    status: 'ativo',
  },
  {
    id: 'transporte',
    titulo: 'Transporte / translado',
    emoji: '🚕',
    regra: 'Planejado → não desconta da mesada. Escondido, sem planejamento ou de última hora → desconta do saldo dela. Translado não planejado: Bruno paga.',
    status: 'ativo',
  },
  {
    id: 'manutencao',
    titulo: 'Manutenção',
    emoji: '💅',
    regra: 'Manutenção = estética (salão, unha, pé, cílios, depilação, limpeza de pele…). Entra no bucket Estética da mesada (R$500).',
    status: 'ativo',
  },
  {
    id: 'looks',
    titulo: 'Looks & mimos',
    emoji: '👗',
    regra: 'Sozinha ou com outra pessoa → desconta da mesada. Com o marido → não desconta; avisa bem antes pelo app ou mensagem.',
    status: 'ativo',
  },
  {
    id: 'mesada',
    titulo: 'Mesada',
    emoji: '💳',
    regra: 'R$2.000 de crédito por ciclo. Usa no ritmo dela. O que sobrar acumula — não perde.',
    status: 'ativo',
  },
  {
    id: 'marido',
    titulo: 'Sobra pro marido',
    emoji: '💫',
    regra: 'Apenas axila no final do dia.',
    status: 'ativo',
  },
]

/** Respostas firmadas — combinado do casal */
export const VIES_ACORDOS_RESPONDIDOS = [
  {
    id: 'prioridade_saidas',
    titulo: 'Agenda & saídas',
    emoji: '📅',
    pergunta: 'Priorizar sozinha, dates ou saídas em casal?',
    resposta: 'Prefere sair sozinha e ter dates. Sair comigo só se ela quiser — avisa bem antes.',
  },
  {
    id: 'translado_manutencao',
    titulo: 'Manutenção',
    emoji: '💅',
    pergunta: 'O que é manutenção?',
    resposta: 'Manutenção é estética — salão, unha, pé, cílios, depilação e cuidados do bucket Estética. Translado não planejado: Bruno paga; o resto sai da mesada dela.',
  },
  {
    id: 'looks_sem_mim',
    titulo: 'Looks & saídas com marido',
    emoji: '💑',
    pergunta: 'Como avisar quando for comigo?',
    resposta: 'Avisa bem antes — pelo app ou mensagem. Saída em casal só quando ela quiser; prioridade é sozinha e dates.',
  },
]

export const PROXIMOS_PASSOS = [
  { emoji: '💬', titulo: 'Bot no WhatsApp', desc: 'Organizar gastos e custos no dia a dia', status: 'em_breve' },
]

export const ACORDO_TIPO = {
  obrigacao: { label: 'Minhas obrigações', icon: '✅' },
  entrega: { label: 'Ela me entrega', icon: '💫' },
}

export const VIAGEM_STATUS = {
  sonho: { label: 'Sonho', className: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  planejando: { label: 'Planejando', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  confirmada: { label: 'Confirmada', className: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  realizada: { label: 'Realizada', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  cancelada: { label: 'Cancelada', className: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
}

export const VIAGEM_TIPO = {
  casal: 'A dois',
  grupo: 'Em grupo',
  solo: 'Solo',
  familia: 'Família',
}

export const ROTEIRO_CATS = {
  atração: { emoji: '🏛️', className: 'bg-blue-500/15 text-blue-300' },
  restaurante: { emoji: '🍽️', className: 'bg-orange-500/15 text-orange-300' },
  hotel: { emoji: '🏨', className: 'bg-violet-500/15 text-violet-300' },
  transporte: { emoji: '🚗', className: 'bg-cyan-500/15 text-cyan-300' },
  passeio: { emoji: '🌿', className: 'bg-emerald-500/15 text-emerald-300' },
  compras: { emoji: '🛍️', className: 'bg-pink-500/15 text-pink-300' },
  outros: { emoji: '📌', className: 'bg-stone-500/15 text-stone-300' },
}

export const MALA_CATS = {
  roupas: '👕',
  calcados: '👟',
  higiene: '🧴',
  documentos: '📄',
  eletronicos: '💻',
  medicamentos: '💊',
  outros: '🎒',
}

export const MARCO_NIVEL = {
  1: { label: 'Coragem', className: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  2: { label: 'Autonomia', className: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  3: { label: 'Confiança', className: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  4: { label: 'Exploração', className: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30' },
  5: { label: 'Consolidação', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
}

export const MARCO_SEED = [
  { titulo: 'Pediu o primeiro date', descricao: 'Ela se abriu e pediu — mesmo sem ter acontecido ainda, isso conta.', emoji: '💌', nivel: 1, pontos: 10, recompensa_sugerida: 'Mimo pequeno + mensagem calorosa', ordem: 0 },
  { titulo: 'Primeira saída de carro sozinha', descricao: 'Ida e volta no carro, sozinha.', emoji: '🚗', nivel: 2, pontos: 25, recompensa_sugerida: 'Jantar ou programa que ela escolhe', ordem: 1 },
  { titulo: 'Voltou tarde no combinado', descricao: 'Respeitou o combinado de horário e comunicação.', emoji: '🌙', nivel: 3, pontos: 15, recompensa_sugerida: 'Carta, flores ou noite só dela', ordem: 2 },
  { titulo: 'Contou como foi', descricao: 'Compartilhou resumo ou registro do que viveu.', emoji: '💬', nivel: 1, pontos: 10, recompensa_sugerida: 'Elogio sincero + registro em Conquistas', ordem: 3 },
  { titulo: 'Primeiro date realizado', descricao: 'O date que ela pediu finalmente aconteceu.', emoji: '💕', nivel: 4, pontos: 50, recompensa_sugerida: 'Recompensa maior combinada antes (passeio, presente)', ordem: 4 },
  { titulo: 'Segunda saída sozinha', descricao: 'Repetiu a autonomia — consolidando confiança.', emoji: '✨', nivel: 5, pontos: 20, recompensa_sugerida: 'Pontos acumulam para prêmio grande', ordem: 5 },
  { titulo: 'Segundo date', descricao: 'Mais um passo na exploração com segurança.', emoji: '🌸', nivel: 5, pontos: 30, recompensa_sugerida: 'Experiência especial a dois ou mimo grande', ordem: 6 },
]

export const PREMIO_SEED = [
  { nome: 'Carta + flores', descricao: 'Reconhecimento simbólico e carinhoso', emoji: '💐', custo_pontos: 15, ordem: 0 },
  { nome: 'Mimo médio', descricao: 'Algo da lista de desejos dela', emoji: '💝', custo_pontos: 30, ordem: 1 },
  { nome: 'Spa / autocuidado', descricao: 'Massagem, manicure ou dia de spa', emoji: '🧖‍♀️', custo_pontos: 40, ordem: 2 },
  { nome: 'Jantar especial', descricao: 'Ela escolhe o restaurante', emoji: '🍽️', custo_pontos: 50, ordem: 3 },
  { nome: 'Passeio fim de semana', descricao: 'Viagem curta ou programa especial', emoji: '✈️', custo_pontos: 100, ordem: 4 },
]

export const MODULES = [
  { id: 'home', label: 'Início', icon: 'Home' },
  { id: 'recompensas', label: 'Marcos', icon: 'Trophy' },
  { id: 'agenda', label: 'Agenda', icon: 'CalendarHeart' },
  { id: 'registros', label: 'Registros', icon: 'BookOpen' },
  { id: 'combinados', label: 'Combinados', icon: 'ShieldCheck' },
  { id: 'fantasias', label: 'Fantasias', icon: 'Sparkles' },
  { id: 'mimos', label: 'Mimos', icon: 'Heart' },
  { id: 'ela', label: 'Ela', icon: 'Star' },
  { id: 'objetivos', label: 'Objetivos', icon: 'Map' },
  { id: 'viagens', label: 'Viagens & gastos', icon: 'Globe' },
  { id: 'sim-mimos', label: 'Sim. Mimos', icon: 'Gift' },
]

export function fmtBRL(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}
