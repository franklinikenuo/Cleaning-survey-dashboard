// ============================================================
// DASHBOARD CORE CONTROLLER
// Controls startup, refresh pipeline, auto-refresh & realtime
// ============================================================

window.DashboardCore = {

    isRefreshing: false,

    // ========================================================
    // REFRESH DASHBOARD
    // ========================================================

    async refresh() {

        if (this.isRefreshing) return;

        this.isRefreshing = true;

        try {

            const data = DataStore.getAll();
            const filtered = FilterEngine.apply(data);

            // Summary Cards
            if (typeof window.renderSummary === "function") {
                window.renderSummary(filtered);
            }

            // Table
            if (typeof window.renderTable === "function") {
                window.renderTable(filtered);
            }

            // Charts
            if (typeof window.renderCharts === "function") {
                window.renderCharts(filtered);
            }

            // Staff Leaderboard
            if (typeof window.renderLeaderboard === "function") {
                window.renderLeaderboard(filtered);
            }

            // Quick Insights
            if (typeof window.renderInsights === "function") {
                window.renderInsights(filtered);
            }

            // Advanced Analytics
            if (typeof window.generateAdvancedAnalytics === "function") {
                window.generateAdvancedAnalytics();
            }

            // Intelligence Center
            if (typeof window.generateCleaningIntelligence === "function") {
                window.generateCleaningIntelligence();
            }

        } catch (error) {

            console.error(
                "Dashboard refresh error:",
                error
            );

        } finally {

            this.isRefreshing = false;

        }

    },

    // ========================================================
    // INITIALIZE DASHBOARD
    // ========================================================

    async init() {

        console.log("Dashboard starting...");

        try {

            await DataStore.load();

            if (
                window.FilterEngine &&
                typeof FilterEngine.populateRoomFilter === "function"
            ) {
                FilterEngine.populateRoomFilter();
            }

            await this.refresh();

            console.log(
                `Dashboard ready (${DataStore.getAll().length} surveys loaded)`
            );

        } catch (error) {

            console.error(
                "Dashboard startup failed:",
                error
            );

        }

    },

    // ========================================================
    // FILTER EVENTS
    // ========================================================

    setupFilters() {

        document
            .querySelectorAll(
                "#filter-room,#filter-staff,#filter-shift,#filter-date"
            )
            .forEach(filter => {

                filter.addEventListener(
                    "change",
                    () => this.refresh()
                );

                filter.addEventListener(
                    "keyup",
                    () => this.refresh()
                );

            });

    },

    // ========================================================
    // AUTO REFRESH
    // ========================================================

    startAutoRefresh() {

        setInterval(async () => {

            try {

                await DataStore.load();

                await this.refresh();

                console.log("Auto refresh complete");

            } catch (error) {

                console.error(
                    "Auto refresh failed:",
                    error
                );

            }

        }, 60000);

    },

    // ========================================================
    // REALTIME SUPABASE
    // ========================================================

    startRealtime() {

        client
            .channel("surveys-live")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "surveys"
                },
                async () => {

                    console.log(
                        "Realtime update received"
                    );

                    try {

                        await DataStore.load();

                        await this.refresh();

                    } catch (error) {

                        console.error(
                            "Realtime refresh failed:",
                            error
                        );

                    }

                }
            )
            .subscribe(status => {

                console.log(
                    "Realtime status:",
                    status
                );

            });

    }

};


// ============================================================
// START DASHBOARD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        DashboardCore.setupFilters();

        await DashboardCore.init();

        DashboardCore.startAutoRefresh();

        DashboardCore.startRealtime();

    }
);

console.log("✅ Dashboard Core loaded");
