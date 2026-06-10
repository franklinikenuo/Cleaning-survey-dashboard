/* ============================================================
   DAILY CLEANING SURVEY — ENTERPRISE EDITION (v3.2)
   With Progress Bar + Animations
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
   PROGRESS BAR ENGINE
   ============================================================ */

const progressBar = document.getElementById("progressBar");

function updateProgress() {
  let total = 3; // room, staff, shift
  let completed = 0;

  if (document.getElementById("room").value) completed++;
  if (document.getElementById("staff").value) completed++;
  if (document.getElementById("shift").value) completed++;

  const taskSelects = document.querySelectorAll(".task-select");
  total += taskSelects.length;

  taskSelects.forEach(sel => {
    if (sel.value) completed++;
  });

  const percent = Math.round((completed / total) * 100);
  progressBar.style.width = percent + "%";
}

/* ============================================================
   TASK GLOW EFFECT
   ============================================================ */

function applyGlow(card, value) {
  card.classList.remove("glow-yes", "glow-no", "glow-na");

  if (value === "Y") card.classList.add("glow-yes");
  if (value === "N") card.classList.add("glow-no");
  if (value === "NA") card.classList.add("glow-na");

  setTimeout(() => {
    card.classList.remove("glow-yes", "glow-no", "glow-na");
  }, 600);
}

/* Attach glow + progress listeners */
document.querySelectorAll(".task-card").forEach(card => {
  const select = card.querySelector("select");
  select.addEventListener("change", () => {
    applyGlow(card, select.value);
    updateProgress();
  });
});

["room", "staff", "shift"].forEach(id => {
  document.getElementById(id).addEventListener("change", updateProgress);
});

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
    const room = document.getElementById("room").value;
    const staff = document.getElementById("staff").value;
    const shift = document.getElementById("shift").value;
    const notes = document.getElementById("notes").value.trim();

    const taskCards = document.querySelectorAll(".task-card");
    const tasks_completed = {};

    taskCards.forEach((card) => {
      const labelText = card.querySelector("label").innerText.trim();
      const cleanLabel = labelText.replace(/^[^\w]+/, "").trim();
      const value = card.querySelector("select").value;
      tasks_completed[cleanLabel] = value;
    });

    if (!room || !staff || !shift) {
      showToast("Please complete all required fields", "error");
      setLoading(submitBtn, false);
      return;
    }

    const payload = {
      room,
      staff,
      shift,
      tasks_completed,
      notes,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(`${API_BASE}/survey`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Server error");

    form.style.display = "none";
    successScreen.style.display = "block";
    showToast("Survey submitted successfully");

  } catch (err) {
    showToast("Failed to submit survey", "error");
  }

  setLoading(submitBtn, false);
});
