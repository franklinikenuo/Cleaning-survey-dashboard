// ===============================
// CONFIG
// ===============================
const API_BASE = "https://cleaning-survey-api.onrender.com";


// ===============================
// FETCH SURVEYS
// ===============================
async function fetchSurveys() {
  try {
    const res = await fetch(`${API_BASE}/survey`);
    if (!res.ok) {
      console.error("Failed to fetch surveys");
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error("Error fetching surveys:", err);
    return [];
  }
}


// ===============================
// FILTER LOGIC
// ===============================
function matchesFilters(survey) {
  const roomFilter = document.getElementById("filter-room").value.trim().toLowerCase();
  const staffFilter = document.getElementById("filter-staff").value.trim().toLowerCase();
  const shiftFilter = document.getElementById("filter-shift").value.trim().toLowerCase();

  const room = (survey.room || "").toLowerCase();
  const staff = (survey.staff_name || "").toLowerCase();
  const shift = (survey.shift || "").toLowerCase();

  if (roomFilter && !room.includes(roomFilter)) return false;
  if (staffFilter && !staff.includes(staffFilter)) return false;
  if (shiftFilter && !shift.includes(shiftFilter)) return false;

  return true;
}


// ===============================
// RENDER TABLE
// ===============================
function renderTable(surveys) {
  const tbody = document.querySelector("#survey-table tbody");
  tbody.innerHTML = "";

  surveys.filter(matchesFilters).forEach(s => {
    const tr = document.createElement("tr");

    const tasks = typeof s.tasks_completed === "object"
      ? Object.entries(s.tasks_completed)
          .map(([k, v]) => `${k}: ${v ? "✔️" : "❌"}`)
          .join("<br>")
      : "";

    const allDone = Object.values(s.tasks_completed || {}).every(v => v === true);

    const badge = allDone
      ? `<span class="badge badge-success">✔ Clean</span>`
      : `<span class="badge badge-danger">✖ Issues</span>`;

    tr.innerHTML = `
      <td>${s.id}</td>
      <td>${s.date || ""}</td>
      <td>${s.room || ""}</td>
      <td>${s.staff_name || ""}</td>
      <td>${s.shift || ""}</td>
      <td>${tasks}</td>
      <td>${badge}</td>
      <td>${s.notes || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}


// ===============================
// COMPLIANCE CHART
// ===============================
let complianceChartInstance = null;

function buildComplianceChart(surveys) {
  const ctx = document.getElementById("complianceChart").getContext("2d");

  if (complianceChartInstance) {
    complianceChartInstance.destroy();
  }

  const grouped = {};
  surveys.forEach(s => {
    if (!s.date) return;
    const day = s.date.split("T")[0];

    if (!grouped[day]) grouped[day] = { total: 0, completed: 0 };

    grouped[day].total += 1;

    const tasks = s.tasks_completed || {};
    const allDone = Object.values(tasks).every(v => v === true);
    if (allDone) grouped[day].completed += 1;
  });

  const labels = Object.keys(grouped);
  const values = labels.map(d => {
    const g = grouped[d];
    return Math.round((g.completed / g.total) * 100);
  });

  complianceChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Compliance %",
        data: values,
        borderColor: "#007bff",
        backgroundColor: "rgba(0,123,255,0.2)",
        borderWidth: 2,
        fill: true
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}


// ===============================
// ROOM-BY-ROOM ANALYTICS
// ===============================
let roomChartInstance = null;

function buildRoomChart(surveys) {
  const canvas = document.getElementById("roomChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (roomChartInstance) {
    roomChartInstance.destroy();
  }

  const rooms = {};
  surveys.forEach(s => {
    if (!s.room) return;
    if (!rooms[s.room]) rooms[s.room] = { total: 0, clean: 0 };
    rooms[s.room].total += 1;

    const allDone = Object.values(s.tasks_completed || {}).every(v => v === true);
    if (allDone) rooms[s.room].clean += 1;
  });

  const labels = Object.keys(rooms);
  const values = labels.map(r =>
    Math.round((rooms[r].clean / rooms[r].total) * 100)
  );

  roomChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Compliance %",
        data: values,
        backgroundColor: "#17a2b8"
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}


// ===============================
// SUMMARY CARDS + TREND ARROWS
// ===============================
function setTrend(elementId, current, previous) {
  const el = document.getElementById(elementId);

  if (!el) return;

  if (previous === 0) {
    el.innerText = "→";
    el.style.color = "#999";
    return;
  }

  if (current > previous) {
    el.innerText = "↑";
    el.style.color = "green";
  } else if (current < previous) {
    el.innerText = "↓";
    el.style.color = "red";
  } else {
    el.innerText = "→";
    el.style.color = "#999";
  }
}

function updateSummaryCards(surveys) {
  const today = new Date().toISOString().split("T")[0];

  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    .toISOString().split("T")[0];

  const month = today.slice(0, 7);

  function calcCompliance(filterFn) {
    const filtered = surveys.filter(filterFn);
    if (filtered.length === 0) return 0;

    const completed = filtered.filter(s =>
      Object.values(s.tasks_completed || {}).every(v => v === true)
    ).length;

    return Math.round((completed / filtered.length) * 100);
  }

  const todayVal = calcCompliance(s => s.date && s.date.startsWith(today));
  const weekVal = calcCompliance(s => s.date && s.date >= weekStart);
  const monthVal = calcCompliance(s => s.date && s.date.startsWith(month));

  const todayEl = document.getElementById("todayCompliance");
  const weekEl = document.getElementById("weekCompliance");
  const monthEl = document.getElementById("monthCompliance");

  if (todayEl) todayEl.innerText = todayVal + "%";
  if (weekEl) weekEl.innerText = weekVal + "%";
  if (monthEl) monthEl.innerText = monthVal + "%";

  setTrend("todayTrend", todayVal, weekVal);
  setTrend("weekTrend", weekVal, monthVal);
  setTrend("monthTrend", monthVal, monthVal);
}


// ===============================
// CSV EXPORT
// ===============================
function exportCSV(surveys) {
  const rows = [
    ["ID", "Date", "Room", "Staff", "Shift", "Tasks Completed", "Notes"]
  ];

  surveys.forEach(s => {
    rows.push([
      s.id,
      s.date,
      s.room,
      s.staff_name,
      s.shift,
      JSON.stringify(s.tasks_completed),
      s.notes || ""
    ]);
  });

  let csvContent = "data:text/csv;charset=utf-8," 
    + rows.map(e => e.join(",")).join("\n");

  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "cleaning_surveys.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
}


// ===============================
// FULL DASHBOARD PDF EXPORT
// ===============================
document.getElementById("btn-pdf").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;

  const dashboard = document.querySelector(".content-wrapper");
  if (!dashboard) return;

  html2canvas(dashboard, { scale: 2 }).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("cleaning_dashboard.pdf");
  });
});


// ===============================
// MONTHLY REPORT PDF EXPORT
// ===============================
document.getElementById("btn-monthly-report")?.addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const surveys = await fetchSurveys();

  const month = new Date().toISOString().slice(0, 7);
  const monthly = surveys.filter(s => s.date && s.date.startsWith(month));

  const pdf = new jsPDF("p", "mm", "a4");
  let y = 10;

  pdf.setFontSize(18);
  pdf.text("Monthly Cleaning Report", 10, y);
  y += 10;

  pdf.setFontSize(12);
  pdf.text(`Month: ${month}`, 10, y);
  y += 8;

  pdf.text(`Total Submissions: ${monthly.length}`, 10, y);
  y += 8;

  const completed = monthly.filter(s =>
    Object.values(s.tasks_completed || {}).every(v => v === true)
  ).length;

  const compliance = monthly.length
    ? Math.round((completed / monthly.length) * 100)
    : 0;

  pdf.text(`Overall Compliance: ${compliance}%`, 10, y);
  y += 12;

  pdf.setFontSize(14);
  pdf.text("Room Breakdown", 10, y);
  y += 8;

  const rooms = {};
  monthly.forEach(s => {
    if (!rooms[s.room]) rooms[s.room] = { total: 0, clean: 0 };
    rooms[s.room].total++;
    if (Object.values(s.tasks_completed || {}).every(v => v)) rooms[s.room].clean++;
  });

  pdf.setFontSize(12);
  Object.keys(rooms).forEach(room => {
    const r = rooms[room];
    const pct = Math.round((r.clean / r.total) * 100);
    pdf.text(`${room}: ${pct}% (${r.clean}/${r.total})`, 10, y);
    y += 6;
  });

  pdf.save(`cleaning_report_${month}.pdf`);
});


// ===============================
// MAIN LOAD FUNCTION
// ===============================
async function loadAndRender() {
  const surveys = await fetchSurveys();
  renderTable(surveys);
  buildComplianceChart(surveys);
  updateSummaryCards(surveys);
  buildRoomChart(surveys);
}


// ===============================
// EVENT LISTENERS
// ===============================
document.getElementById("btn-refresh").addEventListener("click", loadAndRender);
document.getElementById("btn-export").addEventListener("click", async () => {
  const surveys = await fetchSurveys();
  exportCSV(surveys);
});

document.getElementById("filter-room").addEventListener("input", loadAndRender);
document.getElementById("filter-staff").addEventListener("input", loadAndRender);
document.getElementById("filter-shift").addEventListener("input", loadAndRender);


// ===============================
// INITIAL LOAD
// ===============================
loadAndRender();
