// ============================================================
// CHART ENGINE
// Room Activity + Shift Distribution
// ============================================================


let roomChart = null;

let shiftChart = null;



window.renderCharts = function(data){



    const roomCanvas =
        document.getElementById(
            "roomChart"
        );



    const shiftCanvas =
        document.getElementById(
            "shiftChart"
        );



    if(
        !roomCanvas ||
        !shiftCanvas
    ){

        return;

    }





    if(
        !data ||
        !data.length
    ){

        return;

    }





    // ========================================================
    // ROOM ACTIVITY BAR CHART
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





    if(roomChart){

        roomChart.destroy();

    }





    roomChart = new Chart(

        roomCanvas,

        {

            type:"bar",


            data:{


                labels:
                    Object.keys(rooms),



                datasets:[{


                    label:
                    "Room Activity",



                    data:
                    Object.values(rooms)



                }]


            },


            options:{


                responsive:true,


                maintainAspectRatio:false


            }


        }


    );







    // ========================================================
    // SHIFT DISTRIBUTION PIE CHART
    // ========================================================


    const shifts = [

        "Morning",

        "Afternoon",

        "Evening",

        "Night"

    ];





    if(shiftChart){

        shiftChart.destroy();

    }





    shiftChart = new Chart(

        shiftCanvas,

        {


            type:"pie",



            data:{



                labels:shifts,



                datasets:[{


                    label:
                    "Shift Distribution",



                    data:

                    shifts.map(

                        shift =>

                        data.filter(

                            row =>

                            row.shift === shift

                        )

                        .length

                    )


                }]



            },


            options:{


                responsive:true,


                maintainAspectRatio:false


            }


        }


    );



};




console.log(
    "✅ Chart engine loaded"
);
