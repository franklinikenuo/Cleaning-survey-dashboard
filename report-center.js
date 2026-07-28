// ============================================================
// EXECUTIVE REPORTING CENTER
// UCDS v3.0
//
// Supabase Integrated Reporting Engine
//
// Handles:
// - Report modal
// - Dynamic year/month selection
// - Report filters
// - Professional PDF generation
//
// NO EXTERNAL BACKEND REQUIRED
// ============================================================


console.log(
    "Loading Executive Reporting Center..."
);





// ============================================================
// OPEN MODAL
// ============================================================

window.openReportingCenter = async function(){


    const modal =
        document.getElementById(
            "reportModal"
        );


    if(modal){

        modal.style.display = "flex";

    }



    await waitForDashboardData();


    populateReportYears();


    populateReportMonths();


};








// ============================================================
// CLOSE MODAL
// ============================================================

window.closeReportingCenter = function(){


    const modal =
        document.getElementById(
            "reportModal"
        );


    if(modal){

        modal.style.display = "none";

    }


};








// ============================================================
// WAIT FOR DATASTORE
// ============================================================

async function waitForDashboardData(){


    let attempts = 0;



    while(

        (
            !window.DataStore ||
            DataStore.getAll().length === 0
        )

        &&

        attempts < 20

    ){


        console.log(
            "Waiting for dashboard data..."
        );


        await new Promise(
            resolve =>
            setTimeout(resolve,500)
        );


        attempts++;

    }





    if(

        window.DataStore &&

        DataStore.getAll().length

    ){


        console.log(

            "Reporting data ready:",

            DataStore.getAll().length

        );


    }

    else{


        console.warn(

            "Dashboard data unavailable"

        );


    }


}









// ============================================================
// POPULATE REPORT YEARS
// ============================================================

window.populateReportYears = function(){


    const select =
        document.getElementById(
            "reportYear"
        );



    if(!select)
        return;




    select.innerHTML = "";



    const currentYear =
        new Date().getFullYear();



    const startYear = 2024;

    const endYear =
        currentYear + 10;




    for(

        let year=endYear;

        year>=startYear;

        year--

    ){


        const option =
            document.createElement(
                "option"
            );


        option.value = year;

        option.textContent = year;




        if(

            year === currentYear

        ){

            option.selected = true;

        }



        select.appendChild(
            option
        );


    }




    console.log(

        `✅ Report years loaded (${startYear}-${endYear})`

    );


};









// ============================================================
// POPULATE MONTHS
// ============================================================

window.populateReportMonths = function(){


    const select =
        document.getElementById(
            "reportMonth"
        );



    if(!select)
        return;




    select.innerHTML = "";



    const months = [


        "January",

        "February",

        "March",

        "April",

        "May",

        "June",

        "July",

        "August",

        "September",

        "October",

        "November",

        "December"


    ];





    months.forEach(

        (month,index)=>{


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                index + 1;


            option.textContent =
                month;



            select.appendChild(
                option
            );


        }

    );




    // Default current month

    select.value =
        new Date().getMonth()+1;



    console.log(

        "✅ Report months loaded"

    );


};









// ============================================================
// GENERATE SELECTED REPORT
// ============================================================

window.generateSelectedReport = async function(){



    const type =
        document.getElementById(
            "reportType"
        )?.value;



    const year =
        document.getElementById(
            "reportYear"
        )?.value;



    const month =
        document.getElementById(
            "reportMonth"
        )?.value;






    const filters = {


        type,


        year,


        month


    };







    console.log(

        "Report Filters:",

        filters

    );








    // Store filters globally

    if(

        typeof updateReportFilters === "function"

    ){


        updateReportFilters(
            filters
        );


    }

    else{


        window.currentReportFilters =
            filters;


    }








    // Generate professional report

    if(

        typeof sendReport === "function"

    ){


        await sendReport();



    }

    else{


        console.error(

            "Report generation engine missing"

        );


        alert(

            "Report engine not loaded."

        );


    }




};









// ============================================================
// INIT
// ============================================================

document.addEventListener(

"DOMContentLoaded",

()=>{


    console.log(

        "Reporting center ready"

    );


}

);





console.log(

    "✅ Executive Reporting Center loaded"

);
