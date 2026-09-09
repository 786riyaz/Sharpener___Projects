const token =
    localStorage.getItem("token");

const currentUser =
    JSON.parse(
        localStorage.getItem("user") ||
        "null"
    );

if (!token || !currentUser) {
    window.location.href =
        "/login.html";
}

const currentUserElement =
    document.getElementById("currentUser");

const usersList =
    document.getElementById("usersList");

const searchInput =
    document.getElementById("searchInput");

const chatTitle =
    document.getElementById("chatTitle");

const messagesContainer =
    document.getElementById("messages");

const messageForm =
    document.getElementById("messageForm");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

let selectedUser = null;

currentUserElement.textContent =
    currentUser.name;


const socket = io({
    auth: {
        token
    }
});


socket.on("connect", () => {
    console.log(
        "Socket connected:",
        socket.id
    );

    // Exercise 11 client-side room join.
    socket.emit(
        "join-room",
        currentUser.email,
        (response) => {
            console.log(
                "Join room response:",
                response
            );
        }
    );
});


socket.on(
    "connect_error",
    (error) => {
        console.error(
            "Socket connection failed:",
            error.message
        );

        if (
            error.message.includes(
                "Authentication"
            ) ||
            error.message.includes(
                "expired"
            )
        ) {
            localStorage.clear();

            window.location.href =
                "/login.html";
        }
    }
);


socket.on(
    "socketAuthenticated",
    (data) => {
        console.log(
            "Socket authenticated:",
            data
        );
    }
);


// Receive personal messages.
socket.on(
    "chat-message",
    (chatMessage) => {
        if (!selectedUser) {
            return;
        }

        const isCurrentConversation =
            chatMessage.senderEmail ===
                selectedUser.email ||
            chatMessage.receiverEmail ===
                selectedUser.email;

        if (isCurrentConversation) {
            renderMessage(
                chatMessage
            );
        }
    }
);


function authHeaders() {
    return {
        Authorization:
            `Bearer ${token}`
    };
}


async function loadUsers(
    search = ""
) {
    try {
        const response =
            await fetch(
                `/api/users?email=${encodeURIComponent(search)}`,
                {
                    headers:
                        authHeaders()
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message
            );
        }

        usersList.innerHTML = "";

        if (data.users.length === 0) {
            usersList.innerHTML =
                "<p class='empty'>No users found</p>";

            return;
        }

        data.users.forEach(
            (user) => {
                const button =
                    document.createElement(
                        "button"
                    );

                button.className =
                    "user-item";

                button.innerHTML = `
                    <strong>${escapeHtml(user.name)}</strong>
                    <small>${escapeHtml(user.email)}</small>
                `;

                button.addEventListener(
                    "click",
                    () => {
                        selectUser(
                            user
                        );
                    }
                );

                usersList.appendChild(
                    button
                );
            }
        );
    } catch (error) {
        usersList.innerHTML =
            "<p class='empty'>Unable to load users</p>";
    }
}


searchInput.addEventListener(
    "input",
    () => {
        loadUsers(
            searchInput.value
        );
    }
);


async function selectUser(user) {
    selectedUser = user;

    chatTitle.textContent =
        `Chat with ${user.name} (${user.email})`;

    messageInput.disabled = false;
    sendButton.disabled = false;

    messagesContainer.innerHTML = "";

    await loadConversation(
        user
    );
}


async function loadConversation(user) {
    try {
        const response =
            await fetch(
                `/api/personal-messages/${encodeURIComponent(user.email)}`,
                {
                    headers:
                        authHeaders()
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message
            );
        }

        data.messages.forEach(
            (message) => {
                renderMessage({
                    ...message,
                    sender:
                        String(
                            message.sender
                        )
                });
            }
        );
    } catch (error) {
        console.error(
            "Unable to load conversation:",
            error.message
        );
    }
}


messageForm.addEventListener(
    "submit",
    (event) => {
        event.preventDefault();

        if (!selectedUser) {
            return;
        }

        const message =
            messageInput.value.trim();

        if (!message) {
            return;
        }

        // Exercise 11:
        // Client sends message + target room.
        socket.emit(
            "new-message",
            {
                message,
                roomName:
                    selectedUser.email
            },
            (response) => {
                if (!response.success) {
                    alert(
                        response.message
                    );
                }
            }
        );

        messageInput.value = "";
    }
);


function renderMessage(message) {
    const senderId =
        String(
            message.sender ||
            message.sender?._id ||
            ""
        );

    const isMine =
        senderId ===
        String(currentUser.id);

    const messageElement =
        document.createElement("div");

    messageElement.className =
        `message ${isMine ? "mine" : "other"}`;

    messageElement.textContent =
        message.message;

    messagesContainer.appendChild(
        messageElement
    );

    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
}


document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        () => {
            socket.disconnect();

            localStorage.clear();

            window.location.href =
                "/login.html";
        }
    );


function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


loadUsers();
