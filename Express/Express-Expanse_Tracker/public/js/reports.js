// public/js/reports.js
// Premium "Reports" feature - FRONTEND ONLY for now.
// Reuses the existing GET /expanse endpoint (already available to any
// logged-in user) and aggregates it client-side into daily / weekly /
// monthly views. No new backend routes are introduced here - a future
// task can swap loadExpenses()/buildDownloadFile() to call a dedicated
// backend report/export endpoint without changing this page's markup.

const premiumBadge = document.getElementById("premiumBadge");
const lockedCard = document.getElementById("lockedCard");
const reportContent = document.getElementById("reportContent");
const reportEmpty = document.getElementById("reportEmpty");
const reportTables = document.getElementById("reportTables");
const downloadBtn = document.getElementById("downloadBtn");
const viewTabs = document.getElementById("viewTabs");
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const totalSavingsEl = document.getElementById("totalSavings");
const allExpensesPagination = document.getElementById("allExpensesPagination");
const allPrevPageBtn = document.getElementById("allPrevPageBtn");
const allNextPageBtn = document.getElementById("allNextPageBtn");
const allPageInfo = document.getElementById("allPageInfo");

let allExpenses = [];
let currentView = "daily";
let isPremiumUser = false;

// "All Expenses" tab pagination - independent of the Daily/Weekly/Monthly
// views above, which need the FULL unpaginated `allExpenses` array to
// compute correct totals/subtotals.
const ALL_PAGE_SIZE = 10;
let allViewPage = 1;
let allViewTotalPages = 1;

// Categories that represent money coming in. The Expanse model doesn't
// have an explicit income/expense flag yet, so - matching how "Salary"
// is already used as a category in this app - anything filed under
// Salary is treated as income and everything else as an expense.
const INCOME_CATEGORIES = new Set(["Salary"]);

async function checkAuthAndLoad() {
  try {
    const res = await fetch("/user/session");
    const data = await res.json();
    if (!data.loggedIn) {
      window.location.href = "/login.html";
      return;
    }
    isPremiumUser = !!data.user.isPremium;
    premiumBadge.style.display = isPremiumUser ? "inline-block" : "none";

    if (!isPremiumUser) {
      lockedCard.style.display = "block";
      reportContent.style.display = "none";
      setDownloadEnabled(false);
      return;
    }

    lockedCard.style.display = "none";
    reportContent.style.display = "block";
    setDownloadEnabled(true);
    await loadExpenses();
    renderCurrentView();
  } catch {
    window.location.href = "/login.html";
  }
}

async function loadExpenses() {
  const res = await fetch("/expanse");
  if (!res.ok) throw new Error("Failed to load expenses.");
  allExpenses = await res.json();
}

function setDownloadEnabled(enabled) {
  downloadBtn.disabled = !enabled;
  downloadBtn.title = enabled ? "Download report" : "Upgrade to Premium to download reports";
}

// --- Tabs ---
viewTabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab-btn");
  if (!btn) return;
  viewTabs.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  currentView = btn.dataset.view;
  renderCurrentView();
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function money(n) {
  return `₹${Number(n || 0).toFixed(2)}`;
}

function isIncome(exp) {
  return INCOME_CATEGORIES.has(exp.category);
}

function dayKey(d) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

