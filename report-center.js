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

    console.log("=================================");
    console.log("📊 REPORT CENTER GENERATE");
    console.log("=================================");


    // --------------------------------------------------------
    // GET REPORTING CENTER CONTROLS
    // --------------------------------------------------------

    const typeElement =
        document.getElementById("reportType");

    const yearElement =
        document.getElementById("reportYear");

    const monthElement =
        document.getElementById("reportMonth");

    const weekElement =
        document.getElementById("reportWeek");


    // --------------------------------------------------------
    // VERIFY CONTROLS EXIST
    // --------------------------------------------------------

    if(!yearElement){

        console.error(
            "❌ reportYear element not found."
        );

        alert(
            "The reporting year selector could not be found."
        );

        return;

    }


    if(!monthElement){

        console.error(
            "❌ reportMonth element not found."
        );

        alert(
            "The reporting month selector could not be found."
        );

        return;

    }


    // --------------------------------------------------------
    // READ VALUES DIRECTLY FROM DROPDOWNS
    // --------------------------------------------------------

    const type =
        typeElement
            ? typeElement.value
            : "professional";


    const yearRaw =
        yearElement.value;


    const monthRaw =
        monthElement.value;


    const weekRaw =
        weekElement
            ? weekElement.value
            : "1";


    const year =
        Number(yearRaw);


    const month =
        Number(monthRaw);


    const week =
        Number(weekRaw);


    // --------------------------------------------------------
    // DEBUG
    // --------------------------------------------------------

    console.log(
        "Report Type:",
        type
    );

    console.log(
        "Year raw:",
        yearRaw
    );

    console.log(
        "Month raw:",
        monthRaw
    );

    console.log(
        "Year:",
        year
    );

    console.log(
        "Month:",
        month
    );

    console.log(
        "Week:",
        week
    );


    // --------------------------------------------------------
    // VALIDATE YEAR
    // --------------------------------------------------------

    if(
        yearRaw === "" ||
        yearRaw === null ||
        yearRaw === undefined ||
        !Number.isInteger(year)
    ){

        alert(
            "Please select a year."
        );

        return;

    }


    // --------------------------------------------------------
    // VALIDATE MONTH
    // --------------------------------------------------------

    if(
        monthRaw === "" ||
        monthRaw === null ||
        monthRaw === undefined ||
        !Number.isInteger(month) ||
        month < 1 ||
        month > 12
    ){

        alert(
            "Please select a month."
        );

        return;

    }


    // --------------------------------------------------------
    // UPDATE GLOBAL REPORT FILTERS
    // --------------------------------------------------------

    window.currentReportFilters = {

        type: type,

        year: year,

        month: month,

        week: week

    };


    console.log(
        "✅ currentReportFilters:",
        window.currentReportFilters
    );


    // --------------------------------------------------------
    // ALSO CALL EXISTING FILTER HANDLER
    // --------------------------------------------------------

    if(
        typeof updateReportFilters === "function"
    ){

        updateReportFilters(
            window.currentReportFilters
        );

    }


    // --------------------------------------------------------
    // REPORT STATUS
    // --------------------------------------------------------

    const status =
        document.getElementById(
            "reportStatus"
        );


    if(status){

        status.innerHTML =
            "Generating report...";

    }


    // ========================================================
    // MONTHLY EXCEL REPORT
    // ========================================================

    if(type === "excel"){

        try{

            if(
                typeof exportExcel !== "function"
            ){

                throw new Error(
                    "exportExcel function is not available."
                );

            }


            console.log(
                "📊 Generating monthly Excel report"
            );

            console.log(
                "Selected year:",
                year
            );

            console.log(
                "Selected month:",
                month
            );


            // ------------------------------------------------
            // DIRECT EXPORT
            // ------------------------------------------------

            exportExcel(
                year,
                month
            );


            if(status){

                status.innerHTML =
                    "✅ Monthly Excel report complete";

            }


            console.log(
                "✅ Monthly Excel export completed"
            );


            return;


        }
        catch(error){

            console.error(
                "❌ Excel report error:",
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


    // ========================================================
    // EXISTING PDF REPORTS
    // ========================================================

    try{

        await sendReport();


        if(status){

            status.innerHTML =
                "✅ Report complete";

        }

    }
    catch(error){

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
