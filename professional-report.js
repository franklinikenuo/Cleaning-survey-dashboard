// ============================================================
// UCDS v3.2 — PROFESSIONAL REPORT ENGINE
//
// GDI Integrated Facility Services
// Ottawa Fertility Centre
//
// Executive Cleaning Compliance Report
//
// PART 1/3
// Foundation + Branding + KPI Engine
//
// Compatible with:
// - DataStore
// - dashboard-core.js
// - reports.js
// - report-center.js
// ============================================================



console.log(
    "Loading Professional Report Engine v3.2..."
);




// ============================================================
// REPORT CONFIGURATION
// ============================================================


const REPORT = {


    company:
        "GDI Integrated Facility Services",


    facility:
        "Ottawa Fertility Centre",


    title:
        "Executive Cleaning Compliance Report",


    subtitle:
        "Hospital Cleaning Performance Analysis",


    version:
        "3.2"


};

// ============================================================
// GDI CORPORATE CHART COLORS
// ============================================================

const GDI_COLORS = {

    primary: "#003B5C",     // GDI dark blue
    secondary: "#00A3E0",   // GDI light blue
    success: "#2E7D32",     // Compliance green
    warning: "#F9A825",     // Attention yellow
    danger: "#C62828",      // Low performance red
    grey: "#607D8B"

};


// ============================================================
// REPORT FILTER ENGINE
// Weekly / Monthly / Annual
// ============================================================


function applyReportFilters(data, filters = {}) {


    if(
        !filters.type ||
        filters.type === "all" ||
        filters.type === "professional"
    ){

        return data;

    }



    return data.filter(record=>{


        const dateValue =

            record.work_date ||

            record.created_at;



        if(!dateValue){

            return false;

        }



        const date =
            new Date(dateValue);



        const year =
            Number(filters.year);



        const month =
            Number(filters.month);



        const recordDay =
            new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            );





        // =========================
        // ANNUAL
        // =========================

        if(
            filters.type === "annual" ||
            filters.type === "yearly"
        ){

            return (

                recordDay.getFullYear()
                ===
                year

            );

        }





        // =========================
        // MONTHLY
        // =========================

        if(
            filters.type === "monthly"
        ){

            return (

                recordDay.getFullYear()
                ===
                year

                &&

                recordDay.getMonth()+1
                ===
                month

            );

        }






        // =========================
        // WEEKLY
        // =========================

        if(
            filters.type === "weekly"
        ){


            const week =
                Number(filters.week || 1);



            const start =
                new Date(
                    year,
                    month-1,
                    1
                );



            start.setDate(
                start.getDate()
                +
                ((week-1)*7)
            );



            const end =
                new Date(start);



            end.setDate(
                start.getDate()+6
            );



            return (

                recordDay >= start

                &&

                recordDay <= end

            );


        }





        return true;


    });


}


// ============================================================
// PDF CREATION
// ============================================================


function createPDF(){


    return new jspdf.jsPDF({


        orientation:
            "portrait",


        unit:
            "mm",


        format:
            "a4"


    });


}





// ============================================================
// DATE FORMATTER
// ============================================================


function formatDate(date = new Date()){



    return date.toLocaleDateString(

        "en-CA",

        {


            year:
                "numeric",


            month:
                "long",


            day:
                "numeric"


        }

    );


}





// ============================================================
// REPORT PERIOD
// ============================================================


function getReportingPeriod(data){



    const dates = data


        .map(row =>


            row.work_date ||

            row.created_at


        )


        .filter(Boolean)


        .map(date =>


            new Date(date)


        );





    if(!dates.length){


        return "Not Available";


    }






    const start =

        new Date(

            Math.min(

                ...dates

            )

        );





    const end =

        new Date(

            Math.max(

                ...dates

            )

        );






    return (

        start.toLocaleDateString(

            "en-CA"

        )

        +

        "  -  "

        +

        end.toLocaleDateString(

            "en-CA"

        )

    );



}







// ============================================================
// COMPLIANCE STATUS
// ============================================================


function getComplianceStatus(score){



    if(score >= 95){


        return "EXCELLENT PERFORMANCE";


    }




    if(score >= 85){


        return "GOOD PERFORMANCE";


    }




    if(score >= 75){


        return "NEEDS IMPROVEMENT";


    }




    return "REQUIRES IMMEDIATE ATTENTION";



}







// ============================================================
// KPI CALCULATION ENGINE
// ============================================================


