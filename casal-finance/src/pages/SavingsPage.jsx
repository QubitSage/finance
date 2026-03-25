import { useState } from 'react'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { fmt } from '../lib/utils'
import { PiggyBank, Plus, Trash2, Edit2, Check, X } from 'lucide-react'

export default function SavingsPage() {
  const { goals, loading, add, update, remove } = useSavingsGoals()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', target: '', current: '', emoji: '🎯' })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true)
    await add({ name: form.name, target: parseFloat(form.target), current: parseFloat(form.current || 0), emoji: form.emoji })
    setForm({ name: '', target: '', current: '', emoji: '🎯' })
    setAdding(false); setSaving(false)
  }

  const handleDeposit = async (goal, amount) => {
    const newCurrent = Math.min(Number(goal.current) + Number(amount), Number(goal.target))
    await update(goal.id, { current: newCurrent })
  }

  const totalTarget = goals.reduce((s, g) => s + Number(g.target), 0)
  const totalSaved = goals.reduce((s, g) => s + Number(g.current), 0)

  const EMOJIS = ['🎯','🏠','✈️','🚗','💍','👶','🎓','💻','🎸','🏖️','🐶','💎']

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-sage-brand" />
          <h1 className="font-display text-2xl font-bold text-ink-900 italic">Poupança & Metas</h1>
        </div>
        <button className="btn-primary flex items-center gap-1.5" onClick={() => setAdding(!adding)}>
          <Plus className="w-4 h-4" /> Nova meta
        </button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card">
          <p className="stat-label">Total guardado</p>
          <p className="text-xl font-semibold text-sage-dark font-display">{fmt(totalSaved)}</p>
        </div>
        <div className="card">
          <p className="stat-label">Total das metas</p>
          <p className="text-xl font-semibold text-ink-700 font-display">{fmt(totalTarget)}</p>
        </div>
      </div>

      {/* Add form */}
      {adding && (
        <form onSubmit={handleAdd} className="card mb-5 flex flex-col gap-3">
          <p className="font-medium text-sm text-ink-700">Nova meta de poupança</p>
          <div>
            <label className="label">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(em => (
                <button key={em} type="button"
                  onClick={() => setForm(p => ({...p, emoji: em}))}
                  className={`w-9 h-9 rounded-xl text-lg transition-all ${form.emoji === em ? 'bg-rose-light ring-2 ring-rose-brand' : 'bg-cream-100 hover:bg-cream-200'}`}>
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Nome da meta</label>
            <input className="input" placeholder="Ex: Viagem para Europa"
              value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Valor total (R$)</label>
              <input className="input" type="number" step="0.01" min="0" placeholder="10.000"
                value={form.target} onChange={e => setForm(p => ({...p, target: e.target.value}))} required />
            </div>
            <div>
              <label className="label">Já guardou (R$)</label>
              <input className="input" type="number" step="0.01" min="0" placeholder="0"
                value={form.current} onChange={e => setForm(p => ({...p, current: e.target.value}))} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn-secondary" onClick={() => setAdding(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar meta'}</button>
          </div>
        </form>
      )}

      {/* Goals list */}
      {loading ? (
        <div className="text-center py-12 text-ink-300 text-sm">Carregando...</div>
      ) : goals.length === 0 ? (
        <div className="card text-center py-12">
          <PiggyBank className="w-10 h-10 text-ink-100 mx-auto mb-3" />
          <p className="text-ink-300 text-sm">Nenhuma meta criada ainda.</p>
          <p className="text-ink-300 text-xs mt-1">Crie uma meta para começar a poupar juntos!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {goals.map(goal => {
            const pct = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0
            const isEditing = editing?.id === goal.id
            return (
              <div key={goal.id} className="card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-xl flex-shrink-0">
                    {goal.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-ink-800">{goal.name}</p>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditing(isEditing ? null : { ...goal, deposit: '' })}
                          className="btn-ghost p-1.5"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => remove(goal.id)}
                          className="btn-ghost p-1.5 hover:text-rose-brand"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-ink-400 mb-1.5">
                      <span>{fmt(goal.current)} guardado</span>
                      <span className="font-medium text-ink-600">{pct.toFixed(0)}% de {fmt(goal.target)}</span>
                    </div>
                    <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: pct >= 100 ? '#6B8F71' : '#C8707A' }} />
                    </div>
                    {pct >= 100 && (
                      <p className="text-xs text-sage-dark mt-1.5 font-medium">🎉 Meta atingida!</p>
                    )}
                    {isEditing && (
                      <div className="flex gap-2 mt-3">
                        <input className="input flex-1" type="number" min="0" step="0.01" placeholder="Valor a depositar"
                          value={editing.deposit} onChange={e => setEditing(p => ({...p, deposit: e.target.value}))} />
                        <button className="btn-primary flex items-center gap-1"
                          onClick={async () => { await handleDeposit(goal, editing.deposit); setEditing(null) }}>
                          <Check className="w-3.5 h-3.5" /> Ok
                        </button>
                        <button className="btn-secondary p-2" onClick={() => setEditing(null)}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
