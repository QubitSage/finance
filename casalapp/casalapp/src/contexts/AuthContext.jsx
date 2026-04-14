import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [coupleId, setCoupleId] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadCoupleId = async (userId) => {
    if (!userId) { setCoupleId(null); return }
    const { data } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', userId)
      .single()
    setCoupleId(data?.couple_id ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      loadCoupleId(session?.user?.id ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      loadCoupleId(session?.user?.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{
      user, coupleId, loading,
      signIn: (e, p) => supabase.auth.signInWithPassword({ email: e, password: p }),
      signUp: (e, p) => supabase.auth.signUp({ email: e, password: p }),
      signOut: () => supabase.auth.signOut(),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
