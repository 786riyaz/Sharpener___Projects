let userRegistrationMsg = document.getElementById("user-registration-msg");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("toggle-password");

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  console.log(data);

  fetch("/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      const message = await response.text();

      if (response.ok) {
        userRegistrationMsg.style.display = "block";
        userRegistrationMsg.innerText = message;

        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        userRegistrationMsg.style.display = "block";
        userRegistrationMsg.innerText = message;
      }
    })
    .catch((error) => {
      console.error("Registration failed :".error);
    });
}

togglePassword.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
});
