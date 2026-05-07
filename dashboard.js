const API_BASE = "https://cleaning-survey-api.onrender.com";

async function fetchSurveys() {
  const res = await fetch(`${API_BASE}/survey`);
  if (!res.ok) {
    console.error("Failed to fetch surveys");
    return [];
  }
  return await res.json();
}

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

async function loadAndRender() {
  const surveys = await fetchSurveys();
  renderTable(surveys);
}

document.getElementById("btn-refresh").addEventListener("click", loadAndRender);
document.getElementById("filter-room").addEventListener("input", loadAndRender);
document.getElementById("filter-staff").addEventListener("input", loadAndRender);
document.getElementById("filter-shift").addEventListener("input", loadAndRender);

loadAndRender();
