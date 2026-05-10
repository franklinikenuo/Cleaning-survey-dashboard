async function loadData() {
    const container = document.getElementById("data");
    container.innerHTML = "<p>Loading...</p>";

    try {
        // Fetch from your Render backend
        const response = await fetch("https://cleaning-survey-backend.onrender.com/submissions");
        const entries = await response.json();

        container.innerHTML = "";

        // Show newest entries first
        entries.reverse().forEach(entry => {
            const tasks = entry.tasks_completed;

            const div = document.createElement("div");
            div.className = "entry";

            div.innerHTML = `
                <h3>${entry.room} — ${entry.staff_name}</h3>
                <p><strong>Shift:</strong> ${entry.shift}</p>
                <p><strong>Timestamp:</strong> ${entry.timestamp}</p>

                <h4>Tasks Completed:</h4>
                <ul>
                    <li>Floor cleaned: ${tasks.floor_cleaned}</li>
                    <li>Trash removed: ${tasks.trash_removed}</li>
                    <li>Surfaces wiped: ${tasks.surfaces_wiped}</li>
                    <li>Equipment sanitized: ${tasks.equipment_sanitized}</li>
                    <li>Supplies restocked: ${tasks.supplies_restocked}</li>

                    <!-- NEW TASKS -->
                    <li>Sweep: ${tasks.sweep}</li>
                    <li>Linen Change: ${tasks.linen_change}</li>
                    <li>Vacuum: ${tasks.vacuum}</li>
                </ul>

                <p><strong>Notes:</strong> ${entry.notes || "None"}</p>
            `;

            container.appendChild(div);
        });

    } catch (error) {
        container.innerHTML = "<p style='color:red;'>Error loading data from backend.</p>";
    }
}

loadData();
