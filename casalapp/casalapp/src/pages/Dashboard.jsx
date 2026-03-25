import { useDB } from '../hooks/useDB'
import { useSettings } from '../hooks/useSettings'
import { fmt, monthLabel, monthKey, TX_CATEGORIES } from '../lib/utils'
import { format, subMonths, addMonths } from 'date-fns'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Heart, Sparkles, PiggyBank } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import PageHeader from '../components/PageHeader'

export default function Dashboard() {
  const [month, setMonth] = useState(monthKey())
  const { settings } = useSettings()
  const { data: txs } = useDB('transactions', { filter: { month } })

  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0)
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0)
  const balance = income - expense
  const wifeShare = income * ((settings?.wife_percentage || 30) / 100)
  const wifeSpent = txs.filter(t => t.type === 'expense' && t.category === 'wife').reduce((s, t) => s + +t.amount, 0)
  const savings = txs.filter(t => t.type === 'expense' && t.category === 'savings').reduce((s, t) => s + +t.amount, 0)

  const pieData = Object.entries(TX_CATEGORIES).map(([k, cat]) => ({
    name: cat.label,
    value: txs.filter(t => t.type === 'expense' && t.category === k).reduce((s, t) => s + +t.amount, 0),
    color: cat.color,
  })).filter(d => d.value > 0)

  const stats = [
    { label: 'Entradas', value: fmt(income), icon: TrendingUp, color: 'text-sage-500', bg: 'bg-sage-50' },
    { label: 'Saídas', value: fmt(expense), icon: TrendingDown, color: 'text-blush-500', bg: 'bg-blush-50' },
    { label: 'Saldo', value: fmt(balance), icon: Wallet, color: balance >= 0 ? 'text-sage-600' : 'text-blush-600', bg: balance >= 0 ? 'bg-sage-50' : 'bg-blush-50' },
    { label: `${settings?.wife_percentage || 30}% da esposa`, value: fmt(wifeShare), icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
    { label: 'Mimos gastos', value: fmt(wifeSpent), icon: Sparkles, color: 'text-violet-500', bg: 'bg-violet-50' },
    { label: 'Poupança', value: fmt(savings), icon: PiggyBank, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const prevMonth = () => setMonth(monthKey(subMonths(new Date(month + '-01'), 1)))
  const nextMonth = () => setMonth(monthKey(addMonths(new Date(month + '-01'), 1)))

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <PageHeader title="Dashboard" subtitle={`${monthLabel(month)} · ${settings?.couple_name || 'Nosso Casal'}`} />

      {/* Month nav */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={prevMonth} className="btn-icon"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-medium text-stone-600 min-w-[140px] text-center">{monthLabel(month)}</span>
        <button onClick={nextMonth} className="btn-icon"><ChevronRight className="w-4 h-4" /></button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.8} />
            </div>
            <p className="stat-label">{label}</p>
            <p className="text-xl font-semibold font-display text-stone-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Pie */}
      {pieData.length > 0 ? (
        <div className="card">
          <h2 className="font-medium text-stone-700 text-sm mb-4">Saídas por categoria</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 min-w-[180px]">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-stone-500 flex-1">{d.name}</span>
                  <span className="font-medium text-stone-700">{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-10">
          <p className="text-stone-300 text-sm">Nenhuma transação este mês ainda.</p>
        </div>
      )}
    </div>
  )
}
