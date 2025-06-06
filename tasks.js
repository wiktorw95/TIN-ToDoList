// taskOperations.js - Task management and operations

class TaskManager {
    constructor() {
        this.tasks = load();
        this.history = [];
        this.redoStack = [];
        this.editIdx = null;
        this.stats = { addCount: 0 };
        this.selectedTasks = new Set();
        this.elements = {};

        this.initializeElements();
    }

    initializeElements() {
        ['title', 'category', 'priority', 'deadline', 'filterText', 'filterCat', 'filterPri', 'importFile', 'taskList', 'editModal', 'editTitle', 'editCat', 'editPri', 'editDeadline', 'titleError', 'editTitleError']
            .forEach(key => this.elements[key] = document.getElementById(key));
    }

    // Task CRUD operations
    addTask() {
        const title = sanitize(this.elements.title.value.trim());
        const errorElement = document.getElementById('titleError');

        if (!title) {
            errorElement.textContent = 'Tytuł zadania jest wymagany';
            errorElement.style.display = 'flex';
            return false;
        }

        errorElement.style.display = 'none';

        const historyResult = updateHistory(this.tasks, this.history, this.redoStack);
        this.history = historyResult.history;
        this.redoStack = historyResult.redoStack;

        this.tasks.push({
            title,
            category: sanitize(this.elements.category.value),
            priority: sanitize(this.elements.priority.value),
            deadline: sanitize(this.elements.deadline.value),
            completed: false
        });

        this.stats.addCount++;
        log("Task Added", title);
        log("Task Count", this.stats.addCount);

        this.elements.title.value = this.elements.category.value = this.elements.priority.value = this.elements.deadline.value = '';
        save(this.tasks);
        this.render();
    }

    toggleComplete(idx) {
        const historyResult = updateHistory(this.tasks, this.history, this.redoStack);
        this.history = historyResult.history;
        this.redoStack = historyResult.redoStack;

        this.tasks[idx].completed = !this.tasks[idx].completed;
        log("Task Completed", this.tasks[idx].title);
        save(this.tasks);
        this.render();
    }

    deleteTask(idx) {
        log("Task Deleted", this.tasks[idx].title);
        if(this.stats.addCount !== 0){
            this.stats.addCount--;
        }
        log("Task Count", this.stats.addCount);

        const historyResult = updateHistory(this.tasks, this.history, this.redoStack);
        this.history = historyResult.history;
        this.redoStack = historyResult.redoStack;

        this.tasks.splice(idx, 1);
        save(this.tasks);
        this.render();
    }

    // Edit modal operations
    openEditModal(idx) {
        const t = this.tasks[idx];
        this.editIdx = idx;
        this.elements.editTitle.value = t.title;
        this.elements.editCat.value = t.category || '';
        this.elements.editPri.value = t.priority || '';
        this.elements.editDeadline.value = t.deadline || '';
        this.elements.editModal.style.display = 'flex';
    }

