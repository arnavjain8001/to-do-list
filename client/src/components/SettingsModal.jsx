import React, { useState, useEffect } from 'react';
import { Settings, X, Volume2, VolumeX, Download } from 'lucide-react';

export function SettingsModal({ isOpen, onClose, settings, onSaveSettings, onExportData }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [defaultPriority, setDefaultPriority] = useState('Medium');
  const [defaultTime, setDefaultTime] = useState('');

  useEffect(() => {
    if (settings) {
      setSoundEnabled(settings.sound_enabled ?? true);
      setDefaultPriority(settings.default_priority || 'Medium');
      setDefaultTime(settings.default_time || '');
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      sound_enabled: soundEnabled,
      default_priority: defaultPriority,
      default_time: defaultTime
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={20} style={{ color: 'var(--primary)' }} />
            <h2>Preferences & Settings</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <div>
                <label className="form-label" style={{ marginBottom: 0 }}>Completion Sound</label>
                <div style={{ fontSize: '0.785rem', color: 'var(--text-tertiary)' }}>
                  Play audio chime when a task is completed
                </div>
              </div>
              <button
                type="button"
                className={`btn-secondary ${soundEnabled ? 'active' : ''}`}
                style={{ padding: '0.4rem 0.8rem', background: soundEnabled ? 'var(--primary-light)' : 'var(--bg-subtle)', color: soundEnabled ? 'var(--primary)' : 'var(--text-secondary)' }}
                onClick={() => setSoundEnabled(!soundEnabled)}
                id="btn-toggle-sound"
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>{soundEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }} />

            <div className="form-group">
              <label className="form-label">Default Task Priority</label>
              <select
                className="form-select"
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value)}
                id="select-default-priority"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Default Task Time (Optional)</label>
              <input
                type="time"
                className="form-input"
                value={defaultTime}
                onChange={(e) => setDefaultTime(e.target.value)}
                id="input-default-time"
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

            <div className="form-group">
              <label className="form-label">Data Backup</label>
              <button
                type="button"
                className="btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                onClick={onExportData}
                id="btn-export-json"
              >
                <Download size={16} />
                <span>Export Tasks (JSON Backup)</span>
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" id="btn-save-settings">
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
