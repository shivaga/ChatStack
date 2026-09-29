import { authenticatedApiRequest } from "../../../api/http-client";
import { toKnowledgeDocument, type KnowledgeDocument, type KnowledgeDocumentApiResponse } from "../types/document";
type ListDocumentsResponse = { documents: KnowledgeDocumentApiResponse[] };
type UploadResponse = { document: { id: string; status: KnowledgeDocument["status"] }; message: string };
export async function listDocuments(tenantId: string): Promise<KnowledgeDocument[]> { return (await authenticatedApiRequest<ListDocumentsResponse>(`/api/dashboard/tenants/${tenantId}/documents`)).documents.map(toKnowledgeDocument); }
export async function uploadDocument(tenantId: string, file: File, title?: string): Promise<UploadResponse> { const formData = new FormData(); formData.append("file", file); if (title?.trim()) formData.append("title", title.trim()); return authenticatedApiRequest<UploadResponse>(`/api/dashboard/tenants/${tenantId}/documents`, { method: "POST", body: formData }); }
