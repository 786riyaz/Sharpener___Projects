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
let currentRoomId = null;

currentUserElement.textContent =
    currentUser.name;


/*
Exercise 12:
Both users must generate exactly the same room ID.

Example:
    Jack -> Asif
    Asif -> Jack

Both become:
    personal:asif@email.com|jack@email.com
*/
function createPersonalRoomId(
    emailA,
    emailB
) {
    return `personal:${[
        String(emailA)
            .trim()
            .toLowerCase(),
        String(emailB)
            .trim()
            .toLowerCase()
    ]
        .sort()
        .join("|")}`;
}


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

    /*
    A socket reconnect creates a fresh server-side connection.
    If a conversation is already selected, join that room again.
    */
    if (currentRoomId) {
        joinCurrentRoom(
            currentRoomId
        );
    }
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


/*
Exercise 12:
Receive only messages emitted to the personal room that
the client has currently selected.
*/
socket.on(
    "chat-message",
    (chatMessage) => {
        if (
            !currentRoomId ||
            chatMessage.roomId !==
                currentRoomId
        ) {
            return;
        }

        renderMessage(
            chatMessage
        );
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


/*
When the selected user changes:

1. Leave the old room.
2. Create a deterministic room ID.
3. Join the new room.
4. Load the stored MongoDB conversation.
*/
async function selectUser(user) {
    const nextRoomId =
        createPersonalRoomId(
            currentUser.email,
            user.email
        );

    if (
        currentRoomId &&
        currentRoomId !== nextRoomId
    ) {
        await leaveCurrentRoom();
    }

    selectedUser = user;
    currentRoomId = nextRoomId;

    chatTitle.textContent =
        `Chat with ${user.name} (${user.email})`;

    messageInput.disabled = false;
    sendButton.disabled = false;

    messagesContainer.innerHTML = "";

    const joined =
        await joinCurrentRoom(
            currentRoomId
        );

    if (!joined) {
        selectedUser = null;
        currentRoomId = null;

        messageInput.disabled = true;
        sendButton.disabled = true;

        chatTitle.textContent =
            "Unable to join personal chat";

        return;
    }

    await loadConversation(
        user
    );
}


function joinCurrentRoom(roomId) {
    return new Promise((resolve) => {
        socket.emit(
            "join-room",
            roomId,
            (response) => {
                if (!response?.success) {
                    alert(
                        response?.message ||
                            "Unable to join room"
                    );

                    resolve(false);
                    return;
                }

                console.log(
                    "Joined room:",
                    response.roomId
                );

                resolve(true);
            }
        );
    });
}


function leaveCurrentRoom() {
    return new Promise((resolve) => {
        if (!currentRoomId) {
            resolve(true);
            return;
        }

        socket.emit(
            "leave-room",
            currentRoomId,
            (response) => {
                if (
                    !response?.success
                ) {
                    console.warn(
                        "Unable to leave room:",
                        response?.message
                    );

                    resolve(false);
                    return;
                }

                console.log(
                    "Left room:",
                    response.roomId
                );

                resolve(true);
            }
        );
    });
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
                        ),
                    roomId:
                        message.roomId ||
                        currentRoomId
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

        if (
            !selectedUser ||
            !currentRoomId
        ) {
            return;
        }

        const message =
            messageInput.value.trim();

        if (!message) {
            return;
        }

        /*
        Exercise 12:
        Send the message to the specific room ID instead of
        broadcasting it to every connected user.
        */
        socket.emit(
            "new-message",
            {
                message,
                roomId:
                    currentRoomId
            },
            (response) => {
                if (!response?.success) {
                    alert(
                        response?.message ||
                            "Unable to send message"
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
            message.sender?._id ||
            message.sender ||
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
        async () => {
            if (currentRoomId) {
                await leaveCurrentRoom();
            }

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
