import { apiRequest } from "../../../api/http-client";
import type { ChatResponse } from "../types/chat";
export function askQuestion(apiKey: string, question: string) { return apiRequest<ChatResponse>("/api/chat", { method: "POST", headers: { Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ question }) }); }
