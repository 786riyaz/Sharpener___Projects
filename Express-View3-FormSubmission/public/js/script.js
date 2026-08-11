console.log("Script loaded successfully!");

const onSubmit = (event) => {
  event.preventDefault();

  // Approach 1: Using FormData to get form values
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());
  console.log("Form Data Submitted:", data);

  // Approach 2: Directly accessing form elements
  const productName = event.target.product.value;
  console.log("Product ::", productName);

  axios.post(`/api/products`, { productName }).then((response) => {
    console.log("Response from server:", response.data);
    console.log(response.data.message);
  });
};

