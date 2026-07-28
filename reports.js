// ============================================================
// UCDS v3.0 — REPORT SUPPORT ENGINE
// Supabase Reporting Integration
//
// Handles:
// - Report filters
// - Weekly / Monthly / Annual reports
// - Professional PDF generation
//
// NO EXTERNAL BACKEND REQUIRED
// ============================================================


console.log(
    "Loading Supabase Report Support Engine..."
);




// ============================================================
// CURRENT REPORT STATE
// ============================================================


window.currentReportFilters = {


    type:"all",

    year:null,

    month:null,

    week:null


};







// ============================================================
// GENERATE REPORT
// ============================================================


window.sendReport = async function(){



    try {



        const filters =
            window.currentReportFilters || {};




        console.log(

            "Generating report with filters:",

            filters

        );





        if(
            typeof exportProfessionalPDF !== "function"
        ){


            console.error(

                "Professional PDF engine missing"

            );


            alert(
                "PDF reporting engine not loaded."
            );


            return;

        }







        await exportProfessionalPDF(

            filters

        );






        console.log(

            "✅ Report generated successfully"

        );



    }



    catch(error){


        console.error(

            "Report generation failed:",

            error

        );



        alert(

            "Unable to generate report."

        );


    }



};









// ============================================================
// UPDATE REPORT FILTERS
// ============================================================


window.updateReportFilters = function(filters){



    window.currentReportFilters = {



        type:

            filters.type || "all",



        year:

            filters.year || null,



        month:

            filters.month || null,



        week:

            filters.week || null



    };





    console.log(

        "Report Filters Updated:",

        window.currentReportFilters

    );



};












// ============================================================
// LISTEN TO REPORT CENTER CHANGES
// ============================================================


document.addEventListener(

"DOMContentLoaded",

()=>{



const reportType =
document.getElementById(
    "reportType"
);



const reportMonth =
document.getElementById(
    "reportMonth"
);



const reportYear =
document.getElementById(
    "reportYear"
);



const reportWeek =
document.getElementById(
    "reportWeek"
);








if(reportType){


reportType.addEventListener(

"change",

e=>{


window.currentReportFilters.type =
e.target.value;



console.log(
"Report Type:",
e.target.value
);


}

);


}









if(reportMonth){


reportMonth.addEventListener(

"change",

e=>{


window.currentReportFilters.month =
e.target.value;



console.log(
"Report Month:",
e.target.value
);


}

);


}









if(reportYear){


reportYear.addEventListener(

"change",

e=>{


window.currentReportFilters.year =
e.target.value;



console.log(
"Report Year:",
e.target.value
);


}

);


}









if(reportWeek){


reportWeek.addEventListener(

"change",

e=>{


window.currentReportFilters.week =
e.target.value;



console.log(
"Report Week:",
e.target.value
);


}

);


}








console.log(

"✅ Supabase Report Support Engine Loaded"

);



});
