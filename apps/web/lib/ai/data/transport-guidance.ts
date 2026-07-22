import type { VectorDocument } from '../types';

export const TRANSPORT_DOCUMENTS: Omit<VectorDocument, 'embedding'>[] = [
  {
    id: 'trans-001',
    content: 'Metro Line A: North station, 3-minute frequency, capacity 800 per train. Last train 12:30 AM. Connects to downtown, airport, and northern suburbs. Accessible with elevators.',
    metadata: { type: 'transport', title: 'Metro Line A Information', tags: ['metro', 'line_a', 'north', 'accessible'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'trans-002',
    content: 'Metro Line B: South station, 5-minute frequency, capacity 800 per train. Last train 12:00 AM. Connects to southern suburbs and convention center. Accessible with elevators.',
    metadata: { type: 'transport', title: 'Metro Line B Information', tags: ['metro', 'line_b', 'south', 'accessible'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'trans-003',
    content: 'Shuttle to City Center: East stop, 8-minute frequency, capacity 50 per shuttle. Last shuttle 11:00 PM. Direct route to downtown hotels and convention center. Wheelchair accessible.',
    metadata: { type: 'transport', title: 'City Center Shuttle', tags: ['shuttle', 'city_center', 'east', 'hotels'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'trans-004',
    content: 'Bus Route 42: West stop, 12-minute frequency, capacity 60 per bus. Last bus 11:30 PM. Connects to residential areas and shopping districts. Wheelchair lift available.',
    metadata: { type: 'transport', title: 'Bus Route 42', tags: ['bus', 'route_42', 'west', 'residential'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'trans-005',
    content: 'Taxi Stand: South exit, 2-minute wait average. Fixed fare to downtown: $25. Surge pricing may apply post-match. Wheelchair accessible vehicles available upon request.',
    metadata: { type: 'transport', title: 'Taxi Service', tags: ['taxi', 'south', 'fare', 'accessible'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'trans-006',
    content: 'Rideshare Pickup: East zone, designated pickup area. 5-minute average wait. Surge pricing common post-match. Accessible vehicles available. QR code in app for exact location.',
    metadata: { type: 'transport', title: 'Rideshare Service', tags: ['rideshare', 'east', 'pickup', 'surge'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'trans-007',
    content: 'Parking: Lot North (2,000 spaces), Lot South (1,500 spaces), Garage East (1,000 spaces), VIP Parking (500 spaces). Accessible parking in Garage East. Pre-purchase recommended. Exit sequence managed post-match.',
    metadata: { type: 'transport', title: 'Parking Information', tags: ['parking', 'lot', 'garage', 'accessible'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'trans-008',
    content: 'Post-match exit strategy: Follow staff directions. Low-congestion exits: East Exit C, West Exit D. High congestion: South Exit B, Parking Exit South. Wait 15-20 minutes for congestion to ease. Check real-time transport updates in app.',
    metadata: { type: 'transport', title: 'Post-Match Exit Strategy', tags: ['exit', 'congestion', 'strategy', 'real_time'], language: 'en', lastUpdated: '2026-06-01' },
  },
];
