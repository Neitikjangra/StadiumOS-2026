import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function ago(mins: number) { return new Date(Date.now() - mins * 60_000); }

const STADIUMS = [
  { id: "metlife", name: "MetLife Stadium", city: "East Rutherford", country: "USA", capacity: 82500, lat: 40.8135, lng: -74.0745, tz: "America/New_York", address: "1 MetLife Stadium Dr, East Rutherford, NJ 07073" },
  { id: "sofi", name: "SoFi Stadium", city: "Inglewood", country: "USA", capacity: 70240, lat: 33.9534, lng: -118.3391, tz: "America/Los_Angeles", address: "1001 S Stadium Dr, Inglewood, CA 90301" },
  { id: "att", name: "AT&T Stadium", city: "Arlington", country: "USA", capacity: 80000, lat: 32.7473, lng: -97.0945, tz: "America/Chicago", address: "1 AT&T Way, Arlington, TX 76011" },
  { id: "arrowhead", name: "Arrowhead Stadium", city: "Kansas City", country: "USA", capacity: 76416, lat: 39.0489, lng: -94.4839, tz: "America/Chicago", address: "1 Arrowhead Dr, Kansas City, MO 64129" },
  { id: "mercedes-benz", name: "Mercedes-Benz Stadium", city: "Atlanta", country: "USA", capacity: 71000, lat: 33.7554, lng: -84.401, tz: "America/New_York", address: "1 AMB Dr NW, Atlanta, GA 30313" },
  { id: "nrg", name: "NRG Stadium", city: "Houston", country: "USA", capacity: 72220, lat: 29.6847, lng: -95.4107, tz: "America/Chicago", address: "1 NRG Park, Houston, TX 77054" },
  { id: "hard-rock", name: "Hard Rock Stadium", city: "Miami", country: "USA", capacity: 65326, lat: 25.958, lng: -80.2389, tz: "America/New_York", address: "347 Don Shula Dr, Miami Gardens, FL 33056" },
  { id: "lincoln", name: "Lincoln Financial Field", city: "Philadelphia", country: "USA", capacity: 69176, lat: 39.9008, lng: -75.1675, tz: "America/New_York", address: "1 Lincoln Financial Field Way, Philadelphia, PA 19148" },
  { id: "lumen", name: "Lumen Field", city: "Seattle", country: "USA", capacity: 68740, lat: 47.5952, lng: -122.3316, tz: "America/Los_Angeles", address: "800 Occidental Ave S, Seattle, WA 98134" },
  { id: "levi", name: "Levi's Stadium", city: "Santa Clara", country: "USA", capacity: 68500, lat: 37.4033, lng: -121.9698, tz: "America/Los_Angeles", address: "4900 Marie P DeBartolo Way, Santa Clara, CA 95054" },
  { id: "gillette", name: "Gillette Stadium", city: "Foxborough", country: "USA", capacity: 70000, lat: 42.0909, lng: -71.2643, tz: "America/New_York", address: "1 Patriot Pl, Foxborough, MA 02035" },
  { id: "bmo", name: "BMO Field", city: "Toronto", country: "Canada", capacity: 30000, lat: 43.6332, lng: -79.4186, tz: "America/Toronto", address: "170 Princes' Blvd, Toronto, ON M6K 3C3" },
  { id: "azteca", name: "Estadio Azteca", city: "Mexico City", country: "Mexico", capacity: 87000, lat: 19.3029, lng: -99.1505, tz: "America/Mexico_City", address: "Calzada de Tlalpan 3465, Ciudad de México" },
  { id: "bbva", name: "Estadio BBVA", city: "Monterrey", country: "Mexico", capacity: 53500, lat: 25.67, lng: -100.244, tz: "America/Mexico_City", address: "Padre Mier 800, Monterrey, N.L." },
  { id: "bc-place", name: "BC Place", city: "Vancouver", country: "Canada", capacity: 54320, lat: 49.2768, lng: -123.1107, tz: "America/Vancouver", address: "777 Pacific Blvd, Vancouver, BC V6B 4Y8" },
  { id: "nissan", name: "Nissan Stadium", city: "Nashville", country: "USA", capacity: 69143, lat: 36.1664, lng: -86.7713, tz: "America/Chicago", address: "1 Titans Way, Nashville, TN 37213" },
];

