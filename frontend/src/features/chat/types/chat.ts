export type ChatSource = { document: string; score: number; excerpt: string };
export type ChatResponse = { answer: string; sources: ChatSource[] };
export type ChatMessage = { id: string; role: "user" | "assistant"; content: string; sources?: ChatSource[] };
