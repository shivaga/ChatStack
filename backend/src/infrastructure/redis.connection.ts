import IORedis from "ioredis";
import { config } from "../config/app.config.js";
export function createRedisConnection() { return new IORedis(config.redis.url, { maxRetriesPerRequest: null }); }
