// Migração única: lê o blob JSONB do app antigo (tabela vl_couple_state, mesmo
// projeto Supabase) e insere nas tabelas relacionais novas (vl_*).
//
// Uso:
//   node scripts/migrate-from-old.mjs --dry-run   (só mostra o que faria, não escreve)
//   node scripts/migrate-from-old.mjs             (roda de verdade)
//
// Lê credenciais de .env.local (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
// VITE_COUPLE_EMAIL, VITE_COUPLE_PASSWORD) — as mesmas do app antigo (vida-livre-old/),
// mesmo projeto Supabase.

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const DRY_RUN = process.argv.includes('--dry-run')

function parseEnv(path) {
  const out = {}
  const text = readFileSync(path, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

const env = parseEnv(new URL('../.env.local', import.meta.url))
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function main() {
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: env.VITE_COUPLE_EMAIL,
    password: env.VITE_COUPLE_PASSWORD,
  })
  if (authErr) throw new Error(`Falha ao autenticar: ${authErr.message}`)

  const { data: row, error } = await supabase.from('vl_couple_state').select('data').eq('id', 'main').single()
  if (error) throw new Error(`Falha ao ler vl_couple_state: ${error.message}`)
  const state = row.data || {}
  const settings = state.settings || {}
  const nomeMarido = settings.user1 || 'Bruno'

  const report = { inserted: {}, skipped: {}, ambiguous: [] }
  const plannedInserts = { vl_regras: [], vl_saldo_config: [], vl_movimentos: [], vl_pedidos: [], vl_encontros: [] }

  // 1. Regras intro
  const regrasIntro = settings.regras_intro || ''

  // 2. combinados -> vl_regras
  for (const c of state.combinados || []) {
    plannedInserts.vl_regras.push({
      categoria: c.categoria, texto: c.texto, detalhes: c.detalhes || null,
      ativo: c.ativo !== false, revisado_em: c.revisado_em || null,
    })
  }

  // 3. settings.mesada -> vl_saldo_config (linha esposa); marido nasce zerado
  const mesada = settings.mesada || {}
  plannedInserts.vl_saldo_config.push({
    lado: 'esposa',
    credito_ciclo: mesada.credito_ciclo ?? 2000,
    saldo: mesada.saldo ?? 0,
    ultimo_credito_mes: mesada.ultimo_credito_mes || null,
    limites: mesada.limites || {},
  })

  // 4. mesada_movimentos -> vl_movimentos (sempre lado=esposa, sem contexto hoje -> 'sozinha' nos débitos)
  for (const m of state.mesada_movimentos || []) {
    plannedInserts.vl_movimentos.push({
      lado: 'esposa', tipo: m.tipo, valor: m.valor,
      contexto: m.tipo === 'debito' ? 'sozinha' : null,
      origem: 'manual', categoria: m.bucket || null, nota: m.nota || null,
      mes: m.mes || (m.created_at || '').slice(0, 7),
    })
  }

  // 5. mimos_fixos -> vl_pedidos (recorrente=true)
  for (const f of state.mimos_fixos || []) {
    plannedInserts.vl_pedidos.push({
      titulo: f.nome, categoria: f.categoria || null, valor: f.valor ?? null,
      contexto: f.contexto || 'sozinha', recorrente: true, periodicidade: f.periodicidade || 'mensal',
      status: 'disponivel', usado_mes: f.usado_mes || null, pago_mes: f.pago_mes || null,
      ativo: f.ativo !== false,
    })
  }

  // 6. mimos_variaveis + wishes -> vl_pedidos (recorrente=false)
  for (const v of state.mimos_variaveis || []) {
    const statusMap = { disponivel: 'disponivel', resgatado: 'resgatado', usado: 'realizado' }
    plannedInserts.vl_pedidos.push({
      titulo: v.nome, descricao: v.descricao || null, valor: v.valor ?? null,
      contexto: v.contexto || 'sozinha', recorrente: false,
      status: statusMap[v.status] || 'disponivel',
    })
  }
  for (const w of state.wishes || []) {
    plannedInserts.vl_pedidos.push({
      titulo: w.title, descricao: w.description || null, como: w.como || null,
      categoria: w.category || null, valor: w.estimated_cost ?? null,
      contexto: w.contexto || 'sozinha', recorrente: false,
      prioridade: w.priority === 'média' ? 'media' : (w.priority || 'media'),
      status: w.status || 'pendente', resposta: w.resposta || null,
    })
  }

  // 7. saidas -> vl_encontros (sem contexto hoje -> derivar; ambíguos ficam no relatório)
  for (const s of state.saidas || []) {
    let contexto
    if (s.tipo === 'date') contexto = 'outro'
    else if (s.com_quem && s.com_quem.trim().toLowerCase() === nomeMarido.trim().toLowerCase()) contexto = 'comigo'
    else contexto = 'sozinha'

    if (s.tipo === 'saida' && s.com_quem && contexto === 'sozinha') {
      report.ambiguous.push({ titulo: s.titulo, com_quem: s.com_quem, contexto_atribuido: contexto })
    }

    plannedInserts.vl_encontros.push({
      titulo: s.titulo, tipo: s.tipo, contexto, data: s.data || null, hora: s.hora || null,
      com_quem: s.com_quem || null, local: s.local || null, status: s.status || 'planejado',
      share: s.share || 'resumo', notas: s.notas || null,
    })
  }

  // Coleções não migradas (não usadas no app de 5 páginas atual)
  const skipKeys = ['fantasias', 'viagens', 'viagens_roteiro', 'viagens_mala', 'sim_categorias', 'sim_itens',
    'marcos', 'premios', 'pontos_historico', 'resgates', 'questionario', 'conquistas', 'objetivos',
    'registros', 'atividades', 'mimos_categorias', 'mimos_itens', 'acordo_itens', 'saida_templates']
  for (const key of skipKeys) {
    const count = (state[key] || []).length
    if (count > 0) report.skipped[key] = count
  }

  console.log('--- Plano de migração ---')
  console.log('vl_regras_intro: 1 linha (texto de', regrasIntro.length, 'caracteres)')
  for (const [table, rows] of Object.entries(plannedInserts)) {
    console.log(`${table}: ${rows.length} linhas`)
  }
  console.log('\n--- Coleções não migradas (não usadas no app atual) ---')
  console.log(report.skipped)
  console.log('\n--- Casos ambíguos de contexto em encontros (revisar depois) ---')
  console.log(report.ambiguous)
  console.log('\nAVISO: vl_saldo_config lado=marido nasce zerado — o app antigo nunca trackeou esse saldo.')

  if (DRY_RUN) {
    console.log('\n[dry-run] Nada foi escrito no banco.')
    return
  }

  await supabase.from('vl_regras_intro').update({ texto: regrasIntro }).eq('id', 'main')
  for (const [table, rows] of Object.entries(plannedInserts)) {
    if (!rows.length) continue
    if (table === 'vl_saldo_config') {
      for (const row of rows) {
        const { error: upErr } = await supabase.from(table).update(row).eq('lado', row.lado)
        if (upErr) throw new Error(`Falha ao atualizar ${table}: ${upErr.message}`)
      }
      report.inserted[table] = rows.length
      continue
    }
    const { error: insErr } = await supabase.from(table).insert(rows)
    if (insErr) throw new Error(`Falha ao inserir em ${table}: ${insErr.message}`)
    report.inserted[table] = rows.length
  }

  console.log('\n--- Migração concluída ---')
  console.log(report.inserted)
}

main().catch((err) => {
  console.error('ERRO:', err.message)
  process.exit(1)
})
