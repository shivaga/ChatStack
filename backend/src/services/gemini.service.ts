import { config } from "../config/app.config.js";
type GeminiPart = { text?: string };
const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
export class GeminiService {
  private async request<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${baseUrl}/${path}?key=${encodeURIComponent(config.gemini.apiKey)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error(`Gemini request failed (${response.status}): ${await response.text()}`);
    return response.json() as Promise<T>;
  }
  async embed(text: string, taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY") {
    const model = config.gemini.embeddingModel;
    return (await this.request<{ embedding: { values: number[] } }>(`${model}:embedContent`, { model: `models/${model}`, content: { parts: [{ text }] }, taskType, outputDimensionality: 1536 })).embedding.values;
  }
  async answer(question: string, context: string[]) {
    const contextBlock = context.length ? `\n\nRetrieved tenant context:\n${context.map((item, index) => `[${index + 1}] ${item}`).join("\n\n")}` : "";
    const result = await this.request<{ candidates?: Array<{ content?: { parts?: GeminiPart[] } }> }>(`${config.gemini.chatModel}:generateContent`, { systemInstruction: { parts: [{ text: "You are ChatStack, a retrieval assistant. Answer only from supplied tenant context. If context is missing or insufficient, say so plainly." }] }, contents: [{ role: "user", parts: [{ text: `Question: ${question}${contextBlock}` }] }] });
    const answer = result.candidates?.[0]?.content?.parts?.map(part => part.text ?? "").join("").trim();
    if (!answer) throw new Error("Gemini returned no answer."); return answer;
  }
}
