const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const storageKey = 'todo.tasks.v1';

let tasks = loadTasks();
renderTasks();

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});

taskList.addEventListener('click', (event) => {
    const actionButton = event.target.closest('button[data-action]');
    if (!actionButton) {
        return;
    }

    const listItem = actionButton.closest('li[data-id]');
    if (!listItem) {
        return;
    }

    const taskId = Number(listItem.dataset.id);
    const action = actionButton.dataset.action;

    if (action === 'toggle') {
        tasks = tasks.map((task) =>
            task.id === taskId ? { ...task, done: !task.done } : task
        );
    }

    if (action === 'delete') {
        tasks = tasks.filter((task) => task.id !== taskId);
    }

    saveTasks();
    renderTasks();
});

function addTask() {
    const text = taskInput.value.trim();
    if (!text) {
        taskInput.focus();
        return;
    }

    tasks.unshift({
        id: Date.now(),
        text,
        done: false,
    });

    taskInput.value = '';
    saveTasks();
    renderTasks();
    taskInput.focus();
}

function renderTasks() {
    taskList.innerHTML = '';

    tasks.forEach((task) => {
        const li = document.createElement('li');
        li.dataset.id = String(task.id);
        if (task.done) {
            li.classList.add('task-done');
        }

        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = task.text;

        const actions = document.createElement('div');
        actions.className = 'task-actions';

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'task-btn task-complete';
        toggleBtn.dataset.action = 'toggle';
        toggleBtn.textContent = task.done ? 'Undo' : 'Done';

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'task-btn task-delete';
        deleteBtn.dataset.action = 'delete';
        deleteBtn.textContent = 'Delete';

        actions.append(toggleBtn, deleteBtn);
        li.append(textSpan, actions);
        taskList.appendChild(li);
    });
}

function saveTasks() {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function loadTasks() {
    try {
        const raw = localStorage.getItem(storageKey);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}
