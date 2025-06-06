function renderTaskForm() {
    const taskForm = createElement('div', ['task-form']);

    const titleInput = createElement('input', [], '', {
        type: 'text',
        id: 'title',
        placeholder: 'Tytuł zadania'
    });

    // Add error element for title validation
    const titleError = createElement('div', ['error-message'], '', {
        id: 'titleError',
        textContent: '',
        style: ''
    });

    const categorySelect = createElement('select', [], '', {id: 'category'});
    // Optimized: using single key arrays
    ['Kategoria', 'Praca', 'Dom', 'Inne'].forEach((text, idx) => {
        const value = idx === 0 ? '' : text;
        categorySelect.appendChild(createElement('option', [], text, {value}));
    });

    const prioritySelect = createElement('select', [], '', {id: 'priority'});
    // Optimized: using single key arrays with mapping
    ['Priorytet', 'Niski', 'Średni', 'Wysoki'].forEach((text, idx) => {
        const valueMap = ['', 'low', 'medium', 'high'];
        prioritySelect.appendChild(createElement('option', [], text, {value: valueMap[idx]}));
    });

    const deadlineInput = createElement('input', [], '', {
        type: 'date',
        id: 'deadline'
    });

    const addButton = createElement('button', [], 'Dodaj');
    addButton.addEventListener('click', () => window.taskManager.addTask());

    // Append title input and error message together
    const titleContainer = createElement('div');
    titleContainer.appendChild(titleInput);
    titleContainer.appendChild(titleError);

    [titleContainer, categorySelect, prioritySelect, deadlineInput, addButton].forEach(option => taskForm.appendChild(option));

    return taskForm;
}

function renderFilterBar() {
    const filterBar = createElement('div', ['filter-bar']);

    const filterInput = createElement('input', [], '', {
        type: 'text',
        id: 'filterText',
        placeholder: 'Filtruj po tytule...'
    });

    const categoryFilter = createElement('select', [], '', {id: 'filterCat'});
    // Optimized: using single key arrays
    ['Wszystkie kategorie', 'Praca', 'Dom', 'Inne'].forEach((text, idx) => {
        const value = idx === 0 ? '' : text;
        categoryFilter.appendChild(createElement('option', [], text, {value}));
    });

    const priorityFilter = createElement('select', [], '', {id: 'filterPri'});
    // Optimized: using single key arrays with mapping
    ['Wszystkie priorytety', 'Niski', 'Średni', 'Wysoki'].forEach((text, idx) => {
        const valueMap = ['', 'low', 'medium', 'high'];
        priorityFilter.appendChild(createElement('option', [], text, {value: valueMap[idx]}));
    });

    [filterInput, categoryFilter, priorityFilter].forEach(option => filterBar.appendChild(option));

    return filterBar;
}

function renderEditModal() {
    const modal = createElement('div', [], '', {
        id: 'editModal'});

    const modalContent = createElement('div', [], '');

    const title = createElement('h3', [], 'Edytuj zadanie');

    const editTitle = createElement('input', [], '', {
        id: 'editTitle',
        placeholder: 'Tytuł'
    });

    // Add error element for edit title validation
    const editTitleError = createElement('div', ['error-message'], '', {
        id: 'editTitleError',
        textContent: '',
        style: ''
    });

    const editCategory = createElement('select', [], '', {id: 'editCat'});
    // Optimized: using single key arrays
    ['Kategoria', 'Praca', 'Dom', 'Inne'].forEach((text, idx) => {
        const value = idx === 0 ? '' : text;
        editCategory.appendChild(createElement('option', [], text, {value}));
    });

    const editPriority = createElement('select', [], '', {id: 'editPri'});
    // Optimized: using single key arrays with mapping
    ['Priorytet', 'Niski', 'Średni', 'Wysoki'].forEach((text, idx) => {
        const valueMap = ['', 'low', 'medium', 'high'];
        editPriority.appendChild(createElement('option', [], text, {value: valueMap[idx]}));
    });

    const editDeadline = createElement('input', [], '', {
        type: 'date',
        id: 'editDeadline'
    });

    const saveButton = createElement('button', [], 'Zapisz');
    const cancelButton = createElement('button', [], 'Anuluj');

    // Add event listeners to buttons
    saveButton.addEventListener('click', () => window.taskManager.saveEdit());
    cancelButton.addEventListener('click', () => window.taskManager.closeEditModal());

    // Create title container with error message
    const titleContainer = createElement('div');
    titleContainer.appendChild(editTitle);
    titleContainer.appendChild(editTitleError);

    [title, titleContainer, editCategory, editPriority, editDeadline, saveButton, cancelButton].forEach(option => modalContent.appendChild(option));

    modal.appendChild(modalContent);

    return modal;
}

function renderTaskList() {
    return createElement('ul', [], '', {id: 'taskList'});
}

function renderControls() {
    const controls = createElement('div', ['controls']);

    const undoBtn = createElement('button', [], 'Cofnij');
    const redoBtn = createElement('button', [], 'Ponów');
    const exportBtn = createElement('button', [], 'Eksportuj');
    const importInput = createElement('input', [], '', {
        type: 'file',
        id: 'importFile',
        multiple: true
    });

    [undoBtn, redoBtn, exportBtn, importInput].forEach(option => controls.appendChild(option));
    undoBtn.addEventListener('click', () => window.taskManager.undo());
    redoBtn.addEventListener('click', () => window.taskManager.redo());
    exportBtn.addEventListener('click', () => window.taskManager.exportTasks());

    return controls;
}

function renderApp() {
    const appContainer = document.getElementById('List-app');
    appContainer.innerHTML = '';

    const header = createElement('header');
    const mainTitle = createElement('h1', [], 'Menedżer Zadań');
    header.appendChild(mainTitle);

    [header, renderTaskForm(), renderFilterBar(), renderEditModal(), renderTaskList(), renderControls()].forEach(option => appContainer.appendChild(option));
}

// Add bulk operations to the interface
function addBulkControls() {
    const controls = document.querySelector('.controls');
    const bulkDiv = document.createElement('div');

    const buttons = [
        { text: 'Zaznacz widoczne', onclick: () => window.taskManager.selectAllVisible() },
        { text: 'Ukończ zaznaczone', onclick: () => window.taskManager.executeSelected('complete') },
        { text: 'Usuń zaznaczone', onclick: () => window.taskManager.executeSelected('delete') }
    ];

    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.onclick = btn.onclick;
        bulkDiv.appendChild(button);
    });

    controls.appendChild(bulkDiv);
}