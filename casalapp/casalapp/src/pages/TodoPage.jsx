import { useState, useMemo } from 'react'
import { useDB } from '../hooks/useDB'
import PageHeader from '../components/PageHeader'
import { CheckCircle2, Circle, Plus, Trash2, Clock, CalendarDays, BarChart3, ListTodo, Flame, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const PERSONS = ['Bruno', 'Vianka', 'Ambos']
const PRIORITIES = ['alta', 'media', 'baixa']
const PRIORITY_LABELS = { alta: 'Alta', media: 'Media', baixa: 'Baixa' }
const PRIORITY_COLORS = { alta: 'text-red-500 bg-red-50 border-red-200', media: 'text-amber-500 bg-amber-50 border-amber-200', baixa: 'text-green-600 bg-green-50 border-green-200' }
const PRIORITY_DOT = { alta: 'bg-red-500', media: 'bg-amber-400', baixa: 'bg-green-500' }
const PERSON_COLORS = { Bruno: 'bg-blue-100 text-blue-700 border-blue-200', Vianka: 'bg-pink-100 text-pink-700 border-pink-200', Ambos: 'bg-purple-100 text-purple-700 border-purple-200' }

function PieChart({ done, total }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const r = 36, circ = 2 * Math.PI * r, dash = (pct / 100) * circ
  const color = pct === 100 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={String(dash) + " " + String(circ)} strokeLinecap="round" />
      </svg>
      <span className="absolute text-lg font-bold text-stone-700">{pct}%</span>
    </div>
  )
}

function MiniBar({ label, done, total, color }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-14 text-stone-500 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
        <div className={["h-full rounded-full transition-all", color].join(" ")} style={{ width: pct + '%' }} />
      </div>
      <span className="w-10 text-right text-stone-500 text-xs">{done}/{total}</span>
    </div>
  )
}

