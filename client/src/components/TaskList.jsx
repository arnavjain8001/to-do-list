import React from 'react';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import { CheckCircle2, Clock, Trash2 } from 'lucide-react';

export function TaskList({
  tasks,
  statusFilter,
  onToggleComplete,
  onEdit,
  onDelete,
  onOpenAddTask,
  onClearCompleted
}) {
  if (!tasks || tasks.length === 0) {
    return <EmptyState onOpenAddTask={onOpenAddTask} />;
  }

  // If a specific status filter is active ('pending' or 'completed'), show flat list
  if (statusFilter === 'pending' || statusFilter === 'completed') {
    return (
      <div className="task-list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  // Separate tasks into Pending and Completed
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div>
      {/* Pending Tasks Section */}
      <div className="task-section-header">
        <div className="task-section-title">
          <Clock size={16} style={{ color: 'var(--primary)' }} />
          <span>Pending Tasks</span>
          <span className="task-count-badge">{pendingTasks.length}</span>
        </div>
      </div>

      {pendingTasks.length > 0 ? (
        <div className="task-list">
          {pendingTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
          No pending tasks left for this date! 🎉
        </div>
      )}

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <>
          <div className="task-section-header" style={{ marginTop: '2rem', justifyContent: 'space-between' }}>
            <div className="task-section-title">
              <CheckCircle2 size={16} style={{ color: 'var(--success-text)' }} />
              <span>Completed Tasks</span>
              <span className="task-count-badge">{completedTasks.length}</span>
            </div>

            {onClearCompleted && (
              <button
                className="btn-clear-completed"
                onClick={onClearCompleted}
                title="Clear all completed tasks for this date"
                id="btn-clear-completed"
              >
                <Trash2 size={13} />
                <span>Clear Completed</span>
              </button>
            )}
          </div>

          <div className="task-list">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
