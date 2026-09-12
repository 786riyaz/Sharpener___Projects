# 💬 Real-Time Chat Application

A full-stack real-time chat application built with **Node.js, Express, MongoDB, Socket.IO, AWS S3, and Google Gemini AI**.

The project was developed incrementally through multiple exercises, starting with authentication and a basic chat UI and progressing to real-time messaging, personal chats, group chats, multimedia sharing, message archiving, deployment, and AI-powered chat suggestions.

---

## ✨ Features

### 🔐 Authentication

- User signup with:
  - Name
  - Email
  - Phone number
  - Password
- Passwords are securely hashed using `bcryptjs` before being stored.
- Login using either:
  - Email, or
  - Phone number
- JWT-based authentication for protected REST APIs.
- JWT authentication for Socket.IO connections.

---

## 💬 Real-Time Chat

- Real-time messaging using Socket.IO.
- Messages appear instantly without refreshing the page.
- Messages are stored in MongoDB.
- Previous messages are loaded when a chat is opened or refreshed.
- Message timestamps are displayed in the chat interface.
- Scroll-friendly chat window.

---

## 👤 Personal Chat

Users can start a private conversation with another registered user.

### Personal room ID generation

A deterministic room ID is generated from both users' email addresses.

Example:

```text
userA@example.com + userB@example.com
```

and:

```text
userB@example.com + userA@example.com
```

produce the same room ID because both email addresses are normalized and sorted before being combined.

This ensures that two users always connect to the same personal conversation regardless of who starts the chat.

### User validation

Before joining a personal chat, the application validates that the entered email belongs to an existing user in MongoDB.

---

## 👥 Group Chat

- Create chat groups.
- Add registered users as members.
- Each group has its own unique room ID.
- Group membership is validated before users can access group conversations.
- Messages are broadcast only to users connected to the relevant group room.

---

## 🔌 Socket.IO Architecture

The Socket.IO implementation is organized into modular components.

```text
socket/
└── handlers/
    ├── chat.js
    └── personalChat.js
```

Socket authentication and event handling are separated from the main server logic to keep the backend easier to maintain and extend.

Socket authentication identifies the connected user using their JWT token.

The server can then associate each socket connection with the authenticated user.

---

## 🖼️ Multimedia and File Sharing

The application supports sharing multiple file types inside chats.

Supported categories include:

- Images
- Videos
- Audio files
- PDF files
- Text files
- ZIP files
- Word documents
- Excel files
- PowerPoint files

### File upload flow

```text
User selects a file
        ↓
Frontend validates file
        ↓
File is sent to backend
        ↓
Multer processes the upload
        ↓
Backend uploads the file to AWS S3
        ↓
S3 URL is returned
        ↓
Message containing media information is stored in MongoDB
        ↓
Socket.IO sends the message to the relevant room
        ↓
Connected users receive the media instantly
```

### Upload protection

The backend includes:

- File type validation
- Maximum file size validation
- Maximum file count limits
- Upload error handling
- Retry-friendly frontend behavior

The configured maximum file size is currently **25 MB per file**.

---

## ☁️ AWS S3 Media Storage

Media files are stored in Amazon S3 instead of MongoDB.

MongoDB stores metadata such as:

```text
S3 object key
File URL
Original file name
MIME type
File size
```

This keeps the database focused on application data while object storage handles multimedia files.

---

## 🗄️ MongoDB Message Storage

Active messages are stored in the `Message` collection.

A message contains information such as:

- Chat type (`personal` or `group`)
- Room ID
- Group ID when applicable
- Sender ID
- Text content
- Media metadata
- Creation timestamp
- Update timestamp

Important indexing is used for chat queries:

```text
roomId + createdAt
```

This helps efficiently retrieve messages for a specific conversation in chronological order.

---

## 📦 Message Archiving for Scalability

As a chat application grows, the active message collection can become very large.

To reduce the size of the active chat collection, the application includes a cron-based archive system.

### Archive flow

```text
Active Message Collection
        ↓
Messages older than configured duration
        ↓
Copied to ArchivedChat Collection
        ↓
Archive write succeeds
        ↓
Original messages are deleted from Message Collection
```

