import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { fmt, CATEGORIES, MONTHS_PT } from '../lib/utils'
import { format, subMonths } from 'date-fns'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line
} from 'recharts'
import { BarChart2 } from 'lucide-react'

export default function ReportsPage() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const months = Array.from({ length: 6 }, (_, i) =>
      format(subMonths(new Date(), 5 - i), 'yyyy-MM')
    )
    Promise.all(months.map(month =>
      supabase.from('transactions').select('*').eq('user_id', user.id).eq('month', month)
        .then(({ data: rows }) => {
          const income = (rows || []).filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
          const expense = (rows || []).filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
          const wife = (rows || []).filter(t => t.category === 'wife').reduce((s, t) => s + Number(t.amount), 0)
          const savings = (rows || []).filter(t => t.category === 'savings').reduce((s, t) => s + Number(t.amount), 0)
          const [y, m] = month.split('-')
          return { month: MONTHS_PT[parseInt(m) - 1].slice(0, 3), income, expense, wife, savings, balance: income - expense }
        })
    )).then(results => { setData(results); setLoading(false) })
  }, [user])

  const lastMonth = data[data.length - 1]

  if (loading) return <div className="flex items-center justify-center h-64 text-ink-300">Carregando...</div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <BarChart2 className="w-5 h-5 text-rose-brand" />
        <h1 className="font-display text-2xl font-bold text-ink-900 italic">Relatórios</h1>
      </div>

      {/* Last month summary */}
      {lastMonth && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Entradas', value: fmt(lastMonth.income), color: 'text-sage-dark' },
            { label: 'Saídas',   value: fmt(lastMonth.expense), color: 'text-rose-brand' },
            { label: 'Saldo',    value: fmt(lastMonth.balance), color: lastMonth.balance >= 0 ? 'text-sage-dark' : 'text-rose-dark' },
            { label: 'Mimos',    value: fmt(lastMonth.wife), color: 'text-purple-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center">
              <p className="stat-label">{label} (mês atual)</p>
              <p className={`text-lg font-semibold font-display ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bar chart: Income vs Expenses */}
      <div className="card mb-5">
        <h2 className="font-medium text-ink-700 mb-4 text-sm">Entradas vs Saídas — últimos 6 meses</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#A8A29E' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => fmt(v)} labelStyle={{ fontWeight: 500 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="income" name="Entradas" fill="#6B8F71" radius={[4,4,0,0]} />
            <Bar dataKey="expense" name="Saídas" fill="#C8707A" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line chart: Balance */}
      <div className="card mb-5">
        <h2 className="font-medium text-ink-700 mb-4 text-sm">Evolução do saldo mensal</h2>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#A8A29E' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => fmt(v)} />
            <Line type="monotone" dataKey="balance" name="Saldo" stroke="#C8707A" strokeWidth={2}
              dot={{ fill: '#C8707A', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Wife & Savings trend */}
      <div className="card">
        <h2 className="font-medium text-ink-700 mb-4 text-sm">Mimos da esposa & Poupança</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#A8A29E' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => fmt(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="wife" name="Mimos" fill="#D4537E" radius={[4,4,0,0]} />
            <Bar dataKey="savings" name="Poupança" fill="#4A8FB5" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
