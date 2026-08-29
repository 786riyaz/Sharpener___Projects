# TypeScript To-Do List App

A plain TypeScript (no frameworks) to-do list app with add / complete / delete
and localStorage persistence.

## Project structure

```
todo-app/
├── index.html          # markup, loads dist/app.js
├── style.css            # styling
├── tsconfig.json        # TypeScript compiler config
├── src/
│   └── app.ts           # TypeScript source (interfaces, classes, DOM logic)
└── dist/
    ├── app.js            # compiled output (already built, committed for convenience)
    └── app.js.map
```

## How it's organized

- **`Task` interface** — shape of a single task (`id`, `name`, `dueDate`,
  `completed`, `createdAt`).
- **`Filter` type** — `"all" | "pending" | "completed"`.
- **`TaskStorage` class** — reads/writes the task array to `localStorage`,
  with runtime validation (`isTask`) so corrupted storage data can't crash
  the app.
- **`TodoApp` class** — owns in-memory state, binds DOM event listeners
  (form submit, checkbox toggle, delete click, filter buttons), and
  re-renders the list on every change.

## Setup

1. Install TypeScript (if you don't already have it):
   ```bash
   npm install -g typescript
   ```
2. Compile:
   ```bash
   tsc -p tsconfig.json
   ```
   This reads `src/app.ts` and outputs `dist/app.js` (+ source map).
3. Open `index.html` directly in a browser, or serve the folder:
   ```bash
   npx serve .
   ```

## Rebuilding after edits

Just re-run `tsc -p tsconfig.json`, or run `tsc -w -p tsconfig.json` to
watch `src/app.ts` and recompile automatically on save.

## Features

- Add a task with a name and due date (both required; inline validation
  message if missing).
- Toggle a task's completed/pending state via checkbox.
- Delete a task.
- Tasks persist in `localStorage` under the key `todo-app:tasks`, so a page
  reload keeps everything.
- Filter view: All / Pending / Completed.
- Overdue pending tasks are highlighted.
