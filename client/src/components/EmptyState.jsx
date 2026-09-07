import React from 'react';
import { CalendarX, Plus } from 'lucide-react';

export function EmptyState({ onOpenAddTask, message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <CalendarX size={28} />
      </div>
      <div className="empty-title">
        {message || 'No tasks for this day'}
      </div>
      <div className="empty-sub">
        You're all clear! Add a new task to stay organized and keep track of your progress.
      </div>
      <button className="btn-primary" onClick={onOpenAddTask} style={{ marginTop: '0.5rem' }}>
        <Plus size={16} />
        <span>Add Task</span>
      </button>
    </div>
  );
}
