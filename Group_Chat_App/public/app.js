const state = {
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "null"),
  socket: null,
  currentRoom: null,
  currentChatType: null,
  currentGroup: null,
  maxFileSize: 25 * 1024 * 1024,
  maxFiles: 10,
  uploading: false
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
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

async function loadMediaConfig() {
  try {
    const result = await api("/api/media/config", { method: "GET" });
    state.maxFileSize = result.maxFileSize || state.maxFileSize;
    state.maxFiles = result.maxFiles || state.maxFiles;
  } catch {
    // Keep safe defaults if config cannot be loaded.
  }
}

function setAuthenticatedView() {
  $("authView").classList.add("hidden");
  $("appView").classList.remove("hidden");
  $("currentUserName").textContent = state.user.name;
  $("currentUserEmail").textContent = state.user.email;
  connectSocket();
  loadGroups();
  loadMediaConfig();
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

  state.socket = io({ auth: { token: state.token } });

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
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function clearMessages() {
  $("messages").innerHTML = "";
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}

function appendMessage(message) {
  // If a reconnect/history refresh returns a message already rendered through
  // Socket.IO, do not duplicate it.
  const id = String(message._id || message.id || "");
  if (id && document.querySelector(`[data-message-id="${CSS.escape(id)}"]`)) return;

  const mine = String(message.sender?._id || message.sender) === String(state.user.id);
  const element = document.createElement("article");
  element.className = `message ${mine ? "mine" : ""}`;
  if (id) element.dataset.messageId = id;

  const senderName = mine ? "You" : (message.sender?.name || message.sender?.email || "User");
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
      image.addEventListener("error", () => {
        mediaWrap.classList.add("media-error");
        image.replaceWith(createMediaFallback(message.media));
      });
      mediaWrap.appendChild(image);
    } else if (mime.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = message.media.url;
      video.controls = true;
      video.preload = "metadata";
      video.playsInline = true;
      video.addEventListener("error", () => mediaWrap.classList.add("media-error"));
      mediaWrap.appendChild(video);
    } else if (mime.startsWith("audio/")) {
      const audio = document.createElement("audio");
      audio.src = message.media.url;
      audio.controls = true;
      audio.preload = "metadata";
      mediaWrap.appendChild(audio);
    } else {
      mediaWrap.appendChild(createMediaFallback(message.media));
    }

    const fileMeta = document.createElement("div");
    fileMeta.className = "file-meta";
    fileMeta.textContent = `${message.media.originalName || "Shared file"}${message.media.size ? ` · ${formatBytes(message.media.size)}` : ""}`;
    mediaWrap.appendChild(fileMeta);
    element.appendChild(mediaWrap);
  }

  $("messages").appendChild(element);
  $("messages").scrollTop = $("messages").scrollHeight;
}

function createMediaFallback(media) {
  const link = document.createElement("a");
  link.href = media.url;
  link.target = "_blank";
  link.rel = "noopener";
  link.className = "file-link";
  link.textContent = `📎 ${media.originalName || "Open file"}`;
  return link;
}

