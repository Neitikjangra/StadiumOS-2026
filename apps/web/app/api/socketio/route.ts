import { NextRequest, NextResponse } from "next/server";
import { getSocketServer } from "@/lib/socket";

export async function GET(req: NextRequest) {
  const io = getSocketServer();
  if (!io) {
    return NextResponse.json(
      { success: false, error: "Socket.IO not initialized" },
      { status: 503 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      status: "active",
      connections: io.engine.clientsCount,
    },
  });
}
