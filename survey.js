const supabaseUrl = "https://cpbkdtcrimppsxlstlob.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwYmtkdGNyaW1wcHN4bHN0bG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDEzMTMsImV4cCI6MjA5NjUxNzMxM30.oWvz_eKGwP7Po0SfSCHDNStCJanpn-c-gqaOkAjCJMI";
const client = supabase.createClient(supabaseUrl, supabaseKey);

/* ================= ELEMENTS ================= */
const form = document.getElementById("surveyForm");
const successScreen = document.getElementById("successScreen");

const roomEl = document.getElementById("room");
const staffEl = document.getElementById("staff");
const shiftEl = document.getElementById("shift");
const notesEl = document.getElementById("notes");
const progressBar = document.getElementById("progressBar");

/* ================= TASKS ================= */
function getTasks() {
  const tasks = {};

  document.querySelectorAll(".task-card").forEach(card => {
    const key = card.dataset.task;
    const value = card.querySelector(".task-select")?.value || "";
    tasks[key] = value;
  });

  return tasks;
}

/* ================= PROGRESS ================= */
function updateProgress() {
  if (!progressBar) return;

  const selects = document.querySelectorAll(".task-select");

  let total = selects.length + 3;
  let done = 0;

  if (roomEl?.value) done++;
  if (staffEl?.value) done++;
  if (shiftEl?.value) done++;

  selects.forEach(s => {
    if (s.value) done++;
  });

  progressBar.style.width = Math.round((done / total) * 100) + "%";
}

/* ================= TASK UI COLOR ================= */
function handleTaskColor(select) {
  const card = select.closest(".task-card");
  if (!card) return;

  card.classList.remove("glow-yes", "glow-no", "glow-na");

  if (select.value === "Y") card.classList.add("glow-yes");
  if (select.value === "N") card.classList.add("glow-no");
  if (select.value === "NA") card.classList.add("glow-na");
}

/* ================= LISTENERS ================= */
[roomEl, staffEl, shiftEl].forEach(el => {
  el?.addEventListener("change", updateProgress);
});

document.querySelectorAll(".task-select").forEach(s => {
  s.addEventListener("change", e => {
    handleTaskColor(e.target);
    updateProgress();
  });
});

/* ================= SUBMIT ================= */
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = form.querySelector("button[type='submit']");
  btn.disabled = true;
  btn.textContent = "Submitting...";

  try {
    const payload = {
      room: roomEl.value,
      staff: staffEl.value,
      shift: shiftEl.value,
      notes: notesEl.value,
      tasks_completed: getTasks(),
      created_at: new Date().toISOString()
    };

    if (!payload.room || !payload.staff || !payload.shift) {
      throw new Error("Please complete Room, Staff, Shift");
    }

    const { error } = await client
      .from("surveys")
      .insert([payload]);

    if (error) throw error;

    form.style.display = "none";
    successScreen.style.display = "block";

  } catch (err) {
    alert(err.message);
    console.error(err);
  }

  btn.disabled = false;
  btn.textContent = "Submit Survey";
});

updateProgress();
