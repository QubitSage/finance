import { useState } from 'react'
import { useDB } from '../hooks/useDB'
import { X, Zap, Forward, Trophy, ArrowLeft } from 'lucide-react'

// Modal de 2 passos pra pontuar quando uma Saída/Mimo é marcada como Realizada:
//  1. Pra qual recompensa adicionar pontos?
//  2. Qual requisito (ação) foi feito?
// Props:
//   pending: { type, item }
//   onClose: cancela
//   onComplete: async (recompensa?, requisito?) => Promise<void>
//     - se recompensa/requisito = null, marca como realizado sem pontuar
export default function RealizarPicker({ pending, onClose, onComplete }) {
  const { data: premios } = useDB('recompensas_premios', { order: 'ordem', asc: true })
  const { data: requisitos } = useDB('recompensas_acoes', { order: 'ordem', asc: true })
  const premiosAtivos = premios.filter(p => !p.arquivado)
  const requisitosAtivos = requisitos.filter(r => r.ativo !== false)
  const [step, setStep] = useState(1)
  const [picked, setPicked] = useState(null) // recompensa escolhida
  const [submitting, setSubmitting] = useState(false)

  if (!pending) return null
  const title = pending.item?.titulo || pending.item?.title || 'Item'
  const kind = pending.type === 'saida' ? 'Saída' : 'Mimo'

  const finalizar = async (recompensa, requisito) => {
    setSubmitting(true)
    await onComplete(recompensa, requisito)
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-xl p-5" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button onClick={() => { setStep(1); setPicked(null) }} className="text-stone-400 hover:text-stone-600" title="Voltar">
                <ArrowLeft size={16}/>
              </button>
            )}
            <h3 className="font-bold text-stone-800 dark:text-stone-100">
              {step === 1 ? 'Pra qual recompensa?' : 'Qual requisito?'}
            </h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18}/></button>
        </div>
        <p className="text-xs text-stone-500 mb-4">
          {kind}: <span className="font-medium text-stone-700 dark:text-stone-200">{title}</span>
        </p>

        {/* Passo 1 — escolher recompensa */}
        {step === 1 && (
          <>
            {premiosAtivos.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <Trophy size={36} className="mx-auto text-stone-300"/>
                <p className="text-sm text-stone-400">Nenhuma recompensa ativa.</p>
                <p className="text-xs text-stone-400">Cria uma na página Recompensas pra começar a pontuar.</p>
                <button onClick={() => finalizar(null, null)} disabled={submitting}
                  className="mt-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-sm font-medium hover:bg-stone-200 disabled:opacity-60">
                  Marcar realizada sem pontuar
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-72 overflow-y-auto mb-3">
                  {premiosAtivos.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setPicked(p); setStep(2) }}
                      disabled={submitting}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-stone-200 dark:border-stone-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all text-left disabled:opacity-60"
                    >
                      <span className="text-2xl">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-700 dark:text-stone-200 truncate">{p.nome}</p>
                        <p className="text-xs text-stone-400 flex items-center gap-0.5">
                          <Zap size={9}/> {p.custo} pra resgatar
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => finalizar(null, null)}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-stone-300 dark:border-stone-600 text-xs text-stone-500 hover:text-stone-700 hover:border-stone-400 transition-colors disabled:opacity-60"
                >
                  <Forward size={12}/> Marcar realizada sem pontuar
                </button>
              </>
            )}
          </>
        )}

        {/* Passo 2 — escolher requisito */}
        {step === 2 && picked && (
          <>
            <div className="mb-3 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center gap-2 text-sm">
              <span className="text-xl">{picked.emoji}</span>
              <span className="font-medium text-stone-700 dark:text-stone-200 flex-1 truncate">{picked.nome}</span>
              <span className="text-amber-700 dark:text-amber-300 text-xs">+pontos</span>
            </div>
            {requisitosAtivos.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-sm text-stone-400">Nenhum requisito cadastrado.</p>
                <p className="text-xs text-stone-400">Vai em Recompensas → Requisitos pra criar.</p>
                <button onClick={() => finalizar(null, null)} disabled={submitting}
                  className="mt-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-sm font-medium disabled:opacity-60">
                  Marcar realizada sem pontuar
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {requisitosAtivos.map(r => (
                  <button
                    key={r.id}
                    onClick={() => finalizar(picked, r)}
                    disabled={submitting}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-stone-200 dark:border-stone-700 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all text-left disabled:opacity-60"
                  >
                    <span className="text-2xl">{r.emoji}</span>
                    <span className="flex-1 text-sm font-medium text-stone-700 dark:text-stone-200">{r.nome}</span>
                    <span className="text-rose-500 font-bold flex items-center gap-1">
                      <Zap size={12}/> +{r.pontos}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
