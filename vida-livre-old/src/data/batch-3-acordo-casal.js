/** Acordo do casal — batch.md (valores da Vianka prevalecem) */
export const BATCH_3_ID = 'batch-3-acordo-casal'

export const BATCH_3_MIMOS_FIXOS = [
  { nome: 'Unha', valor: 120, periodicidade: 'mensal', categoria: 'unhas', ordem: 0 },
  { nome: 'Pé', valor: 70, periodicidade: 'mensal', categoria: 'unhas', ordem: 1 },
  { nome: 'Depilação', valor: 70, periodicidade: 'mensal', categoria: 'corpo', ordem: 2 },
  { nome: 'Cílios', valor: 130, periodicidade: 'mensal', categoria: 'rosto', ordem: 3 },
  { nome: 'Sobrancelha', valor: 50, periodicidade: 'mensal', categoria: 'rosto', ordem: 4 },
  { nome: 'Class Pass', valor: 190, periodicidade: 'mensal', categoria: 'fitness', ordem: 5, nota: 'Academia quero voltar 🙌🏼' },
  { nome: 'Academia', valor: 130, periodicidade: 'mensal', categoria: 'fitness', ordem: 6 },
  { nome: 'Limpeza de pele', valor: 200, periodicidade: 'semestral', categoria: 'rosto', ordem: 7 },
  { nome: 'Cortar cabelo no Sam', valor: 250, periodicidade: 'semestral', categoria: 'cabelo', ordem: 8 },
  { nome: 'Botox', valor: 600, periodicidade: 'anual', categoria: 'rosto', ordem: 9, nota: 'Média de R$ 600' },
]

export const BATCH_3_WISHES = [
  { title: 'Óculos', category: 'pessoal', priority: 'média', estimated_cost: null },
  { title: 'Calcinha e sutiã', category: 'roupa', priority: 'média', estimated_cost: null },
]

export const BATCH_3_ACORDO = [
  { tipo: 'obrigacao', texto: 'Cuidar da casa', ordem: 0 },
  { tipo: 'obrigacao', texto: 'Trabalhar', ordem: 1 },
  { tipo: 'obrigacao', texto: 'Arrumar a casa pra ela', ordem: 2 },
  { tipo: 'obrigacao', texto: 'Buscar pão (quando der)', ordem: 3 },
  { tipo: 'obrigacao', texto: 'Mimar ela', ordem: 4 },
  { tipo: 'obrigacao', texto: 'Liberar ela', ordem: 5 },
  { tipo: 'entrega', texto: 'Axila', ordem: 0, detalhes: 'Sobra pro marido: apenas axila no final do dia.' },
]

export const BATCH_3_PROTOCOLO = [
  {
    categoria: 'protocolo',
    texto: 'Fotos da axila quando der.',
    detalhes: 'Eu amo ver e imaginar você saindo, suando, e me dando depois que voltar.',
  },
  {
    categoria: 'protocolo',
    texto: 'Ao pedir mimos, pix, dates e afins — conte o que vai rolar.',
    detalhes: 'Como quer que seja, pra que quer o mimo, o plano. Transparência com carinho.',
  },
]

export const BATCH_3_SAIDA_TEMPLATES = [
  {
    titulo: 'Look 1 — Renda branca',
    roupa: 'Vestido de renda, lingerie branca | Sapato branco novo | Bolsa nova',
    mimos: 'Salão, Maquiagem e Unha pra ficar bem gata e desejável',
    ordem: 0,
  },
  {
    titulo: 'Look 2 — Verde',
    roupa: 'Vestido verde, sem sutiã e sem calcinha | Rasteirinha marrom e bolsa marrom',
    mimos: 'Salão, Maquiagem e Unha pra ficar bem gata e desejável',
    ordem: 1,
  },
  {
    titulo: 'Look 3 — Marrom',
    roupa: 'Vestido marrom, lingerie por baixo | Sapato marrom e bolsa combinando',
    mimos: 'Salão, Maquiagem e Unha pra ficar bem gata e desejável',
    ordem: 2,
  },
]

