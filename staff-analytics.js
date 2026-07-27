// ============================================================
// STAFF ANALYTICS ENGINE
// Leaderboard + Staff Performance
// ============================================================


window.renderLeaderboard = function(data){



    const el =
        document.getElementById(
            "staff-leaderboard"
        );



    if(!el)
        return;





    const ranking =

        AnalyticsUtils

        .getStaffStats(data)

        .sort(

            (a,b)=>

            b.compliance -

            a.compliance

        );





    if(!ranking.length){


        el.innerHTML =

            "No staff data available";


        return;


    }





    el.innerHTML =

        ranking

        .map(

            (staff,index)=>



`

<div class="staff-row">


    <strong>

        #${index + 1}

        ${staff.name}

    </strong>


    <br>


    Compliance:

    <b>

        ${staff.compliance}%

    </b>


    <br>


    Surveys:

    ${staff.surveys}



</div>

`

        )

        .join("");




};





// ============================================================
// OPTIONAL GLOBAL ACCESS
// Used by reports and exports
// ============================================================


window.getStaffPerformance = function(data){


    return AnalyticsUtils

        .getStaffStats(data)

        .sort(

            (a,b)=>

            b.compliance -

            a.compliance

        );


};





console.log(
    "✅ Staff analytics loaded"
);
