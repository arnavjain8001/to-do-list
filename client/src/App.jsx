import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DateNavigation } from './components/DateNavigation';
import { Statistics } from './components/Statistics';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { DeleteModal } from './components/DeleteModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/Toast';

import { useAuth } from './context/AuthContext';
import { taskApi } from './services/api';
import { playCompletionSound } from './services/soundService';
import { getTodayISO } from './utils/dateUtils';
import { Lock } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, completionRate: 0 });
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('todo_theme') === 'dark';
  });

  // Settings state
  const [settings, setSettings] = useState({
    sound_enabled: true,
    default_priority: 'Medium',
    default_time: '',
  });

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toasts state
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Dark Mode side effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('todo_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('todo_theme', 'light');
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Global Keyboard Shortcuts (Press 'N' to open Add Task modal)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        if (!user) {
          setIsAuthModalOpen(true);
          return;
        }
        setTaskToEdit(null);
        setIsTaskModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  // Load Settings
  const loadSettings = async () => {
    if (!user) return;
    try {
      const data = await taskApi.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  // Load Tasks & Stats
  const loadTasksAndStats = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setStats({ total: 0, completed: 0, pending: 0, completionRate: 0 });
      return;
    }

    try {
      setLoading(true);
      const [tasksData, statsData] = await Promise.all([
        taskApi.getTasks({
          date: selectedDate,
          search,
          status: statusFilter,
          priority: priorityFilter,
          category: categoryFilter,
          sortBy,
        }),
        taskApi.getStats(selectedDate),
      ]);

      setTasks(tasksData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedDate, search, statusFilter, priorityFilter, categoryFilter, sortBy]);

  useEffect(() => {
    if (user) {
      loadSettings();
      loadTasksAndStats();
    }
  }, [user, loadTasksAndStats]);

  // Prompt auth modal if unauthenticated and finished initial auth check
  useEffect(() => {
    if (!authLoading && !user) {
      setIsAuthModalOpen(true);
    } else {
      setIsAuthModalOpen(false);
    }
  }, [authLoading, user]);

  // Toggle Complete
  const handleToggleComplete = async (id, completed) => {
    try {
      await taskApi.toggleComplete(id, completed);
      if (completed) {
        playCompletionSound(settings.sound_enabled);
        addToast('Task completed ✓', 'success');
      } else {
        addToast('Task marked incomplete', 'info');
      }
      loadTasksAndStats();
    } catch (err) {
      addToast('Failed to update task', 'error');
    }
  };

  // Add / Edit Task
  const handleOpenAddTask = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        await taskApi.updateTask(taskData.id, taskData);
        addToast('Task updated successfully', 'success');
      } else {
        await taskApi.createTask(taskData);
        addToast('Task added successfully', 'success');
      }
      setIsTaskModalOpen(false);
      loadTasksAndStats();
    } catch (err) {
      addToast('Failed to save task', 'error');
    }
  };

  // Delete Task
  const handleOpenDelete = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await taskApi.deleteTask(taskToDelete.id);
      addToast('Task deleted', 'info');
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      loadTasksAndStats();
    } catch (err) {
      addToast('Failed to delete task', 'error');
    }
  };

  // Clear Completed Tasks
  const handleClearCompleted = async () => {
    if (!window.confirm('Are you sure you want to clear all completed tasks for this date?')) return;
    try {
      const res = await taskApi.clearCompleted(selectedDate);
      addToast(res.message || 'Cleared completed tasks', 'info');
      loadTasksAndStats();
    } catch (err) {
      addToast('Failed to clear completed tasks', 'error');
    }
  };

  // Export Tasks JSON
  const handleExportData = async () => {
    try {
      const allTasks = await taskApi.exportTasks();
      const blob = new Blob([JSON.stringify(allTasks, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `todo_tasks_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('Tasks backup downloaded!', 'success');
    } catch (err) {
      addToast('Failed to export tasks', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (newSettings) => {
    try {
      const updated = await taskApi.updateSettings(newSettings);
      setSettings(updated);
      setIsSettingsModalOpen(false);
      addToast('Settings updated', 'success');
    } catch (err) {
      addToast('Failed to update settings', 'error');
    }
  };

  return (
    <div className="app-container">
      <Header
        selectedDate={selectedDate}
        search={search}
        onSearchChange={setSearch}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main>
        <DateNavigation
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onOpenAddTask={handleOpenAddTask}
        />

        {user ? (
          <>
            <Statistics stats={stats} />

            <TaskFilters
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              sortBy={sortBy}
              onSortByChange={setSortBy}
            />

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-tertiary)' }}>
                Loading your tasks...
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                statusFilter={statusFilter}
                onToggleComplete={handleToggleComplete}
                onEdit={handleOpenEditTask}
                onDelete={handleOpenDelete}
                onOpenAddTask={handleOpenAddTask}
                onClearCompleted={handleClearCompleted}
              />
            )}
          </>
        ) : (
          <div style={{
            margin: '3rem auto',
            maxWidth: '500px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            padding: '3rem 2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <Lock size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Sign In Required
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Please sign in or create an account to view and manage your personal to-do list safely across devices.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-primary"
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              Sign In / Register
            </button>
          </div>
        )}
      </main>

      {/* Modals & Toasts */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => addToast('Successfully authenticated!', 'success')}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        selectedDate={selectedDate}
        defaultPriority={settings.default_priority}
        defaultTime={settings.default_time}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        taskToDelete={taskToDelete}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onExportData={handleExportData}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}
