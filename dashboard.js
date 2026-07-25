// ============================================================
// CLEANING SURVEY DASHBOARD
// UPDATED HOSPITAL ANALYTICS VERSION
// PART 1 - CORE ENGINE
// ============================================================

// =========================
// SUPABASE
// =========================
const supabaseUrl = "https://cpbkdtcrimppsxlstlob.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwYmtkdGNyaW1wcHN4bHN0bG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDEzMTMsImV4cCI6MjA5NjUxNzMxM30.oWvz_eKGwP7Po0SfSCHDNStCJanpn-c-gqaOkAjCJMI";

const client = supabase.createClient(supabaseUrl, supabaseKey);

// =========================
// LOGIN CHECK
// =========================

(async () => {

    const {
        data:{session}
    } = await client.auth.getSession();


    if(!session){

        window.location.href="login.html";
        return;

    }


    console.log(
        "Logged in:",
        session.user.email
    );


})();

// =========================
// GLOBAL STATE
// =========================

let allData = [];

let isRefreshing = false;

// =========================
// FETCH DATA
// SINGLE SOURCE OF TRUTH
// =========================

async function fetchData(){

    console.log("Fetching surveys...");

    const {
        data,
        error
    } = await client
    .from("surveys")
    .select("*")
    .order(
        "created_at",
        {
            ascending:false
        }
    );


    console.log("SUPABASE DATA:", data);
    console.log("SUPABASE ERROR:", error);

    if(error){

        alert(
            "Database Error: " + error.message
        );

        return [];

    }

    return data || [];

}
// ============================================================
// POPULATE ROOM FILTER
// ============================================================

function populateRoomFilter(){

    const select =
    document.getElementById("filter-room");


    if(!select) return;


    const rooms =
    [
        ...new Set(
            allData
            .map(row=>row.room)
            .filter(Boolean)
        )
    ];

    select.innerHTML = `

    <option value="all">
    All Rooms
    </option>

    `;

    rooms.forEach(room=>{


        select.innerHTML += `

        <option value="${room}">
        ${room}
        </option>

        `;


    });


}

// =========================
// FILTERS
// =========================


function applyFilters(data){


    const room =
    document.getElementById(
        "filter-room"
    )?.value || "all";


    const staff =
    (
        document.getElementById(
            "filter-staff"
        )?.value || ""
    )
    .toLowerCase();



    const shift =
    document.getElementById(
        "filter-shift"
    )?.value || "all";



    const date =
    document.getElementById(
        "filter-date"
    )?.value || "";



    return data.filter(d=>{


        if(
            room !== "all" &&
            d.room !== room
        )
        return false;



        if(
            shift !== "all" &&
            d.shift !== shift
        )
        return false;



        if(
            staff &&
            !(d.staff || "")
            .toLowerCase()
            .includes(staff)
        )
        return false;



        if(
            date &&
            d.work_date !== date
        )
        return false;



        return true;


    });


}


// =========================
// TASK CALCULATOR
// USED EVERYWHERE
// =========================


function getTaskStats(row){


    const tasks =
    row.tasks_completed || {};



    let total = 0;

    let completed = 0;



    Object.values(tasks)
    .forEach(value=>{


        total++;


        if(value==="Y"){

            completed++;

        }


    });



    return {

        total,

        completed

    };


}

// =========================
// SUMMARY CARDS
// =========================


function updateSummary(data){


    const totalEl =
    document.getElementById(
        "total-submissions"
    );


    const complianceEl =
    document.getElementById(
        "overall-compliance"
    );



    if(totalEl){

        totalEl.textContent =
        data.length;

    }



    let totalTasks=0;

    let completedTasks=0;



    data.forEach(row=>{


        const stats =
        getTaskStats(row);



        totalTasks += stats.total;

        completedTasks += stats.completed;


    });




    const percentage =
    totalTasks

    ?

    Math.round(
        completedTasks /
        totalTasks *
        100
    )

    :

    0;




    if(complianceEl){

        complianceEl.textContent =
        percentage+"%";

    }


          }

// ============================================================
// PART 2
// TABLE + CHARTS + STAFF ANALYTICS
// ============================================================

// =========================
// TABLE RENDER
// =========================

