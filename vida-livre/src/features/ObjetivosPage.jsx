import { useState } from 'react'
import { Plus, Trash2, Edit3 } from 'lucide-react'
import { useScopedDB } from '../hooks/useScopedDB'
import { useSession } from '../contexts/SessionContext'
import { OBJ_CORES, OBJ_EMOJIS, MANIFESTO_INICIAL } from '../lib/constants'

function ObjetivoForm({ form, setForm, onSave, onCancel }) {
  const cor = OBJ_CORES[form.cor] || OBJ_CORES.amber
  return (
    <div className={`rounded-2xl border-2 p-5 space-y-3 ${cor.bg} ${cor.border}`}>
      <div className="flex flex-wrap gap-1">
        {OBJ_EMOJIS.map((e) => (
          <button key={e} type="button" onClick={() => setForm((f) => ({ ...f, emoji: e }))} className={`rounded-lg p-1 text-lg transition-all ${form.emoji === e ? 'scale-110 bg-white/20 ring-2 ring-white/40' : 'hover:bg-white/10'}`}>{e}</button>
        ))}
      </div>
      <div className="flex gap-2">
        {Object.entries(OBJ_CORES).map(([k, v]) => (
          <button key={k} type="button" onClick={() => setForm((f) => ({ ...f, cor: k }))} className={`h-5 w-5 rounded-full ${v.dot} transition-all ${form.cor === k ? 'ring-2 ring-white scale-125' : ''}`} />
        ))}
      </div>
      <input className="vl-input border-0 bg-black/20" placeholder="Título (ex: Agora, Em 6 anos...)" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
      <textarea className="vl-input resize-none border-0 bg-black/20" rows={9} placeholder="O que vocês querem construir juntos..." value={form.conteudo} onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))} />
      <div className="flex gap-2">
        <button type="button" onClick={onSave} className="vl-btn-primary flex-1">Salvar</button>
        <button type="button" onClick={onCancel} className="vl-btn-ghost">Cancelar</button>
      </div>
    </div>
  )
}

export default function ObjetivosPage() {
  const { canEditVision, isHer } = useSession()
  const { data: objetivos, insert, update, remove } = useScopedDB('objetivos', { scope: 'couple', order: 'ordem', asc: true })
  const [editId, setEditId] = useState(null)
  const [adding, setAdding] = useState(false)
  const emptyForm = { titulo: '', conteudo: '', cor: 'amber', emoji: '🌟' }
  const [form, setForm] = useState(emptyForm)

  const handleSave = () => {
    if (!form.conteudo.trim()) return
    if (editId) { update(editId, { titulo: form.titulo, conteudo: form.conteudo, cor: form.cor, emoji: form.emoji }); setEditId(null) }
    else { insert({ ...form, ordem: objetivos.length }); setAdding(false) }
    setForm(emptyForm)
  }

  const cancel = () => { setEditId(null); setAdding(false); setForm(emptyForm) }

  if (objetivos.length === 0 && !adding) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-5 py-16 text-center">
        <div className="text-6xl">🗺️</div>
        <div>
          <p className="text-xl font-bold">Onde querem chegar?</p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-vl-muted)]">
            {isHer
              ? 'Crie blocos da visão de vocês — sonhos, metas e manifesto.'
              : 'Objetivos, sonhos e manifesto do casal — os dois podem editar.'}
          </p>
        </div>
        {canEditVision && (
          <div className="flex w-full flex-col gap-3">
            <button onClick={() => insert({ titulo: 'Nosso Manifesto', conteudo: MANIFESTO_INICIAL, cor: 'violet', emoji: '🗺️', ordem: 0 })} className="vl-btn-primary w-full">
              🗺️ Começar com nosso manifesto
            </button>
            <button onClick={() => setAdding(true)} className="vl-btn-ghost w-full">+ Criar do zero</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {!adding && editId === null && canEditVision && (
        <div className="flex justify-end">
          <button className="vl-btn-primary" onClick={() => setAdding(true)}><Plus size={16} /> Novo bloco</button>
        </div>
      )}
      {adding && canEditVision && <ObjetivoForm form={form} setForm={setForm} onSave={handleSave} onCancel={cancel} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {objetivos.map((obj) => {
          const cor = OBJ_CORES[obj.cor] || OBJ_CORES.amber
          if (editId === obj.id && canEditVision) {
            return <ObjetivoForm key={obj.id} form={form} setForm={setForm} onSave={handleSave} onCancel={cancel} />
          }
          return (
            <div key={obj.id} className={`group relative rounded-2xl border p-5 ${cor.bg} ${cor.border}`}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-2xl">{obj.emoji || '🌟'}</span>
                  {obj.titulo && <h3 className={`truncate text-sm font-bold ${cor.title}`}>{obj.titulo}</h3>}
                </div>
                {canEditVision && (
                  <div className="flex shrink-0 gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                    <button onClick={() => { setForm({ titulo: obj.titulo || '', conteudo: obj.conteudo || '', cor: obj.cor || 'amber', emoji: obj.emoji || '🌟' }); setEditId(obj.id); setAdding(false) }} className="vl-btn-icon"><Edit3 size={13} /></button>
                    <button onClick={() => remove(obj.id)} className="vl-btn-icon hover:text-rose-400"><Trash2 size={13} /></button>
                  </div>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-vl-text)]/90">{obj.conteudo}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
