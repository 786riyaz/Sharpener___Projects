const amount = document.getElementById("amount");
const desc = document.getElementById("desc");
const category = document.getElementById("category");
const tableBody = document.querySelector("#table tbody");
const totalExpense = document.getElementById("totalExpense");
const totalRecords = document.getElementById("totalRecords");
const submitButton = document.getElementById("submitButton");
const recordId = document.getElementById("recordId");

let data = JSON.parse(localStorage.getItem("expenseData") || "{}");

function save() {
  localStorage.setItem("expenseData", JSON.stringify(data));
}

function render() {
  tableBody.innerHTML = "";
  let total = 0,
    count = 0;
  Object.keys(data).forEach((id) => {
    count++;
    total += Number(data[id].amount);
    const tr = document.createElement("tr");
    tr.innerHTML = `
   <td>₹${data[id].amount}</td>
   <td>${data[id].desc}</td>
   <td><span class="badge bg-primary">${data[id].category}</span></td>
   <td>
   <button class="btn btn-warning btn-sm me-2" onclick="editExpense('${id}')"><i class="bi bi-pencil"></i></button>
   <button class="btn btn-danger btn-sm" onclick="deleteExpense('${id}')"><i class="bi bi-trash"></i></button>
   </td>`;
    tableBody.appendChild(tr);
  });
  totalExpense.textContent = "₹" + total;
  totalRecords.textContent = count;
}

function addExpense(e) {
  e.preventDefault();
  const id = recordId.value || Date.now().toString();
  data[id] = {
    amount: Number(amount.value),
    desc: desc.value,
    category: category.value,
  };
  save();
  resetForm();
  render();
}

function editExpense(id) {
  const r = data[id];
  recordId.value = id;
  amount.value = r.amount;
  desc.value = r.desc;
  category.value = r.category;
  submitButton.textContent = "Update Expense";
}

function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;
  delete data[id];
  save();
  render();
}

function resetForm() {
  amount.value = "";
  desc.value = "";
  category.selectedIndex = 0;
  recordId.value = "";
  submitButton.textContent = "Add Expense";
}

render();