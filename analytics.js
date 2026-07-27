// ============================================================
// ADVANCED ANALYTICS ENGINE
// Phase 3B
// ============================================================


let monthlyComparisonChart = null;



window.generateAdvancedAnalytics = function(){


    generateStaffRanking();


    generateRoomHeatmap();


    generateMissedTasks();


    generateMonthlyChart();


};




// ============================================================
// STAFF RANKING TABLE
// ============================================================

function generateStaffRanking(){


    const tbody =

        document.querySelector(
            "#staffRankingTable tbody"
        );



    if(!tbody)
        return;



    const ranking =

        AnalyticsUtils

        .getStaffStats(
            DataStore.getAll()
        )

        .sort(

            (a,b)=>

            b.compliance -

            a.compliance

        );



    tbody.innerHTML = "";



    ranking.forEach(
        (person,index)=>{


        tbody.innerHTML += `

        <tr>

            <td>
                ${index + 1}
            </td>

            <td>
                ${person.name}
            </td>

            <td>
                ${person.surveys}
            </td>

            <td>
                ${person.compliance}%
            </td>

        </tr>

        `;


    });


}





// ============================================================
// ROOM COMPLIANCE HEATMAP
// ============================================================

function generateRoomHeatmap(){


    const el =

        document.getElementById(
            "roomHeatmap"
        );


    if(!el)
        return;



    const rooms =

        AnalyticsUtils

        .getRoomStats(
            DataStore.getAll()
        );



    el.innerHTML = "";



    rooms.forEach(room=>{


        let status = "bad";


        if(room.compliance >= 95){

            status = "good";

        }

        else if(room.compliance >= 85){

            status = "medium";

        }



        el.innerHTML += `


        <div class="room-box ${status}">


            ${room.room}


            <br>


            ${room.compliance}%


        </div>


        `;


    });


}





// ============================================================
// MISSED TASK ANALYSIS
// ============================================================

function generateMissedTasks(){


    const el =

        document.getElementById(
            "missedTaskList"
        );



    if(!el)
        return;



    const missed = {};



    DataStore.getAll()

    .forEach(row=>{


        Object.entries(

            row.tasks_completed || {}

        )

        .forEach(
            ([task,value])=>{


                if(value === "N"){


                    missed[task] =

                    (

                        missed[task] || 0

                    ) + 1;


                }


            }

        );


    });




    el.innerHTML = "";



    Object.entries(missed)

    .sort(

        (a,b)=>

        b[1] -

        a[1]

    )

    .forEach(([task,count])=>{


        el.innerHTML += `


        <li>

            ${task}

            :

            ${count}

            missed

        </li>


        `;


    });



}





// ============================================================
// MONTHLY COMPARISON CHART
// ============================================================

function generateMonthlyChart(){


    const canvas =

        document.getElementById(
            "monthlyComparisonChart"
        );



    if(!canvas)
        return;



    const months = {};



    DataStore.getAll()

    .forEach(row=>{


        const month =

            new Date(
                row.created_at
            )

            .toLocaleString(
                "default",
                {
                    month:"short"
                }
            );



        months[month] =

        (

            months[month] || 0

        ) + 1;


    });





    if(monthlyComparisonChart){

        monthlyComparisonChart.destroy();

    }




    monthlyComparisonChart =

    new Chart(

        canvas,

        {


            type:"line",


            data:{


                labels:

                    Object.keys(months),



                datasets:[{


                    label:

                    "Cleaning Surveys",



                    data:

                    Object.values(months)


                }]


            },


            options:{


                responsive:true,


                maintainAspectRatio:false


            }


        }

    );


}



console.log(
    "✅ Advanced analytics loaded"
);
