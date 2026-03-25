import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Heart } from 'lucide-react'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handle = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    const fn = mode === 'login' ? signIn : signUp
    const { error: err } = await fn(email, password)
    setLoading(false)
    if (err) { setError(err.message); return }
    if (mode === 'register') setSuccess('Conta criada! Verifique seu e-mail para confirmar.')
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-light mb-4">
            <Heart className="w-7 h-7 text-rose-brand fill-rose-brand" />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-900 italic">Casal Finance</h1>
          <p className="text-sm text-ink-400 mt-1">Finanças do casal, juntos.</p>
        </div>

        <div className="card">
          <div className="flex rounded-xl bg-cream-100 p-1 mb-6">
            {['login','register'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all
                  ${mode === m ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-400 hover:text-ink-600'}`}>
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="flex flex-col gap-4">
            <div>
              <label className="label">E-mail</label>
              <input className="input" type="email" placeholder="voce@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Senha</label>
              <input className="input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            {success && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}

            <button type="submit" className="btn-primary w-full mt-1" disabled={loading}>
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-ink-300 mt-6">Seus dados são privados e seguros ❤️</p>
      </div>
    </div>
  )
}
