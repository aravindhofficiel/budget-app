import { Check, Trash2, Clock } from 'lucide-react'

export default function HabitCard({ habit, onToggle, onDelete }) {
  const isCompleted = habit.completed
  
  return (
    <div className={`card habit-card ${isCompleted ? 'completed' : ''}`}>
      <div className="card-header">
        <div className="habit-info">
          <h3 className="habit-name">{habit.name}</h3>
          {habit.description && (
            <p className="habit-description">{habit.description}</p>
          )}
        </div>
        <button
          className={`toggle-btn ${isCompleted ? 'active' : ''}`}
          onClick={() => onToggle(habit.id)}
          title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        >
          <Check className="w-5 h-5" />
        </button>
      </div>
      
      <div className="card-footer">
        <div className="card-meta">
          <Clock className="w-3 h-3" />
          <span>{habit.streak} day streak</span>
        </div>
        <button
          className="delete-btn"
          onClick={() => onDelete(habit.id)}
          title="Delete habit"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
