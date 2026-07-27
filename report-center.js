// ============================================================
// UCDS v3.0 — EXECUTIVE REPORTING CENTER
// Hospital Cleaning Compliance Dashboard
//
// Handles:
// - Report modal
// - Dynamic year loading
// - Month loading
// - Professional PDF
// - Weekly / Monthly / Quarterly / Annual reports
//
// Does NOT modify Supabase
// ============================================================


console.log(
    "Loading Executive Reporting Center..."
);



const REPORT_BACKEND =
    "https://cleaning-survey-api-v2-x6sf.onrender.com";



// ============================================================
// GET DASHBOARD DATA SAFELY
// ============================================================

function getReportData(){


    let data = [];



    // Primary source
    if(
        window.allData &&
        Array.isArray(window.allData)
    ){

        data =
            window.allData;

    }



    // DataStore fallback

    else if(
        window.DataStore &&
        Array.isArray(
            window.DataStore.data
        )
    ){

        data =
            window.DataStore.data;

    }



    // Another possible datastore format

    else if(
        window.DataStore &&
        Array.isArray(
            window.DataStore.records
        )
    ){

        data =
            window.DataStore.records;

    }



    return data;

}







// ============================================================
// OPEN REPORT CENTER
// ============================================================


window.openReportingCenter = async function(){



    const modal =
        document.getElementById(
            "reportModal"
        );



    if(modal){

        modal.style.display =
            "flex";

    }



    await waitForReportData();



    populateReportYears();



    populateReportMonths();



};








// ============================================================
// CLOSE REPORT CENTER
// ============================================================


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









// ============================================================
// WAIT FOR DASHBOARD DATA
// ============================================================


async function waitForReportData(){



    let attempts = 0;



    while(
        getReportData().length === 0 &&
        attempts < 20
    ){


        await new Promise(
            resolve =>
            setTimeout(
                resolve,
                300
            )
        );


        attempts++;

    }



    console.log(

        "Reporting data:",
        getReportData().length

    );


}









// ============================================================
// POPULATE YEARS
// ============================================================


window.populateReportYears = function(){



    const select =
        document.getElementById(
            "reportYear"
        );



    if(!select)
        return;



    const data =
        getReportData();



    if(!data.length){


        console.warn(
            "No survey data available"
        );


        return;

    }




    const years = [

        ...new Set(

            data.map(row=>{


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






    select.innerHTML = `

        <option value="">
            Select Year
        </option>

    `;





    years.forEach(year=>{


        select.innerHTML += `

            <option value="${year}">
                ${year}
            </option>

        `;


    });



    console.log(
        "✅ Report years loaded:",
        years
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



    select.innerHTML = `

        <option value="">
            Select Month
        </option>

    `;



    months.forEach(
        (month,index)=>{


            select.innerHTML += `

            <option value="${index+1}">
                ${month}
            </option>

            `;


        }

    );



    console.log(
        "✅ Report months loaded"
    );


};









// ============================================================
// REPORT GENERATOR
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
            year,
            month,
            type
        }
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
                "Please select a report type."
            );


    }


};









// ============================================================
// SEND REPORT
// ============================================================


async function sendReport(endpoint){



    try{


        const response =
            await fetch(
                REPORT_BACKEND + endpoint
            );



        if(!response.ok){

            throw new Error(
                "Report failed"
            );

        }




        const result =
            await response.json();





        if(
            result.status ===
            "success"
        ){

            alert(
                "Report sent successfully!"
            );

        }

        else{

            alert(
                "Report generation failed."
            );

        }



    }


    catch(error){


        console.error(
            "Report error:",
            error
        );


        alert(
            "Unable to send report."
        );


    }



}









// ============================================================
// LISTENERS
// ============================================================


document.addEventListener(
"DOMContentLoaded",
()=>{


    const type =
        document.getElementById(
            "reportType"
        );


    const year =
        document.getElementById(
            "reportYear"
        );


    const month =
        document.getElementById(
            "reportMonth"
        );





    type?.addEventListener(
        "change",
        e=>{

            console.log(
                "Report type:",
                e.target.value
            );

        }
    );





    year?.addEventListener(
        "change",
        e=>{

            console.log(
                "Report year:",
                e.target.value
            );

        }
    );





    month?.addEventListener(
        "change",
        e=>{

            console.log(
                "Report month:",
                e.target.value
            );

        }
    );



});







console.log(
    "✅ Executive Reporting Center loaded"
);
