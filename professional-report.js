/* ==========================================================
   EXECUTIVE REPORTING ENGINE V2
   PHASE 1
========================================================== */

const REPORT_TITLE = "Cleaning Compliance Executive Report";
const ORGANIZATION = "Hospital Cleaning Performance System";

/* ==========================================================
   CREATE PDF
========================================================== */

function createPDF() {

    const pdf = new jspdf.jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    pdf.setFont("helvetica");

    return pdf;

}

/* ==========================================================
   REPORT ID
========================================================== */

function generateReportID(){

    const d = new Date();

    return `CCR-${
        d.getFullYear()
    }-${
        String(d.getMonth()+1).padStart(2,"0")
    }-${
        String(Date.now()).slice(-4)
    }`;

}

/* ==========================================================
   HEADER
========================================================== */

function drawHeader(pdf,title){

    pdf.setFillColor(13,71,161);

    pdf.rect(
        0,
        0,
        210,
        18,
        "F"
    );

    pdf.setTextColor(255);

    pdf.setFontSize(18);

    pdf.text(title,15,12);

    pdf.setTextColor(0);

}

/* ==========================================================
   FOOTER
========================================================== */

function drawFooter(pdf){

    const pages = pdf.getNumberOfPages();

    for(let i=1;i<=pages;i++){

        pdf.setPage(i);

        pdf.setDrawColor(220);

        pdf.line(
            15,
            287,
            195,
            287
        );

        pdf.setFontSize(9);

        pdf.setTextColor(100);

        pdf.text(
            ORGANIZATION,
            15,
            292
        );

        pdf.text(
            `Page ${i} of ${pages}`,
            175,
            292
        );

    }

}

/* ==========================================================
   COVER PAGE
========================================================== */

function addCoverPage(pdf){

    pdf.setFillColor(13,71,161);

    pdf.rect(
        0,
        0,
        210,
        297,
        "F"
    );

    pdf.setTextColor(255);

    pdf.setFontSize(28);

    pdf.text(
        "CLEANING",
        105,
        70,
        {align:"center"}
    );

    pdf.text(
        "COMPLIANCE",
        105,
        85,
        {align:"center"}
    );

    pdf.text(
        "EXECUTIVE REPORT",
        105,
        100,
        {align:"center"}
    );

    pdf.setFontSize(15);

    pdf.text(
        ORGANIZATION,
        105,
        120,
        {align:"center"}
    );

    pdf.setFontSize(12);

    pdf.text(
        `Generated: ${
            new Date().toLocaleDateString()
        }`,
        105,
        170,
        {align:"center"}
    );

    pdf.text(
        `Report ID: ${
            generateReportID()
        }`,
        105,
        180,
        {align:"center"}
    );

    pdf.setFontSize(11);

    pdf.text(
        "CONFIDENTIAL",
        105,
        260,
        {align:"center"}
    );

    pdf.addPage();

}

/* ==========================================================
   EXECUTIVE SUMMARY
========================================================== */

function addExecutiveSummary(pdf,data){

    drawHeader(
        pdf,
        "Executive Summary"
    );

    pdf.setFontSize(12);

    const total = data.length;

    let tasks = 0;
    let yes = 0;

    data.forEach(r=>{

        Object.values(
            r.tasks_completed||{}
        ).forEach(v=>{

            tasks++;

            if(v==="Y") yes++;

        });

    });

    const compliance = tasks
        ? Math.round(
            yes/tasks*100
          )
        :0;

    const rooms = new Set(
        data.map(d=>d.room)
    ).size;

    const staff = new Set();

    data.forEach(d=>{

        (d.staff||"")
            .split(",")
            .forEach(s=>{

                if(s.trim())
                    staff.add(s.trim());

            });

    });

    const summary =
`This report summarizes the cleaning compliance performance for the selected reporting period.

A total of ${total} cleaning surveys were completed.

Overall compliance reached ${compliance}%.

Cleaning activities covered ${rooms} clinical areas involving ${staff.size} staff members.

The dashboard indicates consistent operational performance while identifying opportunities for quality improvement and continued monitoring.`;

    pdf.text(
        pdf.splitTextToSize(summary,170),
        20,
        40
    );

}

/* ==========================================================
   PHASE 2
   EXECUTIVE KPI DASHBOARD
========================================================== */

function drawKPICard(pdf, x, y, w, h, title, value, color) {

    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.roundedRect(x, y, w, h, 4, 4, "F");

    pdf.setTextColor(255);
    pdf.setFontSize(10);
    pdf.text(title, x + 5, y + 8);

    pdf.setFontSize(22);
    pdf.text(String(value), x + 5, y + 22);

    pdf.setTextColor(0);

}

/* ==========================================================
   EXECUTIVE KPI PAGE
========================================================== */

function addExecutiveKPIs(pdf, data) {

    pdf.addPage();

    drawHeader(pdf, "Executive KPI Dashboard");

    let totalTasks = 0;
    let completedTasks = 0;

    const rooms = new Set();
    const staff = new Set();
    const shifts = {};

    data.forEach(row => {

        if (row.room)
            rooms.add(row.room);

        (row.staff || "")
            .split(",")
            .forEach(s => {
                if (s.trim())
                    staff.add(s.trim());
            });

        shifts[row.shift] = (shifts[row.shift] || 0) + 1;

        Object.values(row.tasks_completed || {})
            .forEach(v => {

                totalTasks++;

                if (v === "Y")
                    completedTasks++;

            });

    });

    const compliance =
        totalTasks
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;

    drawKPICard(
        pdf,
        15,
        35,
        42,
        28,
        "Surveys",
        data.length,
        [13,71,161]
    );

    drawKPICard(
        pdf,
        62,
        35,
        42,
        28,
        "Compliance",
        compliance + "%",
        [46,125,50]
    );

    drawKPICard(
        pdf,
        109,
        35,
        42,
        28,
        "Rooms",
        rooms.size,
        [255,152,0]
    );

    drawKPICard(
        pdf,
        156,
        35,
        39,
        28,
        "Staff",
        staff.size,
        [156,39,176]
    );

    pdf.setFontSize(16);

    pdf.text(
        "Shift Distribution",
        15,
        82
    );

    pdf.setFontSize(11);

    let y = 95;

    Object.keys(shifts)
        .sort()
        .forEach(name => {

            pdf.text(
                `${name}: ${shifts[name]} surveys`,
                20,
                y
            );

            y += 8;

        });

}

/* ==========================================================
   OPERATIONAL ANALYTICS
========================================================== */

function addOperationalAnalytics(pdf, data) {

    pdf.addPage();

    drawHeader(
        pdf,
        "Operational Analytics"
    );

    const roomStats = {};

    data.forEach(row => {

        if (!roomStats[row.room])
            roomStats[row.room] = {
                surveys: 0,
                yes: 0,
                total: 0
            };

        roomStats[row.room].surveys++;

        Object.values(row.tasks_completed || {})
            .forEach(v => {

                roomStats[row.room].total++;

                if (v === "Y")
                    roomStats[row.room].yes++;

            });

    });

    const rows =
        Object.entries(roomStats)
            .map(([room, s]) => [

                room,

                s.surveys,

                s.total
                    ? Math.round(
                        s.yes / s.total * 100
                    ) + "%"
                    : "0%"

            ]);

    pdf.autoTable({

        startY: 35,

        head: [[
            "Room",
            "Surveys",
            "Compliance"
        ]],

        body: rows,

        headStyles: {

            fillColor: [13,71,161]

        }

    });

                        }

