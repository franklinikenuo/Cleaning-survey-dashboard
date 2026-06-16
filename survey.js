const supabaseUrl = "https://cpbkdtcrimppsxlstlob.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwYmtkdGNyaW1wcHN4bHN0bG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDEzMTMsImV4cCI6MjA5NjUxNzMxM30.oWvz_eKGwP7Po0SfSCHDNStCJanpn-c-gqaOkAjCJMI";

const client = supabase.createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("surveyForm");
const successScreen = document.getElementById("successScreen");

function updateProgress() {
  const tasks = document.querySelectorAll(".task-select");
  let total = tasks.length + 3;
  let done = 0;

  if (room.value) done++;
  if (staff.value) done++;
  if (shift.value) done++;

  tasks.forEach(t => {
    if (t.value) done++;
  });

  const percent = Math.round((done / total) * 100);
  const bar = document.getElementById("progressBar");
  if (bar) bar.style.width = percent + "%";
}

document.querySelectorAll(".task-select").forEach(t => {
  t.addEventListener("change", updateProgress);
});

["room", "staff", "shift"].forEach(id => {
  document.getElementById(id).addEventListener("change", updateProgress);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = form.querySelector("button");
  btn.disabled = true;
  btn.textContent = "Submitting...";

  try {
    const room = document.getElementById("room").value;
    const staff = document.getElementById("staff").value;
    const shift = document.getElementById("shift").value;
    const notes = document.getElementById("notes").value;

    if (!room || !staff || !shift) {
      throw new Error("Fill all required fields");
    }

    const tasks = {};
    document.querySelectorAll(".task-card").forEach(card => {
      const key = card.dataset.task;
      const value = card.querySelector("select").value;
      tasks[key] = value;
    });

    const { data, error } = await client
      .from("surveys")
      .insert([{ room, staff, shift, notes, created_at: new Date() }])
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
    alert(err.message || "Submission failed");
    console.error(err);
  }

  btn.disabled = false;
  btn.textContent = "Submit Survey";
});

updateProgress();
