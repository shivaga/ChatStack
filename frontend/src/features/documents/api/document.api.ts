import { apiRequest } from "../../../api/http-client";
import { toKnowledgeDocument, type KnowledgeDocument, type KnowledgeDocumentApiResponse } from "../types/document";
type ListDocumentsResponse = { documents: KnowledgeDocumentApiResponse[] };
type UploadResponse = { document: { id: string; status: KnowledgeDocument["status"] }; message: string };
const authorization = (apiKey: string) => ({ Authorization: `Bearer ${apiKey}` });
export async function listDocuments(apiKey: string): Promise<KnowledgeDocument[]> { return (await apiRequest<ListDocumentsResponse>("/api/documents", { headers: authorization(apiKey) })).documents.map(toKnowledgeDocument); }
export async function uploadDocument(apiKey: string, file: File, title?: string): Promise<UploadResponse> { const formData = new FormData(); formData.append("file", file); if (title?.trim()) formData.append("title", title.trim()); return apiRequest<UploadResponse>("/api/documents", { method: "POST", headers: authorization(apiKey), body: formData }); }
