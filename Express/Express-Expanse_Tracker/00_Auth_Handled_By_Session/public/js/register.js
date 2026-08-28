const registerForm = document.getElementById("registerForm");
const errorMsg = document.getElementById("errorMsg");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    errorMsg.textContent = "Passwords do not match.";
    return;
  }

  try {
    const res = await fetch("/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    const text = await res.text();

    if (res.ok) {
      window.location.href = "/login.html";
      return;
    }

    try {
      const data = JSON.parse(text);
      errorMsg.textContent = data.error || "Registration failed.";
    } catch {
      errorMsg.textContent = text || "Registration failed.";
    }
  } catch (err) {
    errorMsg.textContent = "Something went wrong. Please try again.";
  }
});
