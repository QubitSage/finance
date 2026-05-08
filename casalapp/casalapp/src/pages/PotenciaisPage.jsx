import { useState, useMemo } from 'react'
import { useDB } from '../hooks/useDB'
import PageHeader from '../components/PageHeader'
import {
  Plus, Trash2, Edit3, Check, X, Heart, Sparkles, Lightbulb, MessageCircle,
  ChevronDown, ChevronUp, Lock,
} from 'lucide-react'

const DONOS = [
  { key: 'bruno',  label: 'Bruno',  emoji: '🧔', accent: 'blue'  },
  { key: 'vianka', label: 'Vianka', emoji: '👩', accent: 'rose'  },
]

const STATUS = {
  novo:        { label: 'Novo',          color: 'bg-stone-50 text-stone-600 border-stone-200' },
  observando:  { label: 'Observando',    color: 'bg-blue-50 text-blue-700 border-blue-200' },
  conversando: { label: 'Conversando',   color: 'bg-amber-50 text-amber-700 border-amber-200' },
  encontro:    { label: 'Encontro marcado', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  rolou:       { label: 'Rolou',         color: 'bg-green-50 text-green-700 border-green-200' },
  arquivado:   { label: 'Arquivado',     color: 'bg-stone-100 text-stone-400 border-stone-200' },
}

const ACCENT = {
  blue: { ring: 'border-blue-200', soft: 'bg-blue-50', strong: 'bg-blue-500 hover:bg-blue-600', text: 'text-blue-700' },
  rose: { ring: 'border-rose-200', soft: 'bg-rose-50', strong: 'bg-rose-500 hover:bg-rose-600', text: 'text-rose-700' },
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {children}
    </span>
  )
}

