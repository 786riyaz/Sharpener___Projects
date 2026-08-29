"use strict";
// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Storage layer — persists tasks to localStorage
// ---------------------------------------------------------------------------
class TaskStorage {
    constructor(storageKey = "todo-app:tasks") {
        this.storageKey = storageKey;
    }
    load() {
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) {
            return [];
        }
        try {
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                return [];
            }
            return parsed.filter(this.isTask);
        }
        catch {
            return [];
        }
    }
    save(tasks) {
        localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    }
    isTask(value) {
        if (typeof value !== "object" || value === null) {
            return false;
        }
        const candidate = value;
        return (typeof candidate.id === "string" &&
            typeof candidate.name === "string" &&
            typeof candidate.dueDate === "string" &&
            typeof candidate.completed === "boolean" &&
            typeof candidate.createdAt === "number");
    }
}
// ---------------------------------------------------------------------------
// App controller — owns state, wires up the DOM, renders the list
// ---------------------------------------------------------------------------
class TodoApp {
    constructor(storage) {
        this.tasks = [];
        this.activeFilter = "all";
        this.storage = storage;
        this.form = this.getElement("task-form");
        this.nameInput = this.getElement("task-name");
        this.dueInput = this.getElement("task-due");
        this.formError = this.getElement("form-error");
        this.list = this.getElement("task-list");
        this.countLabel = this.getElement("task-count");
        this.emptyState = this.getElement("empty-state");
        this.filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
        this.tasks = this.storage.load();
        this.bindEvents();
        this.render();
    }
    getElement(id) {
        const el = document.getElementById(id);
        if (!el) {
            throw new Error(`Expected element #${id} to exist in the DOM.`);
        }
        return el;
    }
    bindEvents() {
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            this.handleAddTask();
        });
        this.list.addEventListener("click", (event) => {
            const target = event.target;
            const item = target.closest("[data-task-id]");
            if (!item)
                return;
            const id = item.dataset.taskId;
            if (!id)
                return;
            if (target.matches(".task-item__delete")) {
                this.deleteTask(id);
            }
        });
        this.list.addEventListener("change", (event) => {
            const target = event.target;
            if (!target.matches(".task-item__checkbox"))
                return;
            const item = target.closest("[data-task-id]");
            const id = item?.dataset.taskId;
            if (id) {
                this.toggleTask(id);
            }
        });
        for (const button of this.filterButtons) {
            button.addEventListener("click", () => {
                const filter = button.dataset.filter;
                if (filter) {
                    this.setFilter(filter);
                }
            });
        }
    }
    handleAddTask() {
        const name = this.nameInput.value.trim();
        const dueDate = this.dueInput.value;
        if (!name || !dueDate) {
            this.formError.textContent = "Please enter both a task name and a due date.";
            return;
        }
        this.formError.textContent = "";
        const task = {
            id: this.generateId(),
            name,
            dueDate,
            completed: false,
            createdAt: Date.now(),
        };
        this.tasks.push(task);
        this.persistAndRender();
        this.form.reset();
        this.nameInput.focus();
    }
    toggleTask(id) {
        const task = this.tasks.find((t) => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.persistAndRender();
        }
    }
    deleteTask(id) {
        this.tasks = this.tasks.filter((t) => t.id !== id);
        this.persistAndRender();
    }
    setFilter(filter) {
        this.activeFilter = filter;
        for (const button of this.filterButtons) {
            const isActive = button.dataset.filter === filter;
            button.classList.toggle("is-active", isActive);
        }
        this.render();
    }
    getVisibleTasks() {
        const sorted = [...this.tasks].sort((a, b) => {
            if (a.dueDate !== b.dueDate) {
                return a.dueDate.localeCompare(b.dueDate);
            }
            return a.createdAt - b.createdAt;
        });
        switch (this.activeFilter) {
            case "pending":
                return sorted.filter((t) => !t.completed);
            case "completed":
                return sorted.filter((t) => t.completed);
            default:
                return sorted;
        }
    }
    persistAndRender() {
        this.storage.save(this.tasks);
        this.render();
    }
    render() {
        const visibleTasks = this.getVisibleTasks();
        this.list.innerHTML = "";
        for (const task of visibleTasks) {
            this.list.appendChild(this.buildTaskElement(task));
        }
        const hasAnyTasks = this.tasks.length > 0;
        const hasVisibleTasks = visibleTasks.length > 0;
        this.emptyState.classList.toggle("is-visible", !hasVisibleTasks);
        this.emptyState.textContent = hasAnyTasks
            ? "No tasks match this filter."
            : "No tasks yet — add your first one above.";
        const pendingCount = this.tasks.filter((t) => !t.completed).length;
        this.countLabel.textContent = `${this.tasks.length} task${this.tasks.length === 1 ? "" : "s"} · ${pendingCount} pending`;
    }
    buildTaskElement(task) {
        const item = document.createElement("li");
        item.className = "task-item" + (task.completed ? " is-completed" : "");
        item.dataset.taskId = task.id;
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-item__checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Mark "${task.name}" as ${task.completed ? "pending" : "completed"}`);
        const body = document.createElement("div");
        body.className = "task-item__body";
        const name = document.createElement("div");
        name.className = "task-item__name";
        name.textContent = task.name;
        const due = document.createElement("div");
        due.className = "task-item__due";
        if (!task.completed && this.isOverdue(task.dueDate)) {
            due.classList.add("is-overdue");
        }
        due.textContent = `Due ${this.formatDate(task.dueDate)}`;
        body.appendChild(name);
        body.appendChild(due);
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "task-item__delete";
        deleteBtn.setAttribute("aria-label", `Delete "${task.name}"`);
        deleteBtn.textContent = "✕";
        item.appendChild(checkbox);
        item.appendChild(body);
        item.appendChild(deleteBtn);
        return item;
    }
    isOverdue(dueDate) {
        const today = new Date().toISOString().slice(0, 10);
        return dueDate < today;
    }
    formatDate(dueDate) {
        const parsed = new Date(`${dueDate}T00:00:00`);
        if (Number.isNaN(parsed.getTime())) {
            return dueDate;
        }
        return parsed.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }
    generateId() {
        if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
            return crypto.randomUUID();
        }
        return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
}
// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const storage = new TaskStorage();
    new TodoApp(storage);
    console.log("Application Started");
});
//# sourceMappingURL=app.js.map