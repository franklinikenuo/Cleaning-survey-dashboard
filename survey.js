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
const workDateEl = document.getElementById("work_date");
const progressBar = document.getElementById("progressBar");

/* ================= DATE INIT ================= */
function initDate() {
if (!workDateEl) return;

const today = new Date().toISOString().split("T")[0];

workDateEl.max = today;
workDateEl.value = today;
}

initDate();

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

selects.forEach(select => {
if (select.value) done++;
});

progressBar.style.width =
Math.round((done / total) * 100) + "%";
}

/* ================= TASK COLORS ================= */
function handleTaskColor(select) {
const card = select.closest(".task-card");
if (!card) return;

card.classList.remove("glow-yes", "glow-no", "glow-na");

if (select.value === "Y") {
card.classList.add("glow-yes");
}

if (select.value === "N") {
card.classList.add("glow-no");
}

if (select.value === "NA") {
card.classList.add("glow-na");
}
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

/* ================= SUBMIT ================= */
alert("JS IS UPDATED");
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  console.log("SUBMIT FIRED");

  const btn = form.querySelector("button[type='submit']");
  if (!btn) return;

  btn.disabled = true;
  btn.textContent = "Submitting...";

  try {
    const today = new Date().toISOString().split("T")[0];

    const payload = {
      room: roomEl?.value || "",
      staff: staffEl?.value || "",
      shift: shiftEl?.value || "",
      notes: notesEl?.value || "",
      tasks_completed: getTasks(),
      work_date: workDateEl?.value || today,
      created_at: new Date().toISOString()
    };

    const { error } = await client
      .from("surveys")
      .insert([payload]);

    if (error) throw error;

/* Send Email Notification */
try {
  const { data, error: functionError } =
    await client.functions.invoke("super-processor", {
      body: payload
    });

  console.log("Function Data:", data);

  if (functionError) {
    console.error("Function Error:", functionError);
    alert("Email error: " + JSON.stringify(functionError));
  } else {
    console.log("Email sent successfully");
  }

} catch (emailErr) {
  console.error("Email Function Error:", emailErr);
  alert("Email function failed: " + emailErr.message);
}
    form.style.display = "none";
    successScreen.style.display = "block";

  } catch (err) {
    console.error(err);
    alert(err.message);
  }

  btn.disabled = false;
  btn.textContent = "Submit Survey";
});

/* ================= START ================= */
updateProgress();
