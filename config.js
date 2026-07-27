// ============================================================
// SUPABASE CONFIGURATION
// ============================================================

window.supabaseUrl =
"https://cpbkdtcrimppsxlstlob.supabase.co";


window.supabaseKey =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwYmtkdGNyaW1wcHN4bHN0bG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDEzMTMsImV4cCI6MjA5NjUxNzMxM30.oWvz_eKGwP7Po0SfSCHDNStCJanpn-c-gqaOkAjCJMI";


// Create shared Supabase client

window.client =
supabase.createClient(
    window.supabaseUrl,
    window.supabaseKey
);


console.log(
    "✅ Supabase connected"
);
