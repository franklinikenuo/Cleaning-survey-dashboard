// ============================================================
// SUMMARY CARDS
// ============================================================

window.renderSummary = function(data){

    const totalEl =
        document.getElementById("total-submissions");

    const complianceEl =
        document.getElementById("overall-compliance");

    if(totalEl){

        totalEl.textContent = data.length;

    }

    let totalTasks = 0;
    let completedTasks = 0;

    data.forEach(row=>{

        const stats =
            AnalyticsUtils.getTaskStats(row);

        totalTasks += stats.total;
        completedTasks += stats.completed;

    });

    const compliance =

        totalTasks

        ?

        Math.round(

            completedTasks /
            totalTasks *
            100

        )

        :

        0;

    if(complianceEl){

        complianceEl.textContent =
            compliance + "%";

    }

};

console.log("✅ Summary loaded");
