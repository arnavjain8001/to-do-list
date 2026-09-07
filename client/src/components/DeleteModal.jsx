import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function DeleteModal({ isOpen, onClose, onConfirm, taskToDelete }) {
  if (!isOpen || !taskToDelete) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-text)' }}>
            <AlertTriangle size={20} />
            <h2 style={{ color: 'var(--danger-text)' }}>Delete Task</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.925rem', color: 'var(--text-primary)' }}>
            Are you sure you want to delete this task?
          </p>
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-secondary)'
          }}>
            "{taskToDelete.title}"
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            This action cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            style={{ background: 'var(--danger-text)', borderColor: 'var(--danger-text)' }}
            onClick={onConfirm}
            id="btn-confirm-delete"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}
