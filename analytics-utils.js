// ============================================================
// ANALYTICS UTILITIES
// Shared calculations used throughout dashboard
// ============================================================


window.AnalyticsUtils = {


    // ========================================================
    // TASK STATISTICS
    // ========================================================

    getTaskStats(row){


        const tasks =
            row.tasks_completed || {};


        let total = 0;

        let completed = 0;



        Object.values(tasks)

        .forEach(value=>{


            total++;


            if(value === "Y"){

                completed++;

            }


        });



        return {

            total,

            completed

        };


    },





    // ========================================================
    // STAFF SPLITTER
    // Handles:
    // Hanna, Tania, David
    // ========================================================

    splitStaff(staff){


        return (

            staff || ""

        )

        .split(",")

        .map(
            name=>name.trim()
        )

        .filter(Boolean);


    },





    // ========================================================
    // STAFF PERFORMANCE
    // ========================================================

    getStaffStats(data){


        const staff = {};



        data.forEach(row=>{


            const names =
                this.splitStaff(
                    row.staff
                );



            names.forEach(name=>{


                if(!staff[name]){


                    staff[name]={

                        name,

                        surveys:0,

                        completed:0,

                        total:0

                    };


                }



                staff[name].surveys++;



                const stats =
                    this.getTaskStats(row);



                staff[name].completed +=
                    stats.completed;



                staff[name].total +=
                    stats.total;



            });


        });





        return Object.values(staff)

        .map(person=>{


            return {

                ...person,


                compliance:

                person.total

                ?

                Math.round(

                    person.completed /
                    person.total *
                    100

                )

                :

                0


            };


        });


    },





    // ========================================================
    // ROOM PERFORMANCE
    // ========================================================

    getRoomStats(data){


        const rooms = {};



        data.forEach(row=>{


            const room =
                row.room || "Unknown";



            if(!rooms[room]){


                rooms[room]={

                    room,

                    completed:0,

                    total:0

                };


            }



            const stats =
                this.getTaskStats(row);



            rooms[room].completed +=
                stats.completed;



            rooms[room].total +=
                stats.total;



        });




        return Object.values(rooms)

        .map(room=>{


            return {


                ...room,


                compliance:

                room.total

                ?

                Math.round(

                    room.completed /
                    room.total *
                    100

                )

                :

                0


            };


        });


    }


};


console.log(
    "✅ Analytics utilities loaded"
);
