const supabaseUrl = "https://cpbkdtcrimppsxlstlob.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwYmtkdGNyaW1wcHN4bHN0bG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDEzMTMsImV4cCI6MjA5NjUxNzMxM30.oWvz_eKGwP7Po0SfSCHDNStCJanpn-c-gqaOkAjCJMI";

const client = supabase.createClient(supabaseUrl, supabaseKey);

let allData = [];

/* =========================
   STAFF SPLITTER
========================= */
function splitStaff(staff) {
  if (!staff) return [];
  return staff.split(",").map(s => s.trim()).filter(Boolean);
}

/* =========================
   FETCH DATA
========================= */
async function fetchData() {
  const { data, error } = await client
    .from("surveys")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
    return [];
  }

  return data || [];
}

/* =========================
   FILTERS
========================= */
function applyFilters(data) {
  const room = document.getElementById("filter-room").value;
  const staff = document.getElementById("filter-staff").value.toLowerCase();
  const shift = document.getElementById("filter-shift").value;
  const date = document.getElementById("filter-date").value;

  return data.filter(d => {
    if (room !== "all" && d.room !== room) return false;
    if (shift !== "all" && d.shift !== shift) return false;
    if (staff && !d.staff?.toLowerCase().includes(staff)) return false;
    if (date && d.created_at?.split("T")[0] !== date) return false;
    return true;
  });
}

/* =========================
   STAFF ANALYTICS ENGINE
========================= */
function getStaffStats(data) {
  const map = {};

  data.forEach(entry => {
    const staffList = splitStaff(entry.staff);

    staffList.forEach(name => {
      if (!map[name]) {
        map[name] = {
          name,
          shifts: 0,
          tasksTotal: 0,
          tasksYes: 0
        };
      }

      map[name].shifts++;

      if (entry.tasks_completed) {
        Object.values(entry.tasks_completed).forEach(v => {
          map[name].tasksTotal++;
          if (v === "Y") map[name].tasksYes++;
        });
      }
    });
  });

  return Object.values(map).map(s => ({
    ...s,
    compliance: s.tasksTotal ? Math.round((s.tasksYes / s.tasksTotal) * 100) : 0
  }));
}

/* =========================
   SUMMARY
========================= */
function updateSummary(data) {
  document.getElementById("total-submissions").textContent = data.length;

  let total = 0;
  let yes = 0;

  data.forEach(d => {
    if (!d.tasks_completed) return;
    Object.values(d.tasks_completed).forEach(v => {
      total++;
      if (v === "Y") yes++;
    });
  });

  const compliance = total ? Math.round((yes / total) * 100) : 0;
  document.getElementById("overall-compliance").textContent = compliance + "%";
}

/* =========================
   TABLE
========================= */
function renderTable(data) {
  const tbody = document.querySelector("#submissions-table tbody");
  tbody.innerHTML = "";

  data.forEach(d => {
    const tr = document.createElement("tr");

    const tasks = d.tasks_completed
      ? Object.entries(d.tasks_completed).map(([k,v]) => `${k}:${v}`).join(" | ")
      : "";

    tr.innerHTML = `
      <td>${d.room || ""}</td>
      <td>${d.shift || ""}</td>
      <td>${d.staff || ""}</td>
      <td>${tasks}</td>
      <td>${d.notes || ""}</td>
      <td>${d.created_at?.split("T")[0] || ""}</td>
    `;

    tbody.appendChild(tr);
  });
}

/* =========================
   LEADERBOARD
========================= */
function renderLeaderboard(data) {
  const container = document.getElementById("staff-leaderboard");

  const stats = getStaffStats(data)
    .sort((a,b) => b.compliance - a.compliance);

  container.innerHTML = stats.map((s, i) => `
    <div style="padding:10px;border-bottom:1px solid #ddd">
      <b>#${i+1} ${s.name}</b><br>
      Compliance: ${s.compliance}%<br>
      Shifts: ${s.shifts}
    </div>
  `).join("");
}

/* =========================
   CHARTS
========================= */
let roomChart, shiftChart;

function renderCharts(data) {
  const rooms = {};
  data.forEach(d => rooms[d.room] = (rooms[d.room] || 0) + 1);

  if (roomChart) roomChart.destroy();

  roomChart = new Chart(document.getElementById("roomChart"), {
    type: "bar",
    data: {
      labels: Object.keys(rooms),
      datasets: [{ label: "Submissions", data: Object.values(rooms) }]
    }
  });

  const shifts = ["Morning","Afternoon","Evening","Night"];
  const shiftData = shifts.map(s => data.filter(d => d.shift === s).length);

  if (shiftChart) shiftChart.destroy();

  shiftChart = new Chart(document.getElementById("shiftChart"), {
    type: "pie",
    data: {
      labels: shifts,
      datasets: [{ data: shiftData }]
    }
  });
}

/* =========================
   REFRESH
========================= */
async function refresh() {
  const filtered = applyFilters(allData);

  updateSummary(filtered);
  renderTable(filtered);
  renderCharts(filtered);
  renderLeaderboard(filtered);
}

/* =========================
   INIT
========================= */
async function init() {
  allData = await fetchData();
  await refresh();

  setInterval(async () => {
    allData = await fetchData();
    await refresh();
  }, 15000);
}

init();
