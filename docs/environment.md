# Environment Configuration Guide

## Overview

The Bank Clerk Mock Test Platform uses Vite environment variables prefixed with `VITE_`.

### Environment Variable Rules

1. **Client Safety:** Only variables starting with `VITE_` are bundled into client-side JS code.
2. **No Secrets in Client:** Never include `SUPABASE_SERVICE_ROLE_KEY`, DB passwords, or administrative secret tokens in `VITE_` variables.
3. **Production Mode Behavior:** When running in production (`import.meta.env.PROD`), missing Supabase configuration throws an explicit runtime configuration alert rather than silently falling back to mock data.

---

## Required Production Variables (Netlify)

Configure these in **Netlify Site Settings → Environment Variables**:

| Variable Name | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | The URL of your live Supabase project instance (e.g. `https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Yes | The public anonymous API key for client Supabase requests |

---

## Local Development (.env.local)

Create `.env.local` locally for testing against Supabase or offline mock data:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

If these values are omitted in local development mode (`import.meta.env.DEV`), the application gracefully uses standard in-memory/localStorage seed data.
