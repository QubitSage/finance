// ─── Finance Page (Unified: Entradas & Saídas + Mimos da Esposa + Poupança) ──
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDB } from '../hooks/useDB'
import { useSettings, useLogs } from '../hooks/useSettings'
import { fmt, monthLabel, monthKey } from '../lib/utils'
import { subMonths, addMonths, format } from 'date-fns'
import {
  ChevronLeft, ChevronRight, Plus, Trash2, Heart, Sparkles,
  PiggyBank, ArrowLeftRight, Check, X, ThumbsUp, ThumbsDown,
  TrendingUp, TrendingDown, DollarSign, Wallet, Target, Star,
  Copy, Settings, Pencil, ExternalLink
} from 'lucide-react'
import PageHeader from '../components/PageHeader'

const TABS = ['Entradas & Saídas', 'Mimos da Esposa', 'Poupança']

// ─── Tab: Entradas & Saídas ───────────────────────────────────────────────────
function TabTransactions({ month, setMonth }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ description: '', type: 'expense', amount: '', date: format(new Date(), 'yyyy-MM-dd'), category: 'pessoal' })
  const { data: txs, insert, remove } = useDB('transactions', { filter: { month } })
  const { addLog } = useLogs()

  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0)
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0)
  const balance = income - expense

  const prev = () => setMonth(monthKey(subMonths(new Date(month + '-01'), 1)))
  const next = () => setMonth(monthKey(addMonths(new Date(month + '-01'), 1)))

  const handleAdd = async (e) => {
    e.preventDefault()
    const d = await insert({ ...form, amount: parseFloat(form.amount), month })
    if (d) addLog(form.type === 'income' ? 'Entrada adicionada: ' + form.description : 'Saída adicionada: ' + form.description, 'Finanças', '/financas', form.description)
    setForm({ description: '', type: 'expense', amount: '', date: format(new Date(), 'yyyy-MM-dd'), category: 'pessoal' })
    setAdding(false)
  }

  const categories = ['pessoal', 'casa', 'alimentação', 'transporte', 'lazer', 'saúde', 'viagem', 'outros']

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={prev} className="btn-icon"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-medium text-stone-600 min-w-[140px] text-center">{monthLabel(month)}</span>
        <button onClick={next} className="btn-icon"><ChevronRight className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card text-center">
          <p className="stat-label flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3 text-teal-500" /> Entradas</p>
          <p className="text-xl font-display font-semibold text-teal-600">{fmt(income)}</p>
        </div>
        <div className="card text-center">
          <p className="stat-label flex items-center justify-center gap-1"><TrendingDown className="w-3 h-3 text-rose-500" /> Saídas</p>
          <p className="text-xl font-display font-semibold text-rose-600">{fmt(expense)}</p>
        </div>
        <div className="card text-center">
          <p className="stat-label flex items-center justify-center gap-1"><Wallet className="w-3 h-3" /> Saldo</p>
          <p className={'text-xl font-display font-semibold ' + (balance >= 0 ? 'text-teal-600' : 'text-rose-600')}>{fmt(balance)}</p>
        </div>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="card mb-4 space-y-3">
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm(f => ({ ...f, type: 'income' }))}
              className={'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ' + (form.type === 'income' ? 'bg-teal-500 text-white border-teal-500' : 'border-stone-200 text-stone-500')}>
              <TrendingUp className="w-4 h-4 inline mr-1" /> Entrada
            </button>
            <button type="button" onClick={() => setForm(f => ({ ...f, type: 'expense' }))}
              className={'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ' + (form.type === 'expense' ? 'bg-rose-500 text-white border-rose-500' : 'border-stone-200 text-stone-500')}>
              <TrendingDown className="w-4 h-4 inline mr-1" /> Saída
            </button>
          </div>
          <input className="input" placeholder="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" type="number" step="0.01" placeholder="Valor" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
          <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Salvar</button>
            <button type="button" onClick={() => setAdding(false)} className="btn-icon"><X className="w-4 h-4" /></button>
          </div>
        </form>
      )}

      {!adding && (
        <button onClick={() => setAdding(true)} className="btn-primary w-full mb-4 flex items-center justify-center gap-1.5">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      )}

      <div className="space-y-2">
        {txs.length === 0 && <p className="text-center text-stone-400 text-sm py-8">Nenhum lançamento neste mês</p>}
        {txs.map(t => (
          <div key={t.id} className="card flex items-center gap-3">
            <div className={'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' + (t.type === 'income' ? 'bg-teal-100' : 'bg-rose-100')}>
              {t.type === 'income' ? <TrendingUp className="w-4 h-4 text-teal-600" /> : <TrendingDown className="w-4 h-4 text-rose-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-700 truncate">{t.description}</p>
              <p className="text-xs text-stone-400">{t.date} · {t.category}</p>
            </div>
            <span className={'text-sm font-semibold ' + (t.type === 'income' ? 'text-teal-600' : 'text-rose-600')}>
              {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
            </span>
            <button onClick={() => remove(t.id)} className="text-stone-300 hover:text-rose-400 transition-colors ml-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Mimos da Esposa ─────────────────────────────────────────────────────
function TabMimos() {
  const [adding, setAdding] = useState(false)
  const [month, setMonth] = useState(monthKey())
  const [form, setForm] = useState({ description: '', category: 'wife', amount: '', date: format(new Date(), 'yyyy-MM-dd') })
  const { settings } = useSettings()
  const { addLog } = useLogs()
  const { data: txs, insert, remove } = useDB('transactions', { filter: { month } })

  const { data: wishes } = useDB('wishes')

  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0)
  const share = income * ((settings?.wife_percentage || 30) / 100)
  const spent = txs.filter(t => t.type === 'expense' && ['wife', 'personal', 'savings'].includes(t.category)).reduce((s, t) => s + +t.amount, 0)
  const rem = share - spent
  const pct = share > 0 ? Math.min((spent / share) * 100, 100) : 0

  const prev = () => setMonth(m => monthKey(subMonths(new Date(m + '-01'), 1)))
  const next = () => setMonth(m => monthKey(addMonths(new Date(m + '-01'), 1)))

  const list = txs.filter(t => t.type === 'expense' && ['wife', 'personal', 'savings'].includes(t.category))

  const pending = wishes ? wishes.filter(w => w.status === 'pendente') : []
  const approved = wishes ? wishes.filter(w => w.status === 'aprovado') : []

  const handleAdd = async (e) => {
    e.preventDefault()
    const d = await insert({ ...form, amount: parseFloat(form.amount), type: 'expense', month })
    if (d) addLog('Mimo adicionado: ' + form.description, 'Mimos da Esposa', '/financas', form.description)
    setForm({ description: '', category: 'wife', amount: '', date: format(new Date(), 'yyyy-MM-dd') })
    setAdding(false)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={prev} className="btn-icon"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-medium text-stone-600 min-w-[140px] text-center">{monthLabel(month)}</span>
        <button onClick={next} className="btn-icon"><ChevronRight className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card text-center">
          <p className="stat-label">Direito ({settings?.wife_percentage || 30}%)</p>
          <p className="text-xl font-display font-semibold text-pink-500">{fmt(share)}</p>
        </div>
        <div className="card text-center">
          <p className="stat-label">Gasto</p>
          <p className="text-xl font-display font-semibold text-stone-700">{fmt(spent)}</p>
        </div>
        <div className="card text-center">
          <p className="stat-label">Saldo</p>
          <p className={'text-xl font-display font-semibold ' + (rem >= 0 ? 'text-teal-600' : 'text-rose-600')}>{fmt(rem)}</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex justify-between text-xs text-stone-500 mb-1">
          <span>Progresso do mês</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2">
          <div className="h-2 rounded-full transition-all" style={{ width: pct + '%', backgroundColor: pct > 90 ? '#f43f5e' : pct > 70 ? '#f59e0b' : '#ec4899' }} />
        </div>
      </div>

      {pending.length > 0 && (
        <div className="card mb-4 border-l-4 border-pink-400">
          <p className="text-xs font-semibold text-pink-500 mb-2 flex items-center gap-1"><Heart className="w-3 h-3" /> Pedidos pendentes</p>
          {pending.slice(0, 3).map(w => (
            <div key={w.id} className="flex items-center gap-2 py-1">
              <span className="text-xs text-stone-600 flex-1">{w.title}</span>
              <span className="text-xs text-stone-400">{w.estimated_cost ? fmt(w.estimated_cost) : '—'}</span>
            </div>
          ))}
          {pending.length > 3 && <p className="text-xs text-stone-400 mt-1">+{pending.length - 3} mais</p>}
        </div>
      )}

      {adding && (
        <form onSubmit={handleAdd} className="card mb-4 space-y-3">
          <input className="input" placeholder="Descrição do mimo" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" type="number" step="0.01" placeholder="Valor" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
          <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option value="wife">Mimo pessoal</option>
            <option value="personal">Pessoal</option>
            <option value="savings">Poupança pessoal</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Salvar</button>
            <button type="button" onClick={() => setAdding(false)} className="btn-icon"><X className="w-4 h-4" /></button>
          </div>
        </form>
      )}

      {!adding && (
        <button onClick={() => setAdding(true)} className="btn-primary w-full mb-4 flex items-center justify-center gap-1.5">
          <Plus className="w-4 h-4" /> Registrar Mimo
        </button>
      )}

      <div className="space-y-2">
        {list.length === 0 && <p className="text-center text-stone-400 text-sm py-6">Nenhum mimo registrado neste mês 💝</p>}
        {list.map(t => (
          <div key={t.id} className="card flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-pink-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-700 truncate">{t.description}</p>
              <p className="text-xs text-stone-400">{t.date}</p>
            </div>
            <span className="text-sm font-semibold text-stone-700">{fmt(t.amount)}</span>
            <button onClick={() => remove(t.id)} className="text-stone-300 hover:text-rose-400 transition-colors ml-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Poupança ────────────────────────────────────────────────────────────
function TabPoupanca() {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ description: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'deposit' })
  const { data: savings, insert, remove } = useDB('savings')
  const { addLog } = useLogs()

  const deposits = savings.filter(s => s.type === 'deposit').reduce((a, s) => a + +s.amount, 0)
  const withdrawals = savings.filter(s => s.type === 'withdrawal').reduce((a, s) => a + +s.amount, 0)
  const total = deposits - withdrawals

  const handleAdd = async (e) => {
    e.preventDefault()
    const d = await insert({ ...form, amount: parseFloat(form.amount) })
    if (d) addLog(form.type === 'deposit' ? 'Depósito: ' + form.description : 'Retirada: ' + form.description, 'Poupança', '/financas', form.description)
    setForm({ description: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'deposit' })
    setAdding(false)
  }

  const handleDeposit = async (e) => {
    e.preventDefault()
    const d = await insert({ ...form, amount: parseFloat(form.amount), type: 'deposit' })
    if (d) addLog('Depósito na poupança: ' + form.description, 'Poupança', '/financas', form.description)
    setForm({ description: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'deposit' })
    setAdding(false)
  }

  return (
    <div>
      <div className="card mb-4 text-center bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200">
        <PiggyBank className="w-10 h-10 text-teal-500 mx-auto mb-2" />
        <p className="text-3xl font-display font-bold text-teal-700">{fmt(total)}</p>
        <p className="text-sm text-teal-500 mt-1">Total poupado</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card text-center">
          <p className="stat-label flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3 text-teal-500" /> Depósitos</p>
          <p className="text-lg font-semibold text-teal-600">{fmt(deposits)}</p>
        </div>
        <div className="card text-center">
          <p className="stat-label flex items-center justify-center gap-1"><TrendingDown className="w-3 h-3 text-rose-500" /> Retiradas</p>
          <p className="text-lg font-semibold text-rose-600">{fmt(withdrawals)}</p>
        </div>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="card mb-4 space-y-3">
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm(f => ({ ...f, type: 'deposit' }))}
              className={'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ' + (form.type === 'deposit' ? 'bg-teal-500 text-white border-teal-500' : 'border-stone-200 text-stone-500')}>
              Depositar
            </button>
            <button type="button" onClick={() => setForm(f => ({ ...f, type: 'withdrawal' }))}
              className={'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ' + (form.type === 'withdrawal' ? 'bg-rose-500 text-white border-rose-500' : 'border-stone-200 text-stone-500')}>
              Retirar
            </button>
          </div>
          <input className="input" placeholder="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" type="number" step="0.01" placeholder="Valor" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Salvar</button>
            <button type="button" onClick={() => setAdding(false)} className="btn-icon"><X className="w-4 h-4" /></button>
          </div>
        </form>
      )}

      {!adding && (
        <button onClick={() => setAdding(true)} className="btn-primary w-full mb-4 flex items-center justify-center gap-1.5">
          <Plus className="w-4 h-4" /> Novo Lançamento
        </button>
      )}

      <div className="space-y-2">
        {savings.length === 0 && <p className="text-center text-stone-400 text-sm py-8">Nenhum lançamento na poupança ainda 🐷</p>}
        {savings.map(s => (
          <div key={s.id} className="card flex items-center gap-3">
            <div className={'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' + (s.type === 'deposit' ? 'bg-teal-100' : 'bg-rose-100')}>
              {s.type === 'deposit' ? <TrendingUp className="w-4 h-4 text-teal-600" /> : <TrendingDown className="w-4 h-4 text-rose-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-700 truncate">{s.description}</p>
              <p className="text-xs text-stone-400">{s.date}</p>
            </div>
            <span className={'text-sm font-semibold ' + (s.type === 'deposit' ? 'text-teal-600' : 'text-rose-600')}>
              {s.type === 'deposit' ? '+' : '-'}{fmt(s.amount)}
            </span>
            <button onClick={() => remove(s.id)} className="text-stone-300 hover:text-rose-400 transition-colors ml-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main FinancePage ─────────────────────────────────────────────────────────
export function FinancePage() {
  const [tab, setTab] = useState(0)
  const [month, setMonth] = useState(monthKey())

  const TAB_ICONS = [ArrowLeftRight, Heart, PiggyBank]
  const TAB_COLORS = ['text-stone-600', 'text-pink-500', 'text-teal-600']

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <PageHeader title="Finanças" subtitle="Entradas, mimos e poupança" />

      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-6">
        {TABS.map((t, i) => {
          const Icon = TAB_ICONS[i]
          return (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={'flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-0.5 ' + (tab === i ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400 hover:text-stone-600')}
            >
              <Icon className={'w-4 h-4 ' + (tab === i ? TAB_COLORS[i] : '')} />
              <span className="hidden sm:inline">{t}</span>
            </button>
          )
        })}
      </div>

      {tab === 0 && <TabTransactions month={month} setMonth={setMonth} />}
      {tab === 1 && <TabMimos />}
      {tab === 2 && <TabPoupanca />}
    </div>
  )
}
