const loginForm =
    document.getElementById("loginForm");

const errorMessage =
    document.getElementById("errorMessage");

loginForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        errorMessage.textContent = "";

        const login =
            document
                .getElementById("login")
                .value;

        const password =
            document
                .getElementById("password")
                .value;

        try {
            const response =
                await fetch("/api/login", {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        login,
                        password
                    })
                });

            const data =
                await response.json();

            if (!response.ok) {
                errorMessage.textContent =
                    data.message ||
                    "Login failed";

                return;
            }

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            window.location.href = "/";
        } catch (error) {
            errorMessage.textContent =
                "Unable to connect to server";
        }
    }
);
