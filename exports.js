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
// ============================================================

window.exportExcel = function(year, month){

    const allData = DataStore.getAll();

    if(!allData.length){
        alert("No survey data available.");
        return;
    }

    if(typeof XLSX === "undefined"){
        alert("Excel library not loaded.");
        return;
    }

    // Use selected Reporting Center values
    const selectedYear = Number(year);
    const selectedMonth = Number(month);

    if(!selectedYear || !selectedMonth){
        alert("Please select a year and month.");
        return;
    }

    // --------------------------------------------------------
    // FILTER BY DATE
    // Use the YYYY-MM-DD portion directly.
    // This avoids timezone problems with new Date("YYYY-MM-DD")
    // --------------------------------------------------------

    const monthlyData = allData.filter(row => {

        const dateValue =
            row.work_date ||
            row.created_at ||
            "";

        if(!dateValue){
            return false;
        }

        const dateString = String(dateValue).substring(0,10);

        const parts = dateString.split("-");

        if(parts.length !== 3){
            return false;
        }

        const rowYear = Number(parts[0]);
        const rowMonth = Number(parts[1]);

        return (
            rowYear === selectedYear &&
            rowMonth === selectedMonth
        );
    });

    // --------------------------------------------------------
    // NO DATA
    // --------------------------------------------------------

    if(!monthlyData.length){

        const monthName = new Date(
            selectedYear,
            selectedMonth - 1,
            1
        ).toLocaleString("en-CA",{
            month:"long"
        });

        alert(
            `No survey data found for ${monthName} ${selectedYear}.`
        );

        console.log(
            `❌ No survey data found for ${monthName} ${selectedYear}`
        );

        console.log(
            "Selected filters:",
            {
                year:selectedYear,
                month:selectedMonth
            }
        );

        return;
    }

    // --------------------------------------------------------
    // RAW DATA
    // Keep the complete Supabase survey record
    // --------------------------------------------------------

    const rows = monthlyData.map(row => ({
        ...row
    }));

    // --------------------------------------------------------
    // CREATE EXCEL
    // --------------------------------------------------------

    const ws = XLSX.utils.json_to_sheet(rows);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Survey Data"
    );

    // --------------------------------------------------------
    // FILE NAME
    // --------------------------------------------------------

    const monthName = new Date(
        selectedYear,
        selectedMonth - 1,
        1
    ).toLocaleString("en-CA",{
        month:"long"
    });

    const fileName =
        `Cleaning-Survey-Report-${monthName}-${selectedYear}.xlsx`;

    XLSX.writeFile(
        wb,
        fileName
    );

    // --------------------------------------------------------
    // LOG
    // --------------------------------------------------------

    console.log(
        `✅ Excel report generated: ${fileName}`
    );

    console.log(
        `📊 Records exported: ${monthlyData.length}`
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
