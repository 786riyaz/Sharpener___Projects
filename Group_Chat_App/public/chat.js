const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {
    window.location.href = "login.html";
}

const sidebarUserName = document.getElementById("sidebarUserName");
const profileAvatar = document.getElementById("profileAvatar");
const messages = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

if (user) {
    sidebarUserName.textContent = user.name;
    profileAvatar.textContent = user.name.charAt(0).toUpperCase();
}

function formatTime() {
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).format(new Date());
}

function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}

messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = messageInput.value.trim();
    if (!text) return;

    const messageElement = document.createElement("div");
    messageElement.classList.add("message", "sent");

    const messageText = document.createElement("div");
    messageText.classList.add("message-text");
    messageText.textContent = text;

    const messageMeta = document.createElement("div");
    messageMeta.classList.add("message-meta");

    const time = document.createElement("span");
    time.classList.add("message-time");
    time.textContent = formatTime();

    const readStatus = document.createElement("span");
    readStatus.classList.add("read-status");
    readStatus.textContent = "✓✓";

    messageMeta.append(time, readStatus);
    messageElement.append(messageText, messageMeta);
    messages.appendChild(messageElement);

    messageInput.value = "";
    scrollToBottom();
    messageInput.focus();
});

scrollToBottom();
