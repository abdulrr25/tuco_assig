import { prisma } from "@/lib/prisma";
import { messageQueue } from "@/lib/queue";
import { messageSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body) || body.length < 1 || body.length > 50) {
      return NextResponse.json(
        { success: false, error: "Payload must be an array of 10–50 messages" },
        { status: 400 }
      );
    }

    const priorityMap = { high: 1, normal: 2, low: 3 };
    let queued = 0;
    const errors: { index: number; errors: unknown }[] = [];

    for (let i = 0; i < body.length; i++) {
      const parsed = messageSchema.safeParse(body[i]);

      if (!parsed.success) {
        errors.push({ index: i, errors: parsed.error.flatten().fieldErrors });
        continue; // skip invalid, keep going
      }

      const data = parsed.data;
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

      await messageQueue.add(
        "send-message",
        { messageId: message.id },
        { priority: priorityMap[data.priority] }
      );

      queued++;
    }

    return NextResponse.json({
      success: true,
      queued,
      failed_validation: errors.length,
      errors,
    });
  } catch (err) {
    console.error("[bulk webhook error]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}