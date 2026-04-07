import { prisma } from "@/lib/prisma";
import { messageQueue } from "@/lib/queue";
import { messageSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input — Zod returns a clean error if anything is wrong
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Save to SQLite first, then queue
    const message = await prisma.message.create({
      data: {
        contactId: data.contact_id,
        contactName: data.contact_name,
        phone: data.phone,
        messageText: data.message_text,
        campaignId: data.campaign_id,
        priority: data.priority,
        status: "queued",
      },
    });

    // Priority map — BullMQ uses numbers (lower = higher priority)
    const priorityMap = { high: 1, normal: 2, low: 3 };

    await messageQueue.add(
      "send-message",
      { messageId: message.id }, // only pass the ID — worker fetches full record
      { priority: priorityMap[data.priority] }
    );

    return NextResponse.json({
      success: true,
      message_id: message.id,
      status: "queued",
    });
  } catch (err) {
    console.error("[incoming webhook error]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}