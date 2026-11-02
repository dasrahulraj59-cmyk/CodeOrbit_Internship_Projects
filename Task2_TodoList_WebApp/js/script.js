/**
 * TASK 2: TO-DO LIST WEB APPLICATION - JAVASCRIPT
 * Developed by Rahul Raj Das (COT/BTH3/91388) for CodeOrbit Tech Internship
 * Features: Full CRUD, LocalStorage persistence, filters, search, sort, stats & export/import
 */

// Storage Key
const STORAGE_KEY = 'codeorbit_tasks_data';

// Default tasks for first-time visitors
const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: 'Complete Task 1: Personal Portfolio Website',
    desc: 'Develop responsive HTML, CSS & Vanilla JS portfolio with dark mode & contact form.',
    category: 'CodeOrbit',
    priority: 'High',
    dueDate: '2026-11-10',
    completed: true,
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'task-2',
    title: 'Complete Task 2: To-Do List Web App',
    desc: 'Implement full CRUD, localStorage persistence, category filters, and progress metrics.',
    category: 'CodeOrbit',
    priority: 'High',
    dueDate: '2026-11-15',
    completed: true,
    createdAt: Date.now() - 86400000
  },
  {
    id: 'task-3',
    title: 'Complete Task 3: Simple REST API with Node.js',
    desc: 'Build Express.js backend with endpoints for Notes CRUD and JSON persistence.',
    category: 'CodeOrbit',
    priority: 'High',
    dueDate: '2026-11-20',
    completed: false,
    createdAt: Date.now()
  },
  {
    id: 'task-4',
    title: 'Record 2-5 min screen video & share on LinkedIn',
    desc: 'Demonstrate completed internship tasks with hashtag #CodeOrbitTech and tag @codeorbittech.',
    category: 'Work',
    priority: 'Medium',
    dueDate: '2026-11-25',
    completed: false,
    createdAt: Date.now() + 1000
  }
];

// App State
let tasks = [];
let currentFilter = 'all';
let searchQuery = '';
let currentSort = 'newest';

// DOM Elements
const taskListEl = document.getElementById('task-list');
const emptyStateEl = document.getElementById('empty-state');
const taskForm = document.getElementById('task-form');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const filterTabs = document.getElementById('filter-tabs');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

// Stats Elements
const statTotalEl = document.getElementById('stat-total');
const statActiveEl = document.getElementById('stat-active');
const statCompletedEl = document.getElementById('stat-completed');
const statPercentEl = document.getElementById('stat-percent');
const progressBarEl = document.getElementById('progress-bar');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const modalClose = document.getElementById('modal-close');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

// Export & Import
const exportBtn = document.getElementById('export-btn');
const importInput = document.getElementById('import-input');

// Theme Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

/* -------------------------------------------------------------
   INITIALIZATION
   ------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  initTheme();
  setupEventListeners();
  render();
});

/* -------------------------------------------------------------
   DATA PERSISTENCE
   ------------------------------------------------------------- */
function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      tasks = JSON.parse(data);
    } else {
      tasks = [...DEFAULT_TASKS];
      saveTasks();
    }
  } catch (err) {
    console.error('Error loading tasks from localStorage', err);
    tasks = [...DEFAULT_TASKS];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Error saving tasks to localStorage', err);
  }
}

/* -------------------------------------------------------------
   EVENT LISTENERS
   ------------------------------------------------------------- */
function setupEventListeners() {
  // Add task form submit
  taskForm.addEventListener('submit', handleAddTask);

  // Filter tabs
  filterTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      render();
    }
  });

  // Search input with debounce
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    render();
  });

  // Sort dropdown
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    render();
  });

  // Clear Completed
  clearCompletedBtn.addEventListener('click', handleClearCompleted);

  // Modal close handlers
  modalClose.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeModal();
  });
  editForm.addEventListener('submit', handleSaveEdit);

  // Export / Import
  exportBtn.addEventListener('click', exportTasksToJSON);
  importInput.addEventListener('change', importTasksFromJSON);

  // Keyboard shortcut: ESC closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editModal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* -------------------------------------------------------------
   CRUD OPERATIONS
   ------------------------------------------------------------- */
function handleAddTask(e) {
  e.preventDefault();

  const titleInput = document.getElementById('task-title');
  const categoryInput = document.getElementById('task-category');
  const priorityInput = document.getElementById('task-priority');
  const dueDateInput = document.getElementById('task-due-date');
  const descInput = document.getElementById('task-desc');

  const title = titleInput.value.trim();
  if (!title) return;

  const newTask = {
    id: 'task-' + Date.now(),
    title: title,
    desc: descInput.value.trim(),
    category: categoryInput.value,
    priority: priorityInput.value,
    dueDate: dueDateInput.value,
    completed: false,
    createdAt: Date.now()
  };

  tasks.unshift(newTask);
  saveTasks();
  render();

  // Reset inputs
  titleInput.value = '';
  descInput.value = '';
  dueDateInput.value = '';

  showToast('Task added successfully!', 'success');
}

function toggleTaskComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
    showToast(task.completed ? 'Task marked as completed! 🎉' : 'Task marked as active.', 'info');
  }
}

function deleteTask(id) {
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    const deleted = tasks.splice(index, 1)[0];
    saveTasks();
    render();
    showToast(`Deleted "${deleted.title}"`, 'danger');
  }
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById('edit-task-id').value = task.id;
  document.getElementById('edit-title').value = task.title;
  document.getElementById('edit-desc').value = task.desc || '';
  document.getElementById('edit-category').value = task.category;
  document.getElementById('edit-priority').value = task.priority;
  document.getElementById('edit-due-date').value = task.dueDate || '';

  editModal.classList.add('open');
  document.getElementById('edit-title').focus();
}

