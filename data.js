// ============================================================
// DATA STORE
// Single source of truth for survey data
// ============================================================

window.DataStore = {

    surveys: [],

    async load() {

        const { data, error } = await client
            .from("surveys")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {
            console.error("Fetch error:", error);
            return [];
        }

        this.surveys = data || [];

        console.log("Loaded", this.surveys.length, "surveys");

        return this.surveys;
    },

    getAll() {
        return this.surveys;
    }

};
