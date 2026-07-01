import { supabase, ensureCloudAuth } from './supabase'
import { currentMonth } from './constants'

export function ladoFromContexto(contexto) {
  return contexto === 'comigo' ? 'marido' : 'esposa'
}

export async function getSaldoConfig() {
  await ensureCloudAuth()
  const { data, error } = await supabase.from('vl_saldo_config').select('*')
  if (error) throw error
  const byLado = Object.fromEntries((data || []).map((r) => [r.lado, r]))
  return { marido: byLado.marido, esposa: byLado.esposa }
}

/** Credita o crédito mensal no saldo dela, uma vez por mês (idempotente). */
export async function ensureCreditoMensal() {
  await ensureCloudAuth()
  const mes = currentMonth()
  const { data: esposa, error } = await supabase.from('vl_saldo_config').select('*').eq('lado', 'esposa').single()
  if (error) throw error
  if (esposa.ultimo_credito_mes === mes) return esposa

  const novoSaldo = Number(esposa.saldo) + Number(esposa.credito_ciclo)
  const { data: updated, error: updateErr } = await supabase
    .from('vl_saldo_config')
    .update({ saldo: novoSaldo, ultimo_credito_mes: mes })
    .eq('lado', 'esposa')
    .select()
    .single()
  if (updateErr) throw updateErr

  await supabase.from('vl_movimentos').insert({
    lado: 'esposa',
    tipo: 'credito',
    valor: esposa.credito_ciclo,
    origem: 'manual',
    categoria: 'credito_mensal',
    nota: 'Crédito mensal automático',
    mes,
  })

  return updated
}

/**
 * Registra um movimento no ledger e ajusta o saldo do lado correspondente.
 * `lado` é derivado de `contexto` quando não informado explicitamente.
 */
export async function registrarMovimento({
  contexto, lado, tipo, valor, origem, origem_id, categoria, nota, registrado_por,
}) {
  await ensureCloudAuth()
  const ladoFinal = lado || ladoFromContexto(contexto)
  const mes = currentMonth()

  const { data: cfg, error: cfgErr } = await supabase.from('vl_saldo_config').select('*').eq('lado', ladoFinal).single()
  if (cfgErr) throw cfgErr

  const delta = tipo === 'credito' ? Number(valor) : -Number(valor)
  const novoSaldo = Number(cfg.saldo) + delta

  const { error: updateErr } = await supabase.from('vl_saldo_config').update({ saldo: novoSaldo }).eq('lado', ladoFinal)
  if (updateErr) throw updateErr

  const { data: mov, error: movErr } = await supabase.from('vl_movimentos').insert({
    lado: ladoFinal, tipo, valor, contexto, origem, origem_id, categoria, nota, registrado_por, mes,
  }).select().single()
  if (movErr) throw movErr

  return mov
}

export async function getMovimentos({ lado, limit = 50 } = {}) {
  await ensureCloudAuth()
  let query = supabase.from('vl_movimentos').select('*').order('created_at', { ascending: false }).limit(limit)
  if (lado) query = query.eq('lado', lado)
  const { data, error } = await query
  if (error) throw error
  return data || []
}
