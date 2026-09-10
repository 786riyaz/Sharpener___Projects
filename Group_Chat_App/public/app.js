const state = {
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "null"),
  socket: null,
  currentRoom: null,
  currentChatType: null,
  currentGroup: null
};

const $ = (id) => document.getElementById(id);

function showToast(message, type = "success") {
  const toast = $("toast");
  toast.textContent = message;
  toast.className = `show ${type}`;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.className = "";
  }, 3200);
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${state.token}`
  };
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function setAuthenticatedView() {
  $("authView").classList.add("hidden");
  $("appView").classList.remove("hidden");
  $("currentUserName").textContent = state.user.name;
  $("currentUserEmail").textContent = state.user.email;
  connectSocket();
  loadGroups();
}

function setAuthView() {
  $("appView").classList.add("hidden");
  $("authView").classList.remove("hidden");

  if (state.socket) {
    state.socket.disconnect();
    state.socket = null;
  }
}

function connectSocket() {
  if (state.socket) state.socket.disconnect();

  state.socket = io({
    auth: {
      token: state.token
    }
  });

  state.socket.on("connect", () => {
    $("connectionStatus").textContent = "Connected";
    $("connectionStatus").className = "status online";
  });

  state.socket.on("disconnect", () => {
    $("connectionStatus").textContent = "Disconnected";
    $("connectionStatus").className = "status offline";
  });

  state.socket.on("connect_error", (error) => {
    $("connectionStatus").textContent = "Authentication failed";
    $("connectionStatus").className = "status offline";
    showToast(error.message, "error");
  });

  state.socket.on("socket_authenticated", () => {
    console.log("Socket authenticated");
  });

  state.socket.on("new_message", (message) => {
    if (message.roomId !== state.currentRoom) return;
    appendMessage(message);
  });
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function createPersonalRoomId(emailA, emailB) {
  return [normalizeEmail(emailA), normalizeEmail(emailB)].sort().join("::");
}

function switchPanel(panelId) {
  ["personalPanel", "groupPanel"].forEach((id) => {
    $(id).classList.toggle("hidden", id !== panelId);
  });

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === panelId);
  });
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function clearMessages() {
  $("messages").innerHTML = "";
}

function appendMessage(message) {
  const mine = String(message.sender?._id || message.sender) === String(state.user.id);

  const element = document.createElement("article");
  element.className = `message ${mine ? "mine" : ""}`;

  const senderName = mine
    ? "You"
    : (message.sender?.name || message.sender?.email || "User");

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = `${senderName} · ${formatTime(message.createdAt)}`;
  element.appendChild(meta);

  if (message.text) {
    const text = document.createElement("div");
    text.className = "message-text";
    text.textContent = message.text;
    element.appendChild(text);
  }

  if (message.media?.url) {
    const mediaWrap = document.createElement("div");
    mediaWrap.className = "media-message";
    const mime = message.media.mimeType || "";

    if (mime.startsWith("image/")) {
      const image = document.createElement("img");
      image.src = message.media.url;
      image.alt = message.media.originalName || "Shared image";
      image.loading = "lazy";
      mediaWrap.appendChild(image);
    } else if (mime.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = message.media.url;
      video.controls = true;
      video.preload = "metadata";
      mediaWrap.appendChild(video);
    } else if (mime.startsWith("audio/")) {
      const audio = document.createElement("audio");
      audio.src = message.media.url;
      audio.controls = true;
      mediaWrap.appendChild(audio);
    } else {
      const link = document.createElement("a");
      link.href = message.media.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = `📎 ${message.media.originalName || "Download file"}`;
      mediaWrap.appendChild(link);
    }

    element.appendChild(mediaWrap);
  }

  $("messages").appendChild(element);
  $("messages").scrollTop = $("messages").scrollHeight;
}
function renderMessages(messages) {
  clearMessages();

  if (!messages.length) {
    $("messages").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👋</div>
        <h3>Start the conversation</h3>
        <p>No messages have been sent in this room yet.</p>
      </div>
    `;
    return;
  }

  messages.forEach(appendMessage);
}

function setChatHeader(type, title, subtitle) {
  $("chatTypeLabel").textContent = type.toUpperCase();
  $("chatTitle").textContent = title;
  $("chatSubtitle").textContent = subtitle;
  $("messageInput").disabled = false;
  $("sendBtn").disabled = false;
  $("mediaBtn").disabled = false;
  $("messageInput").placeholder = "Type a message";
}

function joinRoom(payload, title, subtitle) {
  if (!state.socket?.connected) {
    showToast("Socket is not connected yet", "error");
    return;
  }

  const previousRoom = state.currentRoom;

  const performJoin = () => {
    state.socket.emit("join_room", payload, (result) => {
      if (!result.success) {
        return showToast(result.message, "error");
      }

      state.currentRoom = result.roomId;
      state.currentChatType = payload.chatType;
      if (payload.chatType !== "group") state.currentGroup = null;

      renderMessages(result.messages || []);
      setChatHeader(payload.chatType, title, subtitle);
    });
  };

  if (previousRoom && previousRoom !== payload.roomId) {
    state.socket.emit("leave_room", { roomId: previousRoom }, () => {
      performJoin();
    });
  } else {
    performJoin();
  }
}

