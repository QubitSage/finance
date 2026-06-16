import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Lock, KeyRound } from 'lucide-react'
import { useSession } from '../contexts/SessionContext'

const CODE_LENGTH = 6

export default function LoginPage() {
  const { loginWithCode } = useSession()
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef(null)

  const tryLogin = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH)
    setCode(digits)
    setError(false)

    if (digits.length === CODE_LENGTH) {
      const ok = loginWithCode(digits)
      if (!ok) {
        setError(true)
        setCode('')
        inputRef.current?.focus()
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (code.length !== CODE_LENGTH) return
    const ok = loginWithCode(code)
    if (!ok) {
      setError(true)
      setCode('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="bg-gradient-to-r from-fuchsia-300 to-violet-300 bg-clip-text text-3xl font-bold text-transparent">
          Vida Livre
        </h1>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-[var(--color-vl-muted)]">
          <Lock size={14} /> Digite seu código
        </p>
        <p className="mt-1 max-w-sm text-xs text-[var(--color-vl-muted)]">
          Cada um tem o seu. Dados salvos neste dispositivo.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        onSubmit={handleSubmit}
        className="w-full max-w-xs"
      >
        <div
          className={`vl-card-glow relative overflow-hidden border bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-6 transition-colors ${
            error ? 'border-rose-500/50' : 'border-fuchsia-500/30'
          }`}
        >
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300">
              <KeyRound size={22} />
            </div>
          </div>

          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            value={code}
            onChange={(e) => tryLogin(e.target.value)}
            placeholder="••••••"
            className="w-full bg-transparent text-center text-3xl font-bold tracking-[0.35em] text-fuchsia-100 placeholder:text-fuchsia-200/20 focus:outline-none"
            aria-label="Código de acesso"
          />

          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: CODE_LENGTH }).map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i < code.length ? 'bg-fuchsia-400' : 'bg-fuchsia-500/20'
                }`}
              />
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-sm text-rose-300"
            >
              Código incorreto. Tente de novo.
            </motion.p>
          )}

          <button
            type="submit"
            disabled={code.length !== CODE_LENGTH}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            Entrar
          </button>
        </div>
      </motion.form>

      <p className="mt-10 flex items-center gap-1 text-xs text-[var(--color-vl-muted)]">
        <Heart size={12} className="text-rose-400" /> Espaço do casal · privado
      </p>
    </div>
  )
}
