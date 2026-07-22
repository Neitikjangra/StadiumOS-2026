import { NextResponse } from 'next/server';
import { parseFanQuery, generateResponse } from '../../../../lib/fan-assistant/nl-engine';
import { STADIUM_MAP } from '../../../../lib/fan-assistant/knowledge-base';
import type { FanProfile } from '../../../../lib/fan-assistant/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, profile } = body as { message: string; profile: FanProfile };

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const parsed = parseFanQuery(message, profile || { language: 'en', accessibility: 'none', ticket: null, currentLat: null, currentLng: null, locationPermission: 'prompt' });
    const response = generateResponse(parsed, profile || { language: 'en', accessibility: 'none', ticket: null, currentLat: null, currentLng: null, locationPermission: 'prompt' }, STADIUM_MAP);

    return NextResponse.json({
      intent: parsed.intent,
      text: response.text,
      quickReplies: response.quickReplies,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