async function startPersonalChat() {
  const email = normalizeEmail($("personalEmail").value);

  if (!email) {
    return showToast("Enter an email address", "error");
  }

  if (email === normalizeEmail(state.user.email)) {
    return showToast("You cannot chat with yourself", "error");
  }

  try {
    $("personalResult").textContent = "Checking user in database…";

    const result = await api(`/api/users/exists?email=${encodeURIComponent(email)}`, {
      method: "GET"
    });

    const roomId = createPersonalRoomId(state.user.email, result.user.email);

    $("personalResult").textContent = `Verified: ${result.user.name}`;

    joinRoom(
      {
        roomId,
        chatType: "personal",
        otherEmail: result.user.email
      },
      result.user.name,
      result.user.email
    );
  } catch (error) {
    $("personalResult").textContent = "";
    showToast(error.message, "error");
  }
}

async function createGroup() {
  const name = $("groupName").value.trim();
  const memberEmails = $("groupEmails").value
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);

  try {
    const result = await api("/api/groups", {
      method: "POST",
      body: JSON.stringify({ name, memberEmails })
    });

    $("groupName").value = "";
    $("groupEmails").value = "";

    showToast("Group created successfully");
    await loadGroups();
    openGroup(result.group);
  } catch (error) {
    showToast(error.message, "error");
  }
}

function openGroup(group) {
  state.currentGroup = group;

  joinRoom(
    {
      roomId: group.roomId,
      chatType: "group",
      groupId: group._id
    },
    group.name,
    `${group.members?.length || 0} members`
  );
}

async function loadGroups() {
  try {
    const result = await api("/api/groups", { method: "GET" });
    const list = $("groupList");
    list.innerHTML = "";

    if (!result.groups.length) {
      list.innerHTML = `<div class="side-result">No groups yet.</div>`;
      return;
    }

    result.groups.forEach((group) => {
      const button = document.createElement("button");
      button.className = "group-item";
      button.innerHTML = `<strong></strong><span></span>`;
      button.querySelector("strong").textContent = group.name;
      button.querySelector("span").textContent = `${group.members.length} members`;
      button.addEventListener("click", () => openGroup(group));
      list.appendChild(button);
    });
  } catch (error) {
    showToast(error.message, "error");
  }
}

function sendMessage(event) {
  event.preventDefault();

  const text = $("messageInput").value.trim();

  if (!text || !state.currentRoom) return;

  state.socket.emit("send_message", { text }, (result) => {
    if (!result.success) {
      showToast(result.message, "error");
      return;
    }

    $("messageInput").value = "";
    $("messageInput").focus();
  });
}

function selectMedia() {
  if (!state.currentRoom) {
    return showToast("Select a conversation before sharing media", "error");
  }

  $("mediaInput").click();
}

async function uploadSelectedMedia() {
  const file = $("mediaInput").files[0];
  if (!file) return;

  if (!state.currentRoom || !state.currentChatType) {
    $("mediaInput").value = "";
    return showToast("Select a conversation before sharing media", "error");
  }

  const formData = new FormData();
  formData.append("media", file);
  formData.append("roomId", state.currentRoom);
  formData.append("chatType", state.currentChatType);
  if (state.currentGroup?._id && state.currentChatType === "group") {
    formData.append("groupId", state.currentGroup._id);
  }

  try {
    $("uploadStatus").textContent = `Uploading ${file.name}…`;
    $("mediaBtn").disabled = true;

    const response = await fetch("/api/media/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${state.token}`
      },
      body: formData
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Media upload failed");

    $("uploadStatus").textContent = "Upload complete";
    showToast("Media shared successfully");
  } catch (error) {
    $("uploadStatus").textContent = "Upload failed";
    showToast(error.message || "Unable to upload media", "error");
  } finally {
    $("mediaBtn").disabled = false;
    $("mediaInput").value = "";
    setTimeout(() => {
      $("uploadStatus").textContent = "";
    }, 2500);
  }
}
async function login(event) {
  event.preventDefault();

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: $("loginValue").value.trim(),
        password: $("loginPassword").value
      })
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.message);

    state.token = result.token;
    state.user = result.user;

    localStorage.setItem("token", state.token);
    localStorage.setItem("user", JSON.stringify(state.user));

    setAuthenticatedView();
    showToast("Login successful");
  } catch (error) {
    showToast(error.message || "Unable to login", "error");
  }
}

async function signup(event) {
  event.preventDefault();

  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: $("signupName").value.trim(),
        email: $("signupEmail").value.trim(),
        phone: $("signupPhone").value.trim(),
        password: $("signupPassword").value
      })
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.message);

    showToast("Account created. Please login.");

    document.querySelector('[data-auth="login"]').click();
    $("loginValue").value = $("signupEmail").value.trim();
    $("loginPassword").value = "";
  } catch (error) {
    showToast(error.message || "Unable to create account", "error");
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  state.token = null;
  state.user = null;
  state.currentRoom = null;

  setAuthView();
}

document.querySelectorAll(".auth-tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".auth-tab").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    const signup = button.dataset.auth === "signup";
    $("loginForm").classList.toggle("hidden", signup);
    $("signupForm").classList.toggle("hidden", !signup);
  });
});

document.querySelectorAll(".nav-btn").forEach((button) => {
  button.addEventListener("click", () => switchPanel(button.dataset.panel));
});

$("loginForm").addEventListener("submit", login);
$("signupForm").addEventListener("submit", signup);
$("startPersonalBtn").addEventListener("click", startPersonalChat);
$("createGroupBtn").addEventListener("click", createGroup);
$("messageForm").addEventListener("submit", sendMessage);
$("mediaBtn").addEventListener("click", selectMedia);
$("mediaInput").addEventListener("change", uploadSelectedMedia);
$("logoutBtn").addEventListener("click", logout);

if (state.token && state.user) {
  setAuthenticatedView();
} else {
  setAuthView();
}
