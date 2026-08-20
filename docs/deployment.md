# Netlify Deployment Guide

## Step-by-Step Deployment Procedure

```text
Create Netlify Site
       ↓
Connect Git Repository
       ↓
Configure Build Command (npm run build)
       ↓
Configure Publish Directory (dist)
       ↓
Configure Environment Variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
       ↓
Deploy & Verify
```

### 1. Connect Repository
1. Log in to [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** → **Import an existing project**.
3. Authorize GitHub and select your repository branch `jules/phase-3d-mock-test-engine`.

### 2. Configure Build Settings
* **Build Command:** `npm run build`
* **Publish Directory:** `dist`
* **Functions Directory:** (leave default)

### 3. Add Environment Variables
In **Site Settings → Environment Variables**, add:
* `VITE_SUPABASE_URL`: Your Supabase Project URL
* `VITE_SUPABASE_ANON_KEY`: Your Supabase Public Anonymous Key

### 4. SPA Routing
The included `netlify.toml` automatically handles SPA fallback redirects:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
This guarantees direct browser navigation and page reloads on nested routes (`/exam/:id`, `/results/:id`, `/admin/questions`, etc.) render cleanly without 404 errors.
