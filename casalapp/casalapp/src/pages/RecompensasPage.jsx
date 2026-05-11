import { useState, useMemo, useEffect } from 'react'
import { useDB } from '../hooks/useDB'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import PageHeader from '../components/PageHeader'
import {
  Trophy, Plus, Trash2, Edit3, X, Star, Gift, History,
  Zap, Check, Sparkles, ChevronDown, ChevronUp,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const SEED_ACOES = [
  { nome: 'Saída com marido', pontos: 1, emoji: '👫', categoria: 'saida',  ordem: 0 },
  { nome: 'Saída sozinha',    pontos: 2, emoji: '🚶‍♀️', categoria: 'saida', ordem: 1 },
]

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

// ─── Modal: registrar ação manual ────────────────────────────────────────────
function RegistrarAcaoModal({ acoes, onClose, onSave }) {
  const [acaoId, setAcaoId] = useState(acoes[0]?.id || '')
  const [nota, setNota] = useState('')
  const [qtd, setQtd] = useState(1)

  const acao = acoes.find(a => a.id === acaoId)

  const handleSave = async () => {
    if (!acao) return
    for (let i = 0; i < qtd; i++) {
      await onSave({
        acao_id: acao.id,
        acao_nome: acao.nome,
        pontos: acao.pontos,
        fonte: 'manual',
        nota: nota.trim() || null,
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-stone-800 dark:text-stone-100">Registrar ação</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18}/></button>
        </div>
        {acoes.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-8">Nenhuma ação cadastrada ainda. Crie uma na aba "Ações".</p>
        ) : (
          <>
            <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
              {acoes.map(a => (
                <button
                  key={a.id}
                  onClick={() => setAcaoId(a.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${
                    acaoId === a.id
                      ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20'
                      : 'border-stone-200 dark:border-stone-700 hover:border-stone-300'
                  }`}
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="flex-1 text-left text-sm font-medium text-stone-700 dark:text-stone-200">{a.nome}</span>
                  <span className="text-rose-500 font-bold flex items-center gap-1">
                    <Zap size={12}/> {a.pontos}
                  </span>
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-stone-400 font-medium mb-1 block">Quantidade (repete)</label>
                <input type="number" min={1} max={50}
                  className="input-base w-full"
                  value={qtd}
                  onChange={e => setQtd(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 font-medium mb-1 block">Nota (opcional)</label>
                <input className="input-base w-full"
                  placeholder="Detalhe rápido"
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                />
              </div>
              {acao && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2 text-sm flex items-center justify-between">
                  <span className="text-stone-600 dark:text-stone-200">Total</span>
                  <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <Zap size={14}/> +{acao.pontos * qtd}
                  </span>
                </div>
              )}
              <button onClick={handleSave}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90">
                Confirmar
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

// ─── Modal: resgatar prêmio ──────────────────────────────────────────────────
function ResgatarPremioModal({ premio, saldo, onClose, onResgatar }) {
  const [nota, setNota] = useState('')
  const podeResgatar = saldo >= premio.custo
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-stone-800 dark:text-stone-100">Resgatar prêmio</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18}/></button>
        </div>
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">{premio.emoji}</div>
          <p className="font-bold text-lg text-stone-800 dark:text-stone-100">{premio.nome}</p>
          {premio.descricao && <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{premio.descricao}</p>}
          <p className="text-2xl font-bold text-rose-500 mt-3 flex items-center justify-center gap-1">
            <Zap size={20}/> {premio.custo} pts
          </p>
        </div>
        <div className="bg-stone-50 dark:bg-stone-900/40 rounded-xl p-3 mb-3 flex items-center justify-between">
          <span className="text-sm text-stone-500">Saldo atual</span>
          <span className="font-bold text-stone-700 dark:text-stone-200 flex items-center gap-1">
            <Zap size={14}/> {saldo}
          </span>
        </div>
        <div className="bg-stone-50 dark:bg-stone-900/40 rounded-xl p-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-stone-500">Depois do resgate</span>
          <span className={`font-bold flex items-center gap-1 ${podeResgatar ? 'text-green-600' : 'text-red-500'}`}>
            <Zap size={14}/> {saldo - premio.custo}
          </span>
        </div>
        <input
          className="input-base w-full mb-3"
          placeholder="Nota (opcional)"
          value={nota}
          onChange={e => setNota(e.target.value)}
        />
        <button
          disabled={!podeResgatar}
          onClick={async () => { await onResgatar(premio, nota); onClose() }}
          className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity ${
            podeResgatar
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90'
              : 'bg-stone-300 cursor-not-allowed opacity-60'
          }`}
        >
          {podeResgatar ? 'Confirmar resgate' : 'Saldo insuficiente'}
        </button>
      </Card>
    </div>
  )
}

// ─── Sub-página: catálogo de ações ───────────────────────────────────────────
function TabAcoes() {
  const { user } = useAuth()
  const { data: acoes, insert, update, remove, refetch } = useDB('recompensas_acoes', { order: 'ordem', asc: true })
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const empty = { nome: '', pontos: 1, emoji: '⭐', descricao: '', categoria: 'geral', ativo: true }
  const [form, setForm] = useState(empty)

  const handleSave = async () => {
    if (!form.nome.trim()) return
    const payload = { ...form, pontos: Math.max(0, parseInt(form.pontos) || 0) }
    if (editId) await update(editId, payload)
    else await insert({ ...payload, ordem: acoes.length })
    setForm(empty)
    setAdding(false)
    setEditId(null)
  }

  const startEdit = (a) => {
    setForm({ nome: a.nome, pontos: a.pontos, emoji: a.emoji || '⭐', descricao: a.descricao || '', categoria: a.categoria || 'geral', ativo: a.ativo !== false })
    setEditId(a.id)
    setAdding(true)
  }

  const handleSeed = async () => {
    setSeeding(true)
    for (const a of SEED_ACOES) await insert(a)
    setSeeding(false)
  }

  return (
    <div className="space-y-3">
      {acoes.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
          <div className="text-5xl">⭐</div>
          <div>
            <p className="font-bold text-stone-700 dark:text-stone-100">Nenhuma ação cadastrada</p>
            <p className="text-sm text-stone-400 mt-1">Comece com as 2 padrão (Saída com marido / sozinha) ou crie a sua.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSeed} disabled={seeding}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60">
              {seeding ? 'Criando...' : 'Carregar 2 padrão'}
            </button>
            <button onClick={() => setAdding(true)}
              className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-sm font-medium">
              + Criar do zero
            </button>
          </div>
        </div>
      )}

      {!adding && acoes.length > 0 && (
        <button onClick={() => { setAdding(true); setEditId(null); setForm(empty) }}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600">
          <Plus size={14}/> Nova ação
        </button>
      )}

      {adding && (
        <Card className="p-4 border-2 border-rose-200 dark:border-rose-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              {editId ? 'Editar ação' : 'Nova ação'}
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
              <input className="input-base flex-1" placeholder="Nome da ação *"
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
              <span className="text-xs text-stone-400">pontos</span>
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
        {acoes.map(a => (
          <Card key={a.id} className="p-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{a.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-700 dark:text-stone-200 text-sm">{a.nome}</p>
                {a.descricao && <p className="text-xs text-stone-400 truncate">{a.descricao}</p>}
              </div>
              <span className="text-rose-500 font-bold flex items-center gap-1 flex-shrink-0">
                <Zap size={12}/> {a.pontos}
              </span>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(a)} className="p-1.5 text-stone-300 hover:text-stone-600 rounded">
                  <Edit3 size={13}/>
                </button>
                <button onClick={() => remove(a.id)} className="p-1.5 text-stone-300 hover:text-red-400 rounded">
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

// ─── Sub-página: catálogo de prêmios ─────────────────────────────────────────
function TabPremios({ saldo, onResgatar }) {
  const { data: premios, insert, update, remove } = useDB('recompensas_premios', { order: 'ordem', asc: true })
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [resgatando, setResgatando] = useState(null)
  const empty = { nome: '', custo: 10, emoji: '🎁', descricao: '', ativo: true }
  const [form, setForm] = useState(empty)

  const handleSave = async () => {
    if (!form.nome.trim()) return
    const payload = { ...form, custo: Math.max(1, parseInt(form.custo) || 1) }
    if (editId) await update(editId, payload)
    else await insert({ ...payload, ordem: premios.length })
    setForm(empty)
    setAdding(false)
    setEditId(null)
  }

  const startEdit = (p) => {
    setForm({ nome: p.nome, custo: p.custo, emoji: p.emoji || '🎁', descricao: p.descricao || '', ativo: p.ativo !== false })
    setEditId(p.id)
    setAdding(true)
  }

  return (
    <div className="space-y-3">
      {premios.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
          <div className="text-5xl">🎁</div>
          <div>
            <p className="font-bold text-stone-700 dark:text-stone-100">Sem prêmios ainda</p>
            <p className="text-sm text-stone-400 mt-1">Crie prêmios que valem pontos (ex: Botox 20pts, jantar 30pts).</p>
          </div>
          <button onClick={() => setAdding(true)}
            className="px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold">
            <Plus size={14} className="inline mr-1"/> Criar prêmio
          </button>
        </div>
      )}

      {!adding && premios.length > 0 && (
        <button onClick={() => { setAdding(true); setEditId(null); setForm(empty) }}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600">
          <Plus size={14}/> Novo prêmio
        </button>
      )}

      {adding && (
        <Card className="p-4 border-2 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              {editId ? 'Editar prêmio' : 'Novo prêmio'}
            </h3>
            <button onClick={() => { setAdding(false); setEditId(null); setForm(empty) }} className="text-stone-400 hover:text-stone-600">
              <X size={16}/>
            </button>
          </div>
          <div className="space-y-2.5">
            <div className="flex gap-2">
              <input className="input-base w-20 text-center text-xl" placeholder="🎁"
                value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} maxLength={2}
              />
              <input className="input-base flex-1" placeholder="Nome do prêmio *"
                value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} autoFocus
              />
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-amber-500"/>
              <input type="number" min={1} max={10000}
                className="input-base w-24"
                value={form.custo}
                onChange={e => setForm(f => ({ ...f, custo: e.target.value }))}
              />
              <span className="text-xs text-stone-400">pontos pra resgatar</span>
            </div>
            <input className="input-base w-full"
              placeholder="Descrição (opcional)"
              value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
            />
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => { setAdding(false); setEditId(null); setForm(empty) }} className="px-3 py-2 text-sm text-stone-400 hover:text-stone-600">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600">
                {editId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {premios.map(p => {
          const podeResgatar = saldo >= p.custo
          return (
            <Card key={p.id} className={`p-4 ${podeResgatar ? 'border-amber-200 dark:border-amber-800' : ''}`}>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-stone-700 dark:text-stone-200 text-sm">{p.nome}</p>
                  {p.descricao && <p className="text-xs text-stone-400 truncate">{p.descricao}</p>}
                </div>
                <div className="flex gap-0.5">
                  <button onClick={() => startEdit(p)} className="p-1 text-stone-300 hover:text-stone-600 rounded">
                    <Edit3 size={12}/>
                  </button>
                  <button onClick={() => remove(p.id)} className="p-1 text-stone-300 hover:text-red-400 rounded">
                    <Trash2 size={12}/>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <Zap size={14}/> {p.custo}
                </span>
                <button
                  disabled={!podeResgatar}
                  onClick={() => setResgatando(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    podeResgatar
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:opacity-90'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  Resgatar
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      {resgatando && (
        <ResgatarPremioModal
          premio={resgatando}
          saldo={saldo}
          onClose={() => setResgatando(null)}
          onResgatar={onResgatar}
        />
      )}
    </div>
  )
}

// ─── Sub-página: histórico ───────────────────────────────────────────────────
function TabHistorico({ eventos, resgates, onRemoveEvento, onRemoveResgate }) {
  const items = useMemo(() => {
    const all = [
      ...eventos.map(e => ({ type: 'evento', ...e })),
      ...resgates.map(r => ({ type: 'resgate', ...r })),
    ]
    return all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [eventos, resgates])

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <History size={36} className="mx-auto mb-3 opacity-30"/>
        <p className="font-medium text-stone-500">Sem histórico ainda</p>
        <p className="text-xs mt-1">Quando registrar ação ou resgatar prêmio, aparece aqui.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <Card key={item.type + item.id} className="p-3 group">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              item.type === 'evento'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'
            }`}>
              {item.type === 'evento' ? <Sparkles size={16}/> : <Gift size={16}/>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
                {item.type === 'evento' ? item.acao_nome : item.premio_nome}
              </p>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span>{format(parseISO(item.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
                {item.fonte && item.fonte !== 'manual' && (
                  <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-500 text-[10px] uppercase tracking-wider">
                    {item.fonte}
                  </span>
                )}
                {item.nota && <span className="italic">"{item.nota}"</span>}
              </div>
            </div>
            <span className={`font-bold text-sm flex-shrink-0 flex items-center gap-1 ${
              item.type === 'evento' ? 'text-green-600' : 'text-rose-500'
            }`}>
              {item.type === 'evento' ? '+' : '−'}{item.type === 'evento' ? item.pontos : item.custo}
            </span>
            <button
              onClick={() => item.type === 'evento' ? onRemoveEvento(item.id) : onRemoveResgate(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-300 hover:text-red-400 rounded"
              title="Desfazer (corrige saldo)"
            >
              <Trash2 size={12}/>
            </button>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── Página principal ───────────────────────────────────────────────────────
const TABS = ['Visão geral', 'Ações', 'Prêmios', 'Histórico']

export function RecompensasPage() {
  const [tab, setTab] = useState(0)
  const [registrando, setRegistrando] = useState(false)

  const { data: acoes } = useDB('recompensas_acoes', { order: 'ordem', asc: true })
  const { data: eventos, insert: insertEvento, remove: removeEvento } = useDB('recompensas_eventos', { order: 'created_at', asc: false })
  const { data: resgates, insert: insertResgate, remove: removeResgate } = useDB('recompensas_resgates', { order: 'created_at', asc: false })

  const saldo = useMemo(() => {
    const ganho = eventos.reduce((s, e) => s + (e.pontos || 0), 0)
    const gasto = resgates.reduce((s, r) => s + (r.custo || 0), 0)
    return ganho - gasto
  }, [eventos, resgates])

  const totalGanho = eventos.reduce((s, e) => s + (e.pontos || 0), 0)
  const totalGasto = resgates.reduce((s, r) => s + (r.custo || 0), 0)
  const acoesAtivas = acoes.filter(a => a.ativo !== false)

  const handleRegistrarEvento = async (payload) => {
    await insertEvento(payload)
  }

  const handleResgatar = async (premio, nota) => {
    await insertResgate({
      premio_id: premio.id,
      premio_nome: premio.nome,
      custo: premio.custo,
      nota: nota?.trim() || null,
    })
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <PageHeader
        icon={Trophy}
        title="Recompensas"
        subtitle="Pontos da Vianka, prêmios pra resgatar"
      />

      {/* Saldo grande */}
      <Card className="p-5 bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-900/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center shadow-md">
              <Trophy className="w-7 h-7 text-white"/>
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">Saldo</p>
              <p className="text-4xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                <Zap className="text-amber-500" size={28}/> {saldo}
              </p>
            </div>
          </div>
          <button
            onClick={() => setRegistrando(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
          >
            <Plus size={16}/> Registrar ação
          </button>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-800/60 text-sm">
          <span className="text-stone-500 flex items-center gap-1">
            <Sparkles size={12} className="text-green-500"/>
            <span className="font-bold text-green-600">+{totalGanho}</span> ganho
          </span>
          <span className="text-stone-500 flex items-center gap-1">
            <Gift size={12} className="text-rose-500"/>
            <span className="font-bold text-rose-500">−{totalGasto}</span> gasto
          </span>
          <span className="text-stone-500 flex items-center gap-1">
            <History size={12}/>
            {eventos.length + resgates.length} eventos
          </span>
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

      <div>
        {tab === 0 && (
          <div className="space-y-3">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200 mb-3 flex items-center gap-2">
                <Star size={14} className="text-amber-500"/> Ações disponíveis
              </h3>
              {acoesAtivas.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-4">Nenhuma ação cadastrada. Vai na aba "Ações" pra criar.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {acoesAtivas.map(a => (
                    <button
                      key={a.id}
                      onClick={async () => {
                        await handleRegistrarEvento({
                          acao_id: a.id, acao_nome: a.nome, pontos: a.pontos, fonte: 'manual'
                        })
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-700 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all text-left group"
                    >
                      <span className="text-xl">{a.emoji}</span>
                      <span className="flex-1 text-sm font-medium text-stone-700 dark:text-stone-200">{a.nome}</span>
                      <span className="text-rose-500 font-bold flex items-center gap-1 group-hover:scale-110 transition-transform">
                        <Zap size={11}/> +{a.pontos}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Card>
            <p className="text-xs text-stone-400 text-center italic">
              Clica numa ação acima pra adicionar +pontos rapidinho. Pra mais opções (quantidade, nota), use "Registrar ação".
            </p>
          </div>
        )}
        {tab === 1 && <TabAcoes />}
        {tab === 2 && <TabPremios saldo={saldo} onResgatar={handleResgatar} />}
        {tab === 3 && (
          <TabHistorico
            eventos={eventos}
            resgates={resgates}
            onRemoveEvento={removeEvento}
            onRemoveResgate={removeResgate}
          />
        )}
      </div>

      {registrando && (
        <RegistrarAcaoModal
          acoes={acoesAtivas}
          onClose={() => setRegistrando(false)}
          onSave={handleRegistrarEvento}
        />
      )}
    </div>
  )
}

export default RecompensasPage
