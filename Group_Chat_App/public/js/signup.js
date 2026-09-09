const signupForm =
    document.getElementById("signupForm");

const errorMessage =
    document.getElementById("errorMessage");

signupForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        errorMessage.textContent = "";

        const name =
            document
                .getElementById("name")
                .value;

        const email =
            document
                .getElementById("email")
                .value;

        const phone =
            document
                .getElementById("phone")
                .value;

        const password =
            document
                .getElementById("password")
                .value;

        try {
            const response =
                await fetch("/api/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        password
                    })
                });

            const data =
                await response.json();

            if (!response.ok) {
                errorMessage.textContent =
                    data.message ||
                    "Signup failed";

                return;
            }

            alert(
                "Signup successful. Please login."
            );

            window.location.href =
                "/login.html";
        } catch (error) {
            errorMessage.textContent =
                "Unable to connect to server";
        }
    }
);
