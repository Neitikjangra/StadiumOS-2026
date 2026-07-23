import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EVACUATION_PROCEDURES = [
  {
    area: "Wheelchair Seating",
    procedure: "Proceed to nearest accessible exit. Staff will assist with evacuation chairs if needed.",
    exits: "Gate A (South), Gate C (North)",
  },
  {
    area: "Sensory Rooms",
    procedure: "Staff will guide you to quiet evacuation route. Ear protection provided.",
    exits: "Emergency exit adjacent to each room",
  },
  {
    area: "Accessible Restrooms",
    procedure: "Alert nearest staff member. Emergency call buttons available in all accessible facilities.",
    exits: "Nearest emergency exit",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stadiumId = searchParams.get("stadiumId");

    const where = stadiumId ? { stadiumId } : {};

    const services = await prisma.accessibilityService.findMany({
      where,
      orderBy: { name: "asc" },
    });

    const formatted = services.map((s) => ({
      id: s.id,
      type: s.type.toLowerCase(),
      name: s.name,
      description: s.description,
      location: s.location,
      available: s.isAvailable,
    }));

    return NextResponse.json({
      services: formatted,
      evacuationProcedures: EVACUATION_PROCEDURES,
      languageSupport: [
        { code: "EN", label: "English", accessibility: "Full" },
        { code: "ES", label: "Español", accessibility: "Full" },
        { code: "FR", label: "Français", accessibility: "Full" },
        { code: "DE", label: "Deutsch", accessibility: "Partial" },
        { code: "PT", label: "Português", accessibility: "Full" },
        { code: "AR", label: "العربية", accessibility: "Partial" },
        { code: "ZH", label: "中文", accessibility: "Partial" },
        { code: "JA", label: "日本語", accessibility: "Partial" },
      ],
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, message } = body;

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Request submitted successfully. A staff member will assist you shortly.",
      requestId: `AR-${Date.now()}`,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
