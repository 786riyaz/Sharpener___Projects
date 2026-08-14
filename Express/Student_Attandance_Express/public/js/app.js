const datePicker = document.getElementById('datePicker');
const searchBtn = document.getElementById('searchBtn');
const reportBtn = document.getElementById('reportBtn');
const content = document.getElementById('content');

// default the date picker to today
const today = new Date().toISOString().split('T')[0];
datePicker.value = today;

searchBtn.addEventListener('click', () => {
  const date = datePicker.value;
  if (!date) return alert('Please select a date first.');
  fetchAttendance(date);
});

reportBtn.addEventListener('click', fetchReport);

async function fetchAttendance(date) {
  content.innerHTML = '<p class="hint">Loading...</p>';
  try {
    const { data } = await axios.get('/api/attendance', { params: { date } });
    if (data.marked) {
      renderReadOnly(data.data);
    } else {
      renderMarkForm(date, data.data);
    }
  } catch (err) {
    content.innerHTML = `<p class="error-msg">${err.response?.data?.message || 'Something went wrong.'}</p>`;
  }
}

function renderReadOnly(records) {
  const rows = records
    .map((r) => {
      const isPresent = r.status === 'present';
      const cls = isPresent ? 'status-present' : 'status-absent';
      const icon = isPresent ? '✅' : '❌';
      const label = isPresent ? 'present' : 'absent';
      return `
        <div class="row">
          <span class="name">${r.name}</span>
          <span class="${cls}">${icon} ${label}</span>
        </div>`;
    })
    .join('');
  content.innerHTML = `<div class="list">${rows}</div>`;
}

function renderMarkForm(date, students) {
  const rows = students
    .map(
      (s) => `
        <div class="row" data-student-id="${s.studentId}">
          <span class="name">${s.name}</span>
          <div class="radio-group">
            <label><input type="radio" name="status-${s.studentId}" value="present" /> Present</label>
            <label><input type="radio" name="status-${s.studentId}" value="absent" /> Absent</label>
          </div>
        </div>`
    )
    .join('');

  content.innerHTML = `
    <div class="list">${rows}</div>
    <div class="mark-btn-wrap">
      <button id="markAttendanceBtn" class="btn btn-orange">Mark Attendance</button>
    </div>
    <div id="markMsg"></div>
  `;

  document.getElementById('markAttendanceBtn').addEventListener('click', () => submitAttendance(date, students));
}

async function submitAttendance(date, students) {
  const records = [];
  for (const s of students) {
    const checked = document.querySelector(`input[name="status-${s.studentId}"]:checked`);
    if (!checked) {
      alert(`Please mark attendance for ${s.name}.`);
      return;
    }
    records.push({ studentId: s.studentId, status: checked.value });
  }

  try {
    await axios.post('/api/attendance', { date, records });
    fetchAttendance(date); // reload as read-only view
  } catch (err) {
    document.getElementById('markMsg').innerHTML =
      `<p class="error-msg">${err.response?.data?.message || 'Failed to mark attendance.'}</p>`;
  }
}

async function fetchReport() {
  content.innerHTML = '<p class="hint">Loading report...</p>';
  try {
    const { data } = await axios.get('/api/report');
    const rows = data.report
      .map(
        (r) => `
        <div class="report-row">
          <span class="name">${r.name}</span>
          <span class="frac">${r.present}/${r.total}</span>
          <span class="pct">${r.percentage} %</span>
        </div>`
      )
      .join('');
    content.innerHTML = `<div class="list">${rows}</div>`;
  } catch (err) {
    content.innerHTML = `<p class="error-msg">${err.response?.data?.message || 'Failed to load report.'}</p>`;
  }
}
