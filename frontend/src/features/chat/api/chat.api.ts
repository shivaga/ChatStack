import { authenticatedApiRequest } from "../../../api/http-client";
import type { ChatResponse } from "../types/chat";
export function askQuestion(tenantId: string, question: string) { return authenticatedApiRequest<ChatResponse>(`/api/dashboard/tenants/${tenantId}/chat`, { method: "POST", body: JSON.stringify({ question }) }); }
