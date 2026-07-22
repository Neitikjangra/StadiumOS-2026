import type { VectorDocument } from '../types';

export const VENUE_METADATA_DOCUMENTS: Omit<VectorDocument, 'embedding'>[] = [
  {
    id: 'venue-001',
    content: 'Stadium capacity: 82,500 seats. Sections A (North Stand, 12,000), B (South Stand, 12,000), C (East Wing, 8,000), D (West Wing, 8,000), V (VIP Suites, 2,000), GA (General Admission, 5,000). Total standing: 35,500 additional.',
    metadata: { type: 'venue', title: 'Stadium Capacity and Sections', tags: ['capacity', 'sections', 'seats', 'standing'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'venue-002',
    content: 'Gate locations: Gate A (North Main), Gate B (South Main), Gate C (East Entry), Gate D (West Entry), Gate E (VIP Entrance), Gate F (General Admission), Gate G (Family Entry), Gate H (South Auxiliary). All gates wheelchair accessible except Gate D and Gate H.',
    metadata: { type: 'venue', title: 'Gate Locations', tags: ['gates', 'locations', 'accessible', 'entry'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'venue-003',
    content: 'Restroom locations: Restroom A1 (North ground, accessible, family), A2 (North upper, accessible), B1 (South ground, accessible, family), B2 (South lower), C1 (East upper, accessible, family), D1 (West lower, accessible), GA1 (General Admission, accessible, family), VIP (VIP suite, accessible, family).',
    metadata: { type: 'venue', title: 'Restroom Locations', tags: ['restrooms', 'accessible', 'family', 'locations'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'venue-004',
    content: 'Food and beverage: Burger Stand A (North), Taco Bar B (South), Pizza Corner (East), Hot Dog Cart D (West), Beer Garden (North), Coffee Kiosk (East), VIP Dining, Snack Stand GA, Halal Food Court (South), Vegan Corner (West), Water Stations (North and South).',
    metadata: { type: 'venue', title: 'Food and Beverage Locations', tags: ['food', 'beverage', 'concessions', 'dining'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'venue-005',
    content: 'First Aid stations: Station North (Section A), Station South (Section B), Station East (Section C), Medical Tent West (Section D). All stations staffed during events. AEDs located at each station.',
    metadata: { type: 'venue', title: 'First Aid Station Locations', tags: ['first_aid', 'medical', 'aed', 'stations'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'venue-006',
    content: 'Transport connections: Metro Line A (North), Metro Line B (South), Shuttle to City Center (East), Bus Route 42 (West), Taxi Stand (South), Rideshare Pickup (East). Parking: Lot North, Lot South, Garage East, VIP Parking.',
    metadata: { type: 'venue', title: 'Transport Connections', tags: ['transport', 'metro', 'shuttle', 'parking'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'venue-007',
    content: 'VIP areas: VIP Lounge (Section V), VIP Entrance (Gate E), VIP Dining, VIP Parking, VIP Restrooms. VIP areas have dedicated security and concierge service.',
    metadata: { type: 'venue', title: 'VIP Area Information', tags: ['vip', 'lounge', 'dining', 'parking'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'venue-008',
    content: 'Emergency exits: North Exit A, South Exit B, East Exit C, West Exit D, Emergency Exit NE, Emergency Exit SW, Parking Exit North, Parking Exit South. All exits clearly marked with illuminated signs.',
    metadata: { type: 'venue', title: 'Emergency Exit Locations', tags: ['exits', 'emergency', 'evacuation', 'safety'], language: 'en', lastUpdated: '2026-06-01' },
  },
];
