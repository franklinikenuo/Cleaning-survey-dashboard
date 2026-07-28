// ============================================================
// UCDS AUTH CONTROL
// Supabase Logout
// ============================================================


window.logout = async function(){


    try {


        const { error } = await client.auth.signOut();



        if(error){

            console.error(
                "Logout failed:",
                error
            );

            alert(
                "Unable to logout."
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
