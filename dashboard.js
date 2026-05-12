// ===============================
// CONFIG
// ===============================
const API_BASE = "https://cleaning-survey-api.onrender.com";

let allSurveys = [];
let roomChart;
let trendChart;
let taskChart;
let shiftChart;

// ===============================
// MAIN LOAD
// ===============================
async function initDashboard() {
  await loadSurveys();
  attachEventListeners();
}

window.addEventListener("DOMContentLoaded", initDashboard);

// ===============================
// LOAD SURVEYS
// ===============================
async function loadSurveys() {
  const tbody = document.getElementById("survey-table-body");
  tbody.innerHTML = "<tr><td colspan='6'>Loading...</td></tr>";

  try {
    const res = await fetch(`${API_BASE}/submissions`);
    const data = await res.json();

    allSurveys = Array.isArray(data) ? data : [];

    applyFilters();
  } catch (err) {
    console.error("Failed to load surveys", err);
    tbody.innerHTML = "<tr><td colspan='6' style='color:red;'>Error loading data</td></tr>";
  }
}

// ===============================
// FILTERS
// ===============================
function applyFilters() {
  let filtered = [...allSurveys];

  const room = document.getElementById("filter-room").value;
  const staff = document.getElementById("filter-staff").value;
  const shift = document.getElementById("filter-shift").value;
  const date = document.getElementById("filter-date").value;

  if (room !== "all") filtered = filtered.filter(s => s.room === room);
  if (staff !== "all") filtered = filtered.filter(s => s.staff_name === staff);
  if (shift !== "all") filtered = filtered.filter(s => s.shift === shift);
  if (date) filtered = filtered.filter(s => (s.timestamp || "").startsWith(date));

  renderTable(filtered);
  updateSummary(filtered);
  updateRoomChart(filtered);
  updateTrendChart(filtered);
  updateTaskBreakdownChart(filtered);
  updateShiftChart(filtered);
  populateFilters();
}

function clearFilters() {
  document.getElementById("filter-room").value = "all";
  document.getElementById("filter-staff").value = "all";
  document.getElementById("filter-shift").value = "all";
  document.getElementById("filter-date").value = "";
  applyFilters();
}

