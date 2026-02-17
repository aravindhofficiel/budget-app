import { useState, useEffect } from 'react'
import { Plus, X, Trophy } from 'lucide-react'
import GoalCard from './GoalCard'

const STORAGE_KEY = 'goals'

export default function GoalTracker() {
  const [goals, setGoals] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target: 100,
    targetDate: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setGoals(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse goals')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
  }, [goals])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.target) return

    const newGoal = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      target: parseInt(formData.target),
      current: 0,
      completed: false,
      targetDate: formData.targetDate,
      createdAt: new Date().toISOString()
    }

    setGoals([newGoal, ...goals])
    setFormData({ name: '', description: '', target: 100, targetDate: '' })
    setIsModalOpen(false)
  }

  const toggleGoal = (id) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        const newCompleted = !g.completed
        return {
          ...g,
          completed: newCompleted,
          current: newCompleted ? g.target : g.current
        }
      }
      return g
    }))
  }

  const updateProgress = (id, delta) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        const newCurrent = Math.max(0, Math.min(g.current + delta, g.target))
        return {
          ...g,
          current: newCurrent,
          completed: newCurrent >= g.target
        }
      }
      return g
    }))
  }

  const deleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id))
  }

  const completedCount = goals.filter(g => g.completed).length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Goal Tracker</h1>
          <p className="page-subtitle">Set goals and track your progress</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{goals.length}</span>
          <span className="stat-label">Total Goals</span>
        </div>
        <div className="stat-card completed">
          <span className="stat-value">{completedCount}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-value">{goals.length - completedCount}</span>
          <span className="stat-label">In Progress</span>
        </div>
      </div>

      {goals.length > 0 ? (
        <div className="card-grid">
          {goals.map(goal => (
            <div key={goal.id} className="goal-wrapper">
              <GoalCard
                goal={goal}
                onToggle={toggleGoal}
                onDelete={deleteGoal}
              />
              {!goal.completed && (
                <div className="progress-controls">
                  <button 
                    className="progress-btn minus"
                    onClick={() => updateProgress(goal.id, -10)}
                  >
                    -
                  </button>
                  <span className="progress-label">-10</span>
                  <button 
                    className="progress-btn plus"
                    onClick={() => updateProgress(goal.id, 10)}
                  >
                    +
                  </button>
                  <span className="progress-label">+10</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>No goals yet</h3>
          <p>Set your first goal and start tracking your progress!</p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Set Your First Goal
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Goal</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Read 50 books this year"
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add more details about this goal..."
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Target Value</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.target}
                    onChange={e => setFormData({ ...formData, target: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Target Date (optional)</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary full-width">
                <Plus className="w-4 h-4" />
                Add Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
