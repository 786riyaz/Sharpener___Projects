const API_URL = "/expenses";

const expenseForm = document.getElementById("expenseForm");
const expenseIdInput = document.getElementById("expenseId");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const expenseDateInput = document.getElementById("expenseDate");

const expenseList = document.getElementById("expenseList");
const loading = document.getElementById("loading");
const emptyState = document.getElementById("emptyState");

const totalExpenses = document.getElementById("totalExpenses");
const totalAmount = document.getElementById("totalAmount");
const averageAmount = document.getElementById("averageAmount");

const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const refreshButton = document.getElementById("refreshButton");
const statusMessage = document.getElementById("statusMessage");

let expenses = [];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(Number(amount));
};

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const showStatus = (message, type = "") => {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;

  if (message) {
    setTimeout(() => {
      statusMessage.textContent = "";
      statusMessage.className = "status-message";
    }, 3000);
  }
};

const updateSummary = () => {
  const count = expenses.length;
  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.Amount),
    0
  );

  totalExpenses.textContent = count;
  totalAmount.textContent = formatCurrency(total);
  averageAmount.textContent = formatCurrency(count ? total / count : 0);
};

const renderExpenses = () => {
  expenseList.innerHTML = "";

  if (expenses.length === 0) {
    emptyState.classList.remove("hidden");
    updateSummary();
    return;
  }

  emptyState.classList.add("hidden");

  expenses.forEach((expense) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${escapeHtml(expense.Description)}</td>
      <td>
        <span class="category">${escapeHtml(expense.Category)}</span>
      </td>
      <td>${formatDate(expense.ExpenseDate)}</td>
      <td class="amount">${formatCurrency(expense.Amount)}</td>
      <td>
        <div class="action-buttons">
          <button class="edit-btn" data-action="edit" data-id="${expense.Id}">
            Edit
          </button>
          <button class="delete-btn" data-action="delete" data-id="${expense.Id}">
            Delete
          </button>
        </div>
      </td>
    `;

    expenseList.appendChild(row);
  });

  updateSummary();
};

const escapeHtml = (value) => {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
};

const loadExpenses = async () => {
  loading.classList.remove("hidden");

  try {
    const response = await axios.get(API_URL);
    expenses = response.data;
    renderExpenses();
  } catch (error) {
    console.error(error);
    showStatus(
      error.response?.data?.message || "Could not load expenses.",
      "error"
    );
  } finally {
    loading.classList.add("hidden");
  }
};

const resetForm = () => {
  expenseForm.reset();
  expenseIdInput.value = "";
  expenseDateInput.value = new Date().toISOString().slice(0, 10);

  formTitle.textContent = "Add Expense";
  submitButton.textContent = "Add Expense";
  cancelButton.classList.add("hidden");
};

const startEdit = (id) => {
  const expense = expenses.find((item) => item.Id === Number(id));

  if (!expense) {
    showStatus("Expense not found.", "error");
    return;
  }

  expenseIdInput.value = expense.Id;
  descriptionInput.value = expense.Description;
  amountInput.value = expense.Amount;
  categoryInput.value = expense.Category;
  expenseDateInput.value = expense.ExpenseDate;

  formTitle.textContent = "Edit Expense";
  submitButton.textContent = "Update Expense";
  cancelButton.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

const deleteExpense = async (id) => {
  const expense = expenses.find((item) => item.Id === Number(id));

  if (!expense) return;

  const confirmed = window.confirm(
    `Delete "${expense.Description}"?`
  );

  if (!confirmed) return;

  try {
    await axios.delete(`${API_URL}/${id}`);
    showStatus("Expense deleted successfully.", "success");
    await loadExpenses();

    if (expenseIdInput.value === String(id)) {
      resetForm();
    }
  } catch (error) {
    console.error(error);
    showStatus(
      error.response?.data?.message || "Could not delete expense.",
      "error"
    );
  }
};

expenseForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    description: descriptionInput.value.trim(),
    amount: Number(amountInput.value),
    category: categoryInput.value,
    expenseDate: expenseDateInput.value
  };

  const editingId = expenseIdInput.value;

  try {
    if (editingId) {
      await axios.put(`${API_URL}/${editingId}`, payload);
      showStatus("Expense updated successfully.", "success");
    } else {
      await axios.post(API_URL, payload);
      showStatus("Expense added successfully.", "success");
    }

    resetForm();
    await loadExpenses();
  } catch (error) {
    console.error(error);
    showStatus(
      error.response?.data?.message || "Could not save expense.",
      "error"
    );
  }
});

expenseList.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) return;

  const { action, id } = button.dataset;

  if (action === "edit") {
    startEdit(id);
  }

  if (action === "delete") {
    deleteExpense(id);
  }
});

cancelButton.addEventListener("click", resetForm);
refreshButton.addEventListener("click", loadExpenses);

expenseDateInput.value = new Date().toISOString().slice(0, 10);

loadExpenses();
