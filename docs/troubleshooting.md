# Production Troubleshooting & Diagnostics

## Common Diagnostics & Resolutions

### 1. 404 Error on Direct Page Refresh
* **Symptom:** Refreshing `/exam/test-sbi-clerk-full-01` or `/admin/questions` produces a Netlify 404 page.
* **Root Cause:** Missing SPA client routing redirect.
* **Resolution:** Ensure `netlify.toml` is located at the repository root containing:
  ```toml
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```

---

### 2. Missing Supabase Environment Variables
* **Symptom:** API calls fail or display explicit configuration alerts in production.
* **Resolution:** Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured in Netlify Environment Variables settings and trigger a site redeploy.

---

### 3. Exam Attempt Timed Out / Local Clock Desync
* **Symptom:** Student timer jumps or submits unexpectedly.
* **Root Cause:** System local clock desynchronization.
* **Resolution:** The platform tracks `startedAtMs` and calculates `endTime = startedAtMs + durationMinutes * 60 * 1000`. Ensure server/network time is synchronized.
