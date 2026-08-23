let userRegistrationMsg = document.getElementById("user-registration-msg");

function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirm-password"),
  };

  console.log(data);

  fetch("/user/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      console.log(response);

      if (response.ok) {
        userRegistrationMsg.style.display = "block";

        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }

      return response.text();
    })
    .then((message) => {
      console.log("Server Response ::", message);
    })
    .catch((error) => {
      console.error("Registration failed:", error);
    });
}
