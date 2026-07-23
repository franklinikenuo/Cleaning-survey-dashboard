const supabaseUrl = "https://cpbkdtcrimppsxlstlob.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwYmtkdGNyaW1wcHN4bHN0bG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDEzMTMsImV4cCI6MjA5NjUxNzMxM30.oWvz_eKGwP7Po0SfSCHDNStCJanpn-c-gqaOkAjCJMI";

const client = supabase.createClient(supabaseUrl, supabaseKey);

// Require login before showing dashboard
(async () => {
  const {
    data: { session }
  } = await client.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  // Optional: show logged in user's email
  console.log("Logged in as:", session.user.email);
})();

let allData = [];

/* =========================
   STATE GUARD (prevents UI race issues)
========================= */
let isRefreshing = false;

/* =========================
   FETCH (SINGLE SOURCE OF TRUTH)
========================= */
async function fetchData() {
  const { data, error } = await client
    .from("surveys")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch error:", error);
    return [];
  }

  return data || [];
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
    if (date && d.work_date !== date) return false;
    return true;
  });
}

/* =========================
   SUMMARY
========================= */
function updateSummary(data) {
  const totalEl = document.getElementById("total-submissions");
  const compEl = document.getElementById("overall-compliance");

  if (totalEl) totalEl.textContent = data.length;

  let total = 0;
  let yes = 0;

  for (const d of data) {
    const tasks = d.tasks_completed || {};
    for (const v of Object.values(tasks)) {
      total++;
      if (v === "Y") yes++;
    }
  }

  const compliance = total ? Math.round((yes / total) * 100) : 0;
  if (compEl) compEl.textContent = compliance + "%";
}

function renderInsights(data) {
  const el = document.getElementById("insightsPanel");
  if (!el) return;

  if (!data.length) {
    el.innerHTML = "No data yet";
    return;
  }

  // Most active room
  const roomCount = {};
  data.forEach(d => {
    if (d.room) roomCount[d.room] = (roomCount[d.room] || 0) + 1;
  });

  const topRoom = Object.entries(roomCount)
    .sort((a, b) => b[1] - a[1])[0];

  // Average compliance
  let total = 0;
  let yes = 0;

  data.forEach(d => {
    Object.values(d.tasks_completed || {}).forEach(v => {
      total++;
      if (v === "Y") yes++;
    });
  });

  const compliance = total ? Math.round((yes / total) * 100) : 0;

  el.innerHTML = `
    <div><b>Top Room:</b> ${topRoom ? topRoom[0] : "N/A"}</div>
    <div><b>Total Submissions:</b> ${data.length}</div>
    <div><b>Compliance:</b> ${compliance}%</div>
  `;
}

/* =========================
   TABLE
========================= */
function renderTable(data) {
  const tbody = document.querySelector("#submissions-table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  for (const d of data) {
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
      <td>${d.work_date || (d.created_at || "").split("T")[0]}</td>
    `;

    tbody.appendChild(tr);
  }
}

/* =========================
   CHARTS
========================= */
let roomChart;
let shiftChart;

function renderCharts(data) {
  const roomCtx = document.getElementById("roomChart");
  const shiftCtx = document.getElementById("shiftChart");

  if (!roomCtx || !shiftCtx) return;
  if (!data || data.length === 0) return;

  const rooms = {};

  for (const d of data) {
    if (!d.room) continue;
    rooms[d.room] = (rooms[d.room] || 0) + 1;
  }

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
  return (staff || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

function getStaffStats(data) {
  const map = {};

  for (const d of data) {
    for (const name of splitStaff(d.staff)) {
      if (!map[name]) {
        map[name] = { name, shifts: 0, yes: 0, total: 0 };
      }

      map[name].shifts++;

      const tasks = d.tasks_completed || {};
      for (const v of Object.values(tasks)) {
        map[name].total++;
        if (v === "Y") map[name].yes++;
      }
    }
  }

  return Object.values(map).map(s => ({
    ...s,
    compliance: s.total ? Math.round((s.yes / s.total) * 100) : 0
  }));
}

function renderLeaderboard(data) {
  const el = document.getElementById("staff-leaderboard");
  if (!el) return;

  const stats = getStaffStats(data).sort((a, b) => b.compliance - a.compliance);

  if (!stats.length) {
    el.innerHTML = "No data";
    return;
  }

  el.innerHTML = stats
    .map((s, i) => `
      <div style="padding:8px;border-bottom:1px solid #eee">
        <b>#${i + 1} ${s.name}</b><br>
        ${s.compliance}% | ${s.shifts} shifts
      </div>
    `)
    .join("");
}

/* =========================
   EXPORTS
========================= */
function exportCSV() {
  const data = applyFilters(allData);

  let csv = "Room,Shift,Staff,Tasks,Notes,Date\n";

  for (const d of data) {
    const tasks = Object.entries(d.tasks_completed || {})
      .map(([k, v]) => `${k}:${v}`)
      .join(" | ");

    csv += `${d.room},${d.shift},${d.staff},"${tasks}",${d.notes},${d.work_date || (d.created_at || "").split("T")[0]}\n`;
  }

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
  const el = document.querySelector(".main-layout");
  if (!el) return;

  const canvas = await html2canvas(el, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  const pdf = new jspdf.jsPDF("p", "mm", "a4");

  const w = pdf.internal.pageSize.getWidth();
  const h = (canvas.height * w) / canvas.width;

  pdf.addImage(img, "PNG", 0, 0, w, h);
  pdf.save("cleaning-dashboard.pdf");
}

async function exportWeeklyPDF() {
  const today = new Date();

  const last7Days = new Date();
  last7Days.setDate(today.getDate() - 7);

  const filtered = allData.filter(d => {
    const date = new Date(d.work_date || d.created_at);
    return date >= last7Days && date <= today;
  });

  if (!filtered.length) {
    alert("No data for last 7 days");
    return;
  }

  // temporarily render filtered view
  updateSummary(filtered);
  renderTable(filtered);
  renderCharts(filtered);
  renderLeaderboard(filtered);
  renderInsights(filtered);

  await new Promise(r => setTimeout(r, 500)); // allow DOM render

  const element = document.querySelector(".main-layout");
  const canvas = await html2canvas(element, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  const pdf = new jspdf.jsPDF("p", "mm", "a4");

  const w = pdf.internal.pageSize.getWidth();
  const h = (canvas.height * w) / canvas.width;

  pdf.addImage(img, "PNG", 0, 0, w, h);
  pdf.save(`weekly-cleaning-report-${today.toISOString().split("T")[0]}.pdf`);

  // restore full dashboard after export
  refresh();
}
/* =========================
   REFRESH PIPELINE
========================= */
async function refresh() {
  if (isRefreshing) return;
  isRefreshing = true;

  const filtered = applyFilters(allData);

  updateSummary(filtered);
  renderTable(filtered);
  renderCharts(filtered);
  renderLeaderboard(filtered);
  renderInsights(filtered);
  isRefreshing = false;
}

/* =========================
   INIT
========================= */
async function init() {
  allData = await fetchData();
  await refresh();

  setInterval(async () => {
    allData = await fetchData();
    refresh();
  }, 60000);
}

init();

/* =========================
   REALTIME SYNC
========================= */
client
  .channel("surveys-live")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "surveys"
    },
    async () => {
      allData = await fetchData();
      refresh();
    }
  )
  .subscribe();

/* =========================
   EXPORT MENU
========================= */
function toggleExportMenu() {
  const el = document.getElementById("exportConsole");
  if (!el) return;

  el.classList.toggle("active");

}
function openReportingCenter() {

    const year = document.getElementById("reportYear");

    if (year.options.length === 0) {
        const current = new Date().getFullYear();

        for (let y = current; y >= 2024; y--) {
            year.innerHTML += `<option value="${y}">${y}</option>`;
        }
    }

    document.getElementById("reportModal").style.display = "flex";
}

function closeReportingCenter() {

    document.getElementById("reportModal").style.display = "none";
}

function generateSelectedReport() {

    const type = document.getElementById("reportType").value;

    switch(type){

        case "professional":
            exportProfessionalPDF();
            break;

        case "weekly":
            exportWeeklyPDF();
            break;

        case "monthly":
            exportMonthlyPDF();
            break;

        case "quarterly":
            alert("Quarterly report coming next.");
            break;

        case "annual":
            alert("Annual report coming next.");
            break;
    }

    closeReportingCenter();
}

async function exportMonthlyPDF() {

    const month = Number(document.getElementById("reportMonth").value);
    const year = Number(document.getElementById("reportYear").value);

    const monthlyData = allData.filter(d => {

        const date = new Date(d.work_date || d.created_at);

        return (
            date.getMonth() === month &&
            date.getFullYear() === year
        );

    });

    if (!monthlyData.length) {
        alert("No surveys found for the selected month.");
        return;
    }

    // Backup current dashboard data
const originalData = [...allData];

// Use only the selected month's data
allData = monthlyData;

// Refresh dashboard
await refresh();

// Give charts time to redraw
await new Promise(resolve => setTimeout(resolve, 2500));

console.log("Generating Professional PDF...");
await exportProfessionalPDF();

// Restore original dashboard data
allData = originalData;

await refresh();

}
// ============================================================
// PHASE 3A - PROFESSIONAL PDF REPORT ENGINE
// ============================================================

async function exportProfessionalPDF() {

    console.log("Generating Professional PDF...");

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF("p", "mm", "a4");

    const today = new Date().toLocaleDateString();

    // -----------------------------
    // DATA ANALYSIS
    // -----------------------------

    const totalSurveys = allData.length;

    const completedTasks = allData.reduce((sum, row) => {
        return sum + (row.tasks?.filter(t => t.completed === true).length || 0);
    }, 0);


    const totalPossibleTasks = totalSurveys * 6;

    const compliance =
        totalPossibleTasks ?
        ((completedTasks / totalPossibleTasks) * 100).toFixed(1)
        : 0;


    // Room statistics

    const roomStats = {};

    allData.forEach(row => {

        const room = row.Room || "Unknown";

        roomStats[room] =
            (roomStats[room] || 0) + 1;

    });


    // Shift statistics

    const shiftStats = {};

    allData.forEach(row => {

        const shift = row.Shift || "Unknown";

        shiftStats[shift] =
            (shiftStats[shift] || 0) + 1;

    });


    // Staff statistics

    const staffStats = {};

    allData.forEach(row => {

        const staff = row.Staff || "Unknown";

        staffStats[staff] =
            (staffStats[staff] || 0) + 1;

    });



    // =====================================================
    // PAGE 1 - COVER + KPI
    // =====================================================


    pdf.setFontSize(20);
    pdf.text(
        "Daily Cleaning Performance Report",
        20,
        25
    );


    pdf.setFontSize(11);

    pdf.text(
        `Generated: ${today}`,
        20,
        35
    );


    pdf.text(
        `Total Surveys: ${totalSurveys}`,
        20,
        45
    );


    pdf.text(
        `Compliance Score: ${compliance}%`,
        20,
        55
    );



    // KPI boxes

    let y = 75;


    const cards = [
        ["Surveys", totalSurveys],
        ["Compliance", compliance+"%"],
        ["Completed Tasks", completedTasks],
        ["Total Tasks", totalPossibleTasks]
    ];


    cards.forEach((card,index)=>{


        let x = 20 + (index%2)*85;

        let cy = y + Math.floor(index/2)*35;


        pdf.rect(
            x,
            cy,
            70,
            25
        );


        pdf.setFontSize(10);

        pdf.text(
            card[0],
            x+5,
            cy+8
        );


        pdf.setFontSize(14);

        pdf.text(
            String(card[1]),
            x+5,
            cy+18
        );


    });



    pdf.addPage();



    // =====================================================
    // PAGE 2 - CHARTS
    // =====================================================


    pdf.setFontSize(16);

    pdf.text(
        "Performance Analytics",
        20,
        20
    );


    // Create temporary charts

    const chartCanvas =
        document.createElement("canvas");


    chartCanvas.width = 700;
    chartCanvas.height = 350;


    document.body.appendChild(chartCanvas);


    const ctx =
        chartCanvas.getContext("2d");



    new Chart(ctx,{
        type:"bar",

        data:{
            labels:Object.keys(roomStats),

            datasets:[{
                label:"Room Activity",

                data:Object.values(roomStats)
            }]
        }

    });


    await new Promise(
        r=>setTimeout(r,1000)
    );


    const roomImage =
        chartCanvas.toDataURL("image/png");


    pdf.addImage(
        roomImage,
        "PNG",
        15,
        35,
        180,
        80
    );



    // clear canvas

    ctx.clearRect(
        0,
        0,
        chartCanvas.width,
        chartCanvas.height
    );



    new Chart(ctx,{
        type:"pie",

        data:{
            labels:Object.keys(shiftStats),

            datasets:[{

                data:Object.values(shiftStats)

            }]
        }

    });



    await new Promise(
        r=>setTimeout(r,1000)
    );


    const shiftImage =
        chartCanvas.toDataURL("image/png");



    pdf.addImage(
        shiftImage,
        "PNG",
        15,
        130,
        90,
        70
    );


    document.body.removeChild(chartCanvas);



    pdf.addPage();



    // =====================================================
    // PAGE 3 - STAFF + TASK ANALYSIS
    // =====================================================


    pdf.setFontSize(16);

    pdf.text(
        "Staff Performance",
        20,
        20
    );


    let staffY = 35;


    Object.entries(staffStats)
    .forEach(([name,count])=>{


        pdf.text(
            `${name}: ${count} completed surveys`,
            20,
            staffY
        );


        staffY += 10;

    });



    pdf.text(
        "Task Compliance Summary",
        20,
        staffY+10
    );



    let taskY = staffY+25;


    const tasks = [
        "Trash",
        "Mop",
        "Sanitize",
        "Sweep",
        "Linen Change",
        "Vacuum"
    ];



    tasks.forEach(task=>{


        let count = 0;


        allData.forEach(row=>{


            row.tasks?.forEach(t=>{


                if(
                    t.task_name===task &&
                    t.completed===true
                ){
                    count++;
                }


            });


        });



        pdf.text(
            `${task}: ${count}`,
            20,
            taskY
        );


        taskY += 8;


    });



    pdf.addPage();



    // =====================================================
    // PAGE 4 - SUMMARY
    // =====================================================


    pdf.setFontSize(16);


    pdf.text(
        "Performance Summary",
        20,
        25
    );


    pdf.setFontSize(12);


    const summary = `

Cleaning operations achieved a ${compliance}% compliance rate.

The report analyzed ${totalSurveys} room cleaning surveys.

Continuous monitoring of room activity,
staff performance and task completion
will support ongoing quality improvement.

`;



    pdf.text(
        summary,
        20,
        45
    );



    // SAVE

    pdf.save(
        "Professional-Cleaning-Performance-Report.pdf"
    );


    console.log(
        "Professional PDF Completed"
    );

}
// =================================================
// PHASE 3B ADVANCED ANALYTICS
// =================================================


function generateAdvancedAnalytics(){



// ------------------------------
// STAFF RANKING
// ------------------------------

const staff={};


allData.forEach(row=>{


let name=row.Staff || "Unknown";


if(!staff[name]){

staff[name]={
surveys:0,
tasks:0
};

}


staff[name].surveys++;


staff[name].tasks +=
row.tasks?.filter(
t=>t.completed===true
).length || 0;


});



let ranking =
Object.entries(staff)
.map(([name,data])=>{


return {

name,

surveys:data.surveys,

score:
(
(data.tasks /
(data.surveys*6))
*100

).toFixed(1)

};


})
.sort(
(a,b)=>b.score-a.score
);



const tbody =
document.querySelector(
"#staffRankingTable tbody"
);



tbody.innerHTML="";



ranking.forEach((person,index)=>{


tbody.innerHTML += `

<tr>

<td>
${index+1}
</td>

<td>
${person.name}
</td>

<td>
${person.surveys}
</td>

<td>
${person.score}%
</td>

</tr>

`;


});





// ------------------------------
// ROOM HEATMAP
// ------------------------------


const rooms={};



allData.forEach(row=>{


let room=row.Room || "Unknown";


if(!rooms[room]){

rooms[room]={
done:0,
total:0
};

}



rooms[room].total +=6;


rooms[room].done +=
row.tasks?.filter(
t=>t.completed===true
).length ||0;



});



const heat =
document.getElementById(
"roomHeatmap"
);



heat.innerHTML="";



Object.entries(rooms)
.forEach(([room,data])=>{


let percent =
(
data.done /
data.total
*100
).toFixed(0);



let status =
percent>=95
?"good"
:
percent>=85
?"medium"
:
"bad";



heat.innerHTML +=`

<div class="room-box ${status}">

${room}

<br>

${percent}%

</div>

`;


});




// ------------------------------
// MISSED TASK DETECTION
// ------------------------------


const missed={};



allData.forEach(row=>{


row.tasks?.forEach(task=>{


if(!task.completed){


missed[task.task_name]=
(missed[task.task_name]||0)+1;


}


});


});



const missedList =
document.getElementById(
"missedTaskList"
);



missedList.innerHTML="";



Object.entries(missed)
.sort((a,b)=>b[1]-a[1])
.forEach(item=>{


missedList.innerHTML +=`

<li>

${item[0]}
:
${item[1]} missed

</li>

`;


});





// ------------------------------
// MONTHLY TREND CHART
// ------------------------------


const monthly={};



allData.forEach(row=>{


let month =
new Date(row.Created_at)
.toLocaleString(
"default",
{month:"short"}
);



if(!monthly[month])
monthly[month]=0;


monthly[month]++;

});




new Chart(

document.getElementById(
"monthlyComparisonChart"
),

{

type:"line",

data:{


labels:
Object.keys(monthly),


datasets:[{

label:
"Cleaning Surveys",

data:
Object.values(monthly)

}]


}

}

);



}
