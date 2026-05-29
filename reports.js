// ============================================================
// UCDS v2.2 — Reports Page JavaScript
// Handles all email-based report generation actions
// ============================================================

const backend = "https://cleaning-survey-api-v2-x6sf.onrender.com";

// -------------------------------
// Warm-up + Retry Wrapper
// -------------------------------
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

// -------------------------------
// Helper: Trigger Report
// -------------------------------
async function sendReport(endpoint) {
    try {
        // Wake backend
        try {
            await fetch(backend);
        } catch (err) {
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

// -------------------------------
// Button Event Listeners
// -------------------------------
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