function renderTable(data){


    const tbody =
    document.querySelector(
        "#submissions-table tbody"
    );


    if(!tbody) return;



    tbody.innerHTML="";



    data.forEach(row=>{


        const tasks =
        Object.entries(
            row.tasks_completed || {}
        )

        .map(
            ([name,value]) =>
            `${name}:${value}`
        )

        .join(" | ");




        const tr =
        document.createElement("tr");



        tr.innerHTML = `

        <td>
        ${row.room || ""}
        </td>

        <td>
        ${row.shift || ""}
        </td>

        <td>
        ${row.staff || ""}
        </td>

        <td>
        ${tasks}
        </td>

        <td>
        ${row.notes || ""}
        </td>

        <td>
        ${
        row.work_date ||
        (row.created_at || "")
        .split("T")[0]
        }
        </td>

        `;



        tbody.appendChild(tr);


    });


}

// =========================
// CHARTS
// =========================


let roomChart;

let shiftChart;



function renderCharts(data){


    const roomCanvas =
    document.getElementById(
        "roomChart"
    );


    const shiftCanvas =
    document.getElementById(
        "shiftChart"
    );



    if(
        !roomCanvas ||
        !shiftCanvas
    )
    return;




    if(!data.length)
    return;




    const rooms={};



    data.forEach(row=>{


        const room =
        row.room || "Unknown";



        rooms[room] =
        (
            rooms[room] || 0
        ) + 1;


    });





    if(roomChart){

        roomChart.destroy();

    }



    roomChart =
    new Chart(
        roomCanvas,
        {

        type:"bar",

        data:{

            labels:
            Object.keys(rooms),

            datasets:[{

                label:
                "Room Activity",

                data:
                Object.values(rooms)

            }]

        }

    });






    const shifts = [
        "Morning",
        "Afternoon",
        "Evening",
        "Night"
    ];



    if(shiftChart){

        shiftChart.destroy();

    }




    shiftChart =
    new Chart(
        shiftCanvas,
        {


        type:"pie",


        data:{


            labels:shifts,


            datasets:[{


                label:
                "Shift Distribution",


                data:

                shifts.map(
                    shift=>

                    data.filter(
                        row=>
                        row.shift===shift
                    )
                    .length

                )


            }]


        }


    });



}


// =========================
// STAFF ANALYTICS
// =========================


function splitStaff(staff){


    return (

        staff || ""

    )

    .split(",")

    .map(
        name=>name.trim()
    )

    .filter(Boolean);


}


function getStaffStats(data){


    const staff={};



    data.forEach(row=>{


        const names =
        splitStaff(
            row.staff
        );



        names.forEach(name=>{


            if(!staff[name]){


                staff[name]={

                    name,

                    shifts:0,

                    completed:0,

                    total:0

                };


            }




            staff[name].shifts++;




            const stats =
            getTaskStats(row);



            staff[name].completed +=
            stats.completed;



            staff[name].total +=
            stats.total;



        });


    });


    return Object.values(staff)

    .map(person=>{


        return {


            ...person,


            compliance:

            person.total

            ?

            Math.round(

                person.completed /
                person.total *
                100

            )

            :

            0


        };


    });


}


function renderLeaderboard(data){



    const el =
    document.getElementById(
        "staff-leaderboard"
    );



    if(!el)
    return;



    const ranking =

    getStaffStats(data)

    .sort(
        (a,b)=>
        b.compliance -
        a.compliance
    );




    if(!ranking.length){


        el.innerHTML =
        "No data";


        return;


    }




    el.innerHTML =

    ranking.map(
        (staff,index)=>

`

<div style="
padding:10px;
border-bottom:1px solid #eee">

<b>
#${index+1}
${staff.name}
</b>

<br>

${staff.compliance}% compliance

<br>

${staff.shifts} shifts

</div>

`

    )

    .join("");

}


// =========================
// DASHBOARD INSIGHTS
// =========================


function renderInsights(data){


    const el =
    document.getElementById(
        "insightsPanel"
    );



    if(!el)
    return;



    if(!data.length){

        el.innerHTML =
        "No data available";

        return;

    }

    const rooms={};



    data.forEach(row=>{


        const room =
        row.room ||
        "Unknown";



        rooms[room] =
        (
            rooms[room] || 0
        ) + 1;



    });





    const topRoom =

    Object.entries(rooms)

    .sort(
        (a,b)=>
        b[1]-a[1]
    )[0];





    let total=0;

    let completed=0;



    data.forEach(row=>{


        const stats =
        getTaskStats(row);


        total += stats.total;


        completed += stats.completed;


    });





    const compliance =

    total

    ?

    Math.round(
        completed /
        total *
        100
    )

    :

    0;






    el.innerHTML = `


<div>

<b>
Top Room:
</b>

${

topRoom
?
topRoom[0]
:
"N/A"

}

</div>



<div>

<b>
Submissions:
</b>

${data.length}

</div>



<div>

<b>
Compliance:
</b>

${compliance}%

</div>


`;



}

