// ============================================================
// UCDS v3.2 — CLEANING SURVEY ENGINE
//
// Supabase Submission Engine
//
// Features:
// - Supabase database insert
// - Progress tracking
// - Task status colors
// - Mobile safe submission
// - Weekly reporting compatible
//
// Email notifications removed.
// Weekly executive reporting handles communication.
// ============================================================



const supabaseUrl =
"https://cpbkdtcrimppsxlstlob.supabase.co";


const supabaseKey =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwYmtkdGNyaW1wcHN4bHN0b2IiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4MDk0MTMxMywiZXhwIjoyMDk2NTE3MzEzfQ.oWvz_eKGwP7Po0SfSCHDNStCJanpn-c-gqaOkAjCJMI";


const client =
supabase.createClient(
    supabaseUrl,
    supabaseKey
);




// ============================================================
// ELEMENTS
// ============================================================


const form =
document.getElementById("surveyForm");


const successScreen =
document.getElementById("successScreen");


const roomEl =
document.getElementById("room");


const staffEl =
document.getElementById("staff");


const shiftEl =
document.getElementById("shift");


const notesEl =
document.getElementById("notes");


const workDateEl =
document.getElementById("work_date");


const progressBar =
document.getElementById("progressBar");




// ============================================================
// DATE INITIALIZATION
// ============================================================


function initDate(){


    if(!workDateEl)
        return;



    const today =
    new Date()
    .toISOString()
    .split("T")[0];



    workDateEl.max =
    today;


    workDateEl.value =
    today;


}


initDate();




// ============================================================
// TASK COLLECTION
// ============================================================


function getTasks(){


    const tasks = {};



    document
    .querySelectorAll(".task-card")
    .forEach(card=>{


        const key =
        card.dataset.task;



        const value =
        card.querySelector(".task-select")
        ?.value || "";



        tasks[key] =
        value;


    });



    return tasks;


}




// ============================================================
// PROGRESS BAR
// ============================================================


function updateProgress(){


    if(!progressBar)
        return;



    const selects =
    document.querySelectorAll(
        ".task-select"
    );



    let total =
    selects.length + 3;



    let completed = 0;



    if(roomEl?.value)
        completed++;


    if(staffEl?.value)
        completed++;


    if(shiftEl?.value)
        completed++;




    selects.forEach(select=>{


        if(select.value)
            completed++;


    });




    progressBar.style.width =
    Math.round(
        (completed / total) * 100
    )
    + "%";



}




// ============================================================
// TASK COLOR ENGINE
// ============================================================


function handleTaskColor(select){


    const card =
    select.closest(
        ".task-card"
    );



    if(!card)
        return;



    card.classList.remove(

        "glow-yes",
        "glow-no",
        "glow-na"

    );



    if(select.value==="Y"){

        card.classList.add(
            "glow-yes"
        );

    }



    if(select.value==="N"){

        card.classList.add(
            "glow-no"
        );

    }



    if(select.value==="NA"){

        card.classList.add(
            "glow-na"
        );

    }


}




// ============================================================
// EVENT LISTENERS
// ============================================================


[
roomEl,
staffEl,
shiftEl

]
.forEach(el=>{


    el?.addEventListener(

        "change",

        updateProgress

    );


});




document
.querySelectorAll(".task-select")
.forEach(select=>{


    select.addEventListener(

        "change",

        ()=>{

            handleTaskColor(select);

            updateProgress();

        }

    );


});





// ============================================================
// YES ALL BUTTON
// ============================================================


const yesToAllBtn =
document.getElementById(
    "yesToAllBtn"
);



yesToAllBtn?.addEventListener(

"click",

()=>{


    document
    .querySelectorAll(".task-select")
    .forEach(select=>{


        select.value =
        "Y";


        handleTaskColor(select);


    });



    updateProgress();


});





// ============================================================
// RESET BUTTON
// ============================================================


const resetAllBtn =
document.getElementById(
    "resetAllBtn"
);



resetAllBtn?.addEventListener(

"click",

()=>{


    document
    .querySelectorAll(".task-select")
    .forEach(select=>{


        select.value =
        "";



        const card =
        select.closest(
            ".task-card"
        );



        card?.classList.remove(

            "glow-yes",
            "glow-no",
            "glow-na"

        );


    });



    updateProgress();


});




// ============================================================
// SUBMISSION ENGINE
// ============================================================


form?.addEventListener(

"submit",

async(e)=>{


    e.preventDefault();



    console.log(
        "Survey submission started"
    );



    const btn =
    form.querySelector(
        "button[type='submit']"
    );



    if(!btn)
        return;




    btn.disabled =
    true;



    btn.textContent =
    "Submitting...";




    try{


        const today =
        new Date()
        .toISOString()
        .split("T")[0];




        const payload = {


            room:
            roomEl?.value || "",



            staff:
            staffEl?.value || "",



            shift:
            shiftEl?.value || "",



            notes:
            notesEl?.value || "",



            tasks_completed:
            getTasks(),



            work_date:
            workDateEl?.value || today,



            created_at:
            new Date()
            .toISOString()


        };





        console.log(
            "Saving survey:",
            payload
        );






        const {

            data,

            error

        } = await client


        .from("surveys")


        .insert([payload])


        .select();







        if(error){


            console.error(
                "Supabase insert error:",
                error
            );


            throw error;


        }






        console.log(

            "Survey saved:",

            data

        );





        /*
        =====================================================
        EMAIL NOTIFICATION REMOVED

        Previous behaviour:
        Every room generated an email.

        New behaviour:
        Data stored in Supabase.
        Weekly executive reports handle emails.

        =====================================================
        */



        console.log(

            "Weekly reporting workflow enabled."

        );





        form.style.display =
        "none";



        successScreen.style.display =
        "block";





    }


    catch(err){



        console.error(
            "Submission failed:",
            err
        );



        alert(
            err.message ||
            "Submission failed."
        );


    }




    finally{


        btn.disabled =
        false;



        btn.textContent =
        "Submit Survey";


    }



});





// ============================================================
// INITIALIZE
// ============================================================


updateProgress();


console.log(
"✅ UCDS Survey Engine v3.2 Loaded"
);
