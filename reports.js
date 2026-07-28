// ============================================================
// UCDS v3.1 — REPORT SUPPORT ENGINE
//
// Handles:
// - Report filter state
// - PDF generation bridge
// - Weekly / Monthly / Annual reports
//
// Supabase Compatible
// ============================================================


console.log(
    "Loading Report Support Engine..."
);




// ============================================================
// REPORT STATE
// ============================================================


window.currentReportFilters = {


    type:"all",

    year:null,

    month:null,

    week:null


};






// ============================================================
// UPDATE FILTER STATE
// ============================================================


window.updateReportFilters = function(filters){



    window.currentReportFilters = {


        type:
            filters.type || "all",


        year:
            filters.year
            ?
            Number(filters.year)
            :
            null,


        month:
            filters.month
            ?
            Number(filters.month)
            :
            null,


        week:
            filters.week
            ?
            Number(filters.week)
            :
            null


    };



    console.log(

        "Report filters updated:",

        window.currentReportFilters

    );


};









// ============================================================
// GENERATE REPORT
// ============================================================


window.sendReport = async function(){


    try{


        const filters =
            window.currentReportFilters;



        console.log(

            "Starting report generation:",

            filters

        );





        if(
            typeof exportProfessionalPDF !== "function"
        ){


            alert(
                "Professional PDF engine missing."
            );


            return;

        }







        await exportProfessionalPDF(

            filters

        );




        console.log(

            "✅ Report completed"

        );



    }



    catch(error){



        console.error(

            "Report generation error:",

            error

        );



        alert(

            "Unable to generate report."

        );


    }


};









// ============================================================
// REPORT CENTER LISTENERS
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



const week =
document.getElementById(
"reportWeek"
);







if(type){


type.addEventListener(

"change",

()=>{


window.currentReportFilters.type =
type.value;



}

);


}






if(year){


year.addEventListener(

"change",

()=>{


window.currentReportFilters.year =
Number(year.value);



}

);


}






if(month){


month.addEventListener(

"change",

()=>{


window.currentReportFilters.month =
Number(month.value);



}

);


}







if(week){


week.addEventListener(

"change",

()=>{


window.currentReportFilters.week =
Number(week.value);



}

);


}





console.log(

"✅ Report Support Engine Ready"

);



});
