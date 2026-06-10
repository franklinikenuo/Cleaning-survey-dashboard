/* ============================================================
   DAILY CLEANING SURVEY — ENTERPRISE EDITION (v3.1)
   Stable • Mobile‑Safe • Clean Architecture
   ============================================================ */

const API_BASE = "https://cleaning-survey-api-v2-x6sf.onrender.com";

/* ============================================================
   UTILITIES — Toast + Loading
   ============================================================ */

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: type === "error" ? "#d7263d" : "#0b3a6f",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "0.85rem",
    zIndex: 99999,
    opacity: 0,
    transition: "opacity 0.3s ease"
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => (toast.style.opacity = 1));

  setTimeout(() => {
    toast.style.opacity = 0;
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

function setLoading(btn, isLoading) {
  if (!btn) return;
  if (isLoading) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = "Submitting…";
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.originalText;
    btn.disabled = false;
  }
}

/* ============================================================
   FORM HANDLING
   ============================================================ */

const form = document.getElementById("surveyForm");
const successScreen = document.getElementById("successScreen");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = form.querySelector("button[type='submit']");
  setLoading(submitBtn, true);

  try {
    /* --------------------------------------------------------
       COLLECT FORM DATA
    -------------------------------------------------------- */
    const room = document.getElementById("room").value;
    const staff = document.getElementById("staff").value;
    const shift = document.getElementById("shift").value;
    const notes = document.getElementById("notes").value.trim();

    /* --------------------------------------------------------
       COLLECT TASKS (Card-Based)
    -------------------------------------------------------- */
    const taskCards = document.querySelectorAll(".task-card");
    const tasks_completed = {};

    taskCards.forEach((card) => {
      const labelText = card.querySelector("label").innerText.trim();

      // Remove icon text (e.g., "🗑️ Trash" → "Trash")
      const cleanLabel = labelText.replace(/^[^\w]+/, "").trim();

      const value = card.querySelector("select").value;
      tasks_completed[cleanLabel] = value;
    });

    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */
    if (!room || !staff || !shift) {
      showToast("Please complete all required fields", "error");
      setLoading(submitBtn, false);
      return;
    }

    /* --------------------------------------------------------
       BUILD PAYLOAD
    -------------------------------------------------------- */
    const payload = {
      room,
      staff,
      shift,
      tasks_completed,
      notes,
      timestamp: new Date().toISOString()
    };

    /* --------------------------------------------------------
       SEND TO BACKEND
    -------------------------------------------------------- */
    const response = await fetch(`${API_BASE}/survey`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    /* --------------------------------------------------------
       SUCCESS
    -------------------------------------------------------- */
    form.style.display = "none";
    successScreen.style.display = "block";
    showToast("Survey submitted successfully");

  } catch (err) {
    showToast("Failed to submit survey", "error");
  }

  setLoading(submitBtn, false);
});