The application uses a safer archive-first approach:

1. Old messages are selected in batches.
2. Messages are written to `ArchivedChat` using upsert operations.
3. Active messages are deleted only after the archive write succeeds.

This reduces the risk of losing messages during the archival process.

### Archive configuration

```env
ARCHIVE_AFTER_HOURS=24
ARCHIVE_BATCH_SIZE=1000
ARCHIVE_CRON_SCHEDULE=0 0 * * *
```

The values can be changed for testing or production requirements.

Example:

```env
ARCHIVE_AFTER_HOURS=1
ARCHIVE_CRON_SCHEDULE=0 * * * *
```

This configuration checks every hour and archives messages older than one hour.

---

# 🤖 AI-Powered Chat Suggestions

The final version integrates **Google Gemini AI** to provide intelligent chat assistance.

The AI features are completely optional and can be enabled or disabled using an environment variable.

---

## ✍️ Predictive Typing

While the user is typing a message, the application can generate possible continuations.

Example:

```text
User types:
Let's meet at
```

Possible suggestions:

```text
5 pm
The office
tomorrow morning
```

### Predictive typing behavior

- Uses debounce to avoid making an API request for every keystroke.
- Waits approximately **850 ms** after typing pauses.
- Uses recent conversation context.
- Uses the current message draft.
- Returns concise phrase completions.
- Returns exactly three suggestions.
- Avoids repeating the text already typed by the user.
- Attempts to preserve the user's language and communication style.

Clicking a suggestion appends it to the current message input.

---

## ⚡ Smart Replies

When a new incoming text message is received, the application can generate quick reply options.

Example:

```text
Incoming message:
Are you coming to the meeting?
```

Possible smart replies:

```text
Yes, I'll be there.
Running a little late.
Can we reschedule it?
```

### Smart reply behavior

- Generates exactly three short replies.
- Uses recent conversation context.
- Attempts to match the user's natural communication style.
- Supports English, Hindi, and Hinglish conversations.
- Provides quick-select buttons in the UI.
- Clicking a smart reply places it in the message input so the user can review or edit it before sending.

---

## 🎯 AI Personalization

The application provides lightweight personalization without storing a separate AI personality profile.

The backend analyzes recent messages written by the current user and provides them to Gemini as writing-style examples.

This can help the AI adapt to patterns such as:

- Casual language
- Formal language
- Hinglish
- Emoji usage
- Short replies
- Longer conversational responses

Example style:

```text
Haan bhai aa raha hu 😂
Thoda late ho jaunga yaar
Office ke baad milte hain
```

The AI can use this context to generate more natural suggestions for that user.

---

## 🧠 Prompt Architecture

AI prompts are intentionally separated from Gemini API logic.

```text
prompts/
└── geminiPrompts.js
```

This allows the predictive typing and smart reply instructions to be modified without changing:

- API routes
- Gemini service logic
- Authentication logic
- Retry logic
- Socket.IO logic

This makes prompt experimentation much easier.

---

## 🛡️ AI Kill Switch

AI suggestions can be completely enabled or disabled from the `.env` file.

### Enable AI

```env
AI_SUGGESTIONS_ENABLED=true
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
```

### Disable AI

```env
AI_SUGGESTIONS_ENABLED=false
```

When AI is disabled:

- No Gemini suggestions are requested.
- The application continues to function normally.
- No Gemini API calls are made.
- The rest of the chat application remains unaffected.

This is useful when the AI feature is required only for demonstration or testing.

---

## 🔄 Gemini Error Handling

AI services can temporarily become unavailable because of rate limits or high demand.

The application includes graceful handling for temporary failures such as:

```text
429 Too Many Requests
503 Service Unavailable
```

The backend uses retry logic with exponential backoff before returning an unavailable result.

If Gemini remains unavailable, the chat application continues working normally without breaking the messaging experience.

---

# 🏗️ Project Structure

