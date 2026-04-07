import { Job, Worker } from "bullmq";
import { prisma } from "../lib/prisma";
import { redisConnection } from "../lib/queue";

// Random delay between min and max ms
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const worker = new Worker(
  "outbound-messages",
  async (job: Job) => {
    const { messageId } = job.data;

    // Simulate network latency (1–3 seconds)
    await sleep(randomBetween(1000, 3000));

    // Determine outcome based on probability
    const roll = Math.random();
    let outcome: "delivered" | "failed" | "rate_limited";

    if (roll < 0.80) outcome = "delivered";
    else if (roll < 0.95) outcome = "failed";
    else outcome = "rate_limited";

    console.log(`[worker] Job ${job.id} | Message ${messageId} → ${outcome}`);

    if (outcome === "delivered") {
      await prisma.message.update({
        where: { id: messageId },
        data: { status: "delivered", deliveredAt: new Date() },
      });
    } else if (outcome === "failed") {
      await prisma.message.update({
        where: { id: messageId },
        data: { status: "failed" },
      });
      // Throw error WITHOUT retrying — BullMQ won't retry if we mark it done
      // We handle this by NOT throwing; job completes as "done" but DB says failed
    } else {
      // rate_limited — update DB and throw so BullMQ retries with backoff
      await prisma.message.update({
        where: { id: messageId },
        data: { status: "rate_limited", retryCount: { increment: 1 } },
      });
      throw new Error("rate_limited"); // triggers BullMQ retry + backoff
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // process up to 5 jobs at once
  }
);

worker.on("completed", (job) => console.log(`✅ Job ${job.id} completed`));
worker.on("failed", (job, err) => console.log(`❌ Job ${job?.id} failed: ${err.message}`));

console.log("🚀 Worker started, listening for jobs...");