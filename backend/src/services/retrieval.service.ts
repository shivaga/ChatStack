import { database } from "../infrastructure/database.js";
import { GeminiService } from "./gemini.service.js";
type SearchHit = { id: string; content: string; title: string; score: number };
const asVector = (values: number[]) => `[${values.join(",")}]`;
export class RetrievalService {
  constructor(private readonly gemini = new GeminiService()) {}
  async search(tenantId: string, query: string, limit = 6): Promise<SearchHit[]> {
    const embedding = await this.gemini.embed(query, "RETRIEVAL_QUERY");
    return (await database.query<SearchHit>(`SELECT chunks.id, chunks.content, documents.title, 1 - (chunks.embedding <=> $2::vector) AS score FROM chunks JOIN documents ON documents.id = chunks.document_id WHERE chunks.tenant_id = $1 AND documents.status = 'ready' ORDER BY chunks.embedding <=> $2::vector LIMIT $3`, [tenantId, asVector(embedding), limit])).rows;
  }
  async answer(tenantId: string, question: string) {
    const hits = await this.search(tenantId, question);
    const answer = await this.gemini.answer(question, hits.map(hit => `${hit.title}: ${hit.content}`));
    return { answer, sources: hits.map(hit => ({ document: hit.title, score: Number(hit.score.toFixed(4)), excerpt: hit.content.slice(0, 280) })) };
  }
}
