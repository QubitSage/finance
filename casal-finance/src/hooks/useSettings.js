import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({ wife_percentage: 30, couple_name: 'Nosso Casal' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('couple_settings').select('*').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) setSettings(data)
        setLoading(false)
      })
  }, [user])

  const save = async (updates) => {
    const merged = { ...settings, ...updates, user_id: user.id }
    const { data, error } = await supabase
      .from('couple_settings')
      .upsert(merged, { onConflict: 'user_id' })
      .select().single()
    if (!error) setSettings(data)
    return { data, error }
  }

  return { settings, loading, save }
}
