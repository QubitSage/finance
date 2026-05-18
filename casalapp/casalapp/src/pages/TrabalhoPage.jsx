import { useState, useMemo } from 'react'
import { useDB } from '../hooks/useDB'
import PageHeader from '../components/PageHeader'
import {
  Briefcase, Plus, Trash2, Edit3, X, Phone, Video, Calendar,
  ChevronDown, ChevronUp, Check, Circle, Link as LinkIcon,
  GripVertical, AlertCircle, DollarSign, Repeat,
} from 'lucide-react'
import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const COLUNAS = [
  { key: 'a_fazer',  label: 'A Fazer',  emoji: '📥', accent: 'border-blue-300 dark:border-blue-800',   head: 'text-blue-700 dark:text-blue-300',   dot: 'bg-blue-500' },
  { key: 'revisao',  label: 'Revisão',  emoji: '🔍', accent: 'border-amber-300 dark:border-amber-800', head: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  { key: 'mensal',   label: 'Mensal',   emoji: '🔁', accent: 'border-violet-300 dark:border-violet-800', head: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500' },
  { key: 'entregue', label: 'Entregue', emoji: '✅', accent: 'border-green-300 dark:border-green-800', head: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
]

const fmtBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

// ─── Card de cliente ────────────────────────────────────────────────────────
function ClienteCard({ cliente, entregas, colIdx, onMove, onEdit, onDelete, onAddEntrega, onToggleEntrega, onRemoveEntrega, onDragStart, dragging }) {
  const [expanded, setExpanded] = useState(false)
  const [addingData, setAddingData] = useState(false)
  const [novaData, setNovaData] = useState('')
  const [novaDesc, setNovaDesc] = useState('')

  const entregasOrdenadas = useMemo(
    () => [...entregas].sort((a, b) => (a.data || '').localeCompare(b.data || '')),
    [entregas]
  )
  const pendentes = entregasOrdenadas.filter(e => !e.feito)
  const proxima = pendentes[0]
  const hoje = new Date()
  const diasProxima = proxima?.data ? differenceInCalendarDays(parseISO(proxima.data), hoje) : null
  const atrasada = diasProxima != null && diasProxima < 0

  const handleAddData = async () => {
    if (!novaData) return
    await onAddEntrega(cliente.id, { data: novaData, descricao: novaDesc.trim() || null })
    setNovaData(''); setNovaDesc(''); setAddingData(false)
  }

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(cliente.id) }}
      className={`bg-white dark:bg-stone-800 rounded-xl border shadow-sm p-3 space-y-2 cursor-grab active:cursor-grabbing transition-all ${
        dragging ? 'opacity-40' : ''
      } ${atrasada ? 'border-red-300 dark:border-red-700' : 'border-stone-200 dark:border-stone-700'}`}
    >
      {/* Topo */}
      <div className="flex items-start gap-1.5">
        <GripVertical size={14} className="text-stone-300 mt-0.5 flex-shrink-0"/>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{cliente.nome}</p>
            {cliente.recorrente && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-bold flex items-center gap-0.5">
                <Repeat size={8}/> Recorrente
              </span>
            )}
          </div>
          {cliente.status_atual && (
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{cliente.status_atual}</p>
          )}
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          <button onClick={() => onEdit(cliente)} className="p-1 text-stone-300 hover:text-stone-600"><Edit3 size={12}/></button>
          <button onClick={() => onDelete(cliente.id)} className="p-1 text-stone-300 hover:text-red-400"><Trash2 size={12}/></button>
        </div>
      </div>

      {/* Infos */}
      <div className="flex flex-wrap gap-1.5 text-[11px]">
        {cliente.telefone && (
          <a href={`https://wa.me/${cliente.telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100">
            <Phone size={10}/> {cliente.telefone}
          </a>
        )}
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
          <Video size={10}/> {cliente.qtd_videos || 0} vídeo(s)
        </span>
        {cliente.valor > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
            <DollarSign size={10}/> {fmtBRL(cliente.valor)}
          </span>
        )}
        {cliente.link && (
          <a href={cliente.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100">
            <LinkIcon size={10}/> Material
          </a>
        )}
      </div>

      {/* Próxima entrega */}
      {proxima && (
        <div className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg ${
          atrasada ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
        }`}>
          {atrasada ? <AlertCircle size={11}/> : <Calendar size={11}/>}
          <span className="font-medium">
            {atrasada ? 'Atrasada: ' : 'Próx. entrega: '}
            {format(parseISO(proxima.data), "dd/MM", { locale: ptBR })}
          </span>
          {diasProxima != null && (
            <span className="opacity-75">
              ({diasProxima === 0 ? 'hoje' : diasProxima > 0 ? `em ${diasProxima}d` : `${Math.abs(diasProxima)}d atrás`})
            </span>
          )}
        </div>
      )}

      {/* Toggle entregas */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-center gap-1 text-[11px] text-stone-400 hover:text-stone-600 py-0.5"
      >
        <Calendar size={10}/>
        {expanded ? 'Esconder' : 'Entregas'} ({entregas.length})
        {expanded ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
      </button>

      {expanded && (
        <div className="space-y-1 pt-1 border-t border-stone-100 dark:border-stone-700">
          {entregasOrdenadas.map(e => (
            <div key={e.id} className="group flex items-center gap-1.5 text-[11px] px-1.5 py-1 rounded hover:bg-stone-50 dark:hover:bg-stone-700/50">
              <button onClick={() => onToggleEntrega(e)} className={e.feito ? 'text-green-500' : 'text-stone-300 hover:text-stone-500'}>
                {e.feito ? <Check size={13}/> : <Circle size={13}/>}
              </button>
              <span className={`flex-shrink-0 ${e.feito ? 'line-through text-stone-400' : 'text-stone-600 dark:text-stone-300 font-medium'}`}>
                {e.data ? format(parseISO(e.data), "dd/MM/yy", { locale: ptBR }) : '—'}
              </span>
              {e.descricao && <span className="flex-1 text-stone-400 truncate">{e.descricao}</span>}
              <button onClick={() => onRemoveEntrega(e.id)} className="opacity-0 group-hover:opacity-100 p-0.5 text-stone-300 hover:text-red-400 ml-auto">
                <Trash2 size={10}/>
              </button>
            </div>
          ))}

          {addingData ? (
            <div className="flex flex-col gap-1.5 bg-stone-50 dark:bg-stone-700/50 rounded-lg p-2">
              <input type="date" className="input-base text-xs" value={novaData} onChange={e => setNovaData(e.target.value)} autoFocus />
              <input className="input-base text-xs" placeholder="Descrição (opcional)" value={novaDesc} onChange={e => setNovaDesc(e.target.value)} />
              <div className="flex gap-1.5">
                <button onClick={handleAddData} className="flex-1 py-1 rounded-lg bg-stone-700 text-white text-xs font-medium">Adicionar</button>
                <button onClick={() => { setAddingData(false); setNovaData(''); setNovaDesc('') }} className="px-2 py-1 text-stone-400 text-xs">Cancelar</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingData(true)}
              className="w-full flex items-center justify-center gap-1 py-1 rounded-lg border border-dashed border-stone-300 dark:border-stone-600 text-[11px] text-stone-400 hover:text-stone-600 hover:border-stone-400">
              <Plus size={10}/> Nova data de entrega
            </button>
          )}
        </div>
      )}

      {/* Mover (fallback mobile / sem arrastar) */}
      <div className="flex gap-1 pt-1 border-t border-stone-100 dark:border-stone-700">
        {COLUNAS.map((c, i) => (
          <button
            key={c.key}
            onClick={() => onMove(cliente, c.key)}
            disabled={i === colIdx}
            className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${
              i === colIdx
                ? `${c.dot} text-white`
                : 'bg-stone-100 dark:bg-stone-700 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
            title={`Mover pra ${c.label}`}
          >
            {c.emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Página ─────────────────────────────────────────────────────────────────
export function TrabalhoPage() {
  const { data: clientes, insert, update, remove } = useDB('trabalho_clientes', { order: 'ordem', asc: true })
  const { data: entregas, insert: insertEntrega, update: updateEntrega, remove: removeEntrega } = useDB('trabalho_entregas', { order: 'data', asc: true })

  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const empty = { nome: '', telefone: '', qtd_videos: 0, status_atual: '', valor: '', link: '', notas: '', recorrente: false, coluna: 'a_fazer' }
  const [form, setForm] = useState(empty)

  const entregasPorCliente = useMemo(() => {
    const m = {}
    for (const c of clientes) m[c.id] = []
    for (const e of entregas) { if (m[e.cliente_id]) m[e.cliente_id].push(e) }
    return m
  }, [clientes, entregas])

  const porColuna = useMemo(() => {
    const g = { a_fazer: [], revisao: [], mensal: [], entregue: [] }
    for (const c of clientes) {
      const k = g[c.coluna] ? c.coluna : 'a_fazer'
      g[k].push(c)
    }
    return g
  }, [clientes])

  const stats = useMemo(() => {
    const hoje = new Date()
    let atrasados = 0
    let valorTotal = 0
    for (const c of clientes) {
      valorTotal += parseFloat(c.valor) || 0
      const pend = (entregasPorCliente[c.id] || []).filter(e => !e.feito && e.data)
      if (pend.some(e => differenceInCalendarDays(parseISO(e.data), hoje) < 0)) atrasados++
    }
    return { total: clientes.length, atrasados, valorTotal }
  }, [clientes, entregasPorCliente])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nome.trim()) return
    const payload = {
      ...form,
      qtd_videos: parseInt(form.qtd_videos) || 0,
      valor: parseFloat(String(form.valor).replace(',', '.')) || 0,
      telefone: form.telefone || null,
      status_atual: form.status_atual || null,
      link: form.link || null,
      notas: form.notas || null,
    }
    if (editId) await update(editId, payload)
    else await insert({ ...payload, ordem: clientes.length })
    setForm(empty); setAdding(false); setEditId(null)
  }

  const startEdit = (c) => {
    setForm({
      nome: c.nome || '', telefone: c.telefone || '', qtd_videos: c.qtd_videos || 0,
      status_atual: c.status_atual || '', valor: c.valor || '', link: c.link || '',
      notas: c.notas || '', recorrente: !!c.recorrente, coluna: c.coluna || 'a_fazer',
    })
    setEditId(c.id); setAdding(true)
  }

  const moveToColumn = async (cliente, colKey) => {
    if (cliente.coluna === colKey) return
    await update(cliente.id, { coluna: colKey })
  }

  const handleDrop = async (colKey) => {
    if (!draggedId) return
    const cliente = clientes.find(c => c.id === draggedId)
    if (cliente) await moveToColumn(cliente, colKey)
    setDraggedId(null)
    setDragOverCol(null)
  }

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4">
      <PageHeader
        icon={Briefcase}
        title="Trabalho"
        subtitle="Kanban de clientes — arrasta os cards entre as colunas"
        action={
          <button onClick={() => { setAdding(true); setEditId(null); setForm(empty) }}
            className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14}/> Cliente
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-stone-700 dark:text-stone-200">{stats.total}</p>
          <p className="text-[10px] text-stone-400 mt-0.5">Clientes</p>
        </Card>
        <Card className="p-3 text-center">
          <p className={`text-xl font-bold ${stats.atrasados > 0 ? 'text-red-500' : 'text-stone-700 dark:text-stone-200'}`}>{stats.atrasados}</p>
          <p className="text-[10px] text-stone-400 mt-0.5">Com entrega atrasada</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">{fmtBRL(stats.valorTotal)}</p>
          <p className="text-[10px] text-stone-400 mt-0.5">Valor total</p>
        </Card>
      </div>

      {/* Form */}
      {adding && (
        <Card className="p-4 border-2 border-stone-300 dark:border-stone-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              {editId ? 'Editar cliente' : 'Novo cliente'}
            </h3>
            <button onClick={() => { setAdding(false); setEditId(null); setForm(empty) }} className="text-stone-400 hover:text-stone-600">
              <X size={16}/>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input required autoFocus className="input-base" placeholder="Nome *"
                value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              <input className="input-base" placeholder="Telefone (WhatsApp)"
                value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-stone-400 mb-0.5 block">Qtd. vídeos</label>
                <input type="number" min={0} className="input-base w-full"
                  value={form.qtd_videos} onChange={e => setForm(f => ({ ...f, qtd_videos: e.target.value }))} />
              </div>
              <div>
                <label className="text-[11px] text-stone-400 mb-0.5 block">Valor (R$)</label>
                <input type="number" min={0} step="0.01" className="input-base w-full" placeholder="0"
                  value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} />
              </div>
              <div>
                <label className="text-[11px] text-stone-400 mb-0.5 block">Coluna</label>
                <select className="input-base w-full" value={form.coluna} onChange={e => setForm(f => ({ ...f, coluna: e.target.value }))}>
                  {COLUNAS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <input className="input-base w-full" placeholder="Status atual (ex: Aguardando material, Editando...)"
              value={form.status_atual} onChange={e => setForm(f => ({ ...f, status_atual: e.target.value }))} />
            <input className="input-base w-full" placeholder="Link do material / pasta (opcional)"
              value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
            <textarea className="input-base w-full resize-none" rows={2} placeholder="Notas (opcional)"
              value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
              <input type="checkbox" checked={form.recorrente}
                onChange={e => setForm(f => ({ ...f, recorrente: e.target.checked }))}
                className="w-4 h-4 rounded" />
              Cliente recorrente (várias entregas)
            </label>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setAdding(false); setEditId(null); setForm(empty) }}
                className="px-3 py-2 text-sm text-stone-400 hover:text-stone-600">Cancelar</button>
              <button type="submit" className="btn-primary text-sm">{editId ? 'Salvar' : 'Adicionar'}</button>
            </div>
          </form>
          {editId && (
            <p className="text-[11px] text-stone-400 mt-2">
              💡 As datas de entrega são gerenciadas direto no card (botão "Entregas").
            </p>
          )}
        </Card>
      )}

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {COLUNAS.map((col, colIdx) => (
          <div
            key={col.key}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key) }}
            onDragLeave={() => setDragOverCol(c => c === col.key ? null : c)}
            onDrop={() => handleDrop(col.key)}
            className={`flex-shrink-0 w-[280px] rounded-2xl border-2 p-3 transition-colors ${col.accent} ${
              dragOverCol === col.key ? 'bg-stone-100 dark:bg-stone-700/60' : 'bg-stone-50 dark:bg-stone-800/40'
            }`}
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-lg">{col.emoji}</span>
              <h3 className={`font-bold text-sm ${col.head}`}>{col.label}</h3>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${col.dot} text-white font-bold ml-auto`}>
                {porColuna[col.key].length}
              </span>
            </div>
            <div className="space-y-2 min-h-[120px]">
              {porColuna[col.key].length === 0 && (
                <p className="text-center text-xs text-stone-400 italic py-8">
                  Arrasta um cliente pra cá
                </p>
              )}
              {porColuna[col.key].map(c => (
                <ClienteCard
                  key={c.id}
                  cliente={c}
                  colIdx={colIdx}
                  entregas={entregasPorCliente[c.id] || []}
                  dragging={draggedId === c.id}
                  onDragStart={setDraggedId}
                  onMove={moveToColumn}
                  onEdit={startEdit}
                  onDelete={remove}
                  onAddEntrega={(clienteId, payload) => insertEntrega({ ...payload, cliente_id: clienteId })}
                  onToggleEntrega={(e) => updateEntrega(e.id, { feito: !e.feito })}
                  onRemoveEntrega={removeEntrega}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrabalhoPage
