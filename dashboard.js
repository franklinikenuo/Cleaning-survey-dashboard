/* ============================================================
   CLEANING DASHBOARD v2 — Hospital Grade System
   Includes: Analytics + Leaderboard + Export System v2
============================================================ */

const supabaseUrl = "https://cpbkdtcrimppsxlstlob.supabase.co";
const supabaseKey = "YOUR_SUPABASE_KEY";

const client = supabase.createClient(supabaseUrl, supabaseKey);

let allData = [];

/* =========================
   UTIL
========================= */

function splitStaff(staff) {
  if (!staff) return [];
  return staff.split(",").map(s => s.trim()).filter(Boolean);
}

/* =========================
   FETCH
========================= */

async function fetchData() {
  const { data, error } = await client
    .from("surveys")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
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
   ANALYTICS ENGINE
========================= */

function getStaffStats(data) {
  const map = {};

  data.forEach(entry => {
    const staffList = splitStaff(entry.staff);

    staffList.forEach(name => {
      if (!map[name]) {
        map[name] = { name, shifts: 0, yes: 0, total: 0 };
      }

      map[name].shifts++;

      if (entry.tasks_completed) {
        Object.values(entry.tasks_completed).forEach(v => {
          map[name].total++;
          if (v === "Y") map[name].yes++;
        });
      }
    });
  });

  return Object.values(map).map(s => ({
    ...s,
    compliance: s.total ? Math.round((s.yes / s.total) * 100) : 0
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
  const stats = getStaffStats(data).sort((a,b) => b.compliance - a.compliance);

  container.innerHTML = stats.map((s,i) => `
    <div style="padding:8px;border-bottom:1px solid #eee">
      <b>#${i+1} ${s.name}</b> — ${s.compliance}% | Shifts: ${s.shifts}
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
      datasets: [{
        label: "Submissions",
        data: Object.values(rooms)
      }]
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
   EXPORT SYSTEM v2
========================= */

function getFilteredData() {
  return applyFilters(allData);
}

function exportCSV() {
  const data = getFilteredData();

  const rows = [
    ["Room","Shift","Staff","Tasks","Notes","Date"],
    ...data.map(d => [
      d.room,
      d.shift,
      d.staff,
      d.tasks_completed ? Object.entries(d.tasks_completed).map(([k,v]) => `${k}:${v}`).join(" | ") : "",
      d.notes,
      d.created_at?.split("T")[0] || ""
    ])
  ];

  const csv = rows.map(r => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "cleaning-report.csv";
  a.click();
}

function exportExcel() {
  const data = getFilteredData();

  const sheet = data.map(d => ({
    Room: d.room,
    Shift: d.shift,
    Staff: d.staff,
    Tasks: d.tasks_completed ? Object.entries(d.tasks_completed).map(([k,v]) => `${k}:${v}`).join(" | ") : "",
    Notes: d.notes,
    Date: d.created_at?.split("T")[0] || ""
  }));

  const ws = XLSX.utils.json_to_sheet(sheet);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, "cleaning-report.xlsx");
}

async function exportPDF() {
  const { jsPDF } = window.jspdf;

  const element = document.querySelector(".main-layout");

  const canvas = await html2canvas(element, { scale: 2 });

  const img = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p","mm","a4");

  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(img,"PNG",0,0,width,height);
  pdf.save("cleaning-dashboard.pdf");
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
  refresh();

  setInterval(async () => {
    allData = await fetchData();
    refresh();
  }, 15000);
}

init();
