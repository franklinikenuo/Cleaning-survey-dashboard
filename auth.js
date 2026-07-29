// ============================================================
// UCDS AUTH CONTROL
// Supabase Session Guard
// ============================================================


async function checkAuth(){


    try{


        const {
            data,
            error
        } = await client.auth.getSession();



        if(error){

            console.error(
                "Session check error:",
                error
            );

            window.location.href =
            "login.html";

            return false;

        }



        if(!data.session){


            console.warn(
                "No active session"
            );


            window.location.href =
            "login.html";


            return false;

        }



        console.log(
            "✅ Active session:",
            data.session.user.email
        );


        return true;



    }

    catch(error){


        console.error(
            "Auth check failed:",
            error
        );


        window.location.href =
        "login.html";


        return false;


    }


}



// Run immediately

checkAuth();





// ============================================================
// LOGOUT
// ============================================================


window.logout = async function(){


    try{


        const {
            error
        } = await client.auth.signOut();



        if(error){

            console.error(
                "Logout failed:",
                error
            );

            return;

        }



        console.log(
            "✅ Logged out successfully"
        );


        window.location.href =
        "login.html";


    }


    catch(error){

        console.error(
            "Logout error:",
            error
        );

    }


};





console.log(
"✅ Auth controls loaded"
);
