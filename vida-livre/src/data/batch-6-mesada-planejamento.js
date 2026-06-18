/** Mesada acumulativa + viés de planejamento */
export const BATCH_6_ID = 'batch-6-mesada-planejamento'

export const BATCH_6_COMBINADOS = [
  {
    categoria: 'liberdade',
    texto: 'Mesada de R$2.000 — acumulativa, no ritmo dela.',
    detalhes: 'Crédito por ciclo mensal. O que não gastar, acumula. Referência: Estética R$500 · Looks R$600 · Dates R$500 · Saídas livres R$400.',
  },
  {
    categoria: 'protocolo',
    texto: 'Transporte planejado não desconta; última hora desconta da mesada.',
    detalhes: 'Translado não planejado: Bruno paga. Resto da manutenção: combinar (pergunta em aberto).',
  },
  {
    categoria: 'protocolo',
    texto: 'Looks com outra pessoa ou sozinha → mesada. Com marido → não desconta, só avisar.',
    detalhes: 'Registrar no site quando sair do saldo dela.',
  },
  {
    categoria: 'liberdade',
    texto: 'Prioridade: ela sai sozinha ou acompanhada — marido em segundo plano.',
    detalhes: 'Sem culpa, com carinho e transparência.',
  },
  {
    categoria: 'protocolo',
    texto: 'Sobra pro marido: apenas axila no final do dia.',
    detalhes: 'Combinado fixo do casal.',
  },
]

export const BATCH_6_QUESTIONARIO = [
  {
    pergunta: 'O que você quer dizer com manutenção? (Translado: eu pago quando não planejado · você paga o resto)',
    categoria: 'planejamento',
    anonimo: false,
  },
  {
    pergunta: 'Looks sem mim: sai do seu saldo + registro no site. Comigo: como prefere me avisar?',
    categoria: 'planejamento',
    anonimo: false,
  },
  {
    pergunta: 'Você pretende priorizar sair sozinha / sem mim / dates — ou mais saídas em casal?',
    categoria: 'planejamento',
    anonimo: false,
  },
]

export const BATCH_6_SETTINGS = {
  mimos_renda: '2000',
  mesada: {
    credito_ciclo: 2000,
    saldo: 2000,
    ultimo_credito_mes: null,
  },
}
