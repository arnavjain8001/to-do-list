import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function TaskModal({ isOpen, onClose, onSave, taskToEdit, selectedDate, defaultPriority, defaultTime }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskDate, setTaskDate] = useState(selectedDate || '');
  const [taskTime, setTaskTime] = useState(defaultTime || '');
  const [priority, setPriority] = useState(defaultPriority || 'Medium');
  const [category, setCategory] = useState('Personal');
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setTaskDate(taskToEdit.task_date || selectedDate);
      setTaskTime(taskToEdit.task_time || '');
      setPriority(taskToEdit.priority || 'Medium');
      setCategory(taskToEdit.category || 'Personal');
    } else {
      setTitle('');
      setDescription('');
      setTaskDate(selectedDate);
      setTaskTime(defaultTime || '');
      setPriority(defaultPriority || 'Medium');
      setCategory('Personal');
    }
    setError('');
  }, [taskToEdit, selectedDate, defaultPriority, defaultTime, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }
    if (!taskDate) {
      setError('Please select a task date');
      return;
    }

    onSave({
      id: taskToEdit ? taskToEdit.id : undefined,
      title: title.trim(),
      description: description.trim(),
      task_date: taskDate,
      task_time: taskTime,
      priority,
      category,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{taskToEdit ? 'Edit Task' : 'Add New Task'}</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.6rem', background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Complete Java Arrays Lecture"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                id="input-task-title"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Add extra details, sub-notes, or links..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                id="input-task-desc"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  id="input-task-date"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Time (Optional)</label>
                <input
                  type="time"
                  className="form-input"
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                  id="input-task-time"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  id="select-task-priority"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  id="select-task-category"
                >
                  <option value="Study">Study</option>
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="Project">Project</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" id="btn-save-task">
              {taskToEdit ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
