// ============================================================
// UCDS v2.2 — Reports Page JavaScript
// Handles all email-based report generation actions
// ============================================================

// -------------------------------
// Helper: POST request wrapper
// -------------------------------
async function sendReport(endpoint) {
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error("Server returned an error");
        }

        const data = await response.json();

        if (data.success) {
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
document.getElementById("emailDashboardPDF").addEventListener("click", () => {
    sendReport("/api/email-dashboard-pdf");
});

document.getElementById("emailWeeklyReport").addEventListener("click", () => {
    sendReport("/api/email-weekly-report");
});

document.getElementById("emailMonthlyReport").addEventListener("click", () => {
    sendReport("/api/email-monthly-report");
});

document.getElementById("emailQuarterlyReport").addEventListener("click", () => {
    sendReport("/api/email-quarterly-report");
});

document.getElementById("emailYearlyReport").addEventListener("click", () => {
    sendReport("/api/email-yearly-report");
});
