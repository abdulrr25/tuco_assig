import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status"); // optional filter

  const messages = await prisma.message.findMany({
    where: statusFilter && statusFilter !== "all"
      ? { status: statusFilter }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200, // cap at 200 rows for performance
  });

  // Stats — always from full DB (ignoring filter)
  const stats = await prisma.message.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const statsMap: Record<string, number> = {
    total: 0, queued: 0, delivered: 0, failed: 0, rate_limited: 0,
  };
  for (const s of stats) {
    statsMap[s.status] = s._count.status;
    statsMap.total += s._count.status;
  }

  return NextResponse.json({ messages, stats: statsMap });
}