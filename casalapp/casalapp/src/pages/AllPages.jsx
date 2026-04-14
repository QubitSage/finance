 // ─── Wife Page ───────────────────────────────────────────────────
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDB } from '../hooks/useDB'
import { useSettings, useLogs } from '../hooks/useSettings'
import { fmt, monthLabel, monthKey } from '../lib/utils'
import { subMonths, addMonths, format } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Trash2, Heart, Sparkles, Pencil, Check, X, Copy, ThumbsUp, ThumbsDown, Settings, ClipboardList, Globe, Home, Gem, Target, ShoppingCart, ArrowLeftRight, ExternalLink, Search, AlertCircle, ListTodo, DollarSign, Filter, Edit3 } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export function WifePage() {
  const [month, setMonth] = useState(monthKey())
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ description: '', category: 'wife', amount: '', date: format(new Date(),'yyyy-MM-dd') })
  const { settings } = useSettings()
  const { addLog } = useLogs()
  const { data: txs, insert, remove } = useDB('transactions', { filter: { month } })

  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0)
  const share = income * ((settings?.wife_percentage || 30) / 100)
  const spent = txs.filter(t => t.type === 'expense' && t.category === 'wife').reduce((s, t) => s + +t.amount, 0)
  const rem = share - spent
  const pct = share > 0 ? Math.min((spent / share) * 100, 100) : 0
  const list = txs.filter(t => t.type === 'expense' && ['wife','personal','savings'].includes(t.category))

  const prev = () => setMonth(monthKey(subMonths(new Date(month+'-01'),1)))
  const next = () => setMonth(monthKey(addMonths(new Date(month+'-01'),1)))

  const handleAdd = async (e) => {
    e.preventDefault()
    const { data: d } = await insert({ ...form, amount: parseFloat(form.amount), type: 'expense', month })
    if(d) addLog('Mimo adicionado: ' + form.description, 'Mimos da Esposa', '/esposa', form.description)
    setForm({ description: '', category: 'wife', amount: '', date: format(new Date(),'yyyy-MM-dd') })
    setAdding(false)
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <PageHeader title="Mimos da Esposa" subtitle="Controle e saldo disponível"
        action={<button className="btn-primary flex items-center gap-1.5" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4" /> Adicionar</button>} />

      <div className="flex items-center gap-3 mb-4">
        <button onClick={prev} className="btn-icon"><ChevronLeft className="w-4 h-4"/></button>
        <span className="text-sm font-medium text-stone-600 min-w-[140px] text-center">{monthLabel(month)}</span>
        <button onClick={next} className="btn-icon"><ChevronRight className="w-4 h-4"/></button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card"><p className="stat-label">Direito ({settings?.wife_percentage||30}%)</p><p className="text-xl font-display font-semibold text-pink-500">{fmt(share)}</p></div>
        <div className="card"><p className="stat-label">Gasto</p><p className="text-xl font-display font-semibold text-stone-700">{fmt(spent)}</p></div>
        <div className="card"><p className="stat-label">Saldo</p><p className={`text-xl font-display font-semibold ${rem>=0?'text-sage-600':'text-blush-500'}`}>{fmt(rem)}</p></div>
      </div>

      <div className="card mb-4">
        <div className="flex justify-between text-xs text-stone-400 mb-2">
          <span>Utilizado</span><span>{pct.toFixed(0)}%</span>
        </div>
        <div className="progress mb-2">
          <div className="progress-fill" style={{width:`${pct}%`,background:pct>=90?'#C86060':'#537A44'}}/>
        </div>
        <p className="text-xs text-stone-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3"/>
          {rem >= 0 ? `Ainda disponível: ${fmt(rem)}` : `Excedeu em: ${fmt(Math.abs(rem))}`}
        </p>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="card mb-4">
          <p className="form-section-title">Novo gasto da esposa</p>
          <div className="grid gap-3">
            <div><label className="label">Descrição</label><input className="input" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} required placeholder="Ex: Vestido, SPA..."/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Categoria</label>
                <select className="select" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                  <option value="wife">Mimos</option><option value="personal">Pessoal dela</option><option value="savings">Poupança dela</option>
                </select>
              </div>
              <div><label className="label">Valor (R$)</label><input className="input" type="number" step="0.01" min="0" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} required/></div>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-3">
            <button type="button" className="btn-secondary" onClick={()=>setAdding(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Salvar</button>
          </div>
        </form>
      )}

      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Descrição</th><th className="text-right">Valor</th><th className="w-10"></th></tr></thead>
          <tbody>
            {list.length===0?<tr><td colSpan={3} className="text-center py-8 text-stone-300">Nenhum gasto ainda</td></tr>:
              list.map(t=><tr key={t.id}>
                <td className="font-medium">{t.description}</td>
                <td className="text-right font-medium text-pink-500">{fmt(t.amount)}</td>
                <td><button onClick={()=>remove(t.id)} className="btn-icon w-7 h-7"><Trash2 className="w-3.5 h-3.5 text-stone-300 hover:text-blush-500"/></button></td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Savings Page ─────────────────────────────────────────────────
export function SavingsPage() {
  const { data: goals, insert, update, remove } = useDB('savings_goals')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({name:'',target:'',current:'',emoji:'ð¯'})
  const [depositId, setDepositId] = useState(null)
  const [depositVal, setDepositVal] = useState('')
  const EMOJIS = ['ð¯','ð ','✈️','ð','ð','ð¶','ð','ð»','ð¸','ð️','ð¶','ð']
  const totTarget = goals.reduce((s,g)=>s+ +g.target,0)
  const totSaved  = goals.reduce((s,g)=>s+ +g.current,0)

  const handleAdd = async (e) => {
    e.preventDefault()
    await insert({name:form.name,target:parseFloat(form.target),current:parseFloat(form.current||0),emoji:form.emoji})
    setForm({name:'',target:'',current:'',emoji:'ð¯'}); setAdding(false)
  }
  const handleDeposit = async (g) => {
    const v = parseFloat(depositVal||0)
    if(v<=0) return
    await update(g.id,{current:Math.min(+g.current+v,+g.target)})
    setDepositId(null); setDepositVal('')
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <PageHeader title="Poupança & Metas"
        action={<button className="btn-primary flex items-center gap-1.5" onClick={()=>setAdding(!adding)}><Plus className="w-4 h-4"/>Nova meta</button>}/>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card"><p className="stat-label">Total guardado</p><p className="text-xl font-display font-semibold text-sage-600">{fmt(totSaved)}</p></div>
        <div className="card"><p className="stat-label">Total das metas</p><p className="text-xl font-display font-semibold text-stone-700">{fmt(totTarget)}</p></div>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="card mb-4">
          <p className="form-section-title">Nova meta</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {EMOJIS.map(e=><button key={e} type="button" onClick={()=>setForm(p=>({...p,emoji:e}))}
              className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${form.emoji===e?'bg-amber-100 ring-2 ring-amber-300':'bg-stone-100 hover:bg-stone-200'}`}>{e}</button>)}
          </div>
          <div className="grid gap-3">
            <div><label className="label">Nome</label><input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required placeholder="Ex: Viagem para Europa"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Meta (R$)</label><input className="input" type="number" step="0.01" min="0" value={form.target} onChange={e=>setForm(p=>({...p,target:e.target.value}))} required/></div>
              <div><label className="label">Já guardou</label><input className="input" type="number" step="0.01" min="0" value={form.current} onChange={e=>setForm(p=>({...p,current:e.target.value}))}/></div>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-3">
            <button type="button" className="btn-secondary" onClick={()=>setAdding(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Salvar</button>
          </div>
        </form>
      )}

      {goals.length===0&&<div className="card text-center py-10 text-stone-300">Nenhuma meta criada ainda.</div>}
      <div className="flex flex-col gap-3">
        {goals.map(g=>{
          const pct = +g.target>0?Math.min((+g.current/+g.target)*100,100):0
          return(
            <div key={g.id} className="card">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-xl flex-shrink-0 border border-stone-100">{g.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-stone-800">{g.name}</p>
                    <div className="flex gap-1">
                      <button className="btn-ghost text-xs py-1 px-2" onClick={()=>{setDepositId(g.id);setDepositVal('')}}>+ Dep.</button>
                      <button onClick={()=>remove(g.id)} className="btn-icon w-7 h-7"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-stone-400 mb-1.5">
                    <span>{fmt(g.current)} guardado</span>
                    <span className="font-medium text-stone-600">{pct.toFixed(0)}% de {fmt(g.target)}</span>
                  </div>
                  <div className="progress"><div className="progress-fill" style={{width:`${pct}%`,background:pct>=100?'#537A44':'#F5A800'}}/></div>
                  {pct>=100&&<p className="text-xs text-sage-600 font-medium mt-1">ð Meta atingida!</p>}
                  {depositId===g.id&&(
                    <div className="flex gap-2 mt-2">
                      <input className="input flex-1 text-sm py-1.5" type="number" min="0" step="0.01" placeholder="Valor a depositar" value={depositVal} onChange={e=>setDepositVal(e.target.value)}/>
                      <button className="btn-primary text-xs py-1.5 px-3" onClick={()=>handleDeposit(g)}>OK</button>
                      <button className="btn-secondary text-xs py-1.5 px-3" onClick={()=>setDepositId(null)}>✕</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Reports Page ─────────────────────────────────────────────────
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useEffect } from 'react'
import { MONTHS_PT } from '../lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts'

export function ReportsPage() {
  const { user } = useAuth()
  const [data, setData] = useState([])

  useEffect(()=>{
    if(!user) return
    const months = Array.from({length:6},(_,i)=>{
      const d=new Date(); d.setMonth(d.getMonth()-5+i); return d.toISOString().slice(0,7)
    })
    Promise.all(months.map(m=>
      supabase.from('transactions').select('*').eq('user_id',user.id).eq('month',m)
        .then(({data:rows})=>{
          const r=rows||[]
          const [y,mo]=m.split('-')
          return{
            label:MONTHS_PT[+mo-1].slice(0,3),
            income:r.filter(t=>t.type==='income').reduce((s,t)=>s+ +t.amount,0),
            expense:r.filter(t=>t.type==='expense').reduce((s,t)=>s+ +t.amount,0),
            wife:r.filter(t=>t.category==='wife').reduce((s,t)=>s+ +t.amount,0),
            savings:r.filter(t=>t.category==='savings').reduce((s,t)=>s+ +t.amount,0),
          }
        })
    )).then(res=>setData(res.map(r=>({...r,balance:r.income-r.expense}))))
  },[user])

  const tk={color:'#9A8A78',fontSize:11}
  const gc='rgba(154,138,120,0.15)'

  return(
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <PageHeader title="Relatórios" subtitle="Últimos 6 meses"/>
      <div className="card mb-4">
        <p className="text-sm font-medium text-stone-600 mb-3">Entradas vs Saídas</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={gc} vertical={false}/>
            <XAxis dataKey="label" tick={tk} axisLine={false} tickLine={false}/>
            <YAxis tick={tk} axisLine={false} tickLine={false} tickFormatter={v=>`R$${(v/1000).toFixed(0)}k`}/>
            <Tooltip formatter={v=>fmt(v)}/>
            <Legend wrapperStyle={{fontSize:12}}/>
            <Bar dataKey="income" name="Entradas" fill="#537A44" radius={[4,4,0,0]}/>
            <Bar dataKey="expense" name="Saídas" fill="#C86060" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card mb-4">
        <p className="text-sm font-medium text-stone-600 mb-3">Saldo mensal</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gc} vertical={false}/>
            <XAxis dataKey="label" tick={tk} axisLine={false} tickLine={false}/>
            <YAxis tick={tk} axisLine={false} tickLine={false} tickFormatter={v=>`R$${(v/1000).toFixed(0)}k`}/>
            <Tooltip formatter={v=>fmt(v)}/>
            <Line type="monotone" dataKey="balance" name="Saldo" stroke="#F5A800" strokeWidth={2} dot={{fill:'#F5A800',r:4}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <p className="text-sm font-medium text-stone-600 mb-3">Mimos & Poupança</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={gc} vertical={false}/>
            <XAxis dataKey="label" tick={tk} axisLine={false} tickLine={false}/>
            <YAxis tick={tk} axisLine={false} tickLine={false} tickFormatter={v=>`R$${(v/1000).toFixed(0)}k`}/>
            <Tooltip formatter={v=>fmt(v)}/>
            <Legend wrapperStyle={{fontSize:12}}/>
            <Bar dataKey="wife" name="Mimos" fill="#EC4899" radius={[4,4,0,0]}/>
            <Bar dataKey="savings" name="Poupança" fill="#3B82F6" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Config Page ─────────────────────────────────────────────────────
export function ConfigPage() {
  const { settings, save } = useSettings()
  const { signOut } = useAuth()
  const { logs, loading: logsLoading, addLog } = useLogs()
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()
  const cur = form ?? settings

  const handleSave = async (e) => {
    e.preventDefault()
    const old = settings
    await save(cur)
    // Log each changed field
    const fields = {
      couple_name: 'Nome do casal',
      wife_percentage: '% Mimos da esposa',
      apartment_percentage: '% Apartamento',
      wedding_percentage: '% Casamento',
      company_percentage: '% Empresa',
    }
    for (const [key, label] of Object.entries(fields)) {
      if (old[key] !== cur[key]) {
        await addLog(label + ': ' + old[key] + ' -> ' + cur[key], 'Configuracoes', '/config', label)
      }
    }
    setSaved(true); setTimeout(()=>setSaved(false),2000)
  }

  const LOG_ICONS = {
    'Configuracoes': Settings,
    'Transacoes': ArrowLeftRight,
    'Mimos da Esposa': Heart,
    'Regras': ClipboardList,
    'Viagens': Globe,
    'Desejos': Sparkles,
    'Apartamento': Home,
    'Casamento': Gem,
    'Metas': Target,
    'Mercado': ShoppingCart,
  }

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto">
      <PageHeader title="Configuracoes"/>
      <form onSubmit={handleSave} className="card mb-4">
        <div className="grid gap-4">
          <div><label className="label">Nome do casal</label>
            <input className="input" value={cur.couple_name||''} onChange={e=>setForm(p=>({...(p??settings),couple_name:e.target.value}))} placeholder="Ex: Bruno & Vianka"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">% Mimos Esposa</label>
              <div className="flex items-center gap-2">
                <input className="input max-w-[80px]" type="number" min="0" max="100" step="1" value={cur.wife_percentage||30} onChange={e=>setForm(p=>({...(p??settings),wife_percentage:parseFloat(e.target.value)}))}/>
                <span className="text-stone-500 text-sm font-medium">%</span>
              </div>
            </div>
            <div><label className="label">% Apartamento</label>
              <div className="flex items-center gap-2">
                <input className="input max-w-[80px]" type="number" min="0" max="100" step="1" value={cur.apartment_percentage||40} onChange={e=>setForm(p=>({...(p??settings),apartment_percentage:parseFloat(e.target.value)}))}/>
                <span className="text-stone-500 text-sm font-medium">%</span>
              </div>
            </div>
            <div><label className="label">% Casamento</label>
              <div className="flex items-center gap-2">
                <input className="input max-w-[80px]" type="number" min="0" max="100" step="1" value={cur.wedding_percentage||20} onChange={e=>setForm(p=>({...(p??settings),wedding_percentage:parseFloat(e.target.value)}))}/>
                <span className="text-stone-500 text-sm font-medium">%</span>
              </div>
            </div>
            <div><label className="label">% Empresa</label>
              <div className="flex items-center gap-2">
                <input className="input max-w-[80px]" type="number" min="0" max="100" step="1" value={cur.company_percentage||20} onChange={e=>setForm(p=>({...(p??settings),company_percentage:parseFloat(e.target.value)}))}/>
                <span className="text-stone-500 text-sm font-medium">%</span>
              </div>
            </div>
          </div>
        </div>
        <button type="submit" className="btn-primary w-full mt-5">{saved?'Salvo!':'Salvar configuracoes'}</button>
      </form>
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">Historico de Atividades</p>
          {logsLoading && <span className="text-xs text-stone-300">carregando...</span>}
        </div>
        {logs.length === 0 && !logsLoading && (
          <p className="text-sm text-stone-300 text-center py-4">Nenhuma atividade registrada ainda.</p>
        )}
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
          {logs.map(log => {
            const Icon = LOG_ICONS[log.section] || Settings
            return (
              <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-amber-600" strokeWidth={1.8}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-700 font-medium truncate">{log.action}</p>
                  <p className="text-xs text-stone-400">{log.section} · {new Date(log.created_at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</p>
                </div>
                {log.route && (
                  <button onClick={()=>navigate(log.route)} title="Ir ate la" className="flex-shrink-0 p-1 rounded hover:bg-amber-100 transition-colors text-stone-400 hover:text-amber-600">
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.8}/>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="card bg-stone-50 border-stone-100">
        <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">Conta</p>
        <button onClick={signOut} className="btn-danger text-sm">Sair da conta</button>
      </div>
    </div>
  )
}


export function TripsPage() {
  const { data: trips, insert, update, remove } = useDB('trips')
  const { addLog } = useLogs()
  const [filter, setFilter] = useState('todos')
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [mapTrip, setMapTrip] = useState(null)
  const [form, setForm] = useState({destination:'',category:'Com o marido',status:'interesse',start_date:'',end_date:'',budget:'',spent:'',notes:''})

  const filtered = filter==='todos' ? trips : trips.filter(t => t.status === filter)
  const totalBudget = trips.reduce((s,t) => s + (+t.budget||0), 0)
  const totalSpent  = trips.reduce((s,t) => s + (+t.spent||0), 0)

  const openAdd  = () => { setEditItem(null); setForm({destination:'',category:'Com o marido',status:'interesse',start_date:'',end_date:'',budget:'',spent:'',notes:''}); setModal(true) }
  const openEdit = (t) => { setEditItem(t); setForm({destination:t.destination,category:t.category,status:t.status,start_date:t.start_date||'',end_date:t.end_date||'',budget:t.budget||'',spent:t.spent||'',notes:t.notes||''}); setModal(true) }

  const handleSave = async () => {
    const d = {...form, budget:parseFloat(form.budget)||0, spent:parseFloat(form.spent)||0, start_date:form.start_date||null, end_date:form.end_date||null}
    if (editItem) await update(editItem.id, d)
    else await insert(d)
    setModal(false)
  }

  const dur = (s,e) => { if(!s||!e) return null; const d=Math.round((new Date(e)-new Date(s))/864e5)+1; return d>0 ? d+'d' : null }
  const pct = (s,b) => b>0 ? Math.min(100, Math.round((s/b)*100)) : 0

  return (
    <div className="page-wrapper">
      <PageHeader title="Viagens" subtitle="Planeje e acompanhe cada aventura"
        action={<button className="btn-primary flex items-center gap-1.5" onClick={openAdd}><Plus className="w-4 h-4"/>Nova viagem</button>}/>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="card"><p className="stat-label">Viagens</p><p className="text-2xl font-display font-semibold">{trips.length}</p></div>
        <div className="card"><p className="stat-label">Orçamento total</p><p className="text-xl font-display font-semibold text-amber-600">{fmt(totalBudget)}</p></div>
        <div className="card"><p className="stat-label">Total gasto</p><p className="text-xl font-display font-semibold text-blush-500">{fmt(totalSpent)}</p></div>
        <div className="card"><p className="stat-label">Saldo</p><p className={`text-xl font-display font-semibold ${(totalBudget-totalSpent)>=0?'text-sage-600':'text-blush-500'}`}>{fmt(totalBudget-totalSpent)}</p></div>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {['todos','interesse','planejando','concluido','cancelado'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`chip ${filter===f?'active':''}`}>
            {f==='todos' ? 'Todas' : TRIP_STATUS[f]?.label||f}
            {f!=='todos' && <span style={{marginLeft:4,opacity:.7,fontSize:10}}>({trips.filter(t=>t.status===f).length})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div style={{fontSize:40,marginBottom:8}}>✈️</div>
          <p className="text-stone-400 text-sm mb-4">Nenhuma viagem{filter!=='todos'?' com esse status':''}.</p>
          {filter==='todos' && <button className="btn-primary" onClick={openAdd}>Criar primeira viagem</button>}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(t => {
            const status = TRIP_STATUS[t.status] || {}
            const spent = +t.spent||0, budget = +t.budget||0
            const p = pct(spent, budget)
            return (
              <div key={t.id} className="card" style={{borderLeft:`3px solid ${status.color||'#e7e5e4'}`,paddingLeft:14}}>
                <div className="flex justify-between items-start mb-1">
                  <div style={{flex:1,minWidth:0}}>
                    <p className="font-display font-semibold text-lg leading-tight" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.destination}</p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      <span className="tag" style={{background:(status.color||'#e7e5e4')+'22',color:status.color||'#78716c',fontWeight:600}}>{status.label||t.status}</span>
                      {t.category && <span className="tag">{t.category}</span>}
                      {t.start_date && <span className="tag">{fmtDate(t.start_date)}{t.end_date?' → '+fmtDate(t.end_date):''}{dur(t.start_date,t.end_date)?' · '+dur(t.start_date,t.end_date):''}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2 flex-shrink-0">
                    <button className="btn-ghost text-xs py-1 px-2.5" onClick={()=>setMapTrip(t)}>🗺 Mapa</button>
                    <button className="btn-ghost text-xs py-1 px-2" onClick={()=>openEdit(t)}>Editar</button>
                    <button onClick={()=>remove(t.id)} className="btn-icon w-7 h-7"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>

                {budget > 0 && (
                  <div className="mt-2 pt-2 border-t border-stone-50">
                    <div className="flex justify-between text-xs text-stone-400 mb-1">
                      <span>Orçamento: {fmt(budget)}</span>
                      <span style={{color: p>90?'#f43f5e':'inherit'}}>Gasto: {fmt(spent)} ({p}%)</span>
                    </div>
                    <div className="progress mb-1">
                      <div className="progress-fill" style={{width:p+'%',background:p>90?'#f43f5e':p>70?'#f59e0b':'#84cc16'}}/>
                    </div>
                    <p className={`text-xs font-medium ${(budget-spent)>=0?'text-sage-600':'text-blush-500'}`}>Saldo: {fmt(budget-spent)}</p>
                  </div>
                )}

                {t.notes && <p className="text-xs text-stone-400 mt-2 pt-2 border-t border-stone-50" style={{overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{t.notes}</p>}
              </div>
            )
          })}
        </div>
      )}

      {mapTrip && <TripMapModal trip={mapTrip} onClose={()=>setMapTrip(null)} />}

      <Modal open={modal} onClose={()=>setModal(false)} title={editItem?'Editar viagem':'Nova viagem'}>
        <div className="grid gap-3">
          <div><label className="label">Destino</label><input className="input" value={form.destination} onChange={e=>setForm(f=>({...f,destination:e.target.value}))} placeholder="Ex: Paris, França"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Categoria</label>
              <select className="select" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                <option>Com o marido</option><option>Sozinha</option><option>Família</option><option>Amigos</option>
              </select>
            </div>
            <div><label className="label">Status</label>
              <select className="select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                {Object.entries(TRIP_STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Partida</label><input className="input" type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))}/></div>
            <div><label className="label">Volta</label><input className="input" type="date" value={form.end_date} min={form.start_date} onChange={e=>setForm(f=>({...f,end_date:e.target.value}))}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Orçamento (R$)</label><input className="input" type="number" step="0.01" min="0" value={form.budget} onChange={e=>setForm(f=>({...f,budget:e.target.value}))}/></div>
            <div><label className="label">Já gasto (R$)</label><input className="input" type="number" step="0.01" min="0" value={form.spent} onChange={e=>setForm(f=>({...f,spent:e.target.value}))}/></div>
          </div>
          <div><label className="label">Notas</label><textarea className="textarea" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={3} placeholder="Dicas, observações, checklist..."/></div>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <button className="btn-secondary" onClick={()=>setModal(false)}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave}>Salvar</button>
        </div>
      </Modal>
    </div>
  )
}


// ─── Desires Page (Desejos/Mimos/Planner) ─────────────────────────
import { WHO_COLORS, PLANNER_COLS, PLANNER_COL_LABELS, PLANNER_COL_COLORS } from '../lib/utils'

export function DesiresPage() {
  const [subTab, setSubTab] = useState('desejos')
  return(
    <div className="flex flex-col h-full">
      <div className="flex bg-white border-b border-stone-100 px-4 md:px-6 gap-1">
        {[['desejos','Desejos'],['mimos','Mimos'],['planner','Planner']].map(([v,l])=>(
          <button key={v} onClick={()=>setSubTab(v)}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-all ${subTab===v?'border-amber-500 text-amber-700':'border-transparent text-stone-400 hover:text-stone-600'}`}>{l}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {subTab==='desejos'&&<DesiresTab/>}
        {subTab==='mimos'&&<MimosTab/>}
        {subTab==='planner'&&<PlannerTab/>}
      </div>
    </div>
  )
}

function DesiresTab() {
  const { data, insert, remove, update } = useDB('desires')
  const { addLog } = useLogs()
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState('todos')
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({who:'Bruno',desire:'',why:'',tipo:'Não-Sexual',category:'Com o marido',cost:'',date:'',status:'Pendente'})
  const MIMO_STATUS=['Pendente','Aprovado','Recusado','Entregue']

  const handleAdd = async (e) => {
    e.preventDefault()
    if(!form.desire.trim()) return
    await insert({...form,cost:parseFloat(form.cost)||0,date:form.date||null})
    setAdding(false); setForm({who:'Bruno',desire:'',why:'',tipo:'Não-Sexual',category:'Com o marido',cost:'',date:'',status:'Pendente'})
  }
  const handleEdit = async (e) => {
    e.preventDefault()
    await update(editItem.id, {...editItem, cost: parseFloat(editItem.cost)||0, date: editItem.date||null})
    setEditItem(null)
  }
  const setStatus = async (id, status) => { await update(id, {status}) }
  const filtered = filter==='todos' ? data : data.filter(m=>m.who===filter)

  return(
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <PageHeader title="Desejos" subtitle="Desejos e pedidos"
        action={<button className="btn-primary flex items-center gap-1.5" onClick={()=>setAdding(!adding)}><Plus className="w-4 h-4"/>Novo desejo</button>}/>
      <div className="flex gap-2 mb-4">
        {['todos','Bruno','Vianka'].map(f=><button key={f} className={`badge cursor-pointer ${filter===f?'badge-sage':'badge-stone'}`} onClick={()=>setFilter(f)}>{f==='todos'?'Todos':f}</button>)}
      </div>
      {adding&&(
        <form onSubmit={handleAdd} className="card mb-5">
          <p className="form-section-title">Novo desejo</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="label">De quem</label><select className="select" value={form.who} onChange={e=>setForm(p=>({...p,who:e.target.value}))}><option>Bruno</option><option>Vianka</option><option>Ambos</option></select></div>
            <div><label className="label">Status</label><select className="select" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>{MIMO_STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
            <div className="col-span-2"><label className="label">Desejo *</label><textarea className="textarea" value={form.desire} onChange={e=>setForm(p=>({...p,desire:e.target.value}))} placeholder="O que você deseja?"/></div>
            <div className="col-span-2"><label className="label">Por quê?</label><textarea className="textarea" value={form.why} onChange={e=>setForm(p=>({...p,why:e.target.value}))} placeholder="Motivo..."/></div>
            <div><label className="label">Tipo</label><select className="select" value={form.tipo} onChange={e=>setForm(p=>({...p,tipo:e.target.value}))}><option>Não-Sexual</option><option>Sexual</option><option>Experiência</option><option>Item</option></select></div>
            <div><label className="label">Categoria</label><select className="select" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}><option value="">A definir</option><option value="Sozinha">Sozinha</option><option value="Date">Date</option><option value="Marido">Marido</option></select></div>
            <div><label className="label">Valor (R$)</label><input className="input" type="number" step="0.01" min="0" value={form.cost} onChange={e=>setForm(p=>({...p,cost:e.target.value}))} placeholder="0,00"/></div>
            <div><label className="label">Data</label><input className="input" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
          </div>
          <div className="flex gap-2 justify-end mt-3"><button type="button" className="btn-secondary" onClick={()=>setAdding(false)}>Cancelar</button><button type="submit" className="btn-primary">Salvar</button></div>
        </form>
      )}
      {filtered.length===0?<div className="card text-center py-10 text-stone-300">Nenhum desejo registrado.</div>:
        filtered.map(m=>(
          <div key={m.id} className="card mb-3">
            {editItem?.id===m.id ? (
              <form onSubmit={handleEdit} className="grid grid-cols-2 gap-3">
                <div><label className="label">De quem</label><select className="select" value={editItem.who} onChange={e=>setEditItem(p=>({...p,who:e.target.value}))}><option>Bruno</option><option>Vianka</option><option>Ambos</option></select></div>
                <div><label className="label">Status</label><select className="select" value={editItem.status} onChange={e=>setEditItem(p=>({...p,status:e.target.value}))}>{MIMO_STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
                <div className="col-span-2"><label className="label">Desejo</label><textarea className="textarea" value={editItem.desire} onChange={e=>setEditItem(p=>({...p,desire:e.target.value}))}/></div>
                <div className="col-span-2"><label className="label">Por quê?</label><textarea className="textarea" value={editItem.why} onChange={e=>setEditItem(p=>({...p,why:e.target.value}))}/></div>
                <div><label className="label">Tipo</label><select className="select" value={editItem.tipo} onChange={e=>setEditItem(p=>({...p,tipo:e.target.value}))}><option>Não-Sexual</option><option>Sexual</option><option>Experiência</option><option>Item</option></select></div>
                <div><label className="label">Categoria</label><select className="select" value={editItem.category} onChange={e=>setEditItem(p=>({...p,category:e.target.value}))}><option value="">A definir</option><option value="Sozinha">Sozinha</option><option value="Date">Date</option><option value="Marido">Marido</option></select></div>
                <div><label className="label">Valor (R$)</label><input className="input" type="number" step="0.01" min="0" value={editItem.cost} onChange={e=>setEditItem(p=>({...p,cost:e.target.value}))}/></div>
                <div><label className="label">Data</label><input className="input" type="date" value={editItem.date||''} onChange={e=>setEditItem(p=>({...p,date:e.target.value}))}/></div>
                <div className="col-span-2 flex gap-2 justify-end mt-2"><button type="button" className="btn-secondary" onClick={()=>setEditItem(null)}>Cancelar</button><button type="submit" className="btn-primary">Salvar</button></div>
              </form>
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-stone-800">{m.desire}</span>
                    <span className={`badge ${m.status==='Aprovado'?'badge-sage':m.status==='Recusado'?'badge-blush':m.status==='Entregue'?'bg-blue-50 text-blue-700':'badge-amber'}`}>{m.status}</span>
                    <span className="badge badge-stone">{m.who}</span>
                    {m.tipo&&<span className="badge badge-stone">{m.tipo}</span>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {m.status==='Pendente'&&<>
                      <button onClick={()=>setStatus(m.id,'Aprovado')} className="btn-icon w-7 h-7 text-green-600" title="Aprovar"><ThumbsUp className="w-3.5 h-3.5"/></button>
                      <button onClick={()=>setStatus(m.id,'Recusado')} className="btn-icon w-7 h-7 text-red-500" title="Recusar"><ThumbsDown className="w-3.5 h-3.5"/></button>
                    </>}
                    {m.status!=='Entregue'&&<button onClick={()=>setStatus(m.id,'Entregue')} className="btn-icon w-7 h-7 text-blue-600" title="Marcar como entregue/realizado"><Check className="w-3.5 h-3.5"/></button>}
                    <button onClick={()=>setEditItem({...m})} className="btn-icon w-7 h-7" title="Editar"><Pencil className="w-3.5 h-3.5"/></button>
                    <button onClick={()=>{if(window.confirm('Tem certeza que deseja excluir?'))remove(m.id)}} className="btn-icon w-7 h-7" title="Remover"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
                {m.why&&<p className="text-sm text-stone-400 mb-2">{m.why}</p>}
                <div className="flex gap-3 text-xs text-stone-400 flex-wrap">
                  {m.cost>0&&<span>Valor: <strong className="text-stone-600">{fmt(m.cost)}</strong></span>}
                  {m.date&&<span>Data: <strong className="text-stone-600">{fmtDate(m.date)}</strong></span>}
                  {m.category&&<span>{m.category}</span>}
                </div>
              </>
            )}
          </div>
        ))
      }
    </div>
  )
}

function MimosTab() {
  const { data, insert, remove, update } = useDB('mimos')
  const [adding, setAdding] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [showLegendas, setShowLegendas] = useState(false)
  const [form, setForm] = useState({date:'',mimo:'',objective:'',tipo:'',category:'',obj_tipo:'',value:'',status:'Pendente',link:''})
  const MIMO_STATUS=['Pendente','Aprovado','Planejando','Concluído','Cancelado']

  const handleAdd=async(e)=>{e.preventDefault();await insert({...form,value:parseFloat(form.value)||0,date:form.date||null});setAdding(false);setForm({date:'',mimo:'',objective:'',tipo:'',category:'',obj_tipo:'',value:'',status:'Pendente',link:''})}
  const handleEdit=async(e)=>{e.preventDefault();if(!editItem)return;await update(editItem.id,{date:editItem.date,mimo:editItem.mimo,objective:editItem.objective,tipo:editItem.tipo,category:editItem.category,value:parseFloat(editItem.value)||0,status:editItem.status});setEditItem(null)}
  const approve=(m)=>update(m.id,{status:'Aprovado'})
  const disapprove=(m)=>update(m.id,{status:'Cancelado'})

  return(
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <PageHeader title="Mimos"
        action={<div className="flex gap-2"><button className="btn-secondary" onClick={()=>setShowLegendas(true)}>Legendas</button><button className="btn-primary flex items-center gap-1.5" onClick={()=>setAdding(!adding)}><Plus className="w-4 h-4"/>Novo mimo</button></div>}/>
      {showLegendas&&<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={()=>setShowLegendas(false)}><div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={e=>e.stopPropagation()}><h3 className="font-semibold text-stone-800 mb-4">Legendas de Categorias</h3><div className="space-y-3"><div><span className="font-medium text-stone-700">Sozinha:</span><p className="text-stone-500 text-sm">Quando você quiser sair sozinha, podendo flertar, ficar e conhecer alguem</p></div><div><span className="font-medium text-stone-700">Date:</span><p className="text-stone-500 text-sm">Quando você tiver ou pretender ter um date com outro</p></div><div><span className="font-medium text-stone-700">Marido:</span><p className="text-stone-500 text-sm">Quando for comigo</p></div></div><button className="mt-4 w-full btn-primary" onClick={()=>setShowLegendas(false)}>Fechar</button></div></div>}
      {adding&&(
        <form onSubmit={handleAdd} className="card mb-4">
          <p className="form-section-title">Novo mimo</p>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Data que quer receber</label><input className="input" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
              <div><label className="label">Status</label><select className="select" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>{MIMO_STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div><label className="label">Qual o mimo?</label><textarea className="textarea" value={form.mimo} onChange={e=>setForm(p=>({...p,mimo:e.target.value}))} required/></div>
            <div><label className="label">Objetivo</label><textarea className="textarea" value={form.objective} onChange={e=>setForm(p=>({...p,objective:e.target.value}))}/></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="label">Tipo de mimo</label><input className="input" value={form.tipo} onChange={e=>setForm(p=>({...p,tipo:e.target.value}))} placeholder="A definir"/></div>
              <div><label className="label">Categoria</label><select className="select" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}><option value="">A definir</option><option value="Sozinha">Sozinha</option><option value="Date">Date</option><option value="Marido">Marido</option></select></div>
              <div><label className="label">Valor (R$)</label><input className="input" type="number" step="0.01" min="0" value={form.value} onChange={e=>setForm(p=>({...p,value:e.target.value}))}/></div>
            </div>
            <div><label className="label">Link (opcional)</label><input className="input" type="url" placeholder="https://..." value={form.link||''} onChange={e=>setForm(p=>({...p,link:e.target.value}))}/></div>
          </div>
          <div className="flex gap-2 justify-end mt-3"><button type="button" className="btn-secondary" onClick={()=>setAdding(false)}>Cancelar</button><button type="submit" className="btn-primary">Salvar</button></div>
        </form>
      )}
      {data.length===0?<div className="card text-center py-10 text-stone-300">Nenhum mimo registrado.</div>:
        data.map(m=>(
          <div key={m.id} className="card mb-3">
            {editItem?.id===m.id?(
              <form onSubmit={handleEdit} className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Data</label><input className="input" type="date" value={editItem.date||''} onChange={e=>setEditItem(p=>({...p,date:e.target.value}))}/></div>
                  <div><label className="label">Status</label><select className="select" value={editItem.status||'Pendente'} onChange={e=>setEditItem(p=>({...p,status:e.target.value}))}>{MIMO_STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
                </div>
                <div><label className="label">Qual o mimo?</label><textarea className="textarea" value={editItem.mimo||''} onChange={e=>setEditItem(p=>({...p,mimo:e.target.value}))} required/></div>
                <div><label className="label">Objetivo</label><textarea className="textarea" value={editItem.objective||''} onChange={e=>setEditItem(p=>({...p,objective:e.target.value}))}/></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="label">Tipo</label><input className="input" value={editItem.tipo||''} onChange={e=>setEditItem(p=>({...p,tipo:e.target.value}))}/></div>
                  <div><label className="label">Categoria</label><select className="select" value={editItem.category||''} onChange={e=>setEditItem(p=>({...p,category:e.target.value}))}><option value="">A definir</option><option value="Sozinha">Sozinha</option><option value="Date">Date</option><option value="Marido">Marido</option></select></div>
                  <div><label className="label">Valor (R$)</label><input className="input" type="number" step="0.01" min="0" value={editItem.value||''} onChange={e=>setEditItem(p=>({...p,value:e.target.value}))}/></div>
                </div>
                <div><label className="label">Link (opcional)</label><input className="input" type="url" placeholder="https://..." value={editItem.link||''} onChange={e=>setEditItem(p=>({...p,link:e.target.value}))}/></div>
                <div className="flex gap-2 justify-end"><button type="button" className="btn-secondary" onClick={()=>setEditItem(null)}>Cancelar</button><button type="submit" className="btn-primary">Salvar</button></div>
              </form>
            ):(
              <>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className={`badge ${m.status==='Concluído'?'badge-sage':m.status==='Aprovado'?'badge-sage':m.status==='Pendente'?'badge-amber':m.status==='Cancelado'?'badge-blush':'badge-stone'}`}>{m.status}</span>
                    {m.tipo&&<span className="badge badge-stone">{m.tipo}</span>}
                  </div>
                  <div className="flex gap-1 items-center">
                    <button onClick={()=>approve(m)} className="btn-icon w-7 h-7 text-sage-500" title="Aprovar"><ThumbsUp className="w-3.5 h-3.5"/></button>
                    <button onClick={()=>disapprove(m)} className="btn-icon w-7 h-7 text-blush-500" title="Recusar"><ThumbsDown className="w-3.5 h-3.5"/></button>
                    <button onClick={()=>setEditItem({...m})} className="btn-icon w-7 h-7"><Pencil className="w-3.5 h-3.5"/></button>
                    <button onClick={()=>{if(window.confirm('Tem certeza que deseja excluir?'))remove(m.id)}} className="btn-icon w-7 h-7"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
                <p className="font-medium text-stone-800 mb-1">{m.mimo}</p>
                {m.objective&&<p className="text-sm text-stone-400 mb-2">{m.objective}</p>}
                <div className="flex gap-3 text-xs text-stone-400">
                  {m.value>0&&<span>Valor: <strong className="text-stone-600">{fmt(m.value)}</strong></span>}
                  {m.date&&<span>Receber em: <strong className="text-stone-600">{fmtDate(m.date)}</strong></span>}
                {m.link&&<a href={m.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium mt-1"><ExternalLink className="w-3 h-3"/>Ver link</a>}
                </div>
              </>
            )}
          </div>
        ))}
    </div>
  )
}

function PlannerTab() {
  const { data: rounds, insert, remove, update } = useDB('planner_rounds', { order: 'created_at', asc: true })
  const { data: allOpts } = useDB('planner_options')
  const { insert: insertOpt, remove: removeOpt } = useDB('planner_options')
  const { user } = useAuth()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({atividade:'',companhia:'',visual:'',desejo:'',comunicacao:'',aprovacao:''})
  const [customText, setCustomText] = useState({atividade:false,companhia:false,visual:false})
  const [manageCol, setManageCol] = useState(null)
  const [newOpt, setNewOpt] = useState('')
  const [seeded, setSeeded] = useState(false)

  const COMUNICACAO_OPTS = ['Fotos','Vídeos','Surpresa','Apenas localização','Celular desligado']
  const UNIQUE_COLS = ['atividade','companhia','visual']
  const DEFAULT_OPTS = {
    atividade:   ['Salão','Compras','Date','Academia','Massagem','Cinema','Casa','Jantar','Almoço'],
    companhia:   ['Sozinha','Com marido','Acompanhada','Marido só leva','Só busca','Só paga','Aberta','Curiosa'],
    visual:      ['Casual','Casual-Sexy','Body','Lingerie Visível','Nada','Ousada','Justa','Roupa Nova'],
    comunicacao: ['Fotos','Vídeos','Surpresa','Apenas localização','Celular desligado'],
  }
  const MANAGEABLE_COLS = ['atividade','companhia','visual','comunicacao']
  const MANAGE_LABELS = {atividade:'Atividade',companhia:'Companhia',visual:'Visual',comunicacao:'Comunicação'}

  useEffect(()=>{
    if(!user||seeded||allOpts===undefined) return
    if(allOpts.length===0){
      setSeeded(true)
      const seedAll=async()=>{
        for(const [col,opts] of Object.entries(DEFAULT_OPTS)){
          for(const opt of opts){ await insertOpt({column_name:col,option_text:opt}) }
        }
      }
      seedAll()
    } else { setSeeded(true) }
  },[user,allOpts,seeded])

  const getOpts = (col) => allOpts.filter(o=>o.column_name===col).map(o=>o.option_text)
  const getUsed = (col) => new Set(rounds.map(r=>r[col]).filter(Boolean))
  const getAvail = (col) => UNIQUE_COLS.includes(col)
    ? getOpts(col).filter(o=>!getUsed(col).has(o))
    : getOpts(col)

  const handleAdd = async () => {
    const row = {...form}
    if(!row.atividade&&!row.companhia&&!row.visual&&!row.desejo&&!row.comunicacao) return
    await insert(row)
    setAdding(false)
    setForm({atividade:'',companhia:'',visual:'',desejo:'',comunicacao:'',aprovacao:''})
    setCustomText({atividade:false,companhia:false,visual:false})
  }
  const setApproval = (id, val) => update(id, {aprovacao: val})

  return(
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <PageHeader title="Planner" subtitle="Atividade, Companhia e Visual só podem ser usados uma vez"
        action={
          <div className="flex gap-2">
            <button className="btn-secondary text-xs" onClick={()=>setManageCol('atividade')}>⚙ Opções</button>
            <button className="btn-primary flex items-center gap-1.5" onClick={()=>setAdding(!adding)}><Plus className="w-4 h-4"/>Nova rodada</button>
          </div>
        }/>

      <div className="card mb-5">
        <p className="text-sm font-medium text-stone-600 mb-3">Progresso (colunas únicas)</p>
        <div className="grid grid-cols-3 gap-4">
          {UNIQUE_COLS.map(col=>{
            const used=getUsed(col).size, total=getOpts(col).length||1
            const pct=total>0?Math.min((used/total)*100,100):0
            return(
              <div key={col}>
                <p className="text-xs text-stone-400 mb-1">{MANAGE_LABELS[col]}</p>
                <div className="progress mb-1"><div className="progress-fill" style={{width:`${pct}%`,background:pct>=100?'#537A44':'#F5A800'}}/></div>
                <p className="text-xs text-stone-300">{used}/{total} usadas</p>
              </div>
            )
          })}
        </div>
      </div>

      {adding&&(
        <div className="card mb-4">
          <p className="form-section-title">Nova rodada</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="label flex items-center justify-between">Atividade Principal<button type="button" className="text-xs text-amber-500 underline" onClick={()=>setCustomText(p=>({...p,atividade:!p.atividade}))}>{customText.atividade?'← lista':'texto livre'}</button></label>
              {customText.atividade
                ? <input className="input" value={form.atividade} onChange={e=>setForm(p=>({...p,atividade:e.target.value}))} placeholder="Escrever..."/>
                : <select className="select" value={form.atividade} onChange={e=>setForm(p=>({...p,atividade:e.target.value}))}><option value="">— escolher —</option>{getAvail('atividade').map(o=><option key={o}>{o}</option>)}</select>}
              <p className="text-xs text-stone-300 mt-1">{getUsed('atividade').size}/{getOpts('atividade').length} usadas</p>
            </div>
            <div>
              <label className="label flex items-center justify-between">Companhia<button type="button" className="text-xs text-amber-500 underline" onClick={()=>setCustomText(p=>({...p,companhia:!p.companhia}))}>{customText.companhia?'← lista':'texto livre'}</button></label>
              {customText.companhia
                ? <input className="input" value={form.companhia} onChange={e=>setForm(p=>({...p,companhia:e.target.value}))} placeholder="Escrever..."/>
                : <select className="select" value={form.companhia} onChange={e=>setForm(p=>({...p,companhia:e.target.value}))}><option value="">— escolher —</option>{getAvail('companhia').map(o=><option key={o}>{o}</option>)}</select>}
              <p className="text-xs text-stone-300 mt-1">{getUsed('companhia').size}/{getOpts('companhia').length} usadas</p>
            </div>
            <div>
              <label className="label flex items-center justify-between">Visual<button type="button" className="text-xs text-amber-500 underline" onClick={()=>setCustomText(p=>({...p,visual:!p.visual}))}>{customText.visual?'← lista':'texto livre'}</button></label>
              {customText.visual
                ? <input className="input" value={form.visual} onChange={e=>setForm(p=>({...p,visual:e.target.value}))} placeholder="Escrever..."/>
                : <select className="select" value={form.visual} onChange={e=>setForm(p=>({...p,visual:e.target.value}))}><option value="">— escolher —</option>{getAvail('visual').map(o=><option key={o}>{o}</option>)}</select>}
              <p className="text-xs text-stone-300 mt-1">{getUsed('visual').size}/{getOpts('visual').length} usadas</p>
            </div>
            <div>
              <label className="label">Desejo</label>
              <input className="input" value={form.desejo} onChange={e=>setForm(p=>({...p,desejo:e.target.value}))} placeholder="Escreva o desejo..."/>
            </div>
            <div>
              <label className="label">Comunicação</label>
              <select className="select" value={form.comunicacao} onChange={e=>setForm(p=>({...p,comunicacao:e.target.value}))}><option value="">— escolher —</option>{COMUNICACAO_OPTS.map(o=><option key={o}>{o}</option>)}</select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={()=>{setAdding(false);setForm({atividade:'',companhia:'',visual:'',desejo:'',comunicacao:'',aprovacao:''});setCustomText({atividade:false,companhia:false,visual:false})}}>Cancelar</button>
            <button className="btn-primary" onClick={handleAdd}>Salvar</button>
          </div>
        </div>
      )}

      <div className="tbl-wrap"><div className="overflow-x-auto">
        <table className="tbl">
          <thead><tr>
            <th>#</th>
            <th className="bg-blue-50 text-blue-800">Atividade</th>
            <th className="bg-violet-50 text-violet-800">Companhia</th>
            <th className="bg-pink-50 text-pink-800">Visual</th>
            <th className="bg-amber-50 text-amber-800">Desejo</th>
            <th className="bg-sage-100 text-sage-800">Comunicação</th>
            <th>Aprovação</th>
            <th></th>
          </tr></thead>
          <tbody>
            {rounds.length===0
              ? <tr><td colSpan={8} className="text-center py-8 text-stone-300">Nenhuma rodada ainda.</td></tr>
              : rounds.map((r,i)=>(
                <tr key={r.id}>
                  <td className="text-stone-300 text-xs">{i+1}</td>
                  <td>{r.atividade?<span className="badge bg-blue-50 text-blue-800 text-xs">{r.atividade}</span>:'—'}</td>
                  <td>{r.companhia?<span className="badge bg-violet-50 text-violet-800 text-xs">{r.companhia}</span>:'—'}</td>
                  <td>{r.visual?<span className="badge bg-pink-50 text-pink-800 text-xs">{r.visual}</span>:'—'}</td>
                  <td className="text-sm text-stone-600 max-w-[140px] truncate" title={r.desejo||''}>{r.desejo||'—'}</td>
                  <td>{r.comunicacao?<span className="badge bg-sage-100 text-sage-800 text-xs">{r.comunicacao}</span>:'—'}</td>
                  <td>
                    {r.aprovacao==='Aprovado'
                      ? <span className="badge badge-sage text-xs">✓ Aprovado</span>
                      : r.aprovacao==='Reprovado'
                        ? <span className="badge badge-blush text-xs">✗ Reprovado</span>
                        : <div className="flex gap-1">
                            <button onClick={()=>setApproval(r.id,'Aprovado')} className="btn-icon w-6 h-6" title="Aprovar"><ThumbsUp className="w-3 h-3"/></button>
                            <button onClick={()=>setApproval(r.id,'Reprovado')} className="btn-icon w-6 h-6" title="Reprovar"><ThumbsDown className="w-3 h-3"/></button>
                          </div>
                    }
                  </td>
                  <td><button onClick={()=>remove(r.id)} className="btn-icon w-7 h-7"><Trash2 className="w-3.5 h-3.5"/></button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div></div>

      <Modal open={!!manageCol} onClose={()=>setManageCol(null)} title="Gerenciar opções do Planner">
        <div className="flex gap-2 flex-wrap mb-4">
          {MANAGEABLE_COLS.map(col=><button key={col} onClick={()=>setManageCol(col)} className={`chip ${manageCol===col?'active':''}`}>{MANAGE_LABELS[col]}</button>)}
        </div>
        {manageCol&&(
          <>
            <div className="flex flex-col gap-2 mb-3 max-h-48 overflow-y-auto">
              {getOpts(manageCol).length===0
                ? <p className="text-sm text-stone-300">Nenhuma opção.</p>
                : getOpts(manageCol).map((o,i)=>{
                    const used=getUsed(manageCol).has(o)
                    return(
                      <div key={i} className="flex items-center gap-2 py-1.5 px-3 bg-stone-50 rounded-lg">
                        <span className="flex-1 text-sm">{o}</span>
                        {used&&<span className="text-xs text-amber-500">em uso</span>}
                        <button onClick={async()=>{const opt=allOpts.find(a=>a.column_name===manageCol&&a.option_text===o);if(opt)await removeOpt(opt.id)}} className="text-stone-300 hover:text-blush-500 text-xs">✕</button>
                      </div>
                    )
                  })}
            </div>
            <div className="flex gap-2">
              <input className="input flex-1" value={newOpt} onChange={e=>setNewOpt(e.target.value)} placeholder="Nova opção..." onKeyDown={e=>{if(e.key==='Enter'&&newOpt.trim()){insertOpt({column_name:manageCol,option_text:newOpt.trim()});setNewOpt('')}}}/>
              <button className="btn-primary text-sm" onClick={async()=>{if(!newOpt.trim())return;await insertOpt({column_name:manageCol,option_text:newOpt.trim()});setNewOpt('')}}>+</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

export function QuizPage() {
  const { data: questions, insert: insertQ, remove: removeQ, update: updateQ } = useDB('quiz_questions')
  const { user } = useAuth()
  const [adding, setAdding] = useState(false)
  const [ansModal, setAnsModal] = useState(null)
  const [editQ, setEditQ] = useState(null)
  const [qForm, setQForm] = useState({question:'',who:'Ambos'})
  const [aForm, setAForm] = useState({who:'Bruno',answer:''})
  const [answers, setAnswers] = useState({})

  useEffect(()=>{
    if(!questions.length||!user) return
    supabase.from('quiz_answers').select('*').in('question_id',questions.map(q=>q.id))
      .then(({data})=>{
        const map={}
        ;(data||[]).forEach(a=>{if(!map[a.question_id])map[a.question_id]=[];map[a.question_id].push(a)})
        setAnswers(map)
      })
  },[questions,user])

  const handleAddQ=async(e)=>{e.preventDefault();await insertQ(qForm);setQForm({question:'',who:'Ambos'});setAdding(false)}
  const handleEditQ=async(e)=>{e.preventDefault();if(!editQ?.question?.trim())return;await updateQ(editQ.id,{question:editQ.question,who:editQ.who});setEditQ(null)}
  const handleAddA=async()=>{
    if(!aForm.answer.trim()||!ansModal) return
    await supabase.from('quiz_answers').insert([{...aForm,question_id:ansModal}])
    setAnsModal(null);setAForm({who:'Bruno',answer:''})
    const {data}=await supabase.from('quiz_answers').select('*').in('question_id',questions.map(q=>q.id))
    const map={};(data||[]).forEach(a=>{if(!map[a.question_id])map[a.question_id]=[];map[a.question_id].push(a)});setAnswers(map)
  }
  const removeAnswer=async(id)=>{
    await supabase.from('quiz_answers').delete().eq('id',id)
    const {data}=await supabase.from('quiz_answers').select('*').in('question_id',questions.map(q=>q.id))
    const map={};(data||[]).forEach(a=>{if(!map[a.question_id])map[a.question_id]=[];map[a.question_id].push(a)});setAnswers(map)
  }

  return(
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <PageHeader title="Questionário" subtitle="Perguntas e respostas do casal"
        action={<button className="btn-primary flex items-center gap-1.5" onClick={()=>setAdding(!adding)}><Plus className="w-4 h-4"/>Pergunta</button>}/>

      {adding&&(
        <form onSubmit={handleAddQ} className="card mb-4">
          <p className="form-section-title">Nova pergunta</p>
          <div className="grid gap-3">
            <div><label className="label">Pergunta</label><textarea className="textarea" value={qForm.question} onChange={e=>setQForm(p=>({...p,question:e.target.value}))} required/></div>
            <div><label className="label">Quem responde?</label><select className="select" value={qForm.who} onChange={e=>setQForm(p=>({...p,who:e.target.value}))}><option>Ambos</option><option>Bruno</option><option>Vianka</option></select></div>
          </div>
          <div className="flex gap-2 justify-end mt-3"><button type="button" className="btn-secondary" onClick={()=>setAdding(false)}>Cancelar</button><button type="submit" className="btn-primary">Salvar</button></div>
        </form>
      )}

      {questions.length===0?<div className="card text-center py-10 text-stone-300">Nenhuma pergunta ainda.</div>:
        questions.map((q,i)=>(
          <div key={q.id} className="card mb-3">
            {editQ?.id===q.id?(
              <form onSubmit={handleEditQ} className="grid gap-3">
                <div><label className="label">Pergunta</label><textarea className="textarea" value={editQ.question} onChange={e=>setEditQ(p=>({...p,question:e.target.value}))} required/></div>
                <div><label className="label">Quem responde?</label><select className="select" value={editQ.who} onChange={e=>setEditQ(p=>({...p,who:e.target.value}))}><option>Ambos</option><option>Bruno</option><option>Vianka</option></select></div>
                <div className="flex gap-2 justify-end"><button type="button" className="btn-secondary" onClick={()=>setEditQ(null)}>Cancelar</button><button type="submit" className="btn-primary">Salvar</button></div>
              </form>
            ):(
              <>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-xs font-medium text-amber-700">{i+1}</span>
                    <span className={`badge ${WHO_COLORS[q.who]||'badge-stone'}`}>{q.who}</span>
                  </div>
                  <div className="flex gap-1">
                    <button className="btn-ghost text-xs py-1 px-2" onClick={()=>setAnsModal(q.id)}>+ Resposta</button>
                    <button onClick={()=>setEditQ({...q})} className="btn-icon w-7 h-7"><Pencil className="w-3.5 h-3.5"/></button>
                    <button onClick={()=>removeQ(q.id)} className="btn-icon w-7 h-7"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
                <p className="font-medium text-stone-800 mb-3">{q.question}</p>
                {(answers[q.id]||[]).map(a=>(
                  <div key={a.id} className="bg-stone-50 rounded-xl p-3 mb-2 group">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`badge text-xs ${WHO_COLORS[a.who]||'badge-stone'}`}>{a.who}</span>
                      <button onClick={()=>removeAnswer(a.id)} className="opacity-0 group-hover:opacity-100 btn-icon w-6 h-6 transition-opacity"><Trash2 className="w-3 h-3"/></button>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">{a.answer}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}

      <Modal open={!!ansModal} onClose={()=>setAnsModal(null)} title="Adicionar resposta">
        <div className="grid gap-3">
          <div><label className="label">Quem responde?</label><select className="select" value={aForm.who} onChange={e=>setAForm(p=>({...p,who:e.target.value}))}><option>Bruno</option><option>Vianka</option></select></div>
          <div><label className="label">Resposta</label><textarea className="textarea min-h-[100px]" value={aForm.answer} onChange={e=>setAForm(p=>({...p,answer:e.target.value}))}/></div>
        </div>
        <div className="flex gap-2 justify-end mt-4"><button className="btn-secondary" onClick={()=>setAnsModal(null)}>Cancelar</button><button className="btn-primary" onClick={handleAddA}>Salvar</button></div>
      </Modal>
    </div>
  )
}

// ─── Data/Profile Page ────────────────────────────────────────────
const PROFILE_SECTIONS=[
  {name:'Bruno',fields:[{k:'bruno_nome',l:'Nome completo'},{k:'bruno_tel',l:'Telefone'},{k:'bruno_email',l:'E-mail'},{k:'bruno_cpf',l:'CPF'},{k:'bruno_cnpj',l:'CNPJ'},{k:'bruno_end',l:'Endereço'}]},
  {name:'Vianka',fields:[{k:'vianka_nome',l:'Nome completo'},{k:'vianka_tel',l:'Telefone'},{k:'vianka_email',l:'E-mail'},{k:'vianka_cpf',l:'CPF'},{k:'vianka_cnpj',l:'CNPJ'},{k:'vianka_end',l:'Endereço'}]},
  {name:'Casal',fields:[{k:'casal_end',l:'Endereço do casal'},{k:'casal_tel',l:'Telefone'},{k:'casal_email',l:'E-mail'},{k:'casal_cnpj',l:'CNPJ empresa'}]},
]
export function DataPage() {
  const { user } = useAuth()
  const [data, setData] = useState({})
  const [saved, setSaved] = useState(false)
  useEffect(()=>{
    if(!user) return
    supabase.from('couple_profile').select('*').eq('user_id',user.id).single()
      .then(({data:r})=>{ if(r){ setData(r.data||{}) } })
  },[user])
  const handleSave=async()=>{
    await supabase.from('couple_profile').upsert({user_id:user.id,data,updated_at:new Date().toISOString()},{onConflict:'user_id'})
    setSaved(true); setTimeout(()=>setSaved(false),2000)
  }
  return(
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <PageHeader title="Dados" subtitle="Perfil centralizado do casal"
        action={<button className="btn-primary" onClick={handleSave}>{saved?'✓ Salvo!':'Salvar'}</button>}/>
      {PROFILE_SECTIONS.map(s=>(
        <div key={s.name} className="tbl-wrap mb-4">
          <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-100 text-xs font-medium text-stone-400 uppercase tracking-wide">{s.name}</div>
          {s.fields.map(f=>(
            <div key={f.k} className="flex items-center gap-3 px-4 py-3 border-b border-stone-50 last:border-b-0">
              <span className="text-sm text-stone-400 min-w-[140px]">{f.l}</span>
              <input className="input flex-1 text-right border-0 bg-transparent focus:bg-stone-50 focus:border focus:border-stone-200 transition-all"
                value={data[f.k]||''} onChange={e=>setData(p=>({...p,[f.k]:e.target.value}))} placeholder="—"/>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Market Page (Reformulado) ─────────────────────────────────────────────
const MARKET_CATS = ['Hortifruti', 'Laticínios', 'Carnes', 'Mercearia', 'Higiene', 'Limpeza', 'Bebidas', 'Congelados', 'Outros']
const MARKET_STORES = ['Mercadão', 'Supermercado', 'Feira', 'Atacado', 'Online', 'Farmácia']

export function MarketPage() {
  const { data: items, insert, remove, update } = useDB('market_items')
  const { data: lists, insert: insertList, remove: removeList } = useDB('market_lists')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [tab, setTab] = useState('lista') // 'lista' | 'estoque' | 'historico'
  const [catFilter, setCatFilter] = useState('Todas')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', quantity: '', unit: 'un', category: 'Mercearia', price: '', store: '', in_stock: false, low_stock: false, notes: '' })

  const allCats = ['Todas', ...MARKET_CATS]

  const shoppingList = items.filter(i => !i.in_stock || i.low_stock)
  const inStock = items.filter(i => i.in_stock && !i.low_stock)
  const lowStock = items.filter(i => i.low_stock)
  const checked = items.filter(i => i.checked)

  const filteredItems = items.filter(i => {
    const matchCat = catFilter === 'Todas' || i.category === catFilter
    const matchSearch = !search || i.name?.toLowerCase().includes(search.toLowerCase())
    const matchTab = tab === 'lista' ? (!i.in_stock || i.low_stock) : tab === 'estoque' ? i.in_stock : true
    return matchCat && matchSearch && matchTab
  })

  const totalPrice = shoppingList.reduce((s, i) => s + (i.price ? +i.price * (i.quantity || 1) : 0), 0)

  const handleSave = async (e) => {
    e.preventDefault()
    const payload = { ...form, price: form.price ? parseFloat(form.price) : null }
    if (editing) {
      await update(editing.id, payload)
      setEditing(null)
    } else {
      await insert(payload)
      setAdding(false)
    }
    setForm({ name: '', quantity: '', unit: 'un', category: 'Mercearia', price: '', store: '', in_stock: false, low_stock: false, notes: '' })
  }

  const toggleCheck = async (item) => {
    await update(item.id, { checked: !item.checked })
  }

  const toggleStock = async (item) => {
    await update(item.id, { in_stock: !item.in_stock, low_stock: false })
  }

  const markLowStock = async (item) => {
    await update(item.id, { low_stock: !item.low_stock })
  }

  const units = ['un', 'kg', 'g', 'L', 'mL', 'cx', 'pct', 'dz']

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <PageHeader
        title="Mercado"
        subtitle={totalPrice > 0 ? 'Lista estimada: R$ ' + totalPrice.toFixed(2) : 'Gerencie suas compras'}
        action={
          <button className="btn-primary flex items-center gap-1.5" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        }
      />

      {lowStock.length > 0 && (
        <div className="card border-l-4 border-amber-400 bg-amber-50 mb-4">
          <p className="text-sm text-amber-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {lowStock.length} item(s) com estoque baixo
          </p>
        </div>
      )}

      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-4">
        {[['lista', 'Lista', ShoppingCart], ['estoque', 'Estoque', Home], ['historico', 'Todos', ClipboardList]].map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={'flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ' + (tab === key ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400')}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {(adding || editing) && (
        <form onSubmit={handleSave} className="card space-y-3 border-2 border-stone-200 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <input className="input col-span-2" placeholder="Nome do produto *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <div className="flex gap-1">
              <input className="input flex-1" type="number" step="0.1" placeholder="Qtd" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
              <select className="input w-16" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                {units.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <input className="input" type="number" step="0.01" placeholder="Preço unit." value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {MARKET_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="input" value={form.store} onChange={e => setForm(f => ({ ...f, store: e.target.value }))}>
              <option value="">Loja (opcional)</option>
              {MARKET_STORES.map(s => <option key={s}>{s}</option>)}
            </select>
            <input className="input col-span-2" placeholder="Observações" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <div className="col-span-2 flex gap-4">
              <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                <input type="checkbox" checked={form.in_stock} onChange={e => setForm(f => ({ ...f, in_stock: e.target.checked }))} className="w-4 h-4 rounded" />
                Tenho em casa
              </label>
              <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                <input type="checkbox" checked={form.low_stock} onChange={e => setForm(f => ({ ...f, low_stock: e.target.checked }))} className="w-4 h-4 rounded" />
                Estoque baixo
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Salvar</button>
            <button type="button" onClick={() => { setAdding(false); setEditing(null) }} className="btn-icon"><X className="w-4 h-4" /></button>
          </div>
        </form>
      )}

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input className="input pl-9" placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3 no-scrollbar">
        {allCats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ' + (catFilter === c ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500')}>
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredItems.length === 0 && (
          <div className="text-center py-10">
            <ShoppingCart className="w-10 h-10 text-stone-200 mx-auto mb-2" />
            <p className="text-stone-400 text-sm">{tab === 'lista' ? 'Lista vazia! Adicione itens para comprar.' : 'Nenhum item encontrado.'}</p>
          </div>
        )}
        {filteredItems.map(item => (
          <div key={item.id} className={'card flex items-center gap-3 transition-all ' + (item.checked ? 'opacity-60' : '') + (item.low_stock ? ' border-l-4 border-amber-400' : '')}>
            <button onClick={() => toggleCheck(item)}
              className={'w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ' + (item.checked ? 'bg-teal-500 border-teal-500' : 'border-stone-300 hover:border-teal-400')}>
              {item.checked && <Check className="w-3 h-3 text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={'text-sm font-medium ' + (item.checked ? 'line-through text-stone-400' : 'text-stone-700')}>{item.name}</span>
                <span className="text-xs text-stone-400">{item.quantity && item.unit ? item.quantity + ' ' + item.unit : ''}</span>
                {item.low_stock && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">baixo</span>}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-stone-400">{item.category}</span>
                {item.store && <span className="text-xs text-stone-400">· {item.store}</span>}
                {item.price && <span className="text-xs text-stone-500 font-medium">R$ {(item.price * (item.quantity || 1)).toFixed(2)}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => markLowStock(item)} title="Estoque baixo"
                className={'w-7 h-7 rounded-lg flex items-center justify-center transition-colors ' + (item.low_stock ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-400 hover:bg-amber-100')}>
                <AlertCircle className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => toggleStock(item)} title={item.in_stock ? 'Tirar do estoque' : 'Marcar como no estoque'}
                className={'w-7 h-7 rounded-lg flex items-center justify-center transition-colors ' + (item.in_stock ? 'bg-teal-100 text-teal-600' : 'bg-stone-100 text-stone-400 hover:bg-teal-100')}>
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setEditing(item); setForm({ name: item.name || '', quantity: item.quantity || '', unit: item.unit || 'un', category: item.category || 'Mercearia', price: item.price || '', store: item.store || '', in_stock: item.in_stock || false, low_stock: item.low_stock || false, notes: item.notes || '' }); setAdding(false) }}
                className="w-7 h-7 rounded-lg bg-stone-100 text-stone-400 hover:bg-stone-200 flex items-center justify-center">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => remove(item.id)} className="w-7 h-7 rounded-lg bg-stone-100 text-stone-300 hover:bg-rose-100 hover:text-rose-400 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Apartment Page (Reformulado) ──────────────────────────────────────────
const APT_ROOMS = ['Sala', 'Cozinha', 'Quarto', 'Banheiro', 'Área', 'Varanda', 'Escritório', 'Geral']
const APT_TASK_CATS = ['Manutenção', 'Limpeza', 'Compra', 'Melhoria', 'Urgente']
const APT_EXPENSE_CATS = ['Aluguel', 'Condomínio', 'Internet', 'Energia', 'Água', 'Gás', 'Streaming', 'Seguro', 'IPTU', 'Outros']

export function ApartmentPage() {
  const [tab, setTab] = useState('tarefas') // 'tarefas' | 'gastos' | 'inventario'
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [roomFilter, setRoomFilter] = useState('Todos')
  const [catFilter, setCatFilter] = useState('Todas')

  const { data: tasks, insert: insertTask, update: updateTask, remove: removeTask } = useDB('apt_tasks')
  const { data: expenses, insert: insertExpense, remove: removeExpense } = useDB('apt_expenses')
  const { data: inventory, insert: insertItem, update: updateItem, remove: removeItem } = useDB('apt_inventory')

  const [taskForm, setTaskForm] = useState({ title: '', room: 'Geral', category: 'Manutenção', priority: 'média', status: 'pendente', due_date: '', notes: '' })
  const [expenseForm, setExpenseForm] = useState({ description: '', category: 'Aluguel', amount: '', recurrent: true, due_day: '', notes: '' })
  const [invForm, setInvForm] = useState({ name: '', room: 'Sala', quantity: 1, condition: 'bom', notes: '' })

  const monthlyTotal = expenses.filter(e => e.recurrent).reduce((s, e) => s + (+e.amount || 0), 0)
  const pendingTasks = tasks.filter(t => t.status !== 'concluído').length
  const urgentTasks = tasks.filter(t => t.priority === 'urgente' && t.status !== 'concluído').length

  const filteredTasks = tasks.filter(t => {
    const matchRoom = roomFilter === 'Todos' || t.room === roomFilter
    const matchCat = catFilter === 'Todas' || t.category === catFilter
    return matchRoom && matchCat
  })

  const handleSaveTask = async (e) => {
    e.preventDefault()
    const payload = { ...taskForm, due_date: taskForm.due_date || null }
    if (editing) { await updateTask(editing.id, payload); setEditing(null) }
    else { await insertTask(payload); setAdding(false) }
    setTaskForm({ title: '', room: 'Geral', category: 'Manutenção', priority: 'média', status: 'pendente', due_date: '', notes: '' })
  }

  const handleSaveExpense = async (e) => {
    e.preventDefault()
    await insertExpense({ ...expenseForm, amount: parseFloat(expenseForm.amount) })
    setExpenseForm({ description: '', category: 'Aluguel', amount: '', recurrent: true, due_day: '', notes: '' })
    setAdding(false)
  }

  const handleSaveInv = async (e) => {
    e.preventDefault()
    await insertItem(invForm)
    setInvForm({ name: '', room: 'Sala', quantity: 1, condition: 'bom', notes: '' })
    setAdding(false)
  }

  const PRIORITY_COLORS = { baixa: 'text-teal-600 bg-teal-50', média: 'text-amber-600 bg-amber-50', alta: 'text-orange-600 bg-orange-50', urgente: 'text-rose-600 bg-rose-50' }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <PageHeader title="Apartamento" subtitle="Tarefas, gastos e inventário" action={
        <button className="btn-primary flex items-center gap-1.5" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      } />

      {(urgentTasks > 0) && (
        <div className="card border-l-4 border-rose-400 bg-rose-50 mb-4">
          <p className="text-sm font-semibold text-rose-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {urgentTasks} tarefa(s) urgente(s)
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="card text-center">
          <p className="text-xl font-display font-bold text-stone-700">{pendingTasks}</p>
          <p className="text-xs text-stone-400">Tarefas</p>
        </div>
        <div className="card text-center">
          <p className="text-xl font-display font-bold text-rose-600">R$ {monthlyTotal.toFixed(0)}</p>
          <p className="text-xs text-stone-400">Mensal</p>
        </div>
        <div className="card text-center">
          <p className="text-xl font-display font-bold text-teal-600">{inventory.length}</p>
          <p className="text-xs text-stone-400">Itens</p>
        </div>
      </div>

      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-4">
        {[['tarefas', 'Tarefas', ListTodo], ['gastos', 'Gastos', DollarSign], ['inventario', 'Inventário', Home]].map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={'flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ' + (tab === key ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400')}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === 'tarefas' && (
        <div>
          {(adding || editing) && (
            <form onSubmit={handleSaveTask} className="card space-y-3 border-2 border-stone-200 mb-4">
              <input className="input" placeholder="Título da tarefa *" value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} required />
              <div className="grid grid-cols-2 gap-2">
                <select className="input" value={taskForm.room} onChange={e => setTaskForm(f => ({ ...f, room: e.target.value }))}>
                  {APT_ROOMS.map(r => <option key={r}>{r}</option>)}
                </select>
                <select className="input" value={taskForm.category} onChange={e => setTaskForm(f => ({ ...f, category: e.target.value }))}>
                  {APT_TASK_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
                <select className="input" value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))}>
                  {['baixa', 'média', 'alta', 'urgente'].map(p => <option key={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
                <input className="input" type="date" placeholder="Prazo" value={taskForm.due_date} onChange={e => setTaskForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
              <textarea className="input" placeholder="Notas (opcional)" value={taskForm.notes} onChange={e => setTaskForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Salvar</button>
                <button type="button" onClick={() => { setAdding(false); setEditing(null) }} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>
            </form>
          )}
          {!adding && !editing && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3 no-scrollbar">
              {['Todos', ...APT_ROOMS].map(r => (
                <button key={r} onClick={() => setRoomFilter(r)}
                  className={'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ' + (roomFilter === r ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500')}>
                  {r}
                </button>
              ))}
            </div>
          )}
          <div className="space-y-2">
            {filteredTasks.length === 0 && (
              <div className="text-center py-10">
                <Home className="w-10 h-10 text-stone-200 mx-auto mb-2" />
                <p className="text-stone-400 text-sm">Nenhuma tarefa aqui 🏠</p>
              </div>
            )}
            {filteredTasks.map(task => (
              <div key={task.id} className={'card flex items-start gap-3 ' + (task.priority === 'urgente' ? 'border-l-4 border-rose-400' : task.priority === 'alta' ? 'border-l-4 border-orange-400' : '')}>
                <button onClick={() => updateTask(task.id, { status: task.status === 'concluído' ? 'pendente' : 'concluído' })}
                  className={'mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ' + (task.status === 'concluído' ? 'bg-teal-500 border-teal-500' : 'border-stone-300 hover:border-teal-400')}>
                  {task.status === 'concluído' && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={'text-sm font-medium ' + (task.status === 'concluído' ? 'line-through text-stone-400' : 'text-stone-700')}>{task.title}</span>
                    <span className={'text-xs px-1.5 py-0.5 rounded ' + (PRIORITY_COLORS[task.priority] || '')}>{task.priority}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-stone-400">{task.room}</span>
                    <span className="text-xs text-stone-400">· {task.category}</span>
                    {task.due_date && <span className="text-xs text-stone-400">· {task.due_date}</span>}
                  </div>
                  {task.notes && <p className="text-xs text-stone-400 mt-0.5">{task.notes}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(task); setTaskForm({ title: task.title || '', room: task.room || 'Geral', category: task.category || 'Manutenção', priority: task.priority || 'média', status: task.status || 'pendente', due_date: task.due_date || '', notes: task.notes || '' }) }}
                    className="w-7 h-7 rounded-lg bg-stone-100 text-stone-400 hover:bg-stone-200 flex items-center justify-center">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeTask(task.id)} className="w-7 h-7 rounded-lg bg-stone-100 text-stone-300 hover:bg-rose-100 hover:text-rose-400 flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'gastos' && (
        <div>
          {adding && (
            <form onSubmit={handleSaveExpense} className="card space-y-3 border-2 border-stone-200 mb-4">
              <input className="input" placeholder="Descrição *" value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} required />
              <div className="grid grid-cols-2 gap-2">
                <select className="input" value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))}>
                  {APT_EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
                <input className="input" type="number" step="0.01" placeholder="Valor" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} required />
                <input className="input" type="number" min="1" max="31" placeholder="Vence dia..." value={expenseForm.due_day} onChange={e => setExpenseForm(f => ({ ...f, due_day: e.target.value }))} />
                <label className="flex items-center gap-2 text-sm text-stone-600">
                  <input type="checkbox" checked={expenseForm.recurrent} onChange={e => setExpenseForm(f => ({ ...f, recurrent: e.target.checked }))} className="w-4 h-4 rounded" />
                  Recorrente
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Salvar</button>
                <button type="button" onClick={() => setAdding(false)} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>
            </form>
          )}
          <div className="card mb-4 bg-gradient-to-br from-stone-50 to-stone-100 border-0">
            <p className="text-xs text-stone-400 mb-1">Total mensal estimado</p>
            <p className="text-3xl font-display font-bold text-stone-800">R$ {monthlyTotal.toFixed(2)}</p>
          </div>
          <div className="space-y-2">
            {expenses.length === 0 && <p className="text-center text-stone-400 text-sm py-8">Nenhum gasto registrado</p>}
            {expenses.map(exp => (
              <div key={exp.id} className="card flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-700">{exp.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-stone-400">{exp.category}</span>
                    {exp.recurrent && <span className="text-xs px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-600">recorrente</span>}
                    {exp.due_day && <span className="text-xs text-stone-400">Vence dia {exp.due_day}</span>}
                  </div>
                </div>
                <span className="text-sm font-semibold text-stone-700">R$ {(+exp.amount).toFixed(2)}</span>
                <button onClick={() => removeExpense(exp.id)} className="text-stone-300 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'inventario' && (
        <div>
          {adding && (
            <form onSubmit={handleSaveInv} className="card space-y-3 border-2 border-stone-200 mb-4">
              <input className="input" placeholder="Nome do item *" value={invForm.name} onChange={e => setInvForm(f => ({ ...f, name: e.target.value }))} required />
              <div className="grid grid-cols-2 gap-2">
                <select className="input" value={invForm.room} onChange={e => setInvForm(f => ({ ...f, room: e.target.value }))}>
                  {APT_ROOMS.map(r => <option key={r}>{r}</option>)}
                </select>
                <input className="input" type="number" min="1" placeholder="Quantidade" value={invForm.quantity} onChange={e => setInvForm(f => ({ ...f, quantity: parseInt(e.target.value) }))} />
                <select className="input" value={invForm.condition} onChange={e => setInvForm(f => ({ ...f, condition: e.target.value }))}>
                  {['novo', 'bom', 'regular', 'ruim'].map(c => <option key={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <input className="input" placeholder="Notas" value={invForm.notes} onChange={e => setInvForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Salvar</button>
                <button type="button" onClick={() => setAdding(false)} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>
            </form>
          )}
          <div className="space-y-2">
            {inventory.length === 0 && <p className="text-center text-stone-400 text-sm py-8">Inventário vazio. Adicione itens do seu apartamento!</p>}
            {inventory.map(item => (
              <div key={item.id} className="card flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-700">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-stone-400">{item.room}</span>
                    <span className="text-xs text-stone-400">· Qtd: {item.quantity}</span>
                    <span className={'text-xs px-1.5 py-0.5 rounded-full ' + (item.condition === 'novo' ? 'bg-teal-100 text-teal-600' : item.condition === 'bom' ? 'bg-blue-100 text-blue-600' : item.condition === 'regular' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600')}>{item.condition}</span>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-stone-300 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Wedding Page ─────────────────────────────────────────────────
export function WeddingPage() {
  const { user } = useAuth()
  const { data: guests, insert: insertGuest, remove: removeGuest } = useDB('wedding_guests')
  const [wData, setWData] = useState({location:'',date:'',budget:''})
  const [gModal, setGModal] = useState(false)
  const [gForm, setGForm] = useState({name:'',side:'Bruno',confirmed:'Pendente'})
  const [saved, setSaved] = useState(false)

  useEffect(()=>{
    if(!user) return
    supabase.from('wedding').select('*').order('updated_at',{ascending:true}).limit(1).single()
      .then(({data:r})=>{ if(r){ setWData({location:r.location||'',date:r.date||'',budget:r.budget||''}); window.__wUserId=r.user_id } })
  },[user])

  const saveWedding=async()=>{
    await supabase.from('wedding').upsert({user_id:window.__wUserId||user.id,location:wData.location,date:wData.date||null,budget:parseFloat(wData.budget)||0,updated_at:new Date().toISOString()},{onConflict:'user_id'})
    setSaved(true); setTimeout(()=>setSaved(false),2000)
  }
  const addGuest=async()=>{if(!gForm.name.trim())return;await insertGuest(gForm);setGModal(false);setGForm({name:'',side:'Bruno',confirmed:'Pendente'})}

  return(
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <PageHeader title="Casamento" subtitle="Organize o grande dia"/>
      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <div className="card">
          <p className="form-section-title">Informações gerais</p>
          <div className="grid gap-3">
            <div><label className="label">Local</label><input className="input" value={wData.location} onChange={e=>setWData(p=>({...p,location:e.target.value}))} placeholder="Nome do espaço"/></div>
            <div><label className="label">Data</label><input className="input" type="date" value={wData.date} onChange={e=>setWData(p=>({...p,date:e.target.value}))}/></div>
            <div><label className="label">Orçamento (R$)</label><input className="input" type="number" value={wData.budget} onChange={e=>setWData(p=>({...p,budget:e.target.value}))}/></div>
            <button className="btn-primary" onClick={saveWedding}>{saved?'✓ Salvo!':'Salvar'}</button>
          </div>
        </div>
        <div className="card">
          <p className="form-section-title">Resumo</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-stone-400">Local</span><span className="font-medium">{wData.location||'—'}</span></div>
            <div className="flex justify-between"><span className="text-stone-400">Data</span><span className="font-medium">{fmtDate(wData.date)}</span></div>
            <div className="flex justify-between"><span className="text-stone-400">Orçamento</span><span className="font-medium text-sage-600">{wData.budget?fmt(wData.budget):'—'}</span></div>
            <div className="flex justify-between"><span className="text-stone-400">Convidados</span><span className="font-medium">{guests.length}</span></div>
            <div className="flex justify-between"><span className="text-stone-400">Confirmados</span><span className="font-medium text-sage-600">{guests.filter(g=>g.confirmed==='Sim').length}</span></div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium text-stone-700">Lista de convidados</p>
        <button className="btn-primary flex items-center gap-1.5 text-sm" onClick={()=>setGModal(true)}><Plus className="w-3.5 h-3.5"/>Convidado</button>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Nome</th><th>Lado</th><th>Confirmado</th><th></th></tr></thead>
          <tbody>
            {guests.length===0?<tr><td colSpan={4} className="text-center py-8 text-stone-300">Nenhum convidado ainda.</td></tr>:
              guests.map(g=>(
                <tr key={g.id}>
                  <td className="font-medium">{g.name}</td>
                  <td><span className={`badge ${WHO_COLORS[g.side]||'badge-stone'}`}>{g.side}</span></td>
                  <td><span className={`badge ${g.confirmed==='Sim'?'badge-sage':g.confirmed==='Não'?'badge-blush':'badge-amber'}`}>{g.confirmed}</span></td>
                  <td><button onClick={()=>removeGuest(g.id)} className="btn-icon w-7 h-7"><Trash2 className="w-3.5 h-3.5"/></button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Modal open={gModal} onClose={()=>setGModal(false)} title="Novo convidado">
        <div className="grid gap-3">
          <div><label className="label">Nome</label><input className="input" value={gForm.name} onChange={e=>setGForm(p=>({...p,name:e.target.value}))}/></div>
          <div><label className="label">Lado</label><select className="select" value={gForm.side} onChange={e=>setGForm(p=>({...p,side:e.target.value}))}><option>Bruno</option><option>Vianka</option><option>Ambos</option></select></div>
          <div><label className="label">Confirmado?</label><select className="select" value={gForm.confirmed} onChange={e=>setGForm(p=>({...p,confirmed:e.target.value}))}><option>Pendente</option><option>Sim</option><option>Não</option></select></div>
        </div>
        <div className="flex gap-2 justify-end mt-4"><button className="btn-secondary" onClick={()=>setGModal(false)}>Cancelar</button><button className="btn-primary" onClick={addGuest}>Salvar</button></div>
      </Modal>
    </div>
  )
}

// ─── Goals Page ───────────────────────────────────────────────────
import { GOAL_STATUS } from '../lib/utils'
const GOAL_CATS=['Desenvolvimento','Trabalho','Saúde','Casamento','Finanças','Relacionamento','Lazer','Espiritualidade','Outros']

export function GoalsPage() {
  const { data: goals, insert, remove, update } = useDB('goals')
  const { addLog } = useLogs()
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState('todos')
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({goal:'',responsible:'Bruno',category:'Desenvolvimento',tipo:'Médio prazo',status:'Em andamento',deadline:'',reward:''})
  const filtered=filter==='todos'?goals:goals.filter(g=>g.responsible===filter||g.status===filter)
  const handleAdd=async(e)=>{e.preventDefault();await insert({...form, deadline: form.deadline||null});setAdding(false);setForm({goal:'',responsible:'Bruno',category:'Desenvolvimento',tipo:'Médio prazo',status:'Em andamento',deadline:'',reward:''})}
  const handleEdit=async(e)=>{e.preventDefault();if(!editItem)return;await update(editItem.id,{goal:editItem.goal,responsible:editItem.responsible,category:editItem.category,tipo:editItem.tipo,status:editItem.status,deadline:editItem.deadline,reward:editItem.reward});setEditItem(null)}
  return(
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <PageHeader title="Metas"
        action={<button className="btn-primary flex items-center gap-1.5" onClick={()=>setAdding(!adding)}><Plus className="w-4 h-4"/>Nova meta</button>}/>
      <div className="flex gap-2 flex-wrap mb-4">
        {['todos','Bruno','Vianka','Ambos','Em andamento','Concluída'].map(f=><button key={f} onClick={()=>setFilter(f)} className={`chip ${filter===f?'active':''}`}>{f==='todos'?'Todas':f}</button>)}
      </div>
      {adding&&(
        <form onSubmit={handleAdd} className="card mb-4">
          <p className="form-section-title">Nova meta</p>
          <div className="grid gap-3">
            <div><label className="label">Meta</label><textarea className="textarea" value={form.goal} onChange={e=>setForm(p=>({...p,goal:e.target.value}))} required/></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><label className="label">Responsável</label><select className="select" value={form.responsible} onChange={e=>setForm(p=>({...p,responsible:e.target.value}))}><option>Bruno</option><option>Vianka</option><option>Ambos</option></select></div>
              <div><label className="label">Categoria</label><select className="select" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>{GOAL_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label className="label">Tipo</label><select className="select" value={form.tipo} onChange={e=>setForm(p=>({...p,tipo:e.target.value}))}><option>Curto prazo</option><option>Médio prazo</option><option>Longo prazo</option></select></div>
              <div><label className="label">Status</label><select className="select" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>{Object.keys(GOAL_STATUS).map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Prazo</label><input className="input" type="date" value={form.deadline} onChange={e=>setForm(p=>({...p,deadline:e.target.value}))}/></div>
              <div><label className="label">Recompensa</label><input className="input" value={form.reward} onChange={e=>setForm(p=>({...p,reward:e.target.value}))} placeholder="Ex: Jantar especial"/></div>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-3"><button type="button" className="btn-secondary" onClick={()=>setAdding(false)}>Cancelar</button><button type="submit" className="btn-primary">Salvar</button></div>
        </form>
      )}
      {filtered.length===0?<div className="card text-center py-10 text-stone-300">Nenhuma meta encontrada.</div>:
        filtered.map(g=>(
          <div key={g.id} className="card mb-3">
            {editItem?.id===g.id?(
              <form onSubmit={handleEdit} className="grid gap-3">
                <div><label className="label">Meta</label><textarea className="textarea" value={editItem.goal||''} onChange={e=>setEditItem(p=>({...p,goal:e.target.value}))} required/></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><label className="label">Responsável</label><select className="select" value={editItem.responsible||'Bruno'} onChange={e=>setEditItem(p=>({...p,responsible:e.target.value}))}><option>Bruno</option><option>Vianka</option><option>Ambos</option></select></div>
                  <div><label className="label">Categoria</label><select className="select" value={editItem.category||'Desenvolvimento'} onChange={e=>setEditItem(p=>({...p,category:e.target.value}))}>{GOAL_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div><label className="label">Tipo</label><select className="select" value={editItem.tipo||'Médio prazo'} onChange={e=>setEditItem(p=>({...p,tipo:e.target.value}))}><option>Curto prazo</option><option>Médio prazo</option><option>Longo prazo</option></select></div>
                  <div><label className="label">Status</label><select className="select" value={editItem.status||'Em andamento'} onChange={e=>setEditItem(p=>({...p,status:e.target.value}))}>{Object.keys(GOAL_STATUS).map(s=><option key={s}>{s}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Prazo</label><input className="input" type="date" value={editItem.deadline||''} onChange={e=>setEditItem(p=>({...p,deadline:e.target.value}))}/></div>
                  <div><label className="label">Recompensa</label><input className="input" value={editItem.reward||''} onChange={e=>setEditItem(p=>({...p,reward:e.target.value}))}/></div>
                </div>
                <div className="flex gap-2 justify-end"><button type="button" className="btn-secondary" onClick={()=>setEditItem(null)}>Cancelar</button><button type="submit" className="btn-primary">Salvar</button></div>
              </form>
            ):(
              <>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className={`badge ${WHO_COLORS[g.responsible]||'badge-stone'}`}>{g.responsible}</span>
                    <span className="badge badge-stone">{g.category}</span>
                    <span className="badge badge-stone">{g.tipo}</span>
                    <span className={`badge ${GOAL_STATUS[g.status]||'badge-stone'}`}>{g.status}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={()=>setEditItem({...g})} className="btn-icon w-7 h-7"><Pencil className="w-3.5 h-3.5"/></button>
                    <button onClick={()=>remove(g.id)} className="btn-icon w-7 h-7"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
                <p className="font-medium text-stone-800 mb-1">{g.goal}</p>
                <div className="flex gap-3 text-xs text-stone-400">
                  {g.deadline&&<span>Prazo: {fmtDate(g.deadline)}</span>}
                  {g.reward&&<span>Recompensa: <strong className="text-stone-600">{g.reward}</strong></span>}
                </div>
              </>
            )}
          </div>
        ))}
    </div>
  )
}

// --- Spreadsheet Page ---
export function SpreadsheetPage() {
  const [month, setMonth] = useState(monthKey())
    const { data: txs } = useDB('transactions', { filter: { month } })
      const { settings } = useSettings()
        const prev = () => setMonth(monthKey(subMonths(new Date(month + '-01'), 1)))
          const next = () => setMonth(monthKey(addMonths(new Date(month + '-01'), 1)))
            const wifePct = (settings?.wife_percentage || 30) / 100
              const aptPct = (settings?.apartment_percentage || 40) / 100
                const weddingPct = (settings?.wedding_percentage || 20) / 100
                  const companyPct = (settings?.company_percentage || 20) / 100
                    const sorted = [...(txs || [])].sort((a, b) => new Date(a.date) - new Date(b.date))
                      let rW = 0, rA = 0, rWed = 0, rC = 0
                        const rows = sorted.map((t, i) => {
                            const amt = Number(t.amount) || 0
                                if (t.type === 'income') { rW += amt*wifePct; rA += amt*aptPct; rWed += amt*weddingPct; rC += amt*companyPct }
                                    else if (t.category === 'wife') rW -= amt
                                        else if (t.category === 'savings' || t.category === 'apartment') rA -= amt
                                            else if (t.category === 'wedding') rWed -= amt
                                                else if (t.category === 'company') rC -= amt
                                                    else { rW -= amt*wifePct; rA -= amt*aptPct; rWed -= amt*weddingPct; rC -= amt*companyPct }
                                                        return { ...t, idx: i+1, sW: rW, sA: rA, sWed: rWed, sC: rC }
                                                          })
                                                            const fmt = v => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                                              const catLabel = { work:'Trabalho', personal:'Pessoal', wife:'Mimos', savings:'Poupança', company:'Empresa', apartment:'Apartamento', wedding:'Casamento' }
                                                                const catColor = c => c==='wife'?'bg-pink-100 text-pink-700':c==='work'?'bg-green-100 text-green-700':c==='company'?'bg-blue-100 text-blue-700':c==='savings'||c==='apartment'?'bg-amber-100 text-amber-700':c==='wedding'?'bg-rose-100 text-rose-700':'bg-stone-100 text-stone-600'
                                                                  const totIn = (txs||[]).filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0)
                                                                    const totEx = (txs||[]).filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
                                                                      const last = rows[rows.length-1]
                                                                        const colCls = (v, pos, neg) => v >= 0 ? pos : neg
                                                                          return (
                                                                              <div className="p-4 md:p-6 max-w-full mx-auto">
                                                                                    <PageHeader title="Planilha" subtitle="Visão completa das movimentações" />
                                                                                          <div className="flex items-center gap-3 mb-4">
                                                                                                  <button onClick={prev} className="btn-secondary px-3 py-1.5 text-sm flex items-center gap-1"><ChevronLeft size={16} /> Anterior</button>
                                                                                                          <span className="font-semibold text-stone-700">{monthLabel(month)}</span>
                                                                                                                  <button onClick={next} className="btn-secondary px-3 py-1.5 text-sm flex items-center gap-1">Próximo <ChevronRight size={16} /></button>
                                                                                                                        </div>
                                                                                                                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                                                                                                                                      <div className="card p-3 text-center"><p className="text-xs text-stone-500 mb-1">Entradas</p><p className="font-bold text-green-600">{fmt(totIn)}</p></div>
                                                                                                                                              <div className="card p-3 text-center"><p className="text-xs text-stone-500 mb-1">Saídas</p><p className="font-bold text-red-500">{fmt(totEx)}</p></div>
                                                                                                                                                      <div className="card p-3 text-center"><p className="text-xs text-stone-500 mb-1">Saldo Mimos</p><p className={`font-bold ${colCls(last?.sW||0,'text-pink-600','text-red-500')}`}>{fmt(last?.sW||0)}</p></div>
                                                                                                                                                              <div className="card p-3 text-center"><p className="text-xs text-stone-500 mb-1">Saldo Apto</p><p className={`font-bold ${colCls(last?.sA||0,'text-amber-600','text-red-500')}`}>{fmt(last?.sA||0)}</p></div>
                                                                                                                                                                      <div className="card p-3 text-center"><p className="text-xs text-stone-500 mb-1">Saldo Casamento</p><p className={`font-bold ${colCls(last?.sWed||0,'text-rose-600','text-red-500')}`}>{fmt(last?.sWed||0)}</p></div>
                                                                                                                                                                              <div className="card p-3 text-center"><p className="text-xs text-stone-500 mb-1">Saldo Empresa</p><p className={`font-bold ${colCls(last?.sC||0,'text-blue-600','text-red-500')}`}>{fmt(last?.sC||0)}</p></div>
                                                                                                                                                                                    </div>
                                                                                                                                                                                          <div className="card overflow-x-auto">
                                                                                                                                                                                                  <table className="w-full text-xs md:text-sm border-collapse">
                                                                                                                                                                                                            <thead>
                                                                                                                                                                                                                        <tr className="bg-stone-100 text-stone-600">
                                                                                                                                                                                                                                      <th className="p-2 text-left border-b border-stone-200">#</th>
                                                                                                                                                                                                                                                    <th className="p-2 text-left border-b border-stone-200">Data</th>
                                                                                                                                                                                                                                                                  <th className="p-2 text-left border-b border-stone-200">Descrição</th>
                                                                                                                                                                                                                                                                                <th className="p-2 text-left border-b border-stone-200">Categoria</th>
                                                                                                                                                                                                                                                                                              <th className="p-2 text-right border-b border-stone-200">Entrada</th>
                                                                                                                                                                                                                                                                                                            <th className="p-2 text-right border-b border-stone-200">Saída</th>
                                                                                                                                                                                                                                                                                                                          <th className="p-2 text-right border-b border-stone-200">Mimos</th>
                                                                                                                                                                                                                                                                                                                                        <th className="p-2 text-right border-b border-stone-200">Apto</th>
                                                                                                                                                                                                                                                                                                                                                      <th className="p-2 text-right border-b border-stone-200">Casamento</th>
                                                                                                                                                                                                                                                                                                                                                                    <th className="p-2 text-right border-b border-stone-200">Empresa</th>
                                                                                                                                                                                                                                                                                                                                                                                </tr>
                                                                                                                                                                                                                                                                                                                                                                                          </thead>
                                                                                                                                                                                                                                                                                                                                                                                                    <tbody>
                                                                                                                                                                                                                                                                                                                                                                                                                {rows.map(r => (
                                                                                                                                                                                                                                                                                                                                                                                                                              <tr key={r.id} className={`border-b border-stone-100 hover:bg-stone-50 ${r.type==='income'?'bg-green-50/30':''}`}>
                                                                                                                                                                                                                                                                                                                                                                                                                                              <td className="p-2 text-stone-400">{r.idx}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                              <td className="p-2 whitespace-nowrap">{r.date ? format(new Date(r.date+'T12:00:00'),'dd/MM/yyyy') : '-'}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <td className="p-2 max-w-xs truncate" title={r.description}>{r.description}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <td className="p-2"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${catColor(r.category)}`}>{catLabel[r.category]||r.category}</span></td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <td className="p-2 text-right text-green-600">{r.type==='income'?fmt(r.amount):''}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <td className="p-2 text-right text-red-500">{r.type==='expense'?fmt(r.amount):''}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <td className={`p-2 text-right ${colCls(r.sW,'text-pink-600','text-red-500')}`}>{fmt(r.sW)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <td className={`p-2 text-right ${colCls(r.sA,'text-amber-600','text-red-500')}`}>{fmt(r.sA)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <td className={`p-2 text-right ${colCls(r.sWed,'text-rose-600','text-red-500')}`}>{fmt(r.sWed)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <td className={`p-2 text-right ${colCls(r.sC,'text-blue-600','text-red-500')}`}>{fmt(r.sC)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ))}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    {rows.length === 0 && <tr><td colSpan={10} className="p-6 text-center text-stone-400">Nenhuma movimentação neste mês</td></tr>}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </tbody>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        {rows.length > 0 && (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <tfoot>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  <tr className="bg-stone-100 font-semibold text-stone-700">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  <td colSpan={4} className="p-2 text-right">Totais</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  <td className="p-2 text-right text-green-600">{fmt(totIn)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  <td className="p-2 text-right text-red-500">{fmt(totEx)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  <td className={`p-2 text-right ${colCls(last?.sW||0,'text-pink-600','text-red-500')}`}>{fmt(last?.sW||0)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  <td className={`p-2 text-right ${colCls(last?.sA||0,'text-amber-600','text-red-500')}`}>{fmt(last?.sA||0)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  <td className={`p-2 text-right ${colCls(last?.sWed||0,'text-rose-600','text-red-500')}`}>{fmt(last?.sWed||0)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  <td className={`p-2 text-right ${colCls(last?.sC||0,'text-blue-600','text-red-500')}`}>{fmt(last?.sC||0)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </tfoot>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      )}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </table>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          )
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          }
