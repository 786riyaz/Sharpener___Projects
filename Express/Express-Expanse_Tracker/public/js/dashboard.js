const welcomeMsg = document.getElementById("welcomeMsg");
const logoutBtn = document.getElementById("logoutBtn");
const buyPremiumBtn = document.getElementById("buyPremiumBtn");
const premiumBadge = document.getElementById("premiumBadge");
const premiumHeadline = document.getElementById("premiumHeadline");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const leaderboardModal = document.getElementById("leaderboardModal");
const closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");
const leaderboardList = document.getElementById("leaderboardList");
const leaderboardEmpty = document.getElementById("leaderboardEmpty");
const paymentBanner = document.getElementById("paymentBanner");
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
    updatePremiumUI(data.user.isPremium);
    loadExpenses();
    handlePaymentReturn();
  } catch {
    window.location.href = "/login.html";
  }
}

function updatePremiumUI(isPremium) {
  if (isPremium) {
    premiumBadge.style.display = "inline-block";
    buyPremiumBtn.style.display = "none";
    premiumHeadline.style.display = "block";
    leaderboardBtn.style.display = "inline-block";
  } else {
    premiumBadge.style.display = "none";
    buyPremiumBtn.style.display = "inline-block";
    premiumHeadline.style.display = "none";
    leaderboardBtn.style.display = "none";
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

// --- Premium membership purchase (Cashfree) ---

buyPremiumBtn.addEventListener("click", async () => {
  buyPremiumBtn.disabled = true;
  buyPremiumBtn.textContent = "Loading...";
  try {
    const res = await fetch("/payment/create-order", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not start payment.");

    // Cashfree's hosted checkout SDK, loaded via <script> in dashboard.html.
    const cashfree = Cashfree({ mode: "sandbox" });
    cashfree.checkout({
      paymentSessionId: data.paymentSessionId,
      redirectTarget: "_self", // stay in the current tab, then redirect back to us
    });
  } catch (err) {
    showBanner("failure", err.message);
    buyPremiumBtn.disabled = false;
    buyPremiumBtn.textContent = "Buy Premium Membership";
  }
});

// After Cashfree redirects back here, the URL looks like
// /dashboard.html?order_id=premium_13_172... - check it and show the result.
async function handlePaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");
  if (!orderId) return;

  // Clean the query string out of the address bar right away so a refresh
  // or the back button doesn't re-trigger verification.
  window.history.replaceState({}, "", "/dashboard.html");

  try {
    const res = await fetch(`/payment/verify/${orderId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not verify payment.");

    if (data.status === "SUCCESS") {
      showBanner("success", "Transaction successful! You're now a Premium Member.");
      updatePremiumUI(true);
    } else if (data.status === "FAILED") {
      showBanner("failure", "TRANSACTION FAILED. Please try again.");
    } else {
      showBanner("pending", "Your payment is still pending. We'll update your status shortly.");
    }
  } catch (err) {
    showBanner("failure", err.message);
  } finally {
    buyPremiumBtn.disabled = false;
    buyPremiumBtn.textContent = "Buy Premium Membership";
  }
}

function showBanner(type, message) {
  paymentBanner.textContent = message;
  paymentBanner.className = `payment-banner ${type}`;
  paymentBanner.style.display = "block";
}

// --- Premium feature: user leaderboard ---

leaderboardBtn.addEventListener("click", async () => {
  await loadLeaderboard();
  openLeaderboardModal();
});

closeLeaderboardBtn.addEventListener("click", closeLeaderboardModal);

// Close when clicking the dark overlay outside the card.
leaderboardModal.addEventListener("click", (e) => {
  if (e.target === leaderboardModal) closeLeaderboardModal();
});

// Close on Escape.
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && leaderboardModal.style.display !== "none") {
    closeLeaderboardModal();
  }
});

function openLeaderboardModal() {
  leaderboardModal.style.display = "flex";
}

function closeLeaderboardModal() {
  leaderboardModal.style.display = "none";
}

async function loadLeaderboard() {
  leaderboardList.innerHTML = "";
  leaderboardEmpty.style.display = "none";
  try {
    const res = await fetch("/premium/leaderboard");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load leaderboard.");
    renderLeaderboard(data);
  } catch (err) {
    leaderboardEmpty.textContent = err.message;
    leaderboardEmpty.style.display = "block";
  }
}

function renderLeaderboard(entries) {
  leaderboardList.innerHTML = "";

  if (entries.length === 0) {
    leaderboardEmpty.textContent = "No expenses recorded yet.";
    leaderboardEmpty.style.display = "block";
    return;
  }
  leaderboardEmpty.style.display = "none";

  entries.forEach((entry, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="lb-rank">#${index + 1}</span>
      <span class="lb-name">${escapeHtml(entry.name)}</span>
      <span class="lb-amount">₹${Number(entry.totalExpense).toFixed(2)}</span>
    `;
    leaderboardList.appendChild(li);
  });
}

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

let debounceTimer;
document.getElementById("description").addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  const description = e.target.value;
  if (description.trim().length < 3) return;

  debounceTimer = setTimeout(async () => {
    try {
      const res = await fetch("/expanse/suggest-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (res.ok) document.getElementById("category").value = data.category;
    } catch (err) {
      console.error("AI suggestion failed:", err);
    }
  }, 600); // wait for the user to pause typing
});

// Optional: an "AI Tip" card fetched once the dashboard loads.
async function loadInsight() {
  try {
    console.log("Calling AI Insight");
    const res = await fetch("/expanse/insights");
    const data = await res.json();
    document.getElementById("ai-tip").textContent = data.insight;
  } catch (err) {
    console.error("Failed to load AI insight:", err);
  }
}
loadInsight();
