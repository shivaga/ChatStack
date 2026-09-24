# ChatStack architecture

## What the system does

ChatStack creates isolated knowledge bases for tenants. A tenant uploads a document, the background worker parses and chunks it, Gemini produces embeddings, and PostgreSQL stores the vectors. When a user asks a question, the API embeds the question, retrieves the best matching chunks through `pgvector`, then asks Gemini to produce a grounded answer.

## Components

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | React, Vite, TypeScript | Tenant management, uploads, document status, and knowledge chat |
| API | Express, TypeScript | Tenant, document, search, and chat HTTP endpoints |
| Database | Supabase PostgreSQL + pgvector | Tenant data, document records, and chunk embeddings |
| Queue | Redis Cloud + BullMQ | Decouples uploads from document processing |
| Worker | Node.js, BullMQ | Parses, chunks, embeds, and stores documents |
| AI | Google Gemini | Embeddings and grounded answer generation |

## Request flow

```text
Browser → Express API → PostgreSQL
                    ↘ Redis/BullMQ → Worker → Gemini → PostgreSQL/pgvector
Browser → Express /api/chat → Gemini embeddings → pgvector search → Gemini answer
```

## Backend layout

- `config/`: environment validation and application configuration
- `infrastructure/`: PostgreSQL and Redis clients
- `routes/`: HTTP route definitions
- `services/`: tenant logic, parsing, Gemini, retrieval, and documents
- `queues/`: BullMQ queue definitions
- `workers/`: asynchronous document ingestion
- `server.ts`: API process entry point
- `worker.ts`: worker process entry point

## Frontend layout

- `app/`: application bootstrap and React Query client
- `api/`: shared HTTP request helper
- `features/tenants/`: tenant creation and list UI
- `features/documents/`: tenant key, upload, and status UI
- `features/chat/`: chat API client and conversation UI
- `pages/`: page composition

## Tenant isolation and keys

All document, search, and chat requests require `Authorization: Bearer <private tenant key>`. The backend resolves the key to a tenant ID, and all queries are scoped to that ID. A public widget key exists for future public widget endpoints; it must not be used for document uploads or privileged server operations.

## Document lifecycle

`pending` → `processing` → `ready`

If parsing or embedding fails, the status becomes `failed` and the failure reason is stored with the document record.

## Production gaps

Before production, add authentication and authorization for dashboard users, tenant key rotation/revocation, request rate limits, object storage for uploads, observability, backups, and streamed chat responses.
