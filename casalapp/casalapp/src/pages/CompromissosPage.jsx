// ─── CompromissosPage — "O Google Maps da Vida" ─────────────────────────────
// Unified: Compromissos + Pendências
import { useState, useMemo } from 'react'
import { useDB } from '../hooks/useDB'
import { format, isAfter, isBefore, isToday, parseISO, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus, X, Check, Clock, AlertCircle, Calendar, MapPin,
  Tag, ChevronRight, ChevronDown, Filter, Search,
  Star, Flame, Repeat, User, Users, ArrowRight,
  CheckCircle2, Circle, Trash2, Pencil, Bell, BellOff,
  ListTodo, CalendarDays, AlertTriangle, Sparkles
} from 'lucide-react'
import PageHeader from '../components/PageHeader'

const STATUS_OPTIONS = ['pendente', 'em andamento', 'concluído', 'cancelado']
const PRIORITY_OPTIONS = ['baixa', 'média', 'alta', 'urgente']
const TYPE_OPTIONS = ['compromisso', 'pendência', 'lembrete', 'tarefa', 'evento']
const OWNER_OPTIONS = ['casal', 'ele', 'ela']

const PRIORITY_COLORS = {
  baixa: 'text-teal-600 bg-teal-50 border-teal-200',
  média: 'text-amber-600 bg-amber-50 border-amber-200',
  alta: 'text-orange-600 bg-orange-50 border-orange-200',
  urgente: 'text-rose-600 bg-rose-50 border-rose-200'
}

const STATUS_COLORS = {
  pendente: 'text-amber-600 bg-amber-50',
  'em andamento': 'text-blue-600 bg-blue-50',
  concluído: 'text-teal-600 bg-teal-50',
  cancelado: 'text-stone-400 bg-stone-100'
}

const TYPE_ICONS = {
  compromisso: CalendarDays,
  pendência: ListTodo,
  lembrete: Bell,
  tarefa: CheckCircle2,
  evento: Sparkles
}

const EMPTY_FORM = {
  title: '', description: '', type: 'compromisso', priority: 'média',
  status: 'pendente', owner: 'casal', due_date: '', location: '',
  repeat: false, tags: ''
}

function statusBadge(status) {
  return (
    <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (STATUS_COLORS[status] || 'text-stone-500 bg-stone-100')}>
      {status}
    </span>
  )
}

function ItemCard({ item, onEdit, onToggle, onDelete }) {
  const TypeIcon = TYPE_ICONS[item.type] || CalendarDays
  const isOverdue = item.due_date && item.status !== 'concluído' && isBefore(parseISO(item.due_date), new Date())
  const isDueToday = item.due_date && isToday(parseISO(item.due_date))
  const isDueSoon = item.due_date && !isOverdue && !isDueToday && isBefore(parseISO(item.due_date), addDays(new Date(), 3))

  return (
    <div className={'card transition-all ' + (item.status === 'concluído' ? 'opacity-60' : '') + (isOverdue ? ' border-l-4 border-rose-400' : isDueToday ? ' border-l-4 border-amber-400' : isDueSoon ? ' border-l-4 border-blue-400' : '')}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(item)}
          className={'mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ' + (item.status === 'concluído' ? 'bg-teal-500 border-teal-500' : 'border-stone-300 hover:border-teal-400')}
        >
          {item.status === 'concluído' && <Check className="w-3 h-3 text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={'text-sm font-medium ' + (item.status === 'concluído' ? 'line-through text-stone-400' : 'text-stone-700')}>
                {item.title}
              </span>
              <span className={'text-xs px-1.5 py-0.5 rounded border ' + (PRIORITY_COLORS[item.priority] || '')}>
                {item.priority}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => onEdit(item)} className="text-stone-300 hover:text-stone-600 transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(item.id)} className="text-stone-300 hover:text-rose-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {item.description && <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">{item.description}</p>}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-stone-400">
              <TypeIcon className="w-3 h-3" /> {item.type}
            </span>
            {item.due_date && (
              <span className={'flex items-center gap-1 text-xs font-medium ' + (isOverdue ? 'text-rose-500' : isDueToday ? 'text-amber-500' : 'text-stone-400')}>
                <Calendar className="w-3 h-3" />
                {isOverdue ? 'Atrasado: ' : isDueToday ? 'Hoje: ' : ''}
                {format(parseISO(item.due_date), "d MMM", { locale: ptBR })}
              </span>
            )}
            {item.location && (
              <span className="flex items-center gap-1 text-xs text-stone-400">
                <MapPin className="w-3 h-3" /> {item.location}
              </span>
            )}
            {item.owner && item.owner !== 'casal' && (
              <span className="flex items-center gap-1 text-xs text-stone-400">
                <User className="w-3 h-3" /> {item.owner}
              </span>
            )}
            {statusBadge(item.status)}
          </div>
        </div>
      </div>
    </div>
  )
}

function ItemForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} className="card space-y-3 border-2 border-stone-200 mb-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <input className="input" placeholder="Título *" value={form.title} onChange={f('title')} required />
        </div>
        <select className="input" value={form.type} onChange={f('type')}>
          {TYPE_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
        </select>
        <select className="input" value={form.priority} onChange={f('priority')}>
          {PRIORITY_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
        </select>
        <input className="input" type="date" placeholder="Data limite" value={form.due_date} onChange={f('due_date')} />
        <select className="input" value={form.owner} onChange={f('owner')}>
          {OWNER_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
        </select>
        <input className="input col-span-2" placeholder="Local (opcional)" value={form.location} onChange={f('location')} />
        <textarea className="input col-span-2" placeholder="Descrição (opcional)" value={form.description} onChange={f('description')} rows={2} />
        <input className="input col-span-2" placeholder="Tags (separadas por vírgula)" value={form.tags} onChange={f('tags')} />
        <select className="input" value={form.status} onChange={f('status')}>
          {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
          <input type="checkbox" checked={form.repeat} onChange={e => setForm(p => ({ ...p, repeat: e.target.checked }))} className="w-4 h-4 rounded" />
          Recorrente
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">Salvar</button>
        <button type="button" onClick={onCancel} className="btn-icon"><X className="w-4 h-4" /></button>
      </div>
    </form>
  )
}

export function CompromissosPage() {
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('todas')
  const [ownerFilter, setOwnerFilter] = useState('todos')
  const [showFilters, setShowFilters] = useState(false)

  const { data: items, insert, update, remove } = useDB('compromissos')

  const handleSave = async (form) => {
    const payload = {
      ...form,
      due_date: form.due_date || null
    }
    await insert(payload)
    setAdding(false)
  }

  const handleUpdate = async (form) => {
    await update(editing.id, {
      ...form,
      due_date: form.due_date || null
    })
    setEditing(null)
  }

  const handleToggle = async (item) => {
    const next = item.status === 'concluído' ? 'pendente' : 'concluído'
    await update(item.id, { status: next })
  }

  const today = new Date()
  const overdue = items.filter(i => i.due_date && i.status !== 'concluído' && isBefore(parseISO(i.due_date), today))
  const dueToday = items.filter(i => i.due_date && isToday(parseISO(i.due_date)) && i.status !== 'concluído')
  const upcoming = items.filter(i => i.due_date && isAfter(parseISO(i.due_date), addDays(today, 0)) && !isToday(parseISO(i.due_date)) && i.status !== 'concluído')

  const filtered = useMemo(() => {
    let list = items
    if (filter === 'pendentes') list = list.filter(i => i.status === 'pendente' || i.status === 'em andamento')
    else if (filter === 'concluídos') list = list.filter(i => i.status === 'concluído')
    else if (filter === 'atrasados') list = list.filter(i => i.due_date && isBefore(parseISO(i.due_date), today) && i.status !== 'concluído')
    else if (filter === 'hoje') list = list.filter(i => i.due_date && isToday(parseISO(i.due_date)))
    if (priorityFilter !== 'todas') list = list.filter(i => i.priority === priorityFilter)
    if (ownerFilter !== 'todos') list = list.filter(i => i.owner === ownerFilter)
    if (search) list = list.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase()))
    return list.sort((a, b) => {
      const pOrder = { urgente: 0, alta: 1, média: 2, baixa: 3 }
      if (a.status === 'concluído' && b.status !== 'concluído') return 1
      if (b.status === 'concluído' && a.status !== 'concluído') return -1
      return (pOrder[a.priority] || 2) - (pOrder[b.priority] || 2)
    })
  }, [items, filter, search, priorityFilter, ownerFilter])

  const FILTER_TABS = [
    { key: 'todos', label: 'Todos', count: items.length },
    { key: 'pendentes', label: 'Pendentes', count: items.filter(i => i.status === 'pendente' || i.status === 'em andamento').length },
    { key: 'hoje', label: 'Hoje', count: dueToday.length },
    { key: 'atrasados', label: 'Atrasados', count: overdue.length },
    { key: 'concluídos', label: 'Feitos', count: items.filter(i => i.status === 'concluído').length },
  ]

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <PageHeader
        title="Compromissos"
        subtitle="Sua bússola da vida a dois"
        action={
          <button className="btn-primary flex items-center gap-1.5" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        }
      />

      {(overdue.length > 0 || dueToday.length > 0) && (
        <div className="space-y-2 mb-4">
          {overdue.length > 0 && (
            <div className="card border-l-4 border-rose-400 bg-rose-50">
              <p className="text-sm font-semibold text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {overdue.length} item(s) em atraso
              </p>
            </div>
          )}
          {dueToday.length > 0 && (
            <div className="card border-l-4 border-amber-400 bg-amber-50">
              <p className="text-sm font-semibold text-amber-600 flex items-center gap-2">
                <Bell className="w-4 h-4" /> {dueToday.length} item(s) para hoje
              </p>
            </div>
          )}
        </div>
      )}

      {adding && <ItemForm onSave={handleSave} onCancel={() => setAdding(false)} />}
      {editing && <ItemForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} />}

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          className="input pl-9"
          placeholder="Buscar compromissos e pendências..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-3 no-scrollbar">
        {FILTER_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ' + (filter === t.key ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')}
          >
            {t.label} {t.count > 0 && <span className={'ml-1 ' + (filter === t.key ? 'opacity-70' : 'text-stone-400')}>{t.count}</span>}
          </button>
        ))}
        <button
          onClick={() => setShowFilters(f => !f)}
          className={'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ' + (showFilters ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500')}
        >
          <Filter className="w-3 h-3" /> Filtros
        </button>
      </div>

      {showFilters && (
        <div className="card mb-3 flex gap-3 flex-wrap">
          <div>
            <p className="text-xs text-stone-400 mb-1">Prioridade</p>
            <div className="flex gap-1 flex-wrap">
              {['todas', ...PRIORITY_OPTIONS].map(p => (
                <button key={p} onClick={() => setPriorityFilter(p)}
                  className={'px-2 py-1 rounded text-xs font-medium transition-colors ' + (priorityFilter === p ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500')}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-stone-400 mb-1">Responsável</p>
            <div className="flex gap-1">
              {['todos', ...OWNER_OPTIONS].map(o => (
                <button key={o} onClick={() => setOwnerFilter(o)}
                  className={'px-2 py-1 rounded text-xs font-medium transition-colors ' + (ownerFilter === o ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500')}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <CalendarDays className="w-10 h-10 text-stone-200 mx-auto mb-2" />
            <p className="text-stone-400 text-sm">Nenhum item encontrado</p>
          </div>
        )}
        {filtered.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onEdit={(i) => { setEditing(i); setAdding(false) }}
            onToggle={handleToggle}
            onDelete={remove}
          />
        ))}
      </div>
    </div>
  )
}
