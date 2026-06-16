import { getState, insertItem, getCollection } from './storage'

export function getSaldoPontos() {
  return getCollection('pontos_historico').reduce((s, e) => s + (Number(e.pontos) || 0), 0)
}

export function registrarPontos({ tipo, titulo, pontos, marco_id, premio_id, por, nota }) {
  return insertItem('pontos_historico', {
    tipo,
    titulo,
    pontos: Number(pontos),
    marco_id: marco_id || null,
    premio_id: premio_id || null,
    por: por || null,
    nota: nota || null,
  })
}

export function conquistarMarco(marco, por, nota) {
  const user2 = getState().settings.user2
  registrarPontos({
    tipo: 'marco',
    titulo: marco.titulo,
    pontos: marco.pontos,
    marco_id: marco.id,
    por,
    nota,
  })
  insertItem('conquistas', {
    owner: user2,
    titulo: marco.titulo,
    descricao: nota || marco.descricao,
    data_conquista: new Date().toISOString().split('T')[0],
    categoria: marco.tipo === 'ousadia' ? 'ousadia' : 'pessoal',
    nivel: Math.min(5, marco.nivel || 1),
    emoji: marco.emoji || '🏆',
    marco_id: marco.id,
  })
}

export function resgatarPremio(premio, por) {
  const saldo = getSaldoPontos()
  if (saldo < premio.custo_pontos) {
    return { ok: false, error: 'Pontos insuficientes' }
  }
  const user2 = getState().settings.user2
  registrarPontos({
    tipo: 'resgate',
    titulo: `Resgate: ${premio.nome}`,
    pontos: -premio.custo_pontos,
    premio_id: premio.id,
    por,
  })
  insertItem('resgates', {
    premio_id: premio.id,
    premio_nome: premio.nome,
    custo: premio.custo_pontos,
    por,
  })
  insertItem('wishes', {
    owner: user2,
    title: `[Prêmio] ${premio.nome}`,
    description: premio.descricao || 'Resgatado com pontos de marcos',
    category: 'experiência',
    status: 'aprovado',
    priority: 'média',
    created_by: por,
    from_premio_id: premio.id,
  })
  return { ok: true }
}
