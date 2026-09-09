const signupForm = document.getElementById("signupForm");
const messageElement = document.getElementById("message");

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;

    messageElement.style.color = "#666";
    messageElement.textContent = "Creating account...";

    try {
        const response = await fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            messageElement.style.color = "green";
            messageElement.textContent = data.message;

            signupForm.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
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
