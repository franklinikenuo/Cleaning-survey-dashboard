// ============================================================
// UCDS v3.1 — DASHBOARD CORE CONTROLLER
//
// Controls:
// - Startup
// - Manual Refresh
// - Auto Refresh
// - Supabase Realtime Sync
// - Dashboard Rendering Pipeline
//
// Single source of truth:
// DataStore
// ============================================================


console.log(
    "Loading Dashboard Core..."
);



window.DashboardCore = {


    isRefreshing:false,





    // ========================================================
    // MAIN REFRESH PIPELINE
    // ========================================================


    async refresh(){


        if(this.isRefreshing){

            console.log(
                "Refresh already running..."
            );

            return;

        }



        this.isRefreshing = true;



        try{


            const data =
                DataStore?.getAll() || [];



            console.log(
                "Refreshing dashboard...",
                data.length,
                "records"
            );




            let filtered = data;



            if(
                window.FilterEngine &&
                typeof FilterEngine.apply === "function"
            ){

                filtered =
                    FilterEngine.apply(data);

            }





            // ================================
            // SUMMARY CARDS
            // ================================

            if(
                typeof renderSummary === "function"
            ){

                renderSummary(filtered);

            }





            // ================================
            // TABLE
            // ================================

            if(
                typeof renderTable === "function"
            ){

                renderTable(filtered);

            }






            // ================================
            // CHARTS
            // ================================

            if(
                typeof renderCharts === "function"
            ){

                renderCharts(filtered);

            }







            // ================================
            // STAFF ANALYTICS
            // ================================

            if(
                typeof renderLeaderboard === "function"
            ){

                renderLeaderboard(filtered);

            }








            // ================================
            // INSIGHTS
            // ================================

            if(
                typeof renderInsights === "function"
            ){

                renderInsights(filtered);

            }








            // ================================
            // ADVANCED ANALYTICS
            // ================================

            if(
                typeof generateAdvancedAnalytics === "function"
            ){

                generateAdvancedAnalytics(
                    filtered
                );

            }








            // ================================
            // INTELLIGENCE ENGINE
            // ================================

            if(
                typeof generateCleaningIntelligence === "function"
            ){

                generateCleaningIntelligence(
                    filtered
                );

            }






            console.log(
                "✅ Dashboard refresh complete"
            );



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
    // GLOBAL REFRESH BUTTON FUNCTION
    // ========================================================


    async manualRefresh(){


        console.log(
            "Manual refresh requested"
        );



        try{


            await DataStore.load();


            await this.refresh();



        }

        catch(error){


            console.error(
                "Manual refresh failed:",
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
    // AUTO REFRESH EVERY 60 SECONDS
    // ========================================================


    startAutoRefresh(){



        setInterval(async()=>{


            try{


                await DataStore.load();


                await this.refresh();



                console.log(
                    "Auto refresh complete"
                );



            }

            catch(error){


                console.error(

                    "Auto refresh failed:",
                    error

                );


            }


        },60000);



    },









    // ========================================================
    // SUPABASE REALTIME
    // ========================================================


    startRealtime(){



        if(
            !window.client
        ){

            console.warn(
                "Supabase client unavailable"
            );

            return;

        }





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

        .subscribe(status=>{


            console.log(

                "Realtime status:",
                status

            );


        });



    }



};









// ============================================================
// BUTTON CONNECTION
// ============================================================


window.refreshDashboard = function(){


    DashboardCore.manualRefresh();


};









// ============================================================
// START SYSTEM
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




console.log(
    "✅ Dashboard Core loaded"
);