function calculateKPIs(data){



    let totalTasks = 0;


    let completedTasks = 0;





    const rooms = new Set();


    const staff = new Set();






    data.forEach(record => {





        if(record.room){


            rooms.add(

                record.room

            );


        }







        if(record.staff){



            String(record.staff)


                .split(",")


                .map(

                    name =>

                    name.trim()

                )


                .filter(Boolean)


                .forEach(name => {


                    staff.add(name);


                });



        }








        Object.values(


            record.tasks_completed || {}


        )

        .forEach(task => {




            totalTasks++;




            if(task === "Y"){


                completedTasks++;


            }



        });





    });







    const compliance =


        totalTasks


        ?


        Math.round(

            (

                completedTasks /

                totalTasks

            )

            *

            100

        )


        :


        0;







    return {


        totalSurveys:


            data.length,



        totalRooms:


            rooms.size,



        totalStaff:


            staff.size,



        totalTasks,



        completedTasks,



        compliance,



        status:


            getComplianceStatus(

                compliance

            )



    };

}






// ============================================================
// HEADER
// ============================================================


function addHeader(pdf){



    pdf.setFont(

        "helvetica",

        "bold"

    );



    pdf.setFontSize(18);



    pdf.text(

        REPORT.company,

        105,

        18,

        {

            align:

                "center"

        }

    );





    pdf.setFontSize(12);



    pdf.text(

        REPORT.facility,

        105,

        27,

        {

            align:

                "center"

        }

    );





    pdf.setLineWidth(

        0.5

    );



    pdf.line(

        15,

        34,

        195,

        34

    );



}





// ============================================================
// FOOTER
// ============================================================


function addFooter(pdf){



    const page =

        pdf.getNumberOfPages();





    pdf.setFontSize(8);



    pdf.text(

        `${REPORT.company} | ${REPORT.facility}`,

        15,

        290

    );




    pdf.text(

        `Confidential Management Report | Page ${page}`,

        195,

        290,

        {

            align:

                "right"

        }

    );



}

// ============================================================
// PROFESSIONAL REPORT ENGINE v3.2
//
// ADDITIONAL PAGES
// Cover Page + Executive Summary
// ============================================================


// ============================================================
// COVER PAGE
// ============================================================

function addCoverPage(pdf,data){


    const kpi =
        calculateKPIs(data);



    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.setFontSize(22);


    pdf.text(
        REPORT.company,
        105,
        45,
        {
            align:"center"
        }
    );



    pdf.setFontSize(16);


    pdf.text(
        REPORT.facility,
        105,
        58,
        {
            align:"center"
        }
    );



    pdf.setLineWidth(
        0.8
    );


    pdf.line(
        35,
        70,
        175,
        70
    );



    pdf.setFontSize(20);


    pdf.text(
        REPORT.title,
        105,
        100,
        {
            align:"center"
        }
    );



    pdf.setFontSize(12);


    pdf.text(
        REPORT.subtitle,
        105,
        115,
        {
            align:"center"
        }
    );




    pdf.roundedRect(
        40,
        140,
        130,
        70,
        5,
        5
    );



    pdf.setFontSize(12);


    pdf.text(
        "Report Period",
        105,
        158,
        {
            align:"center"
        }
    );


    pdf.setFontSize(14);


    pdf.text(
        getReportingPeriod(data),
        105,
        175,
        {
            align:"center"
        }
    );



    pdf.setFontSize(12);


    pdf.text(
        "Compliance Status",
        105,
        193,
        {
            align:"center"
        }
    );



    pdf.setFontSize(15);


    pdf.text(
        kpi.status,
        105,
        205,
        {
            align:"center"
        }
    );




    pdf.setFontSize(10);


    pdf.text(
        "Generated: " +
        formatDate(),
        105,
        245,
        {
            align:"center"
        }
    );



    pdf.text(
        "Confidential Management Document",
        105,
        260,
        {
            align:"center"
        }
    );


    addFooter(pdf);


}







// ============================================================
// EXECUTIVE SUMMARY PAGE
// ============================================================


