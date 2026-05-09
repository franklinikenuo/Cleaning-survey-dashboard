// ===============================
// CONFIG
// ===============================
const API_BASE = "https://cleaning-survey-api.onrender.com";


// ===============================
// 1. SUBMIT SURVEY
// ===============================
async function submitSurvey() {
    const room = document.getElementById("room").value;

    const tasks = {
        trash: document.getElementById("task-trash").checked,
        mop: document.getElementById("task-mop").checked,
        sanitize: document.getElementById("task-sanitize").checked
    };

    const survey = {
        room: room,
        tasks_completed: tasks
    };

    try {
        await fetch(`${API_BASE}/survey`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(survey)
        });

        alert("Survey submitted successfully");
        loadSurveys();
    } catch (err) {
        alert("Error submitting survey");
    }
}


// ===============================
// 2. LOAD SURVEYS
// ===============================
async function loadSurveys() {
    try {
        const res = await fetch(`${API_BASE}/survey`);
        const surveys = await res.json();

        window.allSurveys = surveys;

        renderTable(surveys);
        updateSummary(surveys);
        updateRoomChart(surveys);
        updateTrendChart(surveys);
        populateRoomFilter();
    } catch (err) {
        console.error("Failed to load surveys", err);
    }
}


// ===============================
// 3. RENDER TABLE
// ===============================
function renderTable(surveys) {
    const tbody = document.getElementById("survey-table-body");
    tbody.innerHTML = "";

    surveys.forEach(s => {
        const clean = Object.values(s.tasks_completed).every(v => v);

        const row = `
            <tr>
                <td>${s.room}</td>
                <td>${clean ? "✔️ Clean" : "❌ Not Clean"}</td>
                <td>${new Date(s.date).toLocaleString()}</td>
            </tr>
        `;

        tbody.insertAdjacentHTML("beforeend", row);
    });
}


// ===============================
// 4. SUMMARY CARDS
// ===============================
function updateSummary(surveys) {
    if (surveys.length === 0) {
        document.getElementById("totalSubmissions").innerText = "0";
        document.getElementById("overallCompliance").innerText = "0%";
        return;
    }

    const cleanCount = surveys.filter(s =>
        Object.values(s.tasks_completed).every(v => v)
    ).length;

    const compliance = Math.round((cleanCount / surveys.length) * 100);

    document.getElementById("totalSubmissions").innerText = surveys.length;
    document.getElementById("overallCompliance").innerText = compliance + "%";
}


// ===============================
// 5. ROOM COMPLIANCE CHART
// ===============================
let roomChart;

function updateRoomChart(surveys) {
    const ctx = document.getElementById("complianceChart").getContext("2d");

    const rooms = [...new Set(surveys.map(s => s.room))];

    const complianceData = rooms.map(room => {
        const roomSurveys = surveys.filter(s => s.room === room);
        const cleanCount = roomSurveys.filter(s =>
            Object.values(s.tasks_completed).every(v => v)
        ).length;

        return Math.round((cleanCount / roomSurveys.length) * 100);
    });

    if (roomChart) roomChart.destroy();

    roomChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: rooms,
            datasets: [{
                label: "Room Compliance (%)",
                data: complianceData,
                backgroundColor: "teal"
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });
}


// ===============================
// 6. DAILY TREND CHART
// ===============================
let trendChart;

function updateTrendChart(surveys) {
    const ctx = document.getElementById("trendChart").getContext("2d");

    const grouped = {};

    surveys.forEach(s => {
        const day = new Date(s.date).toISOString().split("T")[0];
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(s);
    });

    const dates = Object.keys(grouped).sort();

    const compliance = dates.map(d => {
        const daySurveys = grouped[d];
        const cleanCount = daySurveys.filter(s =>
            Object.values(s.tasks_completed).every(v => v)
        ).length;
        return Math.round((cleanCount / daySurveys.length) * 100);
    });

    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: "Daily Compliance (%)",
                data: compliance,
                borderColor: "blue",
                fill: false
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });
}


// ===============================
// 7. CSV EXPORT
// ===============================
function exportCSV() {
    const surveys = window.allSurveys || [];
    if (surveys.length === 0) return alert("No data to export");

    let csv = "room,trash,mop,sanitize,date\n";

    surveys.forEach(s => {
        csv += `${s.room},${s.tasks_completed.trash},${s.tasks_completed.mop},${s.tasks_completed.sanitize},${s.date}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaning_data.csv";
    a.click();
}


// ===============================
// 8. WEEKLY PDF EXPORT
// ===============================
async function exportWeeklyPDF() {
    try {
        await fetch(`${API_BASE}/send-weekly-report`);
        alert("Weekly PDF report sent to your email");
    } catch (err) {
        alert("Failed to generate weekly PDF");
    }
}


// ===============================
// 9. MONTHLY PDF EXPORT
// ===============================
async function exportMonthlyPDF() {
    try {
        await fetch(`${API_BASE}/send-monthly-report`);
        alert("Monthly PDF report sent to your email");
    } catch (err) {
        alert("Failed to generate monthly PDF");
    }
}


// ===============================
// 10. FULL DASHBOARD PDF EXPORT
// ===============================
async function exportDashboardPDF() {
    const element = document.body;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jspdf.jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("dashboard-report.pdf");
}


// ===============================
// 11. FILTERS
// ===============================
function applyFilters() {
    const room = document.getElementById("filter-room").value;
    const date = document.getElementById("filter-date").value;

    let filtered = window.allSurveys;

    if (room !== "all") {
        filtered = filtered.filter(s => s.room === room);
    }

    if (date) {
        filtered = filtered.filter(s => s.date.startsWith(date));
    }

    renderTable(filtered);
    updateSummary(filtered);
    updateRoomChart(filtered);
    updateTrendChart(filtered);
}


// ===============================
// 12. POPULATE ROOM FILTER
// ===============================
function populateRoomFilter() {
    const roomSelect = document.getElementById("filter-room");
    if (!roomSelect) return;

    const rooms = [...new Set((window.allSurveys || []).map(s => s.room))];

    roomSelect.innerHTML = `<option value="all">All Rooms</option>`;
    rooms.forEach(room => {
        roomSelect.innerHTML += `<option value="${room}">${room}</option>`;
    });
}


// ===============================
// 13. EVENT LISTENERS
// ===============================
document.getElementById("btn-submit-survey")?.addEventListener("click", submitSurvey);
document.getElementById("btn-export-csv")?.addEventListener("click", exportCSV);
document.getElementById("btn-export-weekly-pdf")?.addEventListener("click", exportWeeklyPDF);
document.getElementById("btn-export-monthly-pdf")?.addEventListener("click", exportMonthlyPDF);
document.getElementById("btn-export-dashboard-pdf")?.addEventListener("click", exportDashboardPDF);

document.getElementById("filter-room")?.addEventListener("change", applyFilters);
document.getElementById("filter-date")?.addEventListener("change", applyFilters);


// ===============================
// 14. MAIN LOAD FUNCTION
// ===============================
async function initDashboard() {
    await loadSurveys();
}

window.addEventListener("DOMContentLoaded", initDashboard);
