/* ------------------------------------------------------------
   CLEANING DASHBOARD — FULL REWRITE (v10)
   Compatible with updated backend + new rooms
------------------------------------------------------------ */

const API_BASE = "https://cleaning-survey-api-v2-x6sf.onrender.com";

/* ------------------------------------------------------------
   DOM ELEMENTS
------------------------------------------------------------ */
const filterRoom = document.getElementById("filter-room");
const filterStaff = document.getElementById("filter-staff");
const filterShift = document.getElementById("filter-shift");
const filterDate = document.getElementById("filter-date");

const totalSubmissionsEl = document.getElementById("total-submissions");
const overallComplianceEl = document.getElementById("overall-compliance");
const topShiftEl = document.getElementById("top-shift");
const avgTasksEl = document.getElementById("avg-tasks");

const tableBody = document.querySelector("#submissions-table tbody");

const emailDashboardPdfBtn = document.getElementById("email-dashboard-pdf");

/* Disable PDF button until charts are ready */
if (emailDashboardPdfBtn) {
  emailDashboardPdfBtn.disabled = true;
}

/* ------------------------------------------------------------
   CHART VARIABLES
------------------------------------------------------------ */
let roomChart, shiftChart, tasksTrendChart;

/* ------------------------------------------------------------
   FETCH DATA
------------------------------------------------------------ */
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

/* ------------------------------------------------------------
   FILTER LOGIC
------------------------------------------------------------ */
function applyFilters(data) {
  return data.filter(entry => {
    if (filterRoom.value !== "all" && entry.room !== filterRoom.value) return false;
    if (filterStaff.value && !entry.staff.toLowerCase().includes(filterStaff.value.toLowerCase())) return false;
    if (filterShift.value !== "all" && entry.shift !== filterShift.value) return false;

    if (filterDate.value) {
      const entryDate = entry.timestamp.split(" ")[0];
      if (entryDate !== filterDate.value) return false;
    }

    return true;
  });
}

/* ------------------------------------------------------------
   SUMMARY CARDS
------------------------------------------------------------ */
function updateSummary(data) {
  totalSubmissionsEl.textContent = data.length;

  let totalTasks = 0;
  let completedTasks = 0;

  data.forEach(entry => {
    for (const key in entry.tasks_completed) {
      totalTasks++;
      if (entry.tasks_completed[key] === "Y") completedTasks++;
    }
  });

  const compliance = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  overallComplianceEl.textContent = compliance + "%";

  const shiftCounts = {};
  data.forEach(e => (shiftCounts[e.shift] = (shiftCounts[e.shift] || 0) + 1));

  const topShift = Object.keys(shiftCounts).length
    ? Object.entries(shiftCounts).sort((a, b) => b[1] - a[1])[0][0]
    : "N/A";

  topShiftEl.textContent = topShift;

  const avgTasks = data.length
    ? (data.reduce((sum, e) => sum + Object.keys(e.tasks_completed).length, 0) / data.length).toFixed(1)
    : 0;

  avgTasksEl.textContent = avgTasks;
}

