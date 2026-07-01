import { useEffect, useState } from 'react'
import { Settings2, ChevronDown, Sparkles, Shirt, Heart, Car } from 'lucide-react'
import { getMesadaConfig, saveMesadaSettings, forcarCreditoMes } from '../lib/mesada'
import { MESADA_ORCAMENTO, fmtBRL } from '../lib/constants'
import { IconTile } from './ui/primitives'

const CAT_ICONS = { Sparkles, Shirt, Heart, Car }

export default function MesadaConfigPanel({ onSaved }) {
  const [open, setOpen] = useState(false)
  const cfg = getMesadaConfig()

  const [form, setForm] = useState({
    saldo: String(cfg.saldo),
    credito_ciclo: String(cfg.credito_ciclo),
    limites: Object.fromEntries(
      Object.keys(MESADA_ORCAMENTO).map((k) => [k, String(cfg.limites[k] ?? MESADA_ORCAMENTO[k].limite)])
    ),
  })

  useEffect(() => {
    const c = getMesadaConfig()
    setForm({
      saldo: String(c.saldo),
      credito_ciclo: String(c.credito_ciclo),
      limites: Object.fromEntries(
        Object.keys(MESADA_ORCAMENTO).map((k) => [k, String(c.limites[k] ?? MESADA_ORCAMENTO[k].limite)])
      ),
    })
  }, [open])

  const totalRef = Object.values(form.limites).reduce((s, v) => s + (Number(v) || 0), 0)

  const submit = (e) => {
    e.preventDefault()
    saveMesadaSettings({
      saldo: form.saldo,
      credito_ciclo: form.credito_ciclo,
      limites: Object.fromEntries(
        Object.keys(form.limites).map((k) => [k, Number(form.limites[k]) || 0])
      ),
    })
    onSaved?.()
    setOpen(false)
  }

  const aplicarCredito = () => {
    forcarCreditoMes()
    onSaved?.()
    setOpen(false)
  }

  return (
    <div className="rounded-2xl border border-[var(--color-vl-border)] bg-[var(--color-vl-surface)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-vl-text)]">
          <Settings2 size={16} /> Configurar mesada
        </span>
        <ChevronDown size={18} className={`text-[var(--color-vl-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <form onSubmit={submit} className="space-y-4 border-t border-[var(--color-vl-border)] px-4 pb-4 pt-3">
          <p className="text-xs text-[var(--color-vl-muted)]">
            Saldo, crédito mensal e tetos por categoria — sincroniza entre os dois aparelhos.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="vl-label">Saldo atual</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="vl-input"
                value={form.saldo}
                onChange={(e) => setForm((f) => ({ ...f, saldo: e.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className="vl-label">Crédito / mês</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="vl-input"
                value={form.credito_ciclo}
                onChange={(e) => setForm((f) => ({ ...f, credito_ciclo: e.target.value }))}
              />
            </label>
          </div>

          <div>
            <p className="vl-label mb-2">Referência por categoria</p>
            <div className="space-y-2">
              {Object.entries(MESADA_ORCAMENTO).map(([key, meta]) => (
                <label key={key} className="flex items-center gap-3 rounded-xl bg-[var(--color-vl-elevated)] px-3 py-2">
                  <IconTile icon={CAT_ICONS[meta.icon]} size={14} className={meta.className} tileClassName="h-7 w-7" />
                  <span className="min-w-0 flex-1 text-sm">{meta.label}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="vl-input w-24 shrink-0 py-2 text-right"
                    value={form.limites[key]}
                    onChange={(e) => setForm((f) => ({
                      ...f,
                      limites: { ...f.limites, [key]: e.target.value },
                    }))}
                  />
                </label>
              ))}
            </div>
            <p className="mt-2 text-right text-xs text-[var(--color-vl-accent)]">
              Total referência: {fmtBRL(totalRef)}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="submit" className="vl-btn-primary flex-1 text-sm">Salvar configuração</button>
            <button
              type="button"
              onClick={aplicarCredito}
              className="vl-btn-ghost flex-1 text-sm"
              title="Soma o crédito mensal ao saldo agora"
            >
              + Crédito deste mês
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
