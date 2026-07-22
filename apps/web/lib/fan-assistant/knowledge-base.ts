import type {
  StadiumMap,
  StadiumGate,
  StadiumRestroom,
  StadiumConcession,
  StadiumFirstAid,
  StadiumExit,
  StadiumTransport,
  StadiumParking,
  FanFAQ,
  FanSafetyInfo,
  StadiumZone,
} from './types';
import { prisma } from '@/lib/prisma';

let _zones: StadiumZone[] = [];
let _gates: StadiumGate[] = [];
let _restrooms: StadiumRestroom[] = [];
let _concessions: StadiumConcession[] = [];
let _exits: StadiumExit[] = [];
let _transport: StadiumTransport[] = [];
let _parking: StadiumParking[] = [];
let _loaded = false;

async function ensureLoaded() {
  if (_loaded) return;
  try {
    const [dbZones, dbGates, dbConcessions, dbRestrooms] = await Promise.all([
      prisma.zone.findMany({ take: 20 }),
      prisma.gate.findMany({
        take: 20,
        include: { queueSnapshots: { orderBy: { timestamp: 'desc' }, take: 2 } },
      }),
      prisma.concession.findMany({ take: 40 }).catch(() => []),
      prisma.restroom.findMany({ take: 40 }).catch(() => []),
    ]);

    _zones = dbZones.map((z) => ({
      id: z.id, name: z.name, section: z.name.replace(/[^A-Z]/g, '') || z.id.slice(-1).toUpperCase(),
      level: 'ground', lat: 40.7128, lng: -74.006, capacity: z.capacity, currentOccupancy: Math.floor(z.capacity * 0.7),
    }));

    _gates = dbGates.map((g) => ({
      id: g.id, name: g.name, zone: g.name.replace(/[^A-Za-z]/g, '').toLowerCase() || 'unknown', sections: [],
      waitTimeMin: g.queueSnapshots[0]?.waitTime ?? 0,
      isOpen: g.status === 'open', accessible: true, lat: 40.7128, lng: -74.006,
    }));

    _restrooms = dbRestrooms.map((s) => ({
      id: s.id, name: s.name, zone: s.section || 'unknown', level: 'ground',
      waitTimeMin: 3, accessible: s.accessible, familyFriendly: true,
      open: s.status === 'operational', lat: 40.7128, lng: -74.006,
    }));

    _concessions = dbConcessions.map((s) => ({
      id: s.id, name: s.name, type: 'food' as const, zone: s.section || 'unknown',
      level: 'ground', waitTimeMin: 5, open: s.isOpen, accessible: true,
      lat: 40.7128, lng: -74.006,
    }));

    _exits = dbGates.slice(0, 8).map((g) => ({
      id: `exit-${g.id}`, name: g.name, zone: g.name.replace(/[^A-Za-z]/g, '').toLowerCase() || 'unknown', type: 'gate' as const,
      lat: 40.7128, lng: -74.006,
      congestion: (g.queueSnapshots[0]?.length ?? 0) > 300 ? 'high' : 'low',
    }));

    _transport = [
      { id: 'metro-n', name: 'Metro Line A', type: 'metro', stopLocation: 'Stadium Metro North', zone: _zones[0]?.id || 'north', nextDeparture: '3 min', capacity: 800, currentLoad: 650 },
      { id: 'metro-s', name: 'Metro Line B', type: 'metro', stopLocation: 'Stadium Metro South', zone: _zones[1]?.id || 'south', nextDeparture: '5 min', capacity: 800, currentLoad: 720 },
      { id: 'shuttle', name: 'Shuttle to City Center', type: 'shuttle', stopLocation: 'Shuttle Stop East', zone: _zones[2]?.id || 'east', nextDeparture: '8 min', capacity: 50, currentLoad: 35 },
    ];

    _parking = [
      { id: 'p1', name: 'Parking Lot North', zone: _zones[0]?.id || 'north', exitRoute: 'North Exit', walkTimeMin: 5, lat: 40.714, lng: -74.006 },
      { id: 'p2', name: 'Parking Lot South', zone: _zones[1]?.id || 'south', exitRoute: 'South Exit', walkTimeMin: 7, lat: 40.711, lng: -74.0055 },
    ];

    _loaded = true;
  } catch {
    _loaded = true;
  }
}

export const ZONES: StadiumZone[] = new Proxy([] as StadiumZone[], {
  get(_, prop) {
    if (prop === 'then') return undefined;
    ensureLoaded();
    return (_zones as any)[prop];
  },
}) as any;

export const GATES: StadiumGate[] = new Proxy([] as StadiumGate[], {
  get(_, prop) {
    if (prop === 'then') return undefined;
    ensureLoaded();
    return (_gates as any)[prop];
  },
}) as any;

export const RESTROOMS: StadiumRestroom[] = new Proxy([] as StadiumRestroom[], {
  get(_, prop) {
    if (prop === 'then') return undefined;
    ensureLoaded();
    return (_restrooms as any)[prop];
  },
}) as any;

