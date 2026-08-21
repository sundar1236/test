# Setup & Development Guide

**Platform:** Bank Clerk Mock Test Platform
**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
**Backend:** Supabase PostgreSQL + Auth

---

## 1. Prerequisites

* Node.js v18+ and npm
* Supabase Account / Local Supabase CLI

---

## 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set environment variables:

```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 3. Database Initialization

Execute migration scripts in Supabase SQL Editor in order:

1. `supabase/migrations/20240101000000_initial_schema.sql`
2. `supabase/migrations/20240101000001_rls_policies.sql`
3. `supabase/seed.sql`

---

## 4. Local Development

Install dependencies and start development server:

```bash
npm install
npm run dev
```

Build production bundle:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```
