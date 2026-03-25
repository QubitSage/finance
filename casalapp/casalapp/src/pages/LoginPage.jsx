import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Heart } from 'lucide-react'

const toEmail = (username) => {
      if (username.includes('@')) return username
      return `${username.trim().toLowerCase()}@casal.app`
}

export default function LoginPage() {
      const { signIn, signUp } = useAuth()
      const [mode, setMode] = useState('login')
      const [username, setUsername] = useState('')
      const [password, setPassword] = useState('')
      const [error, setError] = useState('')
      const [loading, setLoading] = useState(false)
      const [success, setSuccess] = useState('')

  const handle = async (e) => {
          e.preventDefault()
          setError(''); setSuccess(''); setLoading(true)
          const email = toEmail(username)
          const { error: err } = await (mode === 'login' ? signIn : signUp)(email, password)
          setLoading(false)
          if (err) { setError(err.message); return }
          if (mode === 'register') setSuccess('Conta criada com sucesso!')
  }

  return (
          <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-100 rounded-full opacity-20 blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blush-100 rounded-full opacity-20 blur-3xl" />
                </div>
                <div className="relative w-full max-w-sm">
                        <div className="text-center mb-10">
                                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 mb-5 shadow-warm">
                                              <Heart className="w-6 h-6 text-amber-500 fill-amber-200" strokeWidth={1.5} />
                                  </div>
                                  <h1 className="font-display text-4xl font-semibold text-stone-800 italic">Casal App</h1>
                                  <p className="text-sm text-stone-400 mt-2 font-sans">Tudo do casal, num só lugar.</p>
                        </div>
                        <div className="card">
                                  <div className="flex bg-stone-50 rounded-xl p-1 mb-6 border border-stone-100">
                                      {['login','register'].map(m => (
                            <button key={m} onClick={() => setMode(m)}
                                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                                                                      mode === m ? 'bg-white text-stone-800 shadow-warm' : 'text-stone-400 hover:text-stone-600'
                                                }`}>
                                {m === 'login' ? 'Entrar' : 'Criar conta'}
                            </button>
                          ))}
                                  </div>
                                  <form onSubmit={handle} className="flex flex-col gap-4">
                                              <div>
                                                            <label className="label">Usuário</label>
                                                            <input className="input" type="text" placeholder="seu_usuario"
                                                                                value={username} onChange={e => setUsername(e.target.value)}
                                                                                required autoComplete="username" />
                                              </div>
                                              <div>
                                                            <label className="label">Senha</label>
                                                            <input className="input" type="password" placeholder="••••••••"
                                                                                value={password} onChange={e => setPassword(e.target.value)} required />
                                              </div>
                                      {error && (
                            <p className="text-xs text-blush-600 bg-blush-50 border border-blush-100 px-3 py-2 rounded-lg">{error}</p>
                                              )}
                                      {success && (
                            <p className="text-xs text-sage-600 bg-sage-50 border border-sage-100 px-3 py-2 rounded-lg">{success}</p>
                                              )}
                                              <button type="submit" className="btn-primary w-full mt-1" disabled={loading}>
                                                  {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
                                              </button>
                                  </form>
                        </div>
                        <p className="text-center text-xs text-stone-300 mt-6">
                                  Seus dados são privados e s
          </p></div>
                </div>
        )
}
