// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Task {
  id: string;
  name: string;
  dueDate: string; // ISO date string, e.g. "2026-09-01"
  completed: boolean;
  createdAt: number;
}

type Filter = "all" | "pending" | "completed";

// ---------------------------------------------------------------------------
// Storage layer — persists tasks to localStorage
// ---------------------------------------------------------------------------

class TaskStorage {
  private readonly storageKey: string;

  constructor(storageKey: string = "todo-app:tasks") {
    this.storageKey = storageKey;
  }

  load(): Task[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter(this.isTask);
    } catch {
      return [];
    }
  }

  save(tasks: Task[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }

  private isTask(value: unknown): value is Task {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    const candidate = value as Record<string, unknown>;
    return (
      typeof candidate.id === "string" &&
      typeof candidate.name === "string" &&
      typeof candidate.dueDate === "string" &&
      typeof candidate.completed === "boolean" &&
      typeof candidate.createdAt === "number"
    );
  }
}

// ---------------------------------------------------------------------------
// App controller — owns state, wires up the DOM, renders the list
// ---------------------------------------------------------------------------

class TodoApp {
  private tasks: Task[] = [];
  private activeFilter: Filter = "all";

  private readonly storage: TaskStorage;

  private readonly form: HTMLFormElement;
  private readonly nameInput: HTMLInputElement;
  private readonly dueInput: HTMLInputElement;
  private readonly formError: HTMLParagraphElement;
  private readonly list: HTMLUListElement;
  private readonly countLabel: HTMLSpanElement;
  private readonly emptyState: HTMLParagraphElement;
  private readonly filterButtons: HTMLButtonElement[];

  constructor(storage: TaskStorage) {
    this.storage = storage;

    this.form = this.getElement<HTMLFormElement>("task-form");
    this.nameInput = this.getElement<HTMLInputElement>("task-name");
    this.dueInput = this.getElement<HTMLInputElement>("task-due");
    this.formError = this.getElement<HTMLParagraphElement>("form-error");
    this.list = this.getElement<HTMLUListElement>("task-list");
    this.countLabel = this.getElement<HTMLSpanElement>("task-count");
    this.emptyState = this.getElement<HTMLParagraphElement>("empty-state");
    this.filterButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".filter-btn")
    );

    this.tasks = this.storage.load();

    this.bindEvents();
    this.render();
  }

  private getElement<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) {
      throw new Error(`Expected element #${id} to exist in the DOM.`);
    }
    return el as T;
  }

  private bindEvents(): void {
    this.form.addEventListener("submit", (event: SubmitEvent) => {
      event.preventDefault();
      this.handleAddTask();
    });

    this.list.addEventListener("click", (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const item = target.closest<HTMLLIElement>("[data-task-id]");
      if (!item) return;
      const id = item.dataset.taskId;
      if (!id) return;

      if (target.matches(".task-item__delete")) {
        this.deleteTask(id);
      }
    });

    this.list.addEventListener("change", (event: Event) => {
      const target = event.target as HTMLElement;
      if (!target.matches(".task-item__checkbox")) return;
      const item = target.closest<HTMLLIElement>("[data-task-id]");
      const id = item?.dataset.taskId;
      if (id) {
        this.toggleTask(id);
      }
    });

    for (const button of this.filterButtons) {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter as Filter | undefined;
        if (filter) {
          this.setFilter(filter);
        }
      });
    }
  }

  private handleAddTask(): void {
    const name = this.nameInput.value.trim();
    const dueDate = this.dueInput.value;

    if (!name || !dueDate) {
      this.formError.textContent = "Please enter both a task name and a due date.";
      return;
    }

    this.formError.textContent = "";

    const task: Task = {
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

  private toggleTask(id: string): void {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.persistAndRender();
    }
  }

  private deleteTask(id: string): void {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.persistAndRender();
  }

  private setFilter(filter: Filter): void {
    this.activeFilter = filter;
    for (const button of this.filterButtons) {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle("is-active", isActive);
    }
    this.render();
  }

  private getVisibleTasks(): Task[] {
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

  private persistAndRender(): void {
    this.storage.save(this.tasks);
    this.render();
  }

  private render(): void {
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
    this.countLabel.textContent = `${this.tasks.length} task${
      this.tasks.length === 1 ? "" : "s"
    } · ${pendingCount} pending`;
  }

  private buildTaskElement(task: Task): HTMLLIElement {
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

  private isOverdue(dueDate: string): boolean {
    const today = new Date().toISOString().slice(0, 10);
    return dueDate < today;
  }

  private formatDate(dueDate: string): string {
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

  private generateId(): string {
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
