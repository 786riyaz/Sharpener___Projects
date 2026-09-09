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

const searchForm =
    document.getElementById("searchForm");

const searchInput =
    document.getElementById("searchInput");

const joinUserButton =
    document.getElementById("joinUserButton");

const searchStatus =
    document.getElementById("searchStatus");

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
Exercise 13:
Generate one deterministic room ID from two user emails.

Example:
    jack@example.com + asif@example.com
and
    asif@example.com + jack@example.com

Both generate:
    personal:asif@example.com|jack@example.com
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

    // A reconnect creates a fresh server-side socket.
    // Join the selected room again if one is already active.
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


function setSearchStatus(
    message,
    isError = false
) {
    searchStatus.textContent =
        message;

    searchStatus.classList.toggle(
        "error",
        isError
    );

    searchStatus.classList.toggle(
        "success",
        !isError
    );
}


/*
Optional search suggestions are preserved from the previous UI.
Exercise 13's actual security check happens through verifyUserByEmail()
before a room is joined.
*/
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
            if (search.trim()) {
                usersList.innerHTML =
                    "<p class='empty'>No matching users found</p>";
            }

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
                        searchInput.value =
                            user.email;

                        verifyAndJoinUser(
                            user.email
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
Exercise 13:
Call the backend first and verify that the exact email belongs
to a registered user. Only after this succeeds do we create/join
the deterministic personal room.
*/
async function verifyUserByEmail(email) {
    const response =
        await fetch(
            `/api/users/verify?email=${encodeURIComponent(email)}`,
            {
                headers:
                    authHeaders()
            }
        );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Unable to verify user"
        );
    }

    return data.user;
}


async function verifyAndJoinUser(email) {
    const normalizedEmail =
        String(email || "")
            .trim()
            .toLowerCase();

    if (!normalizedEmail) {
        setSearchStatus(
            "Enter an email address first.",
            true
        );
        return;
    }

    joinUserButton.disabled = true;

    setSearchStatus(
        "Verifying user..."
    );

    try {
        const verifiedUser =
            await verifyUserByEmail(
                normalizedEmail
            );

        setSearchStatus(
            "User verified. Creating the personal room..."
        );

        await selectUser(
            verifiedUser
        );

        if (
            selectedUser &&
            currentRoomId
        ) {
            setSearchStatus(
                `Connected with ${verifiedUser.email}`
            );
        }
    } catch (error) {
        setSearchStatus(
            error.message ||
                "Unable to verify user.",
            true
        );
    } finally {
        joinUserButton.disabled =
            false;
    }
}


searchForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        await verifyAndJoinUser(
            searchInput.value
        );
    }
);


/*
When the verified user changes:

1. Leave the old room.
2. Sort both email addresses.
3. Create one deterministic room ID.
4. Emit join_room to the server.
5. Load the stored MongoDB conversation.
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
        const left =
            await leaveCurrentRoom();

        if (!left) {
            throw new Error(
                "Unable to leave the previous room"
            );
        }
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

        throw new Error(
            "Unable to join personal chat"
        );
    }

    await loadConversation(
        user
    );
}


/*
Exercise 13:
The client sends the unique deterministic room ID to the server
using socket.emit("join_room", roomId).
*/
function joinCurrentRoom(roomId) {
    return new Promise((resolve) => {
        socket.emit(
            "join_room",
            roomId,
            (response) => {
                if (!response?.success) {
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
            "leave_room",
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
