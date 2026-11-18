const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const itemsLeftEl = document.getElementById('itemsLeft');
const totalBadgeEl = document.getElementById('totalBadge');
const dateDisplayEl = document.getElementById('dateDisplay');

let tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
let currentFilter = 'all';

// Display today's date
const today = new Date();
dateDisplayEl.textContent = today.toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric'
});

function saveTasks() {
  localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function updateStats() {
  const activeCount = tasks.filter((t) => !t.completed).length;
  itemsLeftEl.textContent = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;
  totalBadgeEl.textContent = `${tasks.length} ${tasks.length === 1 ? 'Task' : 'Tasks'}`;
}

function renderTasks() {
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  if (filteredTasks.length === 0) {
    const emptyEl = document.createElement('li');
    emptyEl.className = 'empty-state';
    emptyEl.textContent =
      currentFilter === 'all'
        ? 'No tasks yet. Add one above to get started!'
        : `No ${currentFilter} tasks found.`;
    taskList.appendChild(emptyEl);
    updateStats();
    return;
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;

    // Left section (checkbox + text)
    const leftDiv = document.createElement('div');
    leftDiv.className = 'task-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;

    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(textSpan);

    // Right section (priority + edit + delete)
    const rightDiv = document.createElement('div');
    rightDiv.className = 'task-right';

    const priorityBadge = document.createElement('span');
    priorityBadge.className = `priority-tag priority-${task.priority}`;
    priorityBadge.textContent = task.priority;

    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn';
    editBtn.title = 'Edit Task';
    editBtn.textContent = '✏️';
    editBtn.addEventListener('click', () => startEditTask(task.id, leftDiv, textSpan));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete';
    deleteBtn.title = 'Delete Task';
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    rightDiv.appendChild(priorityBadge);
    rightDiv.appendChild(editBtn);
    rightDiv.appendChild(deleteBtn);

    li.appendChild(leftDiv);
    li.appendChild(rightDiv);
    taskList.appendChild(li);
  });

  updateStats();
}

function addTask(text, priority) {
  const newTask = {
    id: Date.now(),
    text: text.trim(),
    priority,
    completed: false
  };
  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function startEditTask(id, leftDiv, textSpan) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = task.text;

  leftDiv.replaceChild(input, textSpan);
  input.focus();

  const finishEdit = () => {
    const updatedText = input.value.trim();
    if (updatedText) {
      task.text = updatedText;
      saveTasks();
    }
    renderTasks();
  };

  input.addEventListener('blur', finishEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finishEdit();
    if (e.key === 'Escape') renderTasks();
  });
}

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  addTask(text, prioritySelect.value);
  taskInput.value = '';
  taskInput.focus();
});

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

clearCompletedBtn.addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

// Initial render
renderTasks();