const supabaseUrl = "https://cpbkdtcrimppsxlstlob.supabase.co";
const supabaseKey = "YOUR_KEY_HERE";
const client = supabase.createClient(supabaseUrl, supabaseKey);

let allData = [];

/* ================= SAFE HELPER ================= */
function safe(val, fallback = "") {
  return val ?? fallback;
}

/* ================= FETCH ================= */
async function fetchData() {
  try {
    const { data, error } = await client
      .from("surveys")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}

/* ================= FILTERS ================= */
function applyFilters(data) {
  const room = document.getElementById("filter-room")?.value || "all";
  const staff = (document.getElementById("filter-staff")?.value || "").toLowerCase();
  const shift = document.getElementById("filter-shift")?.value || "all";
  const date = document.getElementById("filter-date")?.value || "";

  return data.filter(d => {
    if (room !== "all" && d.room !== room) return false;
    if (shift !== "all" && d.shift !== shift) return false;
    if (staff && !(d.staff || "").toLowerCase().includes(staff)) return false;
    if (date && (d.created_at?.split("T")[0] !== date)) return false;
    return true;
  });
}

/* ================= SUMMARY ================= */
function updateSummary(data) {
  const totalEl = document.getElementById("total-submissions");
  const compEl = document.getElementById("overall-compliance");

  if (totalEl) totalEl.textContent = data.length;

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

  if (compEl) compEl.textContent = compliance + "%";
}

/* ================= TABLE ================= */
function renderTable(data) {
  const tbody = document.querySelector("#submissions-table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  data.forEach(d => {
    const tasks = d.tasks_completed
      ? Object.entries(d.tasks_completed)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" | ")
      : "";

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${safe(d.room)}</td>
      <td>${safe(d.shift)}</td>
      <td>${safe(d.staff)}</td>
      <td>${tasks}</td>
      <td>${safe(d.notes)}</td>
      <td>${d.created_at?.split("T")[0] || ""}</td>
    `;

    tbody.appendChild(tr);
  });
}

/* ================= CHARTS (SAFE MODE) ================= */
let roomChart, shiftChart;

function renderCharts(data) {
  try {
    const roomCanvas = document.getElementById("roomChart");
    const shiftCanvas = document.getElementById("shiftChart");

    if (!roomCanvas || !shiftCanvas || typeof Chart === "undefined") return;

    /* ROOM CHART */
    const rooms = {};
    data.forEach(d => {
      if (!d.room) return;
      rooms[d.room] = (rooms[d.room] || 0) + 1;
    });

    if (roomChart) roomChart.destroy();

    roomChart = new Chart(roomCanvas, {
      type: "bar",
      data: {
        labels: Object.keys(rooms),
        datasets: [{
          label: "Submissions",
          data: Object.values(rooms)
        }]
      }
    });

    /* SHIFT CHART */
    const shifts = ["Morning", "Afternoon", "Evening", "Night"];
    const shiftData = shifts.map(s => data.filter(d => d.shift === s).length);

    if (shiftChart) shiftChart.destroy();

    shiftChart = new Chart(shiftCanvas, {
      type: "pie",
      data: {
        labels: shifts,
        datasets: [{
          data: shiftData
        }]
      }
    });

  } catch (err) {
    console.log("Chart error:", err);
  }
}

/* ================= LEADERBOARD ================= */
function splitStaff(staff) {
  if (!staff) return [];
  return staff.split(",").map(s => s.trim());
}

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

function renderLeaderboard(data) {
  const container = document.getElementById("staff-leaderboard");
  if (!container) return;

  const stats = getStaffStats(data)
    .sort((a, b) => b.compliance - a.compliance);

  container.innerHTML = stats.length
    ? stats.map((s, i) => `
        <div style="padding:8px;border-bottom:1px solid #eee">
          <b>#${i + 1} ${s.name}</b><br>
          Compliance: ${s.compliance}% | Shifts: ${s.shifts}
        </div>
      `).join("")
    : "No data available";
}

/* ================= EXPORT SYSTEM V2 (UNCHANGED) ================= */
function exportCSV() {
  const data = applyFilters(allData);

  let csv = "Room,Shift,Staff,Tasks,Notes,Date\n";

  data.forEach(d => {
    const tasks = d.tasks_completed
      ? Object.entries(d.tasks_completed).map(([k, v]) => `${k}:${v}`).join(" | ")
      : "";

    csv += `${safe(d.room)},${safe(d.shift)},${safe(d.staff)},"${tasks}",${safe(d.notes)},${d.created_at?.split("T")[0]}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "report.csv";
  a.click();
}

function exportExcel() {
  const data = applyFilters(allData);

  const wsData = data.map(d => ({
    Room: safe(d.room),
    Shift: safe(d.shift),
    Staff: safe(d.staff),
    Notes: safe(d.notes),
    Date: d.created_at?.split("T")[0] || ""
  }));

  const ws = XLSX.utils.json_to_sheet(wsData);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, "report.xlsx");
}

async function exportPDF() {
  const element = document.querySelector(".main-layout");

  const canvas = await html2canvas(element, { scale: 2 });

  const img = canvas.toDataURL("image/png");

  const pdf = new jspdf.jsPDF("p", "mm", "a4");

  const w = pdf.internal.pageSize.getWidth();
  const h = (canvas.height * w) / canvas.width;

  pdf.addImage(img, "PNG", 0, 0, w, h);
  pdf.save("dashboard.pdf");
}

/* ================= REFRESH ================= */
async function refresh() {
  const filtered = applyFilters(allData);

  updateSummary(filtered);
  renderTable(filtered);
  renderCharts(filtered);
  renderLeaderboard(filtered);
}

/* ================= INIT ================= */
async function init() {
  allData = await fetchData();
  await refresh();

  setInterval(async () => {
    allData = await fetchData();
    await refresh();
  }, 15000);
}

init();