// ============================================================
// PART 3
// PROFESSIONAL REPORT + ADVANCED ANALYTICS + INTELLIGENCE
// ============================================================


// ============================================================
// PHASE 3A
// PROFESSIONAL PDF REPORT
// ============================================================


async function exportProfessionalPDF(){


    console.log(
        "Generating Professional PDF..."
    );



    const {jsPDF} =
    window.jspdf;



    const pdf =
    new jsPDF(
        "p",
        "mm",
        "a4"
    );



    const today =
    new Date()
    .toLocaleDateString();





    let totalTasks=0;

    let completedTasks=0;



    allData.forEach(row=>{


        const stats =
        getTaskStats(row);


        totalTasks += stats.total;

        completedTasks += stats.completed;


    });




    const compliance =

    totalTasks

    ?

    (
    completedTasks /
    totalTasks *
    100

    )

    .toFixed(1)

    :

    0;

    // PAGE 1

    pdf.setFontSize(20);


    pdf.text(
        "Daily Cleaning Performance Report",
        20,
        25
    );



    pdf.setFontSize(12);



    pdf.text(
        `Generated: ${today}`,
        20,
        40
    );


    pdf.text(
        `Total Surveys: ${allData.length}`,
        20,
        50
    );


    pdf.text(
        `Compliance: ${compliance}%`,
        20,
        60
    );

    // PAGE 2

    pdf.addPage();



    pdf.setFontSize(16);


    pdf.text(
        "Room Activity Summary",
        20,
        20
    );



    const roomCount={};



    allData.forEach(row=>{


        const room =
        row.room || "Unknown";


        roomCount[room] =
        (
            roomCount[room] || 0
        ) + 1;


    });




    let y=35;



    Object.entries(roomCount)

    .forEach(([room,count])=>{


        pdf.setFontSize(11);


        pdf.text(
            `${room}: ${count}`,
            20,
            y
        );


        y+=8;


    });

    // PAGE 3

    pdf.addPage();



    pdf.setFontSize(16);


    pdf.text(
        "Staff Performance",
        20,
        20
    );



    let staffY=35;



    getStaffStats(allData)

    .sort(
        (a,b)=>
        b.compliance-a.compliance
    )

    .forEach((staff,index)=>{


        pdf.text(

        `${index+1}. ${staff.name}
        ${staff.compliance}%`,

        20,

        staffY

        );


        staffY+=10;


    });





    pdf.save(
        "Professional-Cleaning-Report.pdf"
    );



}


// ============================================================
// PHASE 3B
// ADVANCED ANALYTICS
// ============================================================


function generateAdvancedAnalytics(){



    generateStaffRanking();


    generateRoomHeatmap();


    generateMissedTasks();


    generateMonthlyChart();


}

// =========================
// STAFF RANKING TABLE
// =========================


function generateStaffRanking(){



    const tbody =
    document.querySelector(
        "#staffRankingTable tbody"
    );



    if(!tbody)
    return;




    tbody.innerHTML="";



    getStaffStats(allData)

    .sort(
        (a,b)=>
        b.compliance-a.compliance
    )

    .forEach((person,index)=>{


        tbody.innerHTML += `


<tr>

<td>
${index+1}
</td>


<td>
${person.name}
</td>


<td>
${person.shifts}
</td>


<td>
${person.compliance}%
</td>


</tr>


`;



    });



}


// =========================
// ROOM HEATMAP
// =========================


function generateRoomHeatmap(){



const el =
document.getElementById(
"roomHeatmap"
);



if(!el)
return;



const rooms={};



allData.forEach(row=>{


const room =
row.room || "Unknown";



if(!rooms[room]){


rooms[room]={

completed:0,

total:0

};


}



const stats =
getTaskStats(row);



rooms[room].completed +=
stats.completed;


rooms[room].total +=
stats.total;



});





el.innerHTML="";




Object.entries(rooms)

.forEach(([room,data])=>{


const score =

data.total

?

Math.round(
data.completed /
data.total *
100
)

:

0;



let status =
score>=95
?
"good"

:

score>=85
?
"medium"

:
"bad";





el.innerHTML += `


<div class="room-box ${status}">

${room}

<br>

${score}%

</div>


`;



});



}