```text
socketio-chat-exercise-18/
│
├── jobs/
│   └── archiveChats.js
│
├── middleware/
│   ├── auth.js
│   └── upload.js
│
├── models/
│   ├── ArchivedChat.js
│   ├── Group.js
│   ├── Message.js
│   └── User.js
│
├── prompts/
│   └── geminiPrompts.js
│
├── public/
│   ├── app.js
│   ├── index.html
│   └── style.css
│
├── routes/
│   └── aiRoutes.js
│
├── services/
│   ├── geminiService.js
│   └── s3.js
│
├── socket/
│   └── handlers/
│       ├── chat.js
│       └── personalChat.js
│
├── utils/
│   └── room.js
│
├── .env.example
├── package.json
├── render.yaml
├── README.md
└── server.js
```

---

# 🛠️ Technology Stack

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication

- JWT
- bcryptjs

## Real-Time Communication

- Socket.IO

## File Uploads

- Multer

## Cloud Storage

- AWS S3
- AWS SDK for JavaScript

## Background Jobs

- cron

## Artificial Intelligence

- Google Gemini API
- `@google/genai`

## Deployment

- Render

---

# ⚙️ Installation

Clone the repository:

```bash
git clone <your-repository-url>
```

Move into the project folder:

```bash
cd socketio-chat-exercise-18
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using `.env.example` as a reference.

Start the development server:

```bash
npm run dev
```

The application will run on:

```text
http://localhost:3000
```

---

# 🔑 Environment Variables

Example:

```env
PORT=3000

MONGODB_URI=mongodb://127.0.0.1:27017/whatsapp_clone

JWT_SECRET=replace_with_a_long_random_secret

AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
S3_BUCKET_NAME=your_bucket_name

NODE_ENV=development

# Message archiving
ARCHIVE_AFTER_HOURS=24
ARCHIVE_BATCH_SIZE=1000
ARCHIVE_CRON_SCHEDULE=0 0 * * *

# Gemini AI
AI_SUGGESTIONS_ENABLED=false
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
```

> **Important:** Never commit your real `.env` file, API keys, JWT secrets, AWS credentials, or database credentials to GitHub.

---

# 🚀 Deployment

The application can be deployed to Render.

Before deployment, configure the required environment variables in the Render dashboard:

- `MONGODB_URI`
- `JWT_SECRET`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `AI_SUGGESTIONS_ENABLED`
- `GEMINI_API_KEY` (only when AI is enabled)
- `GEMINI_MODEL`

The application uses:

```javascript
process.env.PORT || 3000
```

which allows the hosting platform to provide the production port.

---

# 🧪 Running Without AI

The complete chat application works even when Gemini is disabled.

Use:

```env
AI_SUGGESTIONS_ENABLED=false
```

You can still use:

- Authentication
- Personal chat
- Group chat
- Real-time messaging
- MongoDB message persistence
- Multimedia sharing
- AWS S3 uploads
- Message archiving

Only AI predictive typing and smart replies are disabled.

---

# 🎓 Exercises Covered

This final project combines the functionality developed throughout the chat application exercises, including:

1. Signup and Login UI
2. Signup and Login Backend APIs
3. Chat Window UI
4. Store Messages in Database
5. Fetch Messages from Database
6. Live Messages
7. Socket.IO Frontend Integration
8. Socket.IO Backend Integration
9. Socket Authentication
10. Socket Server Folder Structure and Refactoring
11. Personal Messages – Part 1
12. Personal Messages – Part 2
13. Connecting Users with Deterministic Rooms
14. Group Chat and Best Practices
15. Media Sharing with AWS S3
16. Multimedia Chat Handling
17. Message Archiving and Scalability Optimization
18. AI-Powered Predictive Typing and Smart Replies with Gemini

---

# 🔮 Possible Future Improvements

Possible extensions include:

- Read receipts
- Typing indicators
- Online/offline presence
- Push notifications
- Message editing
- Message deletion
- Pagination for old and archived messages
- Redis adapter for horizontally scaled Socket.IO servers
- Multiple server instances
- CDN integration for media
- Pre-signed S3 upload URLs
- Better AI user profiles
- Conversation summarization
- AI moderation

---

# 📄 Notes

This project is designed as a learning project demonstrating the evolution of a modern chat application from basic authentication to real-time communication, cloud media storage, database optimization, and AI-assisted messaging.
