// ============================================================
// UCDS v3.0 — REPORT SUPPORT ENGINE
// Supabase Reporting Integration
//
// Handles:
// - Report filter collection
// - Professional PDF generation
// - Reporting Center actions
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

    month:null

};







// ============================================================
// SEND / GENERATE REPORT
// Weekly / Monthly / Quarterly / Annual
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

                "PDF reporting engine is not loaded."

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
// Called by Reporting Center
// ============================================================


window.updateReportFilters = function(filters){



    window.currentReportFilters = {



        type:

            filters.type || "all",



        year:

            filters.year || null,



        month:

            filters.month || null



    };




    console.log(

        "Report Filters Updated:",

        window.currentReportFilters

    );



};









// ============================================================
// REPORT FILTER MONITORING
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






    console.log(

        "✅ Supabase Report Support Engine Loaded"

    );



});
