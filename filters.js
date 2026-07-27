// ============================================================
// FILTER ENGINE
// Room / Staff / Shift / Date Filtering
// ============================================================


window.FilterEngine = {



    // ========================================================
    // POPULATE ROOM DROPDOWN
    // ========================================================

    populateRoomFilter(){


        const select =
            document.getElementById(
                "filter-room"
            );


        if(!select)
            return;



        const data =
            DataStore.getAll();



        const rooms = [

            ...new Set(

                data

                .map(row=>row.room)

                .filter(Boolean)

            )

        ];



        select.innerHTML = `

            <option value="all">
                All Rooms
            </option>

        `;



        rooms.forEach(room=>{


            select.innerHTML += `

                <option value="${room}">
                    ${room}
                </option>

            `;


        });


    },





    // ========================================================
    // APPLY ACTIVE FILTERS
    // ========================================================

    apply(data){


        const room =
            document.getElementById(
                "filter-room"
            )?.value || "all";



        const staff =
            (
                document.getElementById(
                    "filter-staff"
                )?.value || ""
            )

            .toLowerCase();




        const shift =
            document.getElementById(
                "filter-shift"
            )?.value || "all";




        const date =
            document.getElementById(
                "filter-date"
            )?.value || "";





        return data.filter(row=>{



            if(

                room !== "all" &&

                row.room !== room

            ){

                return false;

            }




            if(

                shift !== "all" &&

                row.shift !== shift

            ){

                return false;

            }




            if(

                staff &&

                !(row.staff || "")

                .toLowerCase()

                .includes(staff)

            ){

                return false;

            }




            if(

                date &&

                row.work_date !== date

            ){

                return false;

            }




            return true;


        });


    }

};


console.log(
    "✅ Filter engine loaded"
);