function addExecutiveSummary(pdf,data){



    pdf.addPage();



    addHeader(pdf);



    const kpi =
        calculateKPIs(data);



    const rooms =
        getRoomPerformance(data);



    const staff =
        getStaffPerformance(data);





    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.setFontSize(18);



    pdf.text(
        "Executive Summary",
        15,
        45
    );





    pdf.setFontSize(11);



    let y = 65;




    const summary = [



        "Overall cleaning compliance: "
        + kpi.compliance
        + "%",




        "Performance classification: "
        + kpi.status,




        "Total surveys completed: "
        + kpi.totalSurveys,




        "Rooms audited: "
        + kpi.totalRooms,




        "Staff members recorded: "
        + kpi.totalStaff



    ];





    summary.forEach(item=>{


        pdf.text(
            "• " + item,
            20,
            y
        );


        y += 10;


    });







    y += 10;



    pdf.setFont(
        "helvetica",
        "bold"
    );



    pdf.text(
        "Key Performance Highlights",
        15,
        y
    );



    y += 12;



    pdf.setFont(
        "helvetica",
        "normal"
    );



    if(rooms.length){


        pdf.text(
            "Top performing room: "
            +
            rooms[0].room
            +
            " ("
            +
            rooms[0].compliance
            +
            "%)",
            20,
            y
        );


        y+=10;

    }




    if(staff.length){


        pdf.text(
            "Highest performing staff: "
            +
            staff[0].name
            +
            " ("
            +
            staff[0].compliance
            +
            "%)",
            20,
            y
        );


        y+=10;

    }






    y+=10;



    pdf.setFont(
        "helvetica",
        "bold"
    );



    pdf.text(
        "Management Recommendations",
        15,
        y
    );



    y+=12;



    pdf.setFont(
        "helvetica",
        "normal"
    );



    const recommendations=[


        "Continue daily compliance monitoring.",


        "Review rooms below expected performance targets.",


        "Provide coaching where gaps are identified.",


        "Maintain documentation for audit readiness."

    ];




    recommendations.forEach(item=>{


        pdf.text(
            "• "+item,
            20,
            y
        );


        y+=10;


    });



    addFooter(pdf);


}



console.log(

    "✅ Professional Report Engine v3.2 Part 1 loaded"

);

// ============================================================
// PROFESSIONAL REPORT ENGINE v3.0
//
// PART 2
// Analytics Pages
// Charts
// Tables
// Performance Analysis
//
// Compatible with:
// DataStore
// reports.js
// report-center.js
// dashboard-core.js
// ============================================================



// ============================================================
// ROOM PERFORMANCE ANALYTICS
// ============================================================


function getRoomPerformance(data){


    const rooms = {};



    data.forEach(record=>{


        const room =
            record.room || "Unknown";



        if(!rooms[room]){


            rooms[room]={

                room,

                surveys:0,

                completed:0,

                total:0

            };


        }



        rooms[room].surveys++;



        Object.values(
            record.tasks_completed || {}
        )
        .forEach(task=>{


            rooms[room].total++;


            if(task==="Y"){

                rooms[room].completed++;

            }


        });



    });





    return Object.values(rooms)

    .map(room=>({


        ...room,


        compliance:

            room.total

            ?

            Math.round(
                (
                    room.completed /
                    room.total
                ) * 100
            )

            :

            0



    }))

    .sort(
        (a,b)=>
        b.compliance-a.compliance
    );


}








// ============================================================
// STAFF PERFORMANCE ANALYTICS
// ============================================================


function getStaffPerformance(data){



    const staff={};



    data.forEach(record=>{


        if(!record.staff)
            return;




        String(record.staff)

        .split(",")

        .map(
            name=>name.trim()
        )

        .filter(Boolean)

        .forEach(name=>{


            if(!staff[name]){


                staff[name]={

                    name,

                    surveys:0,

                    completed:0,

                    total:0

                };


            }




            staff[name].surveys++;




            Object.values(
                record.tasks_completed || {}
            )

            .forEach(task=>{


                staff[name].total++;



                if(task==="Y"){

                    staff[name].completed++;

                }



            });



        });



    });






    return Object.values(staff)

    .map(person=>({


        ...person,


        compliance:

            person.total

            ?

            Math.round(
                (
                    person.completed /
                    person.total
                )*100
            )

            :

            0



    }))

    .sort(
        (a,b)=>
        b.compliance-a.compliance
    );


}


// ============================================================
// TASK PERFORMANCE
// ============================================================


function getTaskPerformance(data){



    const tasks={};



    data.forEach(record=>{


        Object.entries(

            record.tasks_completed || {}

        )

        .forEach(
        ([task,result])=>{


            if(!tasks[task]){


                tasks[task]={

                    task,

                    completed:0,

                    total:0

                };


            }



            tasks[task].total++;



            if(result==="Y"){

                tasks[task].completed++;

            }



        });



    });





    return Object.values(tasks)

    .map(task=>({


        ...task,


        compliance:

            task.total

            ?

            Math.round(

                (
                    task.completed /
                    task.total

                )*100

            )

            :

            0



    }));


}


