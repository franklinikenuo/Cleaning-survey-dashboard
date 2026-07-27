// ============================================================
// CLEANING INTELLIGENCE ENGINE
// Phase 3C
// ============================================================


window.generateCleaningIntelligence = function(){


    const data =
        DataStore.getAll();



    let total = 0;

    let completed = 0;



    data.forEach(row=>{


        const stats =

            AnalyticsUtils

            .getTaskStats(row);



        total += stats.total;


        completed += stats.completed;


    });





    const compliance =


        total

        ?

        (

            completed /

            total *

            100

        )

        :

        0;





    // ========================================================
    // COMPLIANCE PREDICTION
    // ========================================================


    const prediction =

        Math.min(

            100,

            compliance + 2

        );



    const score =

        document.getElementById(
            "predictionScore"
        );



    if(score){


        score.innerHTML = `


            <strong>

                ${prediction.toFixed(1)}%

            </strong>


            <br>


            <small>

                Expected compliance

            </small>


        `;


    }





    // ========================================================
    // ROOM RISK ANALYSIS
    // ========================================================


    const rooms =

        AnalyticsUtils

        .getRoomStats(data);





    // ========================================================
    // HIGH RISK ROOMS
    // ========================================================


    const riskList =

        document.getElementById(
            "riskRooms"
        );



    if(riskList){


        riskList.innerHTML = "";



        rooms

        .filter(

            room =>

            room.compliance < 90

        )

        .forEach(room=>{


            riskList.innerHTML += `


            <li class="alert-item">


                <strong>

                    ${room.room}

                </strong>


                <br>


                Compliance:

                ${room.compliance}%


            </li>


            `;


        });



        if(!riskList.innerHTML){


            riskList.innerHTML = `


            <li class="insight-item">

                No high-risk rooms identified.

            </li>


            `;


        }


    }





    // ========================================================
    // SUPERVISOR ALERTS
    // ========================================================


    const alerts =

        document.getElementById(
            "supervisorAlerts"
        );



    if(alerts){


        alerts.innerHTML = "";



        if(compliance < 90){


            alerts.innerHTML += `


            <li class="alert-item">


                🚨 Critical:

                Compliance below 90%


            </li>


            `;


        }

        else if(compliance < 95){


            alerts.innerHTML += `


            <li class="alert-item">


                ⚠ Compliance below 95% target


            </li>


            `;


        }

        else {


            alerts.innerHTML += `


            <li class="insight-item">


                ✅ Compliance target achieved


            </li>


            `;


        }




    }





    // ========================================================
    // PERFORMANCE INSIGHTS
    // ========================================================


    const insights =

        document.getElementById(
            "aiInsights"
        );



    if(insights){


        insights.innerHTML = "";



        insights.innerHTML += `


        <li class="insight-item">


            Current compliance:

            <strong>

                ${compliance.toFixed(1)}%

            </strong>


        </li>


        `;




        insights.innerHTML += `


        <li class="insight-item">


            Total surveys:

            <strong>

                ${data.length}

            </strong>


        </li>


        `;





        const sortedRooms =

            [...rooms]

            .sort(

                (a,b)=>

                b.compliance -

                a.compliance

            );




        if(sortedRooms.length){


            insights.innerHTML += `


            <li class="insight-item">


                🏆 Best room:

                <strong>

                    ${sortedRooms[0].room}

                </strong>


                (${sortedRooms[0].compliance}%)


            </li>


            `;


        }




    }



};




console.log(
    "✅ Intelligence engine loaded"
);
