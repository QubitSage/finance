import { useState } from 'react'
import { useDB } from '../hooks/useDB'
import { X, Zap, Sparkles, Forward } from 'lucide-react'

// Modal que pergunta qual ação pontuar quando uma Saída/Mimo é marcada como Realizada.
// Props:
//   pending: { type: 'saida'|'mimo', item: { id, titulo|title } }
//   onClose: chamado pra fechar sem fazer nada (cancelar)
//   onComplete: async (acao?) => deve atualizar o status do item e (opcionalmente) inserir evento de pontos
export default function RealizarPicker({ pending, onClose, onComplete }) {
  const { data: acoes } = useDB('recompensas_acoes', { order: 'ordem', asc: true })
  const acoesAtivas = acoes.filter(a => a.ativo !== false)
  const [submitting, setSubmitting] = useState(false)

  if (!pending) return null
  const title = pending.item?.titulo || pending.item?.title || 'Item'
  const kind = pending.type === 'saida' ? 'Saída' : 'Mimo'

  const pick = async (acao) => {
    setSubmitting(true)
    await onComplete(acao)
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-stone-800 dark:text-stone-100">Marcar como realizada</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18}/></button>
        </div>
        <p className="text-xs text-stone-500 mb-4">
          {kind}: <span className="font-medium text-stone-700 dark:text-stone-200">{title}</span>
        </p>

        {acoesAtivas.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-sm text-stone-400">Nenhuma ação de pontuação cadastrada.</p>
            <p className="text-xs text-stone-400">Vai em Recompensas → Ações pra criar.</p>
            <button onClick={() => pick(null)} disabled={submitting}
              className="mt-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-sm font-medium hover:bg-stone-200 disabled:opacity-60">
              Marcar realizada sem pontuar
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-stone-400 font-medium mb-2 uppercase tracking-wider">Pontuar como</p>
            <div className="space-y-2 max-h-72 overflow-y-auto mb-3">
              {acoesAtivas.map(a => (
                <button
                  key={a.id}
                  onClick={() => pick(a)}
                  disabled={submitting}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-stone-200 dark:border-stone-700 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all text-left disabled:opacity-60"
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="flex-1 text-sm font-medium text-stone-700 dark:text-stone-200">{a.nome}</span>
                  <span className="text-rose-500 font-bold flex items-center gap-1">
                    <Zap size={12}/> +{a.pontos}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => pick(null)}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-stone-300 dark:border-stone-600 text-xs text-stone-500 hover:text-stone-700 hover:border-stone-400 transition-colors disabled:opacity-60"
            >
              <Forward size={12}/> Marcar realizada sem pontuar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