// ============================================================
// SHIFT PERFORMANCE ANALYTICS
// ============================================================

function getShiftPerformance(data){


    const shifts = {


        Morning:{
            surveys:0,
            completed:0,
            total:0
        },


        Afternoon:{
            surveys:0,
            completed:0,
            total:0
        },


        Evening:{
            surveys:0,
            completed:0,
            total:0
        },


        Night:{
            surveys:0,
            completed:0,
            total:0
        }


    };




    data.forEach(record=>{


        const shift = record.shift;


        if(
            !shifts[shift]
        ){
            return;
        }



        shifts[shift].surveys++;




        Object.values(
            record.tasks_completed || {}
        )

        .forEach(task=>{


            shifts[shift].total++;


            if(task==="Y"){

                shifts[shift].completed++;

            }


        });



    });





    Object.keys(shifts).forEach(shift=>{


        const item = shifts[shift];


        item.compliance =

            item.total

            ?

            Math.round(

                (
                    item.completed /

                    item.total

                ) * 100

            )

            :

            0;



    });





    return shifts;


}




// ============================================================
// ADD PERFORMANCE DASHBOARD PAGE
// ============================================================


function addPerformanceDashboard(pdf,data){

    pdf.addPage();

    addHeader(pdf);

    const kpi = calculateKPIs(data);

    pdf.setFont("helvetica","bold");
    pdf.setFontSize(18);

    pdf.text(
        "Executive Performance Dashboard",
        15,
        45
    );

    const cards=[

        {
            title:"Compliance",
            value:kpi.compliance+"%",
            color:[34,197,94]
        },

        {
            title:"Surveys",
            value:kpi.totalSurveys,
            color:[37,99,235]
        },

        {
            title:"Rooms",
            value:kpi.totalRooms,
            color:[245,158,11]
        },

        {
            title:"Staff",
            value:kpi.totalStaff,
            color:[147,51,234]
        }

    ];

    let x=15;

    cards.forEach(card=>{

        pdf.setFillColor(...card.color);

        pdf.roundedRect(
            x,
            60,
            40,
            34,
            3,
            3,
            "F"
        );

        pdf.setTextColor(255);

        pdf.setFontSize(9);

        pdf.text(
            card.title,
            x+20,
            72,
            {align:"center"}
        );

        pdf.setFontSize(17);

        pdf.text(
            String(card.value),
            x+20,
            87,
            {align:"center"}
        );

        pdf.setTextColor(0);

        x += 45;

    });

    pdf.setFontSize(11);

    pdf.text(
        "Overall Status:",
        15,
        120
    );

    pdf.setFont("helvetica","bold");

    pdf.text(
        kpi.status,
        55,
        120
    );

    addFooter(pdf);

}




// ============================================================
// ROOM PERFORMANCE TABLE
// ============================================================


function addRoomPerformance(pdf,data){



    pdf.addPage();



    addHeader(pdf);



    pdf.setFontSize(18);



    pdf.text(

        "Room Compliance Analysis",

        15,

        45

    );




    const rows =

        getRoomPerformance(data)

        .map(room=>[


            room.room,

            room.surveys,

            room.compliance+"%"

        ]);





    pdf.autoTable({


        startY:60,


        head:[

            [
                "Room",
                "Surveys",
                "Compliance"
            ]

        ],


        body:rows,


        theme:"striped",


        styles:{

            fontSize:9

        }


    });





    addFooter(pdf);


}



// ============================================================
// STAFF PERFORMANCE TABLE
// ============================================================


function addStaffPerformance(pdf,data){



    pdf.addPage();



    addHeader(pdf);



    pdf.setFontSize(18);



    pdf.text(

        "Staff Performance Analysis",

        15,

        45

    );




    const rows =

        getStaffPerformance(data)

        .map(person=>[


            person.name,

            person.surveys,

            person.compliance+"%"


        ]);





    pdf.autoTable({


        startY:60,


        head:[

            [
                "Staff",
                "Surveys",
                "Compliance"
            ]

        ],


        body:rows,


        theme:"striped",


        styles:{

            fontSize:9

        }


    });





    addFooter(pdf);


}


// ============================================================
// TASK PERFORMANCE ANALYSIS PAGE
// ============================================================

