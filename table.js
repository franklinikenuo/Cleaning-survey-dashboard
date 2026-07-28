// ============================================================
// UCDS v3.0
// TABLE RENDER ENGINE
// Hospital Grade Submission Records
// ============================================================


window.renderTable = function(data){


    const tbody =
        document.querySelector(
            "#submissions-table tbody"
        );


    if(!tbody)
        return;



    tbody.innerHTML = "";




    if(!data || !data.length){


        tbody.innerHTML = `

        <tr>

            <td colspan="6">

                No survey records found

            </td>

        </tr>

        `;


        return;

    }





    data.forEach(row=>{


        const tasks =
            formatTasks(
                row.tasks_completed ||
                row.Tasks_completed ||
                {}
            );




        const date =

            row.work_date ||

            row.created_at ||

            "";





        const tr =
            document.createElement(
                "tr"
            );




        tr.innerHTML = `


        <td>
            ${safe(row.room || row.Room)}
        </td>


        <td>
            ${safe(row.shift || row.Shift)}
        </td>


        <td>
            ${safe(row.staff || row.Staff)}
        </td>


        <td class="task-cell">
            ${tasks}
        </td>


        <td>
            ${safe(row.notes || row.Notes)}
        </td>


        <td>
            ${date.split("T")[0]}
        </td>


        `;




        tbody.appendChild(tr);



    });



};







// ============================================================
// FORMAT TASKS
// ============================================================


function formatTasks(tasks){


    if(!tasks)
        return "-";



    return Object.entries(tasks)

        .map(([name,value])=>{


            if(
                value === true ||
                value === "Yes" ||
                value === "YES"
            ){

                return `
                <span class="task-complete">
                ✅ ${name}
                </span>
                `;

            }


            if(
                value === false ||
                value === "No" ||
                value === "NO"
            ){

                return `
                <span class="task-failed">
                ❌ ${name}
                </span>
                `;

            }


            return `
            <span>
            ⚪ ${name}: ${value}
            </span>
            `;


        })

        .join("<br>");



}








// ============================================================
// SAFE TEXT OUTPUT
// ============================================================


function safe(value){


    if(!value)
        return "";


    return String(value)

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        );


}






console.log(
    "✅ Hospital Grade Table Renderer loaded"
);
