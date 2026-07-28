// ============================================================
// UCDS v3.0 — TABLE RENDER ENGINE
//
// Optimized Submission Records Table
//
// Features:
// - Initial load: latest 25 records
// - Expand / collapse full dataset
// - Mobile friendly
// - Keeps existing dashboard structure
// ============================================================


let tableExpanded = false;

let currentTableData = [];

const TABLE_LIMIT = 25;





// ============================================================
// RENDER TABLE
// ============================================================


window.renderTable = function(data){



    const tbody =
        document.querySelector(
            "#submissions-table tbody"
        );



    if(!tbody)
        return;




    currentTableData = data || [];




    tbody.innerHTML = "";




    if(
        !data ||
        !data.length
    ){


        tbody.innerHTML = `

        <tr>

            <td colspan="6">

                No survey records found

            </td>

        </tr>

        `;


        removeTableButton();

        return;

    }






    let displayData;



    if(tableExpanded){


        displayData = data;


    }

    else{


        displayData =
            data.slice(
                0,
                TABLE_LIMIT
            );


    }






    displayData.forEach(row=>{



        const tasks =

            Object.entries(
                row.tasks_completed || {}
            )

            .map(
                ([name,value]) =>
                `${name}:${value}`
            )

            .join(" | ");







        const date =

            row.work_date ||

            (
                row.created_at || ""
            )
            .split("T")[0];







        const tr =
            document.createElement(
                "tr"
            );





        tr.innerHTML = `


        <td>
            ${row.room || ""}
        </td>


        <td>
            ${row.shift || ""}
        </td>


        <td>
            ${row.staff || ""}
        </td>


        <td>
            ${tasks}
        </td>


        <td>
            ${row.notes || ""}
        </td>


        <td>
            ${date}
        </td>


        `;





        tbody.appendChild(tr);



    });





    updateTableButton();



};









// ============================================================
// VIEW ALL BUTTON
// ============================================================


function updateTableButton(){



    let button =
        document.getElementById(
            "tableToggleButton"
        );



    if(
        currentTableData.length <= TABLE_LIMIT
    ){


        removeTableButton();

        return;


    }






    if(!button){


        button =
            document.createElement(
                "button"
            );


        button.id =
            "tableToggleButton";



        button.className =
            "btn table-toggle";



        const table =
            document.querySelector(
                "#submissions-table"
            );



        if(table){


            table.parentElement.appendChild(
                button
            );


        }


    }





    if(tableExpanded){


        button.innerHTML =
            "▲ Show Latest 25 Records";



    }

    else{


        button.innerHTML =
            `▼ View All ${currentTableData.length} Records`;



    }







    button.onclick = ()=>{


        tableExpanded =
            !tableExpanded;



        renderTable(
            currentTableData
        );


    };



}









function removeTableButton(){


    const button =
        document.getElementById(
            "tableToggleButton"
        );



    if(button){


        button.remove();


    }


}









console.log(

    "✅ Optimized Table Renderer loaded"

);
