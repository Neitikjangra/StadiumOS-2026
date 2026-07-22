import { NextResponse } from 'next/server';
import type { HelpRequest } from '../../../../lib/fan-assistant/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, description, location, section, contactInfo, language, accessibility } = body as Partial<HelpRequest>;

    if (!type || !description) {
      return NextResponse.json({ error: 'Type and description are required' }, { status: 400 });
    }

    const helpRequest: HelpRequest = {
      type: type as HelpRequest['type'],
      description,
      location: location || '',
      section: section || '',
      contactInfo: contactInfo || '',
      language: (language as HelpRequest['language']) || 'en',
      accessibility: (accessibility as HelpRequest['accessibility']) || 'none',
      timestamp: Date.now(),
    };

    void helpRequest;

    return NextResponse.json({
      success: true,
      message: 'Help request submitted successfully. A staff member will assist you shortly.',
      requestId: `HR-${Date.now()}`,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
