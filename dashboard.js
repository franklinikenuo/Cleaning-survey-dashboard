const supabaseUrl = "https://cpbkdtcrimppsxlstlob.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwYmtkdGNyaW1wcHN4bHN0bG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDEzMTMsImV4cCI6MjA5NjUxNzMxM30.oWvz_eKGwP7Po0SfSCHDNStCJanpn-c-gqaOkAjCJMI";
const client = supabase.createClient(supabaseUrl, supabaseKey);

let allData = [];

/* =========================
   FETCH (FIXED + STABLE)
========================= */
async function fetchData() {
  const { data: surveys, error: surveyError } = await client
    .from("surveys")
    .select("*")
    .order("created_at", { ascending: false });

  if (surveyError) {
    console.error("Survey error:", surveyError);
    return [];
  }

  const { data: tasks, error: taskError } = await client
    .from("tasks")
    .select("*");

  if (taskError) {
    console.error("Task error:", taskError);
  }

  const taskMap = {};

  (tasks || []).forEach(t => {
    if (!taskMap[t.survey_id]) taskMap[t.survey_id] = {};
    taskMap[t.survey_id][t.task_name] = t.completed;
  });

  return (surveys || []).map(s => ({
    ...s,
    tasks_completed: taskMap[s.id] || {}
  }));
}

/* =========================
   FILTERS
========================= */
function applyFilters(data) {
  const room = document.getElementById("filter-room")?.value || "all";
  const staff = (document.getElementById("filter-staff")?.value || "").toLowerCase();
  const shift = document.getElementById("filter-shift")?.value || "all";
  const date = document.getElementById("filter-date")?.value || "";

  return data.filter(d => {
    if (room !== "all" && d.room !== room) return false;
    if (shift !== "all" && d.shift !== shift) return false;
    if (staff && !(d.staff || "").toLowerCase().includes(staff)) return false;
    if (date && (d.created_at || "").split("T")[0] !== date) return false;
    return true;
  });
}

/* =========================
   SUMMARY
========================= */
function updateSummary(data) {
  document.getElementById("total-submissions").textContent = data.length;

  let total = 0;
  let yes = 0;

  data.forEach(d => {
    Object.values(d.tasks_completed || {}).forEach(v => {
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
  if (!tbody) return;

  tbody.innerHTML = "";

  data.forEach(d => {
    const tasks = Object.entries(d.tasks_completed || {})
      .map(([k, v]) => `${k}:${v}`)
      .join(" | ");

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${d.room || ""}</td>
      <td>${d.shift || ""}</td>
      <td>${d.staff || ""}</td>
      <td>${tasks}</td>
      <td>${d.notes || ""}</td>
      <td>${(d.created_at || "").split("T")[0]}</td>
    `;

    tbody.appendChild(tr);
  });
}

/* =========================
   CHARTS (SAFE RESET)
========================= */
let roomChart, shiftChart;

function renderCharts(data) {
  const rooms = {};

  data.forEach(d => {
    if (!d.room) return;
    rooms[d.room] = (rooms[d.room] || 0) + 1;
  });

  const roomCtx = document.getElementById("roomChart");
  const shiftCtx = document.getElementById("shiftChart");

  if (!roomCtx || !shiftCtx) return;

  if (roomChart) roomChart.destroy();
  if (shiftChart) shiftChart.destroy();

  roomChart = new Chart(roomCtx, {
    type: "bar",
    data: {
      labels: Object.keys(rooms),
      datasets: [{
        label: "Submissions",
        data: Object.values(rooms)
      }]
    }
  });

  const shifts = ["Morning", "Afternoon", "Evening", "Night"];

  shiftChart = new Chart(shiftCtx, {
    type: "pie",
    data: {
      labels: shifts,
      datasets: [{
        data: shifts.map(s => data.filter(d => d.shift === s).length)
      }]
    }
  });
}

/* =========================
   LEADERBOARD
========================= */
function splitStaff(staff) {
  return (staff || "").split(",").map(s => s.trim()).filter(Boolean);
}

function getStaffStats(data) {
  const map = {};

  data.forEach(entry => {
    splitStaff(entry.staff).forEach(name => {
      if (!map[name]) {
        map[name] = { name, shifts: 0, yes: 0, total: 0 };
      }

      map[name].shifts++;

      Object.values(entry.tasks_completed || {}).forEach(v => {
        map[name].total++;
        if (v === "Y") map[name].yes++;
      });
    });
  });

  return Object.values(map).map(s => ({
    ...s,
    compliance: s.total ? Math.round((s.yes / s.total) * 100) : 0
  }));
}

function renderLeaderboard(data) {
  const container = document.getElementById("staff-leaderboard");
  if (!container) return;

  const stats = getStaffStats(data)
    .sort((a, b) => b.compliance - a.compliance);

  container.innerHTML = stats.length
    ? stats.map((s, i) => `
        <div style="padding:8px;border-bottom:1px solid #eee">
          <b>#${i+1} ${s.name}</b><br>
          Compliance: ${s.compliance}% | Shifts: ${s.shifts}
        </div>
      `).join("")
    : "No data yet";
}

/* =========================
   EXPORT (STABLE)
========================= */
function exportCSV() {
  const data = applyFilters(allData);

  let csv = "Room,Shift,Staff,Tasks,Notes,Date\n";

  data.forEach(d => {
    const tasks = Object.entries(d.tasks_completed || {})
      .map(([k, v]) => `${k}:${v}`)
      .join(" | ");

    csv += `${d.room},${d.shift},${d.staff},"${tasks}",${d.notes},${(d.created_at || "").split("T")[0]}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "cleaning-report.csv";
  a.click();
}

function exportExcel() {
  const data = applyFilters(allData);

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, "cleaning-report.xlsx");
}

async function exportPDF() {
  const element = document.querySelector(".main-layout");
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  const pdf = new jspdf.jsPDF("p", "mm", "a4");

  const w = pdf.internal.pageSize.getWidth();
  const h = (canvas.height * w) / canvas.width;

  pdf.addImage(img, "PNG", 0, 0, w, h);
  pdf.save("cleaning-dashboard.pdf");
}

/* =========================
   REFRESH LOOP
========================= */
async function refresh() {
  const filtered = applyFilters(allData);

  updateSummary(filtered);
  renderTable(filtered);
  renderCharts(filtered);
  renderLeaderboard(filtered);
}

/* =========================
   INIT (SAFE)
========================= */
async function init() {
  allData = await fetchData();
  await refresh();

  setInterval(async () => {
    allData = await fetchData();
    refresh();
  }, 15000);
}

init();
