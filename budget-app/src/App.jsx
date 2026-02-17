import { useState, useEffect, useMemo } from 'react'
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'
import { 
  Plus, Trash2, Download, TrendingUp, TrendingDown, Wallet, 
  Coffee, Car, ShoppingBag, Receipt, Film, Heart, DollarSign, MoreHorizontal,
  X, Filter
} from 'lucide-react'

const CATEGORIES = {
  income: [
    { id: 'salary', name: 'Salary', icon: DollarSign, color: '#22c55e' },
    { id: 'freelance', name: 'Freelance', icon: TrendingUp, color: '#10b981' },
    { id: 'investment', name: 'Investment', icon: TrendingUp, color: '#14b8a6' },
    { id: 'other-income', name: 'Other', icon: MoreHorizontal, color: '#6ee7b7' },
  ],
  expense: [
    { id: 'food', name: 'Food', icon: Coffee, color: '#f59e0b' },
    { id: 'transport', name: 'Transport', icon: Car, color: '#3b82f6' },
    { id: 'shopping', name: 'Shopping', icon: ShoppingBag, color: '#ec4899' },
    { id: 'bills', name: 'Bills', icon: Receipt, color: '#ef4444' },
    { id: 'entertainment', name: 'Entertainment', icon: Film, color: '#8b5cf6' },
    { id: 'health', name: 'Health', icon: Heart, color: '#10b981' },
    { id: 'other-expense', name: 'Other', icon: MoreHorizontal, color: '#6b7280' },
  ]
}

const STORAGE_KEY = 'budgetTransactions'

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function App() {
  const [transactions, setTransactions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setTransactions(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved transactions')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  const totals = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'income') {
        acc.income += parseFloat(t.amount)
      } else {
        acc.expenses += parseFloat(t.amount)
      }
      return acc
    }, { income: 0, expenses: 0 })
  }, [transactions])

  const balance = totals.income - totals.expenses

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.type === filter)
    }
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [transactions, filter])

  const categoryData = useMemo(() => {
    const data = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = CATEGORIES.expense.find(c => c.id === t.category)
      const name = cat ? cat.name : 'Other'
      data[name] = (data[name] || 0) + parseFloat(t.amount)
    })
    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [transactions])

  const monthlyData = useMemo(() => {
    const data = {}
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const key = date.toLocaleDateString('en-US', { month: 'short' })
      months.push(key)
      data[key] = { income: 0, expenses: 0 }
    }
    
    transactions.forEach(t => {
      const date = new Date(t.date)
      const key = date.toLocaleDateString('en-US', { month: 'short' })
      if (data[key]) {
        data[key][t.type] += parseFloat(t.amount)
      }
    })
    
    return months.map(month => ({
      month,
      income: data[month].income,
      expenses: data[month].expenses
    }))
  }, [transactions])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.amount || !formData.description) return

    const newTransaction = {
      id: Date.now().toString(),
      ...formData,
      amount: parseFloat(formData.amount)
    }

    setTransactions([newTransaction, ...transactions])
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      category: 'food',
      date: new Date().toISOString().split('T')[0]
    })
    setIsModalOpen(false)
  }

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id))
  }

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount']
    const rows = transactions.map(t => [
      t.date,
      t.type,
      t.category,
      `"${t.description}"`,
      t.amount
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getCategoryInfo = (categoryId, type) => {
    const cats = CATEGORIES[type] || CATEGORIES.expense
    return cats.find(c => c.id === categoryId) || CATEGORIES.expense[6]
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-50">BudgetWise</h1>
              <p className="text-xs text-slate-400">Track your money</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={exportCSV}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="Export CSV"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-slate-400 text-sm">Income</span>
            </div>
            <p className="text-2xl font-bold font-mono text-green-500">
              {formatCurrency(totals.income)}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-slate-400 text-sm">Expenses</span>
            </div>
            <p className="text-2xl font-bold font-mono text-red-500">
              {formatCurrency(totals.expenses)}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                balance >= 0 ? 'bg-amber-500/20' : 'bg-red-500/20'
              }`}>
                <Wallet className={`w-5 h-5 ${balance >= 0 ? 'text-amber-500' : 'text-red-500'}`} />
              </div>
              <span className="text-slate-400 text-sm">Balance</span>
            </div>
            <p className={`text-2xl font-bold font-mono ${balance >= 0 ? 'text-amber-500' : 'text-red-500'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Expense Breakdown</h2>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => {
                      const colors = ['#f59e0b', '#3b82f6', '#ec4899', '#ef4444', '#8b5cf6', '#10b981', '#6b7280']
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-400">
                No expense data yet
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Monthly Overview</h2>
            {monthlyData.some(m => m.income > 0 || m.expenses > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-400">
                No monthly data yet
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold">Transactions</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <div className="flex gap-1">
                {['all', 'income', 'expense'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`toggle-btn ${filter === f ? 'active' : ''} ${f === 'expense' ? 'expense' : ''}`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
              {filteredTransactions.map(transaction => {
                const catInfo = getCategoryInfo(transaction.category, transaction.type)
                const Icon = catInfo.icon
                return (
                  <div 
                    key={transaction.id}
                    className="transaction-item flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${catInfo.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: catInfo.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{transaction.description}</p>
                        <p className="text-sm text-slate-400">{catInfo.name} • {formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono font-semibold ${
                        transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400 mb-4">No transactions yet</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary"
              >
                Add your first transaction
              </button>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add Transaction</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income', category: 'salary' })}
                  className={`toggle-btn flex-1 ${formData.type === 'income' ? 'active' : ''}`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense', category: 'food' })}
                  className={`toggle-btn flex-1 expense ${formData.type === 'expense' ? 'active' : ''}`}
                >
                  <TrendingDown className="w-4 h-4 inline mr-2" />
                  Expense
                </button>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="What was this for?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="input font-mono"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                >
                  {(formData.type === 'income' ? CATEGORIES.income : CATEGORIES.expense).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full mt-6">
                Add Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
