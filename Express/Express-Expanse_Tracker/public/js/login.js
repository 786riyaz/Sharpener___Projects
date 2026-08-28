const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");
if (new URLSearchParams(window.location.search).get("resetError") === "invalid") {
  errorMsg.textContent = "That reset link is invalid or has already been used.";
}
// If the user is already logged in, skip straight to the dashboard.
(async function redirectIfLoggedIn() {
  try {
    const res = await fetch("/user/session");
    const data = await res.json();
    if (data.loggedIn) {
      window.location.href = "/dashboard.html";
    }
  } catch {
    // ignore - just show the login form as normal
  }
})();
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    const res = await fetch("/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      window.location.href = "/dashboard.html";
      return;
    }
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      errorMsg.textContent = data.error || "Login failed.";
    } catch {
      errorMsg.textContent = text || "Login failed.";
    }
  } catch (err) {
    errorMsg.textContent = "Something went wrong. Please try again.";
  }
});
function forgotPassword(event) {
  event.preventDefault();
  window.location.href = "/forgot-password.html";
}
