import dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config({ path: resolve(__dirname, "..", "..", "..", ".env") });
function required(name: string) { const value = process.env[name]; if (!value) throw new Error(`${name} is required. Add it to the project-root .env file.`); return value; }

export const config = {
  server: { port: Number(process.env.PORT ?? 3000), frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173" },
  database: { url: required("DATABASE_URL"), useTls: process.env.DATABASE_SSL !== "false" },
  redis: { url: required("REDIS_URL") },
  supabase: { url: required("SUPABASE_URL"), publishableKey: required("SUPABASE_PUBLISHABLE_KEY") },
  gemini: { apiKey: required("GEMINI_API_KEY"), chatModel: process.env.GEMINI_CHAT_MODEL ?? "gemini-2.5-flash", embeddingModel: process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001" },
  uploads: { directory: resolve(__dirname, "..", "..", "..", process.env.UPLOAD_DIR ?? "uploads") }
};
