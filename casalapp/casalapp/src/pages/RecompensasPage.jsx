import { useState, useMemo, useRef, useEffect } from 'react'
import { useDB } from '../hooks/useDB'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { instantNotify } from '../lib/notifications'
import PageHeader from '../components/PageHeader'
import {
  Trophy, Plus, Trash2, Edit3, X, Zap, Gift, Check,
  ChevronDown, History, Archive, ArchiveRestore, CalendarHeart,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const SEED_REQUISITOS = [
  { nome: 'Saída com marido', pontos: 1, emoji: '👫', categoria: 'saida', ordem: 0 },
  { nome: 'Saída sozinha',    pontos: 2, emoji: '🚶‍♀️', categoria: 'saida', ordem: 1 },
]

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

// ─── Dropdown de requisitos pra pontuar uma recompensa ──────────────────────
function AdicionarRequisitoDropdown({ requisitos, onPick, accent = 'rose' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClickOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClickOut)
    return () => document.removeEventListener('mousedown', onClickOut)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border-2 border-dashed transition-all ${
          open
            ? `border-${accent}-400 bg-${accent}-50 dark:bg-${accent}-900/20`
            : 'border-stone-300 dark:border-stone-600 hover:border-rose-300 hover:bg-rose-50/40 dark:hover:bg-rose-900/10'
        }`}
      >
        <span className="text-xs font-semibold text-stone-500 dark:text-stone-300 flex items-center gap-1.5">
          <Plus size={13}/> Adicionar requisito
        </span>
        <ChevronDown size={14} className={`text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>
      {open && (
        <div className="absolute z-30 mt-1 left-0 right-0 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-lg max-h-72 overflow-y-auto">
          {requisitos.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-4 px-3">
              Nenhum requisito ainda — cria na aba "Requisitos".
            </p>
          ) : (
            requisitos.map(r => (
              <button
                key={r.id}
                onClick={() => { onPick(r); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-left transition-colors"
              >
                <span className="text-lg">{r.emoji}</span>
                <span className="flex-1 text-sm text-stone-700 dark:text-stone-200 truncate">{r.nome}</span>
                <span className="text-rose-500 font-bold flex items-center gap-0.5 text-xs">
                  <Zap size={10}/> +{r.pontos}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Card de uma recompensa ─────────────────────────────────────────────────
function RecompensaCard({ premio, requisitos, eventos, resgates, onPickRequisito, onResgatar, onEditPremio, onDeletePremio, onArquivarPremio, onRemoveEvento }) {
  const [mostrarHistorico, setMostrarHistorico] = useState(false)

  const ganho = eventos.reduce((s, e) => s + (e.pontos || 0), 0)
  const gasto = resgates.reduce((s, r) => s + (r.custo || 0), 0)
  const progresso = ganho - gasto
  const pct = Math.min(100, Math.round((progresso / premio.custo) * 100))
  const podeResgatar = progresso >= premio.custo
  const totalResgatado = resgates.length

  // Últimos 5 eventos pra mostrar no histórico
  const ultimosEventos = useMemo(
    () => [...eventos].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8),
    [eventos]
  )

  return (
    <Card className={`p-4 ${podeResgatar ? 'border-amber-300 dark:border-amber-700 shadow-md' : ''}`}>
      {/* Cabeçalho */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl flex-shrink-0">{premio.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-stone-800 dark:text-stone-100">{premio.nome}</h3>
            {totalResgatado > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold">
                {totalResgatado}× resgatado
              </span>
            )}
          </div>
          {premio.descricao && <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{premio.descricao}</p>}
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          <button onClick={() => onEditPremio(premio)} className="p-1 text-stone-300 hover:text-stone-600 rounded" title="Editar">
            <Edit3 size={13}/>
          </button>
          <button onClick={() => onArquivarPremio(premio)} className="p-1 text-stone-300 hover:text-stone-600 rounded" title="Arquivar">
            <Archive size={13}/>
          </button>
          <button onClick={() => onDeletePremio(premio.id)} className="p-1 text-stone-300 hover:text-red-400 rounded" title="Apagar">
            <Trash2 size={13}/>
          </button>
        </div>
      </div>

      {/* Progresso */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Progresso</span>
          <span className={`text-sm font-bold flex items-center gap-1 ${podeResgatar ? 'text-green-600' : 'text-rose-500'}`}>
            <Zap size={12}/> {progresso} / {premio.custo}
          </span>
        </div>
        <div className="w-full bg-stone-100 dark:bg-stone-700 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              podeResgatar
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : 'bg-gradient-to-r from-rose-400 to-pink-500'
            }`}
            style={{ width: pct + '%' }}
          />
        </div>
      </div>

      {/* Dropdown + Resgatar */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 mb-2">
        <AdicionarRequisitoDropdown
          requisitos={requisitos}
          onPick={(req) => onPickRequisito(premio, req)}
        />
        <button
          disabled={!podeResgatar}
          onClick={() => onResgatar(premio)}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            podeResgatar
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:opacity-90 shadow-sm'
              : 'bg-stone-100 dark:bg-stone-700 text-stone-400 cursor-not-allowed'
          }`}
        >
          <Gift size={14}/> Resgatar
        </button>
      </div>

      {/* Toggle histórico */}
      {eventos.length > 0 && (
        <button
          onClick={() => setMostrarHistorico(m => !m)}
          className="w-full mt-1 flex items-center justify-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors py-1"
        >
          <History size={11}/>
          {mostrarHistorico ? 'Esconder' : 'Ver'} histórico ({eventos.length})
        </button>
      )}

      {mostrarHistorico && (
        <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-700 space-y-1">
          {ultimosEventos.map(e => (
            <div key={e.id} className="group flex items-center gap-2 text-xs px-2 py-1 rounded hover:bg-stone-50 dark:hover:bg-stone-700/50">
              <span className="text-stone-400 flex-shrink-0">
                {format(parseISO(e.created_at), "dd/MM HH:mm", { locale: ptBR })}
              </span>
              <span className="flex-1 text-stone-600 dark:text-stone-300 truncate">{e.acao_nome}</span>
              <span className="text-rose-500 font-bold flex items-center gap-0.5 flex-shrink-0">
                <Zap size={9}/> +{e.pontos}
              </span>
              <button
                onClick={() => onRemoveEvento(e.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-stone-300 hover:text-red-400"
                title="Desfazer (corrige o progresso)"
              >
                <Trash2 size={10}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ─── Modal: confirmar resgate ───────────────────────────────────────────────
function ResgatarModal({ premio, progresso, onClose, onConfirmar }) {
  const [nota, setNota] = useState('')
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-stone-800 dark:text-stone-100">Resgatar prêmio</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18}/></button>
        </div>
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">{premio.emoji}</div>
          <p className="font-bold text-lg text-stone-800 dark:text-stone-100">{premio.nome}</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm">
            <span className="text-green-600 font-bold flex items-center gap-1"><Zap size={12}/> {progresso}</span>
            <span className="text-stone-400">−</span>
            <span className="text-rose-500 font-bold flex items-center gap-1"><Zap size={12}/> {premio.custo}</span>
            <span className="text-stone-400">=</span>
            <span className="text-stone-700 dark:text-stone-200 font-bold flex items-center gap-1"><Zap size={12}/> {progresso - premio.custo}</span>
          </div>
          <p className="text-xs text-stone-400 mt-1">Sobra que continua acumulando</p>
        </div>
        <input
          className="input-base w-full mb-3"
          placeholder="Nota (opcional)"
          value={nota}
          onChange={e => setNota(e.target.value)}
        />
        <button
          onClick={async () => { await onConfirmar(premio, nota); onClose() }}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-sm font-semibold hover:opacity-90"
        >
          Confirmar resgate
        </button>
      </Card>
    </div>
  )
}

// ─── Aba "Requisitos" ──────────────────────────────────────────────────────
function TabRequisitos() {
  const { data: requisitos, insert, update, remove } = useDB('recompensas_acoes', { order: 'ordem', asc: true })
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const empty = { nome: '', pontos: 1, emoji: '⭐', descricao: '', categoria: 'geral', ativo: true }
  const [form, setForm] = useState(empty)

  const handleSave = async () => {
    if (!form.nome.trim()) return
    const payload = { ...form, pontos: Math.max(0, parseInt(form.pontos) || 0) }
    if (editId) await update(editId, payload)
    else await insert({ ...payload, ordem: requisitos.length })
    setForm(empty)
    setAdding(false)
    setEditId(null)
  }

  const startEdit = (r) => {
    setForm({ nome: r.nome, pontos: r.pontos, emoji: r.emoji || '⭐', descricao: r.descricao || '', categoria: r.categoria || 'geral', ativo: r.ativo !== false })
    setEditId(r.id)
    setAdding(true)
  }

  const handleSeed = async () => {
    setSeeding(true)
    for (const r of SEED_REQUISITOS) await insert(r)
    setSeeding(false)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500 dark:text-stone-400 italic">
        Requisitos são as ações que pontuam. Eles aparecem automaticamente no dropdown de cada recompensa.
      </p>

      {requisitos.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
          <div className="text-5xl">⭐</div>
          <div>
            <p className="font-bold text-stone-700 dark:text-stone-100">Nenhum requisito ainda</p>
            <p className="text-sm text-stone-400 mt-1">Carrega os 2 padrão (Saída com marido / sozinha) ou cria do zero.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSeed} disabled={seeding}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold disabled:opacity-60">
              {seeding ? 'Criando...' : 'Carregar 2 padrão'}
            </button>
            <button onClick={() => setAdding(true)}
              className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-sm font-medium">
              + Do zero
            </button>
          </div>
        </div>
      )}

      {!adding && requisitos.length > 0 && (
        <button onClick={() => { setAdding(true); setEditId(null); setForm(empty) }}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600">
          <Plus size={14}/> Novo requisito
        </button>
      )}

      {adding && (
        <Card className="p-4 border-2 border-rose-200 dark:border-rose-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              {editId ? 'Editar requisito' : 'Novo requisito'}
            </h3>
            <button onClick={() => { setAdding(false); setEditId(null); setForm(empty) }} className="text-stone-400 hover:text-stone-600">
              <X size={16}/>
            </button>
          </div>
          <div className="space-y-2.5">
            <div className="flex gap-2">
              <input className="input-base w-20 text-center text-xl" placeholder="⭐"
                value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} maxLength={2}
              />
              <input className="input-base flex-1" placeholder="Nome do requisito *"
                value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} autoFocus
              />
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-amber-500"/>
              <input type="number" min={0} max={1000}
                className="input-base w-24"
                value={form.pontos}
                onChange={e => setForm(f => ({ ...f, pontos: e.target.value }))}
              />
              <span className="text-xs text-stone-400">pontos por tick</span>
            </div>
            <input className="input-base w-full"
              placeholder="Descrição/critério (opcional)"
              value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
            />
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => { setAdding(false); setEditId(null); setForm(empty) }} className="px-3 py-2 text-sm text-stone-400 hover:text-stone-600">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600">
                {editId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {requisitos.map(r => (
          <Card key={r.id} className="p-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{r.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-700 dark:text-stone-200 text-sm">{r.nome}</p>
                {r.descricao && <p className="text-xs text-stone-400 truncate">{r.descricao}</p>}
              </div>
              <span className="text-rose-500 font-bold flex items-center gap-1 flex-shrink-0">
                <Zap size={12}/> {r.pontos}
              </span>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(r)} className="p-1.5 text-stone-300 hover:text-stone-600 rounded">
                  <Edit3 size={13}/>
                </button>
                <button onClick={() => remove(r.id)} className="p-1.5 text-stone-300 hover:text-red-400 rounded">
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Página principal ───────────────────────────────────────────────────────
const TABS = ['Recompensas Ativas', 'Arquivadas', 'Requisitos']

export function RecompensasPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState(0)
  const [addingPremio, setAddingPremio] = useState(false)
  const [editPremioId, setEditPremioId] = useState(null)
  const [resgatando, setResgatando] = useState(null) // { premio, progresso }
  const emptyPremio = { nome: '', custo: 10, emoji: '🎁', descricao: '', arquivado: false }
  const [premioForm, setPremioForm] = useState(emptyPremio)

  const { data: premios, insert: insertPremio, update: updatePremio, remove: removePremio } = useDB('recompensas_premios', { order: 'ordem', asc: true })
  const { data: requisitos } = useDB('recompensas_acoes', { order: 'ordem', asc: true })
  const { data: eventos, insert: insertEvento, remove: removeEvento } = useDB('recompensas_eventos', { order: 'created_at', asc: false })
  const { data: resgates, insert: insertResgate } = useDB('recompensas_resgates', { order: 'created_at', asc: false })

  const requisitosAtivos = useMemo(() => requisitos.filter(r => r.ativo !== false), [requisitos])

  const eventosPorPremio = useMemo(() => {
    const map = {}
    for (const p of premios) map[p.id] = []
    for (const e of eventos) {
      if (e.recompensa_id && map[e.recompensa_id]) map[e.recompensa_id].push(e)
    }
    return map
  }, [premios, eventos])

  const resgatesPorPremio = useMemo(() => {
    const map = {}
    for (const p of premios) map[p.id] = []
    for (const r of resgates) {
      if (r.premio_id && map[r.premio_id]) map[r.premio_id].push(r)
    }
    return map
  }, [premios, resgates])

  const progressoPorPremio = useMemo(() => {
    const map = {}
    for (const p of premios) {
      const g = (eventosPorPremio[p.id] || []).reduce((s, e) => s + (e.pontos || 0), 0)
      const c = (resgatesPorPremio[p.id] || []).reduce((s, r) => s + (r.custo || 0), 0)
      map[p.id] = g - c
    }
    return map
  }, [premios, eventosPorPremio, resgatesPorPremio])

  const totalGeral = useMemo(
    () => Object.values(progressoPorPremio).reduce((s, v) => s + v, 0),
    [progressoPorPremio]
  )

  const ativos = premios.filter(p => !p.arquivado)
  const arquivadas = premios.filter(p => p.arquivado)

  const handlePickRequisito = async (premio, requisito) => {
    await insertEvento({
      recompensa_id: premio.id,
      acao_id: requisito.id,
      acao_nome: requisito.nome,
      pontos: requisito.pontos,
      fonte: 'manual',
    })
  }

  const handleResgatarConfirm = async (premio, nota) => {
    // 1. Registra o resgate (subtrai do progresso)
    await insertResgate({
      premio_id: premio.id,
      premio_nome: premio.nome,
      custo: premio.custo,
      nota: nota?.trim() || null,
    })

    // 2. Cria entrada na Agenda (vl_saidas) como Aprovado pra amanhã, mesma hora
    if (user?.id) {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const data = tomorrow.toISOString().slice(0, 10)
      const hora = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
      const descricao = 'Você ganhou ' + premio.nome + ' por completar os requisitos' + (nota?.trim() ? ' — ' + nota.trim() : '')

      const { error } = await supabase.from('vl_saidas').insert({
        user_id: user.id,
        titulo: '🎁 ' + premio.nome,
        data,
        hora,
        com_quem: null,
        local: null,
        status: 'aconteceu', // = Aprovado (label do app)
        share: 'resumo',
        notas: descricao,
      })

      if (!error) {
        instantNotify('🎁 Recompensa resgatada!', premio.emoji + ' ' + premio.nome + ' — agendada pra amanhã')
      }
    }
  }

  const handleSavePremio = async () => {
    if (!premioForm.nome.trim()) return
    const payload = { ...premioForm, custo: Math.max(1, parseInt(premioForm.custo) || 1) }
    if (editPremioId) await updatePremio(editPremioId, payload)
    else await insertPremio({ ...payload, ordem: premios.length })
    setPremioForm(emptyPremio)
    setAddingPremio(false)
    setEditPremioId(null)
  }

  const startEditPremio = (p) => {
    setPremioForm({ nome: p.nome, custo: p.custo, emoji: p.emoji || '🎁', descricao: p.descricao || '', arquivado: !!p.arquivado })
    setEditPremioId(p.id)
    setAddingPremio(true)
  }

  const handleArquivar = async (p) => {
    await updatePremio(p.id, { arquivado: !p.arquivado })
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <PageHeader
        icon={Trophy}
        title="Recompensas"
        subtitle="Cada prêmio acumula seus próprios pontos"
      />

      {/* Total geral */}
      <Card className="p-4 bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-900/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center shadow-md">
              <Trophy className="w-6 h-6 text-white"/>
            </div>
            <div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">Total acumulado em todas as recompensas</p>
              <p className="text-3xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                <Zap className="text-amber-500" size={22}/> {totalGeral}
              </p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="text-stone-500">{ativos.length} ativa(s) · {arquivadas.length} arquivada(s)</p>
            <p className="text-stone-500 mt-0.5">{eventos.length} ticks · {resgates.length} resgates</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {TABS.map((label, i) => (
          <button
            key={label}
            onClick={() => setTab(i)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab === i
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:border-rose-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Aba: Recompensas Ativas */}
      {tab === 0 && (
        <div className="space-y-3">
          {!addingPremio && (
            <button onClick={() => { setAddingPremio(true); setEditPremioId(null); setPremioForm(emptyPremio) }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-xl text-sm font-medium hover:opacity-90">
              <Plus size={14}/> Nova recompensa
            </button>
          )}

          {addingPremio && (
            <Card className="p-4 border-2 border-amber-200 dark:border-amber-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                  {editPremioId ? 'Editar recompensa' : 'Nova recompensa'}
                </h3>
                <button onClick={() => { setAddingPremio(false); setEditPremioId(null); setPremioForm(emptyPremio) }} className="text-stone-400 hover:text-stone-600">
                  <X size={16}/>
                </button>
              </div>
              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <input className="input-base w-20 text-center text-xl" placeholder="🎁"
                    value={premioForm.emoji} onChange={e => setPremioForm(f => ({ ...f, emoji: e.target.value }))} maxLength={2}
                  />
                  <input className="input-base flex-1" placeholder="Nome da recompensa *  (ex: Botox)"
                    value={premioForm.nome} onChange={e => setPremioForm(f => ({ ...f, nome: e.target.value }))} autoFocus
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-amber-500"/>
                  <input type="number" min={1} max={10000}
                    className="input-base w-24"
                    value={premioForm.custo}
                    onChange={e => setPremioForm(f => ({ ...f, custo: e.target.value }))}
                  />
                  <span className="text-xs text-stone-400">pontos pra resgatar</span>
                </div>
                <input className="input-base w-full"
                  placeholder="Descrição (opcional)"
                  value={premioForm.descricao} onChange={e => setPremioForm(f => ({ ...f, descricao: e.target.value }))}
                />
                <div className="flex gap-2 justify-end pt-1">
                  <button onClick={() => { setAddingPremio(false); setEditPremioId(null); setPremioForm(emptyPremio) }} className="px-3 py-2 text-sm text-stone-400 hover:text-stone-600">Cancelar</button>
                  <button onClick={handleSavePremio} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600">
                    {editPremioId ? 'Salvar' : 'Adicionar'}
                  </button>
                </div>
              </div>
            </Card>
          )}

          {ativos.length === 0 && !addingPremio && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <div className="text-5xl">🎁</div>
              <div>
                <p className="font-bold text-stone-700 dark:text-stone-100">Sem recompensas ativas</p>
                <p className="text-sm text-stone-400 mt-1">Crie uma recompensa (ex: "Botox 20pts") e vá tickando requisitos no dropdown dela.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {ativos.map(p => (
              <RecompensaCard
                key={p.id}
                premio={p}
                requisitos={requisitosAtivos}
                eventos={eventosPorPremio[p.id] || []}
                resgates={resgatesPorPremio[p.id] || []}
                onPickRequisito={handlePickRequisito}
                onResgatar={(premio) => setResgatando({ premio, progresso: progressoPorPremio[premio.id] || 0 })}
                onEditPremio={startEditPremio}
                onDeletePremio={removePremio}
                onArquivarPremio={handleArquivar}
                onRemoveEvento={removeEvento}
              />
            ))}
          </div>
        </div>
      )}

      {/* Aba: Arquivadas */}
      {tab === 1 && (
        <div className="space-y-3">
          {arquivadas.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <Archive size={36} className="mx-auto mb-3 opacity-30"/>
              <p className="font-medium text-stone-500">Nenhuma recompensa arquivada</p>
              <p className="text-xs mt-1">Use o ícone de arquivo num card pra guardar sem perder histórico.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {arquivadas.map(p => {
                const g = (eventosPorPremio[p.id] || []).reduce((s, e) => s + (e.pontos || 0), 0)
                const c = (resgatesPorPremio[p.id] || []).reduce((s, r) => s + (r.custo || 0), 0)
                const prog = g - c
                return (
                  <Card key={p.id} className="p-3 opacity-70">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl grayscale">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-600 dark:text-stone-300 text-sm">{p.nome}</p>
                        <p className="text-xs text-stone-400 flex items-center gap-1">
                          <Zap size={9}/> {prog}/{p.custo} · {(resgatesPorPremio[p.id]||[]).length} resgatado(s)
                        </p>
                      </div>
                      <button onClick={() => handleArquivar(p)} className="p-1.5 text-stone-400 hover:text-green-500 rounded" title="Desarquivar">
                        <ArchiveRestore size={14}/>
                      </button>
                      <button onClick={() => removePremio(p.id)} className="p-1.5 text-stone-300 hover:text-red-400 rounded" title="Apagar definitivamente">
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Aba: Requisitos */}
      {tab === 2 && <TabRequisitos />}

      {/* Modal resgatar */}
      {resgatando && (
        <ResgatarModal
          premio={resgatando.premio}
          progresso={resgatando.progresso}
          onClose={() => setResgatando(null)}
          onConfirmar={handleResgatarConfirm}
        />
      )}
    </div>
  )
}

export default RecompensasPage
