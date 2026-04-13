import { useState, useMemo, useEffect } from 'react'
import { useDB } from '../hooks/useDB'
import PageHeader from '../components/PageHeader'
import { CheckCircle2, Circle, Plus, Trash2, Clock, CalendarDays, BarChart3, ListTodo, Flame, Star, ChevronDown, ChevronUp, Bell, BellOff } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { scheduleTodoAlarm, cancelTodoAlarm, rescheduleAllAlarms, requestPermission, getPermissionStatus, isNotificationSupported } from '../lib/notifications'

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
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={String(dash) + ' ' + String(circ)} strokeLinecap="round" />
      </svg>
      <span className="absolute text-lg font-bold" style={{color}}>{pct}%</span>
    </div>
  )
}

function MiniBar({ value, max, color }) {
  const w = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="flex-1 bg-gray-100 rounded-full h-2">
      <div className="h-2 rounded-full transition-all" style={{ width: w + '%', backgroundColor: color }} />
    </div>
  )
}

export function TodoPage() {
  const { data: todos, insert, remove, update } = useDB('todos')
  const [filterPerson, setFilterPerson] = useState('Todos')
  const [filterStatus, setFilterStatus] = useState('Todos')
  const [adding, setAdding] = useState(false)
  const [notifPerm, setNotifPerm] = useState(() => getPermissionStatus())
  const [form, setForm] = useState({
    title: '', description: '', person: 'Bruno', priority: 'media',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '12:00'
  })

  // Re-agenda alarmes quando o app abre
  useEffect(() => {
    if (todos && todos.length > 0 && notifPerm === 'granted') {
      rescheduleAllAlarms(todos)
    }
  }, [todos, notifPerm])

  async function handleRequestPermission() {
    const result = await requestPermission()
    setNotifPerm(getPermissionStatus())
    if (result.ok) {
      alert('Notificacoes ativadas! Voce sera avisado 30 minutos antes de cada tarefa.')
    } else {
      alert('Permissao de notificacoes negada. Ative nas configuracoes do navegador.')
    }
  }

  const filtered = useMemo(() => {
    if (!todos) return []
    return todos.filter(t => {
      const matchPerson = filterPerson === 'Todos' || t.person === filterPerson
      const matchStatus = filterStatus === 'Todos' || (filterStatus === 'Feito' ? t.done : !t.done)
      return matchPerson && matchStatus
    })
  }, [todos, filterPerson, filterStatus])

  const now = new Date()
  function isOverdue(t) {
    if (t.done || !t.date) return false
    const due = new Date(t.date + 'T' + (t.time || '23:59'))
    return due < now
  }
  function isToday(t) {
    if (!t.date) return false
    return t.date === format(now, 'yyyy-MM-dd')
  }

  const stats = useMemo(() => {
    if (!todos) return { total: 0, done: 0, pending: 0, overdue: 0, bruno: [0,0], vianka: [0,0] }
    const total = todos.length
    const done = todos.filter(t => t.done).length
    const pending = todos.filter(t => !t.done).length
    const overdue = todos.filter(t => isOverdue(t)).length
    const brunoTotal = todos.filter(t => t.person === 'Bruno' || t.person === 'Ambos').length
    const brunoDone = todos.filter(t => (t.person === 'Bruno' || t.person === 'Ambos') && t.done).length
    const viankaTotal = todos.filter(t => t.person === 'Vianka' || t.person === 'Ambos').length
    const viankaDone = todos.filter(t => (t.person === 'Vianka' || t.person === 'Ambos') && t.done).length
    return { total, done, pending, overdue, bruno: [brunoDone, brunoTotal], vianka: [viankaDone, viankaTotal] }
  }, [todos])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    const inserted = await insert({ ...form, done: false })
    if (inserted && inserted[0] && notifPerm === 'granted') {
      scheduleTodoAlarm({ ...form, id: inserted[0].id })
    }
    setForm({ title: '', description: '', person: 'Bruno', priority: 'media', date: format(new Date(), 'yyyy-MM-dd'), time: '12:00' })
    setAdding(false)
  }

  async function handleToggle(todo) {
    await update(todo.id, { done: !todo.done })
    if (!todo.done) {
      cancelTodoAlarm(todo.id)
    } else if (notifPerm === 'granted') {
      scheduleTodoAlarm(todo)
    }
  }

  async function handleDelete(id) {
    await remove(id)
    cancelTodoAlarm(id)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="To-Do List"
        subtitle="Tarefas do casal"
        action={
          <div className="flex gap-2">
            {isNotificationSupported() && (
              <button
                onClick={handleRequestPermission}
                title={notifPerm === 'granted' ? 'Notificacoes ativas' : 'Ativar notificacoes'}
                className={`p-2 rounded-lg border text-sm flex items-center gap-1 ${notifPerm === 'granted' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                {notifPerm === 'granted' ? <Bell size={16} /> : <BellOff size={16} />}
              </button>
            )}
            <button onClick={() => setAdding(a => !a)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Adicionar
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: <ListTodo size={22} />, val: stats.total, label: 'Total', color: 'text-stone-500' },
          { icon: <CheckCircle2 size={22} />, val: stats.done, label: 'Concluidas', color: 'text-green-500' },
          { icon: <Clock size={22} />, val: stats.pending, label: 'Pendentes', color: 'text-amber-500' },
          { icon: <Flame size={22} />, val: stats.overdue, label: 'Atrasadas', color: 'text-red-500' },
        ].map(({ icon, val, label, color }) => (
          <div key={label} className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
            <div className={`text-2xl font-bold ${color}`}>{val}</div>
            <div className="text-xs text-stone-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="text-sm font-semibold text-stone-600 mb-3 flex items-center gap-2"><BarChart3 size={16} /> Progresso Geral</h3>
        <div className="flex items-center gap-4">
          <PieChart done={stats.done} total={stats.total} />
          <div className="flex-1 space-y-2 text-sm">
            {[['Bruno', stats.bruno, '#3b82f6'], ['Vianka', stats.vianka, '#ec4899'], ['Geral', [stats.done, stats.total], '#f59e0b']].map(([name, [d, t], color]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-14 text-stone-500">{name}</span>
                <MiniBar value={d} max={t} color={color} />
                <span className="text-stone-400 text-xs w-10 text-right">{d}/{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['Todos', ...PERSONS].map(p => (
          <button key={p} onClick={() => setFilterPerson(p)}
            className={`px-3 py-1 rounded-full text-sm border transition-all ${filterPerson === p ? 'bg-amber-400 text-white border-amber-400 font-semibold' : 'bg-white text-stone-500 border-stone-200 hover:border-amber-300'}`}>
            {p}
          </button>
        ))}
        <span className="mx-1 border-l border-stone-200" />
        {['Todos', 'Pendente', 'Feito'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-sm border transition-all ${filterStatus === s ? 'bg-stone-800 text-white border-stone-800 font-semibold' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}>
            {s}
          </button>
        ))}
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
          <h3 className="font-semibold text-stone-700">Nova Tarefa</h3>
          <input className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-300"
            placeholder="O que fazer?" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required />
          <textarea className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-300 resize-none"
            placeholder="Descricao" rows={2} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Para quem</label>
              <select className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
                value={form.person} onChange={e => setForm(f => ({...f, person: e.target.value}))}>
                {PERSONS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Prioridade</label>
              <select className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
                value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value}))}>
                {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Data</label>
              <input type="date" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
                value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Hora</label>
              <input type="time" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
                value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))} />
            </div>
          </div>
          {notifPerm !== 'granted' && isNotificationSupported() && (
            <div className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 border border-amber-200">
              Ative as notificacoes para receber alertas 30 min antes da tarefa.
              <button type="button" onClick={handleRequestPermission} className="ml-2 underline font-semibold">Ativar agora</button>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setAdding(false)} className="btn-ghost text-sm">Cancelar</button>
            <button type="submit" className="btn-primary text-sm">Adicionar tarefa</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center text-stone-400 py-8">Nenhuma tarefa encontrada</p>}
        {filtered.map(todo => (
          <div key={todo.id} className={`bg-white rounded-xl border p-4 flex items-start gap-3 transition-all ${todo.done ? 'opacity-60' : isOverdue(todo) ? 'border-red-200 bg-red-50/30' : 'border-stone-200'}`}>
            <button onClick={() => handleToggle(todo)} className="mt-0.5 flex-shrink-0 text-stone-400 hover:text-green-500 transition-colors">
              {todo.done ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${todo.done ? 'line-through text-stone-400' : 'text-stone-700'}`}>{todo.title}</p>
              {todo.description && <p className="text-xs text-stone-400 mt-0.5 truncate">{todo.description}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PERSON_COLORS[todo.person] || ''}`}>{todo.person}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_COLORS[todo.priority] || ''}`}>{PRIORITY_LABELS[todo.priority] || todo.priority}</span>
                {todo.date && (
                  <span className={`text-xs flex items-center gap-1 ${isOverdue(todo) ? 'text-red-500' : 'text-stone-400'}`}>
                    <CalendarDays size={12} />
                    {format(new Date(todo.date + 'T12:00'), 'dd/MM/yyyy', { locale: ptBR })}
                    {todo.time && <span className="flex items-center gap-1"><Clock size={12} />{todo.time}</span>}
                  </span>
                )}
                {isToday(todo) && !todo.done && <span className="text-xs text-amber-500 flex items-center gap-1"><Star size={12} /> Hoje</span>}
              </div>
            </div>
            <button onClick={() => handleDelete(todo.id)} className="flex-shrink-0 text-stone-300 hover:text-red-400 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
