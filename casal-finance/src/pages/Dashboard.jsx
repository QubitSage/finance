import { useTransactions } from '../hooks/useTransactions'
import { useSettings } from '../hooks/useSettings'
import { fmt, CATEGORIES, monthLabel } from '../lib/utils'
import { format } from 'date-fns'
import { TrendingUp, TrendingDown, Heart, PiggyBank, Wallet, Sparkles } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const PIE_COLORS = ['#C8707A','#6B8F71','#7C6FAF','#D4844A','#4A8FB5']

export default function Dashboard() {
  const month = format(new Date(), 'yyyy-MM')
  const { totalIncome, totalExpenses, balance, wifeSpendings, savings, expenses, loading } = useTransactions(month)
  const { settings } = useSettings()
  const wifeShare = totalIncome * (settings.wife_percentage / 100)

  const pieData = Object.entries(CATEGORIES).map(([key, cat]) => ({
    name: cat.label,
    value: expenses.filter(t => t.category === key).reduce((s, t) => s + Number(t.amount), 0),
  })).filter(d => d.value > 0)

  const stats = [
    { label: 'Total entradas', value: fmt(totalIncome), icon: TrendingUp, color: 'text-sage-brand', bg: 'bg-sage-light' },
    { label: 'Total saídas',   value: fmt(totalExpenses), icon: TrendingDown, color: 'text-rose-brand', bg: 'bg-rose-light' },
    { label: 'Saldo do mês',  value: fmt(balance), icon: Wallet, color: balance >= 0 ? 'text-sage-dark' : 'text-rose-dark', bg: balance >= 0 ? 'bg-sage-light' : 'bg-rose-light' },
    { label: `${settings.wife_percentage}% da esposa`, value: fmt(wifeShare), icon: Heart, color: 'text-rose-brand', bg: 'bg-rose-light' },
    { label: 'Mimos gastos',  value: fmt(wifeSpendings), icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Poupança',      value: fmt(savings), icon: PiggyBank, color: 'text-sage-brand', bg: 'bg-sage-light' },
  ]

  if (loading) return <div className="flex items-center justify-center h-64 text-ink-300">Carregando...</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 italic">Olá! 👋</h1>
        <p className="text-ink-400 text-sm mt-0.5">{monthLabel(month)} · {settings.couple_name}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="stat-label">{label}</p>
            <p className="stat-value text-xl">{value}</p>
          </div>
        ))}
      </div>

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div className="card">
          <h2 className="font-medium text-ink-700 mb-4">Saídas por categoria</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 min-w-[160px]">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-ink-600 flex-1">{d.name}</span>
                  <span className="font-medium text-ink-800">{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {pieData.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-ink-300 text-sm">Nenhuma transação este mês ainda.</p>
          <p className="text-ink-300 text-xs mt-1">Vá em "Entradas e Saídas" para adicionar.</p>
        </div>
      )}
    </div>
  )
}
