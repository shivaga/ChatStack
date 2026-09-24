import "./config/app.config.js";
import { DocumentIngestionWorker } from "./workers/document-ingestion.worker.js";

new DocumentIngestionWorker().start();
console.log("ChatStack document-ingestion worker started");
