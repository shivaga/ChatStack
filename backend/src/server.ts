import { mkdir } from "node:fs/promises";
import cors from "cors";
import express from "express";
import { config } from "./config/app.config.js";
import { database } from "./infrastructure/database.js";
import { createDocumentRouter } from "./routes/document.routes.js";
import { createRagRouter } from "./routes/rag.routes.js";
import { createTenantRouter } from "./routes/tenant.routes.js";

const app = express();
app.use(cors({ origin: config.server.frontendOrigin }));
app.use(express.json());
app.get("/health", async (_req, res, next) => { try { await database.query("SELECT 1"); res.json({ status: "ok", service: "chatstack-api" }); } catch (error) { next(error); } });
app.use("/api/tenants", createTenantRouter());
app.use("/api/documents", createDocumentRouter());
app.use("/api", createRagRouter());
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => { console.error(error); const status = typeof error === "object" && error && "status" in error ? Number((error as { status: number }).status) : (error instanceof Error && error.message.includes("Gemini") ? 502 : 500); res.status(status).json({ error: error instanceof Error ? error.message : "Unexpected error" }); });
mkdir(config.uploads.directory, { recursive: true }).then(() => app.listen(config.server.port, () => console.log(`ChatStack API listening on http://localhost:${config.server.port}`))).catch(error => { console.error("Unable to create upload directory", error); process.exit(1); });
