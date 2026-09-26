# Ambesh.dev — Online Portfolio + Admin

This version is designed for **GitHub Pages + Supabase**.

## What it does
- Premium responsive portfolio
- Projects loaded from Supabase
- Multiple screenshots per project
- Cover image + project gallery
- Live website link
- Light / dark theme
- Pricing managed from Admin
- Website/profile settings managed from Admin
- Client enquiries stored in Supabase
- Secure Supabase email/password admin login
- Project images stored in Supabase Storage
- No Node.js server required for the public website

## 1. Create Supabase project
Create a free Supabase project.

Open **SQL Editor** and run `supabase-schema.sql`.

Then open **Authentication → Users → Add user** and create your admin email/password.
Copy the new user's UUID.

At the bottom of `supabase-schema.sql`, run:

```sql
insert into public.admins(user_id) values ('YOUR-ADMIN-USER-UUID');
```

## 2. Configure the website
Open `supabase-config.js` and replace:

```js
window.SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
window.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_PUBLIC_KEY';
```

Use the **Project URL** and **anon/public key** from Supabase Project Settings → API.

**Never put the `service_role` key in this project or on GitHub.**

## 3. Test locally
You can simply open `index.html` with a local web server. VS Code Live Server is recommended.

Do not use `file://` if your browser blocks modules/resources. Live Server is easiest.

## 4. GitHub Pages
Upload all files to the root of your GitHub repository.

In GitHub:
Settings → Pages → Deploy from branch → `main` → `/ (root)` → Save.

Your public site will be available at your GitHub Pages URL.

Admin panel:

`https://YOUR-USERNAME.github.io/YOUR-REPO/admin.html`

Login with the Supabase admin email/password you created.

## 5. Project images
Admin → Projects → Add Project.

Upload:
- Cover Screenshot
- Multiple Website Screenshots / Gallery
- Optional Live Website URL

Images are stored in the `project-images` Supabase Storage bucket. They are not stored in GitHub.

## Security
- Public visitors can read projects, active pricing and site settings.
- Public visitors can submit enquiries.
- Only users listed in `public.admins` can manage projects, pricing, settings, enquiries and project images.
- Supabase Authentication handles the admin password.
