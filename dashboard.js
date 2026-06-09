/* ============================================================
   CLEANING DASHBOARD — ENTERPRISE EDITION (v3.1)
   Stable • Modular • Mobile‑Safe • Hospital‑Grade
   ============================================================ */

const API_BASE = "https://cleaning-survey-api-v2-x6sf.onrender.com";

/* ============================================================
   UTILITIES — Toasts, Loading, Helpers
   ============================================================ */

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: type === "error" ? "#d7263d" : "#0b3a6f",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "0.85rem",
    zIndex: 99999,
    opacity: 0,
    transition: "opacity 0.3s ease"
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => (toast.style.opacity = 1));

  setTimeout(() => {
    toast.style.opacity = 0;
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

function setLoading(btn, isLoading) {
  if (!btn) return;
  if (isLoading) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = "Processing…";
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.originalText;
    btn.disabled = false;
  }
}

/* ============================================================
   DOM ELEMENTS
   ============================================================ */

const filterRoom = document.getElementById("filter-room");
const filterStaff = document.getElementById("filter-staff");
const filterShift = document.getElementById("filter-shift");
const filterDate = document.getElementById("filter-date");

const totalSubmissionsEl = document.getElementById("total-submissions");
const overallComplianceEl = document.getElementById("overall-compliance");
const topShiftEl = document.getElementById("top-shift");
const avgTasksEl = document.getElementById("avg-tasks");

const tableBody = document.querySelector("#submissions-table tbody");

const btnLocalPDF = document.getElementById("btn-local-pdf");
const btnCSV = document.getElementById("btn-export-csv");
const btnExcel = document.getElementById("btn-export-excel");
const btnChartsPDF = document.getElementById("exportPdfWithChartsBtn");

/* ============================================================
   FETCH + FILTERS
   ============================================================ */

async function fetchData() {
  try {
    const res = await fetch(`${API_BASE}/submissions`);
    return await res.json();
  } catch (err) {
    showToast("Failed to load data", "error");
    return [];
  }
}

function applyFilters(data) {
  return data.filter(entry => {
    if (filterRoom.value !== "all" && entry.room !== filterRoom.value) return false;
    if (filterStaff.value &&
        !entry.staff.toLowerCase().includes(filterStaff.value.toLowerCase())) return false;
    if (filterShift.value !== "all" && entry.shift !== filterShift.value) return false;

    if (filterDate.value) {
      const entryDate = entry.timestamp.split(" ")[0];
      if (entryDate !== filterDate.value) return false;
    }

    return true;
  });
}

/* ============================================================
   SUMMARY CARDS
   ============================================================ */

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

  const compliance = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  overallComplianceEl.textContent = compliance + "%";

  const shiftCounts = {};
  data.forEach(e => shiftCounts[e.shift] = (shiftCounts[e.shift] || 0) + 1);

  const topShift = Object.entries(shiftCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  topShiftEl.textContent = topShift;

  const avgTasks = data.length
    ? (data.reduce((sum, e) => sum + Object.keys(e.tasks_completed).length, 0) / data.length).toFixed(1)
    : 0;

  avgTasksEl.textContent = avgTasks;
}

/* ============================================================
   TABLE
   ============================================================ */

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

/* ============================================================
   CHARTS
   ============================================================ */

let roomChart, shiftChart, tasksTrendChart;

function renderRoomChart(data) {
  if (roomChart) roomChart.destroy();

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

    return total ? Math.round((yes / total) * 100) : 0;
  });

  roomChart = new Chart(document.getElementById("roomChart"), {
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
    options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
  });
}

function renderShiftChart(data) {
  if (shiftChart) shiftChart.destroy();

  const shifts = ["Morning", "Afternoon", "Evening", "Night"];
  const counts = shifts.map(s => data.filter(e => e.shift === s).length);

  shiftChart = new Chart(document.getElementById("shiftChart"), {
    type: "pie",
    data: {
      labels: shifts,
      datasets: [
        {
          data: counts,
          backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#9C27B0"]
        }
      ]
    },
    options: { responsive: true }
  });
}

function renderTasksTrendChart(data) {
  if (tasksTrendChart) tasksTrendChart.destroy();

  const daily = {};

  data.forEach(entry => {
    const date = entry.timestamp.split(" ")[0];

    if (!daily[date]) daily[date] = { yes: 0, total: 0 };

    for (const key in entry.tasks_completed) {
      daily[date].total++;
      if (entry.tasks_completed[key] === "Y") daily[date].yes++;
    }
  });

  const dates = Object.keys(daily).sort();
  const percentages = dates.map(d =>
    Math.round((daily[d].yes / daily[d].total) * 100)
  );

  tasksTrendChart = new Chart(document.getElementById("tasksTrendChart"), {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Daily Completion %",
          data: percentages,
          borderColor: "#0b3a6f",
          backgroundColor: "rgba(11,58,111,0.2)",
          tension: 0.3
        }
      ]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
  });
}

/* ============================================================
   EXPORTS — CSV, Excel, Local PDF, Charts PDF
   ============================================================ */

btnCSV.onclick = () => {
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

  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "cleaning_report.csv";
  link.click();
};

btnExcel.onclick = () => {
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

btnLocalPDF.onclick = () => {
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

  html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  }).then(canvas => {
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
  });
};

btnChartsPDF.onclick = async () => {
  setLoading(btnChartsPDF, true);

  try {
    const roomCanvas = document.getElementById("roomChart");
    const shiftCanvas = document.getElementById("shiftChart");
    const tasksCanvas = document.getElementById("tasksTrendChart");

    const payload = {
      room_chart: roomCanvas.toDataURL("image/png"),
      shift_chart: shiftCanvas.toDataURL("image/png"),
      tasks_chart: tasksCanvas.toDataURL("image/png")
    };

    const response = await fetch(`${API_BASE}/export/pdf-with-charts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaning_report_with_charts.pdf";
    a.click();
    window.URL.revokeObjectURL(url);

    showToast("PDF with charts downloaded");
  } catch (err) {
    showToast("Failed to export charts PDF", "error");
  }

  setLoading(btnChartsPDF, false);
};

/* ============================================================
   INIT
   ============================================================ */

let allData = [];

async function refresh() {
  const filtered = applyFilters(allData);

  updateSummary(filtered);
  renderTable(filtered);
  renderRoomChart(filtered);
  renderShiftChart(filtered);
  renderTasksTrendChart(filtered);

  btnChartsPDF.disabled = false;
}

async function init() {
  allData = await fetchData();
  await refresh();
  showToast("Dashboard loaded");
}

init();
