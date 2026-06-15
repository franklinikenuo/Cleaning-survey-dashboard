const supabaseUrl = "https://cpbkdtcrimppsxlstlob.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwYmtkdGNyaW1wcHN4bHN0bG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDEzMTMsImV4cCI6MjA5NjUxNzMxM30.oWvz_eKGwP7Po0SfSCHDNStCJanpn-c-gqaOkAjCJMI";

const client = supabase.createClient(supabaseUrl, supabaseKey);

let allData = [];

/* =============================
   DOM ELEMENTS
============================= */
const tableBody = document.querySelector("#submissions-table tbody");

const totalEl = document.getElementById("total-submissions");
const complianceEl = document.getElementById("overall-compliance");
const topShiftEl = document.getElementById("top-shift");
const avgTasksEl = document.getElementById("avg-tasks");

/* =============================
   FETCH DATA (SUPABASE)
============================= */
async function fetchData() {
  try {
    const { data, error } = await client
      .from("surveys")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.log("Supabase fetch error:", err);
    return [];
  }
}

/* =============================
   FILTERS
============================= */
function applyFilters(data) {
  const room = document.getElementById("filter-room").value;
  const staff = document.getElementById("filter-staff").value.toLowerCase();
  const shift = document.getElementById("filter-shift").value;
  const date = document.getElementById("filter-date").value;

  return data.filter(item => {
    if (room !== "all" && item.room !== room) return false;
    if (shift !== "all" && item.shift !== shift) return false;
    if (staff && !item.staff?.toLowerCase().includes(staff)) return false;
    if (date && item.created_at?.split("T")[0] !== date) return false;

    return true;
  });
}

/* =============================
   SUMMARY
============================= */
function updateSummary(data) {
  totalEl.textContent = data.length;

  const shiftCount = {};
  let totalTasks = 0;
  let completedTasks = 0;

  data.forEach(d => {
    shiftCount[d.shift] = (shiftCount[d.shift] || 0) + 1;

    if (d.tasks_completed) {
      Object.values(d.tasks_completed).forEach(v => {
        totalTasks++;
        if (v === "Y") completedTasks++;
      });
    }
  });

  const compliance = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  complianceEl.textContent = compliance + "%";

  const topShift = Object.entries(shiftCount)
    .sort((a,b) => b[1]-a[1])[0]?.[0] || "-";

  topShiftEl.textContent = topShift;

  avgTasksEl.textContent = data.length
    ? (totalTasks / data.length).toFixed(1)
    : 0;
}

/* =============================
   TABLE
============================= */
function renderTable(data) {
  tableBody.innerHTML = "";

  data.forEach(item => {
    const tr = document.createElement("tr");

    const tasks = item.tasks_completed
      ? Object.entries(item.tasks_completed)
          .map(([k,v]) => `${k}:${v}`)
          .join(" | ")
      : "";

    tr.innerHTML = `
      <td>${item.room || ""}</td>
      <td>${item.shift || ""}</td>
      <td>${item.staff || ""}</td>
      <td>${tasks}</td>
      <td>${item.notes || ""}</td>
      <td>${item.created_at?.split("T")[0] || ""}</td>
    `;

    tableBody.appendChild(tr);
  });
}

/* =============================
   CHARTS
============================= */
let roomChart, shiftChart, trendChart;

function renderCharts(data) {
  /* ROOM */
  const roomMap = {};
  data.forEach(d => roomMap[d.room] = (roomMap[d.room] || 0) + 1);

  if (roomChart) roomChart.destroy();

  roomChart = new Chart(document.getElementById("roomChart"), {
    type: "bar",
    data: {
      labels: Object.keys(roomMap),
      datasets: [{
        label: "Submissions",
        data: Object.values(roomMap)
      }]
    }
  });

  /* SHIFT */
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

  /* TREND */
  const trend = {};

  data.forEach(d => {
    const day = d.created_at?.split("T")[0];
    if (!day) return;
    trend[day] = (trend[day] || 0) + 1;
  });

  if (trendChart) trendChart.destroy();

  trendChart = new Chart(document.getElementById("tasksTrendChart"), {
    type: "line",
    data: {
      labels: Object.keys(trend),
      datasets: [{
        label: "Daily Submissions",
        data: Object.values(trend)
      }]
    }
  });
}

/* =============================
   MAIN REFRESH
============================= */
async function refresh() {
  const filtered = applyFilters(allData);

  updateSummary(filtered);
  renderTable(filtered);
  renderCharts(filtered);
}

/* =============================
   INIT
============================= */
async function init() {
  allData = await fetchData();
  await refresh();

  setInterval(async () => {
    allData = await fetchData();
    await refresh();
  }, 15000);
}

init();
