// ============================================================
// EXECUTIVE REPORTING CENTER
// UCDS v3.1
//
// Supabase Integrated Reporting Engine
//
// Handles:
// - Report modal
// - Dynamic year/month/week selection
// - Report filters
// - Professional PDF generation
//
// NO EXTERNAL BACKEND REQUIRED
// ============================================================


console.log(
    "Loading Executive Reporting Center..."
);




// ============================================================
// OPEN REPORTING CENTER
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

    populateReportWeeks();


};






// ============================================================
// CLOSE REPORTING CENTER
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
// WAIT FOR SUPABASE DATASTORE
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
// YEAR DROPDOWN
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
// MONTH DROPDOWN
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



    select.value =
        new Date().getMonth()+1;



    console.log(
        "✅ Report months loaded"
    );


};








// ============================================================
// WEEK DROPDOWN
// ============================================================

window.populateReportWeeks = function(){


    const select =
        document.getElementById(
            "reportWeek"
        );



    if(!select)
        return;



    select.innerHTML = "";



    for(
        let week = 1;
        week <= 5;
        week++
    ){


        const option =
            document.createElement(
                "option"
            );


        option.value = week;


        option.textContent =
            "Week " + week;



        select.appendChild(
            option
        );


    }



    select.value = 1;



    console.log(
        "✅ Report weeks loaded"
    );


};







// ============================================================
// GENERATE REPORT
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



    const week =
        document.getElementById(
            "reportWeek"
        )?.value || null;





    const filters = {


        type,


        year,


        month,


        week


    };





    console.log(

        "Report Filters:",

        filters

    );






    // ========================================================
    // SEND FILTERS TO REPORT ENGINE
    // ========================================================


    if(

        typeof exportProfessionalPDF === "function"

    ){



        await exportProfessionalPDF(

            filters

        );



        console.log(

            "✅ Report generated successfully"

        );


    }

    else{


        console.error(

            "Professional PDF engine missing"

        );


        alert(

            "Professional report engine not loaded."

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
