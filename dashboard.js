/* ------------------------------------------------------------
   CLEANING DASHBOARD — FULL REWRITE (v12)
   Stable, chart‑safe PDF, correct jsPDF UMD
------------------------------------------------------------ */

const API_BASE = "https://cleaning-survey-api-v2-x6sf.onrender.com";

/* ------------------------------------------------------------
   WARM-UP + RETRY WRAPPERS
------------------------------------------------------------ */

async function wakeBackend() {
  try {
    await fetch(API_BASE);
  } catch (err) {
    console.log("Backend waking up…");
  }
}

async function getWithRetry(url, retries = 3) {
  try {
    return await fetch(url);
  } catch (err) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, 1500));
      return getWithRetry(url, retries - 1);
    }
    throw err;
  }
}

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
    await wakeBackend();
    const res = await getWithRetry(`${API_BASE}/submissions`);
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
   EXPORT: CSV
------------------------------------------------------------ */

document.getElementById("btn-export-csv").onclick = () => {
  const rows = [["Room", "Shift", "Staff", "Tasks", "Notes", "Timestamp"]];

  const filtered = applyFilters(allData);

  filtered.forEach(e => {
    rows.push([
      e.room,
      e.shift,
      e.staff,
      Object.entries(e.tasks_completed).map(([k, v]) => `${k}: ${v}`).join("; "),
      e.notes || "",
      e.timestamp
    ]);
  });

  let csv = rows.map(r => r.join(",")).join("\n");
  let blob = new Blob([csv], { type: "text/csv" });

  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "cleaning_report.csv";
  link.click();
};

/* ------------------------------------------------------------
   EXPORT: EXCEL
------------------------------------------------------------ */

document.getElementById("btn-export-excel").onclick = () => {
  const filtered = applyFilters(allData);

  const worksheetData = filtered.map(e => ({
    Room: e.room,
    Shift: e.shift,
    Staff: e.staff,
    Tasks: Object.entries(e.tasks_completed)
      .map(([k, v]) => `${k}: ${v}`)
      .join("; "),
    Notes: e.notes || "",
    Timestamp: e.timestamp
  }));

  const ws = XLSX.utils.json_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  XLSX.writeFile(wb, "cleaning_report.xlsx");
};

/* ------------------------------------------------------------
   EXPORT: PDF (Local) — FINAL FIXED VERSION
------------------------------------------------------------ */

document.getElementById("btn-local-pdf").onclick = async () => {
  const { jsPDF } = window.jspdf;
  const element = document.querySelector(".main-layout");

  const canvases = document.querySelectorAll("canvas");
  const replacements = [];

  canvases.forEach(canvas => {
    const img = new Image();
    img.src = canvas.toDataURL("image/png");
    img.style.width = canvas.style.width;
    img.style.height = canvas.style.height;

    canvas.style.display = "none";
    canvas.parentNode.insertBefore(img, canvas);

    replacements.push({ canvas, img });
  });

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  });

  replacements.forEach(({ canvas, img }) => {
    img.remove();
    canvas.style.display = "block";
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, width, height);
  pdf.save("cleaning_dashboard.pdf");
};

/* ------------------------------------------------------------
   INIT
------------------------------------------------------------ */

let allData = [];

async function refresh() {
  const filtered = applyFilters(allData);

  updateSummary(filtered);
  renderTable(filtered);
  renderRoomChart(filtered);

  if (emailDashboardPdfBtn) {
    emailDashboardPdfBtn.disabled = false;
  }
}

async function init() {
  allData = await fetchData();
  refresh();
}

init();
