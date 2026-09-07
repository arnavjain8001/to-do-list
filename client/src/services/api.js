const rawApiUrl = import.meta.env.VITE_API_URL || '';
const cleanApiUrl = rawApiUrl ? rawApiUrl.replace(/\/$/, '') : '';
const BASE_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('todo_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 401 || response.status === 403) {
        // Broadcast auth error event if needed
        window.dispatchEvent(new Event('auth_error'));
      }
      throw new Error(data.error || `HTTP Error ${response.status}`);
    }

    return data.data !== undefined ? data.data : data;
  } catch (error) {
    console.error(`API Call Error [${endpoint}]:`, error);
    throw error;
  }
}

export const authApi = {
  register: (userData) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: (credentials) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getCurrentUser: () => {
    return request('/auth/me');
  },
};

export const taskApi = {
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.date) query.append('date', params.date);
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.category) query.append('category', params.category);
    if (params.sortBy) query.append('sortBy', params.sortBy);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/tasks${queryString}`);
  },

  getStats: (date) => {
    const queryString = date ? `?date=${date}` : '';
    return request(`/tasks/stats${queryString}`);
  },

  createTask: (taskData) => {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  updateTask: (id, taskData) => {
    return request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  toggleComplete: (id, completed) => {
    return request(`/tasks/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  },

  deleteTask: (id) => {
    return request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  clearCompleted: (date) => {
    const queryString = date ? `?date=${date}` : '';
    return request(`/tasks/completed${queryString}`, {
      method: 'DELETE',
    });
  },

  exportTasks: () => {
    return request('/tasks/export');
  },

  getSettings: () => {
    return request('/settings');
  },

  updateSettings: (settingsData) => {
    return request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  },
};
