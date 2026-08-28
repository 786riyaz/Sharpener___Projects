// public/js/forgot_password.js
const forgotForm = document.getElementById("forgotForm");
const errorMsg = document.getElementById("errorMsg");
const output = document.getElementById("output");

forgotForm.addEventListener("submit", function (event) {
  event.preventDefault();
  errorMsg.textContent = "";
  output.textContent = "";

  const email = document.getElementById("email").value.trim();

  axios
    .post("/password/forgotpassword", { email })
    .then((response) => {
      output.textContent = response.data.message;
    })
    .catch((error) => {
      console.error("Error requesting password reset:", error);
      errorMsg.textContent =
        error.response?.data?.error || "Something went wrong. Please try again.";
    });
});
