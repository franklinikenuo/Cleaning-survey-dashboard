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
  const values = labels.map(d =>