// =========================
// MISSED TASKS
// =========================


function generateMissedTasks(){



const el =
document.getElementById(
"missedTaskList"
);



if(!el)
return;




const missed={};



allData.forEach(row=>{


Object.entries(
row.tasks_completed || {}
)

.forEach(([task,value])=>{


if(value==="N"){


missed[task]=
(missed[task]||0)+1;


}



});


});




el.innerHTML="";



Object.entries(missed)

.sort(
(a,b)=>b[1]-a[1]
)

.forEach(([task,count])=>{


el.innerHTML += `


<li>

${task}
:
${count}
missed

</li>


`;



});



}


// =========================
// MONTHLY CHART
// =========================


let monthlyChart;



function generateMonthlyChart(){



const canvas =
document.getElementById(
"monthlyComparisonChart"
);



if(!canvas)
return;




const months={};



allData.forEach(row=>{


const month =

new Date(
row.created_at
)

.toLocaleString(
"default",
{
month:"short"
}
);



months[month] =
(months[month]||0)+1;



});





if(monthlyChart)

monthlyChart.destroy();





monthlyChart =

new Chart(
canvas,
{


type:"line",


data:{


labels:
Object.keys(months),


datasets:[{


label:
"Cleaning Surveys",


data:
Object.values(months)


}]


}



}

);



}

// ============================================================
// PHASE 3C
// CLEANING INTELLIGENCE ENGINE
// ============================================================

function generateCleaningIntelligence(){

    let total = 0;
    let completed = 0;

    allData.forEach(row => {

        const stats =
            getTaskStats(row);

        total += stats.total;
        completed += stats.completed;

    });


    const compliance =
        total
        ? (completed / total) * 100
        : 0;


    // ========================================================
    // COMPLIANCE PREDICTION
    // ========================================================

    const prediction =
        Math.min(
            100,
            compliance + 2
        );


    const score =
        document.getElementById(
            "predictionScore"
        );


    if(score){

        score.innerHTML = `

            <strong>
                ${prediction.toFixed(1)}%
            </strong>

            <br>

            <small>
                Expected compliance
            </small>

        `;

    }


    // ========================================================
    // BUILD ROOM RISK DATA
    // ========================================================

    const rooms = {};


    allData.forEach(row => {

        const room =
            row.room || "Unknown";


        if(!rooms[room]){

            rooms[room] = {

                completed: 0,

                total: 0

            };

        }


        const stats =
            getTaskStats(row);


        rooms[room].completed +=
            stats.completed;

        rooms[room].total +=
            stats.total;

    });


    // ========================================================
    // HIGH RISK ROOMS
    // ========================================================

    const riskList =
        document.getElementById(
            "riskRooms"
        );


    if(riskList){

        riskList.innerHTML = "";


        Object.entries(rooms)

        .forEach(([room, data]) => {

            const score =
                data.total
                ?
                (
                    data.completed /
                    data.total *
                    100
                )
                :
                0;


            if(score < 90){

                riskList.innerHTML += `

                    <li class="alert-item">

                        <strong>
                            ${room}
                        </strong>

                        <br>

                        Compliance:
                        ${score.toFixed(1)}%

                    </li>

                `;

            }

        });


        if(!riskList.innerHTML){

            riskList.innerHTML = `

                <li class="insight-item">

                    No high-risk rooms identified.

                </li>

            `;

        }

    }


    // ========================================================
    // SUPERVISOR ALERTS
    // ========================================================

    const alerts =
        document.getElementById(
            "supervisorAlerts"
        );


    if(alerts){

        alerts.innerHTML = "";


        if(!allData.length){

            alerts.innerHTML = `

                <li class="insight-item">

                    No survey data available.

                </li>

            `;

        }
        else {

            if(compliance < 90){

                alerts.innerHTML += `

                    <li class="alert-item">

                        🚨 Critical:
                        Overall compliance is below 90%.

                    </li>

                `;

            }
            else if(compliance < 95){

                alerts.innerHTML += `

                    <li class="alert-item">

                        ⚠ Compliance is below the
                        95% target.

                    </li>

                `;

            }
            else {

                alerts.innerHTML += `

                    <li class="insight-item">

                        ✅ Overall compliance is
                        meeting the 95% target.

                    </li>

                `;

            }


            const highRiskRooms =
                Object.entries(rooms)
                .filter(([room, data]) => {

                    const score =
                        data.total
                        ?
                        data.completed /
                        data.total *
                        100
                        :
                        0;

                    return score < 90;

                });


            if(highRiskRooms.length){

                alerts.innerHTML += `

                    <li class="alert-item">

                        ⚠ ${highRiskRooms.length}
                        room(s) require attention.

                    </li>

                `;

            }

        }

    }


    // ========================================================
    // PERFORMANCE INSIGHTS
    // ========================================================

    const insights =
        document.getElementById(
            "aiInsights"
        );


    if(insights){

        insights.innerHTML = "";


        insights.innerHTML += `

            <li class="insight-item">

                Current compliance:
                <strong>
                    ${compliance.toFixed(1)}%
                </strong>

            </li>

        `;


        insights.innerHTML += `

            <li class="insight-item">

                Total surveys:
                <strong>
                    ${allData.length}
                </strong>

            </li>

        `;


        const roomEntries =
            Object.entries(rooms);


        if(roomEntries.length){

            const roomScores =
                roomEntries.map(
                    ([room, data]) => {

                        const score =
                            data.total
                            ?
                            data.completed /
                            data.total *
                            100
                            :
                            0;

                        return {
                            room,
                            score
                        };

                    }
                );


            roomScores.sort(
                (a,b) =>
                    b.score - a.score
            );


            const bestRoom =
                roomScores[0];


            if(bestRoom){

                insights.innerHTML += `

                    <li class="insight-item">

                        🏆 Highest-performing room:
                        <strong>
                            ${bestRoom.room}
                        </strong>
                        (${bestRoom.score.toFixed(1)}%)

                    </li>

                `;

            }


            const lowestRoom =
                roomScores[
                    roomScores.length - 1
                ];


            if(
                lowestRoom &&
                lowestRoom.score < 95
            ){

                insights.innerHTML += `

                    <li class="insight-item">

                        📉 Room requiring attention:
                        <strong>
                            ${lowestRoom.room}
                        </strong>
                        (${lowestRoom.score.toFixed(1)}%)

                    </li>

                `;

            }

        }

    }

}

