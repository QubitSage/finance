import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { format } from 'date-fns'

export function useTransactions(month) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const currentMonth = month || format(new Date(), 'yyyy-MM')

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .order('created_at', { ascending: false })
    setTransactions(data || [])
    setLoading(false)
  }, [user, currentMonth])

  useEffect(() => { fetch() }, [fetch])

  const add = async (tx) => {
    const { data, error } = await supabase.from('transactions').insert([{
      ...tx,
      user_id: user.id,
      month: currentMonth,
      date: tx.date || format(new Date(), 'yyyy-MM-dd'),
    }]).select().single()
    if (!error) setTransactions(prev => [data, ...prev])
    return { data, error }
  }

  const remove = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) setTransactions(prev => prev.filter(t => t.id !== id))
    return { error }
  }

  const update = async (id, updates) => {
    const { data, error } = await supabase
      .from('transactions').update(updates).eq('id', id).select().single()
    if (!error) setTransactions(prev => prev.map(t => t.id === id ? data : t))
    return { data, error }
  }

  const income = transactions.filter(t => t.type === 'income')
  const expenses = transactions.filter(t => t.type === 'expense')
  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0)
  const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0)
  const balance = totalIncome - totalExpenses
  const wifeSpendings = expenses.filter(t => t.category === 'wife').reduce((s, t) => s + Number(t.amount), 0)
  const savings = expenses.filter(t => t.category === 'savings').reduce((s, t) => s + Number(t.amount), 0)

  return {
    transactions, loading, add, remove, update, refetch: fetch,
    income, expenses, totalIncome, totalExpenses, balance, wifeSpendings, savings,
  }
}
