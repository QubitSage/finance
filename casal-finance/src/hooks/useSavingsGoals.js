import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useSavingsGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('savings_goals').select('*').eq('user_id', user.id).order('created_at')
      .then(({ data }) => { setGoals(data || []); setLoading(false) })
  }, [user])

  const add = async (goal) => {
    const { data, error } = await supabase.from('savings_goals')
      .insert([{ ...goal, user_id: user.id }]).select().single()
    if (!error) setGoals(prev => [...prev, data])
    return { data, error }
  }

  const update = async (id, updates) => {
    const { data, error } = await supabase.from('savings_goals')
      .update(updates).eq('id', id).select().single()
    if (!error) setGoals(prev => prev.map(g => g.id === id ? data : g))
    return { data, error }
  }

  const remove = async (id) => {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id)
    if (!error) setGoals(prev => prev.filter(g => g.id !== id))
    return { error }
  }

  return { goals, loading, add, update, remove }
}
