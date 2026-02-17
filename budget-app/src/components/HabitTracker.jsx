import { useState, useEffect } from 'react'
import { Plus, X, RefreshCw } from 'lucide-react'
import HabitCard from './HabitCard'

const STORAGE_KEY = 'habits'

export default function HabitTracker() {
  const [habits, setHabits] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setHabits(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse habits')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
  }, [habits])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    const newHabit = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      completed: false,
      streak: 0,
      createdAt: new Date().toISOString()
    }

    setHabits([newHabit, ...habits])
    setFormData({ name: '', description: '' })
    setIsModalOpen(false)
  }

  const toggleHabit = (id) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        const newCompleted = !h.completed
        return {
          ...h,
          completed: newCompleted,
          streak: newCompleted ? h.streak + 1 : Math.max(0, h.streak - 1)
        }
      }
      return h
    }))
  }

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id))
  }

  const resetAll = () => {
    setHabits(habits.map(h => ({ ...h, completed: false, streak: 0 })))
  }

  const completedCount = habits.filter(h => h.completed).length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Habit Tracker</h1>
          <p className="page-subtitle">Build better habits, one day at a time</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={resetAll}>
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Habit
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{habits.length}</span>
          <span className="stat-label">Total Habits</span>
        </div>
        <div className="stat-card completed">
          <span className="stat-value">{completedCount}</span>
          <span className="stat-label">Completed Today</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-value">{habits.length - completedCount}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>

      {habits.length > 0 ? (
        <div className="card-grid">
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={toggleHabit}
              onDelete={deleteHabit}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No habits yet</h3>
          <p>Start building better habits by adding your first one!</p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Your First Habit
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Habit</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Habit Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Exercise for 30 minutes"
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add more details about this habit..."
                  rows={3}
                />
              </div>
              <button type="submit" className="btn btn-primary full-width">
                <Plus className="w-4 h-4" />
                Add Habit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
