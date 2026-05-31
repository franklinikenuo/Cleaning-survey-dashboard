/* ------------------------------------------------------------
   CLEANING DASHBOARD — FINAL RELEASE (v15)
   All charts restored + Android‑safe PDF
------------------------------------------------------------ */

const API_BASE = "https://cleaning-survey-api-v2-x6sf.onrender.com";

/* ------------------------------------------------------------
   FETCH + FILTERS
------------------------------------------------------------ */

async function fetchData() {
  try {
    const res = await fetch(`${API_BASE}/submissions`);
    return await res.json();
  } catch {
    return [];
  }
}

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

/* ------------------------------------------------------------
   TABLE
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
   CHARTS
------------------------------------------------------------ */

let roomChart, shiftChart, tasksTrendChart;

/* ROOM COMPLIANCE */
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

/* SHIFT DISTRIBUTION */
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

/* TASKS COMPLETED TREND — Daily Completion % */
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

/* ------------------------------------------------------------
   EXPORT: CSV + EXCEL
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
   EXPORT: PDF (Android‑Safe)
------------------------------------------------------------ */

document.getElementById("btn-local-pdf").onclick = () => {
  alert("PDF button clicked");

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

/* ------------------------------------------------------------
   INIT
------------------------------------------------------------ */

let allData = [];

async function refresh() {
  const filtered = applyFilters(allData);

  updateSummary(filtered);
  renderTable(filtered);
  renderRoomChart(filtered);
  renderShiftChart(filtered);
  renderTasksTrendChart(filtered);
}

async function init() {
  allData = await fetchData();
  refresh();
}

init();
