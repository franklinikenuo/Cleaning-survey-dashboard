// ============================================================
// PROFESSIONAL REPORT ENGINE V2
// PHASE 1 — EXECUTIVE PDF REPORT
// ============================================================

async function exportProfessionalPDF() {

    console.log("Generating Professional PDF V2...");

    try {

        // ----------------------------------------------------
        // CHECK DATA
        // ----------------------------------------------------

        if (!window.allData || !allData.length) {

            alert("No survey data available.");

            return;

        }

        // ----------------------------------------------------
        // CHECK PDF LIBRARY
        // ----------------------------------------------------

        if (!window.jspdf || !window.jspdf.jsPDF) {

            alert("PDF library is not loaded.");

            console.error("jsPDF not available.");

            return;

        }

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF(
            "p",
            "mm",
            "a4"
        );

        // ----------------------------------------------------
        // REPORT DATA
        // ----------------------------------------------------

        const data = [...allData];

        const reportID =
            "CCR-" +
            new Date().getFullYear() +
            "-" +
            String(Date.now()).slice(-6);

        const generatedDate =
            new Date().toLocaleDateString();

        // ----------------------------------------------------
        // COLORS
        // ----------------------------------------------------

        const COLORS = {

            navy: [11, 58, 111],

            blue: [13, 71, 161],

            lightBlue: [232, 241, 250],

            green: [46, 125, 50],

            orange: [245, 124, 0],

            red: [198, 40, 40],

            purple: [123, 31, 162],

            dark: [25, 35, 50],

            gray: [100, 116, 139],

            lightGray: [241, 245, 249],

            border: [210, 220, 232],

            white: [255, 255, 255]

        };

        // ----------------------------------------------------
        // BASIC METRICS
        // ----------------------------------------------------

        let totalTasks = 0;
        let completedTasks = 0;

        const rooms = new Set();
        const staff = new Set();

        const shifts = {};

        data.forEach(row => {

            if (row.room) {

                rooms.add(row.room);

            }

            (row.staff || "")
                .split(",")
                .forEach(name => {

                    if (name.trim()) {

                        staff.add(name.trim());

                    }

                });

            const shift =
                row.shift || "Unknown";

            shifts[shift] =
                (shifts[shift] || 0) + 1;

            const stats =
                getTaskStats(row);

            totalTasks +=
                stats.total || 0;

            completedTasks +=
                stats.completed || 0;

        });

        const compliance =
            totalTasks
                ? completedTasks / totalTasks * 100
                : 0;

        // ----------------------------------------------------
        // DATE RANGE
        // ----------------------------------------------------

        const dates = data
            .map(row => {

                return (
                    row.work_date ||
                    row.created_at ||
                    ""
                );

            })
            .filter(Boolean)
            .map(value => {

                const d =
                    new Date(value);

                return isNaN(d)
                    ? null
                    : d;

            })
            .filter(Boolean)
            .sort((a, b) => a - b);

        const startDate =
            dates.length
                ? dates[0].toLocaleDateString()
                : "N/A";

        const endDate =
            dates.length
                ? dates[dates.length - 1]
                    .toLocaleDateString()
                : "N/A";

        // ====================================================
        // HELPER FUNCTIONS
        // ====================================================

        function drawHeader(title) {

            pdf.setFillColor(
                ...COLORS.navy
            );

            pdf.rect(
                0,
                0,
                210,
                20,
                "F"
            );

            pdf.setTextColor(
                ...COLORS.white
            );

            pdf.setFont(
                "helvetica",
                "bold"
            );

            pdf.setFontSize(15);

            pdf.text(
                title,
                15,
                13
            );

            pdf.setTextColor(
                ...COLORS.dark
            );

        }

        function drawFooter() {

            const pageCount =
                pdf.getNumberOfPages();

            for (
                let page = 1;
                page <= pageCount;
                page++
            ) {

                pdf.setPage(page);

                pdf.setDrawColor(
                    ...COLORS.border
                );

                pdf.line(
                    15,
                    286,
                    195,
                    286
                );

                pdf.setFont(
                    "helvetica",
                    "normal"
                );

                pdf.setFontSize(8);

                pdf.setTextColor(
                    ...COLORS.gray
                );

                pdf.text(
                    "Hospital Cleaning Performance System",
                    15,
                    292
                );

                pdf.text(
                    `Report ID: ${reportID}`,
                    105,
                    292,
                    {
                        align: "center"
                    }
                );

                pdf.text(
                    `Page ${page} of ${pageCount}`,
                    195,
                    292,
                    {
                        align: "right"
                    }
                );

            }

        }

        function drawKPI(
            x,
            y,
            width,
            title,
            value,
            color
        ) {

            pdf.setFillColor(
                ...COLORS.white
            );

            pdf.setDrawColor(
                ...COLORS.border
            );

            pdf.roundedRect(
                x,
                y,
                width,
                31,
                3,
                3,
                "FD"
            );

            pdf.setFillColor(
                ...color
            );

            pdf.roundedRect(
                x,
                y,
                3,
                31,
                2,
                2,
                "F"
            );

            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(8);

            pdf.setTextColor(
                ...COLORS.gray
            );

            pdf.text(
                title,
                x + 8,
                y + 9
            );

            pdf.setFont(
                "helvetica",
                "bold"
            );

            pdf.setFontSize(18);

            pdf.setTextColor(
                ...COLORS.dark
            );

            pdf.text(
                String(value),
                x + 8,
                y + 23
            );

        }

        function addSectionTitle(
            title,
            y
        ) {

            pdf.setFont(
                "helvetica",
                "bold"
            );

            pdf.setFontSize(15);

            pdf.setTextColor(
                ...COLORS.navy
            );

            pdf.text(
                title,
                15,
                y
            );

            pdf.setDrawColor(
                ...COLORS.border
            );

            pdf.line(
                15,
                y + 3,
                195,
                y + 3
            );

        }

        function addParagraph(
            text,
            x,
            y,
            width
        ) {

            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(10);

            pdf.setTextColor(
                ...COLORS.dark
            );

            const lines =
                pdf.splitTextToSize(
                    text,
                    width
                );

            pdf.text(
                lines,
                x,
                y
            );

            return y +
                lines.length * 5;

        }

        // ====================================================
        // COVER PAGE
        // ====================================================

        pdf.setFillColor(
            ...COLORS.navy
        );

        pdf.rect(
            0,
            0,
            210,
            297,
            "F"
        );

        pdf.setFillColor(
            ...COLORS.blue
        );

        pdf.circle(
            180,
            45,
            55,
            "F"
        );

        pdf.setTextColor(
            ...COLORS.white
        );

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(28);

        pdf.text(
            "CLEANING",
            20,
            80
        );

        pdf.text(
            "COMPLIANCE",
            20,
            96
        );

        pdf.text(
            "EXECUTIVE REPORT",
            20,
            112
        );

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(13);

        pdf.text(
            "Hospital Cleaning Performance System",
            20,
            130
        );

        pdf.setFontSize(10);

        pdf.text(
            `Reporting Period: ${startDate} – ${endDate}`,
            20,
            158
        );

        pdf.text(
            `Generated: ${generatedDate}`,
            20,
            168
        );

        pdf.text(
            `Report ID: ${reportID}`,
            20,
            178
        );

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(10);

        pdf.text(
            "CONFIDENTIAL MANAGEMENT REPORT",
            20,
            255
        );

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.text(
            "Prepared for operational quality monitoring",
            20,
            264
        );

        // ====================================================
        // PAGE 2 — EXECUTIVE OVERVIEW
        // ====================================================

        pdf.addPage();

        drawHeader(
            "Executive Overview"
        );

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(11);

        pdf.text(
            "Reporting Period",
            15,
            34
        );

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.text(
            `${startDate} – ${endDate}`,
            15,
            41
        );

        // KPI ROW 1

        drawKPI(
            15,
            50,
            42,
            "Total Surveys",
            data.length,
            COLORS.blue
        );

        drawKPI(
            62,
            50,
            42,
            "Compliance",
            compliance.toFixed(1) + "%",
            COLORS.green
        );

        drawKPI(
            109,
            50,
            42,
            "Rooms",
            rooms.size,
            COLORS.orange
        );

        drawKPI(
            156,
            50,
            39,
            "Staff",
            staff.size,
            COLORS.purple
        );

        // KPI ROW 2

        drawKPI(
            15,
            88,
            42,
            "Tasks Reviewed",
            totalTasks,
            COLORS.blue
        );

        drawKPI(
            62,
            88,
            42,
            "Completed",
            completedTasks,
            COLORS.green
        );

        drawKPI(
            109,
            88,
            42,
            "Missed",
            Math.max(
                0,
                totalTasks -
                completedTasks
            ),
            COLORS.red
        );

        drawKPI(
            156,
            88,
            39,
            "Shifts",
            Object.keys(shifts).length,
            COLORS.orange
        );

        // EXECUTIVE SUMMARY

        addSectionTitle(
            "Executive Summary",
            135
        );

        let summaryText;

        if (compliance >= 95) {

            summaryText =
                `Overall cleaning compliance was ${compliance.toFixed(1)}%, meeting the 95% management target. The reporting period includes ${data.length} completed surveys covering ${rooms.size} clinical areas and ${staff.size} staff members. Performance is currently within the expected quality range, with continued monitoring recommended to maintain consistency.`;

        } else if (compliance >= 90) {

            summaryText =
                `Overall cleaning compliance was ${compliance.toFixed(1)}%, placing performance below the 95% management target but within a generally stable operational range. The reporting period includes ${data.length} completed surveys covering ${rooms.size} clinical areas. Targeted follow-up should focus on recurring missed tasks and lower-performing rooms.`;

        } else {

            summaryText =
                `Overall cleaning compliance was ${compliance.toFixed(1)}%, below the 90% high-performance threshold. The reporting period includes ${data.length} completed surveys covering ${rooms.size} clinical areas. Management attention should focus on high-risk rooms, missed tasks, and staff or shift-level patterns contributing to reduced compliance.`;

        }

        addParagraph(
            summaryText,
            15,
            147,
            180
        );

        // ====================================================
        // PAGE 3 — ROOM ACTIVITY
        // ====================================================

        pdf.addPage();

        drawHeader(
            "Room Activity Analysis"
        );

        const roomStats = {};

        data.forEach(row => {

            const room =
                row.room || "Unknown";

            if (!roomStats[room]) {

                roomStats[room] = {

                    surveys: 0,

                    completed: 0,

                    total: 0

                };

            }

            roomStats[room].surveys++;

            const stats =
                getTaskStats(row);

            roomStats[room].completed +=
                stats.completed;

            roomStats[room].total +=
                stats.total;

        });

        const roomEntries =
            Object.entries(roomStats)
                .sort(
                    (a, b) =>
                        b[1].surveys -
                        a[1].surveys
                );

        addSectionTitle(
            "Survey Activity by Room",
            34
        );

        // ----------------------------------------------------
        // CREATE ROOM CHART
        // ----------------------------------------------------

        const roomCanvas =
            document.createElement("canvas");

        roomCanvas.width = 1200;
        roomCanvas.height = 550;

        roomCanvas.style.position =
            "absolute";

        roomCanvas.style.left =
            "-10000px";

        document.body.appendChild(
            roomCanvas
        );

        const roomChart =
            new Chart(
                roomCanvas.getContext("2d"),
                {

                    type: "bar",

                    data: {

                        labels:
                            roomEntries.map(
                                x => x[0]
                            ),

                        datasets: [{

                            label:
                                "Survey Count",

                            data:
                                roomEntries.map(
                                    x =>
                                        x[1].surveys
                                )

                        }]

                    },

                    options: {

                        responsive: false,

                        animation: false,

                        plugins: {

                            legend: {

                                display: true

                            }

                        },

                        scales: {

                            x: {

                                ticks: {

                                    autoSkip: false,

                                    maxRotation: 60,

                                    minRotation: 45

                                }

                            },

                            y: {

                                beginAtZero: true

                            }

                        }

                    }

                }
            );

        await new Promise(
            resolve =>
                setTimeout(resolve, 150)
        );

        const roomImage =
            roomCanvas.toDataURL(
                "image/png",
                1.0
            );

        pdf.addImage(
            roomImage,
            "PNG",
            15,
            42,
            180,
            82
        );

        roomChart.destroy();

        roomCanvas.remove();

        // ----------------------------------------------------
        // ROOM TABLE
        // ----------------------------------------------------

        const roomTable =
            roomEntries.map(
                ([room, stats]) => {

                    const score =
                        stats.total
                            ? (
                                stats.completed /
                                stats.total *
                                100
                            ).toFixed(1)
                            : "0.0";

                    return [

                        room,

                        stats.surveys,

                        stats.completed,

                        stats.total,

                        score + "%"

                    ];

                }
            );

        if (
            typeof pdf.autoTable ===
            "function"
        ) {

            pdf.autoTable({

                startY: 132,

                head: [[

                    "Room",

                    "Surveys",

                    "Completed",

                    "Tasks",

                    "Compliance"

                ]],

                body: roomTable,

                styles: {

                    fontSize: 8

                },

                headStyles: {

                    fillColor:
                        COLORS.navy,

                    textColor:
                        COLORS.white

                },

                alternateRowStyles: {

                    fillColor:
                        COLORS.lightGray

                }

            });

        }

        // ====================================================
        // PAGE 4 — SHIFT DISTRIBUTION
        // ====================================================

        pdf.addPage();

        drawHeader(
            "Shift Distribution"
        );

        addSectionTitle(
            "Cleaning Surveys by Shift",
            34
        );

        // ----------------------------------------------------
        // SHIFT CHART
        // ----------------------------------------------------

        const shiftCanvas =
            document.createElement("canvas");

        shiftCanvas.width = 900;
        shiftCanvas.height = 650;

        shiftCanvas.style.position =
            "absolute";

        shiftCanvas.style.left =
            "-10000px";

        document.body.appendChild(
            shiftCanvas
        );

        const shiftLabels =
            Object.keys(shifts);

        const shiftValues =
            Object.values(shifts);

        const shiftChart =
            new Chart(
                shiftCanvas.getContext("2d"),
                {

                    type: "doughnut",

                    data: {

                        labels:
                            shiftLabels,

                        datasets: [{

                            label:
                                "Shift Distribution",

                            data:
                                shiftValues

                        }]

                    },

                    options: {

                        responsive: false,

                        animation: false,

                        plugins: {

                            legend: {

                                position:
                                    "bottom"

                            }

                        }

                    }

                }
            );

        await new Promise(
            resolve =>
                setTimeout(resolve, 150)
        );

        const shiftImage =
            shiftCanvas.toDataURL(
                "image/png",
                1.0
            );

        pdf.addImage(
            shiftImage,
            "PNG",
            35,
            45,
            140,
            100
        );

        shiftChart.destroy();

        shiftCanvas.remove();

        // SHIFT TABLE

        const shiftRows =
            shiftLabels.map(
                shift => [

                    shift,

                    shifts[shift],

                    data.length
                        ? (
                            shifts[shift] /
                            data.length *
                            100
                        ).toFixed(1)
                        + "%"
                        : "0%"

                ]
            );

        if (
            typeof pdf.autoTable ===
            "function"
        ) {

            pdf.autoTable({

                startY: 160,

                head: [[

                    "Shift",

                    "Surveys",

                    "% of Total"

                ]],

                body: shiftRows,

                headStyles: {

                    fillColor:
                        COLORS.navy

                },

                styles: {

                    fontSize: 9

                }

            });

        }

        // ====================================================
        // PAGE 5 — DAILY COMPLIANCE TREND
        // ====================================================

        pdf.addPage();

        drawHeader(
            "Daily Compliance Trend"
        );

        addSectionTitle(
            "Compliance Performance Over Time",
            34
        );

        const dailyStats = {};

        data.forEach(row => {

            const rawDate =
                row.work_date ||
                row.created_at;

            if (!rawDate)
                return;

            const date =
                new Date(rawDate);

            if (isNaN(date))
                return;

            const key =
                date.toISOString()
                    .split("T")[0];

            if (!dailyStats[key]) {

                dailyStats[key] = {

                    completed: 0,

                    total: 0

                };

            }

            const stats =
                getTaskStats(row);

            dailyStats[key].completed +=
                stats.completed;

            dailyStats[key].total +=
                stats.total;

        });

        const dailyEntries =
            Object.entries(dailyStats)
                .sort(
                    (a, b) =>
                        a[0].localeCompare(
                            b[0]
                        )
                );

        const dailyLabels =
            dailyEntries.map(
                ([date]) => date
            );

        const dailyValues =
            dailyEntries.map(
                ([, stats]) =>
                    stats.total
                        ? Number(
                            (
                                stats.completed /
                                stats.total *
                                100
                            ).toFixed(1)
                        )
                        : 0
            );

        const trendCanvas =
            document.createElement("canvas");

        trendCanvas.width = 1200;
        trendCanvas.height = 600;

        trendCanvas.style.position =
            "absolute";

        trendCanvas.style.left =
            "-10000px";

        document.body.appendChild(
            trendCanvas
        );

        const trendChart =
            new Chart(
                trendCanvas.getContext("2d"),
                {

                    type: "line",

                    data: {

                        labels:
                            dailyLabels,

                        datasets: [{

                            label:
                                "Daily Compliance %",

                            data:
                                dailyValues,

                            tension: 0.3,

                            fill: false

                        }]

                    },

                    options: {

                        responsive: false,

                        animation: false,

                        scales: {

                            y: {

                                beginAtZero: true,

                                max: 100,

                                title: {

                                    display: true,

                                    text:
                                        "Compliance %"

                                }

                            }

                        }

                    }

                }
            );

        await new Promise(
            resolve =>
                setTimeout(resolve, 150)
        );

        const trendImage =
            trendCanvas.toDataURL(
                "image/png",
                1.0
            );

        pdf.addImage(
            trendImage,
            "PNG",
            15,
            45,
            180,
            90
        );

        trendChart.destroy();

        trendCanvas.remove();

        // ====================================================
        // PAGE 6 — STAFF PERFORMANCE
        // ====================================================

        pdf.addPage();

        drawHeader(
            "Staff Performance"
        );

        addSectionTitle(
            "Staff Performance Ranking",
            34
        );

        let staffStats = [];

        try {

            staffStats =
                getStaffStats(data) || [];

        } catch(error) {

            console.warn(
                "Unable to calculate staff statistics:",
                error
            );

        }

        staffStats.sort(
            (a, b) =>
                (b.compliance || 0) -
                (a.compliance || 0)
        );

        const staffRows =
            staffStats.map(
                (person, index) => [

                    index + 1,

                    person.name ||
                        "Unknown",

                    person.shifts ||
                        person.surveys ||
                        0,

                    (
                        Number(
                            person.compliance
                        ) || 0
                    ).toFixed(1) + "%"

                ]
            );

        if (
            typeof pdf.autoTable ===
            "function"
        ) {

            pdf.autoTable({

                startY: 42,

                head: [[

                    "Rank",

                    "Staff",

                    "Surveys",

                    "Compliance"

                ]],

                body: staffRows,

                headStyles: {

                    fillColor:
                        COLORS.navy

                },

                styles: {

                    fontSize: 9

                },

                alternateRowStyles: {

                    fillColor:
                        COLORS.lightGray

                }

            });

        }

        // ====================================================
        // PAGE 7 — MISSED TASKS
        // ====================================================

        pdf.addPage();

        drawHeader(
            "Missed Task Analysis"
        );

        addSectionTitle(
            "Tasks Requiring Attention",
            34
        );

        const missedTasks = {};

        data.forEach(row => {

            Object.entries(
                row.tasks_completed || {}
            ).forEach(
                ([task, value]) => {

                    if (
                        value === "N"
                    ) {

                        missedTasks[task] =
                            (
                                missedTasks[task] ||
                                0
                            ) + 1;

                    }

                }
            );

        });

        const missedRows =
            Object.entries(
                missedTasks
            )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .map(
                ([task, count]) => [

                    task,

                    count,

                    totalTasks
                        ? (
                            count /
                            totalTasks *
                            100
                        ).toFixed(1) +
                        "%"
                        : "0%"

                ]
            );

        if (
            typeof pdf.autoTable ===
            "function"
        ) {

            pdf.autoTable({

                startY: 42,

                head: [[

                    "Task",

                    "Times Missed",

                    "Share of Tasks"

                ]],

                body:
                    missedRows.length
                        ? missedRows
                        : [[
                            "No missed tasks recorded",
                            "0",
                            "0%"
                        ]],

                headStyles: {

                    fillColor:
                        COLORS.red

                },

                styles: {

                    fontSize: 9

                }

            });

        }

        // ====================================================
        // PAGE 8 — HIGH RISK ROOMS
        // ====================================================

        pdf.addPage();

        drawHeader(
            "High-Risk Room Analysis"
        );

        addSectionTitle(
            "Rooms Below 90% Compliance",
            34
        );

        const riskRows = [];

        roomEntries.forEach(
            ([room, stats]) => {

                const score =
                    stats.total
                        ? (
                            stats.completed /
                            stats.total *
                            100
                        )
                        : 0;

                if (score < 90) {

                    riskRows.push([

                        room,

                        stats.surveys,

                        score.toFixed(1) + "%",

                        score < 80
                            ? "Critical"
                            : "High Risk"

                    ]);

                }

            }
        );

        if (
            typeof pdf.autoTable ===
            "function"
        ) {

            pdf.autoTable({

                startY: 42,

                head: [[

                    "Room",

                    "Surveys",

                    "Compliance",

                    "Risk"

                ]],

                body:
                    riskRows.length
                        ? riskRows
                        : [[

                            "No high-risk rooms",
                            "-",
                            "-",
                            "Low Risk"

                        ]],

                headStyles: {

                    fillColor:
                        COLORS.red

                },

                styles: {

                    fontSize: 9

                }

            });

        }

        // ====================================================
        // PAGE 9 — MANAGEMENT INSIGHTS
        // ====================================================

        pdf.addPage();

        drawHeader(
            "Management Insights & Recommendations"
        );

        addSectionTitle(
            "Key Findings",
            34
        );

        let insightY = 47;

        const insights = [];

        // Compliance finding

        if (compliance >= 95) {

            insights.push(
                `Overall compliance is ${compliance.toFixed(1)}%, meeting the 95% target.`
            );

        } else {

            insights.push(
                `Overall compliance is ${compliance.toFixed(1)}%, which is below the 95% management target.`
            );

        }

        // Risk finding

        if (riskRows.length) {

            insights.push(
                `${riskRows.length} room(s) are currently below 90% compliance and should receive targeted review.`
            );

        } else {

            insights.push(
                "No rooms are currently below the 90% high-risk threshold."
            );

        }

        // Missed task finding

        if (missedRows.length) {

            insights.push(
                `The most frequently missed task is "${missedRows[0][0]}", recorded ${missedRows[0][1]} time(s).`
            );

        } else {

            insights.push(
                "No missed tasks were recorded during the reporting period."
            );

        }

        // Coverage finding

        insights.push(
            `The reporting period contains ${data.length} surveys across ${rooms.size} rooms and ${staff.size} staff members.`
        );

        insights.forEach(
            text => {

                pdf.setFillColor(
                    ...COLORS.lightBlue
                );

                pdf.roundedRect(
                    15,
                    insightY - 6,
                    180,
                    20,
                    3,
                    3,
                    "F"
                );

                pdf.setFillColor(
                    ...COLORS.blue
                );

                pdf.circle(
                    23,
                    insightY + 3,
                    2,
                    "F"
                );

                pdf.setFont(
                    "helvetica",
                    "normal"
                );

                pdf.setFontSize(9);

                pdf.setTextColor(
                    ...COLORS.dark
                );

                const lines =
                    pdf.splitTextToSize(
                        text,
                        160
                    );

                pdf.text(
                    lines,
                    30,
                    insightY + 1
                );

                insightY +=
                    Math.max(
                        24,
                        lines.length * 5 + 12
                    );

            }
        );

        // ====================================================
        // RECOMMENDATIONS
        // ====================================================

        addSectionTitle(
            "Recommended Actions",
            insightY + 5
        );

        let recommendationY =
            insightY + 18;

        const recommendations = [

            "Continue daily compliance monitoring across all clinical areas.",

            "Prioritize corrective review for rooms below 90% compliance.",

            "Review recurring missed tasks during staff coaching and shift handovers.",

            "Maintain consistent documentation of completed cleaning activities.",

            "Use monthly trend analysis to identify persistent performance patterns."

        ];

        recommendations.forEach(
            (recommendation, index) => {

                pdf.setFont(
                    "helvetica",
                    "normal"
                );

                pdf.setFontSize(9);

                pdf.setTextColor(
                    ...COLORS.dark
                );

                const lines =
                    pdf.splitTextToSize(
                        `${index + 1}. ${recommendation}`,
                        170
                    );

                pdf.text(
                    lines,
                    20,
                    recommendationY
                );

                recommendationY +=
                    lines.length * 5 + 5;

            }
        );

        // ====================================================
        // FINALIZE FOOTERS
        // ====================================================

        drawFooter();

        // ====================================================
        // SAVE
        // ====================================================

        const filename =
            "Professional-Cleaning-Executive-Report-" +
            new Date()
                .toISOString()
                .slice(0, 10) +
            ".pdf";

        pdf.save(filename);

        console.log(
            "✅ Professional PDF generated successfully."
        );

    } catch(error) {

        console.error(
            "Professional PDF generation failed:",
            error
        );

        alert(
            "Professional PDF generation failed. Check the browser console for details."
        );

    }

}

// ============================================================
// GLOBAL REGISTRATION
// ============================================================

window.exportProfessionalPDF =
    exportProfessionalPDF;

console.log(
    "✅ Professional Report Engine V2 loaded"
);
