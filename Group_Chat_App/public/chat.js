const token = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

if (!token || !storedUser) {
    window.location.href = "/login.html";
}

const currentUser = JSON.parse(storedUser || "{}");

const currentUserElement = document.getElementById("currentUser");
const messagesElement = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const statusElement = document.getElementById("status");
const logoutButton = document.getElementById("logoutButton");

currentUserElement.textContent = currentUser.name || "User";

const displayedMessageIds = new Set();

function formatTime(value) {
    return new Date(value).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function appendMessage(messageData) {
    const id = String(messageData._id || "");

    if (id && displayedMessageIds.has(id)) {
        return;
    }

    if (id) {
        displayedMessageIds.add(id);
    }

    const isOwnMessage =
        String(messageData.userId) === String(currentUser.id);

    const message = document.createElement("article");
    message.className = `message ${isOwnMessage ? "own" : "other"}`;

    const text = document.createElement("p");
    text.textContent = messageData.message;

    const meta = document.createElement("small");
    meta.textContent = formatTime(messageData.createdAt);

    message.append(text, meta);
    messagesElement.appendChild(message);

    messagesElement.scrollTop = messagesElement.scrollHeight;
}

async function loadMessages() {
    try {
        const response = await fetch("/api/messages", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Unable to load messages");
        }

        const messages = await response.json();

        messages.forEach(appendMessage);
    } catch (error) {
        statusElement.textContent = error.message;
    }
}

// Exercise 7/9 frontend Socket.IO connection with JWT authentication.
const socket = io({
    auth: {
        token
    }
});

socket.on("connect", () => {
    statusElement.textContent = "Connected";
});

socket.on("connect_error", (error) => {
    statusElement.textContent = error.message || "Socket connection failed";

    if ((error.message || "").toLowerCase().includes("authentication")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => {
            window.location.href = "/login.html";
        }, 1000);
    }
});

socket.on("receiveMessage", (messageData) => {
    appendMessage(messageData);
});

socket.on("messageError", (data) => {
    statusElement.textContent = data.message || "Unable to send message";
});

messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = messageInput.value.trim();

    if (!message) {
        return;
    }

    // Exercise 10: message event is handled in:
    // socket-io/handlers/chat.js
    socket.emit("sendMessage", {
        message
    });

    messageInput.value = "";
    messageInput.focus();
});

logoutButton.addEventListener("click", () => {
    socket.disconnect();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
});

loadMessages();
