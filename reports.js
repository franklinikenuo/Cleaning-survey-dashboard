// ============================================================
// UCDS v2.2 — Reports Page JavaScript
// Handles all email-based report generation actions
// ============================================================

const backend = "https://cleaning-survey-api-v2-x6sf.onrender.com";

/* ============================================================
   WARM-UP + RETRY WRAPPER
   Ensures backend wakes from cold start (Render)
   ============================================================ */

async function getWithRetry(url, retries = 3) {
    try {
        return await fetch(url);
    } catch (err) {
        if (retries > 0) {
            await new Promise(res => setTimeout(res, 1500));
            return getWithRetry(url, retries - 1);
        }
        throw err;
    }
}

/* ============================================================
   SEND REPORT HELPER
   Handles weekly, monthly, quarterly, yearly
   ============================================================ */

async function sendReport(endpoint) {
    try {
        // Warm backend (Render cold start)
        try {
            await fetch(backend, { method: "GET" });
        } catch (_) {
            console.log("Backend waking up…");
        }

        const response = await getWithRetry(`${backend}${endpoint}`);

        if (!response.ok) {
            alert("Failed to send report.");
            return;
        }

        const data = await response.json();

        if (data.status === "success") {
            alert("Report sent successfully!");
        } else {
            alert("Failed to send report.");
        }

    } catch (error) {
        console.error("Error sending report:", error);
        alert("An error occurred while sending the report.");
    }
}

/* ============================================================
   BUTTON EVENT LISTENERS
   ============================================================ */

document.getElementById("emailWeeklyReport").addEventListener("click", () => {
    sendReport("/send-weekly-report");
});

document.getElementById("emailMonthlyReport").addEventListener("click", () => {
    sendReport("/send-monthly-report");
});

document.getElementById("emailQuarterlyReport").addEventListener("click", () => {
    sendReport("/send-quarterly-report");
});

document.getElementById("emailYearlyReport").addEventListener("click", () => {
    sendReport("/send-yearly-report");
});
