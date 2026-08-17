// =====================================================
// DOM ELEMENTS
// =====================================================

let body = document.body;
let themeButton = document.getElementById("theme-button");
let date = document.getElementById("date");
let studentList = document.getElementById("student-list");

function setTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  date.value = `${year}-${month}-${day}`;
}
setTodayDate();

// =====================================================
// TOGGLE THEME
// =====================================================

function toggleTheme() {
  body.classList.toggle("light-theme");

  if (body.classList.contains("light-theme")) {
    themeButton.innerText = "Dark Theme";

    themeButton.style.backgroundColor = "white";

    themeButton.style.color = "black";
  } else {
    themeButton.innerText = "Light Theme";

    themeButton.style.backgroundColor = "black";

    themeButton.style.color = "white";
  }
}

// =====================================================
// GET ATTENDANCE BY DATE
// =====================================================

function getAttandance() {
  let inputDate = date.value;

  if (inputDate === "") {
    alert("Please select a proper Date");

    date.focus();

    return;
  }

  let url = `http://localhost:3000/attandances/${inputDate}`;

  axios
    .get(url)

    .then((response) => {
      console.log("Attendance Response:", response.data);

      let resp = response.data;

      // -----------------------------------------
      // No data returned
      // -----------------------------------------

      if (!resp || resp.length === 0) {
        studentList.innerHTML = `<div id="notice">
                        No attendance/student data found.
                    </div>`;

        return;
      }

      // -----------------------------------------
      // Check whether attendance already exists
      // -----------------------------------------

      if (resp[0].Status) {
        generateAttandanceOutput(resp);
      } else {
        generateAttandanceForm(resp);
      }
    })

    .catch((error) => {
      console.error("Error fetching attendance:", error);

      studentList.innerHTML = `<div id="notice">
                    Error fetching attendance data.
                </div>`;
    });
}

// =====================================================
// GENERATE ATTENDANCE INPUT FORM
// =====================================================

function generateAttandanceForm(resp) {
  // Clear previous content
  studentList.innerHTML = "";

  // =================================================
  // Create Table
  // =================================================

  let table = document.createElement("table");

  table.className = "attendance-table radio-table";

  // =================================================
  // Table Header
  // =================================================

  let thead = document.createElement("thead");

  let headerRow = document.createElement("tr");

  let nameHeader = document.createElement("th");

  nameHeader.innerText = "Student Name";

  let presentHeader = document.createElement("th");

  presentHeader.innerText = "Present";

  let absentHeader = document.createElement("th");

  absentHeader.innerText = "Absent";

  headerRow.appendChild(nameHeader);

  headerRow.appendChild(presentHeader);

  headerRow.appendChild(absentHeader);

  thead.appendChild(headerRow);

  table.appendChild(thead);

  // =================================================
  // Table Body
  // =================================================

  let tbody = document.createElement("tbody");

  for (let i = 0; i < resp.length; i++) {
    let row = document.createElement("tr");

    // ---------------------------------------------
    // Student Name
    // ---------------------------------------------

    let nameCell = document.createElement("td");

    nameCell.innerText = resp[i].Name;

    row.appendChild(nameCell);

    // ---------------------------------------------
    // Present Radio
    // ---------------------------------------------

    let presentCell = document.createElement("td");

    let presentRadio = document.createElement("input");

    presentRadio.type = "radio";

    presentRadio.name = `attendance-${resp[i].Student_Id}`;

    presentRadio.id = `attendance-present-${resp[i].Student_Id}`;

    presentRadio.className = "attendance-radio";

    presentRadio.value = "present";

    // Present is selected by default
    presentRadio.checked = true;

    presentCell.appendChild(presentRadio);

    row.appendChild(presentCell);

    // ---------------------------------------------
    // Absent Radio
    // ---------------------------------------------

    let absentCell = document.createElement("td");

    let absentRadio = document.createElement("input");

    absentRadio.type = "radio";

    absentRadio.name = `attendance-${resp[i].Student_Id}`;

    absentRadio.id = `attendance-absent-${resp[i].Student_Id}`;

    absentRadio.className = "attendance-radio";

    absentRadio.value = "absent";

    absentCell.appendChild(absentRadio);

    row.appendChild(absentCell);

    // ---------------------------------------------
    // Add row
    // ---------------------------------------------

    tbody.appendChild(row);
  }

  table.appendChild(tbody);

  // =================================================
  // Add Table
  // =================================================

  studentList.appendChild(table);

  // =================================================
  // Submit Button
  // =================================================

  let submitButton = document.createElement("button");

  submitButton.innerText = "Submit Attendance";

  submitButton.id = "submit-button";

  submitButton.addEventListener("click", submitData);

  studentList.appendChild(submitButton);
}

// =====================================================
// GENERATE EXISTING ATTENDANCE OUTPUT
// =====================================================

