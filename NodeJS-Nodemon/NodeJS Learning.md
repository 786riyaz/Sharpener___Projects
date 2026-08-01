# Chapter 1 - What is Node.js?

## Before Node.js

Originally, JavaScript could only run inside browsers.

For example:

```javascript
console.log("Hello");
```

This code runs in

* Chrome
* Firefox
* Edge
* Safari

because browsers have a JavaScript Engine.

Chrome uses

> V8 JavaScript Engine

But JavaScript could not run outside browsers.

So developers needed another language like

* PHP
* Java
* C#
* Python

for backend development.

---

# What is Node.js?

Node.js is a runtime environment that allows JavaScript to run outside the browser.

It uses Google's V8 Engine.

Instead of running inside Chrome,

it runs directly on your computer.

```
JavaScript Code
        │
        ▼
   Node.js Runtime
        │
        ▼
Operating System
```

Example

```javascript
console.log("Hello Node");
```

Run

```
node app.js
```

Output

```
Hello Node
```

---

# Why was Node.js created?

Browsers provide many APIs like

```
alert()

document

window

localStorage
```

But outside browsers these APIs don't exist.

Node.js provides its own APIs like

```
fs

http

path

os

crypto

events
```

Example

```javascript
const fs = require("fs");

fs.writeFileSync("hello.txt", "Hello");
```

Browsers cannot create files.

Node.js can.

---

# Features of Node.js

### 1. Runs JavaScript outside browser

```javascript
console.log("Hello");
```

---

### 2. Single Threaded

One main thread handles requests.

---

### 3. Event Driven

Instead of waiting,

Node performs other work.

```
Request

↓

Node registers callback

↓

Continue other work

↓

Task completed

↓

Execute callback
```

---

### 4. Non Blocking I/O

Example

```javascript
fs.readFile("data.txt", () => {
    console.log("Done");
});

console.log("After");
```

Output

```
After
Done
```

Node didn't wait.

---

### 5. Fast

Uses Google's V8 Engine.

---

### 6. Cross Platform

Runs on

* Windows
* Linux
* macOS

---

# Node.js Architecture

```
Application

↓

Node APIs

↓

Event Loop

↓

Thread Pool

↓

Operating System
```

---

# Common Uses

* REST APIs
* Chat Applications
* Streaming
* Authentication
* Microservices
* Real Time Apps
* CLI Tools

---

# Installing Node.js

After installation

```
node -v

npm -v
```

Example

```
v24.2.0

11.3.0
```

---

# Verify installation

```
node
```

Output

```
>
```

Type

```javascript
console.log("Hello");
```

Exit

```
.exit
```

---

# Running JS

```
node app.js
```

---

# Chapter 2 - What is npm?

npm means

> Node Package Manager

It comes automatically with Node.js.

When Node installs,

npm also installs.

Check

```
npm -v
```

---

## Why npm?

Instead of writing every library yourself,

you install packages.

Example

```
Express

Axios

Mongoose

Lodash

Moment
```

These are called packages.

---

Think of npm like

```
Play Store

↓

App

↓

Package
```

or

```
Amazon

↓

Product

↓

Package
```

npm manages packages.

---

# npm Commands

Initialize project

```
npm init
```

Quick initialization

```
npm init -y
```

---

Install package

```
npm install express
```

or

```
npm i express
```

---

Install specific version

```
npm install express@5
```

---

Install globally

```
npm install -g nodemon
```

---

Update package

```
npm update
```

---

Remove package

```
npm uninstall express
```

---

List packages

```
npm list
```

Global packages

```
npm list -g --depth=0
```

---

# Chapter 3 - What is package.json?

When you initialize

```
npm init
```

Node creates

```
package.json
```

It is the identity card of your project.

Everything about your project is stored here.

Example

```json
{
  "name": "myproject",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "author": "Riyaz",
  "license": "ISC"
}
```

---

Think like this

```
Project Name

Version

Author

Dependencies

Scripts

License

Description
```

Everything belongs here.

---

# Why package.json?

Without it,

npm doesn't know

* project name
* dependencies
* scripts
* version

---

# Chapter 4 - Components of package.json

Typical package.json

