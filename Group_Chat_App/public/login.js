const loginForm = document.getElementById("loginForm");
const messageElement = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const login = document.getElementById("login").value.trim();
    const password = document.getElementById("password").value;

    messageElement.style.color = "#666";
    messageElement.textContent = "Logging in...";

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                login,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            messageElement.style.color = "green";
            messageElement.textContent = data.message;

            console.log("JWT Token:", data.token);
        } else {
            messageElement.style.color = "red";
            messageElement.textContent = data.message;
        }

    } catch (error) {
        console.error(error);
        messageElement.style.color = "red";
        messageElement.textContent = "Unable to connect to server";
    }
});
