// ============================================================
// DATA STORE
// Single Source Of Truth For Survey Data
// ============================================================


window.DataStore = {


    surveys: [],

    loading: false,


    // ========================================================
    // LOAD SURVEYS FROM SUPABASE
    // ========================================================

    async load(){


        if(this.loading){

            console.log(
                "Data load already running"
            );

            return this.surveys;

        }


        this.loading = true;


        try{


            const {
                data,
                error

            } = await client

            .from("surveys")

            .select("*")

            .order(
                "created_at",
                {
                    ascending:false
                }
            );



            if(error){


                console.error(
                    "Supabase fetch error:",
                    error
                );


                return this.surveys;


            }



            this.surveys =
                data || [];



            console.log(

                "Loaded",

                this.surveys.length,

                "surveys"

            );



            return this.surveys;



        }

        catch(error){


            console.error(
                "Data load failed:",
                error
            );


            return this.surveys;


        }


        finally{


            this.loading = false;


        }


    },





    // ========================================================
    // GET ALL DATA
    // ========================================================

    getAll(){


        return this.surveys;


    },





    // ========================================================
    // UPDATE DATA MANUALLY
    // USED BY REALTIME
    // ========================================================

    set(data){


        this.surveys =
            Array.isArray(data)
            ?
            data
            :
            [];


    },





    // ========================================================
    // CLEAR DATA
    // ========================================================

    clear(){


        this.surveys = [];


    },





    // ========================================================
    // COUNT
    // ========================================================

    count(){


        return this.surveys.length;


    }


};




console.log(
    "✅ DataStore initialized"
);
