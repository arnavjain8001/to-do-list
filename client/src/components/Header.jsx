import React from 'react';
import { CheckSquare, Search, Settings, Sun, Moon, X, LogIn, LogOut, User } from 'lucide-react';
import { formatFullDisplayDate } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

export function Header({ selectedDate, search, onSearchChange, onOpenSettings, isDarkMode, onToggleTheme, onOpenAuth }) {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon">
          <CheckSquare size={24} />
        </div>
        <div className="header-title-group">
          <h1>My To-Do</h1>
          <div className="header-date">
            {formatFullDisplayDate(selectedDate)}
          </div>
        </div>
      </div>

      <div className="header-actions">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks or categories..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            id="search-input-field"
          />
          {search && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
              id="btn-clear-search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          className="btn-icon"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onClick={onToggleTheme}
          id="btn-theme-toggle"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className="btn-icon"
          title="App Settings"
          onClick={onOpenSettings}
          id="btn-settings-toggle"
        >
          <Settings size={18} />
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.25rem' }}>
            <div 
              title={user.email}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: '600',
                fontSize: '0.85rem',
                border: '1px solid rgba(79, 70, 229, 0.2)'
              }}
            >
              <User size={14} />
              <span>{user.name || user.email.split('@')[0]}</span>
            </div>
            <button
              className="btn-icon"
              title="Logout"
              onClick={logout}
              id="btn-logout"
              style={{ color: 'var(--danger-text)' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="btn-primary"
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            id="btn-auth-open"
          >
            <LogIn size={16} /> Sign In
          </button>
        )}
      </div>
    </header>
  );
}
