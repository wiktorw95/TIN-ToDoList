function createElement(tag, classNames = [], textContent = '', attributes = {}) {
    const element = document.createElement(tag);
    if (classNames.length > 0) {
        element.className = classNames.join(' ');
    }
    if (textContent) {
        element.textContent = textContent;
    }

    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });

    return element;
}

const sanitize = input => {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
};

const save = (tasks) => localStorage.setItem('tasks', JSON.stringify(tasks));

const load = () => JSON.parse(localStorage.getItem('tasks') || '[]');

const log = (event, details = "") => console.log(`[LOG] ${new Date().toISOString()} - ${event}: ${details}`);

const updateHistory = (tasks, history, redoStack) => {
    history.push(JSON.stringify(tasks));
    redoStack.length = 0;
    return { history, redoStack };
};

const undo = (tasks, history, redoStack) => {
    if (history.length > 0) {
        redoStack.push(JSON.stringify(tasks));
        tasks = JSON.parse(history.pop());
        log("Undo", "Undo Element");
        return { tasks, history, redoStack };
    }
    return { tasks, history, redoStack };
};

const redo = (tasks, history, redoStack) => {
    if (redoStack.length > 0) {
        history.push(JSON.stringify(tasks));
        tasks = JSON.parse(redoStack.pop());
        log("Redo", "Redo Element");
        return { tasks, history, redoStack };
    }
    return { tasks, history, redoStack };
};

const exportTasks = (tasks) => {
    try {
        const download = (data, name) => {
            const a = document.createElement('a');
            a.href = `data:application/json,${encodeURIComponent(JSON.stringify(data))}`;
            a.download = name;
            a.click();
        };

        download(tasks, 'tasks.json');
        log("Export Completed", "Tasks have been exported");
    } catch (error) {
        console.error('Export error:', error);
        alert('Error during export');
    }
};

const importTasks = async (files, tasks, stats, history, redoStack) => {
    if (!files.length) return { tasks, stats };

    try {
        const fileData = await Promise.all(files.map(async file => {
            try {
                const text = await file.text();
                return { name: file.name, data: JSON.parse(text) };
            } catch {
                return { name: file.name, data: null };
            }
        }));

        const tasksFile = fileData.find(f => f.name.includes('tasks') && Array.isArray(f.data));
        const settingsFile = fileData.find(f => f.name.includes('settings') && f.data?.stats);

        if (tasksFile) {
            const historyResult = updateHistory(tasks, history, redoStack);
            tasks = tasksFile.data;
            if (settingsFile) stats = settingsFile.data.stats;
            log("Import Complete", `Imported ${tasks.length} tasks`);
            return { tasks, stats, history: historyResult.history, redoStack: historyResult.redoStack };
        } else {
            alert('Nieprawidłowy format pliku zadań');
        }
    } catch (error) {
        console.error('Import error:', error);
        alert('Błąd odczytu pliku');
    }

    return { tasks, stats };
};