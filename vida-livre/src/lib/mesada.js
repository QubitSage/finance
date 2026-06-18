import { getCollection, getState, updateSettings, insertItem } from './storage'
import {
  MESADA_CREDITO_CICLO,
  MESADA_ORCAMENTO,
  FIXO_MESADA_BUCKET,
} from './constants'

export function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export function getMesadaConfig() {
  const s = getState().settings?.mesada || {}
  return {
    credito_ciclo: s.credito_ciclo ?? MESADA_CREDITO_CICLO,
    saldo: s.saldo ?? MESADA_CREDITO_CICLO,
    ultimo_credito_mes: s.ultimo_credito_mes ?? null,
  }
}

/** Credita R$2.000 no início de cada mês — acumulativo */
export function ensureMesadaCredit() {
  const month = currentMonth()
  const mesada = getMesadaConfig()
  if (mesada.ultimo_credito_mes === month) return mesada

  const novoSaldo = (Number(mesada.saldo) || 0) + mesada.credito_ciclo
  const next = {
    ...mesada,
    saldo: novoSaldo,
    ultimo_credito_mes: month,
  }
  updateSettings({ mesada: next })
  return next
}

export function getGastosPorBucket(month = currentMonth()) {
  const buckets = Object.fromEntries(Object.keys(MESADA_ORCAMENTO).map((k) => [k, 0]))

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
  const month = currentMonth()
  const gastos = getGastosPorBucket(month)
  const totalReferencia = Object.values(MESADA_ORCAMENTO).reduce((s, c) => s + c.limite, 0)
  const totalGastoMes = Object.values(gastos).reduce((s, v) => s + v, 0)

  return {
    mesada,
    month,
    gastos,
    totalReferencia,
    totalGastoMes,
    categorias: Object.entries(MESADA_ORCAMENTO).map(([key, cfg]) => ({
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
      mesada: { ...mesada, saldo: Math.max(0, (mesada.saldo || 0) - (Number(valor) || 0)) },
    })
  }
  if (tipo === 'credito') {
    const mesada = getMesadaConfig()
    updateSettings({
      mesada: { ...mesada, saldo: (mesada.saldo || 0) + (Number(valor) || 0) },
    })
  }
}
