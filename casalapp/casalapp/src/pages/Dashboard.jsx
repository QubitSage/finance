import { useDB } from '../hooks/useDB'
import { useSettings } from '../hooks/useSettings'
import { fmt, monthLabel, monthKey, TX_CATEGORIES } from '../lib/utils'
import { format, subMonths, addMonths, differenceInDays } from 'date-fns'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet,
  Heart, Sparkles, Home, Gem, Briefcase, CalendarDays, Target,
  Globe, Camera, CheckCircle2, Smile, SmilePlus, Frown, Meh,
  Flame, Star
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import PageHeader from '../components/PageHeader'

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="card">
      <div className={bg + ' w-8 h-8 rounded-lg flex items-center justify-center mb-3'}>
        <Icon className={color + ' w-4 h-4'} strokeWidth={1.8} />
      </div>
      <p className="stat-label">{label}</p>
      <p className="text-xl font-semibold font-display text-stone-800">{value}</p>
    </div>
  )
}

const HUMOR_OPTIONS = [
  { v: 1, icon: Frown,   label: 'Difícil',   color: 'text-red-400',    bg: 'bg-red-50',    active: 'bg-red-500 text-white' },
  { v: 2, icon: Meh,     label: 'Ok',        color: 'text-amber-400',  bg: 'bg-amber-50',  active: 'bg-amber-500 text-white' },
  { v: 3, icon: Smile,   label: 'Bem',       color: 'text-green-400',  bg: 'bg-green-50',  active: 'bg-green-500 text-white' },
  { v: 4, icon: SmilePlus, label: 'Ótimo',  color: 'text-emerald-500', bg: 'bg-emerald-50', active: 'bg-emerald-500 text-white' },
  { v: 5, icon: Star,    label: 'Incrível',  color: 'text-violet-500', bg: 'bg-violet-50', active: 'bg-violet-500 text-white' },
]

