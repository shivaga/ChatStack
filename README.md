# ChatStack

ChatStack is a multi-tenant RAG (retrieval-augmented generation) service. Each tenant owns isolated documents and uses a private tenant API key to upload documents, search knowledge, and ask Gemini-grounded questions.

The project is documented in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/API_TESTING.md](docs/API_TESTING.md).

## Tech stack

- React, TypeScript, Vite, and TanStack React Query
- Node.js, Express, TypeScript, Zod, and Multer
- Supabase PostgreSQL with `pgvector`
- Redis Cloud and BullMQ for background ingestion jobs
- Google Gemini for embeddings and answers

## Prerequisites

- Node.js 20 or later
- A Supabase PostgreSQL database with the `vector` extension enabled
- A Redis Cloud database configured with the `noeviction` policy
- A Gemini API key

## Configure

Copy `.env.example` to `.env`, then set the real values for `DATABASE_URL`, `REDIS_URL`, and `GEMINI_API_KEY`. Never commit `.env`.

Run the SQL schema once in the Supabase SQL editor:

```sql
-- Paste the contents of backend/db/init.sql
```

## Run locally

Install dependencies once:

```powershell
npm install
```

Run these commands in separate terminals:

```powershell
npm run dev -w backend
npm run worker -w backend
npm run dev -w frontend
```

Open `http://localhost:5173`. The backend health endpoint is `http://localhost:3000/health`.

## Build

```powershell
npm run build
```

## Security note

The private tenant key is shown once at creation. The frontend keeps a pasted key only in browser session storage, while the backend stores only a SHA-256 hash. Do not use tenant private keys in a public browser widget.
