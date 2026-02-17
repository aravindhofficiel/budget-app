import { Trash2, Calendar, Trophy } from 'lucide-react'

export default function GoalCard({ goal, onToggle, onDelete }) {
  const isCompleted = goal.completed
  const progress = Math.min((goal.current / goal.target) * 100, 100)
  
  return (
    <div className={`card goal-card ${isCompleted ? 'completed' : ''}`}>
      <div className="card-header">
        <div className="goal-info">
          <h3 className="goal-name">{goal.name}</h3>
          {goal.description && (
            <p className="goal-description">{goal.description}</p>
          )}
        </div>
        <button
          className={`toggle-btn goal-toggle ${isCompleted ? 'active' : ''}`}
          onClick={() => onToggle(goal.id)}
          title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        >
          <Trophy className="w-5 h-5" />
        </button>
      </div>
      
      <div className="goal-progress-section">
        <div className="progress-header">
          <span className="progress-text">Progress</span>
          <span className="progress-count">{goal.current} / {goal.target}</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className={`progress-bar ${isCompleted ? 'complete' : ''}`}
            style={{ width: `${progress}%` }}
          >
            <div className="progress-glow"></div>
          </div>
        </div>
        <span className="progress-percentage">{Math.round(progress)}%</span>
      </div>
      
      <div className="card-footer">
        <div className="card-meta">
          <Calendar className="w-3 h-3" />
          <span>Target: {goal.targetDate || 'No deadline'}</span>
        </div>
        <button
          className="delete-btn"
          onClick={() => onDelete(goal.id)}
          title="Delete goal"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
