const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");
const user = userData ? JSON.parse(userData) : null;

if (!token || !user) {
    window.location.href = "login.html";
}

const sidebarUserName = document.getElementById("sidebarUserName");
const profileAvatar = document.getElementById("profileAvatar");
const messages = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const sendButton = messageForm.querySelector("button[type='submit']");

if (user) {
    sidebarUserName.textContent = user.name;
    profileAvatar.textContent = user.name.charAt(0).toUpperCase();
}

function formatTime(date = new Date()) {
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).format(date);
}

function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}

function addSentMessage(text, createdAt) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", "sent");

    const messageText = document.createElement("div");
    messageText.classList.add("message-text");
    messageText.textContent = text;

    const messageMeta = document.createElement("div");
    messageMeta.classList.add("message-meta");

    const time = document.createElement("span");
    time.classList.add("message-time");
    time.textContent = formatTime(
        createdAt ? new Date(createdAt) : new Date()
    );

    const readStatus = document.createElement("span");
    readStatus.classList.add("read-status");
    readStatus.textContent = "✓✓";

    messageMeta.append(time, readStatus);
    messageElement.append(messageText, messageMeta);
    messages.appendChild(messageElement);

    scrollToBottom();
}

messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const text = messageInput.value.trim();

    if (!text) {
        return;
    }

    sendButton.disabled = true;
    messageInput.disabled = true;

    try {
        const response = await fetch("/api/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                message: text
            })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "login.html";
                return;
            }

            throw new Error(data.message || "Unable to send message");
        }

        addSentMessage(
            data.chatMessage.message,
            data.chatMessage.createdAt
        );

        messageInput.value = "";

    } catch (error) {
        console.error("Send message error:", error);
        alert(error.message || "Unable to send message");

    } finally {
        sendButton.disabled = false;
        messageInput.disabled = false;
        messageInput.focus();
    }
});

scrollToBottom();
