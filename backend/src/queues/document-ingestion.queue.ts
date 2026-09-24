import { Queue } from "bullmq";
import { createRedisConnection } from "../infrastructure/redis.connection.js";
export type DocumentIngestionJob = { documentId: string };
export const documentIngestionQueue = new Queue<DocumentIngestionJob>("document-ingestion", { connection: createRedisConnection() });
