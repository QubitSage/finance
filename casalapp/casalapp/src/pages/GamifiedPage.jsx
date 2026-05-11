import { useState, useMemo } from 'react'
import { useDB } from '../hooks/useDB'
import PageHeader from '../components/PageHeader'
import {
  Plus, Trash2, Edit3, X, Trophy, Target, Sparkles,
  ChevronDown, ChevronUp, CheckCircle2, Circle, Star, Zap,
  Home, ShoppingCart,
} from 'lucide-react'

const CORES = {
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-400',  ring: 'ring-amber-300' },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-400',   ring: 'ring-blue-300' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  dot: 'bg-green-400',  ring: 'ring-green-300' },
  rose:   { bg: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700',   dot: 'bg-rose-400',   ring: 'ring-rose-300' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-400', ring: 'ring-violet-300' },
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-200',   text: 'text-teal-700',   dot: 'bg-teal-400',   ring: 'ring-teal-300' },
  stone:  { bg: 'bg-stone-50',  border: 'border-stone-200',  text: 'text-stone-700',  dot: 'bg-stone-400',  ring: 'ring-stone-300' },
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function ProgressBar({ value, max, color = 'amber' }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100))
  const colorMap = {
    amber: 'bg-amber-400', blue: 'bg-blue-400', green: 'bg-green-400',
    rose: 'bg-rose-400', violet: 'bg-violet-400', teal: 'bg-teal-400', stone: 'bg-stone-400',
  }
  return (
    <div className="w-full bg-stone-100 dark:bg-stone-700 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full transition-all duration-500 ${colorMap[color] || colorMap.amber}`}
        style={{ width: pct + '%' }} />
    </div>
  )
}