export const CONCESSIONS: StadiumConcession[] = new Proxy([] as StadiumConcession[], {
  get(_, prop) {
    if (prop === 'then') return undefined;
    ensureLoaded();
    return (_concessions as any)[prop];
  },
}) as any;

export const FIRST_AID: StadiumFirstAid[] = [];

export const EXITS: StadiumExit[] = new Proxy([] as StadiumExit[], {
  get(_, prop) {
    if (prop === 'then') return undefined;
    ensureLoaded();
    return (_exits as any)[prop];
  },
}) as any;

export const TRANSPORT: StadiumTransport[] = new Proxy([] as StadiumTransport[], {
  get(_, prop) {
    if (prop === 'then') return undefined;
    ensureLoaded();
    return (_transport as any)[prop];
  },
}) as any;

export const PARKING: StadiumParking[] = new Proxy([] as StadiumParking[], {
  get(_, prop) {
    if (prop === 'then') return undefined;
    ensureLoaded();
    return (_parking as any)[prop];
  },
}) as any;

export const SECTION_TO_GATE_MAP: Record<string, string> = {};
export const SECTION_TO_ZONE_MAP: Record<string, string> = {};

export async function getStadiumMap(): Promise<StadiumMap> {
  await ensureLoaded();
  return { gates: _gates, restrooms: _restrooms, concessions: _concessions, firstAid: FIRST_AID, exits: _exits, transport: _transport, parking: _parking, zones: _zones };
}

export const STADIUM_MAP: StadiumMap = new Proxy({} as StadiumMap, {
  get(_, prop) {
    ensureLoaded();
    const map = { gates: _gates, restrooms: _restrooms, concessions: _concessions, firstAid: FIRST_AID, exits: _exits, transport: _transport, parking: _parking, zones: _zones };
    return (map as any)[prop];
  },
}) as any;

export const FAQS: FanFAQ[] = [
  { id: 'faq1', category: 'entry', question: 'What time do gates open?', answer: { en: 'Gates open 2 hours before kickoff.', es: 'Las puertas se abren 2 horas antes del saque inicial.', fr: 'Les portes ouvrent 2 heures avant le coup d\'envoi.', ar: 'تفتح الأبواب قبل ساعتين من البداية.' }, keywords: ['gate', 'open', 'time', 'entry'] },
  { id: 'faq2', category: 'entry', question: 'What can I bring into the stadium?', answer: { en: 'Allowed: clear bags, small clutches, rain ponchos, sealed water bottles. Prohibited: outside food/drinks, large bags, umbrellas, drones.', es: 'Permitido: bolsos transparentes, carteras pequeñas. Prohibido: comida exterior, bolsos grandes, paraguas, drones.', fr: 'Autorisé: sacs transparents, petites pochettes. Interdit: nourriture extérieure, grands sacs, parapluies, drones.', ar: 'المسموح: أكياس شفافة. المحظور: طعام خارجي، أكياس كبيرة، مظلات، طائرات مسيرة.' }, keywords: ['bring', 'bag', 'allowed', 'prohibited'] },
  { id: 'faq3', category: 'seating', question: 'How do I find my seat?', answer: { en: 'Your seat is on your ticket. Look for section letter, row number, then seat number.', es: 'Tu asiento está en tu boleto. Busca letra de sección, fila, y número de asiento.', fr: 'Votre siège est sur votre billet. Cherchez la section, la rangée, puis le numéro.', ar: 'مقعدك على تذكرتك. ابحث عن حرف القسم، رقم الصف، ثم رقم المقعد.' }, keywords: ['seat', 'find', 'section', 'row', 'ticket'] },
  { id: 'faq4', category: 'payment', question: 'How do I pay for food and drinks?', answer: { en: 'All stands accept contactless payments. Cash at select locations.', es: 'Todos los puestos aceptan pagos sin contacto. Efectivo en ubicaciones selectas.', fr: 'Tous les stands acceptent les paiements sans contact. Espèces dans certains points.', ar: 'جميع الأكشاك تقبل الدفع بدون تلامس. النقد في مواقع محددة.' }, keywords: ['pay', 'payment', 'cash', 'card'] },
  { id: 'faq5', category: 'wifi', question: 'Is there WiFi in the stadium?', answer: { en: 'Yes! Free WiFi: "FIFA2026-Fan". No password needed.', es: '¡Sí! WiFi gratuito: "FIFA2026-Fan". Sin contraseña.', fr: 'Oui! WiFi gratuit: "FIFA2026-Fan". Pas de mot de passe.', ar: 'نعم! WiFi مجاني: "FIFA2026-Fan". بدون كلمة مرور.' }, keywords: ['wifi', 'internet', 'connect'] },
  { id: 'faq6', category: 'safety', question: 'What should I do in an emergency?', answer: { en: 'Stay calm, follow staff, use nearest exit, do NOT use elevators.', es: 'Calma, siga al personal, use la salida más cercana, NO use elevadores.', fr: 'Restez calme, suivez le personnel, utilisez la sortie la plus proche, N\'utilisez PAS les ascenseurs.', ar: 'ابق هادئاً، اتبع الموظفين، استخدم أقرب مخرج، لا تستخدم المصاعد.' }, keywords: ['emergency', 'help', 'exit'] },
  { id: 'faq7', category: 'accessibility', question: 'What accessibility services are available?', answer: { en: 'Wheelchair seating in all sections. Accessible restrooms on every level. Service animals welcome.', es: 'Asientos para silla de ruedas en todas las secciones. Baños accesibles. Animales de servicio bienvenidos.', fr: 'Places accessibles dans toutes les sections. Toilettes accessibles. Animaux d\'assistance bienvenus.', ar: 'مقاعد لذوي الكراسي المتحركة. حمامات في كل مستوى. الحيوانات помощنة مرحب بها.' }, keywords: ['accessibility', 'wheelchair', 'accessible'] },
  { id: 'faq8', category: 'match', question: 'When is the next match?', answer: { en: 'Check your ticket or the Match Day section of the app.', es: 'Consulta tu boleto o la sección Día de Partido.', fr: 'Consultez votre billet ou la section Journée de Match.', ar: 'تحقق من تذكرتك أو قسم يوم المباراة.' }, keywords: ['next', 'match', 'schedule'] },
  { id: 'faq9', category: 'lost', question: 'I lost something. What should I do?', answer: { en: 'Visit Guest Services or use "Get Help" to file a lost item report.', es: 'Visita Servicios al Cliente o usa "Obtener Ayuda" para reportar.', fr: 'Rendez-vous au Service Client ou utilisez "Obtenir de l\'Aide".', ar: 'قم بزيارة خدمات الضيوف أو استخدم "الحصول على المساعدة".' }, keywords: ['lost', 'found', 'missing'] },
  { id: 'faq10', category: 'exit', question: 'How do I leave the stadium after the match?', answer: { en: 'Follow staff directions. Check Transport for shuttle/metro times. Rideshare at East Exit.', es: 'Siga las indicaciones. Consulte Transporte para horarios. Rideshare en Salida Est.', fr: 'Suivez les instructions. Consultez Transport. Rideshare à la Sortie Est.', ar: 'اتبع تعليمات الموظفين. تحقق من النقل. المشاكرة في المخرج الشرقي.' }, keywords: ['leave', 'exit', 'home', 'transport'] },
];

