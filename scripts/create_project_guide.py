from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "ChatStack_Project_Plan_and_Setup_Guide.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleCS", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=29, leading=34, textColor=colors.HexColor("#101C3A"), spaceAfter=12))
styles.add(ParagraphStyle(name="SubCS", parent=styles["Normal"], fontSize=11, leading=16, textColor=colors.HexColor("#4B5B7A"), spaceAfter=16))
styles.add(ParagraphStyle(name="H1CS", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=18, leading=22, textColor=colors.HexColor("#173A77"), spaceBefore=15, spaceAfter=9))
styles.add(ParagraphStyle(name="H2CS", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=colors.HexColor("#173A77"), spaceBefore=9, spaceAfter=5))
styles.add(ParagraphStyle(name="BodyCS", parent=styles["BodyText"], fontSize=9.4, leading=14, textColor=colors.HexColor("#1F2B43"), spaceAfter=7))
styles.add(ParagraphStyle(name="CodeCS", parent=styles["Code"], fontName="Courier", fontSize=8, leading=11, backColor=colors.HexColor("#F1F5FB"), borderColor=colors.HexColor("#D4E0F2"), borderWidth=.5, borderPadding=7, spaceAfter=9))
styles.add(ParagraphStyle(name="FooterCS", parent=styles["Normal"], alignment=TA_CENTER, fontSize=8, textColor=colors.HexColor("#667898")))

def p(text, style="BodyCS"):
    if style == "CodeCS":
        text = text.replace("\n", "<br/>")
    return Paragraph(text, styles[style])

def table(rows, widths):
    t = Table([[p(cell, "BodyCS") for cell in row] for row in rows], colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#173A77")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("GRID", (0,0), (-1,-1), .35, colors.HexColor("#C8D7ED")),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#F7FAFE")]),
        ("LEFTPADDING", (0,0), (-1,-1), 7), ("RIGHTPADDING", (0,0), (-1,-1), 7),
        ("TOPPADDING", (0,0), (-1,-1), 5), ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ]))
    return t

def footer(canvas, doc):
    canvas.saveState(); canvas.setStrokeColor(colors.HexColor("#D5E0F0")); canvas.line(18*mm, 13*mm, 192*mm, 13*mm)
    canvas.setFont("Helvetica", 8); canvas.setFillColor(colors.HexColor("#667898")); canvas.drawCentredString(105*mm, 8*mm, f"ChatStack - implementation guide - {doc.page}"); canvas.restoreState()

doc = SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=20*mm)
story = [p("ChatStack", "TitleCS"), p("Multi-tenant RAG-as-a-Service - Project plan, starter-template inventory, and local setup", "SubCS")]
story += [p("Purpose", "H1CS"), p("This guide converts the supplied product specification into a practical Phase 1 implementation plan. The repository contains a runnable UI/API starter and local infrastructure foundation; OpenAI, Google OAuth, persisted database access, document parsing, and the production worker are deliberately staged after environment credentials are provided.")]
story += [p("Architecture at a glance", "H1CS"), table([
    ["Layer", "Selected technology", "Role"],
    ["Dashboard", "React + TypeScript + Vite + React Query", "Tenant dashboard, one-time API key UX, document/chat/widget screens in later slices."],
    ["API", "Node.js + Express + TypeScript", "Session routes, tenant control plane, tenant-scoped document/search/chat APIs."],
    ["Data", "PostgreSQL + pgvector", "Users, tenants, documents, chunks and 1536-dimension embeddings."],
    ["Async", "Redis + BullMQ", "Ingestion queue, retry/dead-letter policy, rate-limit counters."],
    ["AI", "OpenAI API", "Embeddings and streamed RAG completion after credentials are configured."],
    ["Deployment", "AWS ECS, RDS, ElastiCache, S3, CloudFront, Secrets Manager", "Phase 2 production topology."],
], [35*mm, 58*mm, 63*mm])]
story += [p("Security boundary", "H2CS"), p("A dashboard user owns tenants. Each tenant receives a private server API key, stored only as a hash, and a distinct public widget key. Tenant identity must always come from authentication, not a request body or URL parameter. The public widget has an independent rate-limit budget.")]
story.append(PageBreak())
story += [p("Repository layout", "H1CS"), table([
    ["Path", "Contents / reason"],
    ["package.json", "Workspace commands for starting and building both applications."],
    ["docker-compose.yml", "Local pgvector-enabled PostgreSQL and Redis services."],
    [".env.example", "Required local configuration values; never commit the copied .env file."],
    ["backend/src/server.ts", "Express health endpoint and initial tenant endpoint, including the show-once private-key flow."],
    ["backend/src/queue.ts and worker.ts", "BullMQ connection and an intentionally explicit ingestion worker placeholder."],
    ["backend/db/init.sql", "Initial tables and HNSW vector index: users, tenants, API keys, documents, chunks."],
    ["frontend/src/main.tsx", "Dashboard starter: tenant list, creation flow, one-time key display and copy action."],
    ["frontend/src/styles.css", "Responsive dark dashboard styling for the starter UI."],
    ["README.md", "Fast local setup and the boundary between current starter code and production work."],
], [57*mm, 99*mm])]
story += [p("Local commands", "H1CS"), p("Run these from the ChatStack directory. Docker Desktop must be running before the infrastructure command."),
          p("Copy-Item .env.example .env\nDocker compose up -d\nnpm install\nnpm run dev\n# API check: http://localhost:3000/health\n# Dashboard: http://localhost:5173\nnpm run build\nnpm run worker -w backend", "CodeCS")]
