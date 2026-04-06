 // ─── Wife Page ───────────────────────────────────────────────────
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDB } from '../hooks/useDB'
import { useSettings, useLogs } from '../hooks/useSettings'
import { fmt, monthLabel, monthKey } from '../lib/utils'
import { subMonths, addMonths, format } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Trash2, Heart, Sparkles, Pencil, Check, X, Copy, ThumbsUp, ThumbsDown, Settings, ClipboardList, Globe, Home, Gem, Target, ShoppingCart, ArrowLeftRight, ExternalLink } from 'lucide-react'
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

import { RULE_CATEGORIES } from '../lib/utils'
export function RulesPage() {
  const { data: rules, insert, remove, update } = useDB('rules')
  const { addLog } = useLogs()
  const [form, setForm] = useState({category:'permitido',text:''})
  const [adding, setAdding] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const handleAdd = async (e) => {
    e.preventDefault()
    if(!form.text.trim()) return
    await insert(form)
    setForm({category:'permitido',text:''}); setAdding(false)
  }
  const handleEdit = async (e) => {
    e.preventDefault()
    await update(editItem.id, {category: editItem.category, text: editItem.text})
    setEditItem(null)
  }

  return(
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <PageHeader title="Regras" subtitle="Regras do casal por categoria"
        action={<button className="btn-primary flex items-center gap-1.5" onClick={()=>setAdding(!adding)}><Plus className="w-4 h-4"/>Adicionar</button>}/>
      {adding&&(
        <form onSubmit={handleAdd} className="card mb-5">
          <p className="form-section-title">Nova regra</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="label">Categoria</label><select className="select" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>{Object.entries(RULE_CATEGORIES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
            <div><label className="label">Regra</label><input className="input" value={form.text} onChange={e=>setForm(p=>({...p,text:e.target.value}))} placeholder="Descreva a regra..."/></div>
          </div>
          <div className="flex gap-2 justify-end"><button type="button" className="btn-secondary" onClick={()=>setAdding(false)}>Cancelar</button><button type="submit" className="btn-primary">Salvar</button></div>
        </form>
      )}
      {Object.entries(RULE_CATEGORIES).map(([key,cat])=>{
        const catRules=rules.filter(r=>r.category===key)
        return(
          <div key={key} className="card mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`badge ${cat.dot}`}>{cat.icon}</span>
              <h3 className="font-medium text-stone-700">{cat.label}</h3>
              <span className="text-xs text-stone-400">({catRules.length})</span>
            </div>
            {catRules.length===0&&<p className="text-sm text-stone-400 italic py-2">Nenhuma regra nesta categoria.</p>}
            {catRules.map(r=>(
              <div key={r.id} className="flex items-start gap-2 py-2 group border-b border-stone-50 last:border-0">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-stone-300"></span>
                {editItem?.id===r.id ? (
                  <form onSubmit={handleEdit} className="flex-1 flex gap-2 flex-wrap">
                    <input className="input flex-1 min-w-40" value={editItem.text} onChange={e=>setEditItem(p=>({...p,text:e.target.value}))} autoFocus/>
                    <select className="select" value={editItem.category} onChange={e=>setEditItem(p=>({...p,category:e.target.value}))}>{Object.entries(RULE_CATEGORIES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
                    <button type="submit" className="btn-primary text-xs px-3">Salvar</button>
                    <button type="button" className="btn-secondary text-xs px-3" onClick={()=>setEditItem(null)}>Cancelar</button>
                  </form>
                ) : (
                  <>
                    <p className="text-sm text-stone-600 flex-1">{r.text}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={()=>setEditItem({...r})} className="btn-icon w-6 h-6 flex-shrink-0" title="Editar"><Pencil className="w-3 h-3"/></button>
                      <button onClick={()=>remove(r.id)} className="btn-icon w-6 h-6 flex-shrink-0" title="Remover"><Trash2 className="w-3 h-3"/></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ─── Trips Page ───────────────────────────────────────────────────
import { TRIP_STATUS, TRIP_CATS, fmtDate } from '../lib/utils'
import Modal from '../components/Modal'
import { useRef, useEffect as useEffectMap } from 'react'

function TripMapModal({ trip, onClose }) {
  const { data: pins, insert: insertPin, remove: removePin } = useDB('trip_pins', { filter: { trip_id: trip.id }, order: 'created_at', asc: true })
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  const [searchAddr, setSearchAddr] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [pinForm, setPinForm] = useState({ name: '', address: '', note: '', lat: null, lng: null })
  const [showPinForm, setShowPinForm] = useState(false)
  const [activeTab, setActiveTab] = useState('map')

  useEffectMap(() => {
    if (!window.L) return
    if (mapInstanceRef.current) return
    const L = window.L
    const map = L.map(mapRef.current, { zoomControl: true }).setView([-15.7801, -47.9292], 4)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)
    mapInstanceRef.current = map
    map.on('click', (e) => {
      setPinForm(f => ({ ...f, lat: e.latlng.lat, lng: e.latlng.lng, address: `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}` }))
      setShowPinForm(true)
    })
    return () => { map.remove(); mapInstanceRef.current = null }
  }, [])

  useEffectMap(() => {
    const L = window.L
    if (!L || !mapInstanceRef.current) return
    const map = mapInstanceRef.current
    Object.keys(markersRef.current).forEach(id => {
      if (!pins.find(p => String(p.id) === id)) {
        markersRef.current[id].remove()
        delete markersRef.current[id]
      }
    })
    pins.forEach(p => {
      if (!markersRef.current[p.id]) {
        const icon = L.divIcon({ className: '', html: `<div style="background:#d97706;color:#fff;border-radius:50% 50% 50% 0;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.3);transform:rotate(-45deg)"><span style="transform:rotate(45deg)">📍</span></div>`, iconSize: [28, 28], iconAnchor: [14, 28] })
        const marker = L.marker([p.lat, p.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${p.name}</b>${p.note ? '<br/>' + p.note : ''}`)
        markersRef.current[p.id] = marker
      }
    })
    if (pins.length > 0) {
      const bounds = L.latLngBounds(pins.map(p => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [pins])

  const searchAddress = async () => {
    if (!searchAddr.trim()) return
    setSearching(true)
    setSearchResults([])
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddr)}&limit=5`, { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } })
      const data = await r.json()
      setSearchResults(data)
    } catch(e) {}
    setSearching(false)
  }

  const selectResult = (res) => {
    setPinForm(f => ({ ...f, lat: parseFloat(res.lat), lng: parseFloat(res.lon), address: res.display_name, name: f.name || res.display_name.split(',')[0] }))
    setSearchResults([])
    setSearchAddr(res.display_name.split(',').slice(0,2).join(','))
    setShowPinForm(true)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([parseFloat(res.lat), parseFloat(res.lon)], 15)
    }
  }

  const savePin = async () => {
    if (!pinForm.lat || !pinForm.name.trim()) return
    await insertPin({ trip_id: trip.id, name: pinForm.name, address: pinForm.address, note: pinForm.note, lat: pinForm.lat, lng: pinForm.lng })
    setPinForm({ name: '', address: '', note: '', lat: null, lng: null })
    setShowPinForm(false)
  }

  const focusPin = (p) => {
    if (mapInstanceRef.current && window.L) {
      mapInstanceRef.current.setView([p.lat, p.lng], 16)
      if (markersRef.current[p.id]) markersRef.current[p.id].openPopup()
    }
    setActiveTab('map')
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,.6)',display:'flex',flexDirection:'column'}} onClick={onClose}>
      <div style={{background:'#F9F7F4',flex:1,display:'flex',flexDirection:'column',margin:'0',maxHeight:'100vh'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'12px 16px',borderBottom:'1px solid #e7e5e4',display:'flex',alignItems:'center',gap:8,background:'#fff'}}>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,lineHeight:1}}>←</button>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:16,fontFamily:'Georgia,serif'}}>{trip.destination}</div>
            <div style={{fontSize:12,color:'#78716c'}}>Planejamento de rota</div>
          </div>
          <div style={{display:'flex',gap:4}}>
            <button onClick={()=>setActiveTab('map')} style={{padding:'4px 12px',borderRadius:20,border:'none',cursor:'pointer',background:activeTab==='map'?'#d97706':'#e7e5e4',color:activeTab==='map'?'#fff':'#44403c',fontSize:13,fontWeight:600}}>Mapa</button>
            <button onClick={()=>setActiveTab('pins')} style={{padding:'4px 12px',borderRadius:20,border:'none',cursor:'pointer',background:activeTab==='pins'?'#d97706':'#e7e5e4',color:activeTab==='pins'?'#fff':'#44403c',fontSize:13,fontWeight:600}}>Pins ({pins.length})</button>
          </div>
        </div>
        <div style={{padding:'10px 16px',background:'#fff',borderBottom:'1px solid #e7e5e4',position:'relative'}}>
          <div style={{display:'flex',gap:8}}>
            <input
              value={searchAddr}
              onChange={e=>setSearchAddr(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&searchAddress()}
              placeholder="Buscar endereço ou local..."
              style={{flex:1,padding:'8px 12px',borderRadius:8,border:'1px solid #d6d3d1',fontSize:14,outline:'none'}}
            />
            <button onClick={searchAddress} disabled={searching} style={{padding:'8px 16px',borderRadius:8,background:'#d97706',color:'#fff',border:'none',cursor:'pointer',fontSize:14,fontWeight:600,whiteSpace:'nowrap'}}>
              {searching ? '...' : 'Buscar'}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div style={{position:'absolute',top:'100%',left:16,right:16,background:'#fff',border:'1px solid #d6d3d1',borderRadius:8,boxShadow:'0 4px 12px rgba(0,0,0,.15)',zIndex:2000,maxHeight:200,overflowY:'auto'}}>
              {searchResults.map((r,i) => (
                <div key={i} onClick={()=>selectResult(r)} style={{padding:'8px 12px',cursor:'pointer',borderBottom:'1px solid #f5f5f4',fontSize:13}} onMouseEnter={e=>e.currentTarget.style.background='#fef3c7'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                  <div style={{fontWeight:600}}>{r.display_name.split(',')[0]}</div>
                  <div style={{color:'#78716c',fontSize:12}}>{r.display_name.split(',').slice(1,3).join(',')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{flex:1,position:'relative',display:activeTab==='map'?'block':'none'}}>
          <div ref={mapRef} style={{width:'100%',height:'100%',minHeight:300}} />
          {!window.L && <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f5f4',flexDirection:'column',gap:8}}><span style={{fontSize:32}}>🗺️</span><span style={{color:'#78716c',fontSize:14}}>Mapa carregando...</span></div>}
        </div>
        {activeTab === 'pins' && (
          <div style={{flex:1,overflowY:'auto',padding:16}}>
            {pins.length === 0 ? (
              <div style={{textAlign:'center',padding:40,color:'#78716c'}}>
                <div style={{fontSize:40,marginBottom:8}}>📍</div>
                <div>Nenhum pin ainda. Clique no mapa ou busque um endereço para adicionar pins.</div>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {pins.map((p,i) => (
                  <div key={p.id} style={{background:'#fff',borderRadius:10,padding:'10px 14px',border:'1px solid #e7e5e4',display:'flex',alignItems:'flex-start',gap:10}}>
                    <div style={{background:'#d97706',color:'#fff',borderRadius:'50%',width:26,height:26,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:14}}>{p.name}</div>
                      {p.address && <div style={{fontSize:12,color:'#78716c',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.address}</div>}
                      {p.note && <div style={{fontSize:12,color:'#57534e',marginTop:4,fontStyle:'italic'}}>{p.note}</div>}
                    </div>
                    <div style={{display:'flex',gap:4}}>
                      <button onClick={()=>focusPin(p)} style={{background:'#fef3c7',border:'none',borderRadius:6,padding:'4px 8px',cursor:'pointer',fontSize:12}}>Ver</button>
                      <button onClick={()=>removePin(p.id)} style={{background:'#fee2e2',border:'none',borderRadius:6,padding:'4px 8px',cursor:'pointer',fontSize:12,color:'#dc2626'}}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {showPinForm && (
          <div style={{background:'#fff',borderTop:'1px solid #e7e5e4',padding:16}}>
            <div style={{fontWeight:600,fontSize:14,marginBottom:10}}>📍 Adicionar Pin</div>
            <div style={{display:'grid',gap:8}}>
              <input value={pinForm.name} onChange={e=>setPinForm(f=>({...f,name:e.target.value}))} placeholder="Nome do local *" style={{padding:'8px 12px',borderRadius:8,border:'1px solid #d6d3d1',fontSize:14}} />
              <input value={pinForm.address} onChange={e=>setPinForm(f=>({...f,address:e.target.value}))} placeholder="Endereço" style={{padding:'8px 12px',borderRadius:8,border:'1px solid #d6d3d1',fontSize:14}} />
              <input value={pinForm.note} onChange={e=>setPinForm(f=>({...f,note:e.target.value}))} placeholder="Nota (opcional)" style={{padding:'8px 12px',borderRadius:8,border:'1px solid #d6d3d1',fontSize:14}} />
              {pinForm.lat && <div style={{fontSize:12,color:'#78716c'}}>📌 {pinForm.lat.toFixed(5)}, {pinForm.lng.toFixed(5)}</div>}
              <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                <button onClick={()=>setShowPinForm(false)} style={{padding:'8px 16px',borderRadius:8,background:'#e7e5e4',border:'none',cursor:'pointer',fontSize:14}}>Cancelar</button>
                <button onClick={savePin} style={{padding:'8px 16px',borderRadius:8,background:'#d97706',color:'#fff',border:'none',cursor:'pointer',fontSize:14,fontWeight:600}}>Salvar Pin</button>
              </div>
            </div>
          </div>
        )}
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

  const filtered = filter==='todos'?trips:trips.filter(t=>t.status===filter)
  const totalBudget = trips.reduce((s,t)=>s+(+t.budget),0)
  const totalSpent  = trips.reduce((s,t)=>s+(+t.spent),0)

  const openAdd = () => { setEditItem(null); setForm({destination:'',category:'Com o marido',status:'interesse',start_date:'',end_date:'',budget:'',spent:'',notes:''}); setModal(true) }
  const openEdit = (t) => { setEditItem(t); setForm({destination:t.destination,category:t.category,status:t.status,start_date:t.start_date||'',end_date:t.end_date||'',budget:t.budget||'',spent:t.spent||'',notes:t.notes||''}); setModal(true) }

  const handleSave = async () => {
    const data={...form,budget:parseFloat(form.budget)||0,spent:parseFloat(form.spent)||0,start_date:form.start_date||null,end_date:form.end_date||null}
    if(editItem) await update(editItem.id,data)
    else await insert(data)
    setModal(false)
  }

  const dur = (s,e) => { if(!s||!e)return null; const d=Math.round((new Date(e)-new Date(s))/(864e5))+1; return d>0?d+' dia'+(d>1?'s':''):null }

  return (
    <div className="page-wrapper">
      <PageHeader title="Viagens" subtitle="Organize e acompanhe as viagens"
        action={<button className="btn-primary flex items-center gap-1.5" onClick={openAdd}><Plus className="w-4 h-4"/>Nova viagem</button>}/>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="card"><p className="stat-label">Total</p><p className="text-xl font-display font-semibold">{trips.length}</p></div>
        <div className="card"><p className="stat-label">Orçamento</p><p className="text-xl font-display font-semibold text-amber-600">{fmt(totalBudget)}</p></div>
        <div className="card"><p className="stat-label">Gasto</p><p className="text-xl font-display font-semibold text-blush-500">{fmt(totalSpent)}</p></div>
        <div className="card"><p className="stat-label">Saldo</p><p className={`text-xl font-display font-semibold ${(totalBudget-totalSpent)>=0?'text-sage-600':'text-blush-500'}`}>{fmt(totalBudget-totalSpent)}</p></div>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {['todos','interesse','planejando','concluido','cancelado'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`chip ${filter===f?'active':''}`}>
            {f==='todos'?'Todas':TRIP_STATUS[f]?.label||f}
          </button>
        ))}
      </div>

      {filtered.length===0?<div className="card text-center py-10 text-stone-400">Nenhuma viagem encontrada</div>:
        <div className="grid gap-3">
          {filtered.map(t=>(
            <div key={t.id} className="card">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-display font-semibold text-lg">{t.destination}</p>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {t.status&&<span className="tag" style={{background:TRIP_STATUS[t.status]?.color+'22',color:TRIP_STATUS[t.status]?.color}}>{TRIP_STATUS[t.status]?.label||t.status}</span>}
                    {t.category&&<span className="tag">{t.category}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="btn-ghost text-xs py-1 px-2" onClick={()=>setMapTrip(t)}>🗺 Mapa</button>
                  <button className="btn-ghost text-xs py-1 px-2" onClick={()=>openEdit(t)}>Editar</button>
                  <button onClick={()=>remove(t.id)} className="btn-icon w-7 h-7"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
              {(t.start_date||t.end_date)&&(
                <p className="text-xs text-stone-400 mb-3">{fmtDate(t.start_date)} → {fmtDate(t.end_date)}{dur(t.start_date,t.end_date)?' · '+dur(t.start_date,t.end_date):''}</p>
              )}
              {(+t.budget>0)&&(
                <div>
                  <div className="flex justify-between text-xs text-stone-400 mb-1">
                    <span>Orçamento: {fmt(t.budget)}</span><span>Gasto: {fmt(t.spent)}</span>
                  </div>
                  <div className="progress mb-1"><div className="progress-fill" style={{width:Math.min(100,(+t.spent/+t.budget)*100)+'%',background:((+t.spent/+t.budget)>.9)?'#f43f5e':'#84cc16'}}/></div>
                  <p className={`text-xs font-medium ${(+t.budget-+t.spent)>=0?'text-sage-600':'text-blush-500'}`}>Saldo: {fmt(+t.budget-+t.spent)}</p>
                </div>
              )}
              {t.notes&&<p className="text-xs text-stone-400 mt-2 border-t border-stone-50 pt-2">{t.notes}</p>}
            </div>
          ))}
        </div>}

      {mapTrip && <TripMapModal trip={mapTrip} onClose={()=>setMapTrip(null)} />}

      <Modal open={modal} onClose={()=>setModal(false)} title={editItem?'Editar viagem':'Nova viagem'}>
        <div className="grid gap-3">
          <div><label className="label">Destino</label><input className="input" value={form.destination} onChange={e=>setForm(f=>({...f,destination:e.target.value}))} placeholder="Ex: Paris, França"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Categoria</label><select className="select" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}><option>Com o marido</option><option>Sozinha</option><option>Família</option><option>Amigos</option></select></div>
            <div><label className="label">Status</label><select className="select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>{Object.entries(TRIP_STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Partida</label><input className="input" type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))}/></div>
            <div><label className="label">Volta</label><input className="input" type="date" value={form.end_date} min={form.start_date} onChange={e=>setForm(f=>({...f,end_date:e.target.value}))}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Orçamento (R$)</label><input className="input" type="number" step="0.01" min="0" value={form.budget} onChange={e=>setForm(f=>({...f,budget:e.target.value}))}/></div>
            <div><label className="label">Já gasto (R$)</label><input className="input" type="number" step="0.01" min="0" value={form.spent} onChange={e=>setForm(f=>({...f,spent:e.target.value}))}/></div>
          </div>
          <div><label className="label">Notas</label><textarea className="textarea" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={3}/></div>
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

// ─── Market Page ──────────────────────────────────────────────────
import { MARKET_PRIORITY, MARKET_STATUS } from '../lib/utils'
const MKT_CATS=['Hortifruti','Laticínios','Carnes','Mercearia','Higiene','Limpeza','Bebidas','Congelados','Outros']
const MKT_FREQ=['Diário','Semanal','Quinzenal','Mensal','Eventual']

export function MarketPage() {
  const { data: items, insert, remove, update } = useDB('market_items')
  const { data: stock, insert: insertStock, remove: removeStock } = useDB('home_stock')
  const [adding, setAdding] = useState(false)
  const [stockModal, setStockModal] = useState(false)
  const [newStock, setNewStock] = useState('')
  const [filter, setFilter] = useState('todos')
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({category:'Mercearia',item:'',brand:'',unit:'',quantity:'',frequency:'Semanal',priority:'Essencial',responsible:'Bruno',status:'Comprar',notes:''})
  const filtered=filter==='todos'?items:items.filter(i=>i.status===filter)
  const handleAdd=async(e)=>{e.preventDefault();if(!form.item.trim())return;await insert({...form,quantity:parseFloat(form.quantity)||null});setAdding(false);setForm({category:'Mercearia',item:'',brand:'',unit:'',quantity:'',frequency:'Semanal',priority:'Essencial',responsible:'Bruno',status:'Comprar',notes:''})}
  const handleEdit=async(e)=>{e.preventDefault();if(!editItem?.item?.trim())return;await update(editItem.id,{category:editItem.category,item:editItem.item,brand:editItem.brand,unit:editItem.unit,quantity:parseFloat(editItem.quantity)||null,frequency:editItem.frequency,priority:editItem.priority,responsible:editItem.responsible,status:editItem.status,notes:editItem.notes});setEditItem(null)}
  return(
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <PageHeader title="Mercado"
        action={<div className="flex gap-2">
          <button className="btn-secondary text-sm" onClick={()=>setStockModal(true)}>ð  Em casa</button>
          <button className="btn-primary flex items-center gap-1.5" onClick={()=>setAdding(!adding)}><Plus className="w-4 h-4"/>Item</button>
        </div>}/>
      <div className="flex gap-2 flex-wrap mb-4">
        {['todos',...Object.keys(MARKET_STATUS)].map(f=><button key={f} onClick={()=>setFilter(f)} className={`chip ${filter===f?'active':''}`}>{f==='todos'?'Todos':f}</button>)}
      </div>
      {adding&&(
        <form onSubmit={handleAdd} className="card mb-4">
          <p className="form-section-title">Novo item</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <div><label className="label">Categoria</label><select className="select" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>{MKT_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="label">Item</label><input className="input" value={form.item} onChange={e=>setForm(p=>({...p,item:e.target.value}))} required/></div>
            <div><label className="label">Marca</label><input className="input" value={form.brand} onChange={e=>setForm(p=>({...p,brand:e.target.value}))}/></div>
            <div><label className="label">Unidade</label><input className="input" value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} placeholder="kg, g, L..."/></div>
            <div><label className="label">Qtd</label><input className="input" type="number" min="0" step="0.1" value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))}/></div>
            <div><label className="label">Frequência</label><select className="select" value={form.frequency} onChange={e=>setForm(p=>({...p,frequency:e.target.value}))}>{MKT_FREQ.map(f=><option key={f}>{f}</option>)}</select></div>
            <div><label className="label">Prioridade</label><select className="select" value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>{Object.keys(MARKET_PRIORITY).map(p=><option key={p}>{p}</option>)}</select></div>
            <div><label className="label">Responsável</label><select className="select" value={form.responsible} onChange={e=>setForm(p=>({...p,responsible:e.target.value}))}><option>Bruno</option><option>Vianka</option><option>Ambos</option></select></div>
            <div><label className="label">Status</label><select className="select" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>{Object.keys(MARKET_STATUS).map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div><label className="label">OBS</label><input className="input" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}/></div>
          <div className="flex gap-2 justify-end mt-3"><button type="button" className="btn-secondary" onClick={()=>setAdding(false)}>Cancelar</button><button type="submit" className="btn-primary">Salvar</button></div>
        </form>
      )}
      <div className="tbl-wrap"><div className="overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Cat.</th><th>Item</th><th>Marca</th><th>Un.</th><th>Qtd</th><th>Freq.</th><th>Prior.</th><th>Resp.</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.length===0?<tr><td colSpan={10} className="text-center py-8 text-stone-300">Nenhum item</td></tr>:
              filtered.map(i=>(
                <tr key={i.id}>
                  <td><span className="badge badge-stone text-xs">{i.category}</span></td>
                  <td className="font-medium">{i.item}</td>
                  <td className="text-stone-400">{i.brand||'—'}</td>
                  <td className="text-stone-400">{i.unit||'—'}</td>
                  <td className="text-stone-400">{i.quantity||'—'}</td>
                  <td className="text-stone-400">{i.frequency||'—'}</td>
                  <td><span className={`badge text-xs ${MARKET_PRIORITY[i.priority]||'badge-stone'}`}>{i.priority}</span></td>
                  <td className="text-stone-400">{i.responsible}</td>
                  <td><span className={`badge text-xs ${MARKET_STATUS[i.status]||'badge-stone'}`}>{i.status}</span></td>
                  <td className="flex gap-1"><button onClick={()=>setEditItem({...i,quantity:i.quantity??''})} className="btn-icon w-7 h-7"><Pencil className="w-3.5 h-3.5"/></button><button onClick={()=>remove(i.id)} className="btn-icon w-7 h-7"><Trash2 className="w-3.5 h-3.5"/></button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div></div>

      <Modal open={!!editItem} onClose={()=>setEditItem(null)} title="Editar item">
        {editItem&&<form onSubmit={handleEdit}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <div><label className="label">Categoria</label><select className="select" value={editItem.category} onChange={e=>setEditItem(p=>({...p,category:e.target.value}))}>{MKT_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="label">Item</label><input className="input" value={editItem.item} onChange={e=>setEditItem(p=>({...p,item:e.target.value}))} required/></div>
            <div><label className="label">Marca</label><input className="input" value={editItem.brand||''} onChange={e=>setEditItem(p=>({...p,brand:e.target.value}))}/></div>
            <div><label className="label">Unidade</label><input className="input" value={editItem.unit||''} onChange={e=>setEditItem(p=>({...p,unit:e.target.value}))}/></div>
            <div><label className="label">Qtd</label><input className="input" type="number" min="0" step="0.1" value={editItem.quantity||''} onChange={e=>setEditItem(p=>({...p,quantity:e.target.value}))}/></div>
            <div><label className="label">Frequência</label><select className="select" value={editItem.frequency||'Semanal'} onChange={e=>setEditItem(p=>({...p,frequency:e.target.value}))}>{MKT_FREQ.map(f=><option key={f}>{f}</option>)}</select></div>
            <div><label className="label">Prioridade</label><select className="select" value={editItem.priority||'Essencial'} onChange={e=>setEditItem(p=>({...p,priority:e.target.value}))}>{Object.keys(MARKET_PRIORITY).map(p=><option key={p}>{p}</option>)}</select></div>
            <div><label className="label">Responsável</label><select className="select" value={editItem.responsible||'Bruno'} onChange={e=>setEditItem(p=>({...p,responsible:e.target.value}))}><option>Bruno</option><option>Vianka</option><option>Ambos</option></select></div>
            <div><label className="label">Status</label><select className="select" value={editItem.status||'Comprar'} onChange={e=>setEditItem(p=>({...p,status:e.target.value}))}>{Object.keys(MARKET_STATUS).map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="mb-3"><label className="label">OBS</label><input className="input" value={editItem.notes||''} onChange={e=>setEditItem(p=>({...p,notes:e.target.value}))}/></div>
          <div className="flex gap-2 justify-end"><button type="button" className="btn-secondary" onClick={()=>setEditItem(null)}>Cancelar</button><button type="submit" className="btn-primary">Salvar</button></div>
        </form>}
      </Modal>

      <Modal open={stockModal} onClose={()=>setStockModal(false)} title="O que tem em casa">
        <div className="flex flex-col gap-2 mb-3 max-h-60 overflow-y-auto">
          {stock.length===0?<p className="text-sm text-stone-300">Nenhum item.</p>:
            stock.map(s=>(
              <div key={s.id} className="flex items-center justify-between py-1.5 px-3 bg-stone-50 rounded-lg">
                <span className="text-sm">{s.name}</span>
                <button onClick={()=>removeStock(s.id)} className="text-stone-300 hover:text-blush-500 text-xs">✕</button>
              </div>
            ))}
        </div>
        <div className="flex gap-2">
          <input className="input flex-1" value={newStock} onChange={e=>setNewStock(e.target.value)} placeholder="Ex: Arroz, macarrão..."/>
          <button className="btn-primary text-sm" onClick={async()=>{if(!newStock.trim())return;await insertStock({name:newStock.trim()});setNewStock('')}}>+</button>
        </div>
      </Modal>
    </div>
  )
}

// ─── Apartment Page ───────────────────────────────────────────────
import { APT_STATUS } from '../lib/utils'
const APT_ROOMS=['Sala','Quarto','Cozinha','Banheiro','Área de serviço','Varanda','Escritório','Hall']

export function ApartmentPage() {
  const { data: items, insert, remove } = useDB('apartment_items')
  const { addLog } = useLogs()
  const [adding, setAdding] = useState(false)
  const [sort, setSort] = useState('desc')
  const [form, setForm] = useState({room:'Sala',item:'',size:'',value:'',brand:'',model:'',link:'',status:'Desejado'})
  const sorted=[...items].sort((a,b)=>sort==='desc'?(+b.value||0)-(+a.value||0):(+a.value||0)-(+b.value||0))
  const handleAdd=async(e)=>{e.preventDefault();await insert({...form,value:parseFloat(form.value)||0});setAdding(false);setForm({room:'Sala',item:'',size:'',value:'',brand:'',model:'',link:'',status:'Desejado'})}
  return(
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <PageHeader title="Apartamento"
        action={<div className="flex gap-2">
          <select className="select w-auto text-sm py-2" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="desc">Maior valor</option><option value="asc">Menor valor</option>
          </select>
          <button className="btn-primary flex items-center gap-1.5" onClick={()=>setAdding(!adding)}><Plus className="w-4 h-4"/>Item</button>
        </div>}/>
      {adding&&(
        <form onSubmit={handleAdd} className="card mb-4">
          <p className="form-section-title">Novo item</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <div><label className="label">Cômodo</label><select className="select" value={form.room} onChange={e=>setForm(p=>({...p,room:e.target.value}))}>{APT_ROOMS.map(r=><option key={r}>{r}</option>)}</select></div>
            <div><label className="label">Item</label><input className="input" value={form.item} onChange={e=>setForm(p=>({...p,item:e.target.value}))} required/></div>
            <div><label className="label">Tamanho</label><input className="input" value={form.size} onChange={e=>setForm(p=>({...p,size:e.target.value}))} placeholder="Ex: 2.10m"/></div>
            <div><label className="label">Valor (R$)</label><input className="input" type="number" step="0.01" min="0" value={form.value} onChange={e=>setForm(p=>({...p,value:e.target.value}))}/></div>
            <div><label className="label">Marca</label><input className="input" value={form.brand} onChange={e=>setForm(p=>({...p,brand:e.target.value}))}/></div>
            <div><label className="label">Modelo</label><input className="input" value={form.model} onChange={e=>setForm(p=>({...p,model:e.target.value}))}/></div>
            <div className="col-span-2"><label className="label">Link</label><input className="input" type="url" value={form.link} onChange={e=>setForm(p=>({...p,link:e.target.value}))} placeholder="https://..."/></div>
            <div><label className="label">Status</label><select className="select" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>{Object.keys(APT_STATUS).map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="flex gap-2 justify-end"><button type="button" className="btn-secondary" onClick={()=>setAdding(false)}>Cancelar</button><button type="submit" className="btn-primary">Salvar</button></div>
        </form>
      )}
      <div className="tbl-wrap"><div className="overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Cômodo</th><th>Item</th><th>Tamanho</th><th>Valor</th><th>Marca</th><th>Modelo</th><th>Link</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {sorted.length===0?<tr><td colSpan={9} className="text-center py-8 text-stone-300">Nenhum item</td></tr>:
              sorted.map(i=>(
                <tr key={i.id}>
                  <td><span className="badge badge-stone">{i.room}</span></td>
                  <td className="font-medium">{i.item}</td>
                  <td className="text-stone-400">{i.size||'—'}</td>
                  <td className="font-medium text-sage-600">{+i.value>0?fmt(i.value):'—'}</td>
                  <td className="text-stone-400">{i.brand||'—'}</td>
                  <td className="text-stone-400">{i.model||'—'}</td>
                  <td>{i.link?<a href={i.link} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline text-xs">Ver link</a>:'—'}</td>
                  <td><span className={`badge text-xs ${APT_STATUS[i.status]||'badge-stone'}`}>{i.status}</span></td>
                  <td><button onClick={()=>remove(i.id)} className="btn-icon w-7 h-7"><Trash2 className="w-3.5 h-3.5"/></button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div></div>
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

// ─── Commitments (Calendar) Page ─────────────────────────────────────
import { DAYS_OF_WEEK, DAYS_SHORT, genTimeSlots } from '../lib/utils'
const TIME_SLOTS = genTimeSlots()

export function CommitmentsPage() {
  const { data: events, insert, remove, update } = useDB('commitments')
  const [modal, setModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [copyModal, setCopyModal] = useState(false)
  const [copyItem, setCopyItem] = useState(null)
  const [copyDays, setCopyDays] = useState([])
  const [form, setForm] = useState({day_of_week:'Segunda',time_slot:'07:00',title:'',responsible:'Bruno',recurrence:[]})
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [selecting, setSelecting] = useState(false)
  const [selCells, setSelCells] = useState([])

  const openEdit=(ev,e)=>{e.stopPropagation();setEditItem({...ev});setEditModal(true)}
  const openCopy=(ev,e)=>{e.stopPropagation();setCopyItem(ev);setCopyDays([ev.day_of_week]);setCopyModal(true)}
  const handleAdd=async()=>{if(!form.title.trim())return;const days=(form.recurrence&&form.recurrence.length>0)?form.recurrence:[form.day_of_week];for(const d of days){await insert({day_of_week:d,time_slot:form.time_slot,title:form.title,responsible:form.responsible})};setModal(false)}
  const handleEdit=async()=>{if(!editItem?.title?.trim())return;await update(editItem.id,{day_of_week:editItem.day_of_week,time_slot:editItem.time_slot,title:editItem.title,responsible:editItem.responsible});setEditModal(false)}
  const handleCopy=async()=>{if(!copyItem||copyDays.length===0)return;for(const d of copyDays){await insert({day_of_week:d,time_slot:copyItem.time_slot,title:copyItem.title,responsible:copyItem.responsible})};setCopyModal(false)}
  const handleMultiCreate=async()=>{if(!form.title.trim()||selCells.length===0)return;for(const c of selCells){await insert({day_of_week:c.day,time_slot:c.time,title:form.title,responsible:form.responsible})};setModal(false);setSelCells([])}
  const toggleRec=(day)=>setForm(p=>({...p,recurrence:(p.recurrence||[]).includes(day)?(p.recurrence||[]).filter(d=>d!==day):[...(p.recurrence||[]),day]}))
  const onDragStart=(ev,e)=>{e.dataTransfer.effectAllowed='move';setDragging({ev})}
  const onDrop=async(day,time,e)=>{e.preventDefault();if(!dragging)return;if(day!==dragging.ev.day_of_week||time!==dragging.ev.time_slot){await update(dragging.ev.id,{day_of_week:day,time_slot:time,title:dragging.ev.title,responsible:dragging.ev.responsible})};setDragging(null);setDragOver(null)}
  const onCellMouseDown=(day,time,e)=>{e.preventDefault();setSelecting(true);setSelCells([{day,time}])}
  const onCellMouseEnter=(day,time)=>{if(!selecting)return;setSelCells(prev=>{const exists=prev.some(c=>c.day===day&&c.time===time);if(exists)return prev;return [...prev,{day,time}]})}
  const finishSelect=()=>{if(!selecting)return;setSelecting(false);if(selCells.length>0){setForm(p=>({...p,recurrence:[]}));setModal(true)}}
  const isSelected=(day,time)=>selCells.some(c=>c.day===day&&c.time===time)

  return(
    <div className="p-4 md:p-6" onMouseUp={finishSelect} onDragOver={e=>e.preventDefault()}>
      <PageHeader title="Compromissos" subtitle="Calendário semanal"
        action={<button className="btn-primary flex items-center gap-1.5" onClick={()=>{setSelCells([]);setForm({day_of_week:'Segunda',time_slot:'07:00',title:'',responsible:'Bruno',recurrence:[]});setModal(true)}}><Plus className="w-4 h-4"/> Compromisso</button>} />
      <div className="overflow-x-auto rounded-2xl border border-stone-100 shadow-warm bg-white" style={{userSelect:'none'}}>
        <table style={{minWidth:640,width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>
            <th style={{width:60,background:'#F9F7F4',padding:'8px 10px',fontSize:11,color:'#9A8A78',borderBottom:'1px solid #F0ECE6',textAlign:'center'}}>Hora</th>
            {DAYS_SHORT.map(d=><th key={d} style={{background:'#F9F7F4',padding:'8px 10px',fontSize:12,fontWeight:500,color:'#3E3530',borderBottom:'1px solid #F0ECE6',borderLeft:'1px solid #F0ECE6',textAlign:'center'}}>{d}</th>)}
          </tr></thead>
          <tbody>
            {TIME_SLOTS.map(t=>(
              <tr key={t}>
                <td style={{background:'#F9F7F4',padding:'3px 8px',fontSize:11,color:'#B5A796',textAlign:'right',borderBottom:'1px solid #F9F7F4',whiteSpace:'nowrap'}}>{t}</td>
                {DAYS_OF_WEEK.map(d=>{
                  const cellEvents=events.filter(ev=>ev.day_of_week===d&&ev.time_slot===t)
                  const sel=isSelected(d,t)
                  const over=dragOver&&dragOver.day===d&&dragOver.time===t
                  return(
                    <td key={d}
                      onMouseDown={(e)=>{if(cellEvents.length===0&&!dragging){onCellMouseDown(d,t,e)}}}
                      onMouseEnter={()=>{onCellMouseEnter(d,t);if(dragging)setDragOver({day:d,time:t})}}
                      onMouseUp={()=>{if(dragging)onDrop(d,t,{preventDefault:()=>{}})}}
                      onDragOver={(e)=>{e.preventDefault();if(dragging)setDragOver({day:d,time:t})}}
                      onDrop={(e)=>onDrop(d,t,e)}
                      onClick={()=>{if(cellEvents.length===0&&!dragging&&selCells.length===0){setSelCells([]);setForm({day_of_week:d,time_slot:t,title:'',responsible:'Bruno',recurrence:[]});setModal(true)}}}
                      style={{
                        borderLeft:'1px solid #F0ECE6',borderBottom:'1px solid #F0ECE6',
                        padding:'2px 3px',minHeight:28,verticalAlign:'top',
                        cursor:dragging?'copy':'pointer',
                        background:over?'#FFF3CD':sel?'#E8F5E9':'',
                        transition:'background 0.1s'
                      }}>
                      {cellEvents.map(ev=>(
                        <div key={ev.id}
                          draggable
                          onDragStart={(e)=>onDragStart(ev,e)}
                          onDragEnd={()=>{setDragging(null);setDragOver(null)}}
                          style={{
                            background:dragging?.ev?.id===ev.id?'#FEF3C7':'#FFFBF0',
                            borderLeft:`2px solid ${dragging?.ev?.id===ev.id?'#F59E0B':'#F5A800'}`,
                            borderRadius:4,padding:'2px 5px 2px 4px',fontSize:11,lineHeight:1.3,
                            marginBottom:2,cursor:'grab',color:'#6D4800',
                            display:'flex',alignItems:'center',gap:2,
                            opacity:dragging?.ev?.id===ev.id?0.5:1,
                          }}
                          onClick={e=>{e.stopPropagation();openEdit(ev,e)}}>
                          <span style={{flex:1}}>{ev.title}</span>
                          <button onClick={e=>{e.stopPropagation();openCopy(ev,e)}} style={{background:'none',border:'none',cursor:'pointer',padding:'1px',color:'#B5A796',lineHeight:1}}><Copy style={{width:10,height:10}}/></button>
                          <button onClick={e=>{e.stopPropagation();remove(ev.id)}} style={{background:'none',border:'none',cursor:'pointer',padding:'1px',color:'#B5A796',lineHeight:1}}><Trash2 style={{width:10,height:10}}/></button>
                        </div>
                      ))}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-stone-300 mt-2 text-center">Clique para adicionar · Arraste um evento para mover · Clique e arraste em células vazias para criar em lote</p>

      <Modal open={modal} onClose={()=>{setModal(false);setSelCells([])}} title={selCells.length>1?"Novo compromisso em "+selCells.length+" horários":"Novo compromisso"}>
        <div className="grid gap-3">
          {selCells.length===0&&<>
            <div><label className="label">Dia</label><select className="select" value={form.day_of_week} onChange={e=>setForm(p=>({...p,day_of_week:e.target.value}))}>{DAYS_OF_WEEK.map(d=><option key={d}>{d}</option>)}</select></div>
            <div><label className="label">Horário</label><select className="select" value={form.time_slot} onChange={e=>setForm(p=>({...p,time_slot:e.target.value}))}>{TIME_SLOTS.map(t=><option key={t}>{t}</option>)}</select></div>
          </>}
          {selCells.length>0&&(
            <div className="bg-sage-50 rounded-lg p-3 text-sm text-stone-600">
              <p className="font-medium mb-1">Horários selecionados ({selCells.length}):</p>
              <div className="flex flex-wrap gap-1">{selCells.map((c,i)=><span key={i} className="badge badge-sage text-xs">{c.day} {c.time}</span>)}</div>
            </div>
          )}
          <div><label className="label">Compromisso</label><input className="input" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Ex: Academia, Reunião..." autoFocus/></div>
          <div><label className="label">Responsável</label><select className="select" value={form.responsible} onChange={e=>setForm(p=>({...p,responsible:e.target.value}))}><option>Bruno</option><option>Vianka</option><option>Ambos</option></select></div>
          {selCells.length===0&&<div><label className="label mb-1">Repetir também em</label><div className="flex flex-wrap gap-1 mt-1">{DAYS_OF_WEEK.filter(d=>d!==form.day_of_week).map(d=>(<button key={d} type="button" className={`badge cursor-pointer ${(form.recurrence||[]).includes(d)?'badge-sage':'badge-stone'}`} onClick={()=>toggleRec(d)}>{d}</button>))}</div></div>}
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <button className="btn-secondary" onClick={()=>{setModal(false);setSelCells([])}}>Cancelar</button>
          <button className="btn-primary" onClick={selCells.length>1?handleMultiCreate:handleAdd}>Salvar</button>
        </div>
      </Modal>

      <Modal open={editModal} onClose={()=>setEditModal(false)} title="Editar compromisso">
        {editItem&&<div className="grid gap-3">
          <div><label className="label">Dia</label><select className="select" value={editItem.day_of_week} onChange={e=>setEditItem(p=>({...p,day_of_week:e.target.value}))}>{DAYS_OF_WEEK.map(d=><option key={d}>{d}</option>)}</select></div>
          <div><label className="label">Horário</label><select className="select" value={editItem.time_slot} onChange={e=>setEditItem(p=>({...p,time_slot:e.target.value}))}>{TIME_SLOTS.map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label className="label">Compromisso</label><input className="input" value={editItem.title||''} onChange={e=>setEditItem(p=>({...p,title:e.target.value}))}/></div>
          <div><label className="label">Responsável</label><select className="select" value={editItem.responsible||'Bruno'} onChange={e=>setEditItem(p=>({...p,responsible:e.target.value}))}><option>Bruno</option><option>Vianka</option><option>Ambos</option></select></div>
        </div>}
        <div className="flex gap-2 justify-end mt-4"><button className="btn-secondary" onClick={()=>setEditModal(false)}>Cancelar</button><button className="btn-primary" onClick={handleEdit}>Salvar</button></div>
      </Modal>

      <Modal open={copyModal} onClose={()=>setCopyModal(false)} title="Copiar para outros dias">
        <p className="text-sm text-stone-500 mb-3">Selecione os dias para copiar "{copyItem?.title}":</p>
        <div className="flex flex-wrap gap-2">{DAYS_OF_WEEK.map(d=>(<button key={d} type="button" className={`badge cursor-pointer ${copyDays.includes(d)?'badge-sage':'badge-stone'}`} onClick={()=>setCopyDays(p=>p.includes(d)?p.filter(x=>x!==d):[...p,d])}>{d}</button>))}</div>
        <div className="flex gap-2 justify-end mt-4"><button className="btn-secondary" onClick={()=>setCopyModal(false)}>Cancelar</button><button className="btn-primary" onClick={handleCopy} disabled={copyDays.length===0}>Copiar</button></div>
      </Modal>
    </div>
  )
}
export function PendingPage() {
  const { data: orders, insert, remove, update } = useDB('client_orders')
  const { addLog } = useLogs()
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [form, setForm] = useState({
    client_name: '',
    order_date: format(new Date(), 'yyyy-MM-dd'),
    delivery_date: '',
    amount_paid: '',
    material_provided: '',
    description: '',
    status: 'pendente',
    notes: '',
  })

  const STATUS_OPTIONS = [
    { value: 'pendente',     label: 'Pendente',     color: 'bg-amber-100 text-amber-700' },
    { value: 'em_andamento', label: 'Em andamento', color: 'bg-blue-100 text-blue-700' },
    { value: 'concluido',    label: 'Concluído',    color: 'bg-green-100 text-green-700' },
    { value: 'cancelado',    label: 'Cancelado',    color: 'bg-red-100 text-red-700' },
  ]

  const statusBadge = (val) => {
    const opt = STATUS_OPTIONS.find(s => s.value === val) || STATUS_OPTIONS[0]
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${opt.color}`}>{opt.label}</span>
  }

  const handleAdd = async () => {
    if (!form.client_name.trim()) return
    await insert({ ...form, amount_paid: parseFloat(form.amount_paid) || 0, order_date: form.order_date || null, delivery_date: form.delivery_date || null })
    await addLog('pedido_adicionado', 'Pedidos', '/pendencias', `Pedido de ${form.client_name} adicionado`)
    setForm({ client_name: '', order_date: format(new Date(), 'yyyy-MM-dd'), delivery_date: '', amount_paid: '', material_provided: '', description: '', status: 'pendente', notes: '' })
    setAdding(false)
  }

  const handleEdit = (order) => {
    setEditId(order.id)
    setEditForm({ ...order })
  }

  const handleSave = async () => {
    await update(editId, { ...editForm, amount_paid: parseFloat(editForm.amount_paid) || 0, order_date: editForm.order_date || null, delivery_date: editForm.delivery_date || null })
    setEditId(null)
  }

  const handleRemove = async (id, name) => {
    await remove(id)
    await addLog('pedido_removido', 'Pedidos', '/pendencias', `Pedido de ${name} removido`)
  }

  const sortedOrders = [...(orders || [])].sort((a, b) => new Date(a.delivery_date || '9999') - new Date(b.delivery_date || '9999'))

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader title="Pedidos de Clientes" subtitle={`${(orders||[]).length} pedido(s) registrado(s)`} />
        <button onClick={() => setAdding(!adding)} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={15} /> Novo Pedido
        </button>
      </div>

      {adding && (
        <div className="card space-y-3">
          <p className="text-sm font-semibold text-stone-700">Novo Pedido</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Cliente *</label>
              <input className="input w-full" placeholder="Nome do cliente" value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Valor Pago (R$)</label>
              <input className="input w-full" type="number" placeholder="0,00" value={form.amount_paid} onChange={e => setForm({...form, amount_paid: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Data do Pedido</label>
              <input className="input w-full" type="date" value={form.order_date} onChange={e => setForm({...form, order_date: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Data de Entrega</label>
              <input className="input w-full" type="date" value={form.delivery_date} onChange={e => setForm({...form, delivery_date: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Material Fornecido</label>
              <input className="input w-full" placeholder="Ex: Tecido, linha..." value={form.material_provided} onChange={e => setForm({...form, material_provided: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Status</label>
              <select className="input w-full" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-stone-500 mb-1 block">Descrição do Pedido</label>
              <input className="input w-full" placeholder="O que foi pedido..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-stone-500 mb-1 block">Observações</label>
              <input className="input w-full" placeholder="Notas adicionais..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleAdd} className="btn-primary text-sm">Salvar</button>
            <button onClick={() => setAdding(false)} className="btn-secondary text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {sortedOrders.length === 0 && !adding && (
        <div className="card text-center py-12">
          <ClipboardList size={32} className="mx-auto text-stone-300 mb-2" />
          <p className="text-stone-400 text-sm">Nenhum pedido registrado.</p>
        </div>
      )}

      <div className="space-y-3">
        {sortedOrders.map(order => (
          <div key={order.id} className="card space-y-2">
            {editId === order.id ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-stone-700">Editando Pedido</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-stone-500 mb-1 block">Cliente</label>
                    <input className="input w-full" value={editForm.client_name||''} onChange={e => setEditForm({...editForm, client_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 mb-1 block">Valor Pago (R$)</label>
                    <input className="input w-full" type="number" value={editForm.amount_paid||''} onChange={e => setEditForm({...editForm, amount_paid: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 mb-1 block">Data do Pedido</label>
                    <input className="input w-full" type="date" value={editForm.order_date||''} onChange={e => setEditForm({...editForm, order_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 mb-1 block">Data de Entrega</label>
                    <input className="input w-full" type="date" value={editForm.delivery_date||''} onChange={e => setEditForm({...editForm, delivery_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 mb-1 block">Material Fornecido</label>
                    <input className="input w-full" value={editForm.material_provided||''} onChange={e => setEditForm({...editForm, material_provided: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 mb-1 block">Status</label>
                    <select className="input w-full" value={editForm.status||'pendente'} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-stone-500 mb-1 block">Descrição</label>
                    <input className="input w-full" value={editForm.description||''} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-stone-500 mb-1 block">Observações</label>
                    <input className="input w-full" value={editForm.notes||''} onChange={e => setEditForm({...editForm, notes: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="btn-primary text-sm">Salvar</button>
                  <button onClick={() => setEditId(null)} className="btn-secondary text-sm">Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-stone-800 text-sm">{order.client_name}</span>
                      {statusBadge(order.status)}
                    </div>
                    {order.description && <p className="text-xs text-stone-500 mt-0.5 truncate">{order.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleEdit(order)} className="p-1.5 text-stone-400 hover:text-amber-500 rounded transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleRemove(order.id, order.client_name)} className="p-1.5 text-stone-400 hover:text-red-400 rounded transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-stone-500">
                  <div>
                    <span className="block text-stone-400">Pedido em</span>
                    <span className="font-medium text-stone-600">{order.order_date ? format(new Date(order.order_date + 'T12:00:00'), 'dd/MM/yyyy') : '—'}</span>
                  </div>
                  <div>
                    <span className="block text-stone-400">Entrega</span>
                    <span className="font-medium text-stone-600">{order.delivery_date ? format(new Date(order.delivery_date + 'T12:00:00'), 'dd/MM/yyyy') : '—'}</span>
                  </div>
                  <div>
                    <span className="block text-stone-400">Valor Pago</span>
                    <span className="font-medium text-green-600">{order.amount_paid ? `R$ ${Number(order.amount_paid).toFixed(2).replace('.',',')}` : '—'}</span>
                  </div>
                  <div>
                    <span className="block text-stone-400">Material</span>
                    <span className="font-medium text-stone-600 truncate block">{order.material_provided || '—'}</span>
                  </div>
                </div>
                {order.notes && (
                  <p className="text-xs text-stone-400 border-t border-stone-100 pt-2 mt-1">📝 {order.notes}</p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
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
