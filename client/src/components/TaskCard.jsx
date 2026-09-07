import React from 'react';
import { Check, Clock, Pencil, Trash2, Tag, AlertCircle, AlertTriangle } from 'lucide-react';
import { formatDisplayTime, getTodayISO } from '../utils/dateUtils';

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }) {
  const { id, title, description, task_date, task_time, priority, category, completed } = task;

  const getPriorityBadgeClass = (p) => {
    switch (p) {
      case 'High':
        return 'badge-priority-high';
      case 'Medium':
        return 'badge-priority-medium';
      case 'Low':
        return 'badge-priority-low';
      default:
        return 'badge-priority-medium';
    }
  };

  const checkIsOverdue = () => {
    if (completed || !task_date) return false;
    const today = getTodayISO();
    if (task_date < today) return true;
    if (task_date === today && task_time) {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      return task_time < currentHHMM;
    }
    return false;
  };

  const isOverdue = checkIsOverdue();

  return (
    <div className={`task-card ${completed ? 'completed' : ''}`}>
      <button
        className={`checkbox-custom ${completed ? 'checked' : ''}`}
        onClick={() => onToggleComplete(id, !completed)}
        title={completed ? 'Mark as incomplete' : 'Mark as completed'}
        id={`checkbox-task-${id}`}
      >
        {completed && <Check size={14} strokeWidth={3} />}
      </button>

      <div className="task-content">
        <div className="task-title">{title}</div>
        
        {description && (
          <div className="task-desc">{description}</div>
        )}

        <div className="task-meta">
          {isOverdue && (
            <span className="badge badge-overdue">
              <AlertTriangle size={11} />
              Overdue
            </span>
          )}

          {category && (
            <span className="badge badge-category">
              <Tag size={11} />
              {category}
            </span>
          )}

          <span className={`badge ${getPriorityBadgeClass(priority)}`}>
            <AlertCircle size={11} />
            {priority} Priority
          </span>

          {task_time && (
            <span className="task-time-text">
              <Clock size={12} />
              {formatDisplayTime(task_time)}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button
          className="action-icon-btn"
          onClick={() => onEdit(task)}
          title="Edit task"
          id={`btn-edit-task-${id}`}
        >
          <Pencil size={15} />
        </button>
        <button
          className="action-icon-btn delete"
          onClick={() => onDelete(task)}
          title="Delete task"
          id={`btn-delete-task-${id}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
