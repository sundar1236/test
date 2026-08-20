# Production Release Checklist

## Pre-Deployment Verification Matrix

| Area | Item | Status | Verified By |
|---|---|---|---|
| **Build** | Production build passes without errors (`npm run build`) | PASS | Jules |
| **Types** | TypeScript strict check clean (`npx tsc --noEmit`) | PASS | Jules |
| **Routing** | Netlify SPA redirect configured (`netlify.toml`) | PASS | Jules |
| **Security** | Active exam questions stripped of answer keys | PASS | Jules |
| **Security** | Supabase Row Level Security (RLS) policies active | PASS | Jules |
| **Security** | No secrets in client bundle (`SUPABASE_SERVICE_ROLE_KEY` omitted) | PASS | Jules |
| **Timer** | Absolute timestamp-driven timer prevents local clock tampering | PASS | Jules |
| **UX/UI** | Responsive across 375px–1280px+ viewports without overflow | PASS | Jules |
| **UX/UI** | High contrast text ratios in Light and Dark mode | PASS | Jules |
| **QA** | Student exam attempt → submission → scorecard flow verified | PASS | Jules |
| **QA** | Admin question manager & CSV bulk import flow verified | PASS | Jules |
