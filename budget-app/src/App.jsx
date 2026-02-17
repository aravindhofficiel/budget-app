import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'
import { 
  Plus, Trash2, Download, TrendingUp, TrendingDown, Wallet, 
  Coffee, Car, ShoppingBag, Receipt, Film, Heart, DollarSign, MoreHorizontal,
  X, Filter
} from 'lucide-react'
import Header from './components/Header'
import Footer from './components/Footer'
import HabitTracker from './components/HabitTracker'
import GoalTracker from './components/GoalTracker'

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

function BudgetPage() {
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
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget Tracker</h1>
          <p className="page-subtitle">Track your income and expenses</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={exportCSV}
            className="btn btn-secondary"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card income">
          <div className="stat-icon">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Income</span>
            <span className="stat-value">{formatCurrency(totals.income)}</span>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Expenses</span>
            <span className="stat-value">{formatCurrency(totals.expenses)}</span>
          </div>
        </div>

        <div className={`stat-card ${balance >= 0 ? 'balance-positive' : 'balance-negative'}`}>
          <div className="stat-icon">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Balance</span>
            <span className="stat-value">{formatCurrency(balance)}</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <h2 className="card-title">Expense Breakdown</h2>
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
            <div className="empty-chart">No expense data yet</div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">Monthly Overview</h2>
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
            <div className="empty-chart">No monthly data yet</div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header-row">
          <h2 className="card-title">Transactions</h2>
          <div className="filter-group">
            <Filter className="w-4 h-4" />
            {['all', 'income', 'expense'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`filter-btn ${filter === f ? 'active' : ''} ${f === 'expense' ? 'expense' : ''}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="transaction-list">
            {filteredTransactions.map(transaction => {
              const catInfo = getCategoryInfo(transaction.category, transaction.type)
              const Icon = catInfo.icon
              return (
                <div 
                  key={transaction.id}
                  className="transaction-item"
                >
                  <div className="transaction-info">
                    <div 
                      className="transaction-icon"
                      style={{ backgroundColor: `${catInfo.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: catInfo.color }} />
                    </div>
                    <div>
                      <p className="transaction-desc">{transaction.description}</p>
                      <p className="transaction-meta">{catInfo.name} • {formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="transaction-actions">
                    <span className={`transaction-amount ${transaction.type === 'income' ? 'income' : 'expense'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className="delete-btn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h3>No transactions yet</h3>
            <p>Add your first transaction to start tracking!</p>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Transaction</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="type-toggle">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income', category: 'salary' })}
                  className={`type-btn ${formData.type === 'income' ? 'active' : ''}`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense', category: 'food' })}
                  className={`type-btn expense ${formData.type === 'expense' ? 'active' : ''}`}
                >
                  <TrendingDown className="w-4 h-4" />
                  Expense
                </button>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What was this for?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="amount-input"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {(formData.type === 'income' ? CATEGORIES.income : CATEGORIES.expense).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary full-width">
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<BudgetPage />} />
            <Route path="/habits" element={<HabitTracker />} />
            <Route path="/goals" element={<GoalTracker />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
