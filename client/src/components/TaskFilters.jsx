import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export function TaskFilters({
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  categoryFilter = 'all',
  onCategoryFilterChange,
  sortBy,
  onSortByChange
}) {
  return (
    <div className="filters-bar">
      <div className="filter-pills">
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', marginRight: '0.25rem' }}>
          Status:
        </span>
        <button
          className={`pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => onStatusFilterChange('all')}
        >
          All
        </button>
        <button
          className={`pill-btn ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => onStatusFilterChange('pending')}
        >
          Pending
        </button>
        <button
          className={`pill-btn ${statusFilter === 'completed' ? 'active' : ''}`}
          onClick={() => onStatusFilterChange('completed')}
        >
          Completed
        </button>

        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', margin: '0 0.25rem 0 0.5rem' }}>
          Priority:
        </span>
        <button
          className={`pill-btn ${priorityFilter === 'all' ? 'active' : ''}`}
          onClick={() => onPriorityFilterChange('all')}
        >
          All
        </button>
        <button
          className={`pill-btn ${priorityFilter === 'High' ? 'active' : ''}`}
          onClick={() => onPriorityFilterChange('High')}
        >
          High
        </button>
        <button
          className={`pill-btn ${priorityFilter === 'Medium' ? 'active' : ''}`}
          onClick={() => onPriorityFilterChange('Medium')}
        >
          Medium
        </button>
        <button
          className={`pill-btn ${priorityFilter === 'Low' ? 'active' : ''}`}
          onClick={() => onPriorityFilterChange('Low')}
        >
          Low
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div className="sort-select-wrapper">
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', marginRight: '0.2rem' }}>
            Category:
          </span>
          <select
            className="sort-select"
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            id="select-category-filter"
          >
            <option value="all">All Categories</option>
            <option value="Study">Study</option>
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
            <option value="Project">Project</option>
            <option value="Health">Health</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="sort-select-wrapper">
          <ArrowUpDown size={14} style={{ color: 'var(--text-tertiary)' }} />
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            id="select-sort-by"
          >
            <option value="created">Sort by Date Created</option>
            <option value="time">Sort by Time</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>
      </div>
    </div>
  );
}
