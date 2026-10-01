// ============================================================
// EXPORT ENGINE
// CSV / EXCEL / PDF
// ============================================================



window.toggleExportMenu = function(){


    const menu =

        document.getElementById(
            "exportDropdown"
        );



    if(menu){

        menu.classList.toggle(
            "open"
        );

    }


};





window.closeExportMenu = function(){


    const menu =

        document.getElementById(
            "exportDropdown"
        );



    if(menu){

        menu.classList.remove(
            "open"
        );

    }


};





// ============================================================
// CSV EXPORT
// ============================================================


window.exportCSV = function(){


    const data =
        DataStore.getAll();



    if(!data.length){

        alert(
            "No survey data available."
        );

        return;

    }



    const rows =

        data.map(row=>{


            const stats =

                AnalyticsUtils

                .getTaskStats(row);



            return {


                Date:

                    row.work_date ||

                    (row.created_at || "")
                    .split("T")[0],


                Room:

                    row.room || "",


                Staff:

                    row.staff || "",


                Shift:

                    row.shift || "",


                CompletedTasks:

                    stats.completed,


                TotalTasks:

                    stats.total,


                Compliance:

                    stats.total

                    ?

                    Math.round(

                        stats.completed /

                        stats.total *

                        100

                    ) + "%"

                    :

                    "0%",


                Notes:

                    row.notes || ""


            };


        });





    const csv = [

        Object.keys(rows[0]).join(","),


        ...rows.map(row=>


            Object.values(row)

            .map(value=>

                `"${String(value)
                .replace(/"/g,'""')}"`

            )

            .join(",")


        )


    ].join("\n");





    const blob =

        new Blob(

            [csv],

            {
                type:
                "text/csv"
            }

        );




    const url =

        URL.createObjectURL(
            blob
        );



    const link =

        document.createElement(
            "a"
        );



    link.href = url;


    link.download =
        "Cleaning-Survey-Report.csv";



    link.click();



    URL.revokeObjectURL(url);


};


// ============================================================
// MONTHLY RAW EXCEL EXPORT
// Exports ONLY the selected month
// Reads directly from Executive Reporting Center when needed
// ============================================================

