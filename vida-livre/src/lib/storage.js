const STORAGE_KEY = 'vida-livre-v1'

const DEFAULT_STATE = {
  saidas: [],
  registros: [],
  combinados: [],
  fantasias: [],
  wishes: [],
  questionario: [],
  conquistas: [],
  objetivos: [],
  sim_categorias: [],
  sim_itens: [],
  mimos_categorias: [],
  mimos_itens: [],
  marcos: [],
  premios: [],
  pontos_historico: [],
  resgates: [],
  mimos_fixos: [],
  acordo_itens: [],
  saida_templates: [],
  viagens: [],
  viagens_roteiro: [],
  viagens_mala: [],
  mimos_variaveis: [],
  atividades: [],
  settings: {
    user1: 'Bruno',
    user2: 'Vianka',
    activeUser: 'Bruno',
    sessionUser: null,
    regras_intro: '',
    renda: '',
    mimos_renda: '',
    saida_extra_nota: '',
    saida_pos_nota: '',
    imported_batches: [],
    activity_seen_at: {},
  },
}

let cache = null
const listeners = new Set()
const persistHooks = new Set()
const cloudListeners = new Set()

export function onLocalPersist(fn) {
  persistHooks.add(fn)
  return () => persistHooks.delete(fn)
}

export function onCloudStatus(fn) {
  cloudListeners.add(fn)
  return () => cloudListeners.delete(fn)
}

export function notifyCloudListeners(event) {
  cloudListeners.forEach((fn) => fn(event))
}

export function stateForCloud() {
  const state = load()
  const { sessionUser, activeUser, ...sharedSettings } = state.settings || {}
  return { ...state, settings: { ...sharedSettings, sessionUser: null, activeUser: sharedSettings.user1 || 'Bruno' } }
}

export function hydrateFromCloud(remoteState) {
  const local = load()
  const merged = {
    ...DEFAULT_STATE,
    ...remoteState,
    settings: {
      ...DEFAULT_STATE.settings,
      ...(remoteState.settings || {}),
      sessionUser: local.settings?.sessionUser ?? null,
      activeUser: local.settings?.activeUser ?? remoteState.settings?.activeUser ?? 'Bruno',
    },
  }
  cache = merged
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  listeners.forEach((fn) => fn(cache))
}

function load() {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    cache = raw ? { ...DEFAULT_STATE, ...JSON.parse(raw), settings: { ...DEFAULT_STATE.settings, ...(JSON.parse(raw).settings || {}) } } : structuredClone(DEFAULT_STATE)
  } catch {
    cache = structuredClone(DEFAULT_STATE)
  }
  return cache
}