function closeModal() {
  editModal.classList.remove('open');
}

function handleSaveEdit(e) {
  e.preventDefault();

  const id = document.getElementById('edit-task-id').value;
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.title = document.getElementById('edit-title').value.trim();
  task.desc = document.getElementById('edit-desc').value.trim();
  task.category = document.getElementById('edit-category').value;
  task.priority = document.getElementById('edit-priority').value;
  task.dueDate = document.getElementById('edit-due-date').value;

  saveTasks();
  closeModal();
  render();
  showToast('Task updated successfully!', 'success');
}

function handleClearCompleted() {
  const completedCount = tasks.filter(t => t.completed).length;
  if (completedCount === 0) {
    showToast('No completed tasks to clear.', 'info');
    return;
  }

  if (confirm(`Are you sure you want to remove ${completedCount} completed task(s)?`)) {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    render();
    showToast(`Cleared ${completedCount} completed tasks.`, 'success');
  }
}

/* -------------------------------------------------------------
   EXPORT & IMPORT
   ------------------------------------------------------------- */
function exportTasksToJSON() {
  const jsonStr = JSON.stringify(tasks, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TaskOrbit_Tasks_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported tasks to JSON file!', 'success');
}

function importTasksFromJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        tasks = imported;
        saveTasks();
        render();
        showToast(`Successfully imported ${imported.length} tasks!`, 'success');
      } else {
        showToast('Invalid JSON file format.', 'danger');
      }
    } catch (err) {
      showToast('Failed to parse JSON file.', 'danger');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

/* -------------------------------------------------------------
   FILTERING & SORTING LOGIC
   ------------------------------------------------------------- */
function getProcessedTasks() {
  // 1. Status Filter
  let filtered = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  // 2. Search Filter
  if (searchQuery) {
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(searchQuery) ||
      (task.desc && task.desc.toLowerCase().includes(searchQuery)) ||
      task.category.toLowerCase().includes(searchQuery)
    );
  }

  // 3. Sorting
  filtered.sort((a, b) => {
    if (currentSort === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
    if (currentSort === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
    if (currentSort === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (currentSort === 'priority') {
      const weights = { High: 3, Medium: 2, Low: 1 };
      return (weights[b.priority] || 0) - (weights[a.priority] || 0);
    }
    return 0;
  });

  return filtered;
}

/* -------------------------------------------------------------
   RENDER VIEW
   ------------------------------------------------------------- */
function render() {
  updateMetrics();

  const processedTasks = getProcessedTasks();
  taskListEl.innerHTML = '';

  if (processedTasks.length === 0) {
    emptyStateEl.style.display = 'block';
  } else {
    emptyStateEl.style.display = 'none';

    processedTasks.forEach(task => {
      const li = createTaskElement(task);
      taskListEl.appendChild(li);
    });
  }
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'completed' : ''}`;
  li.dataset.id = task.id;

  // Due Date status
  let dueDateBadge = '';
  if (task.dueDate) {
    const isOverdue = !task.completed && new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0);
    dueDateBadge = `
      <span class="badge-due-date ${isOverdue ? 'overdue' : ''}">
        <i class="fa-regular fa-calendar"></i>
        ${isOverdue ? '⚠️ ' : ''}${formatDate(task.dueDate)}
      </span>
    `;
  }

  li.innerHTML = `
    <div class="task-checkbox-custom" onclick="toggleTaskComplete('${task.id}')" title="Mark as ${task.completed ? 'Active' : 'Completed'}">
      ${task.completed ? '<i class="fa-solid fa-check"></i>' : ''}
    </div>

    <div class="task-content">
      <div class="task-header-row">
        <span class="task-title">${escapeHTML(task.title)}</span>
        <span class="badge badge-priority-${task.priority.toLowerCase()}">${task.priority}</span>
        <span class="badge badge-category">${escapeHTML(task.category)}</span>
        ${dueDateBadge}
      </div>
      ${task.desc ? `<p class="task-desc">${escapeHTML(task.desc)}</p>` : ''}
    </div>

    <div class="task-actions">
      <button class="action-btn" onclick="openEditModal('${task.id}')" title="Edit Task">
        <i class="fa-solid fa-pen"></i>
      </button>
      <button class="action-btn btn-delete" onclick="deleteTask('${task.id}')" title="Delete Task">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `;

  return li;
}

function updateMetrics() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  statTotalEl.textContent = total;
  statActiveEl.textContent = active;
  statCompletedEl.textContent = completed;
  statPercentEl.textContent = `${percent}%`;
  progressBarEl.style.width = `${percent}%`;
}

/* -------------------------------------------------------------
   THEME TOGGLE
   ------------------------------------------------------------- */
function initTheme() {
  const savedTheme = localStorage.getItem('taskorbit-theme') || 'dark';
  setTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  function setTheme(t) {
    document.body.setAttribute('data-theme', t);
    localStorage.setItem('taskorbit-theme', t);
    if (t === 'light') {
      themeIcon.className = 'fa-solid fa-sun';
    } else {
      themeIcon.className = 'fa-solid fa-moon';
    }
  }
}

/* -------------------------------------------------------------
   TOAST ALERTS
   ------------------------------------------------------------- */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'danger') icon = 'fa-circle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* -------------------------------------------------------------
   HELPERS
   ------------------------------------------------------------- */
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function formatDate(dateStr) {
  try {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateStr;
  }
}
