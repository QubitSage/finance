import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Printer, Download, Image } from 'lucide-react'
import { toPng } from 'html-to-image'
import PlanejamentoPrintCard from './PlanejamentoPrintCard'

export default function PlanejamentoExportModal({ open, onClose, resumo, nome }) {
  const cardRef = useRef(null)
  const [saving, setSaving] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleSavePng = async () => {
    if (!cardRef.current || saving) return
    setSaving(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0c0a12',
      })
      const link = document.createElement('a')
      link.download = `vida-livre-planejamento-${nome || 'casal'}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error(err)
      alert('Não deu para salvar a imagem. Tente Imprimir → Salvar como PDF.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm print:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col print:static print:z-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--color-vl-border)] bg-[var(--color-vl-surface)] px-4 py-3 pt-safe print:hidden">
              <div>
                <p className="font-semibold text-fuchsia-200">Card de planejamento</p>
                <p className="text-xs text-[var(--color-vl-muted)]">Salvar PNG ou imprimir / PDF</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleSavePng} disabled={saving} className="vl-btn-primary text-sm">
                  <Download size={14} /> {saving ? 'Salvando…' : 'Salvar PNG'}
                </button>
                <button type="button" onClick={handlePrint} className="vl-btn-ghost text-sm">
                  <Printer size={14} /> Imprimir
                </button>
                <button type="button" onClick={onClose} className="vl-btn-icon" aria-label="Fechar">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto overscroll-contain p-4 pb-safe print:overflow-visible print:p-0 md:p-8">
              <div ref={cardRef} className="mx-auto print:mx-0">
                <PlanejamentoPrintCard resumo={resumo} nome={nome} />
              </div>
            </div>

            <p className="shrink-0 px-4 pb-4 text-center text-xs text-[var(--color-vl-muted)] print:hidden md:pb-safe">
              <Image size={12} className="mr-1 inline" />
              Dica: Imprimir → &quot;Salvar como PDF&quot; gera arquivo para mandar no WhatsApp
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
