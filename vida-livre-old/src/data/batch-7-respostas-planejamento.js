/** Respostas dela às perguntas de planejamento */
export const BATCH_7_ID = 'batch-7-respostas-planejamento'

export const BATCH_7_COMBINADOS = [
  {
    categoria: 'liberdade',
    texto: 'Agenda: preferência por sair sozinha e ter dates.',
    detalhes: 'Sair com o marido só se ela quiser — avisa bem antes. Sem pressão.',
  },
  {
    categoria: 'protocolo',
    texto: 'Manutenção = estética.',
    detalhes: 'Salão, unha, pé, cílios, depilação, limpeza de pele — bucket Estética (R$500). Translado não planejado: Bruno paga.',
  },
  {
    categoria: 'protocolo',
    texto: 'Saída em casal: só quando ela quiser, com aviso prévio.',
    detalhes: 'Pelo app ou mensagem, bem antes. Prioridade continua sendo sozinha e dates.',
  },
]

export const BATCH_7_QUESTIONARIO_PATCHES = [
  {
    match: 'manutenção',
    resposta: 'Manutenção é estética — salão, unha, pé, cílios, depilação e cuidados do bucket Estética. Translado não planejado você paga; o resto eu pago da mesada.',
  },
  {
    match: 'priorizar sair',
    resposta: 'Prefiro sair sozinha e ter dates. Sair com você só se eu quiser — aviso bem antes.',
  },
  {
    match: 'Comigo: como prefere',
    resposta: 'Aviso bem antes pelo app ou mensagem. Saída em casal só quando eu quiser; prioridade é sozinha e dates.',
  },
]