    closeEditModal() {
        const modal = document.getElementById('editModal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Reset edit index
        this.editIdx = null;

        // Clear error message
        const errorElement = document.getElementById('editTitleError');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    saveEdit() {
        if (this.editIdx === null) return;
        const newTitle = this.elements.editTitle.value.trim();
        const errorElement = document.getElementById('editTitleError');

        if (!newTitle) {
            errorElement.textContent = 'Tytuł zadania jest wymagany';
            errorElement.style.display = 'flex';
            return false;
        }

        const historyResult = updateHistory(this.tasks, this.history, this.redoStack);
        this.history = historyResult.history;
        this.redoStack = historyResult.redoStack;

        this.tasks[this.editIdx] = {
            ...this.tasks[this.editIdx],
            title: sanitize(newTitle),
            category: sanitize(this.elements.editCat.value),
            priority: sanitize(this.elements.editPri.value),
            deadline: sanitize(this.elements.editDeadline.value)
        };

        log("Task Edited", newTitle);
        save(this.tasks);
        this.render();
        this.closeEditModal();
    }

    // History operations
    undo() {
        const result = undo(this.tasks, this.history, this.redoStack);
        this.tasks = result.tasks;
        this.history = result.history;
        this.redoStack = result.redoStack;
        save(this.tasks);
        this.render();
    }

    redo() {
        const result = redo(this.tasks, this.history, this.redoStack);
        this.tasks = result.tasks;
        this.history = result.history;
        this.redoStack = result.redoStack;
        save(this.tasks);
        this.render();
    }

    // Import/Export operations
    exportTasks() {
        exportTasks(this.tasks);
    }

    async importTasks(e) {
        const files = Array.from(e.target.files);
        const result = await importTasks(files, this.tasks, this.stats, this.history, this.redoStack);

        this.tasks = result.tasks;
        this.stats = result.stats;
        if (result.history) this.history = result.history;
        if (result.redoStack) this.redoStack = result.redoStack;

        save(this.tasks);
        this.render();
    }

    // Bulk operations
    async batchOperation(selected, operation) {
        const historyResult = updateHistory(this.tasks, this.history, this.redoStack);
        this.history = historyResult.history;
        this.redoStack = historyResult.redoStack;

        if (operation === 'complete') {
            selected.forEach(idx => {
                this.tasks[idx].completed = true;
                log("Task Completed", this.tasks[idx].title);
            });
        } else if (operation === 'delete') {
            selected.forEach(idx => log("Task Deleted", this.tasks[idx].title));
            selected.reverse().forEach(idx => this.tasks.splice(idx, 1));
        }

        save(this.tasks);
        this.render();
    }

    selectAllVisible() {
        const visibleTasks = document.querySelectorAll('#taskList li');
        this.selectedTasks.clear();
        visibleTasks.forEach((li, idx) => {
            this.selectedTasks.add(idx);
            li.style.backgroundColor = '#e3f2fd';
        });
    }

    async executeSelected(operation) {
        if (this.selectedTasks.size > 0) {
            await this.batchOperation([...this.selectedTasks], operation);
            this.selectedTasks.clear();
        }
    }

    // Main render function
    render() {
        this.elements.taskList.innerHTML = '';
        const fText = this.elements.filterText.value.toLowerCase();
        const fCat = this.elements.filterCat.value;
        const fPri = this.elements.filterPri.value;
        this.stats.addCount = 0;

        this.tasks
            .filter(t => t.title.toLowerCase().includes(fText) &&
                (fCat === '' || t.category === fCat) &&
                (fPri === '' || t.priority === fPri))
            .forEach((t, idx) => {
                this.stats.addCount++;
                const li = document.createElement('li');
                li.className = `${t.priority} ${t.completed ? 'completed' : ''}`;
                li.draggable = true;

                // Drag and drop
                li.ondragstart = e => e.dataTransfer.setData('text/plain', idx);
                li.ondragover = e => e.preventDefault();
                li.ondrop = e => {
                    const draggedIdx = e.dataTransfer.getData('text/plain');
                    if (draggedIdx !== idx) {
                        [this.tasks[draggedIdx], this.tasks[idx]] = [this.tasks[idx], this.tasks[draggedIdx]];
                        log("Moved", "Task  '" + this.tasks[idx].title + "' changed position with '" + this.tasks[draggedIdx].title + "'");
                        const historyResult = updateHistory(this.tasks, this.history, this.redoStack);
                        this.history = historyResult.history;
                        this.redoStack = historyResult.redoStack;
                        save(this.tasks);
                        this.render();
                    }
                };

                // Task content
                const label = document.createElement('label');
                Object.assign(label.style, { display: 'flex', alignItems: 'center', flex: '1' });

                const checkbox = document.createElement('input');
                Object.assign(checkbox, { type: 'checkbox', checked: t.completed, onchange: () => this.toggleComplete(idx) });

                const textDiv = document.createElement('div');
                const titleEl = document.createElement('strong');
                titleEl.textContent = t.title;

                const metaEl = document.createElement('div');
                metaEl.className = 'meta';
                metaEl.textContent = `${t.category || 'Brak kategorii'} | ${t.priority || 'brak priorytetu'} | ${t.deadline || 'brak terminu'}`;

                textDiv.append(titleEl, metaEl);
                label.append(checkbox, textDiv);

                // Buttons
                const buttonsDiv = document.createElement('div');
                const editBtn = document.createElement('button');
                const deleteBtn = document.createElement('button');

                Object.assign(editBtn, { textContent: '✏️', onclick: () => this.openEditModal(idx) });
                Object.assign(deleteBtn, { textContent: '🗑️', onclick: () => this.deleteTask(idx) });

                buttonsDiv.append(editBtn, deleteBtn);
                li.append(label, buttonsDiv);
                this.elements.taskList.appendChild(li);
            });
    }

    // Event listeners setup
    setupEventListeners() {
        this.elements.importFile.addEventListener('change', (e) => this.importTasks(e));
        this.elements.filterText.addEventListener('input', () => this.render());
        this.elements.filterCat.addEventListener('change', () => this.render());
        this.elements.filterPri.addEventListener('change', () => this.render());
    }

    // Initialize the task manager
    initialize() {
        try {
            this.render();
            addBulkControls();
            this.setupEventListeners();
            log("App Initialized", "Task Manager ready");
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }
}