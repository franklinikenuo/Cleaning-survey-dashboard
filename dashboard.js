/* ============================================================
   CLEANING COMPLIANCE DASHBOARD (POSTGRESQL VERSION)
   ============================================================ */

const API_BASE = "https://cleaning-survey-api.onrender.com";

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

/* ROOM COLOR MAP */
const roomColors = {
  "Andrology Lab": "#3B82F6",
  "Procedure Room": "#0D9488",
  "Recovery Room": "#F97316",
  "Blood Lab": "#EF4444",
  "Collection Room 1": "#22C55E",
  "Collection Room 2": "#22C55E",
  "Ultrasound Room 1": "#8B5CF6",
  "Ultrasound Room 2": "#8B5CF6",
  "Ultrasound Room 3": "#8B5CF6",
  "Ultrasound Room 4": "#8B5CF6",
  "Ultrasound Room 5": "#8B5CF6"
};

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
   CHART COLORS
   ============================================================ */

const clinicalColors = {
  primary: "#0f3d91",
  primaryLight: "#e3edff",
  accent: "#1abc9c",
  danger: "#e11d48",
  softBlue: "#d6e4ff",
  softGreen: "#dcfce7",
  softRed: "#fee2e2"
};

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

  /* Destroy old charts before re-rendering */
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
        backgroundColor: Object.keys(rooms).map(room => roomColors[room] || clinicalColors.primary),
        borderColor: Object.keys(rooms).map(room => roomColors[room] || clinicalColors.primary),
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
        borderColor: clinicalColors.primary,
        backgroundColor: clinicalColors.primaryLight,
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
        backgroundColor: clinicalColors.accent,
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
        backgroundColor: [
          clinicalColors.primary,
          clinicalColors.accent,
          clinicalColors.danger
        ]
      }]
    }
  });
}

/* ============================================================
   MAIN INIT
   ============================================================ */

async function init() {
  const data = await fetchData();

  /* Populate filters */
  [...new Set(data.map(d => d.room))].forEach(room => {
    filterRoom.innerHTML += `<option value="${room}">${room}</option>`;
  });

  [...new Set(data.map(d => d.staff))].forEach(staff => {
    filterStaff.innerHTML += `<option value="${staff}">${staff}</option>`;
  });

  function refresh() {
    const filtered = applyFilters(data);
    updateSummary(filtered);
    renderTable(filtered);
    renderCharts(filtered);
  }

  refresh();

  [filterRoom, filterStaff, filterShift, filterDate].forEach(el =>
    el.addEventListener("change", refresh)
  );

  document.getElementById("btn-clear-filters").addEventListener("click", () => {
    filterRoom.value = "all";
    filterStaff.value = "all";
    filterShift.value = "all";
    filterDate.value = "";
    refresh();
  });
}

init();
