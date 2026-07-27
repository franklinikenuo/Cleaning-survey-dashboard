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
// EXCEL EXPORT
// ============================================================


window.exportExcel = function(){


    const data =
        DataStore.getAll();



    if(!data.length){

        alert(
            "No survey data available."
        );

        return;

    }



    if(typeof XLSX === "undefined"){

        alert(
            "Excel library not loaded."
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

                    row.work_date || "",


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

                    )

                    :

                    0


            };


        });





    const ws =

        XLSX.utils.json_to_sheet(
            rows
        );



    const wb =

        XLSX.utils.book_new();



    XLSX.utils.book_append_sheet(

        wb,

        ws,

        "Cleaning Report"

    );



    XLSX.writeFile(

        wb,

        "Cleaning-Survey-Report.xlsx"

    );


};






// ============================================================
// ANALYTICS EXCEL EXPORT
// ============================================================


window.exportAnalyticsExcel = function(){


    exportExcel();


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
