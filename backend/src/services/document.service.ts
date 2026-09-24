import multer from "multer";
import { config } from "../config/app.config.js";
import { database } from "../infrastructure/database.js";
import { documentIngestionQueue } from "../queues/document-ingestion.queue.js";

const allowedMimeTypes = new Set(["application/pdf", "text/plain", "text/markdown", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
export class DocumentService {
  readonly upload = multer({ dest: config.uploads.directory, limits: { fileSize: 20 * 1024 * 1024 } });
  async uploadForTenant(tenantId: string, file: Express.Multer.File | undefined, title?: string) {
    if (!file) throw new Error("Attach a file using multipart field name 'file'.");
    if (!allowedMimeTypes.has(file.mimetype)) { const error = new Error("Only PDF, DOCX, TXT, and Markdown are supported."); (error as Error & { status: number }).status = 415; throw error; }
    const result = await database.query<{ id: string; status: string }>("INSERT INTO documents (tenant_id, title, storage_key, metadata) VALUES ($1, $2, $3, $4) RETURNING id, status", [tenantId, title?.trim() || file.originalname, file.path, JSON.stringify({ mimeType: file.mimetype, originalName: file.originalname })]);
    await documentIngestionQueue.add("ingest", { documentId: result.rows[0].id }, { attempts: 3, backoff: { type: "exponential", delay: 2_000 }, removeOnComplete: { age: 3600, count: 500 }, removeOnFail: { age: 86400, count: 1000 } });
    return { document: result.rows[0], message: "Upload accepted and queued for Gemini embedding." };
  }
  async listForTenant(tenantId: string) { return (await database.query("SELECT id, title, status, failure_reason, metadata, created_at FROM documents WHERE tenant_id = $1 ORDER BY created_at DESC", [tenantId])).rows; }
}
