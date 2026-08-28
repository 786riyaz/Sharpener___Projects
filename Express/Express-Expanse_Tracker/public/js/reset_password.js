// public/js/reset_password.js
const resetForm = document.getElementById("resetForm");
const errorMsg = document.getElementById("errorMsg");
const output = document.getElementById("output");
// The link in the email looks like:
//   /password/resetpassword/<uuid>
// and the backend only serves this page when that uuid is a valid,
// still-active request - so we just read the uuid back out of the URL.
const pathParts = window.location.pathname.split("/").filter(Boolean);
const requestId = pathParts[pathParts.length - 1];
resetForm.addEventListener("submit", async (e) => {
e.preventDefault();
errorMsg.textContent = "";
output.textContent = "";
const password = document.getElementById("password").value;
const confirmPassword = document.getElementById("confirmPassword").value;
try {
const res = await fetch(`/password/resetpassword/${requestId}`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ password, confirmPassword }),
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
