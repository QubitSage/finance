import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useSettings } from '../hooks/useSettings'
import { fmt, monthLabel } from '../lib/utils'
import { format, subMonths, addMonths } from 'date-fns'
import { Heart, Sparkles, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

const WIFE_CATS = [
  { value: 'wife',    label: 'Mimos / Presentes' },
  { value: 'personal', label: 'Pessoal dela' },
  { value: 'savings', label: 'Poupança dela' },
]

export default function WifePage() {
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ description: '', category: 'wife', amount: '', date: format(new Date(), 'yyyy-MM-dd') })

  const { transactions, totalIncome, wifeSpendings, loading, add, remove } = useTransactions(month)
  const { settings } = useSettings()

  const wifeShare = totalIncome * (settings.wife_percentage / 100)
  const remaining = wifeShare - wifeSpendings
  const pct = wifeShare > 0 ? Math.min((wifeSpendings / wifeShare) * 100, 100) : 0

  const wifeTransactions = transactions.filter(t => t.type === 'expense' && ['wife','personal','savings'].includes(t.category))

  const prevMonth = () => setMonth(format(subMonths(new Date(month + '-01'), 1), 'yyyy-MM'))
  const nextMonth = () => setMonth(format(addMonths(new Date(month + '-01'), 1), 'yyyy-MM'))

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true)
    await add({ ...form, amount: parseFloat(form.amount), type: 'expense' })
    setForm({ description: '', category: 'wife', amount: '', date: format(new Date(), 'yyyy-MM-dd') })
    setAdding(false); setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-brand fill-rose-brand" />
          <h1 className="font-display text-2xl font-bold text-ink-900 italic">Mimos da Esposa</h1>
        </div>
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

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card text-center">
          <p className="stat-label">Direito ({settings.wife_percentage}%)</p>
          <p className="text-lg font-semibold text-rose-brand font-display">{fmt(wifeShare)}</p>
        </div>
        <div className="card text-center">
          <p className="stat-label">Gasto</p>
          <p className="text-lg font-semibold text-ink-800 font-display">{fmt(wifeSpendings)}</p>
        </div>
        <div className="card text-center">
          <p className="stat-label">Saldo</p>
          <p className={`text-lg font-semibold font-display ${remaining >= 0 ? 'text-sage-dark' : 'text-rose-dark'}`}>{fmt(remaining)}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card mb-5">
        <div className="flex justify-between text-xs text-ink-400 mb-2">
          <span>Utilizado</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: pct >= 90 ? '#C8707A' : '#6B8F71' }} />
        </div>
        <p className="text-xs text-ink-400 mt-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {remaining >= 0 ? `Ainda disponível: ${fmt(remaining)}` : `Excedeu em: ${fmt(Math.abs(remaining))}`}
        </p>
      </div>

      {/* Add form */}
      {adding && (
        <form onSubmit={handleAdd} className="card mb-4 flex flex-col gap-3">
          <p className="font-medium text-sm text-ink-700">Novo gasto da esposa</p>
          <div>
            <label className="label">Descrição</label>
            <input className="input" placeholder="Ex: Vestido, SPA..."
              value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Categoria</label>
              <select className="select" value={form.category}
                onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                {WIFE_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Valor (R$)</label>
              <input className="input" type="number" step="0.01" min="0" placeholder="0,00"
                value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} required />
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
      ) : wifeTransactions.length === 0 ? (
        <div className="card text-center py-12">
          <Heart className="w-8 h-8 text-rose-light mx-auto mb-2" />
          <p className="text-ink-300 text-sm">Nenhum gasto ainda neste mês.</p>
        </div>
      ) : (
        <div className="card divide-y divide-ink-100">
          {wifeTransactions.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Heart className="w-3.5 h-3.5 text-rose-brand flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-800 truncate">{tx.description}</p>
                <p className="text-xs text-ink-400">{tx.date}</p>
              </div>
              <p className="text-sm font-semibold text-rose-brand flex-shrink-0">{fmt(tx.amount)}</p>
              <button onClick={() => remove(tx.id)} className="text-ink-200 hover:text-rose-brand transition-colors flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