// ============================================================
// PART 4
// FINAL PIPELINE + INIT + REALTIME
// ============================================================


// ============================================================
// REFRESH PIPELINE
// ============================================================


async function refresh(){

    if (isRefreshing)
        return;

    isRefreshing = true;

    try {

        const filtered =
            applyFilters(allData);

        updateSummary(filtered);

        renderTable(filtered);

        renderCharts(filtered);

        renderLeaderboard(filtered);

        renderInsights(filtered);

        generateAdvancedAnalytics();

        generateCleaningIntelligence();

    } catch(error) {

        console.error(
            "Dashboard refresh error:",
            error
        );

    } finally {

        isRefreshing = false;

    }

}

// ============================================================
// DASHBOARD INITIALIZATION
// ============================================================

async function init(){

    console.log("Dashboard started");

    try {

        allData = await fetchData();

        console.log(
            "Rows loaded:",
            allData.length
        );

        populateRoomFilter();

        await refresh();

        console.log("Dashboard finished");

    } catch(error) {

        console.error(
            "Dashboard initialization error:",
            error
        );

    }

}

// ============================================================
// AUTO REFRESH EVERY 60 SECONDS
// ============================================================

setInterval(
    async () => {

        try {

            allData = await fetchData();

            await refresh();

        } catch(error) {

            console.error(
                "Auto refresh error:",
                error
            );

        }

    },
    60000
);

// ============================================================
// LIVE FILTER LISTENERS
// ============================================================


function setupFilters(){


document
.querySelectorAll(
"#filter-room,#filter-staff,#filter-shift,#filter-date"
)

.forEach(filter=>{


filter.addEventListener(
"change",
refresh
);


filter.addEventListener(
"keyup",
refresh
);


});


}

// START SYSTEM

setupFilters();

init();

// ============================================================
// REALTIME SUPABASE SYNC
// ============================================================


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

            console.log(
                "Realtime update received"
            );

            allData =
                await fetchData();

            await refresh();

        }
    )
    .subscribe();

// ============================================================
// EXPORT CENTER + EXPORT FUNCTIONS
// FINAL STABLE VERSION
// ============================================================