function addTaskPerformance(pdf,data){


    pdf.addPage();


    addHeader(pdf);



    pdf.setFontSize(18);


    pdf.text(
        "Task Compliance Analysis",
        15,
        45
    );



    const rows =

        getTaskPerformance(data)

        .map(task=>[

            task.task,

            task.completed,

            task.total,

            task.compliance + "%"

        ]);




    pdf.autoTable({

        startY:60,


        head:[

            [
                "Task",
                "Completed",
                "Audited",
                "Compliance"
            ]

        ],


        body:rows,


        theme:"striped",


        styles:{

            fontSize:9

        }


    });



    addFooter(pdf);


}

// ============================================================
// SHIFT PERFORMANCE ANALYSIS PAGE
// ============================================================

function addShiftPerformance(pdf,data){


    pdf.addPage();


    addHeader(pdf);


    pdf.setFontSize(18);


    pdf.text(
        "Shift Performance Analysis",
        15,
        45
    );



    const shifts =
        getShiftPerformance(data);



    const rows = Object.entries(shifts)

    .map(([shift,item])=>[

        shift,

        item.surveys,

        item.total,

        item.completed,

        item.compliance + "%"

    ]);




    pdf.autoTable({

        startY:60,


        head:[

            [
                "Shift",
                "Surveys",
                "Tasks Audited",
                "Completed",
                "Compliance"
            ]

        ],


        body:rows,


        theme:"striped",


        styles:{

            fontSize:9

        }


    });



    addFooter(pdf);


}

// ============================================================
// PROFESSIONAL REPORT ENGINE v3.0
//
// PART 3
// Final Export Controller
// PDF Assembly
// Compatibility Layer
//
// ============================================================




async function createChartImage(config){

    const canvas=document.createElement("canvas");

    canvas.width=1200;
    canvas.height=700;

    new Chart(canvas,{
        ...config,
        options:{
            responsive:false,
            animation:false,
            plugins:{
                legend:{
                    position:"bottom"
                }
            }
        }
    });

    await new Promise(resolve=>setTimeout(resolve,300));

    return canvas.toDataURL("image/png");

}


// ============================================================
// ADD PROFESSIONAL ANALYTICS CHARTS TO PDF
// ============================================================

async function addDashboardCharts(pdf, data){


    pdf.addPage();


    addHeader(pdf);



    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.setFontSize(18);


    pdf.text(
        "Cleaning Compliance Analytics",
        15,
        45
    );



    // ========================================================
    // ROOM COMPLIANCE CHART
    // ========================================================


    const roomData =
        getRoomPerformance(data)
        .slice(0,10);



    const roomCanvas =
        document.createElement("canvas");


    new Chart(
        roomCanvas,
        {

            type:"bar",

            data:{

                labels:
                    roomData.map(
                        r=>r.room
                    ),


                datasets:[{

                    label:
                        "Compliance %",


                    data:
                        roomData.map(
                            r=>r.compliance
                        ),


                    backgroundColor:
                        GDI_COLORS.primary

                }]

            },


            options:{

                responsive:false,

                plugins:{

                    legend:{
                        display:false
                    }

                }

            }

        }

    );




    pdf.setFontSize(12);

    pdf.text(
        "Room Compliance Performance",
        15,
        y
    );


    pdf.addImage(
        roomCanvas.toDataURL("image/png"),
        "PNG",
        15,
        y+5,
        175,
        70
    );


    y += 90;




    // ========================================================
    // SHIFT PERFORMANCE CHART
    // ========================================================


    const shiftData =
        getShiftPerformance(data);



    const shiftCanvas =
        document.createElement("canvas");



    new Chart(
        shiftCanvas,
        {


            type:"doughnut",


            data:{


                labels:Object.keys(
                    shiftData
                ),


                datasets:[{


                    data:Object.values(
                        shiftData
                    )
                    .map(
                        s=>s.compliance
                    ),


                    backgroundColor:[

                            GDI_COLORS.primary,
    GDI_COLORS.secondary,
    GDI_COLORS.success,
    GDI_COLORS.warning

]

                }]


            },


            options:{

                responsive:false

            }


        }

    );





    pdf.text(
        "Shift Compliance Distribution",
        15,
        y
    );



    pdf.addImage(

        shiftCanvas.toDataURL("image/png"),

        "PNG",

        35,

        y+5,

        120,

        80

    );



    y += 100;




    // ========================================================
    // TASK COMPLIANCE CHART
    // ========================================================


    pdf.addPage();


    addHeader(pdf);



    pdf.setFontSize(18);


    pdf.text(
        "Task Compliance Analysis",
        15,
        45
    );




    const taskData =
        getTaskPerformance(data);



    const taskCanvas =
        document.createElement("canvas");



    new Chart(
        taskCanvas,
        {


            type:"bar",


            data:{


                labels:
                    taskData.map(
                        t=>t.task
                    ),



                datasets:[{


                    label:
                        "Compliance %",


                    data:
                        taskData.map(
                            t=>t.compliance
                        ),



                    backgroundColor:
                        GDI_COLORS.secondary


                }]


            },


            options:{


                responsive:false,


                plugins:{


                    legend:{
                        display:false
                    }

                }


            }


        }

    );




    pdf.addImage(

        taskCanvas.toDataURL("image/png"),

        "PNG",

        15,

        60,

        175,

        80

    );



    addFooter(pdf);



}