function save(next) {
  cache = next
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  listeners.forEach((fn) => fn(cache))
  persistHooks.forEach((fn) => fn())
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getState() {
  return load()
}

export function updateSettings(patch) {
  const state = load()
  save({ ...state, settings: { ...state.settings, ...patch } })
}

export function getCollection(name) {
  return load()[name] || []
}

function genId() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function insertItem(collection, row) {
  const state = load()
  const item = { ...row, id: genId(), created_at: new Date().toISOString() }
  const list = [...(state[collection] || []), item]
  save({ ...state, [collection]: list })
  return item
}

export function updateItem(collection, id, updates) {
  const state = load()
  const list = (state[collection] || []).map((r) => (r.id === id ? { ...r, ...updates } : r))
  save({ ...state, [collection]: list })
  return list.find((r) => r.id === id)
}

export function removeItem(collection, id) {
  const state = load()
  save({ ...state, [collection]: (state[collection] || []).filter((r) => r.id !== id) })
}

export function resetAll() {
  save(structuredClone(DEFAULT_STATE))
}

function stampRows(rows, batchId, extra = {}) {
  const now = new Date().toISOString()
  const today = now.split('T')[0]
  return (rows || []).map((row, i) => ({
    ...row,
    ...extra,
    id: genId(),
    created_at: now,
    imported_from: batchId,
    ordem: row.ordem ?? i,
    ...(row.revisado_em === undefined && row.categoria ? { revisado_em: today } : {}),
  }))
}

function normalizeSimItem(item) {
  if (typeof item === 'string') return { nome: item, valor: 0, nota: '' }
  return { nome: item.nome, valor: Number(item.valor) || 0, nota: item.nota || '' }
}

function seedSimCatalog(categorias, batchId) {
  const cats = []
  const itens = []
  let ordemCat = 0
  for (const group of categorias || []) {
    const catId = genId()
    cats.push({
      id: catId,
      ...group.cat,
      ordem: group.cat.ordem ?? ordemCat++,
      imported_from: batchId,
      created_at: new Date().toISOString(),
    })
    ;(group.itens || []).forEach((raw, j) => {
      const item = normalizeSimItem(raw)
      itens.push({
        id: genId(),
        categoria_id: catId,
        nome: item.nome,
        valor: item.valor,
        nota: item.nota,
        ordem: j,
        imported_from: batchId,
        created_at: new Date().toISOString(),
      })
    })
  }
  return { categorias: cats, itens }
}

function seedSimMimos(state, { renda, categorias }, batchId) {
  const seeded = seedSimCatalog(categorias, batchId)
  return {
    mimos_categorias: seeded.categorias,
    mimos_itens: seeded.itens,
    mimos_renda: renda ?? state.settings.mimos_renda,
  }
}

/** Importa um batch (ex.: batch.md). Flags replace* substituem coleções inteiras. */
export function importBatch({
  batchId,
  combinados,
  regrasIntro,
  replaceCombinados = false,
  appendCombinados = false,
  mimosFixos,
  replaceMimosFixos = false,
  wishes,
  appendWishes = false,
  objetivos,
  replaceObjetivos = false,
  marcos,
  replaceMarcos = false,
  premios,
  replacePremios = false,
  acordoItens,
  replaceAcordo = false,
  saidaTemplates,
  replaceSaidaTemplates = false,
  settingsPatch,
  simMimos,
  replaceSimMimos = false,
  simGastos,
  replaceSimGastos = false,
  resetMarcosPremios = false,
  user2Name,
}) {
  const state = load()
  const imported = state.settings.imported_batches || []

  if (imported.includes(batchId)) {
    return { ok: false, reason: 'already_imported' }
  }

  const next = { ...state }
  const nextSettings = { ...state.settings, imported_batches: [...imported, batchId] }

  if (resetMarcosPremios) {
    next.marcos = []
    next.premios = []
    next.pontos_historico = (state.pontos_historico || []).filter((h) => h.tipo !== 'marco')
    next.conquistas = (state.conquistas || []).filter((c) => !c.marco_id)
    next.resgates = []
  }

  if (regrasIntro) nextSettings.regras_intro = regrasIntro
  if (settingsPatch) Object.assign(nextSettings, settingsPatch)

  if (combinados?.length) {
    const now = new Date().toISOString()
    const today = now.split('T')[0]
    const newCombinados = combinados.map((row) => ({
      ...row,
      id: genId(),
      detalhes: row.detalhes || '',
      revisado_em: today,
      created_at: now,
      imported_from: batchId,
    }))
    if (replaceCombinados) next.combinados = newCombinados
    else next.combinados = [...(state.combinados || []), ...newCombinados]
  }

  if (mimosFixos?.length) {
    const rows = stampRows(mimosFixos, batchId, { ativo: true, usado_mes: null, pago_mes: null })
    next.mimos_fixos = replaceMimosFixos ? rows : [...(state.mimos_fixos || []), ...rows]
  }

  if (wishes?.length) {
    const owner = user2Name || state.settings.user2
    const rows = stampRows(wishes, batchId, {
      owner,
      status: 'pendente',
      description: '',
      como: '',
      created_by: owner,
    }).map((r, i) => ({
      ...r,
      title: wishes[i].title,
      category: wishes[i].category || 'pessoal',
      priority: wishes[i].priority || 'média',
      estimated_cost: wishes[i].estimated_cost ?? null,
      tipo: 'desejo',
    }))
    next.wishes = appendWishes ? [...(state.wishes || []), ...rows] : [...(state.wishes || []), ...rows]
  }

  if (objetivos?.length) {
    const rows = stampRows(objetivos, batchId)
    next.objetivos = replaceObjetivos ? rows : [...(state.objetivos || []), ...rows]
  }

  if (marcos?.length) {
    const now = new Date().toISOString()
    const user2 = state.settings.user2
    const rows = marcos.map((src, i) => {
      const status = src.status || 'pendente'
      const row = {
        ...src,
        id: genId(),
        tipo: src.tipo || 'conquista',
        status,
        regra_ref: src.regra_ref || null,
        recompensa_sugerida: src.recompensa_sugerida || '',
        ordem: src.ordem ?? i,
        created_at: now,
        imported_from: batchId,
        ...(status === 'conquistado'
          ? { conquistado_em: now, conquistado_por: user2 }
          : {}),
      }
      return row
    })
    next.marcos = replaceMarcos ? rows : [...(state.marcos || []), ...rows]

    if (replaceMarcos) {
      const historico = [...(state.pontos_historico || [])]
      const conquistas = [...(state.conquistas || [])]
      for (const marco of rows) {
        if (marco.status === 'conquistado') {
          historico.push({
            id: genId(),
            tipo: 'marco',
            titulo: marco.titulo,
            pontos: Number(marco.pontos) || 0,
            marco_id: marco.id,
            por: user2,
            nota: 'Importado do batch',
            created_at: now,
          })
          conquistas.push({
            id: genId(),
            owner: user2,
            titulo: marco.titulo,
            descricao: marco.descricao,
            data_conquista: now.split('T')[0],
            categoria: marco.tipo === 'ousadia' ? 'ousadia' : 'pessoal',
            nivel: Math.min(5, marco.nivel || 1),
            emoji: marco.emoji || '🏆',
            marco_id: marco.id,
            created_at: now,
          })
        }
      }
      next.pontos_historico = historico
      next.conquistas = conquistas
    }
  }

  if (premios?.length) {
    const rows = stampRows(premios, batchId, { arquivado: false })
    next.premios = replacePremios ? rows : [...(state.premios || []), ...rows]
  }

  if (acordoItens?.length) {
    const rows = stampRows(acordoItens, batchId)
    next.acordo_itens = replaceAcordo ? rows : [...(state.acordo_itens || []), ...rows]
  }

  if (saidaTemplates?.length) {
    const rows = stampRows(saidaTemplates, batchId)
    next.saida_templates = replaceSaidaTemplates ? rows : [...(state.saida_templates || []), ...rows]
  }

  if (simMimos) {
    const seeded = seedSimMimos(state, simMimos, batchId)
    if (replaceSimMimos) {
      next.mimos_categorias = seeded.mimos_categorias
      next.mimos_itens = seeded.mimos_itens
    }
    nextSettings.mimos_renda = seeded.mimos_renda
  }

  if (simGastos) {
    const seeded = seedSimCatalog(simGastos.categorias, batchId)
    if (replaceSimGastos) {
      next.sim_categorias = seeded.categorias
      next.sim_itens = seeded.itens
    }
    if (simGastos.renda !== undefined) nextSettings.renda = simGastos.renda
  }

  next.settings = nextSettings
  save(next)

  return { ok: true, batchId }
}