export const BATCH_3_SAIDA_NOTAS = {
  saida_extra_nota: 'Se necessitar de algum mimo a mais, dou com prazer.',
  saida_pos_nota: 'Muito sexo pós saída',
}

export const BATCH_3_MANIFESTO = {
  titulo: 'Nosso Manifesto',
  conteudo: `noivar
Casar
Nosso apto
Apto funcional pra nós
Viver em paz no interior
Trabalhar e fazer dinheiro com propósito
Paz

Daqui uns 6 anos nos preparar pra partir e morar em um lugar de 1° mundo.
Enquanto isso, viajar, conhecer lugares — de preferência os que queremos morar no futuro.

Morar em casa sem muro, com grama verde, quintal fofo e talvez um pet prático.

Depois pensar em filhos.`,
  cor: 'violet',
  emoji: '🗺️',
  ordem: 0,
}

/** Marcos: 3 orgulhos atuais + catálogo + ousadias */
export const BATCH_3_MARCOS = [
  {
    titulo: 'Primeira saída de carro sozinha',
    descricao: 'Ida e volta no carro, sozinha.',
    emoji: '🚗',
    nivel: 2,
    pontos: 25,
    recompensa_sugerida: 'Jantar ou programa que ela escolhe',
    tipo: 'conquista',
    status: 'conquistado',
    ordem: 0,
  },
  {
    titulo: 'Voltou tarde — primeira vez',
    descricao: 'Voltou tarde no combinado.',
    emoji: '🌙',
    nivel: 3,
    pontos: 15,
    recompensa_sugerida: 'Carta, flores ou noite só dela',
    tipo: 'conquista',
    status: 'conquistado',
    ordem: 1,
  },
  {
    titulo: 'Pediu o primeiro date',
    descricao: 'Teve iniciativa de dizer que quer date — ainda não realizou, mas isso conta.',
    emoji: '💌',
    nivel: 1,
    pontos: 10,
    recompensa_sugerida: 'Mimo pequeno + mensagem calorosa',
    tipo: 'conquista',
    status: 'conquistado',
    ordem: 2,
  },
  {
    titulo: 'Primeiro date realizado',
    descricao: 'O date que ela pediu finalmente aconteceu.',
    emoji: '💕',
    nivel: 4,
    pontos: 50,
    recompensa_sugerida: 'Recompensa maior combinada antes',
    tipo: 'conquista',
    status: 'pendente',
    ordem: 3,
  },
  {
    titulo: 'Contou como foi',
    descricao: 'Compartilhou resumo ou registro do que viveu.',
    emoji: '💬',
    nivel: 1,
    pontos: 10,
    recompensa_sugerida: 'Elogio sincero + registro em Conquistas',
    tipo: 'conquista',
    status: 'pendente',
    ordem: 4,
  },
  {
    titulo: 'Segunda saída sozinha',
    descricao: 'Repetiu a autonomia — consolidando confiança.',
    emoji: '✨',
    nivel: 5,
    pontos: 20,
    recompensa_sugerida: 'Pontos acumulam para prêmio grande',
    tipo: 'conquista',
    status: 'pendente',
    ordem: 5,
  },
  {
    titulo: 'Segundo date',
    descricao: 'Mais um passo na exploração com segurança.',
    emoji: '🌸',
    nivel: 5,
    pontos: 30,
    recompensa_sugerida: 'Experiência especial a dois ou mimo grande',
    tipo: 'conquista',
    status: 'pendente',
    ordem: 6,
  },
  {
    titulo: 'Ousadia: Instagram',
    descricao: 'Foi provocativa no que combinamos — e isso excita.',
    emoji: '🔥',
    nivel: 3,
    pontos: 30,
    recompensa_sugerida: 'Prêmio à escolha — celebra a ousadia',
    tipo: 'ousadia',
    status: 'pendente',
    ordem: 10,
    regra_ref: 'Instagram proibido',
  },
  {
    titulo: 'Ousadia: saiu com amigo sem avisar',
    descricao: 'Provocou cruzando o combinado de amigos/conhecidos.',
    emoji: '😈',
    nivel: 4,
    pontos: 35,
    recompensa_sugerida: 'Mimo ou pix especial',
    tipo: 'ousadia',
    status: 'pendente',
    ordem: 11,
    regra_ref: 'Amigos/conhecidos sem Bruno',
  },
  {
    titulo: 'Ousadia: limite físico',
    descricao: 'Cruzou um limite físico combinado — provocação que gera prêmio.',
    emoji: '💋',
    nivel: 5,
    pontos: 40,
    recompensa_sugerida: 'Recompensa intensa combinada',
    tipo: 'ousadia',
    status: 'pendente',
    ordem: 12,
    regra_ref: 'Sexo oral / penetração / dormir fora',
  },
  {
    titulo: 'Ousadia: escondido contado depois',
    descricao: 'Fez algo escondido e contou no combinado — ousadia com honestidade.',
    emoji: '🎭',
    nivel: 3,
    pontos: 25,
    recompensa_sugerida: 'Celebração + mimo',
    tipo: 'ousadia',
    status: 'pendente',
    ordem: 13,
    regra_ref: 'Date/encontro/mimo escondido',
  },
]