// ============================================================
// COMPLETE SURVEY RECORD TABLE
// ============================================================


function addSurveyRecords(pdf,data){



    pdf.addPage();



    addHeader(pdf);



    pdf.setFontSize(18);



    pdf.text(

        "Survey Records",

        15,

        45

    );





    const rows = data.map(record=>{


        const completed =

            Object.values(

                record.tasks_completed || {}

            )

            .filter(
                task =>
                task==="Y"
            )
            .length;



        const total =

            Object.keys(

                record.tasks_completed || {}

            )
            .length;





        return [

            (
                record.work_date ||
                record.created_at ||
                ""
            )
            .split("T")[0],


            record.room || "",


            record.shift || "",


            record.staff || "",


            `${completed}/${total}`


        ];


    });






    pdf.autoTable({


        startY:60,


        head:[

            [

                "Date",

                "Room",

                "Shift",

                "Staff",

                "Completed"

            ]

        ],



        body:rows,



        theme:"grid",



        styles:{

            fontSize:8,

            cellPadding:2

        }


    });





    addFooter(pdf);


}









// ============================================================
// MANAGEMENT RECOMMENDATIONS
// ============================================================


function addManagementRecommendations(pdf,data){



    pdf.addPage();



    addHeader(pdf);



    pdf.setFontSize(18);



    pdf.text(

        "Management Recommendations",

        15,

        45

    );




    const kpi =

        calculateKPIs(data);




    pdf.setFontSize(11);



    const recommendations=[


        `Overall compliance level: ${kpi.compliance}%`,


        `Performance status: ${kpi.status}`,


        "Continue daily cleaning monitoring.",


        "Review lower performing rooms weekly.",


        "Provide coaching support where required.",


        "Recognize consistent high performers.",


        "Maintain audit documentation."



    ];




    let y=65;



    recommendations.forEach(item=>{


        pdf.text(

            "• " + item,

            20,

            y

        );


        y+=10;


    });





    addFooter(pdf);


}









// ============================================================
// FINAL PROFESSIONAL PDF GENERATOR
// ============================================================


window.exportProfessionalPDF = async function(filters={}){



    try {



        console.log(

            "Starting Professional PDF Export",

            filters

        );






        const rawData =

            window.DataStore

            ?

            DataStore.getAll()

            :

            [];






        if(!rawData.length){


            alert(

                "No survey data available."

            );


            return;


        }






        const reportData =

            applyReportFilters(

                rawData,

                filters

            );







        if(!reportData.length){



            alert(

                "No records found for selected period."

            );


            return;


        }







        console.log(

            "Report records:",

            reportData.length

        );







        const pdf =

            createPDF();




// PAGE ORDER

addCoverPage(pdf, reportData);

addPerformanceDashboard(pdf, reportData);

addExecutiveSummary(pdf, reportData);

addRoomPerformance(pdf, reportData);

addStaffPerformance(pdf, reportData);

addTaskPerformance(pdf, reportData);

addShiftPerformance(pdf, reportData);

await addDashboardCharts(pdf, reportData);

addSurveyRecords(pdf, reportData);

addManagementRecommendations(pdf, reportData);


        pdf.save(

            "Executive_Cleaning_Report_" +

            new Date()

            .toISOString()

            .split("T")[0]

            +

            ".pdf"

        );



        console.log(

            "✅ Professional PDF created"

        );





    }

    catch(error){



        console.error(

            "PDF generation failed:",

            error

        );



        alert(

            "Unable to generate PDF report."

        );



    }


};


    console.log(
    "✅ Professional Report Engine v3.2 Complete"
);

