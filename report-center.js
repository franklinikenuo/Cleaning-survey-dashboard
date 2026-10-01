// ============================================================
// UCDS v3.2 — EXECUTIVE REPORTING CENTER
//
// Handles:
// - Report modal
// - Year/month/week selection
// - Filter collection
// - PDF launch
// - Monthly Excel export
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
        document.getElementById("reportModal");

    if(modal){

        modal.style.display = "flex";

    }

    await waitForDashboardData();

    populateReportYears();
    populateReportMonths();
    populateReportWeeks();

};


// ============================================================
// CLOSE MODAL
// ============================================================

window.closeReportingCenter = function(){

    const modal =
        document.getElementById("reportModal");

    if(modal){

        modal.style.display = "none";

    }

};


// ============================================================
// WAIT FOR DATA
// ============================================================

async function waitForDashboardData(){

    let attempts = 0;

    while(

        (!window.DataStore ||
        DataStore.getAll().length === 0)

        &&

        attempts < 20

    ){

        await new Promise(

            resolve =>
                setTimeout(resolve, 500)

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

window.populateReportYears = function(){

    const select =
        document.getElementById("reportYear");

    if(!select) return;

    select.innerHTML = "";

    const current =
        new Date().getFullYear();

    for(
        let year = current + 5;
        year >= 2024;
        year--
    ){

        const option =
            document.createElement("option");

        option.value = year;

        option.textContent = year;

        if(year === current){

            option.selected = true;

        }

        select.appendChild(option);

    }

};


// ============================================================
// MONTHS
// ============================================================

window.populateReportMonths = function(){

    const select =
        document.getElementById("reportMonth");

    if(!select) return;

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

        (month, index) => {

            const option =
                document.createElement("option");

            option.value = index + 1;

            option.textContent = month;

            select.appendChild(option);

        }

    );

    select.value =
        new Date().getMonth() + 1;

};


// ============================================================
// WEEKS
// ============================================================

window.populateReportWeeks = function(){

    const select =
        document.getElementById("reportWeek");

    if(!select) return;

    select.innerHTML = "";

    for(
        let i = 1;
        i <= 5;
        i++
    ){

        const option =
            document.createElement("option");

        option.value = i;

        option.textContent =
            "Week " + i;

        select.appendChild(option);

    }

    select.value = 1;

};


// ============================================================
// GENERATE REPORT
// ============================================================

window.generateSelectedReport = async function(){

    const typeElement = document.getElementById("reportType");
    const yearElement = document.getElementById("reportYear");
    const monthElement = document.getElementById("reportMonth");
    const weekElement = document.getElementById("reportWeek");

    const type = typeElement ? typeElement.value : "professional";
    const year = yearElement ? Number(yearElement.value) : null;
    const month = monthElement ? Number(monthElement.value) : null;
    const week = weekElement ? Number(weekElement.value) : null;

    console.log("=================================");
    console.log("REPORT CENTER SELECTION");
    console.log("Type:", type);
    console.log("Year:", year);
    console.log("Month:", month);
    console.log("Week:", week);
    console.log("=================================");

    // --------------------------------------------------------
    // VALIDATE YEAR / MONTH
    // --------------------------------------------------------

    if(!year || !month){

        alert(
            "Please select a year and month."
        );

        return;
    }

    // --------------------------------------------------------
    // UPDATE GLOBAL REPORT FILTERS
    // --------------------------------------------------------

    const filters = {
        type: type,
        year: year,
        month: month,
        week: week
    };

    if(typeof updateReportFilters === "function"){
        updateReportFilters(filters);
    }

    const status =
        document.getElementById("reportStatus");

    if(status){
        status.innerHTML =
            "Generating report...";
    }

    // --------------------------------------------------------
    // MONTHLY EXCEL REPORT
    // --------------------------------------------------------

    if(type === "excel"){

        try{

            if(typeof exportExcel !== "function"){

                throw new Error(
                    "exportExcel function is not available."
                );

            }

            console.log(
                "📊 Generating monthly Excel:",
                year,
                month
            );

            exportExcel(
                year,
                month
            );

            if(status){
                status.innerHTML =
                    "✅ Monthly Excel report complete";
            }

            return;

        }catch(error){

            console.error(
                "Excel report error:",
                error
            );

            if(status){
                status.innerHTML =
                    "❌ Excel report failed";
            }

            alert(
                "Unable to generate Excel report."
            );

            return;
        }
    }

    // --------------------------------------------------------
    // EXISTING PDF REPORTS
    // --------------------------------------------------------

    try{

        await sendReport();

        if(status){
            status.innerHTML =
                "✅ Report complete";
        }

    }catch(error){

        console.error(
            "Report generation error:",
            error
        );

        if(status){
            status.innerHTML =
                "❌ Report failed";
        }
    }
};


// ============================================================
// READY
// ============================================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        console.log(
            "✅ Reporting Center Ready"
        );

    }

);
