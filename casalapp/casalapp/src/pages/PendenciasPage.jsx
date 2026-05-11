import { useState, useMemo } from 'react'
import { useDB } from '../hooks/useDB'
import PageHeader from '../components/PageHeader'
import {
  Plus, Trash2, Edit3, ChevronLeft, ChevronRight,
  ListTodo, Briefcase, Clock, AlertCircle, CheckCircle2, X,
  Flag,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const COLUMNS = [
  { key: 'todo',  label: 'A Fazer',    emoji: '📋', accent: 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700', dot: 'bg-stone-400' },
  { key: 'doing', label: 'Fazendo',    emoji: '⚡', accent: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  { key: 'done',  label: 'Concluído',  emoji: '✅', accent: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800', dot: 'bg-green-500' },
]

const PERSONS = ['Bruno', 'Vianka', 'Ambos']
const PERSON_COLORS = {
  Bruno:  'bg-blue-100 text-blue-700 border-blue-200',
  Vianka: 'bg-pink-100 text-pink-700 border-pink-200',
  Ambos:  'bg-purple-100 text-purple-700 border-purple-200',
}

const PRIORITIES = ['baixa', 'media', 'alta']
const PRIO_COLORS = {
  alta:  'text-red-600 bg-red-50 border-red-200',
  media: 'text-amber-600 bg-amber-50 border-amber-200',
  baixa: 'text-green-600 bg-green-50 border-green-200',
}
const PRIO_LABEL = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }

const TAGS_TRABALHO = [
  'Trabalho', 'Reunião', 'Estudo', 'Saúde',
  'Burocracia', 'Casa', 'Finanças', 'Outro',
]

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function TaskCard({ task, onMove, onEdit, onDelete }) {
  const colIdx = COLUMNS.findIndex(c => c.key === (task.kanban_status || 'todo'))
  const isOverdue = task.due_date && !task.done && task.kanban_status !== 'done' &&
    new Date(task.due_date + 'T' + (task.due_time || '23:59')) < new Date()

  return (
    <Card className={`p-3 space-y-2 ${isOverdue ? 'border-red-300 dark:border-red-700' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-medium text-stone-700 dark:text-stone-200 ${task.kanban_status === 'done' ? 'line-through text-stone-400' : ''}`}>
          {task.title}
        </p>
        <div className="flex gap-0.5 flex-shrink-0">
          <button onClick={() => onEdit(task)} className="p-1 text-stone-300 hover:text-stone-600 dark:hover:text-stone-300">
            <Edit3 size={12}/>
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 text-stone-300 hover:text-red-400">
            <Trash2 size={12}/>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-stone-400 dark:text-stone-500 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {task.person && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${PERSON_COLORS[task.person] || ''}`}>
            {task.person}
          </span>
        )}
        {task.priority && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${PRIO_COLORS[task.priority] || ''}`}>
            {PRIO_LABEL[task.priority] || task.priority}
          </span>
        )}
        {task.due_date && (
          <span className={`text-[10px] flex items-center gap-1 ${isOverdue ? 'text-red-600 font-semibold' : 'text-stone-400'}`}>
            <Clock size={10}/>
            {format(new Date(task.due_date + 'T12:00'), 'dd/MM', { locale: ptBR })}
            {task.due_time && ` · ${task.due_time}`}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 pt-1 border-t border-stone-100 dark:border-stone-700">
        <button
          onClick={() => onMove(task, -1)}
          disabled={colIdx <= 0}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={12}/>
          {colIdx > 0 ? COLUMNS[colIdx-1].label : ''}
        </button>
        <button
          onClick={() => onMove(task, +1)}
          disabled={colIdx >= COLUMNS.length-1}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {colIdx < COLUMNS.length-1 ? COLUMNS[colIdx+1].label : ''}
          <ChevronRight size={12}/>
        </button>
      </div>
    </Card>
  )
}

export function PendenciasPage() {
  const { data: todos, insert, update, remove } = useDB('todos', { order: 'created_at', asc: false })
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [filterPerson, setFilterPerson] = useState('Todos')
  const empty = {
    title: '', description: '', person: 'Bruno', priority: 'media',
    due_date: '', due_time: '', kanban_status: 'todo',
  }
  const [form, setForm] = useState(empty)

  const grouped = useMemo(() => {
    const g = { todo: [], doing: [], done: [] }
    for (const t of todos || []) {
      const key = t.kanban_status || (t.done ? 'done' : 'todo')
      const k = g[key] ? key : 'todo'
      if (filterPerson !== 'Todos' && t.person !== filterPerson && t.person !== 'Ambos') continue
      g[k].push(t)
    }
    return g
  }, [todos, filterPerson])

  const stats = useMemo(() => ({
    total: todos.length,
    todo:  grouped.todo.length,
    doing: grouped.doing.length,
    done:  grouped.done.length,
    overdue: todos.filter(t => t.due_date && t.kanban_status !== 'done' &&
      new Date(t.due_date + 'T' + (t.due_time || '23:59')) < new Date()).length,
  }), [todos, grouped])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = {
      ...form,
      due_date: form.due_date || null,
      due_time: form.due_time || null,
      done: form.kanban_status === 'done',
    }
    if (editId) await update(editId, payload)
    else await insert(payload)
    setForm(empty)
    setAdding(false)
    setEditId(null)
  }

  const startEdit = (t) => {
    setForm({
      title: t.title || '',
      description: t.description || '',
      person: t.person || 'Bruno',
      priority: t.priority || 'media',
      due_date: t.due_date || '',
      due_time: t.due_time || '',
      kanban_status: t.kanban_status || 'todo',
    })
    setEditId(t.id)
    setAdding(true)
  }

  const handleMove = async (task, dir) => {
    const idx = COLUMNS.findIndex(c => c.key === (task.kanban_status || 'todo'))
    const next = COLUMNS[idx + dir]
    if (!next) return
    await update(task.id, { kanban_status: next.key, done: next.key === 'done' })
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      <PageHeader
        icon={Briefcase}
        title="Pendências"
        subtitle="Trabalho, obrigações e tarefas do dia a dia"
        action={
          <button
            onClick={() => { setAdding(true); setEditId(null); setForm(empty) }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={14}/> Nova
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: ListTodo,      val: stats.todo,    label: 'A Fazer',   color: 'text-stone-500' },
          { icon: Clock,         val: stats.doing,   label: 'Fazendo',   color: 'text-amber-500' },
          { icon: CheckCircle2,  val: stats.done,    label: 'Concluído', color: 'text-green-500' },
          { icon: AlertCircle,   val: stats.overdue, label: 'Atrasadas', color: 'text-red-500' },
        ].map(({ icon: Icon, val, label, color }) => (
          <Card key={label} className="p-3 text-center">
            <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
            <div className={`text-xl font-bold ${color}`}>{val}</div>
            <div className="text-[10px] text-stone-400 mt-0.5">{label}</div>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-1.5">
        {['Todos', ...PERSONS].map(p => (
          <button
            key={p}
            onClick={() => setFilterPerson(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              filterPerson === p
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white dark:bg-stone-700 text-stone-500 dark:text-stone-300 border-stone-200 dark:border-stone-600 hover:border-stone-400'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Form */}
      {adding && (
        <Card className="p-4 border-2 border-amber-200 dark:border-amber-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              {editId ? 'Editar pendência' : 'Nova pendência'}
            </h3>
            <button onClick={() => { setAdding(false); setEditId(null); setForm(empty) }}
              className="text-stone-400 hover:text-stone-600">
              <X size={16}/>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              required autoFocus
              className="input-base w-full"
              placeholder="O que precisa fazer? *"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <textarea
              className="input-base w-full resize-none"
              rows={2}
              placeholder="Detalhes (opcional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <select className="input-base" value={form.person} onChange={e => setForm(f => ({ ...f, person: e.target.value }))}>
                {PERSONS.map(p => <option key={p}>{p}</option>)}
              </select>
              <select className="input-base" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p} value={p}>{PRIO_LABEL[p]}</option>)}
              </select>
              <input type="date" className="input-base" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              <input type="time" className="input-base" value={form.due_time} onChange={e => setForm(f => ({ ...f, due_time: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-stone-400 font-medium mb-1 block">Status inicial</label>
              <div className="flex gap-1.5">
                {COLUMNS.map(c => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, kanban_status: c.key }))}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      form.kanban_status === c.key
                        ? `${c.accent} text-stone-700 dark:text-stone-200 ring-1 ring-stone-300 dark:ring-stone-500`
                        : 'bg-white dark:bg-stone-700 text-stone-400 border-stone-200 dark:border-stone-600'
                    }`}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setAdding(false); setEditId(null); setForm(empty) }}
                className="px-3 py-2 text-sm text-stone-400 hover:text-stone-600">
                Cancelar
              </button>
              <button type="submit" className="btn-primary text-sm">
                {editId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {COLUMNS.map(col => (
          <div key={col.key} className={`rounded-2xl border-2 p-3 ${col.accent} min-h-[200px]`}>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{col.emoji}</span>
                <h3 className="font-bold text-sm text-stone-700 dark:text-stone-200">{col.label}</h3>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${col.dot} text-white font-bold`}>
                  {grouped[col.key].length}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {grouped[col.key].length === 0 && (
                <p className="text-center text-xs text-stone-400 dark:text-stone-500 py-6 italic">
                  Vazio
                </p>
              )}
              {grouped[col.key].map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onMove={handleMove}
                  onEdit={startEdit}
                  onDelete={remove}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PendenciasPage