function ListaPotenciais({ dono, accent }) {
  const { data, insert, update, remove } = useDB('potenciais', { filter: { dono }, order: 'created_at', asc: false })
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [openId, setOpenId] = useState(null)
  const empty = { nome: '', descricao: '', status: 'novo', ideias: '', notas: '' }
  const [form, setForm] = useState(empty)

  const stats = useMemo(() => {
    const s = { total: data.length }
    Object.keys(STATUS).forEach(k => { s[k] = data.filter(d => d.status === k).length })
    return s
  }, [data])

  const handleSave = async () => {
    if (!form.nome.trim()) return
    if (editId) {
      await update(editId, form)
      setEditId(null)
    } else {
      await insert({ ...form, dono })
      setAdding(false)
    }
    setForm(empty)
  }

  const startEdit = (p) => {
    setForm({
      nome: p.nome || '',
      descricao: p.descricao || '',
      status: p.status || 'novo',
      ideias: p.ideias || '',
      notas: p.notas || '',
    })
    setEditId(p.id)
    setAdding(false)
  }

  const cancel = () => { setAdding(false); setEditId(null); setForm(empty) }

  const a = ACCENT[accent] || ACCENT.blue

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <Card className={`p-4 ${a.soft} ${a.ring} border`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className={`font-bold text-lg ${a.text}`}>
              {stats.total} potencia{stats.total === 1 ? 'l' : 'is'}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              {stats.observando + stats.conversando} ativos
              {' · '}{stats.encontro} encontro(s) marcado(s)
              {' · '}{stats.rolou} rolaram
            </p>
          </div>
          {!adding && editId === null && (
            <button onClick={() => { setAdding(true); setForm(empty) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-sm font-medium transition-colors ${a.strong}`}>
              <Plus size={14} /> Adicionar
            </button>
          )}
        </div>
      </Card>

      {/* Form */}
      {(adding || editId !== null) && (
        <Card className="p-4 border-2 border-rose-100">
          <p className="text-sm font-semibold text-stone-600 mb-3">
            {editId ? 'Editar potencial' : 'Novo potencial'}
          </p>
          <div className="space-y-2.5">
            <input className="input-base w-full" placeholder="Nome ou apelido *"
              value={form.nome} onChange={e => setForm(f => ({...f, nome: e.target.value}))} autoFocus />
            <textarea className="input-base w-full min-h-[60px]" placeholder="Quem é, onde conheceu, contexto..."
              value={form.descricao} onChange={e => setForm(f => ({...f, descricao: e.target.value}))} />
            <div>
              <label className="text-xs text-stone-400 font-medium mb-1 block flex items-center gap-1">
                <Lightbulb size={12} /> Como podemos explorar
              </label>
              <textarea className="input-base w-full min-h-[60px]" placeholder="Ideias de aproximação, tipo de encontro, fantasia..."
                value={form.ideias} onChange={e => setForm(f => ({...f, ideias: e.target.value}))} />
            </div>
            <textarea className="input-base w-full min-h-[44px]" placeholder="Notas extras (opcional)"
              value={form.notas} onChange={e => setForm(f => ({...f, notas: e.target.value}))} />
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(STATUS).map(([k, v]) => (
                <button key={k} type="button" onClick={() => setForm(f => ({...f, status: k}))}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                    ${form.status === k ? `${v.color} ring-2 ring-offset-1 ring-stone-400` : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'}`}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} className={`px-4 py-2 rounded-xl text-white text-sm font-medium ${a.strong}`}>
              {editId ? 'Salvar' : 'Adicionar'}
            </button>
            <button onClick={cancel} className="px-3 py-2 text-stone-400 hover:text-stone-600 text-sm">
              Cancelar
            </button>
          </div>
        </Card>
      )}

      {/* Lista */}
      {data.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-12 text-stone-400">
          <Sparkles size={36} className="mb-3 opacity-30" />
          <p className="font-medium text-stone-500">Nenhum potencial ainda</p>
          <p className="text-sm mt-1">Adicione pessoas e como vocês podem explorar.</p>
        </div>
      )}

      <div className="space-y-2">
        {data.map(p => {
          const isOpen = openId === p.id
          const stConf = STATUS[p.status] || STATUS.novo
          return (
            <Card key={p.id} className="overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
                onClick={() => setOpenId(isOpen ? null : p.id)}>
                <Heart size={16} className={a.text + ' flex-shrink-0'} />
                <span className="font-semibold text-sm text-stone-700 dark:text-stone-100 flex-1 truncate">
                  {p.nome}
                </span>
                <Badge className={stConf.color}>{stConf.label}</Badge>
                {isOpen ? <ChevronUp size={14} className="text-stone-400" /> : <ChevronDown size={14} className="text-stone-400" />}
              </div>
              {isOpen && (
                <div className="border-t border-stone-100 dark:border-stone-700 px-4 py-3 space-y-3 text-sm bg-stone-50/60 dark:bg-stone-900/40">
                  {p.descricao && (
                    <div>
                      <p className="text-xs text-stone-400 font-medium mb-0.5 flex items-center gap-1">
                        <MessageCircle size={11} /> Contexto
                      </p>
                      <p className="text-stone-700 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">{p.descricao}</p>
                    </div>
                  )}
                  {p.ideias && (
                    <div>
                      <p className="text-xs text-stone-400 font-medium mb-0.5 flex items-center gap-1">
                        <Lightbulb size={11} /> Como podemos explorar
                      </p>
                      <p className="text-stone-700 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">{p.ideias}</p>
                    </div>
                  )}
                  {p.notas && (
                    <div>
                      <p className="text-xs text-stone-400 font-medium mb-0.5">Notas</p>
                      <p className="text-stone-700 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">{p.notas}</p>
                    </div>
                  )}
                  <div className="flex gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-700">
                    <button onClick={() => startEdit(p)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-stone-500 hover:text-stone-700 rounded-lg hover:bg-white dark:hover:bg-stone-700">
                      <Edit3 size={11}/> Editar
                    </button>
                    <button onClick={() => remove(p.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-stone-400 hover:text-red-500 rounded-lg hover:bg-white dark:hover:bg-stone-700">
                      <Trash2 size={11}/> Apagar
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export function PotenciaisPage() {
  const [tab, setTab] = useState(0)
  const dono = DONOS[tab]

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Cabeçalho mobile */}
      <div className="sticky top-0 z-20 bg-white dark:bg-stone-800 border-b border-stone-100 dark:border-stone-700 shadow-sm md:hidden">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <h1 className="text-base font-bold text-stone-800 dark:text-stone-100">Potenciais ✨</h1>
          <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-300 px-2.5 py-1 rounded-full font-medium">
            <Lock size={10} /> Privado
          </span>
        </div>
        <div className="flex gap-1.5 px-4 pb-3">
          {DONOS.map((d, i) => (
            <button key={d.key} onClick={() => setTab(i)}
              className={
                'flex-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ' +
                (tab === i
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600')
              }
            >
              {d.emoji} {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cabeçalho desktop */}
      <div className="hidden md:block px-6 pt-6 pb-2">
        <PageHeader
          title="Potenciais"
          subtitle="Quem o casal está de olho — Bruno e Vianka, cada um com sua lista"
          action={
            <span className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-700 px-3 py-1.5 rounded-full">
              <Lock size={10} /> Privado
            </span>
          }
        />
        <div className="flex gap-1.5 mt-4">
          {DONOS.map((d, i) => (
            <button key={d.key} onClick={() => setTab(i)}
              className={
                'px-4 py-2 rounded-full text-sm font-medium transition-all ' +
                (tab === i
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:border-rose-300 dark:hover:border-rose-700')
              }
            >
              {d.emoji} {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 py-4 md:px-6 md:py-4">
        <ListaPotenciais dono={dono.key} accent={dono.accent} />
      </div>
    </div>
  )
}