```json
{
  "name": "shop",

  "version": "1.0.0",

  "description": "Shopping API",

  "main": "server.js",

  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },

  "keywords": [
    "shopping",
    "node"
  ],

  "author": "Riyaz",

  "license": "ISC",

  "dependencies": {
    "express": "^5.1.0"
  },

  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

---

## name

Project name

```json
"name":"shop-api"
```

---

## version

Current project version

```
1.0.0
```

Semantic Versioning (SemVer)

```
Major.Minor.Patch

2.5.9
```

Major

Breaking changes

Minor

New features

Patch

Bug fixes

---

## description

Small project description.

---

## main

Entry file.

```
index.js

server.js

app.js
```

---

## scripts

Custom commands.

```json
"scripts":{
"start":"node app.js",
"dev":"nodemon app.js"
}
```

Run

```
npm start

npm run dev
```

---

## author

Developer name.

---

## license

Usually

```
ISC

MIT

Apache
```

---

## keywords

Useful while publishing package.

---

## dependencies

Production packages.

---

## devDependencies

Development packages.

---

# Chapter 5 - package.json vs package-lock.json

Many beginners confuse these.

---

## package.json

Contains

```
Project information

Dependencies

Scripts

Version
```

Example

```json
"express":"^5.1.0"
```

---

## package-lock.json

Automatically created.

Contains

```
Exact version

Dependency tree

Download URL

Integrity Hash
```

Very detailed.

---

Example

package.json

```
express

^

5.1.0
```

package-lock.json

```
express 5.1.0

accepts 2.0.0

body-parser 2.2.0

cookie 0.7.2

...
```

Every dependency is locked.

---

Why?

So every developer installs identical versions.

---

Imagine

Developer A

```
npm install
```

Developer B

```
npm install
```

Both receive exactly the same dependency tree.

---

# Should we upload package-lock.json to Git?

Yes.

Always.

---

# Should we upload node_modules?

No.

Never.

Instead

```
package.json

package-lock.json
```

are enough.

Anyone can run

```
npm install
```

---

# Chapter 6 - node_modules

After installing

```
npm install express
```

Node creates

```
node_modules/
```

Contains

```
Express

Dependencies

Sub dependencies
```

Thousands of files.

Never edit manually.

---

# Chapter 7 - Installing Packages

Local install

```
npm install express
```

Shortcut

```
npm i express
```

---

Multiple packages

```
npm i express mongoose dotenv
```

---

Specific version

```
npm i express@5
```

---

Latest

```
npm i express@latest
```

---

Development package

```
npm i -D nodemon
```

or

```
npm install --save-dev nodemon
```

---

Global package

```
npm i -g nodemon
```

---

# Chapter 8 - Uninstall Packages

```
npm uninstall express
```

Shortcut

```
npm un express
```

---

# Chapter 9 - Dependency vs DevDependency

This is a favorite interview question.

Suppose you build a website.

You need

```
Express

JWT

MongoDB

Axios
```

Users need these.

These are Production Dependencies.

---

Example

```json
"dependencies":{
"express":"^5.1.0"
}
```

---

Development tools

```
Nodemon

ESLint

Prettier

Jest

TypeScript
```

These are needed only while developing.

Users don't need them.

They belong in

```json
"devDependencies":{
"nodemon":"^3.1.0"
}
```

---

### Easy rule

| Needed in Production?        | Package Type  |
| ---------------------------- | ------------- |
| Yes                          | dependency    |
| No (only during development) | devDependency |

---

# Chapter 10 - What is Nodemon?

Without Nodemon

Suppose

```
node app.js
```

Server starts.

Now you modify code.

Nothing happens.

Need to stop

```
CTRL+C
```

Restart

```
node app.js
```

Again and again.

Very annoying.

---

Nodemon watches your files.

Whenever you save,

it automatically restarts the server.

```
Save file

↓

Nodemon detects changes

↓

Restart server

↓

Ready
```

---

Install

Local (recommended)

```
npm install --save-dev nodemon
```

Global

```
npm install -g nodemon
```

---

Run

```
nodemon app.js
```

Or define a script:

```json
"scripts": {
  "dev": "nodemon app.js"
}
```

Then run:

```
npm run dev
```

---

# Chapter 11 - Understanding package versions

Example

```
^5.1.0
```

Meaning

```
Allow Minor and Patch updates.

