import type { VectorDocument } from '../types';
import { loadKnowledgeDocuments } from './db-loaders';

export const ACCESSIBILITY_DOCUMENTS: Omit<VectorDocument, 'embedding'>[] = [
  {
    id: 'acc-001',
    content: 'Wheelchair accessible seating available in all sections. Companion seats adjacent. Ramps at all entrances. Elevators to upper levels. Accessible restrooms on every level. Service animal relief areas at Gate A and Gate C.',
    metadata: { type: 'accessibility', title: 'Wheelchair Accessibility', tags: ['wheelchair', 'ramp', 'elevator', 'companion'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'acc-002',
    content: 'Sensory rooms available in Sections A3 and B3. Low-stimulation environment with dim lighting, comfortable seating, and fidget tools. Available on first-come basis. Staff trained in sensory support.',
    metadata: { type: 'accessibility', title: 'Sensory Room Information', tags: ['sensory', 'room', 'low_stimulation', 'autism'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'acc-003',
    content: 'Assistive listening devices available at Guest Services. Compatible with hearing aids. Induction loop system in main auditorium. ASL interpretation available with 72-hour advance request.',
    metadata: { type: 'accessibility', title: 'Hearing Assistance', tags: ['hearing', 'listening', 'asl', 'induction_loop'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'acc-004',
    content: 'Large print programs available at Guest Services. Braille programs available upon request. Audio descriptions of key visual elements. High contrast signage throughout venue.',
    metadata: { type: 'accessibility', title: 'Visual Assistance', tags: ['visual', 'braille', 'large_print', 'audio'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'acc-005',
    content: 'Accessible parking in VIP Lot and Garage East. Drop-off zone at Gate A. Accessible shuttle service from parking to gates. Golf cart transport available upon request.',
    metadata: { type: 'accessibility', title: 'Accessible Transportation', tags: ['parking', 'shuttle', 'golf_cart', 'drop_off'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'acc-006',
    content: 'Family restrooms with changing tables in Sections A1, B1, C1, GA1, and VIP. Adult changing facilities available at Guest Services. Nursing rooms in Sections A1 and B1.',
    metadata: { type: 'accessibility', title: 'Family and Nursing Facilities', tags: ['family', 'nursing', 'changing', 'restroom'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'acc-007',
    content: 'Emergency evacuation procedures include assistance for persons with disabilities. Evacuation chairs available at stairwells. Staff trained in disability-aware evacuation. Personal Emergency Evacuation Plans (PEEPs) available.',
    metadata: { type: 'accessibility', title: 'Emergency Evacuation for Disabilities', tags: ['evacuation', 'disability', 'peep', 'chair'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'acc-008',
    content: 'Quiet hours and low-sensory options available. Reduced noise sections in C1 and D1. Noise-canceling headphones available for loan at Guest Services. Visual alerts supplement audio announcements.',
    metadata: { type: 'accessibility', title: 'Low-Sensory Options', tags: ['quiet', 'sensory', 'noise', 'headphones'], language: 'en', lastUpdated: '2026-06-01' },
  },
];

export async function loadAccessibilityDocumentsFromDB(): Promise<Omit<VectorDocument, 'embedding'>[]> {
  const dbDocs = await loadKnowledgeDocuments(['accessibility_guide']);
  return dbDocs.length > 0 ? dbDocs : ACCESSIBILITY_DOCUMENTS;
}
