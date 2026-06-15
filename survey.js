const supabaseUrl = "https://cpbkdtcrimppsxlstlob.supabase.co";
const supabaseKey = "PASTE_YOUR_ANON_KEY_HERE";

const client = supabase.createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("surveyForm");
const successScreen = document.getElementById("successScreen");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = form.querySelector("button[type='submit']");
  btn.disabled = true;
  btn.textContent = "Submitting...";

  const room = document.getElementById("room").value;
  const staff = document.getElementById("staff").value;
  const shift = document.getElementById("shift").value;
  const notes = document.getElementById("notes").value;

  const taskCards = document.querySelectorAll(".task-card");

  let tasks = {};

  taskCards.forEach(card => {
    const name = card.querySelector("label").innerText.trim();
    const value = card.querySelector("select").value;
    tasks[name] = value;
  });

  try {
    // 1. Save main survey
    const { data, error } = await client
      .from("surveys")
      .insert([
        { room, staff, shift, notes }
      ])
      .select()
      .single();

    if (error) throw error;

    const surveyId = data.id;

    // 2. Save tasks
    const taskRows = Object.keys(tasks).map(key => ({
      survey_id: surveyId,
      task_name: key,
      completed: tasks[key]
    }));

    const { error: taskError } = await client
      .from("tasks")
      .insert(taskRows);

    if (taskError) throw taskError;

    form.style.display = "none";
    successScreen.style.display = "block";

  } catch (err) {
    console.log(err);
    alert("Submission failed. Check Supabase setup.");
  }

  btn.disabled = false;
  btn.textContent = "Submit Survey";
});
