import { useMemo, useState } from 'react'
import { ShieldCheck, Plus, Trash2, Edit3, ScrollText, Lock } from 'lucide-react'
import { useScopedDB } from '../hooks/useScopedDB'
import { useSession } from '../contexts/SessionContext'
import { useSettings } from '../hooks/useSettings'
import { CAT_COMBINADO, REGRAS_INTRO_DEFAULT } from '../lib/constants'
import { EmptyState } from '../components/ui/primitives'

const EMPTY = { categoria: 'permitido', texto: '', detalhes: '', revisado_em: '' }

export default function RegrasPage() {
  const { canEditRules, isHer } = useSession()
  const { settings, updateSettings } = useSettings()
  const { data: items, insert, update, remove } = useScopedDB('combinados', { scope: 'couple' })
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editingIntro, setEditingIntro] = useState(false)
  const [introDraft, setIntroDraft] = useState('')

  const intro = settings.regras_intro || REGRAS_INTRO_DEFAULT

  const grouped = useMemo(() => {
    const g = {}
    Object.keys(CAT_COMBINADO).forEach((k) => { g[k] = [] })
    items.forEach((item) => { if (g[item.categoria]) g[item.categoria].push(item) })
    return g
  }, [items])

  const submit = (e) => {
    e.preventDefault()
    if (!form.texto.trim() || !canEditRules) return
    const data = { ...form, revisado_em: new Date().toISOString().split('T')[0] }
    if (editId) { update(editId, data); setEditId(null) }
    else insert(data)
    setForm(EMPTY)
    setAdding(false)
  }

  const startEdit = (item) => {
    if (!canEditRules) return
    setForm({ categoria: item.categoria || 'permitido', texto: item.texto || '', detalhes: item.detalhes || '', revisado_em: item.revisado_em || '' })
    setEditId(item.id)
    setAdding(true)
  }

  const saveIntro = () => {
    updateSettings({ regras_intro: introDraft })
    setEditingIntro(false)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="vl-card-highlight">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold">
            <ScrollText size={18} className="text-[var(--color-vl-accent)]" />
            {isHer ? 'Nossas regras' : 'Regras do casal'}
          </h3>
          {isHer && (
            <span className="flex items-center gap-1 text-xs text-[var(--color-vl-muted)]">
              <Lock size={12} /> Somente leitura
            </span>
          )}
        </div>
        {editingIntro && canEditRules ? (
          <div className="space-y-2">
            <textarea className="vl-input resize-none font-mono text-sm" rows={10} value={introDraft} onChange={(e) => setIntroDraft(e.target.value)} />
            <div className="flex gap-2">
              <button type="button" onClick={saveIntro} className="vl-btn-primary text-xs">Salvar</button>
              <button type="button" onClick={() => setEditingIntro(false)} className="vl-btn-ghost text-xs">Cancelar</button>
            </div>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-vl-muted)]">{intro}</p>
            {canEditRules && (
              <button
                type="button"
                onClick={() => { setIntroDraft(intro); setEditingIntro(true) }}
                className="mt-3 text-xs text-[var(--color-vl-accent)] hover:opacity-80"
              >
                Editar princípios
              </button>
            )}
          </>
        )}
      </div>

      <div className="vl-card flex items-start gap-3" style={{ borderColor: 'var(--color-vl-warning)', backgroundColor: 'var(--color-vl-warning-soft)' }}>
        <ShieldCheck size={18} className="shrink-0 text-[var(--color-vl-warning)]" />
        <p className="text-sm text-[var(--color-vl-text)]">
          {isHer
            ? 'Combinados que vocês definiram juntos. Seu ritmo é o certo.'
            : 'Mantenha atualizado. Ela vê em modo leitura no login dela.'}
        </p>
      </div>

      {canEditRules && (
        <div className="flex justify-end">
          <button type="button" className="vl-btn-primary" onClick={() => { setAdding(true); setEditId(null); setForm(EMPTY) }}>
            <Plus size={16} /> Adicionar regra
          </button>
        </div>
      )}

      {adding && canEditRules && (
        <form onSubmit={submit} className="vl-card space-y-3">
          <div className="flex flex-wrap gap-2">
            {Object.entries(CAT_COMBINADO).map(([k, v]) => (
              <button
                key={k}
                type="button"
                onClick={() => setForm((f) => ({ ...f, categoria: k }))}
                className={`vl-pill flex items-center gap-1.5 ${form.categoria === k ? 'vl-pill-active' : 'vl-pill-inactive'}`}
              >
                <span className={`h-2 w-2 rounded-full ${v.dot}`} />
                {v.label}
              </button>
            ))}
          </div>
          <input required className="vl-input" placeholder="A regra / combinado *" value={form.texto} onChange={(e) => setForm((f) => ({ ...f, texto: e.target.value }))} />
          <textarea className="vl-input resize-none" rows={2} placeholder="Detalhes / contexto" value={form.detalhes} onChange={(e) => setForm((f) => ({ ...f, detalhes: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <button type="button" className="vl-btn-ghost" onClick={() => { setAdding(false); setEditId(null) }}>Cancelar</button>
            <button type="submit" className="vl-btn-primary">Salvar</button>
          </div>
        </form>
      )}

      {items.length === 0 && !adding && (
        <EmptyState icon={ShieldCheck} title="Nenhuma regra ainda" sub={canEditRules ? 'Adicione os combinados da dinâmica' : 'Seu parceiro ainda não cadastrou regras'} />
      )}

      {Object.entries(grouped).map(([cat, catItems]) => {
        if (catItems.length === 0) return null
        const cfg = CAT_COMBINADO[cat]
        return (
          <div key={cat} className="vl-card">
            <div className="mb-3 flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${cfg.dot}`} />
              <h3 className="font-semibold">
                {cfg.label}
                <span className="font-normal text-[var(--color-vl-muted)]"> ({catItems.length})</span>
              </h3>
            </div>
            <div className="space-y-2">
              {catItems.map((item) => (
                <div key={item.id} className="group flex items-start gap-3">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{item.texto}</p>
                    {item.detalhes && <p className="mt-0.5 text-xs text-[var(--color-vl-muted)]">{item.detalhes}</p>}
                    {item.revisado_em && <p className="mt-0.5 text-xs text-[var(--color-vl-muted)] opacity-70">Revisado em {item.revisado_em}</p>}
                  </div>
                  {canEditRules && (
                    <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                      <button type="button" onClick={() => startEdit(item)} className="vl-btn-icon"><Edit3 size={13} /></button>
                      <button type="button" onClick={() => remove(item.id)} className="vl-btn-icon hover:text-[var(--color-vl-danger)]"><Trash2 size={13} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
