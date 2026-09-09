const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

function saveLogin(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
}

if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const messageElement = document.getElementById("message");

        try {
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: document.getElementById("name").value,
                    email: document.getElementById("email").value,
                    phone: document.getElementById("phone").value,
                    password: document.getElementById("password").value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                messageElement.textContent = data.message;
                return;
            }

            saveLogin(data);
            window.location.href = "/chat.html";
        } catch (error) {
            messageElement.textContent = "Unable to connect to server";
        }
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const messageElement = document.getElementById("message");

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    identifier: document.getElementById("identifier").value,
                    password: document.getElementById("password").value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                messageElement.textContent = data.message;
                return;
            }

            saveLogin(data);
            window.location.href = "/chat.html";
        } catch (error) {
            messageElement.textContent = "Unable to connect to server";
        }
    });
}
