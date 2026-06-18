import { useState, useEffect } from 'react'
import { HelpCircle, Plus, Trash2, Edit3, Lock, ChevronDown } from 'lucide-react'
import { useScopedDB } from '../hooks/useScopedDB'
import { useSession } from '../contexts/SessionContext'
import { Q_CATS } from '../lib/constants'
import { consumeNavPreset } from '../lib/nav'
import { Badge, FilterPills } from '../components/ui/primitives'

const CAT_COLORS = {
  planejamento: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  desejo: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  limite: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  fantasia: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  sentimento: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  combinado: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  outro: 'bg-stone-500/15 text-stone-300 border-stone-500/30',
}

export default function QuestionarioPage() {
  const { user, user2 } = useSession()
  const { data: questions, insert, update, remove } = useScopedDB('questionario', { scope: 'couple' })
  const [activeQ, setActiveQ] = useState(null)
  const [myAnswer, setMyAnswer] = useState('')
  const [addingQ, setAddingQ] = useState(false)
  const [editingQ, setEditingQ] = useState(null)
  const [filterCat, setFilterCat] = useState('planejamento')

  useEffect(() => {
    const p = consumeNavPreset()
    if (p?.questionarioFilter) setFilterCat(p.questionarioFilter)
  }, [])
  const [newQ, setNewQ] = useState({ pergunta: '', categoria: 'desejo', anonimo: false })

  const filtered = filterCat === 'todas' ? questions : questions.filter((q) => q.categoria === filterCat)

  const handleSubmitAnswer = () => {
    if (!myAnswer.trim() || !activeQ) return
    const existing = activeQ.respostas || []
    const answers = [...existing, { texto: myAnswer.trim(), de: user, data: new Date().toISOString() }]
    update(activeQ.id, { respostas: answers })
    setMyAnswer('')
    setActiveQ((prev) => (prev ? { ...prev, respostas: answers } : null))
  }

  const handleAddQ = (e) => {
    e.preventDefault()
    if (!newQ.pergunta.trim()) return
    if (editingQ) {
      update(editingQ.id, { pergunta: newQ.pergunta, categoria: newQ.categoria, anonimo: newQ.anonimo })
      setEditingQ(null)
    } else {
      insert({ ...newQ, respostas: [] })
    }
    setNewQ({ pergunta: '', categoria: 'desejo', anonimo: false })
    setAddingQ(false)
  }

  if (activeQ) {
    const fresh = questions.find((q) => q.id === activeQ.id) || activeQ
    const allAnswers = fresh.respostas || []
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <button type="button" onClick={() => setActiveQ(null)} className="flex items-center gap-2 text-sm text-[var(--color-vl-muted)] hover:text-[var(--color-vl-text)]">
          <ChevronDown className="rotate-90" size={16} /> Voltar
        </button>
        <div className="vl-card">
          <Badge className={CAT_COLORS[fresh.categoria] || CAT_COLORS.outro}>{fresh.categoria}</Badge>
          <h3 className="mt-3 text-lg font-semibold leading-snug">{fresh.pergunta}</h3>
          {fresh.anonimo && <p className="mt-2 flex items-center gap-1 text-xs text-[var(--color-vl-muted)]"><Lock size={10} /> Pergunta anônima</p>}
        </div>
        {allAnswers.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-vl-muted)]">Respostas</p>
            {allAnswers.map((r, i) => (
              <div key={i} className="vl-card">
                <div className="mb-1 flex items-center gap-2">
                  <span className={`text-xs font-semibold ${r.de === user2 ? 'text-rose-300' : 'text-cyan-300'}`}>{r.de || 'Anônimo'}</span>
                  {r.data && <span className="text-xs text-[var(--color-vl-muted)]">{new Date(r.data).toLocaleDateString('pt-BR')}</span>}
                </div>
                <p className="text-sm leading-relaxed">{r.texto}</p>
                <button onClick={() => { const answers = allAnswers.filter((_, idx) => idx !== i); update(fresh.id, { respostas: answers }); setActiveQ({ ...fresh, respostas: answers }) }} className="mt-2 text-xs text-rose-400">Apagar resposta</button>
              </div>
            ))}
          </div>
        )}
        <div className="vl-card space-y-3">
          <p className="text-sm font-medium">Sua resposta ({user})</p>
          <textarea className="vl-input resize-none" rows={3} value={myAnswer} onChange={(e) => setMyAnswer(e.target.value)} placeholder="Escreva aqui..." />
          <button onClick={handleSubmitAnswer} className="vl-btn-primary w-full">Enviar resposta</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
        Perguntas de planejamento respondidas — combinado registrado. Histórico completo em Planejamento e Em aberto.
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills options={['todas', ...Q_CATS]} value={filterCat} onChange={setFilterCat} />
        <button className="vl-btn-primary" onClick={() => { setAddingQ(true); setEditingQ(null) }}><Plus size={16} /> Pergunta</button>
      </div>

      {addingQ && (
        <form onSubmit={handleAddQ} className="vl-card space-y-3">
          <textarea required className="vl-input resize-none" rows={2} placeholder="Nova pergunta..." value={newQ.pergunta} onChange={(e) => setNewQ((p) => ({ ...p, pergunta: e.target.value }))} />
          <div className="flex flex-wrap gap-2">
            {Q_CATS.map((c) => (
              <button key={c} type="button" onClick={() => setNewQ((p) => ({ ...p, categoria: c }))} className={`vl-pill ${newQ.categoria === c ? 'vl-pill-active' : 'vl-pill-inactive'}`}>{c}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={newQ.anonimo} onChange={(e) => setNewQ((p) => ({ ...p, anonimo: e.target.checked }))} />
            Pergunta anônima
          </label>
          <div className="flex gap-2">
            <button type="submit" className="vl-btn-primary flex-1">Salvar</button>
            <button type="button" className="vl-btn-ghost" onClick={() => { setAddingQ(false); setEditingQ(null) }}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-[var(--color-vl-muted)]">Nenhuma pergunta ainda</p>}
        {filtered.map((q) => (
          <button key={q.id} type="button" onClick={() => setActiveQ(q)} className="vl-card w-full text-left transition-all hover:border-fuchsia-500/30">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <Badge className={CAT_COLORS[q.categoria] || CAT_COLORS.outro}>{q.categoria}</Badge>
                <p className="mt-2 font-medium">{q.pergunta}</p>
                <p className="mt-1 text-xs text-[var(--color-vl-muted)]">{(q.respostas || []).length} resposta(s)</p>
              </div>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { setNewQ({ pergunta: q.pergunta, categoria: q.categoria, anonimo: q.anonimo || false }); setEditingQ(q); setAddingQ(true) }} className="vl-btn-icon"><Edit3 size={13} /></button>
                <button onClick={() => { if (confirm('Apagar?')) remove(q.id) }} className="vl-btn-icon hover:text-rose-400"><Trash2 size={13} /></button>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
