import type { Incident, DuplicateGroup } from './types';

export function detectDuplicates(incident: Incident, existing: Incident[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const candidates = existing.filter(
    (e) => e.id !== incident.id && e.type === incident.type && e.status !== 'resolved' && e.status !== 'closed'
  );
  for (const candidate of candidates) {
    let confidence = 0;
    const reasons: string[] = [];
    if (incident.stadiumId === candidate.stadiumId) { confidence += 0.3; reasons.push('same stadium'); }
    if (incident.zone && incident.zone === candidate.zone) { confidence += 0.3; reasons.push('same zone'); }
    if (incident.section && incident.section === candidate.section) { confidence += 0.2; reasons.push('same section'); }
    if (incident.gateId && incident.gateId === candidate.gateId) { confidence += 0.2; reasons.push('same gate'); }
    if (incident.type === candidate.type) { confidence += 0.1; reasons.push('same type'); }
    const timeDiff = Math.abs(new Date(incident.createdAt).getTime() - new Date(candidate.createdAt).getTime());
    if (timeDiff < 300_000) { confidence += 0.2; reasons.push('within 5 minutes'); }
    else if (timeDiff < 600_000) { confidence += 0.1; reasons.push('within 10 minutes'); }
    const titleSimilarity = computeTitleSimilarity(incident.title, candidate.title);
    if (titleSimilarity > 0.6) { confidence += 0.15; reasons.push('similar title'); }
    if (confidence >= 0.5) {
      groups.push({
        incidents: [incident, candidate],
        confidence: Math.min(confidence, 1),
        reason: reasons.join(', '),
      });
    }
  }
  return groups.sort((a, b) => b.confidence - a.confidence);
}

function computeTitleSimilarity(a: string, b: string): number {
  const wordsA = a.toLowerCase().split(/\s+/);
  const wordsB = b.toLowerCase().split(/\s+/);
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  let intersection = 0;
  for (const w of setA) if (setB.has(w)) intersection++;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union > 0 ? intersection / union : 0;
}

export function findDuplicateGroups(incidents: Incident[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const processed = new Set<string>();
  for (const incident of incidents) {
    if (processed.has(incident.id)) continue;
    const dupes = detectDuplicates(incident, incidents);
    for (const group of dupes) {
      const key = group.incidents.map((i) => i.id).sort().join(',');
      if (!processed.has(key)) {
        groups.push(group);
        group.incidents.forEach((i) => processed.add(i.id));
      }
    }
  }
  return groups;
}
