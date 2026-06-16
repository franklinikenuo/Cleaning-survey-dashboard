const supabaseUrl = "https://cpbkdtcrimppsxlstlob.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwYmtkdGNyaW1wcHN4bHN0bG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDEzMTMsImV4cCI6MjA5NjUxNzMxM30.oWvz_eKGwP7Po0SfSCHDNStCJanpn-c-gqaOkAjCJMI";

const client = supabase.createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("surveyForm");
const successScreen = document.getElementById("successScreen");

const roomEl = document.getElementById("room");
const staffEl = document.getElementById("staff");
const shiftEl = document.getElementById("shift");

const progressBar = document.getElementById("progressBar");

/* =========================
   PROGRESS SYSTEM (SAFE)
========================= */

function updateProgress() {
  if (!progressBar) return;

  const taskSelects = document.querySelectorAll(".task-select");

  let total = taskSelects.length + 3;
  let done = 0;

  if (roomEl?.value) done++;
  if (staffEl?.value) done++;
  if (shiftEl?.value) done++;

  taskSelects.forEach(t => {
    if (t.value === "Y" || t.value === "N" || t.value === "NA") {
      done++;
    }
  });

  const percent = Math.round((done / total) * 100);
  progressBar.style.width = percent + "%";
}

/* live listeners */
document.querySelectorAll(".task-select").forEach(t => {
  t.addEventListener("change", (e) => {
    handleTaskColor(e.target);
    updateProgress();
  });
});

[roomEl, staffEl, shiftEl].forEach(el => {
  el?.addEventListener("change", updateProgress);
});

/* =========================
   COLOR FEEDBACK (NEW)
========================= */

function handleTaskColor(select) {
  const card = select.closest(".task-card");
  if (!card) return;

  card.classList.remove("glow-yes", "glow-no", "glow-na");

  if (select.value === "Y") card.classList.add("glow-yes");
  if (select.value === "N") card.classList.add("glow-no");
  if (select.value === "NA") card.classList.add("glow-na");

  card.classList.add("active");
}

/* =========================
   SUBMIT HANDLER
========================= */

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = form.querySelector("button[type='submit']");
  btn.disabled = true;
  btn.textContent = "Submitting...";

  try {
    const room = roomEl.value;
    const staff = staffEl.value;
    const shift = shiftEl.value;
    const notes = document.getElementById("notes").value;

    if (!room || !staff || !shift) {
      throw new Error("Please fill Room, Staff, and Shift");
    }

    const tasks = {};
    document.querySelectorAll(".task-card").forEach(card => {
      const key = card.dataset.task;
      const value = card.querySelector(".task-select").value || "";
      tasks[key] = value;
    });

    const { data, error } = await client
      .from("surveys")
      .insert([
        {
          room,
          staff,
          shift,
          notes,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    const taskRows = Object.entries(tasks).map(([task_name, completed]) => ({
      survey_id: data.id,
      task_name,
      completed
    }));

    const { error: taskError } = await client
      .from("tasks")
      .insert(taskRows);

    if (taskError) throw taskError;

    form.style.display = "none";
    successScreen.style.display = "block";

  } catch (err) {
    console.error(err);
    alert(err.message || "Submission failed");
  }

  btn.disabled = false;
  btn.textContent = "Submit Survey";
});

/* initial progress */
updateProgress();