const MATCHES = [
  { home: "USA", homeCode: "USA", homeFlag: "US", away: "Mexico", awayCode: "MEX", awayFlag: "MX", stage: "group", group: "A" },
  { home: "Brazil", homeCode: "BRA", homeFlag: "BR", away: "Argentina", awayCode: "ARG", awayFlag: "AR", stage: "group", group: "B" },
  { home: "France", homeCode: "FRA", homeFlag: "FR", away: "Germany", awayCode: "GER", awayFlag: "DE", stage: "group", group: "C" },
  { home: "England", homeCode: "ENG", homeFlag: "EN", away: "Spain", awayCode: "ESP", awayFlag: "ES", stage: "group", group: "D" },
  { home: "Japan", homeCode: "JPN", homeFlag: "JP", away: "Australia", awayCode: "AUS", awayFlag: "AU", stage: "group", group: "E" },
  { home: "Morocco", homeCode: "MAR", homeFlag: "MA", away: "Senegal", awayCode: "SEN", awayFlag: "SN", stage: "group", group: "F" },
  { home: "Canada", homeCode: "CAN", homeFlag: "CA", away: "Costa Rica", awayCode: "CRC", awayFlag: "CR", stage: "group", group: "G" },
  { home: "Portugal", homeCode: "POR", homeFlag: "PT", away: "Netherlands", awayCode: "NED", awayFlag: "NL", stage: "group", group: "H" },
  { home: "Italy", homeCode: "ITA", homeFlag: "IT", away: "Belgium", awayCode: "BEL", awayFlag: "BE", stage: "group", group: "A" },
  { home: "South Korea", homeCode: "KOR", homeFlag: "KR", away: "Uruguay", awayCode: "URU", awayFlag: "UY", stage: "group", group: "B" },
  { home: "Colombia", homeCode: "COL", homeFlag: "CO", away: "Ecuador", awayCode: "ECU", awayFlag: "EC", stage: "group", group: "C" },
  { home: "Croatia", homeCode: "CRO", homeFlag: "HR", away: "Serbia", awayCode: "SRB", awayFlag: "RS", stage: "group", group: "D" },
];

const INCIDENT_TITLES = [
  "Gate A backup exceeding 15 min wait", "Fan heat exhaustion near Section 201",
  "Unattended bag near Gate D", "Camera 14B offline — east concourse",
  "Crowd density critical at Section 201", "Restroom Queue 20+ min Zone C",
  "Lightning detected 8 miles NW", "Wheelchair user needs escort Section 301",
  "Concession stockout at Concourse A", "PA system Zone C intermittent",
  "Perimeter breach attempt at east fence", "Disruptive fan in Section 301",
  "Bus route 42 delayed 15 min", "Lost child reported near Gate B",
  "Turnstile 7 not responding", "Water station Section 202 empty",
  "Stairwell congestion post-goal", "Parking lot E exit blocked",
  "Accessible restroom maintenance needed", "Shuttle service suspended at Hub B",
];

const OPERATORS = [
  { id: "op-1", name: "Sarah Chen", email: "sarah@fifa.org" },
  { id: "op-2", name: "Marcus Johnson", email: "marcus@fifa.org" },
  { id: "op-3", name: "Fatima Al-Hassan", email: "fatima@fifa.org" },
  { id: "op-4", name: "James Rodriguez", email: "james@fifa.org" },
  { id: "op-5", name: "Aisha Patel", email: "aisha@fifa.org" },
];

