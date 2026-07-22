import type { AudienceTarget, Recipient, Language, AudienceType } from './types';

interface MockRecipient {
  id: string;
  type: 'fan' | 'operator' | 'staff' | 'vip';
  name: string;
  email: string;
  phone: string;
  pushToken: string;
  language: Language;
  section: string;
  zone: string;
  role: string;
  stadiumId: string;
}

const MOCK_RECIPIENTS: MockRecipient[] = [
  { id: 'fan-001', type: 'fan', name: 'Alice Garcia', email: 'alice@test.com', phone: '+1555010001', pushToken: 'tok-001', language: 'en', section: 'A1', zone: 'north', role: 'fan', stadiumId: 'met-life' },
  { id: 'fan-002', type: 'fan', name: 'Bob Chen', email: 'bob@test.com', phone: '+1555010002', pushToken: 'tok-002', language: 'es', section: 'B2', zone: 'south', role: 'fan', stadiumId: 'met-life' },
  { id: 'fan-003', type: 'fan', name: 'Claire Dupont', email: 'claire@test.com', phone: '+1555010003', pushToken: '', language: 'fr', section: 'C3', zone: 'east', role: 'fan', stadiumId: 'sofi' },
  { id: 'fan-004', type: 'fan', name: 'Ahmed Hassan', email: 'ahmed@test.com', phone: '+1555010004', pushToken: 'tok-004', language: 'ar', section: 'A1', zone: 'north', role: 'fan', stadiumId: 'met-life' },
  { id: 'fan-005', type: 'fan', name: 'Maria Rodriguez', email: 'maria@test.com', phone: '+1555010005', pushToken: 'tok-005', language: 'es', section: 'D4', zone: 'west', role: 'fan', stadiumId: 'at-and-t' },
  { id: 'fan-006', type: 'fan', name: 'James Wilson', email: 'james@test.com', phone: '+1555010006', pushToken: 'tok-006', language: 'en', section: 'B2', zone: 'south', role: 'fan', stadiumId: 'met-life' },
  { id: 'fan-007', type: 'fan', name: 'Yuki Tanaka', email: 'yuki@test.com', phone: '+1555010007', pushToken: 'tok-007', language: 'en', section: 'VIP', zone: 'premium', role: 'vip', stadiumId: 'sofi' },
  { id: 'op-001', type: 'operator', name: 'Ops Manager', email: 'ops@test.com', phone: '+1555020001', pushToken: 'tok-op1', language: 'en', section: 'control', zone: 'all', role: 'stadium_manager', stadiumId: 'met-life' },
  { id: 'op-002', type: 'operator', name: 'Security Lead', email: 'sec@test.com', phone: '+1555020002', pushToken: 'tok-op2', language: 'en', section: 'control', zone: 'all', role: 'security_lead', stadiumId: 'met-life' },
  { id: 'op-003', type: 'operator', name: 'Mobility Lead', email: 'mob@test.com', phone: '+1555020003', pushToken: 'tok-op3', language: 'es', section: 'control', zone: 'all', role: 'mobility_lead', stadiumId: 'met-life' },
  { id: 'staff-001', type: 'staff', name: 'Steward A', email: 'steward-a@test.com', phone: '+1555030001', pushToken: 'tok-st1', language: 'en', section: 'A1', zone: 'north', role: 'volunteer_lead', stadiumId: 'met-life' },
  { id: 'staff-002', type: 'staff', name: 'Medic B', email: 'medic-b@test.com', phone: '+1555030002', pushToken: 'tok-st2', language: 'en', section: 'medical', zone: 'all', role: 'support_agent', stadiumId: 'met-life' },
];

export function resolveRecipients(target: AudienceTarget): Recipient[] {
  let pool = [...MOCK_RECIPIENTS];

  if (target.stadiumId) {
    pool = pool.filter((r) => r.stadiumId === target.stadiumId);
  }

  switch (target.type) {
    case 'all_fans':
      pool = pool.filter((r) => r.type === 'fan');
      break;
    case 'all_operators':
      pool = pool.filter((r) => r.type === 'operator' || r.type === 'staff');
      break;
    case 'zone':
      if (target.zoneIds?.length) {
        pool = pool.filter((r) => target.zoneIds!.includes(r.zone));
      }
      break;
    case 'section':
      if (target.sectionIds?.length) {
        pool = pool.filter((r) => target.sectionIds!.includes(r.section));
      }
      break;
    case 'role':
      if (target.roles?.length) {
        pool = pool.filter((r) => target.roles!.includes(r.role));
      }
      break;
    case 'language':
      if (target.languages?.length) {
        pool = pool.filter((r) => target.languages!.includes(r.language));
      }
      break;
    case 'custom':
      break;
  }

  if (target.languages?.length && target.type !== 'language') {
    pool = pool.filter((r) => target.languages!.includes(r.language));
  }

  return pool.map((r) => ({
    id: r.id,
    type: r.type,
    name: r.name,
    email: r.email,
    phone: r.phone,
    pushToken: r.pushToken,
    language: r.language,
    section: r.section,
    zone: r.zone,
    role: r.role,
  }));
}

export function getTargetDescription(target: AudienceTarget): string {
  const parts: string[] = [];
  if (target.stadiumId) parts.push(`Stadium: ${target.stadiumId}`);
  switch (target.type) {
    case 'all_fans': parts.push('All fans'); break;
    case 'all_operators': parts.push('All operators & staff'); break;
    case 'zone': parts.push(`Zone(s): ${target.zoneIds?.join(', ') || 'any'}`); break;
    case 'section': parts.push(`Section(s): ${target.sectionIds?.join(', ') || 'any'}`); break;
    case 'role': parts.push(`Role(s): ${target.roles?.join(', ') || 'any'}`); break;
    case 'language': parts.push(`Language(s): ${target.languages?.join(', ') || 'any'}`); break;
    default: parts.push('Custom'); break;
  }
  if (target.languages?.length && target.type !== 'language') {
    parts.push(`Languages: ${target.languages.join(', ')}`);
  }
  return parts.join(' | ');
}

export function getMockRecipientCount(): number {
  return MOCK_RECIPIENTS.length;
}

export function getMockZones(): string[] {
  return [...new Set(MOCK_RECIPIENTS.map((r) => r.zone))];
}

export function getMockSections(): string[] {
  return [...new Set(MOCK_RECIPIENTS.map((r) => r.section))];
}

export function getMockStadiums(): string[] {
  return [...new Set(MOCK_RECIPIENTS.map((r) => r.stadiumId))];
}
