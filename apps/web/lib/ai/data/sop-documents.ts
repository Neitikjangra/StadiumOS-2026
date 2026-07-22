import type { VectorDocument } from '../types';
import { loadSOPDocuments } from './db-loaders';

export const SOP_DOCUMENTS: Omit<VectorDocument, 'embedding'>[] = [
  {
    id: 'sop-001',
    content: 'Emergency Evacuation SOP: When a full stadium evacuation is ordered, all gates must be opened simultaneously. Staff should guide fans to the nearest exit using pre-assigned routes. PA system broadcasts evacuation message in all 4 languages. Medical teams stage at first aid stations. Head count at rally points.',
    metadata: { type: 'sop', title: 'Emergency Evacuation Procedure', tags: ['evacuation', 'emergency', 'safety', 'gates'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'sop-002',
    content: 'Medical Emergency Response SOP: For medical emergencies, the nearest staff member should call for medical support via radio channel 3. Clear the area around the affected person. First aid team responds within 3 minutes. If cardiac arrest, retrieve AED from nearest station. Document incident in system.',
    metadata: { type: 'sop', title: 'Medical Emergency Response', tags: ['medical', 'emergency', 'first_aid', 'aed'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'sop-003',
    content: 'Crowd Surge Management SOP: When crowd density exceeds safe thresholds in any zone, activate crowd management protocol. Deploy additional staff to affected area. Open overflow gates to distribute crowd. PA announcement for alternate routes. Monitor via CCTV.',
    metadata: { type: 'sop', title: 'Crowd Surge Management', tags: ['crowd', 'density', 'surge', 'safety'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'sop-004',
    content: 'Severe Weather Protocol SOP: When lightning is detected within 10 miles, outdoor activities are suspended. Fans are directed to covered areas. Pitch crew covers the field. Match may be delayed. If tornado warning, activate shelter-in-place protocol.',
    metadata: { type: 'sop', title: 'Severe Weather Protocol', tags: ['weather', 'lightning', 'tornado', 'safety'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'sop-005',
    content: 'Security Threat Assessment SOP: All security threats are categorized as Level 1 (low), Level 2 (medium), Level 3 (high), or Level 4 (critical). Level 3+ requires immediate notification to command center. Level 4 triggers lockdown protocol. Evacuation may be ordered.',
    metadata: { type: 'sop', title: 'Security Threat Assessment', tags: ['security', 'threat', 'lockdown', 'assessment'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'sop-006',
    content: 'VIP Incident Handling SOP: All incidents involving VIP guests require immediate notification to the VIP liaison. Escalation to stadium manager within 5 minutes. Dedicated security detail responds. Documentation must include VIP name, section, and nature of incident.',
    metadata: { type: 'sop', title: 'VIP Incident Handling', tags: ['vip', 'incident', 'escalation', 'security'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'sop-007',
    content: 'Lost Child Protocol SOP: When a lost child is reported, immediately notify security and initiate Code Adam. Staff at all exits are alerted. PA announcement with child description. Search teams deploy to last known location. Parent/guardian stays at designated meeting point.',
    metadata: { type: 'sop', title: 'Lost Child Protocol', tags: ['lost', 'child', 'code_adam', 'safety'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'sop-008',
    content: 'Fire Response SOP: If fire is detected, activate fire alarm. Staff guide fans to nearest exit away from fire. Fire suppression system activates automatically. Fire department notified. Evacuation may be ordered if fire cannot be controlled.',
    metadata: { type: 'sop', title: 'Fire Response Protocol', tags: ['fire', 'alarm', 'evacuation', 'safety'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'sop-009',
    content: 'Power Outage Protocol SOP: In case of power outage, emergency lighting activates within 10 seconds. PA system switches to battery backup. Staff use flashlights to guide fans. Match may be delayed. Generator power prioritizes safety systems.',
    metadata: { type: 'sop', title: 'Power Outage Protocol', tags: ['power', 'outage', 'emergency', 'lighting'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'sop-010',
    content: 'Mass Casualty Incident SOP: For mass casualty events, activate MCI protocol. Triage area established. All available medical staff respond. Nearest hospitals notified. Ambulance staging area activated. Command center coordinates response.',
    metadata: { type: 'sop', title: 'Mass Casualty Incident Response', tags: ['mass_casualty', 'triage', 'medical', 'emergency'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'sop-011',
    content: 'Shift Handoff SOP: At shift change, outgoing staff must brief incoming staff on all active incidents, pending tasks, and special situations. Handoff checklist must be completed. Radio channels verified. Equipment inventory checked.',
    metadata: { type: 'sop', title: 'Shift Handoff Procedure', tags: ['shift', 'handoff', 'briefing', 'operations'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'sop-012',
    content: 'Post-Match Egress SOP: After match conclusion, open all gates for egress. Staff positioned at key junctions. Traffic management plan activated. Public transport coordination. Parking lot exit sequence managed. Fans directed to appropriate transport.',
    metadata: { type: 'sop', title: 'Post-Match Egress Management', tags: ['egress', 'exit', 'transport', 'traffic'], language: 'en', lastUpdated: '2026-06-01' },
  },
];

export async function loadSOPDocumentsFromDB(): Promise<Omit<VectorDocument, 'embedding'>[]> {
  const dbDocs = await loadSOPDocuments();
  return dbDocs.length > 0 ? dbDocs : SOP_DOCUMENTS;
}
