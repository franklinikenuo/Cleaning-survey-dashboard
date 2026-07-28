// ============================================================
// EXECUTIVE REPORTING CENTER
// UCDS v3.0
// Dynamic Year / Month Reporting Engine
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
        DataStore &&
        DataStore.getAll().length
    ){


        console.log(

            "Reporting data ready:",

            DataStore.getAll().length

        );


    }

    else{


        console.warn(
            "Dashboard data still unavailable"
        );


    }


}







// ============================================================
// POPULATE REPORT YEARS
// Always show a rolling range of years
// ============================================================

window.populateReportYears = function () {

    const select = document.getElementById("reportYear");

    if (!select) return;

    select.innerHTML = "";

    const currentYear = new Date().getFullYear();

    // How many years before and after the current year to display
    const startYear = 2024;
    const endYear = currentYear + 10;

    for (let year = endYear; year >= startYear; year--) {

        const option = document.createElement("option");

        option.value = year;
        option.textContent = year;

        // Select current year by default
        if (year === currentYear) {
            option.selected = true;
        }

        select.appendChild(option);
    }

    console.log(
        `✅ Report years loaded (${startYear}-${endYear})`
    );

};






// ============================================================
// MONTH DROPDOWN
// ============================================================


window.populateReportMonths = function(){


    const month =
        document.getElementById(
            "reportMonth"
        );


    if(!month)
        return;



    console.log(
        "Report months loaded"
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




    console.log(
        "Report Filters:",
        {
            type,
            year,
            month
        }
    );





    switch(type){



        case "professional":


            if(
                typeof exportProfessionalPDF === "function"
            ){

                await exportProfessionalPDF(
                    {
                        year,
                        month
                    }
                );

            }


        break;





        case "weekly":


            await sendReport(
                "/send-weekly-report"
            );


        break;





        case "monthly":


            await sendReport(
                "/send-monthly-report"
            );


        break;





        case "quarterly":


            await sendReport(
                "/send-quarterly-report"
            );


        break;





        case "annual":


            await sendReport(
                "/send-yearly-report"
            );


        break;



        default:


            alert(
                "Please select report type"
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


});



console.log(
    "✅ Executive Reporting Center loaded"
);
