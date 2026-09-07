import React from 'react';

export function Statistics({ stats }) {
  const { total = 0, completed = 0, pending = 0, completionRate = 0 } = stats;

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Tasks</span>
          <span className="stat-value">{total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <span className="stat-value" style={{ color: 'var(--success-text)' }}>
            {completed}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-value" style={{ color: 'var(--primary)' }}>
            {pending}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completion</span>
          <span className="stat-value">{completionRate}%</span>
        </div>
      </div>

      <div className="progress-card">
        <div className="progress-header">
          <span className="progress-title">Daily Progress</span>
          <span className="progress-stats">
            {completed} of {total} tasks completed ({completionRate}%)
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </>
  );
}
