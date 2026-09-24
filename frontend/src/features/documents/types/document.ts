export type KnowledgeDocumentStatus = "pending" | "processing" | "ready" | "failed";
export type KnowledgeDocument = { id: string; title: string; status: KnowledgeDocumentStatus; failureReason: string | null; createdAt: string; originalName?: string };
export type KnowledgeDocumentApiResponse = { id: string; title: string; status: KnowledgeDocumentStatus; failure_reason: string | null; created_at: string; metadata: { originalName?: string } | string | null };
export function toKnowledgeDocument(document: KnowledgeDocumentApiResponse): KnowledgeDocument {
  const metadata = typeof document.metadata === "string" ? JSON.parse(document.metadata) as { originalName?: string } : document.metadata;
  return { id: document.id, title: document.title, status: document.status, failureReason: document.failure_reason, createdAt: document.created_at, originalName: metadata?.originalName };
}
