# Group Chat App - Exercises 9, 10 and 11

## Features

- User signup and login
- JWT authentication
- Socket.IO authentication middleware (Exercise 9)
- Modular `socket_io` folder structure (Exercise 10)
- Personal rooms and personal messages (Exercise 11)
- Search users by email
- Real-time personal messaging

## Run

```bash
npm i
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Important

MongoDB must be running locally because `.env` uses:

```text
mongodb://127.0.0.1:27017/whatsapp_clone
```

## Folder structure

```text
socket_io/
├── handlers/
│   ├── chat.js
│   └── personal_chat.js
├── index.js
└── middleware.js
```