/* ------------------------------------------------------------
   TABLE RENDERING
------------------------------------------------------------ */
function renderTable(data) {
  tableBody.innerHTML = "";

  data.forEach(entry => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${entry.room}</td>
      <td>${entry.shift}</td>
      <td>${entry.staff}</td>
      <td>${Object.entries(entry.tasks_completed)
        .map(([k, v]) => `${k}: ${v}`)
        .join("<br>")}</td>
      <td>${entry.notes || ""}</td>
      <td>${entry.timestamp}</td>
    `;

    tableBody.appendChild(tr);
  });
}

/* ------------------------------------------------------------
   CHART HELPERS
------------------------------------------------------------ */
function destroyChart(chart) {
  if (chart) chart.destroy();
}

/* ------------------------------------------------------------
   ROOM COMPLIANCE CHART
------------------------------------------------------------ */
function renderRoomChart(data) {
  destroyChart(roomChart);

  const rooms = [...new Set(data.map(e => e.room))];
  const compliance = rooms.map(room => {
    const entries = data.filter(e => e.room === room);

    let total = 0;
    let yes = 0;

    entries.forEach(e => {
      for (const key in e.tasks_completed) {
        total++;
        if (e.tasks_completed[key] === "Y") yes++;
      }
    });

    return total > 0 ? Math.round((yes / total) * 100) : 0;
  });

  const ctx = document.getElementById("roomChart").getContext("2d");

  roomChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: rooms,
      datasets: [
        {
          label: "Compliance (%)",
          data: compliance,
          backgroundColor: "#4CAF50"
        }
      ]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, max: 100 } }
    }
  });
}

/* ------------------------------------------------------------
   SHIFT DISTRIBUTION CHART
------------------------------------------------------------ */
function renderShiftChart(data) {
  destroyChart(shiftChart);

  const shifts = ["Morning", "Afternoon", "Evening", "Night"];
  const counts = shifts.map(shift => data.filter(e => e.shift === shift).length);

  const ctx = document.getElementById("shiftChart").getContext("2d");

  shiftChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: shifts,
      datasets: [
        {
          data: counts,
          backgroundColor: ["#2196F3", "#FFC107", "#FF5722", "#9C27B0"]
        }
      ]
    }
  });
}

/* ------------------------------------------------------------
   TASK TREND CHART
------------------------------------------------------------ */
function renderTasksTrendChart(data) {
  destroyChart(tasksTrendChart);

  const dates = [...new Set(data.map(e => e.timestamp.split(" ")[0]))].sort();

  const totals = dates.map(date => {
    const entries = data.filter(e => e.timestamp.startsWith(date));
    return entries.reduce((sum, e) => sum + Object.keys(e.tasks_completed).length, 0);
  });

  const ctx = document.getElementById("tasksTrendChart").getContext("2d");

  tasksTrendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Tasks Completed",
          data: totals,
          borderColor: "#3F51B5",
          fill: false
        }
      ]
    }
  });
}

/* ------------------------------------------------------------
   EXPORT BUTTONS
------------------------------------------------------------ */
document.getElementById("btn-export-csv").onclick = () => {
  window.location.href = `${API_BASE}/export-csv`;
};

document.getElementById("btn-local-pdf").onclick = async () => {
  const element = document.body;
  const canvas = await html2canvas(element);
  const img = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  pdf.addImage(img, "PNG", 0, 0, 210, 297);
  pdf.save("dashboard.pdf");
};

document.getElementById("btn-export-excel").onclick = () => {
  const table = document.getElementById("submissions-table");
  const wb = XLSX.utils.table_to_book(table);
  XLSX.writeFile(wb, "submissions.xlsx");
};

/* ------------------------------------------------------------
   PDF WITH CHARTS (BACKEND REPORTLAB)
------------------------------------------------------------ */
async function sendChartsToPDF() {
  if (!roomChart || !shiftChart || !tasksTrendChart) {
    alert("Charts are still loading. Please wait a moment and try again.");
    return;
  }

  const payload = {
    room_chart: roomChart.toBase64Image(),
    shift_chart: shiftChart.toBase64Image(),
    tasks_chart: tasksTrendChart.toBase64Image()
  };

  const res = await fetch(`${API_BASE}/export/pdf-with-charts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    console.error("PDF export failed", await res.text());
    alert("Unable to generate PDF right now. Please try again later.");
    return;
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dashboard_with_charts.pdf";
  a.click();
}

/* ------------------------------------------------------------
   SENDGRID REPORT BUTTONS
------------------------------------------------------------ */
if (emailDashboardPdfBtn) {
  emailDashboardPdfBtn.onclick = sendChartsToPDF;
}

document.getElementById("email-weekly-report").onclick = () =>
  fetch(`${API_BASE}/send-weekly-report`);

document.getElementById("email-monthly-report").onclick = () =>
  fetch(`${API_BASE}/send-monthly-report`);

document.getElementById("email-quarterly-report").onclick = () =>
  fetch(`${API_BASE}/send-quarterly-report`);

document.getElementById("email-yearly-report").onclick = () =>
  fetch(`${API_BASE}/send-yearly-report`);

/* ------------------------------------------------------------
   MAIN INIT
------------------------------------------------------------ */
let allData = [];

async function init() {
  allData = await fetchData();

  // Populate room filter dynamically
  const keepFirst = filterRoom.options[0];
  filterRoom.innerHTML = "";
  filterRoom.appendChild(keepFirst);

  [...new Set(allData.map(d => d.room))]
    .sort()
    .forEach(room => {
      filterRoom.innerHTML += `<option value="${room}">${room}</option>`;
    });

  function refresh() {
    const filtered = applyFilters(allData);
    updateSummary(filtered);
    renderTable(filtered);
    renderRoomChart(filtered);
    renderShiftChart(filtered);
    renderTasksTrendChart(filtered);

    // Charts are now ready → enable PDF button
    if (emailDashboardPdfBtn) {
      emailDashboardPdfBtn.disabled = false;
    }
  }

  refresh();

  [filterRoom, filterStaff, filterShift, filterDate].forEach(el =>
    el.addEventListener("input", refresh)
  );

  document.getElementById("btn-clear-filters").onclick = () => {
    filterRoom.value = "all";
    filterStaff.value = "";
    filterShift.value = "all";
    filterDate.value = "";
    refresh();
  };
}

init();
