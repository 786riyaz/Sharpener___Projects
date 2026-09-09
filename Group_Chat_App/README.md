# Group Chat App - Exercise 2

## Setup

1. Extract the ZIP.
2. Open the project folder in VS Code.
3. Run:

```bash
npm install
```

4. Copy `.env.example` and rename the copy to `.env`.
5. Make sure MongoDB is running.
6. Run:

```bash
npm run dev
```

7. Open:

```text
http://localhost:3000/signup.html
```

## APIs

### POST /api/signup

Body:

```json
{
  "name": "Riyaz",
  "email": "riyaz@example.com",
  "phone": "9876543210",
  "password": "123456"
}
```

### POST /api/login

Body:

```json
{
  "login": "riyaz@example.com",
  "password": "123456"
}
```

`login` can also contain the phone number.

## Exercise 3 - Chat Window

After successful login, the user is redirected to `chat.html`.

The chat screen includes:

- WhatsApp-style responsive layout
- Sidebar and chat list
- Chat header
- Sent and received message bubbles
- Sender names
- Timestamps
- Auto-scroll behavior
- Message input box
- Frontend-only message sending for this exercise

Messages typed in the input box are currently displayed only in the browser UI. Database persistence and real-time messaging will be handled in later exercises.
