import { useState } from 'react'
import { useDB } from '../hooks/useDB'
import { useLogs } from '../hooks/useSettings'
import { fmt, monthLabel, monthKey, TX_CATEGORIES } from '../lib/utils'
import { format, subMonths, addMonths } from 'date-fns'
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const INCOME_CATS = ['work', 'personal']
const EXPENSE_CATS = ['wife', 'savings', 'company', 'personal']

export default function Transactions() {
  const [month, setMonth] = useState(monthKey())
  const [tab, setTab] = useState('income')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ description: '', category: 'work', amount: '', date: format(new Date(), 'yyyy-MM-dd') })
  const { data: txs, insert, remove } = useDB('transactions', { filter: { month } })
  const { addLog } = useLogs()
  const list = txs.filter(t => t.type === (tab === 'income' ? 'income' : 'expense'))
  const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0)
  const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0)
  const cats = tab === 'income' ? INCOME_CATS : EXPENSE_CATS
  const prevMonth = () => setMonth(monthKey(subMonths(new Date(month + '-01'), 1)))
  const nextMonth = () => setMonth(monthKey(addMonths(new Date(month + '-01'), 1)))

  const handleAdd = async (e) => {
    e.preventDefault()
    const { data: d } = await insert({ ...form, amount: parseFloat(form.amount), type: tab === 'income' ? 'income' : 'expense', month })
    if(d) addLog((tab === 'income' ? 'Entrada' : 'Saida') + ' adicionada: ' + form.description + ' R$' + form.amount, 'Transacoes', '/transacoes', form.description)
    setForm({ description: '', category: cats[0], amount: '', date: format(new Date(), 'yyyy-MM-dd') })
    setAdding(false)
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <PageHeader title="Entradas & Saidas" action={<button className="btn-primary flex items-center gap-1.5" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4" /> Adicionar</button>} />
      <div className="flex items-center gap-3 mb-4">
        <button onClick={prevMonth} className="btn-icon"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-medium text-stone-600 min-w-[140px] text-center">{monthLabel(month)}</span>
        <button onClick={nextMonth} className="btn-icon"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card"><p className="stat-label">Entradas</p><p className="text-xl font-display font-semibold text-sage-600">{fmt(totalIncome)}</p></div>
        <div className="card"><p className="stat-label">Saidas</p><p className="text-xl font-display font-semibold text-blush-500">{fmt(totalExpense)}</p></div>
      </div>
      <div className="flex bg-stone-100 rounded-xl p-1 mb-4">
        {[['income','Entradas'],['expense','Saidas']].map(([v,l]) => (
          <button key={v} onClick={() => { setTab(v); setAdding(false) }} className={'flex-1 py-2 text-sm font-medium rounded-lg transition-all ' + (tab === v ? 'bg-white text-stone-800 shadow-warm' : 'text-stone-400 hover:text-stone-600')}>{l}</button>
        ))}
      </div>
      {adding && (
        <form onSubmit={handleAdd} className="card mb-4">
          <p className="form-section-title">Nova {tab === 'income' ? 'entrada' : 'saida'}</p>
          <div className="grid gap-3">
            <div><label className="label">Descricao</label><input className="input" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} required placeholder="Ex: Guilherme cliente" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Categoria</label>
                <select className="select" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                  {cats.map(c => <option key={c} value={c}>{TX_CATEGORIES[c].label}</option>)}
                </select>
              </div>
              <div><label className="label">Valor (R$)</label><input className="input" type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} required /></div>
            </div>
            <div><label className="label">Data</label><input className="input" type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} /></div>
          </div>
          <div className="flex gap-2 justify-end mt-3">
            <button type="button" className="btn-secondary" onClick={() => setAdding(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Salvar</button>
          </div>
        </form>
      )}
      <div className="tbl-wrap">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Descricao</th><th>Categoria</th><th className="text-right">Valor</th><th className="w-10"></th></tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-stone-300">Nenhum registro</td></tr>
              ) : list.map(t => {
                const cat = TX_CATEGORIES[t.category]
                return (
                  <tr key={t.id}>
                    <td className="font-medium">{t.description}</td>
                    <td><span className={'badge ' + (cat?.bg || 'bg-stone-100') + ' ' + (cat?.text || 'text-stone-600')}>{cat?.label || t.category}</span></td>
                    <td className={'text-right font-medium ' + (tab === 'income' ? 'text-sage-600' : 'text-blush-500')}>{tab === 'income' ? '+' : '-'} {fmt(t.amount)}</td>
                    <td><button onClick={() => remove(t.id)} className="btn-icon w-7 h-7"><Trash2 className="w-3.5 h-3.5 text-stone-300 hover:text-blush-500" /></button></td>
                  </tr>
                )
              })}
            </tbody>
            {list.length > 0 && (
              <tfoot><tr>
                <td colSpan={2} className="font-medium bg-stone-50 text-stone-500">Total</td>
                <td className={'text-right font-semibold bg-stone-50 ' + (tab === 'income' ? 'text-sage-600' : 'text-blush-500')}>{fmt(list.reduce((s,t)=>s+t.amount,0))}</td>
                <td className="bg-stone-50"></td>
              </tr></tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
