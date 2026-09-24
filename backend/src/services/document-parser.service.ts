import { readFile } from "node:fs/promises";
import mammoth from "mammoth";
import pdf from "pdf-parse";
export class DocumentParserService {
  async parse(filePath: string, mimeType: string) {
    if (mimeType === "application/pdf") return (await pdf(await readFile(filePath))).text;
    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return (await mammoth.extractRawText({ path: filePath })).value;
    return readFile(filePath, "utf8");
  }
  chunk(text: string, size = 1_000, overlap = 180) {
    const normalized = text.replace(/\s+/g, " ").trim(); const chunks: string[] = [];
    for (let start = 0; start < normalized.length; start += size - overlap) { const chunk = normalized.slice(start, start + size).trim(); if (chunk) chunks.push(chunk); if (start + size >= normalized.length) break; }
    return chunks;
  }
}
