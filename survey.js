const supabaseUrl = "https://cpbkdtcrimppsxlstlob.supabase.co";

// 👉 PUT YOUR REAL ANON KEY HERE (only here)
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwYmtkdGNyaW1wcHN4bHN0bG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDEzMTMsImV4cCI6MjA5NjUxNzMxM30.oWvz_eKGwP7Po0SfSCHDNStCJanpn-c-gqaOkAjCJMI";

const client = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase ready:", client);

const form = document.getElementById("surveyForm");
const successScreen = document.getElementById("successScreen");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  console.log("Submit started");

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
    // STEP 1: insert survey
    const { data, error } = await client
      .from("surveys")
      .insert([{ room, staff, shift, notes }])
      .select()
      .single();

    if (error) {
      console.log("Survey error:", error);
      throw error;
    }

    console.log("Survey saved:", data);

    // STEP 2: insert tasks
    const taskRows = Object.keys(tasks).map(t => ({
      survey_id: data.id,
      task_name: t,
      completed: tasks[t]
    }));

    const { error: taskError } = await client
      .from("tasks")
      .insert(taskRows);

    if (taskError) {
      console.log("Task error:", taskError);
      throw taskError;
    }

    console.log("Tasks saved");

    form.style.display = "none";
    successScreen.style.display = "block";

  } catch (err) {
    console.log("FULL ERROR:", err);
    alert(err.message || JSON.stringify(err));
  }
});
