// ============================================================
// UCDS v3.1 — EXECUTIVE REPORTING CENTER
//
// Handles:
// - Report modal
// - Year/month/week selection
// - Filter collection
// - PDF launch
//
// Supabase Integrated
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

modal.style.display="flex";

}



await waitForDashboardData();



populateReportYears();

populateReportMonths();

populateReportWeeks();



};







// ============================================================
// CLOSE MODAL
// ============================================================


window.closeReportingCenter=function(){



const modal =
document.getElementById(
"reportModal"
);



if(modal){

modal.style.display="none";

}



};









// ============================================================
// WAIT DATA
// ============================================================


async function waitForDashboardData(){


let attempts=0;



while(

(!window.DataStore ||
DataStore.getAll().length===0)

&&

attempts < 20

){


await new Promise(

resolve=>

setTimeout(resolve,500)

);


attempts++;


}





console.log(

"Reporting data:",

DataStore?.getAll()?.length || 0

);



}









// ============================================================
// YEARS
// ============================================================


window.populateReportYears=function(){



const select =
document.getElementById(
"reportYear"
);



if(!select)return;



select.innerHTML="";



const current =
new Date().getFullYear();



for(
let year=current+5;
year>=2024;
year--
){


const option =
document.createElement(
"option"
);


option.value=year;

option.textContent=year;



if(year===current)

option.selected=true;



select.appendChild(option);



}



};








// ============================================================
// MONTHS
// ============================================================


window.populateReportMonths=function(){



const select =
document.getElementById(
"reportMonth"
);



if(!select)return;



select.innerHTML="";



const months=[

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


option.value=index+1;

option.textContent=month;



select.appendChild(option);



}

);



select.value =
new Date().getMonth()+1;



};








// ============================================================
// WEEKS
// ============================================================


window.populateReportWeeks=function(){



const select =
document.getElementById(
"reportWeek"
);



if(!select)return;



select.innerHTML="";



for(
let i=1;
i<=5;
i++
){


const option =
document.createElement(
"option"
);


option.value=i;

option.textContent=
"Week "+i;



select.appendChild(option);



}



select.value=1;



};









// ============================================================
// GENERATE REPORT
// ============================================================


window.generateSelectedReport = async function(){



const filters={


type:
document.getElementById(
"reportType"
)?.value || "all",



year:
Number(
document.getElementById(
"reportYear"
)?.value
),



month:
Number(
document.getElementById(
"reportMonth"
)?.value
),



week:
Number(
document.getElementById(
"reportWeek"
)?.value
)



};





console.log(

"Selected report filters:",

filters

);







if(
typeof updateReportFilters==="function"
){

updateReportFilters(filters);

}






const status =
document.getElementById(
"reportStatus"
);



if(status){

status.innerHTML=
"Generating report...";

}





try{


await sendReport();



if(status){

status.innerHTML=
"✅ Report complete";

}



}

catch(error){


console.error(error);


if(status){

status.innerHTML=
"❌ Report failed";

}


}



};









document.addEventListener(

"DOMContentLoaded",

()=>{


console.log(

"✅ Reporting Center Ready"

);


}

);
