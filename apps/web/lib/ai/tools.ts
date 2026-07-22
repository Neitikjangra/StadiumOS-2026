import type { ToolCall, ToolResult } from './types';
import { prisma } from '@/lib/prisma';

export async function executeTool(toolName: string, params: Record<string, unknown>): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    let data: unknown;

    switch (toolName) {
      case 'get_live_crowd_data': {
        const zones = await prisma.zone.findMany({ take: 20 });
        const recentQueues = await prisma.queueSnapshot.findMany({
          orderBy: { timestamp: 'desc' },
          take: 40,
        });
        const queueByZone = new Map<string, typeof recentQueues>();
        for (const q of recentQueues) {
          if (q.zoneId) {
            if (!queueByZone.has(q.zoneId)) queueByZone.set(q.zoneId, []);
            queueByZone.get(q.zoneId)!.push(q);
          }
        }
        const result: Record<string, unknown> = {};
        for (const zone of zones) {
          const queues = queueByZone.get(zone.id);
          const latest = queues?.[0];
          const oldest = queues?.[queues.length - 1];
          const current = latest?.length ?? Math.floor(zone.capacity * 0.5);
          const percentage = Math.round((current / zone.capacity) * 1000) / 10;
          let trend = 'stable';
          if (latest && oldest && latest.length > oldest.length * 1.1) trend = 'increasing';
          else if (latest && oldest && latest.length < oldest.length * 0.9) trend = 'decreasing';
          result[zone.id] = { current, capacity: zone.capacity, percentage, trend, name: zone.name };
        }
        if (params.zone) {
          data = { zone: params.zone, ...(result[params.zone as string] || {}) };
        } else {
          data = result;
        }
        break;
      }

      case 'get_live_gate_throughput': {
        const gates = await prisma.gate.findMany({
          include: { queueSnapshots: { orderBy: { timestamp: 'desc' }, take: 4 } },
          take: 20,
        });
        const result: Record<string, unknown> = {};
        for (const gate of gates) {
          const latest = gate.queueSnapshots[0];
          result[gate.id] = {
            waitTimeMin: latest?.waitTime ?? 0,
            isOpen: gate.status === 'open',
            throughputPerHour: latest ? Math.round((latest.length / Math.max(latest.waitTime, 1)) * 60) : 0,
            name: gate.name,
          };
        }
        if (params.gate) {
          data = { gate: params.gate, ...(result[params.gate as string] || {}) };
        } else {
          data = result;
        }
        break;
      }

      case 'get_live_weather': {
        const weather = await prisma.weatherSnapshot.findMany({
          orderBy: { timestamp: 'desc' },
          distinct: ['stadiumId'],
          take: 16,
        });
        data = weather.map((w) => ({
          stadiumId: w.stadiumId,
          temperature: w.temperature,
          humidity: w.humidity,
          windSpeed: w.windSpeed,
          conditions: w.conditions,
          uvIndex: w.uvIndex,
        }));
        break;
      }

      case 'get_live_incidents': {
        const incidents = await prisma.incident.findMany({
          where: { isDeleted: false, status: { notIn: ['closed', 'resolved'] } },
          orderBy: [{ severity: 'asc' }, { reportedAt: 'desc' }],
          take: 20,
          include: { zone: { select: { name: true } } },
        });
        data = incidents.map((inc) => ({
          id: inc.id,
          title: inc.title,
          severity: inc.severity,
          zone: inc.zone?.name ?? inc.stadiumId,
          status: inc.status,
          age: `${Math.floor((Date.now() - inc.reportedAt.getTime()) / 60000)}min`,
        }));
        break;
      }

      case 'get_live_staff': {
        const staff = await prisma.staffUser.findMany({
          where: { isDeleted: false },
          select: { role: true },
          take: 200,
        });
        const roleCounts: Record<string, number> = {};
        for (const s of staff) {
          roleCounts[s.role] = (roleCounts[s.role] || 0) + 1;
        }
        data = {
          total: staff.length,
          security: (roleCounts['security'] || 0) + (roleCounts['gate_operator'] || 0),
          operations: (roleCounts['operations'] || 0) + (roleCounts['stadium_manager'] || 0),
          medical: roleCounts['medical'] || 0,
          volunteers: roleCounts['volunteer'] || 0,
          superAdmin: roleCounts['super_admin'] || 0,
        };
        break;
      }

      case 'get_live_devices': {
        const devices = await prisma.deviceStatusRecord.findMany({
          orderBy: { lastSeen: 'desc' },
          take: 50,
        });
        const byType: Record<string, { online: number; offline: number; total: number }> = {};
        for (const d of devices) {
          const type = d.platform || 'unknown';
          if (!byType[type]) byType[type] = { online: 0, offline: 0, total: 0 };
          byType[type].total++;
          if (d.status === 'online') byType[type].online++;
          else byType[type].offline++;
        }
        data = byType;
        break;
      }

      case 'get_live_transport': {
        const transit = await prisma.transitUpdate.findMany({
          orderBy: { timestamp: 'desc' },
          take: 10,
        });
        data = transit.map((t) => ({
          route: t.route,
          type: t.type,
          status: t.status,
          delay: t.delay,
          message: t.message,
          stadiumId: t.stadiumId,
        }));
        break;
      }

      case 'get_stadium_status': {
        const [zones, gates, incidents, staff, weather] = await Promise.all([
          prisma.zone.findMany({ take: 20 }),
          prisma.gate.findMany({ where: { status: 'open' }, select: { id: true } }),
          prisma.incident.count({ where: { isDeleted: false, status: { notIn: ['closed', 'resolved'] } } }),
          prisma.staffUser.count({ where: { isDeleted: false } }),
          prisma.weatherSnapshot.findMany({ orderBy: { timestamp: 'desc' }, distinct: ['stadiumId'], take: 1 }),
        ]);
        const totalCapacity = zones.reduce((s, z) => s + z.capacity, 0);
        const avgOccupancy = zones.length > 0
          ? Math.round(zones.reduce((s, z) => s + (z.capacity * 0.7), 0) / totalCapacity * 1000) / 10
          : 0;
        data = {
          overallOccupancy: avgOccupancy,
          totalCapacity,
          openGates: gates.length,
          activeIncidents: incidents,
          staffOnDuty: staff,
          weather: weather[0] ? { temp: weather[0].temperature, conditions: weather[0].conditions } : null,
        };
        break;
      }

      default:
        return {
          toolName,
          success: false,
          data: null,
          error: `Unknown tool: ${toolName}`,
        };
    }

    return {
      toolName,
      success: true,
      data,
    };
  } catch (error) {
    return {
      toolName,
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function getAvailableTools(): ToolCall[] {
  return [
    { name: 'get_live_crowd_data', parameters: {}, description: 'Get real-time crowd density data for stadium zones' },
    { name: 'get_live_gate_throughput', parameters: {}, description: 'Get real-time gate wait times and throughput' },
    { name: 'get_live_weather', parameters: {}, description: 'Get current weather conditions at the venue' },
    { name: 'get_live_incidents', parameters: {}, description: 'Get active incidents and their status' },
    { name: 'get_live_staff', parameters: {}, description: 'Get current staff deployment numbers' },
    { name: 'get_live_devices', parameters: {}, description: 'Get device health status (cameras, sensors, radios)' },
    { name: 'get_live_transport', parameters: {}, description: 'Get real-time transport departure and load info' },
    { name: 'get_stadium_status', parameters: {}, description: 'Get overall stadium operational status' },
  ];
}
