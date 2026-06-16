const supabaseUrl = "https://cpbkdtcrimppsxlstlob.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwYmtkdGNyaW1wcHN4bHN0bG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDEzMTMsImV4cCI6MjA5NjUxNzMxM30.oWvz_eKGwP7Po0SfSCHDNStCJanpn-c-gqaOkAjCJMI"; // replace safely

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

  const taskSelects = document.querySelectorAll(".task-select");

  let total = taskSelects.length + 3;
  let done = 0;

  if (roomEl?.value) done++;
  if (staffEl?.value) done++;
  if (shiftEl?.value) done++;

  taskSelects.forEach(t => {
    if (t.value) done++;
  });

  const percent = Math.round((done / total) * 100);
  progressBar.style.width = percent + "%";
}

/* ================= COLOR SYSTEM ================= */
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

document.querySelectorAll(".task-select").forEach(select => {
  select.addEventListener("change", e => {
    handleTaskColor(e.target);
    updateProgress();
  });
});

/* ================= DUPLICATE CHECK ================= */
async function checkDuplicate(room, shift) {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await client
    .from("surveys")
    .select("id, created_at")
    .eq("room", room)
    .eq("shift", shift);

  if (error) throw error;

  return (data || []).some(s =>
    s.created_at?.split("T")[0] === today
  );
}

/* ================= SUBMIT ================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = form.querySelector("button[type='submit']");
  btn.disabled = true;
  btn.textContent = "Submitting...";

  try {
    const room = roomEl.value;
    const staff = staffEl.value;
    const shift = shiftEl.value;
    const notes = notesEl.value;

    if (!room || !staff || !shift) {
      throw new Error("Please fill Room, Staff, and Shift");
    }

    // 🚨 DUPLICATE PREVENTION
    const isDuplicate = await checkDuplicate(room, shift);

    if (isDuplicate) {
      throw new Error("This room + shift has already been submitted today.");
    }

    const tasks = getTasks();

    // SINGLE SOURCE OF TRUTH
    const { data, error } = await client
      .from("surveys")
      .insert([
        {
          room,
          staff,
          shift,
          notes,
          tasks_completed: tasks,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    console.log("Survey saved:", data);

    form.style.display = "none";
    successScreen.style.display = "block";

  } catch (err) {
    console.error(err);
    alert(err.message || "Submission failed");
  }

  btn.disabled = false;
  btn.textContent = "Submit Survey";
});

/* ================= INIT ================= */
updateProgress();
