/* ============================================================
   CLEANING COMPLIANCE DASHBOARD (LOCAL + SENDGRID VERSION)
   ============================================================ */

const API_BASE = "https://cleaning-survey-api-v2-x6sf.onrender.com";

/* DOM ELEMENTS */
const totalSubmissionsEl = document.getElementById("totalSubmissions");
const overallComplianceEl = document.getElementById("overallCompliance");
const avgTasksCompletedEl = document.getElementById("avgTasksCompleted");
const topShiftEl = document.getElementById("topShift");
const tableBody = document.getElementById("survey-table-body");
const tableCountLabel = document.getElementById("table-count-label");

/* FILTERS */
const filterRoom = document.getElementById("filter-room");
const filterStaff = document.getElementById("filter-staff");
const filterShift = document.getElementById("filter-shift");
const filterDate = document.getElementById("filter-date");

/* CHART INSTANCES */
let roomComplianceChart = null;
let trendChart = null;
let taskBreakdownChart = null;
let shiftChart = null;

/* ============================================================
   FETCH DATA
   ============================================================ */

async function fetchData() {
  try {
    const res = await fetch(`${API_BASE}/submissions`);
    if (!res.ok) throw new Error("Failed to load submissions");
    return await res.json();
  } catch (err) {
    console.error("API fetch error:", err);
    return [];
  }
}

/* ============================================================
   APPLY FILTERS
   ============================================================ */

function applyFilters(data) {
  return data.filter(entry => {
    if (filterRoom.value !== "all" && entry.room !== filterRoom.value) return false;
    if (filterStaff.value !== "all" && entry.staff !== filterStaff.value) return false;
    if (filterShift.value !== "all" && entry.shift !== filterShift.value) return false;

    if (filterDate.value) {
      const entryDate = entry.timestamp.split(" ")[0];
      if (entryDate !== filterDate.value) return false;
    }

    return true;
  });
}

/* ============================================================
   SUMMARY METRICS
   ============================================================ */

function updateSummary(filtered) {
  totalSubmissionsEl.textContent = filtered.length;

  if (filtered.length === 0) {
    overallComplianceEl.textContent = "0%";
    avgTasksCompletedEl.textContent = "0 / 6";
    topShiftEl.textContent = "–";
    return;
  }

  let totalCompliance = 0;
  let totalTasks = 0;
  const shiftCount = {};

  filtered.forEach(entry => {
    const tasks = Object.values(entry.tasks_completed);
    const completed = tasks.filter(t => t === "Y").length;
    const compliance = (completed / tasks.length) * 100;

    totalCompliance += compliance;
    totalTasks += completed;

    shiftCount[entry.shift] = (shiftCount[entry.shift] || 0) + 1;
  });

  overallComplianceEl.textContent = `${Math.round(totalCompliance / filtered.length)}%`;
  avgTasksCompletedEl.textContent = `${Math.round(totalTasks / filtered.length)} / 6`;

  const topShift = Object.entries(shiftCount).sort((a, b) => b[1] - a[1])[0];
  topShiftEl.textContent = topShift ? topShift[0] : "–";
}

/* ============================================================
   REPORT SUMMARY PANEL
   ============================================================ */

function generateReportSummary(filtered) {
  if (filtered.length === 0) {
    return "<p>No data available.</p>";
  }

  const total = filtered.length;

  const avgCompliance = Math.round(
    filtered.reduce((sum, entry) => {
      const tasks = Object.values(entry.tasks_completed);
      const completed = tasks.filter(t => t === "Y").length;
      return sum + (completed / tasks.length) * 100;
    }, 0) / total
  );

  const shifts = {};
  filtered.forEach(e => {
    shifts[e.shift] = (shifts[e.shift] || 0) + 1;
  });

  const topShift = Object.entries(shifts).sort((a, b) => b[1] - a[1])[0][0];

  return `
    <p><strong>Total Submissions:</strong> ${total}</p>
    <p><strong>Average Compliance:</strong> ${avgCompliance}%</p>
    <p><strong>Most Active Shift:</strong> ${topShift}</p>
  `;
}

/* ============================================================
   TABLE RENDERING
   ============================================================ */

