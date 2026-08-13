        (function() {
            const STORAGE_KEY = 'todoAppTasks';
            let tasks = [];

            function loadTasks() {
                try {
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        tasks = JSON.parse(stored);
                    }
                } catch (e) {
                    tasks = [];
                }
            }

            function saveTasks() {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
                } catch (e) {
                    console.error('Failed to save tasks to localStorage', e);
                }
            }

            function generateId() {
                return Date.now().toString(36) + Math.random().toString(36).substr(2);
            }

            function formatTime(timestamp) {
                const date = new Date(timestamp);
                return date.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            function createTaskElement(task) {
                const li = document.createElement('li');
                li.className = 'task-item' + (task.completed ? ' completed' : '');
                li.dataset.id = task.id;

                const contentDiv = document.createElement('div');
                contentDiv.className = 'task-content';

                if (task.editing) {
                    const editInput = document.createElement('input');
                    editInput.type = 'text';
                    editInput.className = 'edit-input';
                    editInput.value = task.text;
                    editInput.maxLength = 200;
                    contentDiv.appendChild(editInput);
                } else {
                    const textSpan = document.createElement('span');
                    textSpan.className = 'task-text' + (task.completed ? ' completed' : '');
                    textSpan.textContent = task.text;
                    contentDiv.appendChild(textSpan);
                }

                const metaDiv = document.createElement('div');
                metaDiv.className = 'task-meta';

                const timestampSpan = document.createElement('span');
                timestampSpan.className = 'timestamp';
                if (task.completed && task.completedAt) {
                    timestampSpan.innerHTML = `Completed: ${formatTime(task.completedAt)}<br>Added: ${formatTime(task.createdAt)}`;
                } else {
                    timestampSpan.textContent = `Added: ${formatTime(task.createdAt)}`;
                }
                metaDiv.appendChild(timestampSpan);

                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'task-actions';

                if (task.editing) {
                    const saveBtn = document.createElement('button');
                    saveBtn.className = 'btn btn-save';
                    saveBtn.textContent = 'Save';
                    saveBtn.addEventListener('click', () => saveEdit(task.id, li));

                    const cancelBtn = document.createElement('button');
                    cancelBtn.className = 'btn btn-cancel';
                    cancelBtn.textContent = 'Cancel';
                    cancelBtn.addEventListener('click', () => cancelEdit(task.id));

                    actionsDiv.appendChild(saveBtn);
                    actionsDiv.appendChild(cancelBtn);
                } else {
                    if (task.completed) {
                        const incompleteBtn = document.createElement('button');
                        incompleteBtn.className = 'btn btn-incomplete';
                        incompleteBtn.textContent = 'Mark Incomplete';
                        incompleteBtn.addEventListener('click', () => toggleComplete(task.id));
                        actionsDiv.appendChild(incompleteBtn);
                    } else {
                        const completeBtn = document.createElement('button');
                        completeBtn.className = 'btn btn-complete';
                        completeBtn.textContent = 'Mark Complete';
                        completeBtn.addEventListener('click', () => toggleComplete(task.id));
                        actionsDiv.appendChild(completeBtn);
                    }

                    const editBtn = document.createElement('button');
                    editBtn.className = 'btn btn-edit';
                    editBtn.textContent = 'Edit';
                    editBtn.addEventListener('click', () => startEdit(task.id));

                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn btn-delete';
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.addEventListener('click', () => deleteTask(task.id));

                    actionsDiv.appendChild(editBtn);
                    actionsDiv.appendChild(deleteBtn);
                }

                li.appendChild(contentDiv);
                li.appendChild(metaDiv);
                li.appendChild(actionsDiv);

                return li;
            }

            function renderEmptyState(container, icon, message) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">${icon}</div>
                        <div class="empty-state-text">${message}</div>
                    </div>
                `;
            }

            function renderLists() {
                const pendingList = document.getElementById('pendingList');
                const completedList = document.getElementById('completedList');
                const pendingCount = document.getElementById('pendingCount');
                const completedCount = document.getElementById('completedCount');

                const pendingTasks = tasks.filter(t => !t.completed);
                const completedTasks = tasks.filter(t => t.completed);

                pendingCount.textContent = pendingTasks.length;
                completedCount.textContent = completedTasks.length;

                pendingList.innerHTML = '';
                completedList.innerHTML = '';

                if (pendingTasks.length === 0) {
                    renderEmptyState(pendingList, '📝', 'No pending tasks. Add one above!');
                } else {
                    pendingTasks.forEach(task => {
                        pendingList.appendChild(createTaskElement(task));
                    });
                }

                if (completedTasks.length === 0) {
                    renderEmptyState(completedList, '✅', 'No completed tasks yet. Keep going!');
                } else {
                    completedTasks.forEach(task => {
                        completedList.appendChild(createTaskElement(task));
                    });
                }
            }

            function addTask() {
                const input = document.getElementById('taskInput');
                const text = input.value.trim();

                if (!text) {
                    input.focus();
                    return;
                }

                const task = {
                    id: generateId(),
                    text: text,
                    completed: false,
                    editing: false,
                    createdAt: Date.now(),
                    completedAt: null
                };

                tasks.unshift(task);
                input.value = '';
                saveTasks();
                renderLists();
                input.focus();
            }

            function toggleComplete(id) {
                const task = tasks.find(t => t.id === id);
                if (task) {
                    task.completed = !task.completed;
                    if (task.completed) {
                        task.completedAt = Date.now();
                    } else {
                        task.completedAt = null;
                    }
                    saveTasks();
                    renderLists();
                }
            }

            function startEdit(id) {
                const task = tasks.find(t => t.id === id);
                if (task) {
                    task.editing = true;
                    renderLists();
                    const editInput = document.querySelector(`[data-id="${id}"] .edit-input`);
                    if (editInput) {
                        editInput.focus();
                        editInput.setSelectionRange(editInput.value.length, editInput.value.length);
                    }
                }
            }

            function saveEdit(id, liElement) {
                const task = tasks.find(t => t.id === id);
                const editInput = liElement.querySelector('.edit-input');
                const newText = editInput.value.trim();

                if (task && newText) {
                    task.text = newText;
                    task.editing = false;
                    saveTasks();
                } else {
                    cancelEdit(id);
                }
                renderLists();
            }

            function cancelEdit(id) {
                const task = tasks.find(t => t.id === id);
                if (task) {
                    task.editing = false;
                    renderLists();
                }
            }

            function deleteTask(id) {
                tasks = tasks.filter(t => t.id !== id);
                saveTasks();
                renderLists();
            }

            document.getElementById('addTaskBtn').addEventListener('click', addTask);

            document.getElementById('taskInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addTask();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const editingTask = tasks.find(t => t.editing);
                    if (editingTask) {
                        cancelEdit(editingTask.id);
                    }
                }
            });

            loadTasks();
            renderLists();
        })();
