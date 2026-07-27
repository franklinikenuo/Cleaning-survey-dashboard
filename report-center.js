// ============================================================
// EXECUTIVE REPORTING CENTER
// REPORT CONTROL + FILTER INITIALIZATION
// ============================================================


console.log(
    "Loading Executive Reporting Center..."
);



// ============================================================
// OPEN REPORT MODAL
// ============================================================

window.openReportingCenter = function(){


    const modal =
        document.getElementById(
            "reportModal"
        );


    if(modal){

        modal.style.display = "flex";

    }


    populateReportYears();

    populateReportMonths();


};




// ============================================================
// CLOSE REPORT MODAL
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
// POPULATE YEAR DROPDOWN
// ============================================================

window.populateReportYears = function(){


    const select =
        document.getElementById(
            "reportYear"
        );


    if(!select){

        console.warn(
            "⚠️ reportYear dropdown missing"
        );

        return;

    }



    if(
        typeof allData === "undefined" ||
        !allData.length
    ){

        console.warn(
            "⚠️ No survey data available"
        );

        return;

    }




    const years = [

        ...new Set(

            allData.map(row=>{


                const date =
                    row.work_date ||
                    row.created_at;


                if(!date)
                    return null;



                return new Date(date)
                    .getFullYear();


            })

            .filter(Boolean)

        )

    ]

    .sort(
        (a,b)=>b-a
    );




    select.innerHTML = "";



    years.forEach(year=>{


        const option =
            document.createElement(
                "option"
            );


        option.value =
            year;


        option.textContent =
            year;



        select.appendChild(
            option
        );


    });



    console.log(
        "✅ Report years loaded:",
        years
    );


};




// ============================================================
// POPULATE MONTH DROPDOWN
// ============================================================

window.populateReportMonths = function(){


    const select =
        document.getElementById(
            "reportMonth"
        );


    if(!select){

        console.warn(
            "⚠️ reportMonth dropdown missing"
        );

        return;

    }



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



    select.innerHTML = "";



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



    const currentMonth =
        new Date()
        .getMonth()+1;



    select.value =
        currentMonth;



    console.log(
        "✅ Report months loaded"
    );


};




// ============================================================
// GET REPORT FILTERS
// ============================================================

window.getReportFilters = function(){


    return {


        year:
            document.getElementById(
                "reportYear"
            )?.value,


        month:
            document.getElementById(
                "reportMonth"
            )?.value,


        type:
            document.getElementById(
                "reportType"
            )?.value



    };


};




// ============================================================
// REPORT GENERATOR
// ============================================================


window.generateSelectedReport = async function(){



    const filters =
        getReportFilters();



    console.log(
        "Report Filters:",
        filters
    );



    const type =
        filters.type;



    if(!type){


        alert(
            "Please select a report type."
        );


        return;

    }





    switch(type){



        case "professional":



            if(
                typeof exportProfessionalPDF === "function"
            ){


                await exportProfessionalPDF();



            }
            else{


                console.error(
                    "exportProfessionalPDF missing"
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
                "Unknown report type."
            );



    }


};




// ============================================================
// AUTO INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    ()=>{


        console.log(
            "✅ Reporting center ready"
        );


    }

);



console.log(
    "✅ Executive Reporting Center loaded"
);
