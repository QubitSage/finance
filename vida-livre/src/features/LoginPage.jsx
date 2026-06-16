import { motion } from 'framer-motion'
import { Heart, Lock, User } from 'lucide-react'
import { useSession } from '../contexts/SessionContext'

export default function LoginPage() {
  const { user1, user2, login } = useSession()

  const profiles = [
    {
      name: user2,
      role: 'Ela',
      desc: 'Seu espaço privado — agenda, mimos, marcos e conquistas',
      gradient: 'from-rose-500/30 to-fuchsia-500/30',
      border: 'border-fuchsia-500/40 hover:border-fuchsia-400',
      emoji: '🌸',
    },
    {
      name: user1,
      role: 'Parceiro',
      desc: 'Aprovar mimos, registrar marcos, regras e visão do casal',
      gradient: 'from-cyan-500/20 to-violet-500/20',
      border: 'border-violet-500/40 hover:border-violet-400',
      emoji: '💑',
    },
  ]

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
          <Lock size={14} /> Quem está entrando?
        </p>
        <p className="mt-1 max-w-sm text-xs text-[var(--color-vl-muted)]">
          Cada um vê só o seu espaço. Dados salvos neste dispositivo.
        </p>
      </motion.div>

      <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
        {profiles.map((p, i) => (
          <motion.button
            key={p.name}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => login(p.name)}
            className={`vl-card-glow group text-left transition-all hover:scale-[1.02] ${p.border} bg-gradient-to-br ${p.gradient}`}
          >
            <span className="text-4xl">{p.emoji}</span>
            <p className="mt-3 text-lg font-bold">{p.name}</p>
            <p className="text-xs font-medium text-fuchsia-300/80">{p.role}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-vl-muted)]">{p.desc}</p>
            <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-fuchsia-200 opacity-0 transition-opacity group-hover:opacity-100">
              <User size={12} /> Entrar
            </p>
          </motion.button>
        ))}
      </div>

      <p className="mt-10 flex items-center gap-1 text-xs text-[var(--color-vl-muted)]">
        <Heart size={12} className="text-rose-400" /> Espaço do casal · privado
      </p>
    </div>
  )
}