export const BATCH_3_PREMIOS = [
  { nome: 'Carta + flores', descricao: 'Reconhecimento simbólico e carinhoso', emoji: '💐', custo_pontos: 15, ordem: 0 },
  { nome: 'Mimo médio', descricao: 'Algo da lista de desejos dela', emoji: '💝', custo_pontos: 30, ordem: 1 },
  { nome: 'Spa / autocuidado', descricao: 'Massagem, manicure ou dia de spa', emoji: '🧖‍♀️', custo_pontos: 40, ordem: 2 },
  { nome: 'Jantar especial', descricao: 'Ela escolhe o restaurante', emoji: '🍽️', custo_pontos: 50, ordem: 3 },
  { nome: 'Passeio fim de semana', descricao: 'Viagem curta ou programa especial', emoji: '✈️', custo_pontos: 100, ordem: 4 },
  { nome: 'Prêmio ousadia', descricao: 'Para quando ela foi provocativa de propósito', emoji: '🔥', custo_pontos: 35, ordem: 5 },
]

/** Itens de simulação de mimos — orçamento mensal fixo */
export const BATCH_3_SIM_MIMOS = {
  renda: '760',
  categorias: [
    {
      cat: { nome: 'Mensal fixo', emoji: '💝', cor: 'rose', ordem: 0 },
      itens: [
        { nome: 'Unha', valor: 120 },
        { nome: 'Pé', valor: 70 },
        { nome: 'Depilação', valor: 70 },
        { nome: 'Cílios', valor: 130 },
        { nome: 'Sobrancelha', valor: 50 },
        { nome: 'Class Pass', valor: 190 },
        { nome: 'Academia', valor: 130 },
      ],
    },
    {
      cat: { nome: 'Semestral (÷6)', emoji: '💄', cor: 'green', ordem: 1 },
      itens: [
        { nome: 'Limpeza de pele', valor: 33 },
        { nome: 'Cabelo no Sam', valor: 42 },
      ],
    },
    {
      cat: { nome: 'Anual (÷12)', emoji: '✨', cor: 'violet', ordem: 2 },
      itens: [{ nome: 'Botox', valor: 50 }],
    },
    {
      cat: { nome: 'Por saída', emoji: '🍽️', cor: 'amber', ordem: 3 },
      itens: [
        { nome: 'Salão + Maquiagem + Unha', valor: 0, nota: 'Quando sair' },
      ],
    },
  ],
}
