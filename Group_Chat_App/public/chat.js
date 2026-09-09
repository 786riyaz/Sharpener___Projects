const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || token === "undefined" || token === "null" || !user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

const sidebarUserName = document.getElementById("sidebarUserName");
const profileAvatar = document.getElementById("profileAvatar");
const messages = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

const renderedMessageIds = new Set();

if (user) {
    sidebarUserName.textContent = user.name;
    profileAvatar.textContent = user.name.charAt(0).toUpperCase();
}

// ==========================================
// SOCKET.IO CONNECTION
// ==========================================
const socket = io("http://localhost:3000", {
    auth: {
        token
    }
});

socket.on("connect", () => {
    console.log("Live chat connected:", socket.id);
});

socket.on("socketAuthenticated", (data) => {
    console.log(
        "Socket authenticated for user:",
        data.user.userId
    );
});

socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);

    if (
        error.message === "Authentication token is required" ||
        error.message === "Invalid or expired token"
    ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    }
});

// This event is received by ALL connected users whenever
// any user sends a message.
socket.on("newMessage", (chatMessage) => {
    addMessageToChat(chatMessage, true);
});

// ==========================================
// CHAT UI HELPERS
// ==========================================
function formatTime(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).format(date);
}

function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}

function createMessageElement(chatMessage) {
    const messageElement = document.createElement("div");

    const senderId = chatMessage.sender?._id || chatMessage.sender;

    const isCurrentUser =
        String(senderId) === String(user.id);

    messageElement.classList.add(
        "message",
        isCurrentUser ? "sent" : "received"
    );

    const messageText = document.createElement("div");
    messageText.classList.add("message-text");
    messageText.textContent = chatMessage.message;

    const messageMeta = document.createElement("div");
    messageMeta.classList.add("message-meta");

    const time = document.createElement("span");
    time.classList.add("message-time");
    time.textContent = formatTime(chatMessage.createdAt);

    messageMeta.appendChild(time);

    if (isCurrentUser) {
        const readStatus = document.createElement("span");
        readStatus.classList.add("read-status");
        readStatus.textContent = "✓✓";
        messageMeta.appendChild(readStatus);
    }

    messageElement.appendChild(messageText);
    messageElement.appendChild(messageMeta);

    return messageElement;
}

function addMessageToChat(chatMessage, shouldScroll = false) {
    if (!chatMessage) {
        return;
    }

    const messageId = chatMessage._id;

    // REST POST response and Socket.IO event can arrive for
    // the same message. This prevents duplicate rendering.
    if (messageId && renderedMessageIds.has(String(messageId))) {
        return;
    }

    if (messageId) {
        renderedMessageIds.add(String(messageId));
    }

    messages.appendChild(
        createMessageElement(chatMessage)
    );

    if (shouldScroll) {
        scrollToBottom();
    }
}

// ==========================================
// LOAD OLD MESSAGES ON PAGE LOAD
// ==========================================
async function loadMessages() {
    try {
        const response = await fetch("/api/messages", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load messages");
        }

        messages.innerHTML = "";
        renderedMessageIds.clear();

        const dateDivider = document.createElement("div");
        dateDivider.classList.add("date-divider");

        const dateText = document.createElement("span");
        dateText.textContent = "MESSAGES";

        dateDivider.appendChild(dateText);
        messages.appendChild(dateDivider);

        data.messages.forEach((chatMessage) => {
            addMessageToChat(chatMessage);
        });

        scrollToBottom();

    } catch (error) {
        console.error("Load messages error:", error);

        if (
            error.message === "Invalid or expired token" ||
            error.message === "Authentication token is required"
        ) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
            return;
        }

        messages.innerHTML = "";

        const errorElement = document.createElement("div");
        errorElement.classList.add("date-divider");

        const errorText = document.createElement("span");
        errorText.textContent = "Unable to load messages";

        errorElement.appendChild(errorText);
        messages.appendChild(errorElement);
    }
}

// ==========================================
// SEND MESSAGE AND STORE IT IN DATABASE
// ==========================================
messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const text = messageInput.value.trim();

    if (!text) {
        return;
    }

    const submitButton = messageForm.querySelector(
        'button[type="submit"]'
    );

    messageInput.disabled = true;
    submitButton.disabled = true;

    try {
        const response = await fetch("/api/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                message: text
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to send message");
        }

        // Add immediately for the sender. The later Socket.IO
        // broadcast is ignored because the message ID is already known.
        addMessageToChat(data.chatMessage, true);

        messageInput.value = "";
        messageInput.focus();

    } catch (error) {
        console.error("Send message error:", error);

        if (
            error.message === "Invalid or expired token" ||
            error.message === "Authentication token is required"
        ) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
            return;
        }

        alert(error.message || "Unable to send message");
    } finally {
        messageInput.disabled = false;
        submitButton.disabled = false;
    }
});

loadMessages();
