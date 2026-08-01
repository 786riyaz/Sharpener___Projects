When you run:

```bash
npm install --production
```

or (modern equivalent)

```bash
npm install --omit=dev
```

npm **skips all `devDependencies`** and installs **only the packages under `dependencies`**.

For example, if your `package.json` looks like this:

```json
{
  "dependencies": {
    "express": "^5.1.0",
    "mongoose": "^8.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0",
    "eslint": "^9.0.0"
  }
}
```

Running:

```bash
npm install
```

installs:

* ✅ express
* ✅ mongoose
* ✅ nodemon
* ✅ eslint

Running:

```bash
npm install --production
```

(or `npm install --omit=dev`)

installs only:

* ✅ express
* ✅ mongoose

It **does not install**:

* ❌ nodemon
* ❌ eslint

---

### Why?

Packages in `devDependencies` are only needed during development, such as:

* Nodemon
* ESLint
* Prettier
* Jest
* TypeScript

When deploying your application to a production server, these tools aren't required for the application to run. Installing only `dependencies` saves disk space and installation time.

---

### Interview Tip

| Command                    | What gets installed?                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `npm install`              | ✅ `dependencies` + ✅ `devDependencies`                                                                          |
| `npm install --production` | ✅ `dependencies` only                                                                                           |
| `npm install --omit=dev`   | ✅ `dependencies` only (recommended modern syntax)                                                               |
| `npm ci`                   | ✅ Installs exactly what's in `package-lock.json` (includes `devDependencies` unless combined with `--omit=dev`) |

So for your question, **Option 3** is the correct answer:

✅ **Only packages listed in `"dependencies"` will be installed.**