story += [p("Configuration required before full functionality", "H2CS"), p("Set OPENAI_API_KEY for embeddings and generation. Create a Google OAuth client, set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and the callback URL, then add Passport plus a Redis-backed session store. The starter itself is safe to browse without these values; it does not claim to perform OAuth or AI work yet.")]
story.append(PageBreak())
story += [p("Phase 1 delivery sequence", "H1CS"), table([
    ["Slice", "Deliverable", "Definition of done"],
    ["1. Foundation", "Compose, schema, app shells", "Postgres with vector extension and Redis run locally; health endpoint answers."],
    ["2. Identity", "Google OAuth + Redis sessions", "Login, /me and logout work; dashboard routes require a session."],
    ["3. Tenant control plane", "CRUD + secure API keys", "Raw key shown once, hash stored, regenerate/revoke audited."],
    ["4. Documents", "Multipart upload + local/S3-compatible storage", "Tenant API key scopes every operation; status is visible."],
    ["5. Ingestion", "Parse -> chunk -> embed -> store worker", "A real PDF progresses pending to ready, retries safely on failure."],
    ["6. Retrieval and chat", "Top-k search + streaming RAG", "Citations/context are tenant scoped; first token is streamed."],
    ["7. Widget", "Public config/chat route", "Separate public key, origin policy and independent rate limits."],
    ["8. Product polish", "Dashboard pages, errors, dark/light, responsive", "Tenant journey is usable end to end."],
], [24*mm, 57*mm, 75*mm])]
story += [p("Backend endpoint plan", "H1CS"), p("Session authenticated: GET /auth/google, GET /auth/google/callback, GET /me, POST /auth/logout, and tenant create/list/detail/delete/key-rotation routes. Tenant API-key authenticated: document upload/list/detail/update/delete, POST /search and POST /chat. Public-key authenticated: widget config and widget chat. Cross-cutting routes include GET /health, centralized errors, request logging and Redis token-bucket limits.")]
story += [p("Frontend plan", "H1CS"), p("Build in the same order as the API slices: login/callback and UserContext; tenant dashboard; create-tenant dialog with one-time secret; tenant documents with drag/drop and status polling; chat test console; widget embed-snippet generator; settings and danger zone. Keep session-cookie requests separate from private bearer-key requests.")]
story.append(PageBreak())
story += [p("Phase 2 - AWS delivery plan", "H1CS"), p("Deploy the static frontend to S3 behind CloudFront. Place the stateless Express API behind an Application Load Balancer on ECS Fargate. Run BullMQ as a distinct ECS worker service so document ingestion can scale independently. Use RDS PostgreSQL with pgvector and RDS Proxy, ElastiCache Redis, S3 for raw documents, and Secrets Manager for OAuth, OpenAI and database credentials.")]
story += [p("Target operating envelope from the specification", "H2CS"), table([
    ["Metric", "Target"], ["Active tenants", "1,000"], ["Indexed documents", "100,000"], ["Embedded chunks", "Approximately 5,000,000"], ["Chat load", "20 RPS sustained; 100 RPS peak"], ["Vector search p95", "Under 150 ms"], ["Chat p95 / first token", "Under 2.5 s / under 600 ms target"], ["Availability", "99.5%"],
], [65*mm, 91*mm])]
story += [p("Operational decisions", "H2CS"), p("Use HNSW on pgvector and scope queries by tenant_id. Cache hot API-key lookups and rate-limit counters in Redis. Add exponential retries and a dead-letter path for ingestion, make jobs idempotent per document, and add a circuit breaker around OpenAI chat calls. Add a read replica when search load warrants it and partition chunks if large tenants dominate.")]
story += [p("Recommended next implementation task", "H1CS"), p("Start with database persistence and Google OAuth after supplying the OAuth credentials. That turns the visible dashboard into an authenticated tenant-control plane. Next, connect upload storage and the worker; do not expose search or chat until ingestion and tenant-key verification are proven against a real PDF.")]

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