export const SAFETY_INFO: FanSafetyInfo[] = [
  { id: 'sf1', category: 'weather', title: { en: 'Heat Safety', es: 'Seguridad contra el calor', fr: 'Sécurité chaleur', ar: 'السلامة من الحر' }, content: { en: 'Stay hydrated. Free water stations throughout the stadium.', es: 'Mantente hidratado. Estaciones de agua gratis.', fr: 'Restez hydraté. Stations d\'eau gratuites.', ar: 'ابقَ رطباً. محطات ماء مجانية.' }, keywords: ['heat', 'hot', 'water'] },
  { id: 'sf2', category: 'crowd', title: { en: 'Crowd Safety', es: 'Seguridad en multitudes', fr: 'Sécurité foule', ar: 'السلامة في الحشود' }, content: { en: 'Stay with your group. Keep aisles clear. Report unattended bags.', es: 'Mantente con tu grupo. Mantén pasillos despejados. Reporta paquetes sin dueño.', fr: 'Restez avec votre groupe. Gardez les allées libres. Signalez les sacs sans propriétaire.', ar: 'ابقَ مع مجموعتك. أبقِ الممرات واضحة. أبلغ عن الحقائب المهجورة.' }, keywords: ['crowd', 'group', 'separated'] },
  { id: 'sf3', category: 'behavior', title: { en: 'Fan Code of Conduct', es: 'Código de Conducta', fr: 'Code de Conduite', ar: 'قواعد السلوك' }, content: { en: 'Be respectful. No abusive language. No throwing objects.', es: 'Sé respetuoso. Sin lenguaje abusivo. Sin arrojar objetos.', fr: 'Soyez respectueux. Pas de langage abusif. Pas de jets d\'objets.', ar: 'كن محترماً. لا لغة مسيئة. لا رمي أشياء.' }, keywords: ['behavior', 'conduct', 'rule'] },
];

export function getZoneName(zoneId: string, lang: 'en' | 'es' | 'fr' | 'ar'): string {
  const zone = _zones.find((z) => z.id === zoneId);
  return zone?.name || zoneId;
}

export function getGateName(gateId: string, lang: 'en' | 'es' | 'fr' | 'ar'): string {
  const gate = _gates.find((g) => g.id === gateId);
  return gate?.name || gateId;
}
