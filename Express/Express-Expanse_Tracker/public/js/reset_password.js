// public/js/reset_password.js
const resetForm = document.getElementById("resetForm");
const errorMsg = document.getElementById("errorMsg");
const output = document.getElementById("output");

// The link in the email looks like:
//   /reset-password.html?token=<rawToken>&email=<email>
const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const email = params.get("email");

if (!token || !email) {
  errorMsg.textContent = "This reset link is missing information. Please request a new one.";
  resetForm.querySelector("button[type=submit]").disabled = true;
}

resetForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";
  output.textContent = "";

  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  try {
    const res = await fetch("/password/resetpassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, password, confirmPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      errorMsg.textContent = data.error || "Could not reset password.";
      return;
    }
    output.textContent = data.message + " Redirecting to log in...";
    setTimeout(() => {
      window.location.href = "/login.html";
    }, 1500);
  } catch (err) {
    errorMsg.textContent = "Something went wrong. Please try again.";
  }
});
