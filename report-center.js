// ============================================================
// EXECUTIVE REPORTING CENTER
// CONNECTS TO REPORT BACKEND
// ============================================================


window.openReportingCenter = function(){


    const modal =
        document.getElementById(
            "reportModal"
        );


    if(modal){

        modal.style.display = "flex";

    }

};



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
// REPORT GENERATOR
// ============================================================


window.generateSelectedReport = async function(){


    const type =
        document.getElementById(
            "reportType"
        )?.value;



    console.log(
        "Selected report:",
        type
    );



    switch(type){


        case "professional":


            if(
                typeof exportProfessionalPDF === "function"
            ){

                await exportProfessionalPDF();

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
                "Select a report type."
            );


    }


};





console.log(
    "✅ Reporting center loaded"
);
