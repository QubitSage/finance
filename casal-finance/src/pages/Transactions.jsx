import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { fmt, CATEGORIES, monthLabel } from '../lib/utils'
import { format, subMonths, addMonths } from 'date-fns'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

const INCOME_CATS = ['work', 'personal']
const EXPENSE_CATS = ['wife', 'savings', 'company', 'personal']

export default function Transactions() {
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [tab, setTab] = useState('income')
  const [form, setForm] = useState({ description: '', category: 'work', amount: '', date: format(new Date(), 'yyyy-MM-dd') })
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  const { transactions, loading, add, remove, totalIncome, totalExpenses } = useTransactions(month)
  const list = transactions.filter(t => t.type === (tab === 'income' ? 'income' : 'expense'))

  const prevMonth = () => setMonth(format(subMonths(new Date(month + '-01'), 1), 'yyyy-MM'))
  const nextMonth = () => setMonth(format(addMonths(new Date(month + '-01'), 1), 'yyyy-MM'))

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    await add({ ...form, amount: parseFloat(form.amount), type: tab === 'income' ? 'income' : 'expense' })
    setForm({ description: '', category: tab === 'income' ? 'work' : 'wife', amount: '', date: format(new Date(), 'yyyy-MM-dd') })
    setAdding(false)
    setSaving(false)
  }

  const cats = tab === 'income' ? INCOME_CATS : EXPENSE_CATS

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 italic">Entradas & Saídas</h1>
        <button className="btn-primary flex items-center gap-1.5" onClick={() => setAdding(!adding)}>
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="btn-ghost"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-medium text-ink-700">{monthLabel(month)}</span>
        <button onClick={nextMonth} className="btn-ghost"><ChevronRight className="w-4 h-4" /></button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card text-center">
          <p className="stat-label">Entradas</p>
          <p className="text-lg font-semibold text-sage-dark">{fmt(totalIncome)}</p>
        </div>
        <div className="card text-center">
          <p className="stat-label">Saídas</p>
          <p className="text-lg font-semibold text-rose-brand">{fmt(totalExpenses)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-cream-100 p-1 mb-4">
        {[['income','Entradas'],['expense','Saídas']].map(([v,l]) => (
          <button key={v} onClick={() => { setTab(v); setAdding(false) }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all
              ${tab === v ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-400 hover:text-ink-600'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Add form */}
      {adding && (
        <form onSubmit={handleAdd} className="card mb-4 flex flex-col gap-3">
          <p className="font-medium text-sm text-ink-700">Nova {tab === 'income' ? 'entrada' : 'saída'}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Descrição</label>
              <input className="input" placeholder="Ex: Guilherme cliente"
                value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} required />
            </div>
            <div>
              <label className="label">Categoria</label>
              <div className="relative">
                <select className="select" value={form.category}
                  onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                  {cats.map(c => <option key={c} value={c}>{CATEGORIES[c].label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Valor (R$)</label>
              <input className="input" type="number" step="0.01" min="0" placeholder="0,00"
                value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} required />
            </div>
            <div>
              <label className="label">Data</label>
              <input className="input" type="date" value={form.date}
                onChange={e => setForm(p => ({...p, date: e.target.value}))} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn-secondary" onClick={() => setAdding(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-ink-300 text-sm">Carregando...</div>
      ) : list.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-ink-300 text-sm">Nenhum registro ainda.</p>
        </div>
      ) : (
        <div className="card divide-y divide-ink-100">
          {list.map(tx => {
            const cat = CATEGORIES[tx.category]
            return (
              <div key={tx.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cat?.dot || 'bg-ink-200'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">{tx.description}</p>
                  <p className="text-xs text-ink-400">{cat?.label} · {tx.date}</p>
                </div>
                <p className={`text-sm font-semibold flex-shrink-0 ${tab === 'income' ? 'text-sage-dark' : 'text-rose-brand'}`}>
                  {tab === 'income' ? '+' : '-'} {fmt(tx.amount)}
                </p>
                <button onClick={() => remove(tx.id)} className="text-ink-200 hover:text-rose-brand transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
