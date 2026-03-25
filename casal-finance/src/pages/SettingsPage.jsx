import { useState } from 'react'
import { useSettings } from '../hooks/useSettings'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  const { settings, save, loading } = useSettings()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const current = form ?? settings

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    await save(current)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-ink-300">Carregando...</div>

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-ink-400" />
        <h1 className="font-display text-2xl font-bold text-ink-900 italic">Configurações</h1>
      </div>

      <form onSubmit={handleSave} className="card flex flex-col gap-5">
        <div>
          <label className="label">Nome do casal</label>
          <input className="input" placeholder="Ex: João & Maria"
            value={current.couple_name}
            onChange={e => setForm(p => ({ ...(p ?? settings), couple_name: e.target.value }))} />
          <p className="text-xs text-ink-400 mt-1">Aparece no topo do app.</p>
        </div>

        <div>
          <label className="label">% da esposa sobre entradas</label>
          <div className="flex items-center gap-3">
            <input className="input" type="number" min="0" max="100" step="1"
              value={current.wife_percentage}
              onChange={e => setForm(p => ({ ...(p ?? settings), wife_percentage: parseFloat(e.target.value) }))} />
            <span className="text-ink-500 font-medium">%</span>
          </div>
          <p className="text-xs text-ink-400 mt-1">
            Percentual calculado automaticamente sobre o total de entradas do mês.
          </p>
        </div>

        <div className="border-t border-ink-100 pt-4">
          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar configurações'}
          </button>
        </div>
      </form>

      <div className="card mt-4 bg-cream-100 border-0">
        <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-2">Como funciona o cálculo</p>
        <p className="text-sm text-ink-600 leading-relaxed">
          Toda vez que você registra uma entrada, o app calcula automaticamente
          <strong className="text-ink-800"> {current.wife_percentage}%</strong> daquele valor como o "direito" da esposa.
          Na aba <em>Mimos da Esposa</em> você vê o saldo disponível versus o que já foi gasto.
        </p>
      </div>
    </div>
  )
}
