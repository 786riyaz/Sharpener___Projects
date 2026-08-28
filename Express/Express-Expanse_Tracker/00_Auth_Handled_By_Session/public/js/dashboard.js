const welcomeMsg = document.getElementById("welcomeMsg");
const logoutBtn = document.getElementById("logoutBtn");
const expenseForm = document.getElementById("expenseForm");
const expenseTableBody = document.querySelector("#expenseTable tbody");
const emptyState = document.getElementById("emptyState");
const errorMsg = document.getElementById("errorMsg");
const totalAmountEl = document.getElementById("totalAmount");

// Step 1: check whether this visitor is actually logged in.
// If not, they're bounced to the login page - the dashboard is never shown.
async function checkAuth() {
  try {
    const res = await fetch("/user/session");
    const data = await res.json();
    if (!data.loggedIn) {
      window.location.href = "/login.html";
      return;
    }
    welcomeMsg.textContent = `Welcome, ${data.user.name}`;
    loadExpenses();
  } catch {
    window.location.href = "/login.html";
  }
}

// Step 2 (feature 4): pull the user's existing expenses from the backend,
// called both on page load and after every add/delete.
async function loadExpenses() {
  try {
    const res = await fetch("/expanse");
    if (!res.ok) throw new Error("Failed to load expenses.");
    const expenses = await res.json();
    renderExpenses(expenses);
  } catch (err) {
    errorMsg.textContent = err.message;
  }
}

function renderExpenses(expenses) {
  expenseTableBody.innerHTML = "";
  let total = 0;

  if (expenses.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  expenses.forEach((exp) => {
    total += Number(exp.amount);
    const row = document.createElement("tr");

    const dateStr = new Date(exp.createdAt).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
    });

    row.innerHTML = `
      <td><span class="category-pill">${escapeHtml(exp.category)}</span></td>
      <td>${escapeHtml(exp.description)}</td>
      <td class="amount-cell">₹${Number(exp.amount).toFixed(2)}</td>
      <td>${dateStr}</td>
      <td><button class="deleteBtn" data-id="${exp.id}">Delete</button></td>
    `;
    expenseTableBody.appendChild(row);
  });

  totalAmountEl.textContent = total.toFixed(2);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Step 3 (feature 3): add a new expense.
expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const amount = document.getElementById("amount").value;
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;

  if (!amount || !description || !category) {
    errorMsg.textContent = "Please fill in all fields.";
    return;
  }

  try {
    const res = await fetch("/expanse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, description, category }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add expense.");

    expenseForm.reset();
    loadExpenses();
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});

// Delete an expense.
expenseTableBody.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("deleteBtn")) return;
  const id = e.target.dataset.id;

  try {
    const res = await fetch(`/expanse/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete expense.");
    loadExpenses();
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});

logoutBtn.addEventListener("click", async () => {
  await fetch("/user/logout", { method: "POST" });
  window.location.href = "/login.html";
});

checkAuth();

// The browser can restore this exact page from its back-forward cache when
// the user hits "Back" - without re-running the script from scratch. That
// would show stale data after logout, so re-check auth whenever the page
// is (re)shown, including from bfcache.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    checkAuth();
  }
});