// ===============================
// TABLE
// ===============================
function renderTable(surveys) {
  const tbody = document.getElementById("survey-table-body");
  const label = document.getElementById("table-count-label");

  tbody.innerHTML = "";
  label.textContent = `${surveys.length} record${surveys.length === 1 ? "" : "s"}`;

  if (surveys.length === 0) {
    tbody.innerHTML = "<tr><td colspan='6'>No records found</td></tr>";
    return;
  }

  const sorted = [...surveys].sort((a, b) => {
    const ta = new Date(a.timestamp || "").getTime();
    const tb = new Date(b.timestamp || "").getTime();
    return tb - ta;
  });

  sorted.forEach(s => {
    const tasks = s.tasks_completed || {};
    const allDone = Object.values(tasks).every(v => v === true);
    const ts = s.timestamp || "";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${ts ? new Date(ts).toLocaleString() : "–"}</td>
      <td>${s.room || "–"}</td>
      <td>${s.staff_name || "–"}</td>
      <td>${s.shift || "–"}</td>
      <td>
        <span class="compliance-pill ${allDone ? "good" : "bad"}">
          ${allDone ? "✔️ Clean" : "❌ Not Clean"}
        </span>
      </td>
      <td>${s.notes || ""}</td>
    `;
    tbody.appendChild(row);
  });
}

// ===============================
// SUMMARY
// ===============================
function updateSummary(surveys) {
  const totalEl = document.getElementById("totalSubmissions");
  const overallEl = document.getElementById("overallCompliance");
  const avgTasksEl = document.getElementById("avgTasksCompleted");
  const topShiftEl = document.getElementById("topShift");

  if (surveys.length === 0) {
    totalEl.textContent = "0";
    overallEl.textContent = "0%";
    avgTasksEl.textContent = "0 / 8";
    topShiftEl.textContent = "–";
    return;
  }

  totalEl.textContent = surveys.length;

  const cleanCount = surveys.filter(s => {
    const tasks = s.tasks_completed || {};
    return Object.values(tasks).every(v => v === true);
  }).length;

  const compliance = Math.round((cleanCount / surveys.length) * 100);
  overallEl.textContent = `${compliance}%`;

  let totalTasksCompleted = 0;
  let totalTasksPossible = 0;

  surveys.forEach(s => {
    const tasks = s.tasks_completed || {};
    const values = Object.values(tasks);
    totalTasksPossible += values.length;
    totalTasksCompleted += values.filter(v => v === true).length;
  });

  const avg = totalTasksPossible === 0 ? 0 : (totalTasksCompleted / surveys.length);
  avgTasksEl.textContent = `${avg.toFixed(1)} / 8`;

  const shiftCounts = {};
  surveys.forEach(s => {
    if (!s.shift) return;
    shiftCounts[s.shift] = (shiftCounts[s.shift] || 0) + 1;
  });

  const topShift = Object.entries(shiftCounts).sort((a, b) => b[1] - a[1])[0];
  topShiftEl.textContent = topShift ? topShift[0] : "–";
}

// ===============================
// FILTER OPTIONS
// ===============================
function populateFilters() {
  const roomSelect = document.getElementById("filter-room");
  const staffSelect = document.getElementById("filter-staff");

  const rooms = [...new Set(allSurveys.map(s => s.room).filter(Boolean))];
  const staff = [...new Set(allSurveys.map(s => s.staff_name).filter(Boolean))];

  const currentRoom = roomSelect.value;
  const currentStaff = staffSelect.value;

  roomSelect.innerHTML = `<option value="all">All Rooms</option>`;
  rooms.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    roomSelect.appendChild(opt);
  });
  if (rooms.includes(currentRoom)) roomSelect.value = currentRoom;

  staffSelect.innerHTML = `<option value="all">All Staff</option>`;
  staff.forEach(st => {
    const opt = document.createElement("option");
    opt.value = st;
    opt.textContent = st;
    staffSelect.appendChild(opt);
  });
  if (staff.includes(currentStaff)) staffSelect.value = currentStaff;
}

// ===============================
// CHARTS
// ===============================
function updateRoomChart(surveys) {
  const ctx = document.getElementById("roomComplianceChart").getContext("2d");

  const rooms = [...new Set(surveys.map(s => s.room).filter(Boolean))];

  const complianceData = rooms.map(room => {
    const roomSurveys = surveys.filter(s => s.room === room);
    if (roomSurveys.length === 0) return 0;
    const cleanCount = roomSurveys.filter(s => {
      const tasks = s.tasks_completed || {};
      return Object.values(tasks).every(v => v === true);
    }).length;
    return Math.round((cleanCount / roomSurveys.length) * 100);
  });

  if (roomChart) roomChart.destroy();

  roomChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: rooms,
      datasets: [{
        label: "Compliance (%)",
        data: complianceData,
        backgroundColor: "#1f6feb"
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

function updateTrendChart(surveys) {
  const ctx = document.getElementById("trendChart").getContext("2d");

  const grouped = {};

  surveys.forEach(s => {
    const ts = s.timestamp;
    if (!ts) return;
    const day = new Date(ts).toISOString().split("T")[0];
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(s);
  });

  const dates = Object.keys(grouped).sort();

  const compliance = dates.map(d => {
    const daySurveys = grouped[d];
    const cleanCount = daySurveys.filter(s => {
      const tasks = s.tasks_completed || {};
      return Object.values(tasks).every(v => v === true);
    }).length;
    return Math.round((cleanCount / daySurveys.length) * 100);
  });

  if (trendChart) trendChart.destroy();

  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [{
        label: "Daily Compliance (%)",
        data: compliance,
        borderColor: "#1f6feb",
        backgroundColor: "rgba(31, 111, 235, 0.1)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

function updateTaskBreakdownChart(surveys) {
  const ctx = document.getElementById("taskBreakdownChart").getContext("2d");

  const taskNames = [
    "floor_cleaned",
    "trash_removed",
    "surfaces_wiped",
    "equipment_sanitized",
    "supplies_restocked",
    "sweep",
    "linen_change",
    "vacuum"
  ];

  const counts = {};
  taskNames.forEach(t => (counts[t] = 0));

  surveys.forEach(s => {
    const tasks = s.tasks_completed || {};
    taskNames.forEach(t => {
      if (tasks[t]) counts[t] += 1;
    });
  });

  const labels = [
    "Floor",
    "Trash",
    "Surfaces",
    "Equipment",
    "Supplies",
    "Sweep",
    "Linen",
    "Vacuum"
  ];

  const data = taskNames.map(t => counts[t]);

  if (taskChart) taskChart.destroy();

  taskChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          "#1f6feb",
          "#22c55e",
          "#f97316",
          "#e11d48",
          "#6366f1",
          "#14b8a6",
          "#a855f7",
          "#0ea5e9"
        ]
      }]
    }
  });
}

function updateShiftChart(surveys) {
  const ctx = document.getElementById("shiftChart").getContext("2d");

  const shiftCounts = { Morning: 0, Evening: 0, Night: 0 };

  surveys.forEach(s => {
    if (shiftCounts[s.shift] !== undefined) {
      shiftCounts[s.shift] += 1;
    }
  });

  if (shiftChart) shiftChart.destroy();

  shiftChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Morning", "Evening", "Night"],
      datasets: [{
        data: [
          shiftCounts.Morning,
          shiftCounts.Evening,
          shiftCounts.Night
        ],
        backgroundColor: ["#1f6feb", "#22c55e", "#f97316"]
      }]
    }
  });
}

// ===============================
// CSV EXPORT
// ===============================
function exportCSV() {
  const surveys = allSurveys;
  if (!surveys.length) {
    alert("No data to export");
    return;
  }

  let csv = "timestamp,room,staff,shift,floor_cleaned,trash_removed,surfaces_wiped,equipment_sanitized,supplies_restocked,sweep,linen_change,vacuum,notes\n";

  surveys.forEach(s => {
    const t = s.tasks_completed || {};
    const ts = s.timestamp || "";
    csv += [
      ts,
      s.room || "",
      s.staff_name || "",
      s.shift || "",
      t.floor_cleaned || false,
      t.trash_removed || false,
      t.surfaces_wiped || false,
      t.equipment_sanitized || false,
      t.supplies_restocked || false,
      t.sweep || false,
      t.linen_change || false,
      t.vacuum || false,
      (s.notes || "").replace(/,/g, ";")
    ].join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "cleaning_data.csv";
  a.click();
}

// ===============================
// WEEKLY / MONTHLY PDF (backend)
// ===============================
async function exportWeeklyPDF() {
  try {
    await fetch(`${API_BASE}/send-weekly-report`);
    alert("Weekly PDF report requested.");
  } catch (err) {
    alert("Failed to request weekly PDF.");
  }
}

async function exportMonthlyPDF() {
  try {
    await fetch(`${API_BASE}/send-monthly-report`);
    alert("Monthly PDF report requested.");
  } catch (err) {
    alert("Failed to request monthly PDF.");
  }
}

// ===============================
// DASHBOARD PDF (front-end)
// ===============================
async function exportDashboardPDF() {
  const element = document.getElementById("dashboard-root");
  const { jsPDF } = window.jspdf;

  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, width, height);
  pdf.save("dashboard-report.pdf");
}

// ===============================
// EVENTS
// ===============================
function attachEventListeners() {
  document.getElementById("filter-room").addEventListener("change", applyFilters);
  document.getElementById("filter-staff").addEventListener("change", applyFilters);
  document.getElementById("filter-shift").addEventListener("change", applyFilters);
  document.getElementById("filter-date").addEventListener("change", applyFilters);

  document.getElementById("btn-clear-filters").addEventListener("click", clearFilters);
  document.getElementById("btn-export-csv").addEventListener("click", exportCSV);
  document.getElementById("btn-export-weekly-pdf").addEventListener("click", exportWeeklyPDF);
  document.getElementById("btn-export-monthly-pdf").addEventListener("click", exportMonthlyPDF);
  document.getElementById("btn-export-dashboard-pdf").addEventListener("click", exportDashboardPDF);
      }
