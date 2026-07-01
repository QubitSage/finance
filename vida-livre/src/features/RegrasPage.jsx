import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit3, ScrollText } from 'lucide-react'
import { useDB } from '../hooks/useDB'
import { useActor } from '../contexts/ActorContext'
import { fetchAll, updateRow } from '../lib/db'
import { REGRA_CATEGORIA } from '../lib/constants'
import { FilterPills, EmptyState } from '../components/ui/primitives'

const CATEGORIAS = Object.keys(REGRA_CATEGORIA)
const EMPTY_FORM = { categoria: 'permitido', texto: '', detalhes: '' }

export default function RegrasPage() {
  const { actor } = useActor()
  const { data: regras, insert, update, remove } = useDB('vl_regras', { order: 'created_at', ascending: true })
  const [intro, setIntro] = useState('')
  const [editingIntro, setEditingIntro] = useState(false)
  const [filter, setFilter] = useState('permitido')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    fetchAll('vl_regras_intro').then((rows) => setIntro(rows[0]?.texto || ''))
  }, [])

  const saveIntro = () => {
    updateRow('vl_regras_intro', 'main', { texto: intro }).then(() => setEditingIntro(false))
  }

  const startEdit = (r) => {
    setForm({ categoria: r.categoria, texto: r.texto, detalhes: r.detalhes || '' })
    setEditingId(r.id)
    setAdding(true)
  }

  const submit = () => {
    if (!form.texto.trim()) return
    if (editingId) {
      update(editingId, form)
    } else {
      insert({ ...form, criado_por: actor })
    }
    setForm({ ...EMPTY_FORM, categoria: filter })
    setAdding(false)
    setEditingId(null)
  }

  const filtered = regras.filter((r) => r.categoria === filter)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="vl-card-highlight space-y-2">
        <p className="vl-section-title">Nosso combinado</p>
        {editingIntro ? (
          <>
            <textarea
              className="vl-input font-mono"
              rows={5}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
            />
            <div className="flex gap-2">
              <button className="vl-btn-primary flex-1 text-sm" onClick={saveIntro}>Salvar</button>
              <button className="vl-btn-ghost text-sm" onClick={() => setEditingIntro(false)}>Cancelar</button>
            </div>
          </>
        ) : (
          <>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--color-vl-text)]">{intro || 'Sem introdução ainda.'}</p>
            <button className="vl-btn-ghost text-xs" onClick={() => setEditingIntro(true)}>Editar</button>
          </>
        )}
      </div>

      <FilterPills
        options={CATEGORIAS}
        value={filter}
        onChange={setFilter}
        labelFn={(c) => REGRA_CATEGORIA[c].label}
      />

      {!adding && (
        <button className="vl-btn-primary w-full text-sm" onClick={() => { setForm({ ...EMPTY_FORM, categoria: filter }); setAdding(true) }}>
          <Plus size={14} /> Nova regra
        </button>
      )}

      {adding && (
        <div className="vl-card space-y-3">
          <select className="vl-input" value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{REGRA_CATEGORIA[c].label}</option>)}
          </select>
          <input className="vl-input" placeholder="Regra *" value={form.texto} onChange={(e) => setForm((f) => ({ ...f, texto: e.target.value }))} />
          <textarea className="vl-input resize-none" rows={2} placeholder="Detalhes (opcional)" value={form.detalhes} onChange={(e) => setForm((f) => ({ ...f, detalhes: e.target.value }))} />
          <div className="flex gap-2">
            <button className="vl-btn-primary flex-1 text-sm" onClick={submit}>Salvar</button>
            <button className="vl-btn-ghost text-sm" onClick={() => { setAdding(false); setEditingId(null) }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && (
          <EmptyState icon={ScrollText} title="Nenhuma regra aqui ainda" sub="Adicione a primeira acima." />
        )}
        {filtered.map((r) => (
          <div key={r.id} className="vl-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--color-vl-text)]">{r.texto}</p>
                {r.detalhes && <p className="mt-1 text-xs text-[var(--color-vl-muted)]">{r.detalhes}</p>}
              </div>
              <div className="flex gap-1">
                <button
                  className={`vl-btn-icon text-xs ${r.ativo ? '' : 'opacity-50'}`}
                  title={r.ativo ? 'Ativa' : 'Inativa'}
                  onClick={() => update(r.id, { ativo: !r.ativo })}
                >
                  {r.ativo ? 'On' : 'Off'}
                </button>
                <button className="vl-btn-icon" onClick={() => startEdit(r)}><Edit3 size={13} /></button>
                <button className="vl-btn-icon hover:text-[var(--color-vl-danger)]" onClick={() => remove(r.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