function renderTable(filtered) {
  tableBody.innerHTML = "";

  filtered.forEach(entry => {
    const tasks = Object.values(entry.tasks_completed);
    const completed = tasks.filter(t => t === "Y").length;
    const compliance = Math.round((completed / tasks.length) * 100);

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${entry.timestamp}</td>
      <td>${entry.room}</td>
      <td>${entry.staff}</td>
      <td>${entry.shift}</td>
      <td>
        <span class="compliance-pill ${compliance >= 75 ? "good" : "bad"}">
          ${compliance}%
        </span>
      </td>
      <td>${entry.notes || "–"}</td>
    `;

    tableBody.appendChild(row);
  });

  tableCountLabel.textContent = `${filtered.length} records`;
}

/* ============================================================
   CHART RENDERING
   ============================================================ */

function renderCharts(filtered) {
  const rooms = {};
  const dates = {};
  const tasks = {};
  const shifts = {};

  filtered.forEach(entry => {
    const completed = Object.values(entry.tasks_completed).filter(t => t === "Y").length;
    const compliance = Math.round((completed / 6) * 100);

    rooms[entry.room] = rooms[entry.room] || [];
    rooms[entry.room].push(compliance);

    const day = entry.timestamp.split(" ")[0];
    dates[day] = dates[day] || [];
    dates[day].push(compliance);

    Object.entries(entry.tasks_completed).forEach(([task, value]) => {
      tasks[task] = tasks[task] || 0;
      if (value === "Y") tasks[task]++;
    });

    shifts[entry.shift] = (shifts[entry.shift] || 0) + 1;
  });

  /* Destroy old charts */
  [roomComplianceChart, trendChart, taskBreakdownChart, shiftChart].forEach(chart => {
    if (chart) chart.destroy();
  });

  roomComplianceChart = new Chart(document.getElementById("roomComplianceChart"), {
    type: "bar",
    data: {
      labels: Object.keys(rooms),
      datasets: [{
        label: "Compliance (%)",
        data: Object.values(rooms).map(arr =>
          Math.round(arr.reduce((a, b) => a + b) / arr.length)
        ),
        backgroundColor: "#0f3d91",
        borderColor: "#0f3d91",
        borderWidth: 2,
        borderRadius: 8
      }]
    }
  });

  trendChart = new Chart(document.getElementById("trendChart"), {
    type: "line",
    data: {
      labels: Object.keys(dates),
      datasets: [{
        label: "Daily Compliance",
        data: Object.values(dates).map(arr => Math.round(arr.reduce((a, b) => a + b) / arr.length)),
        borderColor: "#0f3d91",
        backgroundColor: "#e3edff",
        fill: true,
        tension: 0.3
      }]
    }
  });

  taskBreakdownChart = new Chart(document.getElementById("taskBreakdownChart"), {
    type: "bar",
    data: {
      labels: Object.keys(tasks),
      datasets: [{
        label: "Completed",
        data: Object.values(tasks),
        backgroundColor: "#1abc9c",
        borderRadius: 8
      }]
    }
  });

  shiftChart = new Chart(document.getElementById("shiftChart"), {
    type: "pie",
    data: {
      labels: Object.keys(shifts),
      datasets: [{
        data: Object.values(shifts),
        backgroundColor: ["#0f3d91", "#1abc9c", "#e11d48"]
      }]
    }
  });
}

/* ============================================================
   LOCAL PDF GENERATION
   ============================================================ */

document.getElementById("btn-local-pdf").addEventListener("click", async () => {
  const element = document.querySelector(".main-layout");

  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, width, height);
  pdf.save("dashboard_report.pdf");
});

/* ============================================================
   LOCAL CSV EXPORT
   ============================================================ */

function exportToCSV(data) {
  const rows = data.map(entry => ({
    timestamp: entry.timestamp,
    room: entry.room,
    staff: entry.staff,
    shift: entry.shift,
    compliance:
      Math.round(
        Object.values(entry.tasks_completed).filter(t => t === "Y").length /
        Object.values(entry.tasks_completed).length * 100
      ) + "%",
    notes: entry.notes || ""
  }));

  const header = Object.keys(rows[0]).join(",");
  const body = rows.map(r => Object.values(r).join(",")).join("\n");
  const csv = header + "\n" + body;

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "cleaning_report.csv";
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("btn-export-csv").addEventListener("click", () => {
  const filtered = applyFilters(data);
  exportToCSV(filtered);
});

/* ============================================================
   LOCAL EXCEL EXPORT
   ============================================================ */

document.getElementById("btn-export-excel").addEventListener("click", () => {
  const filtered = applyFilters(data);
  exportToExcel(filtered);
});

/* ============================================================
   SENDGRID EMAIL REPORT ACTIONS
   ============================================================ */

async function triggerEmail(endpoint) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, { method: "POST" });
    const json = await res.json();
    alert(json.message || "Request sent.");
  } catch (err) {
    alert("Error sending email report.");
  }
}

document.getElementById("email-dashboard-pdf").addEventListener("click", () => {
  triggerEmail("export/pdf");
});

document.getElementById("email-weekly-report").addEventListener("click", () => {
  triggerEmail("send-weekly-report");
});

document.getElementById("email-monthly-report").addEventListener("click", () => {
  triggerEmail("send-monthly-report");
});

document.getElementById("email-quarterly-report").addEventListener("click", () => {
  triggerEmail("send-quarterly-report");
});

document.getElementById("email-yearly-report").addEventListener("click", () => {
  triggerEmail("send-yearly-report");
});

/* ============================================================
   MAIN INIT
   ============================================================ */

let data = [];

async function init()
