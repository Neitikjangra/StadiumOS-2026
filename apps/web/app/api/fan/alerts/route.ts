import { NextResponse } from 'next/server';
import type { FanAlert } from '../../../../lib/fan-assistant/types';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const language = searchParams.get('lang') || 'en';

    const rows = await prisma.alert.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    let alerts: FanAlert[] = rows.map((a) => ({
      id: a.id,
      type: a.type as FanAlert['type'],
      severity: a.severity as FanAlert['severity'],
      title: a.message,
      message: a.message,
      zone: a.gateId ?? undefined,
      timestamp: a.createdAt.getTime(),
      expiresAt: a.createdAt.getTime() + 7200000,
    }));

    alerts = alerts.filter((a) => a.expiresAt > Date.now());

    if (section) {
      alerts = alerts.filter((a) => !a.zone || a.zone === section);
    }

    const localized = alerts.map((a) => ({
      ...a,
      title: language === 'es' ? translateAlert(a.title, 'es') : language === 'fr' ? translateAlert(a.title, 'fr') : language === 'ar' ? translateAlert(a.title, 'ar') : a.title,
      message: language === 'es' ? translateAlert(a.message, 'es') : language === 'fr' ? translateAlert(a.message, 'fr') : language === 'ar' ? translateAlert(a.message, 'ar') : a.message,
    }));

    return NextResponse.json({ alerts: localized });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function translateAlert(text: string, lang: string): string {
  const translations: Record<string, Record<string, string>> = {
    'Heat Advisory': { es: 'Aviso de calor', fr: 'Avis de chaleur', ar: 'تنبيه من الحر' },
    'Gates Opening Soon': { es: 'Las puertas abren pronto', fr: 'Les portes ouvrent bientôt', ar: 'الأبواب تفتح قريباً' },
    'Gate B Temporary Closure': { es: 'Cierre temporal de la Puerta B', fr: 'Fermeture temporaire de la Porte B', ar: 'إغلاق مؤقت للبوابة ب' },
  };

  const titleTranslations = translations[text];
  if (titleTranslations?.[lang]) return titleTranslations[lang];

  return text;
}
