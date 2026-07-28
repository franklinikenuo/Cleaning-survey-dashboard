// ============================================================
// UCDS v3.0
// ADVANCED CHART ENGINE
//
// Room Activity + Shift Distribution
// ============================================================


let roomChart = null;
let shiftChart = null;



// ============================================================
// MAIN CHART RENDER
// ============================================================

window.renderCharts = function(data){


    if(
        !data ||
        data.length === 0
    ){

        return;

    }



    renderRoomActivity(data);


    renderShiftDistribution(data);



};








// ============================================================
// ROOM ACTIVITY
// Horizontal Bar Chart
// ============================================================


function renderRoomActivity(data){



    const canvas =
        document.getElementById(
            "roomChart"
        );



    if(!canvas)
        return;





    const rooms = {};



    data.forEach(row=>{


        const room =
            row.room ||
            row.Room ||
            "Unknown";



        rooms[room] =
            (rooms[room] || 0) + 1;



    });







    const sorted =
        Object.entries(rooms)
        .sort(
            (a,b)=>b[1]-a[1]
        );





    if(roomChart){

        roomChart.destroy();

    }






    roomChart =
    new Chart(

        canvas,

        {


        type:"bar",



        data:{


            labels:
                sorted.map(
                    item=>item[0]
                ),



            datasets:[{


                label:
                "Cleaning Activities",



                data:
                sorted.map(
                    item=>item[1]
                ),



                borderWidth:1


            }]


        },



        options:{


            indexAxis:"y",



            responsive:true,



            maintainAspectRatio:false,



            plugins:{


                legend:{


                    display:false


                }


            },



            scales:{


                x:{


                    beginAtZero:true


                }


            }


        }


    });


}









// ============================================================
// SHIFT DISTRIBUTION
// Doughnut Chart
// ============================================================


function renderShiftDistribution(data){



    const canvas =
        document.getElementById(
            "shiftChart"
        );



    if(!canvas)
        return;





    const shifts = {

        Morning:0,

        Afternoon:0,

        Evening:0,

        Night:0

    };







    data.forEach(row=>{


        const shift =

            row.shift ||
            row.Shift ||
            "Unknown";



        if(shifts[shift] !== undefined){


            shifts[shift]++;


        }


    });







    if(shiftChart){

        shiftChart.destroy();

    }






    shiftChart =

    new Chart(

        canvas,

        {


        type:"doughnut",



        data:{


            labels:
            Object.keys(shifts),



            datasets:[{


                label:
                "Shift Distribution",



                data:
                Object.values(shifts),



                borderWidth:2


            }]


        },




        options:{


            responsive:true,


            maintainAspectRatio:false,



            plugins:{



                legend:{


                    position:"bottom"


                },



                tooltip:{


                    callbacks:{


                        label:function(context){


                            const total =

                            context.dataset.data
                            .reduce(
                                (a,b)=>a+b,
                                0
                            );



                            const value =
                            context.raw;



                            const percentage =

                            total ?

                            (
                                value /
                                total *
                                100

                            ).toFixed(1)

                            :

                            0;



                            return (

                                context.label +

                                ": " +

                                value +

                                " (" +

                                percentage +

                                "%)"

                            );


                        }


                    }


                }


            }


        }


    });



}







console.log(
    "✅ Advanced Chart Engine loaded"
);