// ISO-ish week key: year + week number (Mon-Sun), so "weekly" groups
// expenses that fall in the same calendar week.
function weekKey(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function weekRangeLabel(dates) {
  const sorted = [...dates].sort((a, b) => a - b);
  const start = sorted[0];
  const end = sorted[sorted.length - 1];
  const fmt = (d) => d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
  return `${fmt(start)} - ${fmt(end)}`;
}

function renderCurrentView() {
  reportTables.innerHTML = "";
  computeOverallTotals();
  allExpensesPagination.style.display = "none";

  if (allExpenses.length === 0) {
    reportEmpty.style.display = "block";
    return;
  }
  reportEmpty.style.display = "none";

  if (currentView === "daily") renderDaily();
  else if (currentView === "weekly") renderWeekly();
  else if (currentView === "monthly") renderMonthly();
  else loadAllExpensesPage(1);
}

// --- "All Expenses" tab: flat, paginated list (10 per page) ---
async function loadAllExpensesPage(page) {
  try {
    const res = await fetch(`/expanse?page=${page}&limit=${ALL_PAGE_SIZE}`);
    if (!res.ok) throw new Error("Failed to load expenses.");
    const data = await res.json();
    allViewPage = data.currentPage;
    allViewTotalPages = data.totalPages;
    renderAllExpensesTable(data.expenses);
    renderAllExpensesPagination(data.totalCount);
  } catch (err) {
    reportEmpty.textContent = err.message;
    reportEmpty.style.display = "block";
  }
}

function renderAllExpensesTable(expenses) {
  let rowsHtml = "";
  expenses.forEach((exp) => {
    const income = isIncome(exp);
    rowsHtml += `
      <tr>
        <td>${new Date(exp.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</td>
        <td>${escapeHtml(exp.description)}</td>
        <td>${escapeHtml(exp.category)}</td>
        <td class="amount-cell">${income ? money(exp.amount) : ""}</td>
        <td class="amount-cell expense-amount">${income ? "" : money(exp.amount)}</td>
      </tr>`;
  });
  reportTables.innerHTML = `
    <table class="report-table">
      <thead>
        <tr><th>Date</th><th>Description</th><th>Category</th><th>Income</th><th>Expense</th></tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>`;
}

function renderAllExpensesPagination(totalCount) {
  allExpensesPagination.style.display = "flex";
  allPageInfo.textContent = `Page ${allViewPage} of ${allViewTotalPages} (${totalCount} total)`;
  allPrevPageBtn.disabled = allViewPage <= 1;
  allNextPageBtn.disabled = allViewPage >= allViewTotalPages;
}

allPrevPageBtn.addEventListener("click", () => {
  if (allViewPage > 1) loadAllExpensesPage(allViewPage - 1);
});
allNextPageBtn.addEventListener("click", () => {
  if (allViewPage < allViewTotalPages) loadAllExpensesPage(allViewPage + 1);
});

function computeOverallTotals() {
  let income = 0;
  let expense = 0;
  allExpenses.forEach((exp) => {
    if (isIncome(exp)) income += Number(exp.amount);
    else expense += Number(exp.amount);
  });
  totalIncomeEl.textContent = money(income);
  totalExpenseEl.textContent = money(expense);
  totalSavingsEl.textContent = money(income - expense);
}

// --- Daily view: each day's rows plus a per-day + per-month subtotal ---
function renderDaily() {
  const byMonth = new Map();
  allExpenses.forEach((exp) => {
    const d = new Date(exp.createdAt);
    const mKey = monthKey(d);
    if (!byMonth.has(mKey)) byMonth.set(mKey, new Map());
    const byDay = byMonth.get(mKey);
    const dKey = dayKey(d);
    if (!byDay.has(dKey)) byDay.set(dKey, []);
    byDay.get(dKey).push(exp);
  });

  const monthKeys = [...byMonth.keys()].sort().reverse();
  monthKeys.forEach((mKey) => {
    const byDay = byMonth.get(mKey);
    const dayKeys = [...byDay.keys()].sort().reverse();

    let monthIncome = 0;
    let monthExpense = 0;
    let rowsHtml = "";

    dayKeys.forEach((dKey) => {
      const rows = byDay.get(dKey);
      let dayIncome = 0;
      let dayExpense = 0;
      rows.forEach((exp, i) => {
        const income = isIncome(exp);
        if (income) dayIncome += Number(exp.amount);
        else dayExpense += Number(exp.amount);
        rowsHtml += `
          <tr>
            <td>${i === 0 ? formatDate(dKey) : ""}</td>
            <td>${escapeHtml(exp.description)}</td>
            <td>${escapeHtml(exp.category)}</td>
            <td class="amount-cell">${income ? money(exp.amount) : ""}</td>
            <td class="amount-cell expense-amount">${income ? "" : money(exp.amount)}</td>
          </tr>`;
      });
      rowsHtml += `
        <tr class="report-subtotal-row">
          <td colspan="3">Day total</td>
          <td class="amount-cell">${money(dayIncome)}</td>
          <td class="amount-cell expense-amount">${money(dayExpense)}</td>
        </tr>`;
      monthIncome += dayIncome;
      monthExpense += dayExpense;
    });

    reportTables.insertAdjacentHTML(
      "beforeend",
      `
      <h3 class="report-section-title">${monthLabel(mKey)}</h3>
      <table class="report-table">
        <thead>
          <tr><th>Date</th><th>Description</th><th>Category</th><th>Income</th><th>Expense</th></tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr class="report-total-row">
            <td colspan="3">Month total</td>
            <td class="amount-cell">${money(monthIncome)}</td>
            <td class="amount-cell expense-amount">${money(monthExpense)}</td>
          </tr>
          <tr class="report-savings-row">
            <td colspan="5">Savings = ${money(monthIncome - monthExpense)}</td>
          </tr>
        </tfoot>
      </table>`,
    );
  });
}

// --- Weekly view: one row per week ---
function renderWeekly() {
  const byWeek = new Map();
  allExpenses.forEach((exp) => {
    const d = new Date(exp.createdAt);
    const key = weekKey(d);
    if (!byWeek.has(key)) byWeek.set(key, { income: 0, expense: 0, dates: [] });
    const bucket = byWeek.get(key);
    if (isIncome(exp)) bucket.income += Number(exp.amount);
    else bucket.expense += Number(exp.amount);
    bucket.dates.push(d);
  });

  const weekKeys = [...byWeek.keys()].sort().reverse();
  let rowsHtml = "";
  weekKeys.forEach((key) => {
    const bucket = byWeek.get(key);
    rowsHtml += `
      <tr>
        <td>${weekRangeLabel(bucket.dates)}</td>
        <td class="amount-cell">${money(bucket.income)}</td>
        <td class="amount-cell expense-amount">${money(bucket.expense)}</td>
        <td class="amount-cell">${money(bucket.income - bucket.expense)}</td>
      </tr>`;
  });

  reportTables.insertAdjacentHTML(
    "beforeend",
    `
    <table class="report-table">
      <thead>
        <tr><th>Week</th><th>Income</th><th>Expense</th><th>Savings</th></tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>`,
  );
}

// --- Monthly view: one row per month (mirrors the "Yearly Report" table) ---
function renderMonthly() {
  const byMonth = new Map();
  allExpenses.forEach((exp) => {
    const d = new Date(exp.createdAt);
    const key = monthKey(d);
    if (!byMonth.has(key)) byMonth.set(key, { income: 0, expense: 0 });
    const bucket = byMonth.get(key);
    if (isIncome(exp)) bucket.income += Number(exp.amount);
    else bucket.expense += Number(exp.amount);
  });

  const monthKeys = [...byMonth.keys()].sort().reverse();
  let rowsHtml = "";
  monthKeys.forEach((key) => {
    const bucket = byMonth.get(key);
    rowsHtml += `
      <tr>
        <td>${monthLabel(key)}</td>
        <td class="amount-cell">${money(bucket.income)}</td>
        <td class="amount-cell expense-amount">${money(bucket.expense)}</td>
        <td class="amount-cell">${money(bucket.income - bucket.expense)}</td>
      </tr>`;
  });

  reportTables.insertAdjacentHTML(
    "beforeend",
    `
    <h3 class="report-section-title">Yearly Report</h3>
    <table class="report-table">
      <thead>
        <tr><th>Month</th><th>Income</th><th>Expense</th><th>Savings</th></tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>`,
  );
}

function formatDate(dKey) {
  const [y, m, d] = dKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// --- Download (client-side CSV for now; can be swapped for a backend
// generated file - e.g. PDF/XLSX - in a future task without touching
// the rest of this page) ---
downloadBtn.addEventListener("click", () => {
  if (downloadBtn.disabled || !isPremiumUser) return;
  const rows = [["Date", "Description", "Category", "Income", "Expense"]];
  allExpenses
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach((exp) => {
      const income = isIncome(exp);
      rows.push([new Date(exp.createdAt).toLocaleDateString(), exp.description, exp.category, income ? Number(exp.amount).toFixed(2) : "", income ? "" : Number(exp.amount).toFixed(2)]);
    });
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `expense-report-${currentView}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

function csvEscape(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

checkAuthAndLoad();

// Re-check premium status when the page is restored from bfcache, same
// pattern used on the dashboard.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) checkAuthAndLoad();
});