export function TodoPage() {
  const { data: todos, insert, update, remove } = useDB('todos', { order: 'due_date', asc: true })
  const [adding, setAdding] = useState(false)
  const [filterPerson, setFilterPerson] = useState('Todos')
  const [filterStatus, setFilterStatus] = useState('Todos')
  const [expandedId, setExpandedId] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', person: 'Bruno', priority: 'media', due_date: format(new Date(), 'yyyy-MM-dd'), due_time: '12:00', done: false })

  const stats = useMemo(() => {
    const total = todos.length
    const done = todos.filter(t => t.done).length
    const pending = total - done
    const brunoTotal = todos.filter(t => t.person === 'Bruno' || t.person === 'Ambos').length
    const brunoDone = todos.filter(t => (t.person === 'Bruno' || t.person === 'Ambos') && t.done).length
    const viankaTotal = todos.filter(t => t.person === 'Vianka' || t.person === 'Ambos').length
    const viankaDone = todos.filter(t => (t.person === 'Vianka' || t.person === 'Ambos') && t.done).length
    const overdueCount = todos.filter(t => !t.done && t.due_date && new Date(t.due_date + 'T23:59') < new Date()).length
    return { total, done, pending, brunoTotal, brunoDone, viankaTotal, viankaDone, overdueCount }
  }, [todos])

  const filtered = useMemo(() => todos.filter(t => {
    const personOk = filterPerson === 'Todos' || t.person === filterPerson
    const statusOk = filterStatus === 'Todos' || (filterStatus === 'Feito' && t.done) || (filterStatus === 'Pendente' && !t.done)
    return personOk && statusOk
  }), [todos, filterPerson, filterStatus])

  const handleAdd = async (e) => {
    e.preventDefault()
    await insert({ ...form, done: false })
    setForm({ title: '', description: '', person: 'Bruno', priority: 'media', due_date: format(new Date(), 'yyyy-MM-dd'), due_time: '12:00', done: false })
    setAdding(false)
  }

  const toggleDone = async (t) => { await update(t.id, { done: !t.done }) }
  const isOverdue = (t) => !t.done && t.due_date && new Date(t.due_date + 'T23:59') < new Date()
  const isToday = (t) => t.due_date && t.due_date === format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <PageHeader title="To-Do List" subtitle="Tarefas do casal" action={<button className="btn-primary flex items-center gap-1.5" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4" /> Adicionar</button>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-stone-100 p-3 flex flex-col items-center gap-1 shadow-sm"><ListTodo className="w-5 h-5 text-stone-400" /><span className="text-2xl font-bold text-stone-700">{stats.total}</span><span className="text-xs text-stone-400">Total</span></div>
        <div className="bg-white rounded-xl border border-stone-100 p-3 flex flex-col items-center gap-1 shadow-sm"><CheckCircle2 className="w-5 h-5 text-green-500" /><span className="text-2xl font-bold text-green-600">{stats.done}</span><span className="text-xs text-stone-400">Concluidas</span></div>
        <div className="bg-white rounded-xl border border-stone-100 p-3 flex flex-col items-center gap-1 shadow-sm"><Clock className="w-5 h-5 text-amber-500" /><span className="text-2xl font-bold text-amber-600">{stats.pending}</span><span className="text-xs text-stone-400">Pendentes</span></div>
        <div className="bg-white rounded-xl border border-stone-100 p-3 flex flex-col items-center gap-1 shadow-sm"><Flame className="w-5 h-5 text-red-500" /><span className="text-2xl font-bold text-red-500">{stats.overdueCount}</span><span className="text-xs text-stone-400">Atrasadas</span></div>
      </div>
      <div className="bg-white rounded-xl border border-stone-100 p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-stone-400" /><span className="text-sm font-semibold text-stone-600">Progresso Geral</span></div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <PieChart done={stats.done} total={stats.total} />
          <div className="flex-1 w-full space-y-3">
            <MiniBar label="Bruno" done={stats.brunoDone} total={stats.brunoTotal} color="bg-blue-400" />
            <MiniBar label="Vianka" done={stats.viankaDone} total={stats.viankaTotal} color="bg-pink-400" />
            <MiniBar label="Geral" done={stats.done} total={stats.total} color="bg-amber-400" />
          </div>
        </div>
      </div>
      {adding && (
        <div className="bg-white rounded-xl border border-amber-200 p-4 mb-6 shadow-sm">
          <p className="text-sm font-semibold text-stone-600 mb-3">Nova Tarefa</p>
          <form onSubmit={handleAdd} className="space-y-3">
            <input className="input w-full" placeholder="O que fazer?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <textarea className="input w-full resize-none" placeholder="Descricao" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-stone-500 mb-1 block">Para quem</label><select className="input w-full" value={form.person} onChange={e => setForm({ ...form, person: e.target.value })}>{PERSONS.map(p => <option key={p}>{p}</option>)}</select></div>
              <div><label className="text-xs text-stone-500 mb-1 block">Prioridade</label><select className="input w-full" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>{PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-stone-500 mb-1 block">Data</label><input className="input w-full" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
              <div><label className="text-xs text-stone-500 mb-1 block">Hora</label><input className="input w-full" type="time" value={form.due_time} onChange={e => setForm({ ...form, due_time: e.target.value })} /></div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setAdding(false)} className="btn-ghost text-sm">Cancelar</button>
              <button type="submit" className="btn-primary text-sm">Salvar</button>
            </div>
          </form>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-4">
        {['Todos', 'Bruno', 'Vianka', 'Ambos'].map(p => (
          <button key={p} onClick={() => setFilterPerson(p)} className={["px-3 py-1 rounded-full text-xs border font-medium", filterPerson === p ? "bg-amber-500 text-white border-amber-500" : "bg-white text-stone-500 border-stone-200"].join(" ")}>{p}</button>
        ))}
        {['Todos', 'Pendente', 'Feito'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={["px-3 py-1 rounded-full text-xs border font-medium", filterStatus === s ? "bg-stone-700 text-white border-stone-700" : "bg-white text-stone-500 border-stone-200"].join(" ")}>{s}</button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && <div className="text-center py-12 text-stone-400"><p className="text-sm">Nenhuma tarefa encontrada</p></div>}
        {filtered.map(t => (
          <div key={t.id} className={["bg-white rounded-xl border transition-all shadow-sm", t.done ? "border-green-100 opacity-70" : isOverdue(t) ? "border-red-200" : "border-stone-100"].join(" ")}>
            <div className="flex items-center gap-3 p-3">
              <button onClick={() => toggleDone(t)} className="shrink-0">
                {t.done ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-stone-300" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={["text-sm font-medium truncate", t.done ? "line-through text-stone-400" : "text-stone-700"].join(" ")}>{t.title}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className={["text-xs px-2 py-0.5 rounded-full border font-medium", PERSON_COLORS[t.person] || "bg-stone-100 text-stone-500 border-stone-200"].join(" ")}>{t.person}</span>
                  <span className={["text-xs px-2 py-0.5 rounded-full border font-medium", PRIORITY_COLORS[t.priority]].join(" ")}>{PRIORITY_LABELS[t.priority]}</span>
                  {t.due_date && <span className={["text-xs", isOverdue(t) ? "text-red-500" : "text-stone-400"].join(" ")}>{format(new Date(t.due_date + 'T12:00'), 'dd MMM', { locale: ptBR })}{t.due_time && " " + t.due_time}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setExpandedId(expandedId === t.id ? null : t.id)} className="p-1 text-stone-300">{expandedId === t.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
                <button onClick={() => remove(t.id)} className="p-1 text-stone-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            {expandedId === t.id && t.description && <div className="px-4 pb-3"><p className="text-xs text-stone-500 bg-stone-50 rounded-lg p-2">{t.description}</p></div>}
          </div>
        ))}
      </div>
      {stats.done > 0 && (
        <div className="mt-6 bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-700 mb-1">{stats.done} tarefa(s) concluida(s)</p>
          <p className="text-xs text-green-600">Otimo trabalho! Continuem assim.</p>
        </div>
      )}
    </div>
  )
}
