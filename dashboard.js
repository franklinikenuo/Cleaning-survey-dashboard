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

    tr.innerHTML = `
      <td>${s.id}</td>
      <td>${s.date || ""}</td>
      <td>${s.room || ""}</td>
      <td>${s.staff_name || ""}</td>
      <td>${s.shift || ""}</td>
      <td>${tasks}</td>
      <td>${s.notes || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}


// ===============================
// BUILD COMPLIANCE CHART
// ===============================
let complianceChartInstance = null;

function buildComplianceChart(surveys) {
  const ctx = document.getElementById("complianceChart").getContext("2d");

  // Destroy old chart if it exists
  if (complianceChartInstance) {
    complianceChartInstance.destroy();
  }

  // Group by date
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
// MAIN LOAD FUNCTION
// ===============================
async function loadAndRender() {
  const surveys = await fetchSurveys();
  renderTable(surveys);
  buildComplianceChart(surveys);
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