window.exportExcel = function(year, month){

    console.log("=================================");
    console.log("📊 EXCEL EXPORT STARTED");
    console.log("=================================");


    // --------------------------------------------------------
    // GET DATA
    // --------------------------------------------------------

    const allData =
        DataStore.getAll();


    if(!allData || !allData.length){

        alert(
            "No survey data available."
        );

        console.error(
            "❌ DataStore contains no survey records."
        );

        return;

    }


    // --------------------------------------------------------
    // CHECK XLSX LIBRARY
    // --------------------------------------------------------

    if(typeof XLSX === "undefined"){

        alert(
            "Excel library not loaded."
        );

        console.error(
            "❌ XLSX library is not available."
        );

        return;

    }


    // --------------------------------------------------------
    // GET YEAR
    //
    // Priority:
    // 1. Function argument
    // 2. Reporting Center #reportYear
    // --------------------------------------------------------

    let selectedYear =
        year;


    if(
        selectedYear === undefined ||
        selectedYear === null ||
        selectedYear === ""
    ){

        const yearElement =
            document.getElementById(
                "reportYear"
            );


        if(yearElement){

            selectedYear =
                yearElement.value;

        }

    }


    // --------------------------------------------------------
    // GET MONTH
    //
    // Priority:
    // 1. Function argument
    // 2. Reporting Center #reportMonth
    // --------------------------------------------------------

    let selectedMonth =
        month;


    if(
        selectedMonth === undefined ||
        selectedMonth === null ||
        selectedMonth === ""
    ){

        const monthElement =
            document.getElementById(
                "reportMonth"
            );


        if(monthElement){

            selectedMonth =
                monthElement.value;

        }

    }


    // --------------------------------------------------------
    // NORMALIZE
    // --------------------------------------------------------

    selectedYear =
        Number(selectedYear);


    selectedMonth =
        Number(selectedMonth);


    // --------------------------------------------------------
    // DEBUG
    // --------------------------------------------------------

    console.log(
        "Selected Year:",
        selectedYear
    );

    console.log(
        "Selected Month:",
        selectedMonth
    );


    // --------------------------------------------------------
    // VALIDATE
    // --------------------------------------------------------

    if(
        !Number.isInteger(selectedYear) ||
        selectedYear < 2000
    ){

        alert(
            "Please select a year."
        );

        console.error(
            "❌ Invalid year:",
            selectedYear
        );

        return;

    }


    if(
        !Number.isInteger(selectedMonth) ||
        selectedMonth < 1 ||
        selectedMonth > 12
    ){

        alert(
            "Please select a month."
        );

        console.error(
            "❌ Invalid month:",
            selectedMonth
        );

        return;

    }


    // --------------------------------------------------------
    // FILTER BY DATE
    //
    // Uses YYYY-MM-DD directly.
    // Avoids timezone problems.
    // --------------------------------------------------------

    const monthlyData =
        allData.filter(row => {

            const dateValue =
                row.work_date ||
                row.created_at ||
                "";


            if(!dateValue){

                return false;

            }


            const dateString =
                String(dateValue)
                .substring(0,10);


            const parts =
                dateString.split("-");


            if(parts.length !== 3){

                return false;

            }


            const rowYear =
                Number(parts[0]);


            const rowMonth =
                Number(parts[1]);


            return (

                rowYear === selectedYear &&

                rowMonth === selectedMonth

            );

        });


    // --------------------------------------------------------
    // MONTH NAME
    // --------------------------------------------------------

    const monthName =
        new Date(
            selectedYear,
            selectedMonth - 1,
            1
        ).toLocaleString(
            "en-CA",
            {
                month:"long"
            }
        );


    // --------------------------------------------------------
    // NO DATA
    // --------------------------------------------------------

    if(!monthlyData.length){

        alert(
            `No survey data found for ${monthName} ${selectedYear}.`
        );


        console.warn(
            `⚠️ No survey data found for ${monthName} ${selectedYear}`
        );


        console.log(
            "Export filters:",
            {
                year:selectedYear,
                month:selectedMonth
            }
        );


        console.log(
            "Total records available:",
            allData.length
        );


        return;

    }


    // --------------------------------------------------------
    // CREATE RAW EXCEL DATA
    // --------------------------------------------------------

    const rows =
        monthlyData.map(row => ({
            ...row
        }));


    // --------------------------------------------------------
    // CREATE WORKSHEET
    // --------------------------------------------------------

    const ws =
        XLSX.utils.json_to_sheet(
            rows
        );


    // --------------------------------------------------------
    // CREATE WORKBOOK
    // --------------------------------------------------------

    const wb =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Survey Data"
    );


    // --------------------------------------------------------
    // FILE NAME
    // --------------------------------------------------------

    const fileName =
        `Cleaning-Survey-Report-${monthName}-${selectedYear}.xlsx`;


    // --------------------------------------------------------
    // WRITE FILE
    // --------------------------------------------------------

    XLSX.writeFile(
        wb,
        fileName
    );


    // --------------------------------------------------------
    // SUCCESS LOG
    // --------------------------------------------------------

    console.log(
        "================================="
    );

    console.log(
        "✅ EXCEL REPORT GENERATED"
    );

    console.log(
        "File:",
        fileName
    );

    console.log(
        "Year:",
        selectedYear
    );

    console.log(
        "Month:",
        monthName
    );

    console.log(
        "Records exported:",
        monthlyData.length
    );

    console.log(
        "================================="

    );

};


// ============================================================
// ANALYTICS EXCEL EXPORT
// Uses Reporting Center year/month
// ============================================================

window.exportAnalyticsExcel = function(){

    const filters =
        window.currentReportFilters || {};

    exportExcel(
        filters.year,
        filters.month
    );
};



// ============================================================
// DASHBOARD PDF EXPORT
// ============================================================


window.exportPDF = async function(){



    const dashboard =

        document.querySelector(
            ".main-layout"
        );



    if(!dashboard){

        alert(
            "Dashboard area not found"
        );

        return;

    }



    const canvas =

        await html2canvas(

            dashboard,

            {
                scale:2
            }

        );



    const imgData =

        canvas.toDataURL(
            "image/png"
        );



    const pdf =

        new jspdf.jsPDF(
            "portrait",
            "mm",
            "a4"
        );



    pdf.text(

        "Cleaning Compliance Dashboard",

        15,

        15

    );



    pdf.addImage(

        imgData,

        "PNG",

        10,

        25,

        190,

        0

    );



    pdf.save(

        "Cleaning_Dashboard_Report.pdf"

    );


};





console.log(
    "✅ Export engine loaded"
);
