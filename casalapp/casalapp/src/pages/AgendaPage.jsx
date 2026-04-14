import { useState, useMemo } from 'react'
import { useDB } from '../hooks/useDB'
import {
  CalendarDays, Plus, X, Edit3, Trash2, ChevronLeft,
  ChevronRight, Clock, MapPin, Users, Bell, Tag, Heart, Plane, Gem, Star
} from 'lucide-react'
import PageHeader from '../components/PageHeader'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

const TIPO_CONFIG = {
  compromisso: { label: 'Compromisso', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  date:         { label: 'Date ❤️',      color: 'bg-rose-100 text-rose-700',  dot: 'bg-rose-500' },
  viagem:       { label: 'Viagem ✈️',    color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  casamento:    { label: 'Casamento 💍', color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  saude:        { label: 'Saúde',        color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  aniversario:  { label: 'Aniversário 🎉', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  outro:        { label: 'Outro',        color: 'bg-stone-100 text-stone-600',  dot: 'bg-stone-400' },
}

function Badge({ children, className='' }) {
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
}
function Card({ children, className='' }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-stone-100 ${className}`}>{children}</div>
}
function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-stone-300" strokeWidth={1.5} />
      </div>
      <p className="font-medium text-stone-500 mb-1">{title}</p>
      <p className="text-sm text-stone-400">{desc}</p>
    </div>
  )
}
const iCls = { backgroundColor:'#fff', color:'#1c1917', border:'1px solid #d6d3d1', borderRadius:'8px', padding:'8px 12px', fontSize:'14px', width:'100%', outline:'none' }
const sCls = { ...iCls }
const fmt = (v) => v ? new Date(v + 'T12:00:00').toLocaleDateString('pt-BR') : '—'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export function AgendaPage() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)
  const [view, setView] = useState('mes') // 'mes' | 'lista'
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const empty = { titulo:'', data:'', hora:'', local:'', tipo:'compromisso', descricao:'', lembrete:false, recorrente:false }
  const [form, setForm] = useState(empty)
  const set = (k,v) => setForm(p => ({...p,[k]:v}))

  const { data: eventos, loading, insert, update, remove } = useDB('agenda_casal', { order:'data', asc:true })

  const handleSubmit = async () => {
    if (!form.titulo.trim() || !form.data) return
    const payload = { titulo:form.titulo, data:form.data, hora:form.hora||null, local:form.local||null, tipo:form.tipo, descricao:form.descricao||null, lembrete:form.lembrete, recorrente:form.recorrente }
    if (editItem) { await update(editItem.id, payload); setEditItem(null) }
    else await insert(payload)
    setForm(empty); setShowForm(false)
  }
  const startEdit = (e) => {
    setForm({ titulo:e.titulo, data:e.data, hora:e.hora||'', local:e.local||'', tipo:e.tipo||'compromisso', descricao:e.descricao||'', lembrete:!!e.lembrete, recorrente:!!e.recorrente })
    setEditItem(e); setShowForm(true)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  const eventosByDay = useMemo(() => {
    const map = {}
    eventos.forEach(e => {
      if (!e.data) return
      const d = e.data
      if (!map[d]) map[d] = []
      map[d].push(e)
    })
    return map
  }, [eventos])

  const monthStr = String(viewMonth+1).padStart(2,'0')
  const monthPrefix = `${viewYear}-${monthStr}`
  const eventosDoMes = eventos.filter(e => e.data && e.data.startsWith(monthPrefix))
  const eventosHoje = eventos.filter(e => e.data === today.toISOString().slice(0,10))
  const proximos = eventos.filter(e => e.data >= today.toISOString().slice(0,10)).slice(0,5)

  const selectedDateStr = selectedDay != null
    ? `${viewYear}-${monthStr}-${String(selectedDay).padStart(2,'0')}`
    : null
  const eventosSelected = selectedDateStr ? (eventosByDay[selectedDateStr] || []) : []

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y-1); setViewMonth(11) }
    else setViewMonth(m => m-1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y+1); setViewMonth(0) }
    else setViewMonth(m => m+1)
    setSelectedDay(null)
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <PageHeader icon={CalendarDays} title="Agenda" subtitle="Calendário compartilhado do casal" />

      {/* Próximos hoje */}
      {eventosHoje.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border-rose-100">
          <p className="text-xs font-semibold text-rose-500 mb-2">📅 Hoje</p>
          {eventosHoje.map(e => (
            <div key={e.id} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${TIPO_CONFIG[e.tipo]?.dot || 'bg-stone-400'}`} />
              <span className="text-sm font-medium text-stone-700">{e.titulo}</span>
              {e.hora && <span className="text-xs text-stone-400">{e.hora}</span>}
            </div>
          ))}
        </Card>
      )}

      {/* View toggle + Add */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
          {['mes','lista'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${view===v ? 'bg-white text-amber-600 shadow-sm' : 'text-stone-400'}`}>
              {v === 'mes' ? '📅 Mês' : '📋 Lista'}
            </button>
          ))}
        </div>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(empty) }}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          <Plus className="w-4 h-4" /> Evento
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">{editItem ? 'Editar Evento' : 'Novo Evento'}</h3>
            <button onClick={() => { setShowForm(false); setEditItem(null) }}><X className="w-4 h-4 text-stone-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Título *</label>
              <input style={iCls} value={form.titulo} onChange={e=>set('titulo',e.target.value)} placeholder="Consulta médica, Aniversário, Date..." />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Data *</label>
              <input type="date" style={iCls} value={form.data} onChange={e=>set('data',e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Horário</label>
              <input type="time" style={iCls} value={form.hora} onChange={e=>set('hora',e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Tipo</label>
              <select style={sCls} value={form.tipo} onChange={e=>set('tipo',e.target.value)}>
                {Object.entries(TIPO_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Local</label>
              <input style={iCls} value={form.local} onChange={e=>set('local',e.target.value)} placeholder="Endereço, nome do lugar..." />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Descrição</label>
              <textarea style={{...iCls,resize:'none'}} rows={2} value={form.descricao} onChange={e=>set('descricao',e.target.value)} placeholder="Detalhes do evento..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-sm font-medium">
              {editItem ? 'Salvar' : 'Adicionar'}
            </button>
            <button onClick={() => { setShowForm(false); setEditItem(null) }} className="px-4 py-2 text-stone-500 text-sm">Cancelar</button>
          </div>
        </Card>
      )}

      {/* CALENDAR VIEW */}
      {view === 'mes' && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-stone-100 rounded-lg"><ChevronLeft className="w-4 h-4 text-stone-500" /></button>
            <span className="font-semibold text-stone-700">{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="p-2 hover:bg-stone-100 rounded-lg"><ChevronRight className="w-4 h-4 text-stone-500" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_SHORT.map(d => <div key={d} className="text-center text-xs font-medium text-stone-400 py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({length: firstDay}).map((_,i) => <div key={'e'+i} />)}
            {Array.from({length: daysInMonth}).map((_,i) => {
              const day = i+1
              const dateStr = `${viewYear}-${monthStr}-${String(day).padStart(2,'0')}`
              const dayEvents = eventosByDay[dateStr] || []
              const isToday = dateStr === today.toISOString().slice(0,10)
              const isSelected = selectedDay === day
              return (
                <button key={day} onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`relative p-1.5 rounded-xl text-sm font-medium flex flex-col items-center gap-0.5 transition-all ${isSelected ? 'bg-amber-500 text-white' : isToday ? 'bg-amber-100 text-amber-700' : 'hover:bg-stone-50 text-stone-700'}`}>
                  {day}
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5">
                      {dayEvents.slice(0,3).map((e,j) => (
                        <div key={j} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : TIPO_CONFIG[e.tipo]?.dot || 'bg-stone-400'}`} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          {eventosSelected.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                {fmt(selectedDateStr)}
              </p>
              {eventosSelected.map(e => (
                <div key={e.id} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${TIPO_CONFIG[e.tipo]?.dot || 'bg-stone-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-stone-800 text-sm">{e.titulo}</span>
                      <Badge className={TIPO_CONFIG[e.tipo]?.color || ''}>{TIPO_CONFIG[e.tipo]?.label}</Badge>
                    </div>
                    {e.hora && <p className="text-xs text-stone-400 mt-0.5">⏰ {e.hora}</p>}
                    {e.local && <p className="text-xs text-stone-400">📍 {e.local}</p>}
                    {e.descricao && <p className="text-xs text-stone-500 italic mt-0.5">{e.descricao}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(e)} className="p-1 text-stone-300 hover:text-amber-500"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => remove(e.id)} className="p-1 text-stone-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {selectedDay && eventosSelected.length === 0 && (
            <div className="mt-4 pt-4 border-t border-stone-100 text-center">
              <p className="text-sm text-stone-400">Nenhum evento nesse dia</p>
              <button onClick={() => { setShowForm(true); setForm(f => ({...f, data: selectedDateStr})) }}
                className="mt-2 text-amber-500 text-sm hover:underline">+ Adicionar evento</button>
            </div>
          )}
        </Card>
      )}

      {/* LIST VIEW */}
      {view === 'lista' && (
        loading ? <p className="text-center text-stone-400 py-8">Carregando...</p> :
        proximos.length === 0 ? <EmptyState icon={CalendarDays} title="Agenda vazia" desc="Adicione compromissos, dates e eventos especiais" /> :
        <div className="space-y-2">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-1">Próximos eventos</p>
          {proximos.map(e => (
            <Card key={e.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${TIPO_CONFIG[e.tipo]?.color || 'bg-stone-100 text-stone-500'}`}>
                    <CalendarDays className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-stone-800">{e.titulo}</span>
                      <Badge className={TIPO_CONFIG[e.tipo]?.color || ''}>{TIPO_CONFIG[e.tipo]?.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-stone-400 flex-wrap">
                      <span>📅 {fmt(e.data)}</span>
                      {e.hora && <span>⏰ {e.hora}</span>}
                      {e.local && <span>📍 {e.local}</span>}
                    </div>
                    {e.descricao && <p className="text-xs text-stone-500 italic mt-1">{e.descricao}</p>}
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => startEdit(e)} className="p-1 text-stone-300 hover:text-amber-500"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => remove(e.id)} className="p-1 text-stone-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
export default AgendaPage
