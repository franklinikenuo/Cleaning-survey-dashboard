// ============================================================
// EXECUTIVE REPORTING CENTER
// ============================================================


window.openReportingCenter = function(){


    const modal =

        document.getElementById(
            "reportModal"
        );


    if(modal){

        modal.style.display =
            "flex";

    }


};





window.closeReportingCenter = function(){


    const modal =

        document.getElementById(
            "reportModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }


};






window.generateSelectedReport = async function(){



    const type =

        document.getElementById(
            "reportType"
        )?.value;



    console.log(

        "Generating report:",

        type

    );





    switch(type){



        case "professional":



            if(
                typeof exportProfessionalPDF ===
                "function"
            ){

                await exportProfessionalPDF();

            }

            break;





        case "weekly":


            alert(
                "Weekly report engine ready for connection."
            );


            break;





        case "monthly":


            alert(
                "Monthly report engine ready for connection."
            );


            break;





        case "quarterly":


            alert(
                "Quarterly report engine ready for connection."
            );


            break;





        case "annual":


            alert(
                "Annual report engine ready for connection."
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
