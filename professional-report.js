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
// SHIFT ANALYSIS
// ============================================================


function getShiftPerformance(data){


    const shifts={


        Morning:0,

        Afternoon:0,

        Evening:0,

        Night:0


    };




    data.forEach(record=>{


        if(
            shifts.hasOwnProperty(
                record.shift
            )
        ){

            shifts[record.shift]++;

        }


    });



    return shifts;


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
// ADD PERFORMANCE DASHBOARD PAGE
// ============================================================


function addPerformanceDashboard(pdf,data){



    pdf.addPage();



    addHeader(pdf);



    pdf.setFontSize(18);

    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.text(
        "Performance Dashboard",
        15,
        45
    );




    const kpi =
        calculateKPIs(data);



    const cards=[


        [
            "Compliance",
            kpi.compliance+"%"
        ],


        [
            "Surveys",
            kpi.totalSurveys
        ],


        [
            "Rooms",
            kpi.totalRooms
        ],


        [
            "Staff",
            kpi.totalStaff
        ]


    ];




    let x=15;



    cards.forEach(card=>{


        pdf.roundedRect(

            x,

            60,

            40,

            30,

            3,

            3

        );



        pdf.setFontSize(10);


        pdf.text(

            card[0],

            x+20,

            72,

            {
                align:"center"
            }

        );



        pdf.setFontSize(15);



        pdf.text(

            String(card[1]),

            x+20,

            84,

            {
                align:"center"
            }

        );



        x+=45;


    });




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
// PROFESSIONAL REPORT ENGINE v3.0
//
// PART 3
// Final Export Controller
// PDF Assembly
// Compatibility Layer
//
// ============================================================



// ============================================================
// ADD DASHBOARD CHARTS TO PDF
// ============================================================


async function addDashboardCharts(pdf){



    pdf.addPage();



    addHeader(pdf);



    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.setFontSize(18);



    pdf.text(

        "Dashboard Visual Analytics",

        15,

        45

    );




    let y = 60;




    const roomCanvas =

        document.getElementById(
            "roomChart"
        );



    const shiftCanvas =

        document.getElementById(
            "shiftChart"
        );





    if(roomCanvas){



        pdf.setFontSize(13);



        pdf.text(

            "Room Activity",

            15,

            y

        );



        pdf.addImage(

            roomCanvas.toDataURL(
                "image/png"
            ),

            "PNG",

            15,

            y+5,

            175,

            70

        );



        y += 90;


    }






    if(shiftCanvas){



        pdf.text(

            "Shift Distribution",

            15,

            y

        );



        pdf.addImage(

            shiftCanvas.toDataURL(
                "image/png"
            ),

            "PNG",

            30,

            y+5,

            120,

            80

        );


    }




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

        addCoverPage(

            pdf,

            reportData

        );





        addPerformanceDashboard(

            pdf,

            reportData

        );





        addExecutiveSummary(

            pdf,

            reportData

        );





        addRoomPerformance(

            pdf,

            reportData

        );





        addStaffPerformance(

            pdf,

            reportData

        );





        await addDashboardCharts(

            pdf

        );





        addSurveyRecords(

            pdf,

            reportData

        );





        addManagementRecommendations(

            pdf,

            reportData

        );







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

    "✅ Professional Report Engine v3.0 loaded"

);