function generateAttandanceOutput(resp) {
  // Clear previous content
  studentList.innerHTML = "";

  // =================================================
  // Create Table
  // =================================================

  let table = document.createElement("table");

  table.className = "attendance-table";

  // =================================================
  // Header
  // =================================================

  let thead = document.createElement("thead");

  let headerRow = document.createElement("tr");

  let nameHeader = document.createElement("th");

  nameHeader.innerText = "Student Name";

  let statusHeader = document.createElement("th");

  statusHeader.innerText = "Status";

  headerRow.appendChild(nameHeader);

  headerRow.appendChild(statusHeader);

  thead.appendChild(headerRow);

  table.appendChild(thead);

  // =================================================
  // Body
  // =================================================

  let tbody = document.createElement("tbody");

  for (let i = 0; i < resp.length; i++) {
    let row = document.createElement("tr");

    // ---------------------------------------------
    // Student Name
    // ---------------------------------------------

    let nameCell = document.createElement("td");

    nameCell.innerText = resp[i].Name;

    row.appendChild(nameCell);

    // ---------------------------------------------
    // Status
    // ---------------------------------------------

    let statusCell = document.createElement("td");

    if (resp[i].Status === "absent") {
      statusCell.innerText = "❌ Absent";

      statusCell.className = "status-absent";
    } else {
      statusCell.innerText = "✅ Present";

      statusCell.className = "status-present";
    }

    row.appendChild(statusCell);

    tbody.appendChild(row);
  }

  table.appendChild(tbody);

  studentList.appendChild(table);
}

// =====================================================
// GET TOTAL ATTENDANCE REPORT
// =====================================================

function getTotalData() {
  let url = `http://localhost:3000/attandances/total`;

  axios
    .get(url)

    .then((response) => {
      console.log("Attendance Report:", response.data);

      let resp = response.data.records;

      let total = response.data.count;

      // Clear previous content
      studentList.innerHTML = "";

      // =================================================
      // Create Table
      // =================================================

      let table = document.createElement("table");

      table.className = "attendance-table report-table";

      // =================================================
      // Header
      // =================================================

      let thead = document.createElement("thead");

      let headerRow = document.createElement("tr");

      let nameHeader = document.createElement("th");

      nameHeader.innerText = "Student Name";

      let attendanceHeader = document.createElement("th");

      attendanceHeader.innerText = "Attendance";

      let percentageHeader = document.createElement("th");

      percentageHeader.innerText = "Percentage";

      headerRow.appendChild(nameHeader);

      headerRow.appendChild(attendanceHeader);

      headerRow.appendChild(percentageHeader);

      thead.appendChild(headerRow);

      table.appendChild(thead);

      // =================================================
      // Body
      // =================================================

      let tbody = document.createElement("tbody");

      for (let i = 0; i < resp.length; i++) {
        let row = document.createElement("tr");

        // ---------------------------------------------
        // Student Name
        // ---------------------------------------------

        let nameCell = document.createElement("td");

        nameCell.innerText = resp[i].Name;

        row.appendChild(nameCell);

        // ---------------------------------------------
        // Attendance
        // ---------------------------------------------

        let attendanceCell = document.createElement("td");

        attendanceCell.innerText = `${resp[i].Count}/${total}`;

        row.appendChild(attendanceCell);

        // ---------------------------------------------
        // Percentage
        // ---------------------------------------------

        let percentageCell = document.createElement("td");

        let percentage = total === 0 ? 0 : (resp[i].Count / total) * 100;

        percentageCell.innerText = `${percentage.toFixed(0)}%`;

        row.appendChild(percentageCell);

        tbody.appendChild(row);
      }

      table.appendChild(tbody);

      // =================================================
      // Add Table
      // =================================================

      studentList.appendChild(table);
    })

    .catch((error) => {
      console.error("Error fetching attendance report:", error);

      studentList.innerHTML = `<div id="notice">
                    Error fetching attendance report.
                </div>`;
    });
}

// =====================================================
// SUBMIT ATTENDANCE
// =====================================================

function submitData() {
  let radioInputs = document.getElementsByClassName("attendance-radio");

  let formData = {};

  // =================================================
  // Get selected radio button for every student
  // =================================================

  for (let i = 0; i < radioInputs.length; i++) {
    if (radioInputs[i].checked) {
      let studentId = radioInputs[i].name.split("-")[1];

      formData[studentId] = radioInputs[i].value;
    }
  }

  // =================================================
  // Add Date
  // =================================================

  formData.date = date.value;

  console.log("Attendance Data:", formData);

  // =================================================
  // POST API
  // =================================================

  let url = `http://localhost:3000/attandances`;

  axios
    .post(url, formData)

    .then((response) => {
      console.log("Data Sent:", response.data);

      alert("Attendance submitted successfully!");

      // Refresh the selected date
      getAttandance();
    })

    .catch((error) => {
      console.error("Error while sending attendance:", error);

      alert("Error while submitting attendance.");
    });
}