function HumorWidget({ user }) {
  const today = new Date().toISOString().slice(0,10)
  const { data: humores, insert, update } = useDB('humor_casal', { order:'created_at', asc:false })
  const humorHoje = humores.find(h => h.data_humor === today && h.dono === user)
  const [saving, setSaving] = useState(false)

  const saveHumor = async (v) => {
    setSaving(true)
    if (humorHoje) await update(humorHoje.id, { nota: v })
    else await insert({ nota: v, data_humor: today, dono: user })
    setSaving(false)
  }

  const parceiro = humores.find(h => h.data_humor === today && h.dono !== user)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium text-stone-700 text-sm">Como você está hoje?</p>
        {parceiro && (
          <span className="text-xs text-stone-400">
            Parceiro(a): {HUMOR_OPTIONS.find(o=>o.v===parceiro.nota)?.label || '—'}
          </span>
        )}
      </div>
      <div className="flex gap-2 justify-between">
        {HUMOR_OPTIONS.map(opt => {
          const Icon = opt.icon
          const isActive = humorHoje?.nota === opt.v
          return (
            <button key={opt.v} onClick={() => saveHumor(opt.v)} disabled={saving}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all ${isActive ? opt.active : opt.bg + ' ' + opt.color + ' hover:opacity-80'}`}>
              <Icon className="w-5 h-5" strokeWidth={1.8} />
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [month, setMonth] = useState(monthKey())
  const { settings } = useSettings()
  const navigate = useNavigate()
  const { data: txs } = useDB('transactions', { filter: { month } })
  const { data: metas } = useDB('metas_casal', {})
  const { data: agenda } = useDB('agenda_casal', { order:'data', asc:true })
  const { data: checklist } = useDB('casamento_checklist', {})
  const { data: viagens } = useDB('viagens_lista', {})

  const income  = txs.filter(t=>t.type==='income').reduce((s,t)=>s+ +t.amount,0)
  const expense = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+ +t.amount,0)
  const balance = income - expense
  const wifeShare     = income * ((settings?.wife_percentage||30)/100)
  const wifeSpent     = txs.filter(t=>t.type==='expense'&&t.category==='wife').reduce((s,t)=>s+ +t.amount,0)
  const apartmentShare= income * ((settings?.apartment_percentage||40)/100)
  const weddingShare  = income * ((settings?.wedding_percentage||20)/100)
  const companyShare  = income * ((settings?.company_percentage||20)/100)

  const pieData = Object.entries(TX_CATEGORIES).map(([k,cat])=>({
    name: cat.label,
    value: txs.filter(t=>t.type==='expense'&&t.category===k).reduce((s,t)=>s+ +t.amount,0),
    color: cat.color,
  })).filter(d=>d.value>0)

  const stats = [
    { label:'Entradas',   value:fmt(income),        icon:TrendingUp, color:'text-sage-500',  bg:'bg-sage-50' },
    { label:'Saídas',     value:fmt(expense),       icon:TrendingDown,color:'text-blush-500',bg:'bg-blush-50'},
    { label:'Saldo',      value:fmt(balance),       icon:Wallet,  color:balance>=0?'text-sage-600':'text-blush-600', bg:balance>=0?'bg-sage-50':'bg-blush-50'},
    { label:(settings?.wife_percentage||30)+'% Mimos',    value:fmt(wifeShare),       icon:Heart,    color:'text-pink-500',   bg:'bg-pink-50'   },
    { label:(settings?.apartment_percentage||40)+'% Apto',value:fmt(apartmentShare),  icon:Home,     color:'text-amber-600',  bg:'bg-amber-50'  },
    { label:(settings?.wedding_percentage||20)+'% Casamento',value:fmt(weddingShare), icon:Gem,      color:'text-violet-500', bg:'bg-violet-50' },
    { label:(settings?.company_percentage||20)+'% Empresa',  value:fmt(companyShare), icon:Briefcase,color:'text-blue-500',   bg:'bg-blue-50'   },
    { label:'Mimos gastos',value:fmt(wifeSpent),    icon:Sparkles, color:'text-rose-500',   bg:'bg-rose-50'  },
  ]

  const prevMonth = () => setMonth(monthKey(subMonths(new Date(month+'-01'),1)))
  const nextMonth = () => setMonth(monthKey(addMonths(new Date(month+'-01'),1)))

  // Agenda — próximos 3 eventos
  const today = new Date().toISOString().slice(0,10)
  const proximosEventos = agenda.filter(e=>e.data>=today).slice(0,3)

  // Metas ativas
  const metasAtivas = metas.filter(m=>!m.concluida).slice(0,3)

  // Casamento progress
  const casamentoPct = checklist.length>0 ? Math.round((checklist.filter(t=>t.done).length/checklist.length)*100) : 0

  // Próxima viagem confirmada
  const proximaViagem = viagens.filter(v=>v.status==='confirmada'&&v.data_ida>=today).sort((a,b)=>a.data_ida.localeCompare(b.data_ida))[0]

  // Contagem regressiva para o casamento
  const weddingDate = settings?.wedding_date
  const weddingDaysLeft = weddingDate
    ? differenceInDays(new Date(weddingDate + 'T12:00:00'), new Date())
    : null

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader title="Dashboard" subtitle={monthLabel(month) + ' · ' + (settings?.couple_name||'Nosso Casal')} />

      {/* Humor do casal */}
      <HumorWidget user="eu" />

      {/* Navigation months */}
      <div className="flex items-center gap-3">
        <button onClick={prevMonth} className="btn-icon"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-medium text-stone-600 min-w-[140px] text-center">{monthLabel(month)}</span>
        <button onClick={nextMonth} className="btn-icon"><ChevronRight className="w-4 h-4" /></button>
      </div>

      {/* Financial stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Pie chart */}
      {pieData.length > 0 ? (
        <div className="card">
          <h2 className="font-medium text-stone-700 text-sm mb-4">Saídas por categoria</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((d,i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={v=>fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 min-w-[180px]">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:d.color}} />
                  <span className="text-stone-500 flex-1">{d.name}</span>
                  <span className="font-medium text-stone-700">{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-10">
          <p className="text-stone-400 dark:text-stone-500 text-sm">Nenhuma transação este mês ainda.</p>
        </div>
      )}

      {/* Grid de widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Próximos eventos */}
        <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={()=>navigate('/agenda')}>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-amber-500" strokeWidth={1.8} />
            <p className="font-medium text-stone-700 text-sm">Próximos Eventos</p>
          </div>
          {proximosEventos.length === 0 ? (
            <p className="text-xs text-stone-400">Nenhum evento próximo</p>
          ) : (
            <div className="space-y-2">
              {proximosEventos.map(e => (
                <div key={e.id} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-stone-700 flex-1 truncate">{e.titulo}</span>
                  <span className="text-xs text-stone-400 flex-shrink-0">{new Date(e.data+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metas */}
        <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={()=>navigate('/metas')}>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-purple-500" strokeWidth={1.8} />
            <p className="font-medium text-stone-700 text-sm">Metas Ativas</p>
          </div>
          {metasAtivas.length === 0 ? (
            <p className="text-xs text-stone-400">Nenhuma meta ativa</p>
          ) : (
            <div className="space-y-2">
              {metasAtivas.map(m => (
                <div key={m.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                    <span className="text-stone-700 flex-1 truncate">{m.titulo}</span>
                    {'⭐'.repeat(m.prioridade||1).slice(0,3)}
                  </div>
                  {m.valor_meta > 0 && (
                    <div className="mt-1 ml-3.5">
                      <div className="w-full bg-stone-100 rounded-full h-1.5">
                        <div className="bg-purple-400 rounded-full h-1.5" style={{width: Math.min(100,(Number(m.valor_atual||0)/m.valor_meta)*100)+'%'}} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Casamento + Countdown */}
        <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={()=>navigate('/casamento')}>
          <div className="flex items-center gap-2 mb-3">
            <Gem className="w-4 h-4 text-rose-500" strokeWidth={1.8} />
            <p className="font-medium text-stone-700 text-sm">Casamento 💍</p>
            <span className="ml-auto text-xs font-bold text-rose-500">{casamentoPct}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 mb-2">
            <div className="bg-gradient-to-r from-rose-400 to-pink-500 rounded-full h-2 transition-all" style={{width:casamentoPct+'%'}} />
          </div>
          <p className="text-xs text-stone-400">{checklist.filter(t=>t.done).length} de {checklist.length} tarefas concluídas</p>
          {weddingDaysLeft !== null && (
            <div className="mt-3 pt-3 border-t border-stone-50 text-center">
              {weddingDaysLeft > 0 ? (
                <>
                  <p className="text-2xl font-bold text-rose-500 font-display">{weddingDaysLeft}</p>
                  <p className="text-xs text-stone-400 mt-0.5">dias para o grande dia 💒</p>
                </>
              ) : weddingDaysLeft === 0 ? (
                <p className="text-sm font-bold text-rose-500">🎊 Hoje é o grande dia!</p>
              ) : (
                <p className="text-xs text-stone-400">💑 Casados há {Math.abs(weddingDaysLeft)} dias</p>
              )}
            </div>
          )}
          {weddingDaysLeft === null && (
            <p className="text-xs text-stone-400 mt-2">Defina a data no Casamento →</p>
          )}
        </div>

        {/* Próxima viagem */}
        <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={()=>navigate('/viagens')}>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-blue-500" strokeWidth={1.8} />
            <p className="font-medium text-stone-700 text-sm">Próxima Viagem</p>
          </div>
          {proximaViagem ? (
            <div>
              <p className="font-semibold text-stone-800">{proximaViagem.destino}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                ✈️ {new Date(proximaViagem.data_ida+'T12:00:00').toLocaleDateString('pt-BR')}
              </p>
            </div>
          ) : (
            <p className="text-xs text-stone-400">Nenhuma viagem confirmada</p>
          )}
        </div>
      </div>
    </div>
  )
}
