import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GATE_POSITIONS: Record<string, { x: string; y: string }> = {
  "Gate A": { x: "5%", y: "45%" },
  "Gate B": { x: "70%", y: "10%" },
  "Gate C": { x: "90%", y: "45%" },
  "Gate D": { x: "70%", y: "85%" },
  "Gate E": { x: "5%", y: "85%" },
  "Gate F": { x: "30%", y: "5%" },
  "Gate G": { x: "50%", y: "5%" },
  "Gate H": { x: "95%", y: "25%" },
};

const FACILITY_POSITIONS: Record<string, { x: string; y: string }> = {
  "Burger King": { x: "25%", y: "20%" },
  "Papa Johns": { x: "75%", y: "20%" },
  "Coca-Cola Stand": { x: "25%", y: "80%" },
  "Budweiser Bar": { x: "75%", y: "80%" },
  "Pizza Hut": { x: "15%", y: "30%" },
  "Subway": { x: "85%", y: "30%" },
  "Starbucks": { x: "50%", y: "15%" },
  "Taco Bell": { x: "15%", y: "70%" },
  "Wendys": { x: "85%", y: "70%" },
  "Dunkin": { x: "50%", y: "85%" },
};

const RESTROOM_POSITIONS: Record<string, { x: string; y: string }> = {
  "Restrooms A": { x: "15%", y: "50%" },
  "Restrooms B": { x: "85%", y: "50%" },
  "Restrooms C": { x: "50%", y: "25%" },
  "Restrooms D": { x: "50%", y: "75%" },
  "Restrooms E": { x: "25%", y: "40%" },
  "Restrooms F": { x: "75%", y: "40%" },
  "Restrooms G": { x: "25%", y: "60%" },
  "Restrooms H": { x: "75%", y: "60%" },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stadiumId = searchParams.get("stadiumId");

    const where = stadiumId ? { id: stadiumId } : { isDeleted: false };

    const stadium = await prisma.stadium.findFirst({
      where,
      include: {
        gates: { orderBy: { name: "asc" } },
        concessions: { orderBy: { name: "asc" } },
        restrooms: { orderBy: { name: "asc" } },
        hostCity: true,
      },
    });

    if (!stadium) {
      return NextResponse.json({ error: "Stadium not found" }, { status: 404 });
    }

    const gates = stadium.gates.map((g) => ({
      name: g.name,
      status: g.status === "open" ? "open" : g.status === "closed" ? "closed" : "restricted",
      crowd: g.throughput > 300 ? "high" : g.throughput > 100 ? "medium" : "low",
      waitTime: g.waitTime,
      flowIn: g.flowIn,
      flowOut: g.flowOut,
      throughput: g.throughput,
      x: GATE_POSITIONS[g.name]?.x ?? `${20 + Math.random() * 60}%`,
      y: GATE_POSITIONS[g.name]?.y ?? `${20 + Math.random() * 60}%`,
    }));

    const facilities = [
      ...stadium.concessions.map((c) => ({
        type: "food",
        name: c.name,
        waitTime: `${Math.floor(Math.random() * 10)} min`,
        distance: `${Math.floor(Math.random() * 50 + 10)}m`,
        rating: null,
        x: FACILITY_POSITIONS[c.name]?.x ?? `${15 + Math.random() * 70}%`,
        y: FACILITY_POSITIONS[c.name]?.y ?? `${15 + Math.random() * 70}%`,
      })),
      ...stadium.restrooms.map((r) => ({
        type: "restroom",
        name: r.name,
        waitTime: "0 min",
        distance: `${Math.floor(Math.random() * 50 + 10)}m`,
        rating: null,
        x: RESTROOM_POSITIONS[r.name]?.x ?? `${15 + Math.random() * 70}%`,
        y: RESTROOM_POSITIONS[r.name]?.y ?? `${15 + Math.random() * 70}%`,
      })),
    ];

    const nearbyFacilities = facilities.slice(0, 4).map((f) => ({
      type: f.type === "food" ? "Food" : "Restroom",
      name: f.name,
      waitTime: f.waitTime,
      distance: f.distance,
    }));

    return NextResponse.json({
      stadium: { id: stadium.id, name: stadium.name, city: stadium.hostCity?.name ?? "" },
      gates,
      facilities,
      nearbyFacilities,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
