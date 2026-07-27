// ============================================================
// DASHBOARD CORE CONTROLLER
// Controls startup and refresh pipeline
// ============================================================


window.DashboardCore = {


    isRefreshing:false,



    // ========================================================
    // REFRESH DASHBOARD
    // ========================================================

    async refresh(){


        if(this.isRefreshing)
            return;



        this.isRefreshing = true;



        try{


            const data =
                DataStore.getAll();



            const filtered =
                FilterEngine.apply(data);



            // KPI + Summary

            if(window.renderSummary){

                renderSummary(filtered);

            }



            // Table

            if(window.renderTable){

                renderTable(filtered);

            }



            // Charts

            if(window.renderCharts){

                renderCharts(filtered);

            }



            // Staff

            if(window.renderLeaderboard){

                renderLeaderboard(filtered);

            }



            // Insights

            if(window.renderInsights){

                renderInsights(filtered);

            }



            // Advanced analytics

            if(window.generateAdvancedAnalytics){

                generateAdvancedAnalytics();

            }



            // Intelligence

            if(window.generateCleaningIntelligence){

                generateCleaningIntelligence();

            }



        }


        catch(error){


            console.error(

                "Dashboard refresh error:",

                error

            );


        }


        finally{


            this.isRefreshing = false;


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



            FilterEngine.populateRoomFilter();



            await this.refresh();



            console.log(
                "Dashboard ready"
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
    // FILTER EVENTS
    // ========================================================

    setupFilters(){



        document

        .querySelectorAll(

            "#filter-room," +

            "#filter-staff," +

            "#filter-shift," +

            "#filter-date"

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


    }



};





// ============================================================
// START SYSTEM
// ============================================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    DashboardCore.setupFilters();


    DashboardCore.init();


});


console.log(
    "✅ Dashboard core loaded"
);
