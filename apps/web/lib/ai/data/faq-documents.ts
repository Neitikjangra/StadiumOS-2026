import type { VectorDocument } from '../types';
import { loadFAQDocuments } from './db-loaders';

export const FAQ_DOCUMENTS: Omit<VectorDocument, 'embedding'>[] = [
  {
    id: 'faq-001',
    content: 'Gates open 2 hours before kickoff. For evening matches, gates open at 5:00 PM. Arrive early to avoid long lines. All tickets are digital and must be presented on mobile device or printed.',
    metadata: { type: 'faq', title: 'Gate Opening Times', tags: ['gate', 'opening', 'time', 'entry'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'faq-002',
    content: 'Allowed items: clear bags (12x6x12 inches max), small clutches (4.5x6.5 inches), seat cushions, rain ponchos, sealed water bottles. Prohibited: outside food/drinks, large bags, umbrellas, flags over 2 meters, noisemakers, drones.',
    metadata: { type: 'faq', title: 'Allowed and Prohibited Items', tags: ['items', 'allowed', 'prohibited', 'bags'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'faq-003',
    content: 'All concession stands accept contactless payments (credit/debit cards, Apple Pay, Google Pay). Cash accepted at select locations marked with CASH signs. Fan Wallet available in app for faster checkout.',
    metadata: { type: 'faq', title: 'Payment Methods', tags: ['payment', 'cash', 'card', 'contactless'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'faq-004',
    content: 'Free WiFi available throughout the stadium. Connect to FIFA2026-Fan network. No password needed. Bandwidth may be limited during peak times.',
    metadata: { type: 'faq', title: 'WiFi Access', tags: ['wifi', 'internet', 'connect', 'network'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'faq-005',
    content: 'Wheelchair accessible seating available in all sections. Companion seats available. Accessible restrooms on every level. Assistive listening devices at Guest Services. Service animals welcome. Sensory rooms in Sections A3 and B3.',
    metadata: { type: 'faq', title: 'Accessibility Services', tags: ['accessibility', 'wheelchair', 'companion', 'sensory'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'faq-006',
    content: 'Emergency procedures: Stay calm. Follow staff instructions. Use nearest marked exit. Do NOT use elevators. If medical help needed, alert nearby staff. Rally points designated throughout venue.',
    metadata: { type: 'faq', title: 'Emergency Procedures', tags: ['emergency', 'evacuation', 'exit', 'safety'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'faq-007',
    content: 'Seat location printed on ticket. Section letter (A-D, V, or GA), then row number, then seat number. Digital tickets have QR code. Staff can scan to provide directions.',
    metadata: { type: 'faq', title: 'Finding Your Seat', tags: ['seat', 'section', 'row', 'ticket'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'faq-008',
    content: 'After match, exits may be congested. Follow staff directions. Check Transport section for shuttle/metro/bus times. Rideshare pickup at East Exit. Parking lots exit via North or South gates.',
    metadata: { type: 'faq', title: 'Post-Match Exit', tags: ['exit', 'leave', 'transport', 'parking'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'faq-009',
    content: 'Lost and found: Visit any Guest Services desk. Describe item and location. Staff will check and contact you if found. Report through app for faster response.',
    metadata: { type: 'faq', title: 'Lost and Found', tags: ['lost', 'found', 'guest_services', 'report'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'faq-010',
    content: 'Fan code of conduct: Be respectful to all fans. No abusive language, threats, or discriminatory behavior. No throwing objects. Violations may result in ejection without refund.',
    metadata: { type: 'faq', title: 'Fan Code of Conduct', tags: ['conduct', 'behavior', 'rules', 'respect'], language: 'en', lastUpdated: '2026-06-01' },
  },
];

export async function loadFAQDocumentsFromDB(): Promise<Omit<VectorDocument, 'embedding'>[]> {
  const dbDocs = await loadFAQDocuments();
  return dbDocs.length > 0 ? dbDocs : FAQ_DOCUMENTS;
}
