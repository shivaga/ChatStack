import { Worker } from "bullmq";
import { database } from "../infrastructure/database.js";
import { createRedisConnection } from "../infrastructure/redis.connection.js";
import type { DocumentIngestionJob } from "../queues/document-ingestion.queue.js";
import { DocumentParserService } from "../services/document-parser.service.js";
import { GeminiService } from "../services/gemini.service.js";

export class DocumentIngestionWorker {
  private readonly parser = new DocumentParserService(); private readonly gemini = new GeminiService();
  start() {
    return new Worker<DocumentIngestionJob>("document-ingestion", async job => this.process(job.data.documentId), { connection: createRedisConnection() });
  }
  private async process(documentId: string) {
    const result = await database.query<{ id: string; tenant_id: string; storage_key: string; metadata: { mimeType: string } }>("SELECT id, tenant_id, storage_key, metadata FROM documents WHERE id = $1", [documentId]);
    const document = result.rows[0]; if (!document) return;
    await database.query("UPDATE documents SET status = 'processing', failure_reason = NULL WHERE id = $1", [document.id]);
    try {
      const chunks = this.parser.chunk(await this.parser.parse(document.storage_key, document.metadata.mimeType));
      if (!chunks.length) throw new Error("No extractable text was found in this document.");
      await database.query("DELETE FROM chunks WHERE document_id = $1", [document.id]);
      for (const [index, content] of chunks.entries()) {
        const embedding = await this.gemini.embed(content, "RETRIEVAL_DOCUMENT");
        await database.query("INSERT INTO chunks (tenant_id, document_id, content, embedding, chunk_index) VALUES ($1, $2, $3, $4::vector, $5)", [document.tenant_id, document.id, content, `[${embedding.join(",")}]`, index]);
      }
      await database.query("UPDATE documents SET status = 'ready' WHERE id = $1", [document.id]);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown ingestion error";
      await database.query("UPDATE documents SET status = 'failed', failure_reason = $2 WHERE id = $1", [document.id, reason]); throw error;
    }
  }
}
