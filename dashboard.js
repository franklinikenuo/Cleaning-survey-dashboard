const supabaseUrl = "https://cpbkdtcrimppsxlstlob.supabase.co";
const supabaseKey = "YOUR_KEY_HERE";
const client = supabase.createClient(supabaseUrl, supabaseKey);

let allData = [];

/* ================= FETCH ================= */
async function fetchData() {
  const { data } = await client
    .from("surveys")
    .select("*")
    .order("created_at", { ascending: false });

  return data || [];
}

/* ================= FILTER ================= */
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

/* ================= SUMMARY ================= */
function updateSummary(data) {
  document.getElementById("total-submissions").textContent = data.length;

  let total = 0, yes = 0;

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

/* ================= TABLE ================= */
function renderTable(data) {
  const tbody = document.querySelector("#submissions-table tbody");
  tbody.innerHTML = "";

  data.forEach(d => {
    const tasks = d.tasks_completed
      ? Object.entries(d.tasks_completed).map(([k,v]) => `${k}:${v}`).join(" | ")
      : "";

    const tr = document.createElement("tr");

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

/* ================= EXPORT SYSTEM V2 ================= */

/* CSV */
function exportCSV() {
  const data = applyFilters(allData);

  let csv = "Room,Shift,Staff,Tasks,Notes,Date\n";

  data.forEach(d => {
    const tasks = d.tasks_completed
      ? Object.entries(d.tasks_completed).map(([k,v]) => `${k}:${v}`).join(" | ")
      : "";

    csv += `${d.room},${d.shift},${d.staff},"${tasks}",${d.notes},${d.created_at?.split("T")[0]}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "report.csv";
  a.click();
}

/* EXCEL */
function exportExcel() {
  const data = applyFilters(allData);

  const wsData = data.map(d => ({
    Room: d.room,
    Shift: d.shift,
    Staff: d.staff,
    Tasks: d.tasks_completed
      ? Object.entries(d.tasks_completed).map(([k,v]) => `${k}:${v}`).join(" | ")
      : "",
    Notes: d.notes,
    Date: d.created_at?.split("T")[0]
  }));

  const ws = XLSX.utils.json_to_sheet(wsData);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, "report.xlsx");
}

/* PDF */
async function exportPDF() {
  const element = document.querySelector(".main-layout");

  const canvas = await html2canvas(element, { scale: 2 });

  const img = canvas.toDataURL("image/png");

  const pdf = new jspdf.jsPDF("p", "mm", "a4");

  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(img, "PNG", 0, 0, width, height);
  pdf.save("dashboard.pdf");
}

/* ================= EXPORT MENU UI ================= */
document.getElementById("exportBtn").addEventListener("click", () => {
  document.getElementById("exportMenu").classList.toggle("hidden");
});

/* ================= REFRESH ================= */
async function refresh() {
  const filtered = applyFilters(allData);

  updateSummary(filtered);
  renderTable(filtered);
}

/* ================= INIT ================= */
async function init() {
  allData = await fetchData();
  await refresh();
}

init();