5.1.1 ✔

5.2.0 ✔

5.9.9 ✔

6.0.0 ✘
```

---

Example

```
~5.1.0
```

Allows

```
5.1.1 ✔

5.1.9 ✔

5.2.0 ✘
```

---

Exact

```
5.1.0
```

Only

```
5.1.0
```

---

Latest

```
*
```

Avoid using this in real projects because it can introduce unexpected breaking changes.

---

# Chapter 12 - Common npm Scripts

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "jest",
    "lint": "eslint .",
    "build": "webpack"
  }
}
```

Commands:

```
npm start
npm run dev
npm test
npm run lint
npm run build
```

---

# Chapter 13 - Typical Project Structure

```
Shopping-App/
│
├── node_modules/
│
├── package.json
│
├── package-lock.json
│
├── app.js
│
├── .gitignore
│
├── .env
│
└── README.md
```

`.gitignore` commonly includes:

```
node_modules/
.env
```

---

# Chapter 14 - Complete Workflow

```text
1. Install Node.js
        │
        ▼
2. Create Project Folder
        │
        ▼
3. npm init -y
        │
        ▼
4. package.json Created
        │
        ▼
5. npm install express
        │
        ▼
6. node_modules Created
        │
        ▼
7. package-lock.json Created
        │
        ▼
8. Write app.js
        │
        ▼
9. npm install -D nodemon
        │
        ▼
10. npm run dev
        │
        ▼
11. Build Your Application
```

# Chapter 15 - Frequently Asked Interview Questions

### 1. What is Node.js?

Node.js is a JavaScript runtime built on Google's V8 engine that allows JavaScript to run outside the browser. It provides APIs for file systems, networking, operating system access, and more, making it suitable for backend development.

---

### 2. Is Node.js a programming language?

No. JavaScript is the programming language. Node.js is the runtime environment that executes JavaScript outside the browser.

---

### 3. What is npm?

npm (Node Package Manager) is the default package manager for Node.js. It helps install, update, remove, and manage third-party packages and project dependencies.

---

### 4. What is package.json?

`package.json` is the project's manifest file. It stores metadata such as the project name, version, scripts, dependencies, and other configuration.

---

### 5. What is package-lock.json?

`package-lock.json` locks the exact versions of all installed packages and their transitive dependencies so that everyone installs the same dependency tree.

---

### 6. Why shouldn't `node_modules` be committed to Git?

Because it is large and can always be recreated by running:

```bash
npm install
```

using the information in `package.json` and `package-lock.json`.

---

### 7. What is the difference between `dependencies` and `devDependencies`?

* `dependencies` are required for the application to run in production.
* `devDependencies` are only needed during development, testing, or building the application.

---

### 8. What is Nodemon?

Nodemon is a development tool that automatically restarts a Node.js application whenever source files change, eliminating the need to restart the server manually.

---

### 9. What is the difference between `npm install` and `npm ci`?

* `npm install` installs dependencies and may update `package-lock.json` if needed.
* `npm ci` performs a clean installation using the existing `package-lock.json`. It is faster and is commonly used in CI/CD pipelines.

---

### 10. What is the difference between a local and a global package?

* **Local package:** Installed in the project's `node_modules` folder and available only to that project.
* **Global package:** Installed once on the system and available from the command line across all projects (for example, the `nodemon` CLI).

---

## Recommended Learning Order

Follow this sequence to build a strong foundation:

1. What is JavaScript?
2. JavaScript Engine (V8)
3. What is Node.js?
4. Installing Node.js
5. Running JavaScript with Node
6. Built-in Node.js modules (`fs`, `http`, `path`, `os`)
7. What is npm?
8. `npm init` and `package.json`
9. Installing and uninstalling packages
10. `dependencies` vs `devDependencies`
11. `package-lock.json`
12. `node_modules`
13. npm scripts
14. Nodemon
15. Building a simple HTTP server
16. Express.js
17. Databases (MongoDB, MySQL, PostgreSQL)
18. Authentication
19. REST APIs
20. Deployment

This progression mirrors how Node.js is typically taught in professional training and prepares you well for backend development and technical interviews.