function renderMessages(messages) {
  clearMessages();
  if (!messages.length) {
    $("messages").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👋</div>
        <h3>Start the conversation</h3>
        <p>No messages have been sent in this room yet.</p>
      </div>`;
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
  if (!state.socket?.connected) return showToast("Socket is not connected yet", "error");
  const previousRoom = state.currentRoom;

  const performJoin = () => {
    state.socket.emit("join_room", payload, (result) => {
      if (!result.success) return showToast(result.message, "error");
      state.currentRoom = result.roomId;
      state.currentChatType = payload.chatType;
      if (payload.chatType !== "group") state.currentGroup = null;
      renderMessages(result.messages || []);
      setChatHeader(payload.chatType, title, subtitle);
    });
  };

  if (previousRoom && previousRoom !== payload.roomId) {
    state.socket.emit("leave_room", { roomId: previousRoom }, performJoin);
  } else {
    performJoin();
  }
}

async function startPersonalChat() {
  const email = normalizeEmail($("personalEmail").value);
  if (!email) return showToast("Enter an email address", "error");
  if (email === normalizeEmail(state.user.email)) return showToast("You cannot chat with yourself", "error");

  try {
    $("personalResult").textContent = "Checking user in database…";
    const result = await api(`/api/users/exists?email=${encodeURIComponent(email)}`, { method: "GET" });
    const roomId = createPersonalRoomId(state.user.email, result.user.email);
    $("personalResult").textContent = `Verified: ${result.user.name}`;
    joinRoom({ roomId, chatType: "personal", otherEmail: result.user.email }, result.user.name, result.user.email);
  } catch (error) {
    $("personalResult").textContent = "";
    showToast(error.message, "error");
  }
}

async function createGroup() {
  const name = $("groupName").value.trim();
  const memberEmails = $("groupEmails").value.split(",").map(normalizeEmail).filter(Boolean);
  try {
    const result = await api("/api/groups", { method: "POST", body: JSON.stringify({ name, memberEmails }) });
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
  joinRoom({ roomId: group.roomId, chatType: "group", groupId: group._id }, group.name, `${group.members?.length || 0} members`);
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
  if (!text || !state.currentRoom || state.uploading) return;
  state.socket.emit("send_message", { text }, (result) => {
    if (!result.success) return showToast(result.message, "error");
    $("messageInput").value = "";
    $("messageInput").focus();
  });
}

function selectMedia() {
  if (!state.currentRoom) return showToast("Select a conversation before sharing media", "error");
  if (state.uploading) return showToast("An upload is already in progress", "error");
  $("mediaInput").click();
}

function validateFiles(files) {
  const allowed = [
    /^image\//, /^video\//, /^audio\//,
    /^application\/pdf$/, /^application\/(zip|x-zip-compressed)$/,
    /^text\/plain$/, /^application\/msword$/,
    /^application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document$/,
    /^application\/vnd\.ms-excel$/,
    /^application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet$/,
    /^application\/vnd\.ms-powerpoint$/,
    /^application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation$/
  ];

  if (files.length > state.maxFiles) throw new Error(`You can upload up to ${state.maxFiles} files at a time`);
  for (const file of files) {
    if (file.size > state.maxFileSize) throw new Error(`${file.name} is larger than ${formatBytes(state.maxFileSize)}`);
    if (!allowed.some((rule) => rule.test(file.type))) throw new Error(`${file.name} has an unsupported file type`);
  }
}

function uploadOneFile(file, attempt = 1, onProgress = () => {}) {
  const MAX_ATTEMPTS = 3;

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("media", file);
    formData.append("roomId", state.currentRoom);
    formData.append("chatType", state.currentChatType);
    if (state.currentGroup?._id && state.currentChatType === "group") formData.append("groupId", state.currentGroup._id);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media/upload");
    xhr.setRequestHeader("Authorization", `Bearer ${state.token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let result = {};
      try { result = JSON.parse(xhr.responseText || "{}"); } catch {}

      if (xhr.status >= 200 && xhr.status < 300) return resolve(result);

      const retryable = xhr.status === 0 || xhr.status >= 500;
      if (retryable && attempt < MAX_ATTEMPTS) {
        const delay = 600 * attempt;
        setTimeout(() => uploadOneFile(file, attempt + 1, onProgress).then(resolve).catch(reject), delay);
        return;
      }
      reject(new Error(result.message || `Upload failed (${xhr.status || "network error"})`));
    };

    xhr.onerror = () => {
      if (attempt < MAX_ATTEMPTS) {
        const delay = 600 * attempt;
        setTimeout(() => uploadOneFile(file, attempt + 1, onProgress).then(resolve).catch(reject), delay);
      } else {
        reject(new Error("Network error while uploading media"));
      }
    };

    xhr.send(formData);
  });
}

async function uploadSelectedMedia() {
  const files = Array.from($("mediaInput").files || []);
  if (!files.length) return;
  if (!state.currentRoom || !state.currentChatType) {
    $("mediaInput").value = "";
    return showToast("Select a conversation before sharing media", "error");
  }

  try {
    validateFiles(files);
    state.uploading = true;
    $("mediaBtn").disabled = true;
    $("sendBtn").disabled = true;

    let completed = 0;
    for (const file of files) {
      $("uploadStatus").textContent = `Uploading ${completed + 1}/${files.length}: ${file.name} (0%)`;
      await uploadOneFile(file, 1, (percent) => {
        $("uploadStatus").textContent = `Uploading ${completed + 1}/${files.length}: ${file.name} (${percent}%)`;
      });
      completed += 1;
    }

    $("uploadStatus").textContent = `${completed} file${completed === 1 ? "" : "s"} shared successfully`;
    showToast("Media shared successfully");
  } catch (error) {
    $("uploadStatus").textContent = "Upload failed";
    showToast(error.message || "Unable to upload media", "error");
  } finally {
    state.uploading = false;
    $("mediaBtn").disabled = !state.currentRoom;
    $("sendBtn").disabled = !state.currentRoom;
    $("mediaInput").value = "";
    setTimeout(() => { $("uploadStatus").textContent = ""; }, 3000);
  }
}

async function login(event) {
  event.preventDefault();
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: $("loginValue").value.trim(), password: $("loginPassword").value })
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
  state.currentChatType = null;
  state.currentGroup = null;
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

document.querySelectorAll(".nav-btn").forEach((button) => button.addEventListener("click", () => switchPanel(button.dataset.panel)));
$("loginForm").addEventListener("submit", login);
$("signupForm").addEventListener("submit", signup);
$("startPersonalBtn").addEventListener("click", startPersonalChat);
$("createGroupBtn").addEventListener("click", createGroup);
$("messageForm").addEventListener("submit", sendMessage);
$("mediaBtn").addEventListener("click", selectMedia);
$("mediaInput").addEventListener("change", uploadSelectedMedia);
$("logoutBtn").addEventListener("click", logout);

if (state.token && state.user) setAuthenticatedView();
else setAuthView();
