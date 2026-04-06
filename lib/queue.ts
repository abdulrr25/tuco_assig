import { Queue } from "bullmq";
import IORedis from "ioredis";

// Redis connection — shared across queue and worker
export const redisConnection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

// The single queue — workers pull jobs from here
export const messageQueue = new Queue("outbound-messages", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // max retries (used for rate_limited)
    backoff: {
      type: "exponential",
      delay: 2000, // starts at 2s, then 4s, then 8s
    },
  },
});