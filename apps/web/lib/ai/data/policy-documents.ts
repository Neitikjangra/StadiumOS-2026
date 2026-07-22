import type { VectorDocument } from '../types';

export const POLICY_DOCUMENTS: Omit<VectorDocument, 'embedding'>[] = [
  {
    id: 'pol-001',
    content: 'Stadium Security Policy: All personnel must wear visible ID badges. Bag checks required at all entry points. Prohibited items must be confiscated and logged. Suspicious activity reported immediately to command center. CCTV monitoring mandatory.',
    metadata: { type: 'policy', title: 'Security Policy', tags: ['security', 'policy', 'badge', 'bag_check'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'pol-002',
    content: 'Alcohol Service Policy: Alcohol service ends at halftime. Maximum 2 drinks per transaction. No service to visibly intoxicated persons. Age verification required. All staff must complete alcohol awareness training.',
    metadata: { type: 'policy', title: 'Alcohol Service Policy', tags: ['alcohol', 'service', 'halftime', 'policy'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'pol-003',
    content: 'Data Privacy Policy: Fan data collected through tickets and app is protected under GDPR and local privacy laws. Data used only for operational purposes. No sharing with third parties without consent. Data retention limited to 30 days post-event.',
    metadata: { type: 'policy', title: 'Data Privacy Policy', tags: ['privacy', 'data', 'gdpr', 'retention'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'pol-004',
    content: 'Accessibility Policy: Stadium complies with ADA and international accessibility standards. Wheelchair seating in all sections. Companion seats available. ASL interpretation available upon 72-hour advance request. Sensory kits available at Guest Services.',
    metadata: { type: 'policy', title: 'Accessibility Policy', tags: ['accessibility', 'ada', 'wheelchair', 'asl'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'pol-005',
    content: 'Incident Reporting Policy: All incidents must be reported within 30 minutes. Use standardized incident report form. Include: date, time, location, description, witnesses, actions taken. Escalation required for severity level 3+.',
    metadata: { type: 'policy', title: 'Incident Reporting Policy', tags: ['incident', 'reporting', 'documentation', 'escalation'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'pol-006',
    content: 'Staff Conduct Policy: Staff must maintain professional demeanor. No personal phone use during duty. Uniform must be clean and visible. Breaks scheduled to maintain coverage. No consumption of alcohol or drugs on premises.',
    metadata: { type: 'policy', title: 'Staff Conduct Policy', tags: ['staff', 'conduct', 'uniform', 'professional'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'pol-007',
    content: 'Emergency Communication Protocol: All emergency communications use radio channel 1. PA system broadcasts in English, Spanish, French, and Arabic. Visual displays used for hearing-impaired. Backup communication via mobile phones.',
    metadata: { type: 'policy', title: 'Emergency Communication Protocol', tags: ['communication', 'emergency', 'radio', 'pa_system'], language: 'en', lastUpdated: '2026-06-01' },
  },
  {
    id: 'pol-008',
    content: 'Environmental Policy: Stadium committed to zero waste. Recycling and composting stations throughout venue. Single-use plastics minimized. Water refill stations available. Carbon offset program for transportation.',
    metadata: { type: 'policy', title: 'Environmental Policy', tags: ['environment', 'sustainability', 'waste', 'recycling'], language: 'en', lastUpdated: '2026-06-01' },
  },
];