// ============================================================
// FINAL EXPORT SYSTEM
// ============================================================

function toggleExportMenu(){

    const exportConsole =
        document.getElementById("exportConsole");

    if(!exportConsole) return;

    exportConsole.classList.toggle("open");

}


// ============================================================
// CSV
// ============================================================

function exportCSV(){

    if(!allData || !allData.length){

        alert("No survey data available.");

        return;

    }

    const rows = allData.map(row => {

        const stats = getTaskStats(row);

        return {

            Date:
                row.work_date ||
                (row.created_at || "").split("T")[0],

            Room: row.room || "",

            Staff: row.staff || "",

            Shift: row.shift || "",

            CompletedTasks: stats.completed,

            TotalTasks: stats.total,

            Compliance:
                stats.total
                ? Math.round(
                    stats.completed /
                    stats.total * 100
                ) + "%"
                : "0%",

            Notes: row.notes || ""

        };

    });


    const headers =
        Object.keys(rows[0]);


    const csv = [

        headers.join(","),

        ...rows.map(row =>

            headers.map(header => {

                const value =
                    row[header] ?? "";

                return `"${String(value)
                    .replace(/"/g, '""')}"`;

            }).join(",")

        )

    ].join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "Cleaning-Survey-Report.csv";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}


// ============================================================
// EXCEL
// ============================================================

function exportExcel(){

    if(!allData || !allData.length){

        alert("No survey data available.");

        return;

    }


    if(typeof XLSX === "undefined"){

        alert(
            "Excel library is not loaded."
        );

        return;

    }


    const rows = allData.map(row => {

        const stats =
            getTaskStats(row);


        return {

            Date:
                row.work_date ||
                (row.created_at || "").split("T")[0],

            Room:
                row.room || "",

            Staff:
                row.staff || "",

            Shift:
                row.shift || "",

            CompletedTasks:
                stats.completed,

            TotalTasks:
                stats.total,

            Compliance:
                stats.total
                ? Math.round(
                    stats.completed /
                    stats.total * 100
                ) + "%"
                : "0%",

            Notes:
                row.notes || ""

        };

    });


    const ws =
        XLSX.utils.json_to_sheet(rows);


    const wb =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Cleaning Report"
    );


    XLSX.writeFile(
        wb,
        "Cleaning-Survey-Report.xlsx"
    );

}


// ============================================================
// ANALYTICS EXCEL
// ============================================================

function exportAnalyticsExcel(){

    if(!allData || !allData.length){

        alert("No survey data available.");

        return;

    }


    if(typeof XLSX === "undefined"){

        alert(
            "Excel library is not loaded."
        );

        return;

    }


    const rows = allData.map(row => {

        const stats =
            getTaskStats(row);


        return {

            Date:
                row.work_date ||
                (row.created_at || "").split("T")[0],

            Room:
                row.room || "",

            Staff:
                row.staff || "",

            Shift:
                row.shift || "",

            CompletedTasks:
                stats.completed,

            TotalTasks:
                stats.total,

            Compliance:
                stats.total
                ? Math.round(
                    stats.completed /
                    stats.total * 100
                )
                : 0

        };

    });


    const ws =
        XLSX.utils.json_to_sheet(rows);


    const wb =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Analytics"
    );


    XLSX.writeFile(
        wb,
        "Cleaning-Analytics.xlsx"
    );

}


// ============================================================
// REGISTER EXPORT FUNCTIONS
// ============================================================

window.toggleExportMenu =
    toggleExportMenu;

window.exportCSV =
    exportCSV;

window.exportExcel =
    exportExcel;

window.exportAnalyticsExcel =
    exportAnalyticsExcel;


// ============================================================
// PROFESSIONAL REPORT
// professional-report.js supplies this function
// ============================================================

if(
    typeof exportProfessionalPDF ===
    "function"
){

    window.exportProfessionalPDF =
        exportProfessionalPDF;

}


// ============================================================
// REPORTING CENTER
// reports.js supplies these functions
// ============================================================

if(
    typeof openReportingCenter ===
    "function"
){

    window.openReportingCenter =
        openReportingCenter;

}


if(
    typeof closeReportingCenter ===
    "function"
){

    window.closeReportingCenter =
        closeReportingCenter;

}


if(
    typeof generateSelectedReport ===
    "function"
){

    window.generateSelectedReport =
        generateSelectedReport;

}


console.log(
    "✅ Export system initialized"
);
