// ============================================================
// QUICK INSIGHTS ENGINE
// Dashboard Summary Intelligence
// ============================================================


window.renderInsights = function(data){


    const el =
        document.getElementById(
            "insightsPanel"
        );



    if(!el)
        return;





    if(!data || !data.length){


        el.innerHTML =

            "No survey data available";


        return;


    }





    // ========================================================
    // TOP ROOM
    // ========================================================


    const rooms = {};



    data.forEach(row=>{


        const room =

            row.room || "Unknown";



        rooms[room] =

            (

                rooms[room] || 0

            ) + 1;



    });





    const topRoom =

        Object.entries(rooms)

        .sort(

            (a,b)=>

            b[1] -

            a[1]

        )[0];





    // ========================================================
    // COMPLIANCE
    // ========================================================


    let totalTasks = 0;

    let completedTasks = 0;



    data.forEach(row=>{


        const stats =

            AnalyticsUtils

            .getTaskStats(row);



        totalTasks += stats.total;


        completedTasks += stats.completed;



    });





    const compliance =


        totalTasks

        ?

        Math.round(

            completedTasks /

            totalTasks *

            100

        )

        :

        0;





    // ========================================================
    // DISPLAY
    // ========================================================


    el.innerHTML = `


        <div class="insight-item">

            <strong>
            Top Room:
            </strong>

            ${

            topRoom

            ?

            topRoom[0]

            :

            "N/A"

            }

        </div>




        <div class="insight-item">

            <strong>
            Total Surveys:
            </strong>

            ${data.length}

        </div>




        <div class="insight-item">

            <strong>
            Compliance:
            </strong>

            ${compliance}%

        </div>


    `;



};




console.log(
    "✅ Insights engine loaded"
);
