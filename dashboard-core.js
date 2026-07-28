// ============================================================
// UCDS v3.0 — DASHBOARD CORE CONTROLLER
//
// Controls:
// - Startup
// - Refresh pipeline
// - Filters
// - Auto refresh
// - Supabase realtime
//
// Optimized:
// - Heavy analytics lazy loaded
// - Reduced DOM updates
// - Faster dashboard refresh
// ============================================================



window.DashboardCore = {


    isRefreshing:false,

    analyticsLoaded:false,

    intelligenceLoaded:false,





    // ========================================================
    // MAIN REFRESH PIPELINE
    // ========================================================


    async refresh(){


        if(this.isRefreshing)
            return;



        this.isRefreshing = true;



        try {



            const data =
                DataStore.getAll();



            const filtered =
                FilterEngine.apply(data);





            console.log(

                "Refreshing dashboard...",

                filtered.length,

                "records"

            );








            // ============================
            // KPI SUMMARY
            // ============================


            if(
                typeof renderSummary === "function"
            ){

                renderSummary(filtered);

            }








            // ============================
            // TABLE
            // ============================


            if(
                typeof renderTable === "function"
            ){

                renderTable(filtered);

            }








            // ============================
            // CHARTS
            // ============================


            if(
                typeof renderCharts === "function"
            ){

                renderCharts(filtered);

            }








            // ============================
            // STAFF LEADERBOARD
            // ============================


            if(
                typeof renderLeaderboard === "function"
            ){

                renderLeaderboard(filtered);

            }








            // ============================
            // INSIGHTS
            // ============================


            if(
                typeof renderInsights === "function"
            ){

                renderInsights(filtered);

            }









            // Heavy analytics removed from
            // automatic refresh
            //
            // They load only when opened.





        }


        catch(error){


            console.error(

                "Dashboard refresh error:",

                error

            );


        }


        finally{


            this.isRefreshing=false;


        }


    },









    // ========================================================
    // LOAD ADVANCED ANALYTICS ON DEMAND
    // ========================================================


    loadAdvancedAnalytics(){



        if(this.analyticsLoaded)
            return;



        try{


            if(
                typeof generateAdvancedAnalytics === "function"
            ){


                generateAdvancedAnalytics();


                console.log(
                    "✅ Advanced analytics loaded"
                );


            }


            this.analyticsLoaded=true;


        }


        catch(error){


            console.error(
                "Advanced analytics failed:",
                error
            );


        }



    },









    // ========================================================
    // LOAD INTELLIGENCE CENTER ON DEMAND
    // ========================================================


    loadIntelligence(){



        if(this.intelligenceLoaded)
            return;




        try{


            if(
                typeof generateCleaningIntelligence === "function"
            ){


                generateCleaningIntelligence();


                console.log(
                    "✅ Intelligence center loaded"
                );


            }



            this.intelligenceLoaded=true;



        }


        catch(error){


            console.error(
                "Intelligence load failed:",
                error
            );


        }



    },









    // ========================================================
    // INITIALIZE DASHBOARD
    // ========================================================


    async init(){



        console.log(
            "Dashboard starting..."
        );




        try{


            await DataStore.load();





            if(
                window.FilterEngine &&
                typeof FilterEngine.populateRoomFilter === "function"
            ){


                FilterEngine.populateRoomFilter();


            }





            await this.refresh();





            console.log(

                `Dashboard ready (${DataStore.getAll().length} surveys loaded)`

            );



        }


        catch(error){


            console.error(

                "Dashboard startup failed:",

                error

            );


        }



    },









    // ========================================================
    // FILTER LISTENERS
    // ========================================================


    setupFilters(){



        document

        .querySelectorAll(

            "#filter-room,#filter-staff,#filter-shift,#filter-date"

        )


        .forEach(filter=>{


            filter.addEventListener(

                "change",

                ()=>this.refresh()

            );



            filter.addEventListener(

                "keyup",

                ()=>this.refresh()

            );



        });



    },









    // ========================================================
    // AUTO REFRESH
    // ========================================================


    startAutoRefresh(){



        setInterval(

            async()=>{


                try{


                    await DataStore.load();


                    await this.refresh();



                    console.log(

                        "Auto refresh complete"

                    );


                }


                catch(error){


                    console.error(

                        "Auto refresh failed",

                        error

                    );


                }



            },


            60000

        );



    },









    // ========================================================
    // SUPABASE REALTIME
    // ========================================================


    startRealtime(){



        if(!window.client)
            return;




        client

        .channel(
            "surveys-live"
        )


        .on(

            "postgres_changes",

            {

                event:"*",

                schema:"public",

                table:"surveys"

            },


            async()=>{


                console.log(

                    "Realtime update received"

                );



                await DataStore.load();


                await this.refresh();



            }


        )


        .subscribe(

            status=>{


                console.log(

                    "Realtime status:",

                    status

                );


            }


        );



    }



};









// ============================================================
// GLOBAL REFRESH BUTTON
// ============================================================


window.refreshDashboard = async function(){



    console.log(
        "Manual dashboard refresh"
    );



    await DataStore.load();


    await DashboardCore.refresh();



};











// ============================================================
// START DASHBOARD
// ============================================================


document.addEventListener(

"DOMContentLoaded",

async()=>{


    DashboardCore.setupFilters();


    await DashboardCore.init();


    DashboardCore.startAutoRefresh();


    DashboardCore.startRealtime();



}

);





// ============================================================
// LAZY LOAD LISTENERS
// ============================================================


document.addEventListener(

"click",

event=>{



    const target =
        event.target;



    if(
        target.closest(
            ".panel-toggle"
        )
    ){


        const text =
            target.innerText;



        if(
            text.includes(
                "Advanced"
            )
        ){


            DashboardCore.loadAdvancedAnalytics();


        }



        if(
            text.includes(
                "Intelligence"
            )
        ){


            DashboardCore.loadIntelligence();


        }



    }



});






console.log(
    "✅ Optimized Dashboard Core loaded"
);
