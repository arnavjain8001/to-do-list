import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from './db.js';
import { authenticateToken, JWT_SECRET } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==================== AUTH ROUTES ====================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const db = await getDb();
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword]
    );

    const userId = result.lastID;

    // Migrate any orphan tasks (where user_id is NULL) to this user
    await db.run('UPDATE tasks SET user_id = ? WHERE user_id IS NULL', [userId]);

    // Create default settings for user
    await db.run(
      'INSERT OR IGNORE INTO settings (user_id, sound_enabled, default_priority, default_time) VALUES (?, 1, "Medium", "")',
      [userId]
    );

    const token = jwt.sign(
      { id: userId, name: name.trim(), email: cleanEmail },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: userId, name: name.trim(), email: cleanEmail }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, error: 'Failed to register user' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const db = await getDb();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await db.get('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, error: 'Failed to log in' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// ==================== TASK ROUTES (PROTECTED) ====================

// GET /api/tasks
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { date, search, status, priority, category, sortBy } = req.query;

    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [req.user.id];

    if (date) {
      query += ' AND task_date = ?';
      params.push(date);
    }

    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      query += ' AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (status && status !== 'all') {
      if (status === 'completed') {
        query += ' AND completed = 1';
      } else if (status === 'pending') {
        query += ' AND completed = 0';
      }
    }

    if (priority && priority !== 'all') {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    // Order clause
    if (sortBy === 'time') {
      query += ' ORDER BY CASE WHEN task_time IS NULL OR task_time = "" THEN 1 ELSE 0 END, task_time ASC, id DESC';
    } else if (sortBy === 'priority') {
      query += ` ORDER BY CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END ASC, id DESC`;
    } else {
      // Default: created / ID descending
      query += ' ORDER BY completed ASC, created_at DESC, id DESC';
    }

    const tasks = await db.all(query, params);

    const formattedTasks = tasks.map(t => ({
      ...t,
      completed: Boolean(t.completed)
    }));

    res.json({ success: true, data: formattedTasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
});

// GET /api/tasks/stats
app.get('/api/tasks/stats', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { date } = req.query;
    let query = 'SELECT COUNT(*) as total, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed FROM tasks WHERE user_id = ?';
    const params = [req.user.id];

    if (date) {
      query += ' AND task_date = ?';
      params.push(date);
    }

    const result = await db.get(query, params);
    const total = result ? (result.total || 0) : 0;
    const completed = result ? (result.completed || 0) : 0;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      success: true,
      data: { total, completed, pending, completionRate }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
});

// POST /api/tasks
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { title, description, task_date, task_time, priority, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    if (!task_date) {
      return res.status(400).json({ success: false, error: 'Task date is required' });
    }

    const result = await db.run(
      `INSERT INTO tasks (user_id, title, description, task_date, task_time, priority, category, completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        req.user.id,
        title.trim(),
        description ? description.trim() : '',
        task_date,
        task_time || '',
        priority || 'Medium',
        category || 'Personal'
      ]
    );

    const newTask = await db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [result.lastID, req.user.id]);
    res.status(201).json({
      success: true,
      data: { ...newTask, completed: Boolean(newTask.completed) }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { title, description, task_date, task_time, priority, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    if (!task_date) {
      return res.status(400).json({ success: false, error: 'Task date is required' });
    }

    const result = await db.run(
      `UPDATE tasks
       SET title = ?, description = ?, task_date = ?, task_time = ?, priority = ?, category = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        title.trim(),
        description ? description.trim() : '',
        task_date,
        task_time || '',
        priority || 'Medium',
        category || 'Personal',
        id,
        req.user.id
      ]
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Task not found or unauthorized' });
    }

    const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({
      success: true,
      data: { ...updatedTask, completed: Boolean(updatedTask.completed) }
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
});

// PATCH /api/tasks/:id/complete
app.patch('/api/tasks/:id/complete', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { completed } = req.body;

    const isCompleted = completed ? 1 : 0;
    const completedAt = isCompleted ? new Date().toISOString() : null;

    const result = await db.run(
      `UPDATE tasks
       SET completed = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [isCompleted, completedAt, id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Task not found or unauthorized' });
    }

    const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({
      success: true,
      data: { ...updatedTask, completed: Boolean(updatedTask.completed) }
    });
  } catch (error) {
    console.error('Error updating task completion:', error);
    res.status(500).json({ success: false, error: 'Failed to update completion status' });
  }
});

// DELETE /api/tasks/completed
app.delete('/api/tasks/completed', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { date } = req.query;
    
    let query = 'DELETE FROM tasks WHERE completed = 1 AND user_id = ?';
    const params = [req.user.id];
    if (date) {
      query += ' AND task_date = ?';
      params.push(date);
    }

    const result = await db.run(query, params);
    res.json({
      success: true,
      message: `Deleted ${result.changes} completed task(s)`,
      deletedCount: result.changes
    });
  } catch (error) {
    console.error('Error clearing completed tasks:', error);
    res.status(500).json({ success: false, error: 'Failed to clear completed tasks' });
  }
});

// GET /api/tasks/export
app.get('/api/tasks/export', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const tasks = await db.all('SELECT * FROM tasks WHERE user_id = ? ORDER BY task_date DESC, id DESC', [req.user.id]);
    res.json({
      success: true,
      data: tasks.map(t => ({ ...t, completed: Boolean(t.completed) }))
    });
  } catch (error) {
    console.error('Error exporting tasks:', error);
    res.status(500).json({ success: false, error: 'Failed to export tasks' });
  }
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const result = await db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id]);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Task not found or unauthorized' });
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
});

// GET /api/settings
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    let settings = await db.get('SELECT * FROM settings WHERE user_id = ?', [req.user.id]);
    
    if (!settings) {
      await db.run(
        'INSERT INTO settings (user_id, sound_enabled, default_priority, default_time) VALUES (?, 1, "Medium", "")',
        [req.user.id]
      );
      settings = await db.get('SELECT * FROM settings WHERE user_id = ?', [req.user.id]);
    }

    res.json({
      success: true,
      data: {
        sound_enabled: Boolean(settings ? settings.sound_enabled : 1),
        default_priority: settings ? settings.default_priority : 'Medium',
        default_time: settings ? settings.default_time : ''
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings
app.put('/api/settings', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { sound_enabled, default_priority, default_time } = req.body;

    await db.run(
      `INSERT INTO settings (user_id, sound_enabled, default_priority, default_time)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         sound_enabled = excluded.sound_enabled,
         default_priority = excluded.default_priority,
         default_time = excluded.default_time`,
      [
        req.user.id,
        sound_enabled ? 1 : 0,
        default_priority || 'Medium',
        default_time || ''
      ]
    );

    const updatedSettings = await db.get('SELECT * FROM settings WHERE user_id = ?', [req.user.id]);
    res.json({
      success: true,
      data: {
        sound_enabled: Boolean(updatedSettings.sound_enabled),
        default_priority: updatedSettings.default_priority,
        default_time: updatedSettings.default_time
      }
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