async function main() {
  console.log("Seeding database...");

  // 1. Tournament
  await prisma.tournament.upsert({ where: { id: "wc2026" }, update: {}, create: { id: "wc2026", name: "FIFA World Cup 2026", year: 2026, startDate: new Date("2026-06-11"), endDate: new Date("2026-07-19"), status: "active" } });
  console.log("  Tournament seeded");

  // 2. Countries
  await prisma.hostCountry.upsert({ where: { id: "usa" }, update: {}, create: { id: "usa", tournamentId: "wc2026", name: "USA", code: "US", flag: "US" } });
  await prisma.hostCountry.upsert({ where: { id: "mex" }, update: {}, create: { id: "mex", tournamentId: "wc2026", name: "Mexico", code: "MX", flag: "MX" } });
  await prisma.hostCountry.upsert({ where: { id: "can" }, update: {}, create: { id: "can", tournamentId: "wc2026", name: "Canada", code: "CA", flag: "CA" } });

  // 3. Cities
  const cityMap: Record<string, string> = {};
  for (const s of STADIUMS) {
    const cid = s.city.toLowerCase().replace(/[^a-z]/g, "");
    const countryId = s.country === "USA" ? "usa" : s.country === "Mexico" ? "mex" : "can";
    await prisma.hostCity.upsert({ where: { id: cid }, update: {}, create: { id: cid, name: s.city, hostCountryId: countryId, latitude: s.lat, longitude: s.lng } });
    cityMap[s.id] = cid;
  }
  console.log("  Countries & cities seeded");

  // 4. Stadiums
  for (const s of STADIUMS) {
    await prisma.stadium.upsert({ where: { id: s.id }, update: {}, create: {
      id: s.id, name: s.name, capacity: s.capacity,
      hostCity: { connect: { id: cityMap[s.id] } },
      tournament: { connect: { id: "wc2026" } },
      address: s.address, latitude: s.lat, longitude: s.lng, timezone: s.tz,
    }});
  }
  console.log("  16 stadiums seeded");

  // 5. Gates, zones, concessions, restrooms (batch)
  const gates: any[] = [];
  const zones: any[] = [];
  const concessions: any[] = [];
  const restrooms: any[] = [];
  for (const s of STADIUMS) {
    for (let g = 1; g <= 8; g++) {
      gates.push({
        id: `${s.id}-gate-${g}`, stadiumId: s.id,
        name: `Gate ${String.fromCharCode(64 + g)}`,
        type: g <= 6 ? "entrance" : g === 7 ? "vip" : "accessible",
        status: g === 4 && s.id === "metlife" ? "closed" : "open",
        capacity: Math.floor(s.capacity / 8),
        latitude: s.lat + (Math.random() - 0.5) * 0.005,
        longitude: s.lng + (Math.random() - 0.5) * 0.005,
      });
    }
    for (let z = 1; z <= 4; z++) {
      zones.push({
        id: `${s.id}-zone-${z}`, stadiumId: s.id,
        name: `Zone ${String.fromCharCode(64 + z)}`,
        type: z === 1 ? "stands_lower" : z === 2 ? "stands_upper" : z === 3 ? "concourse" : "fan_zone",
        capacity: Math.floor(s.capacity / 4),
      });
    }
    for (let c = 1; c <= 3; c++) {
      concessions.push({
        id: `${s.id}-conc-${c}`, stadiumId: s.id,
        name: `Concession ${c}`, type: c === 1 ? "food" : c === 2 ? "beverage" : "merchandise", isOpen: true,
      });
    }
    for (let r = 1; r <= 3; r++) {
      restrooms.push({
        id: `${s.id}-rest-${r}`, stadiumId: s.id,
        name: `Restroom ${r}`, accessible: r === 3, status: "operational",
      });
    }
  }
  await prisma.gate.createMany({ data: gates, skipDuplicates: true });
  await prisma.zone.createMany({ data: zones, skipDuplicates: true });
  await prisma.concession.createMany({ data: concessions, skipDuplicates: true });
  await prisma.restroom.createMany({ data: restrooms, skipDuplicates: true });
  console.log("  Gates, zones, concessions, restrooms seeded");

  // 6. Staff users
  const passwordHash = await bcrypt.hash("password123", 10);
  for (const op of OPERATORS) {
    await prisma.staffUser.upsert({ where: { email: op.email }, update: {}, create: {
      id: op.id, email: op.email, name: op.name, passwordHash,
      role: op.id === "op-1" ? "super_admin" : pick(["stadium_manager", "security_lead", "mobility_lead"]),
      language: "en", stadiumId: pick(STADIUMS.map(s => s.id)), lastLoginAt: ago(rnd(5, 120)),
    }});
  }
  await prisma.staffUser.upsert({ where: { email: "admin@stadiumos.com" }, update: {}, create: {
    id: "admin-1", email: "admin@stadiumos.com", name: "Sarah Chen", passwordHash,
    role: "super_admin", language: "en", lastLoginAt: new Date(),
  }});
  console.log("  Staff users seeded");

  // 7. Matches (batch)
  const matches: any[] = [];
  for (let i = 0; i < MATCHES.length; i++) {
    const m = MATCHES[i]; const stadium = STADIUMS[i % STADIUMS.length];
    const kickoff = new Date(Date.now() + (i < 4 ? -rnd(30, 90) : rnd(30, 300)) * 60000);
    const status = i < 3 ? pick(["in_progress", "half_time"]) : i < 6 ? "scheduled" : pick(["scheduled", "full_time"]);
    matches.push({
      id: `match-${i + 1}`, stadiumId: stadium.id, tournamentId: "wc2026",
      homeTeamName: m.home, homeTeamCode: m.homeCode, homeTeamFlag: m.homeFlag,
      awayTeamName: m.away, awayTeamCode: m.awayCode, awayTeamFlag: m.awayFlag,
      status: status as any, stage: m.stage as any, groupCode: m.group, kickOff: kickoff,
      attendance: rnd(40000, stadium.capacity),
      homeScore: status !== "scheduled" ? rnd(0, 3) : null,
      awayScore: status !== "scheduled" ? rnd(0, 3) : null,
    });
  }
  await prisma.match.createMany({ data: matches, skipDuplicates: true });
  console.log("  Matches seeded");

  // 8. Incidents (batch)
  const incidents: any[] = [];
  for (let i = 0; i < 30; i++) {
    const st = pick(STADIUMS);
    incidents.push({
      id: `inc-${i + 1}`, stadiumId: st.id,
      type: pick(["medical", "security", "crowd_control", "infrastructure", "weather", "fan_behavior", "equipment", "accessibility"]),
      severity: pick(["critical", "high", "medium", "low"] as any),
      status: pick(["reported", "acknowledged", "in_progress", "escalated", "resolved", "closed"] as any),
      title: INCIDENT_TITLES[i % INCIDENT_TITLES.length],
      description: `${INCIDENT_TITLES[i % INCIDENT_TITLES.length]} at ${st.name}.`,
      locationDesc: `Zone ${pick(["A", "B", "C", "D"])}, Section ${rnd(101, 303)}`,
      reportedById: pick(OPERATORS).id,
      assignedTeam: pick(["security", "medical", "operations", "technical"]),
      escalationLevel: i < 2 ? 2 : i < 5 ? 1 : 0,
      reportedAt: ago(rnd(5, 180)),
      matchId: `match-${rnd(1, MATCHES.length)}`,
    });
  }
  await prisma.incident.createMany({ data: incidents, skipDuplicates: true });
  console.log("  30 incidents seeded");

  // 9. Alerts (batch)
  const alerts: any[] = [];
  for (let i = 0; i < 10; i++) {
    alerts.push({
      id: `alert-${i + 1}`, stadiumId: pick(STADIUMS).id,
      type: pick(["crowd_surge", "gate_congestion", "capacity_warning", "queue_threshold", "weather_impact"] as any),
      severity: pick(["info", "warning", "critical"] as any),
      message: pick(["Crowd surge detected at Section 201", "Gate congestion warning at Gate B", "Capacity threshold reached in Zone C", "Weather advisory: Heat warning"]),
    });
  }
  await prisma.alert.createMany({ data: alerts, skipDuplicates: true });
  console.log("  10 alerts seeded");

  // 10. Notification campaigns (batch)
  const notifications: any[] = [];
  for (let i = 0; i < 8; i++) {
    notifications.push({
      id: `notif-${i + 1}`, stadiumId: pick(STADIUMS).id,
      type: pick(["emergency", "info", "weather", "gate_reroute"]),
      channel: JSON.stringify(["push", "in_app"]),
      priority: pick(["critical", "high", "normal"] as any),
      title: pick(["Evacuate Section 201", "Heat Advisory Active", "Gate D Redirected", "Lost Child Alert"]),
      body: "Notification body content.",
      status: pick(["sent", "draft", "scheduled"] as any),
      sentAt: ago(rnd(5, 120)),
      createdBy: pick(OPERATORS).id,
      targetAudience: JSON.stringify({ type: "all_fans" }),
    });
  }
  await prisma.notificationCampaign.createMany({ data: notifications, skipDuplicates: true });
  console.log("  8 notifications seeded");

  // 11. Queue snapshots (batch)
  const queues: any[] = [];
  for (let i = 0; i < 20; i++) {
    queues.push({
      stadiumId: pick(STADIUMS).id,
      queueType: pick(["entry_gate", "security_check", "food_beverage", "restroom"] as any),
      length: rnd(5, 60), waitTime: rnd(1, 25), timestamp: ago(rnd(1, 60)),
    });
  }
  await prisma.queueSnapshot.createMany({ data: queues });
  console.log("  20 queue snapshots seeded");

  // 12. Transit updates (batch)
  const transits: any[] = [];
  for (let i = 0; i < 5; i++) {
    transits.push({
      stadiumId: pick(STADIUMS).id,
      route: pick(["Bus Route 42", "Shuttle Alpha", "Metro Line 3", "Parking Express"]),
      type: pick(["delay", "cancellation", "reroute"]),
      status: pick(["active", "resolved"]),
      delay: rnd(5, 30),
      message: pick(["Traffic congestion on I-95", "Shuttle suspended", "Road work detour"]),
      timestamp: ago(rnd(10, 120)),
    });
  }
  await prisma.transitUpdate.createMany({ data: transits });
  console.log("  5 transit updates seeded");

  // 13. Anomaly events (batch)
  const anomalies: any[] = [];
  for (let i = 0; i < 6; i++) {
    const st = pick(STADIUMS);
    anomalies.push({
      type: pick(["crowd_surge", "gate_congestion", "device_silence", "capacity_breach", "unusual_wait_time"] as any),
      severity: pick(["critical", "warning", "info"] as any),
      metric: pick(["density", "wait_time", "connectivity"]),
      value: rnd(0, 100), threshold: 85,
      message: pick(["Crowd density exceeds threshold", "Gate wait time 22 min", "Camera offline"]),
      stadiumId: st.id, zoneId: `${st.id}-zone-1`, acknowledged: false,
    });
  }
  await prisma.anomalyEvent.createMany({ data: anomalies });
  console.log("  6 anomaly events seeded");

  // 14. Accessibility services
  const accTypes = ["wheelchair", "visual_impairment", "hearing_impairment", "mobility_aid", "service_animal"] as any;
  const accNames = ["Wheelchair Escort", "Visual Assistance", "Hearing Support", "Mobility Aid Support", "Service Animal Area"];
  const accDescs = ["Escort service for wheelchair users to seating", "Visual impairment assistance and guidance", "Hearing loop and sign language support", "Mobility aid storage and assistance", "Service animal relief areas and seating"];
  for (const s of STADIUMS.slice(0, 8)) {
    for (let a = 0; a < 3; a++) {
      await prisma.accessibilityService.upsert({ where: { id: `${s.id}-acc-${a}` }, update: {}, create: {
        id: `${s.id}-acc-${a}`, stadiumId: s.id, type: accTypes[a], name: accNames[a], description: accDescs[a], location: `Zone ${String.fromCharCode(65 + a)}, Level 1`, isAvailable: true,
      }});
    }
  }
  console.log("  24 accessibility services seeded");

  // 15. Knowledge documents
  const docs = [
    { title: "Crowd Management Protocol", category: "security_protocols" as any, content: "FIFA World Cup crowd management procedures." },
    { title: "Emergency Evacuation SOP", category: "emergency_procedures" as any, content: "Standard operating procedures for stadium evacuation." },
    { title: "Weather Response Plan", category: "weather_contingency" as any, content: "Procedures for weather-related disruptions." },
    { title: "Accessibility Services Guide", category: "accessibility_guide" as any, content: "Guide for accessibility services." },
    { title: "Gate Operations Manual", category: "match_day_operations" as any, content: "Manual for gate operations and crowd flow." },
    { title: "Medical Emergency Response", category: "emergency_procedures" as any, content: "Procedures for medical emergencies." },
    { title: "VIP Hospitality Protocol", category: "fan_services" as any, content: "VIP services management." },
    { title: "Vendor Management Guide", category: "vendor_operations" as any, content: "Guidelines for food and beverage vendors." },
    { title: "Volunteer Training Manual", category: "match_day_operations" as any, content: "Training materials for match day volunteers." },
    { title: "Communication Protocols", category: "stadium_policy" as any, content: "Internal and external communication procedures." },
  ];
  for (let i = 0; i < docs.length; i++) {
    await prisma.knowledgeDocument.create({ data: {
      id: `doc-${i + 1}`, ...docs[i],
      tags: JSON.stringify([docs[i].category]),
      language: "en", status: "published", createdBy: pick(OPERATORS).id,
    }});
  }
  console.log("  10 knowledge documents seeded");

  console.log("\nSeeding complete!");
  console.log("Login: admin@stadiumos.com / password123");
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
