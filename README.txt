DDS EXPO GitHub + Supabase ready.
IMPORTANT: Upload the CONTENTS of this folder to the ROOT of your GitHub repository.
index.html must be directly in the repository root.
admin.html is the separate admin panel.
First create Supabase, run supabase.sql, create public bucket dds-media, create Auth user, add that user's UUID to admin_users, then put Supabase URL and publishable/anon key in js/config.js.
Do not put a secret/service_role key in the website.
Public URL: https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
Admin URL: https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/admin.html