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

if (user) {
    sidebarUserName.textContent = user.name;
    profileAvatar.textContent = user.name.charAt(0).toUpperCase();
}

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

        const dateDivider = document.createElement("div");
        dateDivider.classList.add("date-divider");

        const dateText = document.createElement("span");
        dateText.textContent = "MESSAGES";

        dateDivider.appendChild(dateText);
        messages.appendChild(dateDivider);

        data.messages.forEach((chatMessage) => {
            messages.appendChild(
                createMessageElement(chatMessage)
            );
        });

        scrollToBottom();

    } catch (error) {
        console.error("Load messages error:", error);

        if (
            error.message === "Invalid or expired token" ||
            error.message === "Authorization token is required"
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

        // Exercise 4 backend returns the saved MongoDB document
        // in data.chatMessage.
        const savedMessage = data.chatMessage;

        if (!savedMessage) {
            throw new Error("Saved message was not returned by the server");
        }

        messages.appendChild(
            createMessageElement(savedMessage)
        );

        messageInput.value = "";
        scrollToBottom();
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
