import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function ago(mins: number) { return new Date(Date.now() - mins * 60_000); }

async function main() {
  console.log("Seeding live data...\n");

  // 1. Update gates with flow metrics
  const gates = await prisma.gate.findMany();
  for (const gate of gates) {
    const flowIn = rnd(50, 1200);
    const flowOut = rnd(20, 800);
    const queueLen = rnd(5, 300);
    const waitTime = rnd(1, 20);
    const throughput = Math.floor(gate.capacity * (0.6 + Math.random() * 0.35));
    await prisma.gate.update({
      where: { id: gate.id },
      data: { flowIn, flowOut, throughput, queueLength: queueLen, waitTime },
    });
  }
  console.log(`  Updated ${gates.length} gates with flow metrics`);

  // 2. Update zones with occupancy
  const zones = await prisma.zone.findMany();
  for (const zone of zones) {
    const pct = 0.3 + Math.random() * 0.65;
    const current = Math.floor(zone.capacity * pct);
    const density = pct > 0.85 ? "critical" : pct > 0.7 ? "high" : pct > 0.5 ? "moderate" : "low";
    const trends = ["up", "down", "stable"] as const;
    const trend = trends[rnd(0, 2)];
    await prisma.zone.update({
      where: { id: zone.id },
      data: { currentOccupancy: current, density, trend },
    });
  }
  console.log(`  Updated ${zones.length} zones with occupancy data`);

  // 3. Create queue snapshots spread over last 2 hours (20 per stadium)
  const stadiumIds = [...new Set(gates.map(g => g.stadiumId))];
  let snapshotCount = 0;
  for (const sid of stadiumIds) {
    const stadiumGates = gates.filter(g => g.stadiumId === sid);
    const stadiumZones = zones.filter(z => z.stadiumId === sid);
    for (let i = 0; i < 20; i++) {
      const gate = stadiumGates[rnd(0, stadiumGates.length - 1)];
      const zone = stadiumZones[rnd(0, stadiumZones.length - 1)];
      const queueTypes = ["entry_gate", "security_check", "food_beverage", "restroom", "ticket_office"] as const;
      const statuses = ["normal", "elevated", "congested", "critical"] as const;
      await prisma.queueSnapshot.create({
        data: {
          stadiumId: sid,
          gateId: gate.id,
          zoneId: zone.id,
          queueType: queueTypes[rnd(0, queueTypes.length - 1)],
          length: rnd(5, 250),
          waitTime: rnd(1, 25),
          status: statuses[rnd(0, 3)],
          timestamp: ago(120 - i * 6),
        },
      });
      snapshotCount++;
    }
  }
  console.log(`  Created ${snapshotCount} queue snapshots`);

  // 4. Create match events for each match
  const matches = await prisma.match.findMany();
  let eventCount = 0;
  for (const match of matches) {
    const events = [
      { time: "12'", type: "goal", team: "home", event: `Goal - ${match.homeTeamName} #7`, player: "#7" },
      { time: "23'", type: "card", team: "away", event: `Yellow Card - ${match.awayTeamName} #10`, player: "#10" },
      { time: "35'", type: "goal", team: "away", event: `Goal - ${match.awayTeamName} #9`, player: "#9" },
      { time: "41'", type: "sub", team: "home", event: `Substitution - ${match.homeTeamName} #14 ON`, player: "#14" },
      { time: "45+2'", type: "goal", team: "home", event: `Goal - ${match.homeTeamName} #11`, player: "#11" },
      { time: "56'", type: "var", team: "none", event: "VAR Review - Offside Check", player: "" },
      { time: "67'", type: "sub", team: "away", event: `Substitution - ${match.awayTeamName} #21 ON`, player: "#21" },
      { time: "72'", type: "card", team: "home", event: `Yellow Card - ${match.homeTeamName} #3`, player: "#3" },
      { time: "78'", type: "goal", team: "home", event: `Goal - ${match.homeTeamName} #10`, player: "#10" },
    ];
    for (const evt of events) {
      await prisma.matchEvent.create({
        data: { matchId: match.id, ...evt },
      });
      eventCount++;
    }
  }
  console.log(`  Created ${eventCount} match events`);

  // 5. Create more alerts spread across stadiums
  const alertTypes = ["crowd_surge", "gate_congestion", "capacity_warning", "queue_threshold", "weather_impact", "accessibility_concern", "evacuation_advisory"] as const;
  const alertSeverities = ["info", "warning", "critical"] as const;
  let alertCount = 0;
  for (const sid of stadiumIds) {
    for (let i = 0; i < 5; i++) {
      await prisma.alert.create({
        data: {
          stadiumId: sid,
          type: alertTypes[rnd(0, alertTypes.length - 1)],
          severity: alertSeverities[rnd(0, alertSeverities.length - 1)],
          message: `Alert: ${alertTypes[rnd(0, alertTypes.length - 1)].replace(/_/g, " ")} detected at ${sid}`,
          isDeleted: false,
          createdAt: ago(rnd(5, 180)),
        },
      });
      alertCount++;
    }
  }
  console.log(`  Created ${alertCount} alerts`);

  // 6. Create more incidents with varied statuses
  const incidentTypes = ["medical", "security", "crowd_control", "infrastructure", "weather"] as const;
  const incidentSeverities = ["critical", "high", "medium", "low"] as const;
  const incidentStatuses = ["reported", "acknowledged", "in_progress", "resolved", "closed"] as const;
  const staff = await prisma.staffUser.findMany({ take: 3 });
  if (staff.length > 0) {
    let incidentCount = 0;
    for (const sid of stadiumIds) {
      for (let i = 0; i < 3; i++) {
        const status = incidentStatuses[rnd(0, incidentStatuses.length - 1)];
        await prisma.incident.create({
          data: {
            stadiumId: sid,
            type: incidentTypes[rnd(0, incidentTypes.length - 1)],
            severity: incidentSeverities[rnd(0, incidentSeverities.length - 1)],
            status,
            title: `Incident at ${sid} zone ${rnd(1, 4)}`,
            description: `Automated incident report for stadium ${sid}`,
            locationDesc: `Zone ${String.fromCharCode(65 + rnd(0, 3))}`,
            reportedById: staff[rnd(0, staff.length - 1)].id,
            reportedAt: ago(rnd(10, 300)),
            resolvedAt: status === "resolved" || status === "closed" ? ago(rnd(1, 10)) : null,
          },
        });
        incidentCount++;
      }
    }
    console.log(`  Created ${incidentCount} incidents`);
  }

  // 7. Create transit updates
  const transitRoutes = ["Route 42 Bus", "Metro Line A", "Shuttle Hub B", "Parking Express", "Train Station Connector"];
  let transitCount = 0;
  for (const sid of stadiumIds) {
    for (let i = 0; i < 3; i++) {
      await prisma.transitUpdate.create({
        data: {
          stadiumId: sid,
          route: transitRoutes[rnd(0, transitRoutes.length - 1)],
          type: "delay",
          status: rnd(0, 1) ? "on_time" : "delayed",
          delay: rnd(0, 30),
          message: rnd(0, 1) ? "Service running on schedule" : `Delay of ${rnd(5, 25)} minutes`,
          timestamp: ago(rnd(5, 120)),
        },
      });
      transitCount++;
    }
  }
  console.log(`  Created ${transitCount} transit updates`);

  // 8. Create weather snapshots
  let weatherCount = 0;
  for (const sid of stadiumIds) {
    await prisma.weatherSnapshot.create({
      data: {
        stadiumId: sid,
        temperature: rnd(22, 35),
        humidity: rnd(40, 85),
        windSpeed: rnd(2, 20),
        conditions: ["Clear", "Partly Cloudy", "Overcast", "Light Rain"][rnd(0, 3)],
        uvIndex: rnd(3, 11),
        timestamp: ago(5),
      },
    });
    weatherCount++;
  }
  console.log(`  Created ${weatherCount} weather snapshots`);

  // 9. Create more notifications
  const notifTypes = ["match_update", "security_alert", "weather_warning", "fan_tip", "gate_change", "emergency", "queue_update", "accessibility"];
  const notifPriorities = ["critical", "high", "normal", "low"] as const;
  const notifStatuses = ["sent", "draft", "scheduled"] as const;
  let notifCount = 0;
  for (const sid of stadiumIds.slice(0, 4)) {
    for (let i = 0; i < 5; i++) {
      const type = notifTypes[rnd(0, notifTypes.length - 1)];
      await prisma.notificationCampaign.create({
        data: {
          stadiumId: sid,
          type,
          channel: JSON.stringify(["push", "in_app"]),
          priority: notifPriorities[rnd(0, notifPriorities.length - 1)],
          title: `${type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())} Update`,
          body: `Notification body for ${type} at stadium ${sid}`,
          targetAudience: { audience: "All Fans" },
          status: notifStatuses[rnd(0, 2)],
          createdBy: staff.length > 0 ? staff[0].id : "system",
          sentAt: rnd(0, 1) ? ago(rnd(5, 200)) : null,
          createdAt: ago(rnd(10, 500)),
        },
      });
      notifCount++;
    }
  }
  console.log(`  Created ${notifCount} notifications`);

  console.log("\nDone! All live data seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
