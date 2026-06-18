import { getCollection, getState, updateSettings, insertItem } from './storage'
import {
  MESADA_CREDITO_CICLO,
  MESADA_ORCAMENTO,
  FIXO_MESADA_BUCKET,
} from './constants'

export function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export function getMesadaLimites() {
  const saved = getState().settings?.mesada?.limites || {}
  return Object.fromEntries(
    Object.keys(MESADA_ORCAMENTO).map((key) => [
      key,
      Number(saved[key]) || MESADA_ORCAMENTO[key].limite,
    ])
  )
}

/** Metadados + limites editáveis (settings ou padrão) */
export function getMesadaOrcamento() {
  const limites = getMesadaLimites()
  return Object.fromEntries(
    Object.entries(MESADA_ORCAMENTO).map(([key, cfg]) => [
      key,
      { ...cfg, limite: limites[key] },
    ])
  )
}

export function getMesadaConfig() {
  const s = getState().settings?.mesada || {}
  return {
    credito_ciclo: Number(s.credito_ciclo) || MESADA_CREDITO_CICLO,
    saldo: Number(s.saldo ?? MESADA_CREDITO_CICLO),
    ultimo_credito_mes: s.ultimo_credito_mes ?? null,
    limites: getMesadaLimites(),
  }
}

export function saveMesadaSettings({ credito_ciclo, saldo, limites }) {
  const prev = getState().settings?.mesada || {}
  const nextLimites = limites
    ? { ...getMesadaLimites(), ...Object.fromEntries(Object.entries(limites).map(([k, v]) => [k, Number(v) || 0])) }
    : getMesadaLimites()
  updateSettings({
    mesada: {
      ...prev,
      credito_ciclo: Number(credito_ciclo ?? prev.credito_ciclo ?? MESADA_CREDITO_CICLO) || 0,
      saldo: Number(saldo ?? prev.saldo ?? MESADA_CREDITO_CICLO) || 0,
      ultimo_credito_mes: prev.ultimo_credito_mes ?? null,
      limites: nextLimites,
    },
  })
}

/** Força novo crédito mensal (útil se mudou valor ou esqueceu de creditar) */
export function forcarCreditoMes() {
  const prev = getState().settings?.mesada || {}
  const mesada = getMesadaConfig()
  const month = currentMonth()
  const novoSaldo = (Number(mesada.saldo) || 0) + (Number(mesada.credito_ciclo) || 0)
  updateSettings({
    mesada: {
      ...prev,
      ...mesada,
      saldo: novoSaldo,
      ultimo_credito_mes: month,
    },
  })
}

/** Credita no início de cada mês — acumulativo */
export function ensureMesadaCredit() {
  const month = currentMonth()
  const prev = getState().settings?.mesada || {}
  const mesada = getMesadaConfig()
  if (mesada.ultimo_credito_mes === month) return mesada

  const novoSaldo = (Number(mesada.saldo) || 0) + (Number(mesada.credito_ciclo) || 0)
  const next = {
    ...prev,
    ...mesada,
    saldo: novoSaldo,
    ultimo_credito_mes: month,
  }
  updateSettings({ mesada: next })
  return next
}

export function getGastosPorBucket(month = currentMonth()) {
  const orcamento = getMesadaOrcamento()
  const buckets = Object.fromEntries(Object.keys(orcamento).map((k) => [k, 0]))

  getCollection('mimos_fixos').forEach((f) => {
    if (f.usado_mes !== month || f.ativo === false) return
    if (f.contexto === 'comigo') return
    const bucket = f.mesada_bucket || FIXO_MESADA_BUCKET[f.categoria] || 'estetica'
    if (buckets[bucket] != null) buckets[bucket] += Number(f.valor) || 0
  })

  getCollection('wishes').forEach((w) => {
    if (w.status !== 'realizado') return
    if (w.contexto === 'comigo') return
    const when = (w.realizado_em || w.updated_at || w.created_at || '').slice(0, 7)
    if (when !== month) return
    const bucket = w.mesada_bucket || mapWishCategory(w.category)
    if (buckets[bucket] != null) buckets[bucket] += Number(w.estimated_cost) || 0
  })

  getCollection('mesada_movimentos').forEach((m) => {
    if (m.mes !== month || m.tipo !== 'debito') return
    const bucket = m.bucket || 'saida_livre'
    if (buckets[bucket] != null) buckets[bucket] += Number(m.valor) || 0
  })

  return buckets
}

function mapWishCategory(cat) {
  if (cat === 'roupa' || cat === 'beleza') return cat === 'roupa' ? 'looks' : 'estetica'
  if (cat === 'experiência') return 'dates'
  return 'saida_livre'
}

export function getMesadaResumo() {
  ensureMesadaCredit()
  const mesada = getMesadaConfig()
  const orcamento = getMesadaOrcamento()
  const month = currentMonth()
  const gastos = getGastosPorBucket(month)
  const totalReferencia = Object.values(orcamento).reduce((s, c) => s + c.limite, 0)
  const totalGastoMes = Object.values(gastos).reduce((s, v) => s + v, 0)

  return {
    mesada,
    month,
    gastos,
    totalReferencia,
    totalGastoMes,
    categorias: Object.entries(orcamento).map(([key, cfg]) => ({
      key,
      ...cfg,
      gasto: gastos[key] || 0,
      restante: Math.max(0, cfg.limite - (gastos[key] || 0)),
    })),
  }
}

export function registrarMovimento({ tipo, valor, bucket, nota, por }) {
  insertItem('mesada_movimentos', {
    tipo,
    valor: Number(valor) || 0,
    bucket: bucket || null,
    nota: nota || '',
    por,
    mes: currentMonth(),
    created_at: new Date().toISOString(),
  })

  if (tipo === 'debito') {
    const mesada = getMesadaConfig()
    updateSettings({
      mesada: { ...getState().settings?.mesada, ...mesada, saldo: Math.max(0, (mesada.saldo || 0) - (Number(valor) || 0)) },
    })
  }
  if (tipo === 'credito') {
    const mesada = getMesadaConfig()
    updateSettings({
      mesada: { ...getState().settings?.mesada, ...mesada, saldo: (mesada.saldo || 0) + (Number(valor) || 0) },
    })
  }
}
