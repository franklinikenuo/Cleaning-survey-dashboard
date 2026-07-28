// ============================================================
// UCDS v3.0 — CHART ENGINE
//
// Optimized Dashboard Charts
//
// - Room Activity
// - Shift Distribution
//
// Improvements:
// - Cleaner visuals
// - Reduced overcrowding
// - Better labels
// - Better mobile support
// ============================================================


let roomChart = null;

let shiftChart = null;





// ============================================================
// RENDER ALL CHARTS
// ============================================================


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






    renderRoomActivity(
        data,
        roomCanvas
    );




    renderShiftDistribution(
        data,
        shiftCanvas
    );



};









// ============================================================
// ROOM ACTIVITY BAR CHART
// ============================================================


function renderRoomActivity(data,canvas){



    const roomCounts = {};




    data.forEach(row=>{


        const room =
            row.room ||
            "Unknown";



        roomCounts[room] =
            (
                roomCounts[room] || 0
            )
            +
            1;



    });







    // Sort busiest rooms first

    const sortedRooms =

        Object.entries(roomCounts)

        .sort(

            (a,b)=>

            b[1]-a[1]

        );







    // Display maximum 10 rooms

    const topRooms =
        sortedRooms.slice(
            0,
            10
        );






    const labels =
        topRooms.map(
            item=>item[0]
        );




    const values =
        topRooms.map(
            item=>item[1]
        );









    if(roomChart){

        roomChart.destroy();

    }








    roomChart = new Chart(

        canvas,

        {


        type:"bar",



        data:{


            labels,


            datasets:[{


                label:
                "Completed Surveys",


                data:values



            }]



        },





        options:{



            responsive:true,


            maintainAspectRatio:false,



            plugins:{



                legend:{


                    display:false


                },



                tooltip:{



                    callbacks:{


                        label:function(context){


                            return (

                            context.raw +

                            " surveys"

                            );


                        }


                    }



                }



            },





            scales:{



                x:{



                    ticks:{



                        autoSkip:false,


                        maxRotation:45,


                        minRotation:35



                    }



                },



                y:{



                    beginAtZero:true,


                    ticks:{



                        precision:0


                    }



                }




            }



        }




        }



    );



}









// ============================================================
// SHIFT DISTRIBUTION DOUGHNUT CHART
// ============================================================


function renderShiftDistribution(data,canvas){



    const shifts = {


        Morning:0,

        Afternoon:0,

        Evening:0,

        Night:0


    };






    data.forEach(row=>{



        const shift =
            row.shift;



        if(
            shifts.hasOwnProperty(
                shift
            )
        ){


            shifts[shift]++;


        }



    });








    const labels =
        Object.keys(
            shifts
        );



    const values =
        Object.values(
            shifts
        );








    if(shiftChart){


        shiftChart.destroy();


    }







    shiftChart = new Chart(

        canvas,

        {



        type:"doughnut",



        data:{



            labels,



            datasets:[{


                label:
                "Shift Distribution",



                data:values



            }]



        },







        options:{



            responsive:true,


            maintainAspectRatio:false,



            cutout:"60%",






            plugins:{



                legend:{


                    position:"bottom",



                    labels:{


                        padding:20


                    }



                },






                tooltip:{



                    callbacks:{



                        label:function(context){



                            const total =

                            values.reduce(

                                (a,b)=>
                                a+b,

                                0

                            );



                            const percent =

                            total

                            ?

                            (

                            context.raw /

                            total *

                            100

                            )

                            .toFixed(1)

                            :

                            0;





                            return (

                            context.label +

                            ": " +

                            context.raw +

                            " (" +

                            percent +

                            "%)"

                            );



                        }



                    }



                }




            }



        }



        }



    );



}








console.log(

"✅ Optimized Chart Engine loaded"

);
