// ============================================================
// TABLE RENDER ENGINE
// Submission Records Table
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



};



console.log(
    "✅ Table renderer loaded"
);
