import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { getTemplates } from '@/lib/comms/templates';
import type { WorkflowType } from '@/lib/comms/types';

const WORKFLOWS: Array<{
  type: WorkflowType;
  label: string;
  description: string;
  defaultSeverity: string;
  channels: string[];
}> = [
  { type: 'congestion_warning', label: 'Congestion Warning', description: 'Alert fans and operators about high crowd density in specific zones', defaultSeverity: 'high', channels: ['in_app_fan', 'in_app_operator', 'stadium_screen'] },
  { type: 'gate_reroute', label: 'Gate Reroute', description: 'Redirect fans to alternate gates due to congestion or closure', defaultSeverity: 'medium', channels: ['in_app_fan', 'stadium_screen'] },
  { type: 'transit_disruption', label: 'Transit Disruption', description: 'Notify fans of public transit delays or cancellations', defaultSeverity: 'medium', channels: ['in_app_fan', 'email', 'sms'] },
  { type: 'weather_advisory', label: 'Weather Advisory', description: 'Weather-related safety instructions and shelter guidance', defaultSeverity: 'medium', channels: ['in_app_fan', 'stadium_screen', 'stadium_audio'] },
  { type: 'accessibility_update', label: 'Accessibility Update', description: 'Service updates for accessibility needs', defaultSeverity: 'low', channels: ['in_app_fan', 'email'] },
  { type: 'security_instruction', label: 'Security Instruction', description: 'Internal security directives for operators and staff', defaultSeverity: 'critical', channels: ['in_app_operator', 'email'] },
  { type: 'lost_child', label: 'Lost Child / Reunification', description: 'Internal workflow for lost child incidents and reunification', defaultSeverity: 'critical', channels: ['in_app_operator', 'email', 'sms'] },
  { type: 'post_match_exit', label: 'Post-Match Exit', description: 'Exit guidance after match conclusion', defaultSeverity: 'low', channels: ['in_app_fan', 'stadium_screen', 'stadium_audio'] },
];

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasPermission(session.user.role, 'notification:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const workflows = WORKFLOWS.map((wf) => ({
    ...wf,
    templateCount: getTemplates({ workflow: wf.type }).length,
  }));
  return NextResponse.json({ workflows });
}
