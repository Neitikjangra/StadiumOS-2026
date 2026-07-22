import { prisma } from '@/lib/prisma';
import type { AudienceTarget, Recipient, Language } from './types';
import { Prisma } from '@prisma/client';

type StaffUserRole = 'super_admin' | 'tournament_ops' | 'stadium_manager' | 'security_lead' | 'mobility_lead' | 'vendor_manager' | 'volunteer_lead' | 'support_agent' | 'fan_user';

const STAFF_ROLES: StaffUserRole[] = ['volunteer_lead', 'support_agent'];

function staffRoleType(role: StaffUserRole): 'operator' | 'staff' {
  return STAFF_ROLES.includes(role) ? 'staff' : 'operator';
}

export async function resolveRecipients(target: AudienceTarget): Promise<Recipient[]> {
  const recipients: Recipient[] = [];

  // ── Staff / Operators ──
  if (target.type !== 'all_fans') {
    const where: Prisma.StaffUserWhereInput = {
      isDeleted: false,
      ...(target.stadiumId ? { stadiumId: target.stadiumId } : {}),
      ...(target.languages?.length ? { language: { in: target.languages } } : {}),
    };

    if (target.type === 'role' && target.roles?.length) {
      where.role = { in: target.roles as StaffUserRole[] };
    }

    const staff = await prisma.staffUser.findMany({ where });

    for (const s of staff) {
      if (target.type === 'section' || target.type === 'zone') continue;
      if (target.type === 'role' && target.roles?.length && !target.roles.includes(s.role)) continue;

      recipients.push({
        id: s.id,
        type: staffRoleType(s.role),
        name: s.name,
        email: s.email,
        language: s.language as Language,
        role: s.role,
        section: 'control',
        zone: 'all',
      });
    }
  }

  // ── Fans ──
  const includeFans =
    target.type !== 'all_operators' &&
    !(target.type === 'role' && target.roles?.length && !target.roles.includes('fan'));

  if (includeFans) {
    const ticketFilter: Prisma.TicketProfileWhereInput = {};

    if (target.type === 'section' && target.sectionIds?.length) {
      ticketFilter.section = { in: target.sectionIds };
    }
    if (target.type === 'zone' && target.zoneIds?.length) {
      ticketFilter.gate = { in: target.zoneIds };
    }
    if (target.stadiumId) {
      const matches = await prisma.match.findMany({
        where: { stadiumId: target.stadiumId },
        select: { id: true },
      });
      const matchIds = matches.map((m: { id: string }) => m.id);

      if (matchIds.length === 0) return recipients;
      ticketFilter.matchId = { in: matchIds };
    }

    const hasTicketFilter = Object.keys(ticketFilter).length > 0;

    const fans = await prisma.fanUser.findMany({
      where: {
        isDeleted: false,
        ...(target.languages?.length ? { language: { in: target.languages } } : {}),
        ...(hasTicketFilter ? { tickets: { some: ticketFilter } } : {}),
      },
      include: {
        tickets: {
          select: { section: true, gate: true },
          take: 1,
        },
      },
    });

    for (const f of fans) {
      const ticket = f.tickets[0];
      recipients.push({
        id: f.id,
        type: 'fan',
        name: f.name,
        email: f.email,
        phone: f.phone || undefined,
        language: f.language as Language,
        section: ticket?.section,
        zone: ticket?.gate,
        role: 'fan',
      });
    }
  }

  return recipients;
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

export async function getMockRecipientCount(): Promise<number> {
  const [staffCount, fanCount] = await Promise.all([
    prisma.staffUser.count({ where: { isDeleted: false } }),
    prisma.fanUser.count({ where: { isDeleted: false } }),
  ]);
  return staffCount + fanCount;
}

export async function getMockZones(): Promise<string[]> {
  const result = await prisma.ticketProfile.findMany({
    distinct: ['gate'],
    select: { gate: true },
  });
  return result.map((r: { gate: string }) => r.gate);
}

export async function getMockSections(): Promise<string[]> {
  const result = await prisma.ticketProfile.findMany({
    distinct: ['section'],
    select: { section: true },
  });
  return result.map((r: { section: string }) => r.section);
}

export async function getMockStadiums(): Promise<string[]> {
  const result = await prisma.stadium.findMany({
    select: { id: true },
  });
  return result.map((r: { id: string }) => r.id);
}
