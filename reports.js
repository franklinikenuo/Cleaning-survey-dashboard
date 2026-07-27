// ============================================================
// UCDS v2.2 — Reports Support Engine
// Handles email report delivery actions
// ============================================================


const backend =
    "https://cleaning-survey-api-v2-x6sf.onrender.com";



// ============================================================
// RETRY FETCH WRAPPER
// ============================================================

async function getWithRetry(
    url,
    retries = 3
){

    try {

        return await fetch(url);

    }

    catch(err){


        if(retries > 0){

            await new Promise(
                resolve =>
                setTimeout(resolve,1500)
            );


            return getWithRetry(
                url,
                retries - 1
            );

        }


        throw err;

    }

}





// ============================================================
// SEND REPORT
// Weekly / Monthly / Quarterly / Annual
// ============================================================


window.sendReport = async function(endpoint){


    try {


        console.log(
            "Sending report:",
            endpoint
        );



        // wake Render server

        try {


            await fetch(
                backend,
                {
                    method:"GET"
                }
            );


        }

        catch(e){

            console.log(
                "Backend waking..."
            );

        }




        const response =
            await getWithRetry(
                `${backend}${endpoint}`
            );




        if(!response.ok){


            alert(
                "Failed to send report."
            );


            return;

        }





        const result =
            await response.json();




        if(
            result.status === "success"
        ){


            alert(
                "Report sent successfully!"
            );


        }

        else{


            alert(
                "Failed to send report."
            );


        }



    }


    catch(error){


        console.error(
            "Report error:",
            error
        );


        alert(
            "An error occurred while sending the report."
        );


    }


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


                    console.log(
                        "Report type:",
                        e.target.value
                    );


                }
            );


        }





        if(reportMonth){


            reportMonth.addEventListener(
                "change",
                e=>{


                    console.log(
                        "Report month:",
                        e.target.value
                    );


                }
            );


        }






        if(reportYear){


            reportYear.addEventListener(
                "change",
                e=>{


                    console.log(
                        "Report year:",
                        e.target.value
                    );


                }
            );


        }




        console.log(
            "✅ Reports support engine loaded"
        );


    }

);
