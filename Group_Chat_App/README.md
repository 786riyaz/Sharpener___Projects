# Group Chat App - Exercise 10

This project contains a complete modular Socket.IO refactor.

## Socket.IO folder structure

```text
socket-io/
├── index.js
├── middleware.js
└── handlers/
    └── chat.js
```

### Responsibilities

- `socket-io/index.js`
  - Creates the Socket.IO server
  - Registers middleware
  - Handles client connection/disconnection
  - Registers event handlers

- `socket-io/middleware.js`
  - Verifies JWT from `socket.handshake.auth.token`
  - Stores the authenticated user ID on `socket.userId`

- `socket-io/handlers/chat.js`
  - Handles `sendMessage`
  - Saves the message in MongoDB
  - Broadcasts the saved message using `io.emit("receiveMessage")`

## Important refactor

`server.js` does **not** create Socket.IO directly with:

```js
const io = new Server(httpServer);
```

Instead it imports the modular setup function:

```js
const setupSocketIO = require("./socket-io");
const io = setupSocketIO(httpServer);
```

Therefore `io` is declared only once in `server.js`, avoiding:

```text
SyntaxError: Identifier 'io' has already been declared
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` using `.env.example`.

3. Ensure MongoDB is running.

4. Start:

```bash
npm run dev
```

5. Open:

```text
http://localhost:3000
```

## Testing real-time chat

Open two different browser sessions, create/login with users, and send a message from one session. The message should appear live in both sessions.