function MetaCard({ meta, quests, onAddQuest, onToggleQuest, onEditMeta, onDeleteMeta, onEditQuest, onDeleteQuest }) {
  const [expanded, setExpanded] = useState(true)
  const [addingQuest, setAddingQuest] = useState(false)
  const [questForm, setQuestForm] = useState({ titulo: '', descricao: '', tipo: 'side', xp: 10 })
  const [editQuestId, setEditQuestId] = useState(null)

  const cor = CORES[meta.cor] || CORES.amber
  const done = quests.filter(q => q.status === 'done').length
  const total = quests.length
  const xpDone = quests.filter(q => q.status === 'done').reduce((s, q) => s + (q.xp || 0), 0)
  const xpTotal = quests.reduce((s, q) => s + (q.xp || 0), 0)

  const handleSaveQuest = async () => {
    if (!questForm.titulo.trim()) return
    if (editQuestId) {
      await onEditQuest(editQuestId, questForm)
      setEditQuestId(null)
    } else {
      await onAddQuest(meta.id, questForm)
    }
    setQuestForm({ titulo: '', descricao: '', tipo: 'side', xp: 10 })
    setAddingQuest(false)
  }

  const startEditQuest = (q) => {
    setQuestForm({ titulo: q.titulo, descricao: q.descricao || '', tipo: q.tipo || 'side', xp: q.xp || 10 })
    setEditQuestId(q.id)
    setAddingQuest(true)
  }

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${cor.bg} ${cor.border}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl flex-shrink-0">{meta.emoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-base ${cor.text} truncate`}>{meta.titulo}</h3>
            {meta.descricao && <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{meta.descricao}</p>}
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-stone-500">{done}/{total} quests</span>
              <span className="text-stone-300">·</span>
              <span className={cor.text + ' font-semibold flex items-center gap-1'}>
                <Zap size={11}/> {xpDone}/{xpTotal} XP
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-shrink-0">
            <button onClick={() => onEditMeta(meta)} className="p-1 text-stone-400 hover:text-stone-600 rounded">
              <Edit3 size={13}/>
            </button>
            <button onClick={() => onDeleteMeta(meta.id)} className="p-1 text-stone-400 hover:text-red-500 rounded">
              <Trash2 size={13}/>
            </button>
          </div>
        </div>
        <div className="mt-3">
          <ProgressBar value={xpDone} max={xpTotal || 1} color={meta.cor} />
        </div>
      </div>

      {/* Quests list */}
      <div className="bg-white/60 dark:bg-stone-800/60 border-t border-white/40">
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-stone-500"
        >
          <span>Quests ({total})</span>
          {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </button>

        {expanded && (
          <div className="px-4 pb-3 space-y-1.5">
            {quests.length === 0 && !addingQuest && (
              <p className="text-xs text-stone-400 italic text-center py-3">
                Nenhuma quest ainda. Adicione side-quests pra avançar.
              </p>
            )}
            {quests.map(q => (
              <div key={q.id} className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg ${q.status === 'done' ? 'bg-green-50/70 dark:bg-green-900/20' : 'bg-white/70 dark:bg-stone-700/40'}`}>
                <button
                  onClick={() => onToggleQuest(q)}
                  className={`flex-shrink-0 ${q.status === 'done' ? 'text-green-500' : 'text-stone-300 hover:text-stone-500'}`}
                >
                  {q.status === 'done' ? <CheckCircle2 size={16}/> : <Circle size={16}/>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-sm ${q.status === 'done' ? 'line-through text-stone-400' : 'text-stone-700 dark:text-stone-200'}`}>
                      {q.titulo}
                    </span>
                    {q.tipo === 'main' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-bold uppercase tracking-wider">
                        Main
                      </span>
                    )}
                  </div>
                  {q.descricao && <p className="text-[11px] text-stone-400 truncate">{q.descricao}</p>}
                </div>
                <span className={`text-xs font-bold flex items-center gap-0.5 flex-shrink-0 ${q.status === 'done' ? 'text-green-600' : cor.text}`}>
                  <Zap size={10}/> {q.xp || 0}
                </span>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => startEditQuest(q)} className="p-1 text-stone-300 hover:text-stone-600 rounded">
                    <Edit3 size={11}/>
                  </button>
                  <button onClick={() => onDeleteQuest(q.id)} className="p-1 text-stone-300 hover:text-red-400 rounded">
                    <Trash2 size={11}/>
                  </button>
                </div>
              </div>
            ))}

            {addingQuest ? (
              <div className="bg-white dark:bg-stone-700 rounded-lg p-2 border border-stone-200 dark:border-stone-600 space-y-2">
                <input
                  className="input-base w-full text-sm"
                  placeholder="Título da quest *"
                  value={questForm.titulo}
                  onChange={e => setQuestForm(f => ({ ...f, titulo: e.target.value }))}
                  autoFocus
                />
                <input
                  className="input-base w-full text-xs"
                  placeholder="Descrição (opcional)"
                  value={questForm.descricao}
                  onChange={e => setQuestForm(f => ({ ...f, descricao: e.target.value }))}
                />
                <div className="flex items-center gap-2">
                  <select className="input-base text-xs flex-1" value={questForm.tipo} onChange={e => setQuestForm(f => ({ ...f, tipo: e.target.value }))}>
                    <option value="side">⚔️ Side quest</option>
                    <option value="main">⭐ Main quest</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <Zap size={12} className="text-amber-500"/>
                    <input
                      type="number" min={1} max={500}
                      className="input-base text-xs w-16 text-right"
                      value={questForm.xp}
                      onChange={e => setQuestForm(f => ({ ...f, xp: parseInt(e.target.value) || 0 }))}
                    />
                    <span className="text-[10px] text-stone-400">XP</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={handleSaveQuest} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-white ${cor.dot} hover:opacity-90`}>
                    {editQuestId ? 'Salvar' : 'Adicionar'}
                  </button>
                  <button onClick={() => { setAddingQuest(false); setEditQuestId(null); setQuestForm({ titulo: '', descricao: '', tipo: 'side', xp: 10 }) }}
                    className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-600">
                    <X size={12}/>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingQuest(true)}
                className={`w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-white/80 transition-colors`}
              >
                <Plus size={12}/> Adicionar quest
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const SIM_EMOJIS = ['🏠','🛒','💊','📱','🚗','🎯','💰','🍽️','🌿','🎨','🏋️','✈️','🔑','📋','💡','🛏️','🍳','🧹','🪴','🛋️','🚿','🧺','📦','🍷','📺','🪞','🧸','🐾']

export function GamifiedPage({
  tabelaMetas,
  tabelaQuests,
  titulo,
  subtitulo,
  icon: Icon,
  emptyEmoji = '🎯',
  emptyTitulo = 'Sem metas ainda',
  emptySub = 'Crie sua primeira meta e divida em side-quests.',
  defaultEmoji = '🏠',
  defaultCor = 'amber',
}) {
  const { data: metas, insert: insertMeta, update: updateMeta, remove: removeMeta } = useDB(tabelaMetas, { order: 'ordem', asc: true })
  const { data: quests, insert: insertQuest, update: updateQuest, remove: removeQuest } = useDB(tabelaQuests, { order: 'ordem', asc: true })

  const [addingMeta, setAddingMeta] = useState(false)
  const [editMetaId, setEditMetaId] = useState(null)
  const empty = { titulo: '', descricao: '', emoji: defaultEmoji, cor: defaultCor }
  const [form, setForm] = useState(empty)

  const questsByMeta = useMemo(() => {
    const m = {}
    for (const meta of metas) m[meta.id] = []
    for (const q of quests) {
      if (m[q.meta_id]) m[q.meta_id].push(q)
    }
    return m
  }, [metas, quests])

  const stats = useMemo(() => {
    let xpDone = 0, xpTotal = 0, completedMetas = 0
    for (const meta of metas) {
      const qs = questsByMeta[meta.id] || []
      const mXpDone = qs.filter(q => q.status === 'done').reduce((s, q) => s + (q.xp || 0), 0)
      const mXpTotal = qs.reduce((s, q) => s + (q.xp || 0), 0)
      xpDone += mXpDone
      xpTotal += mXpTotal
      if (qs.length > 0 && mXpDone === mXpTotal) completedMetas++
    }
    return { xpDone, xpTotal, completedMetas, totalMetas: metas.length }
  }, [metas, questsByMeta])

  const handleSaveMeta = async () => {
    if (!form.titulo.trim()) return
    if (editMetaId) {
      await updateMeta(editMetaId, form)
      setEditMetaId(null)
    } else {
      await insertMeta({ ...form, ordem: metas.length })
    }
    setForm(empty)
    setAddingMeta(false)
  }

  const startEditMeta = (meta) => {
    setForm({ titulo: meta.titulo, descricao: meta.descricao || '', emoji: meta.emoji || defaultEmoji, cor: meta.cor || defaultCor })
    setEditMetaId(meta.id)
    setAddingMeta(true)
  }

  const handleToggleQuest = async (q) => {
    await updateQuest(q.id, { status: q.status === 'done' ? 'pending' : 'done' })
  }

  const handleAddQuest = async (metaId, questForm) => {
    const existing = questsByMeta[metaId] || []
    await insertQuest({ ...questForm, meta_id: metaId, ordem: existing.length })
  }

  const handleEditQuest = (questId, payload) => updateQuest(questId, payload)

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <PageHeader
        icon={Icon}
        title={titulo}
        subtitle={subtitulo}
        action={
          !addingMeta && (
            <button
              onClick={() => { setAddingMeta(true); setEditMetaId(null); setForm(empty) }}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={14}/> Nova meta
            </button>
          )
        }
      />

      {/* XP global */}
      {metas.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-amber-50 to-rose-50 dark:from-amber-900/20 dark:to-rose-900/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center shadow-md">
                <Trophy className="w-6 h-6 text-white"/>
              </div>
              <div>
                <p className="text-xs text-stone-500">Progresso total</p>
                <p className="text-2xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1">
                  <Zap size={18} className="text-amber-500"/> {stats.xpDone} / {stats.xpTotal} XP
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-500">Metas concluídas</p>
              <p className="text-2xl font-bold text-amber-600 flex items-center gap-1 justify-end">
                <Star size={18}/> {stats.completedMetas} / {stats.totalMetas}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Form */}
      {addingMeta && (
        <Card className="p-4 border-2 border-amber-200 dark:border-amber-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              {editMetaId ? 'Editar meta' : 'Nova meta'}
            </h3>
            <button onClick={() => { setAddingMeta(false); setEditMetaId(null); setForm(empty) }}
              className="text-stone-400 hover:text-stone-600">
              <X size={16}/>
            </button>
          </div>
          <div className="space-y-3">
            <input
              required autoFocus
              className="input-base w-full"
              placeholder="Título da meta * (ex: Comprar geladeira)"
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
            />
            <textarea
              className="input-base w-full resize-none"
              rows={2}
              placeholder="O que essa meta significa? (opcional)"
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
            />
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Emoji</label>
              <div className="flex gap-1 flex-wrap">
                {SIM_EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, emoji: e }))}
                    className={`text-xl p-1.5 rounded-lg transition-all ${form.emoji === e ? 'bg-amber-100 scale-110' : 'hover:bg-stone-100'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Cor</label>
              <div className="flex gap-2">
                {Object.entries(CORES).map(([k, c]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, cor: k }))}
                    className={`w-6 h-6 rounded-full ${c.dot} transition-all ${form.cor === k ? 'ring-2 ring-offset-2 ring-stone-500 scale-125' : 'hover:scale-110'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setAddingMeta(false); setEditMetaId(null); setForm(empty) }}
                className="px-3 py-2 text-sm text-stone-400 hover:text-stone-600">
                Cancelar
              </button>
              <button onClick={handleSaveMeta} className="btn-primary text-sm">
                {editMetaId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Empty state */}
      {metas.length === 0 && !addingMeta && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="text-6xl">{emptyEmoji}</div>
          <div>
            <p className="font-bold text-stone-700 text-xl">{emptyTitulo}</p>
            <p className="text-stone-400 text-sm mt-1.5 max-w-xs mx-auto leading-relaxed">{emptySub}</p>
          </div>
          <button
            onClick={() => { setAddingMeta(true); setEditMetaId(null); setForm(empty) }}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
          >
            <Plus size={14}/> Criar primeira meta
          </button>
        </div>
      )}

      {/* Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {metas.map(meta => (
          <MetaCard
            key={meta.id}
            meta={meta}
            quests={questsByMeta[meta.id] || []}
            onAddQuest={handleAddQuest}
            onToggleQuest={handleToggleQuest}
            onEditMeta={startEditMeta}
            onDeleteMeta={removeMeta}
            onEditQuest={handleEditQuest}
            onDeleteQuest={removeQuest}
          />
        ))}
      </div>
    </div>
  )
}

export function ApartmentPage() {
  return (
    <GamifiedPage
      tabelaMetas="apt_metas"
      tabelaQuests="apt_quests"
      titulo="Apartamento"
      subtitulo="Metas e quests do nosso lar"
      icon={Home}
      emptyEmoji="🏠"
      emptyTitulo="Sem metas pro apartamento"
      emptySub="Crie metas tipo 'Montar quarto', 'Comprar geladeira' e divida em side-quests."
      defaultEmoji="🏠"
      defaultCor="amber"
    />
  )
}

export function MarketPage() {
  return (
    <GamifiedPage
      tabelaMetas="mercado_metas"
      tabelaQuests="mercado_quests"
      titulo="Mercado"
      subtitulo="Metas e quests pra encher a despensa"
      icon={ShoppingCart}
      emptyEmoji="🛒"
      emptyTitulo="Sem metas no mercado"
      emptySub="Crie listas tipo 'Compra do mês', 'Festa de ano novo' e quebre em quests por categoria."
      defaultEmoji="🛒"
      defaultCor="green"
    />
  )
}

export default GamifiedPage
