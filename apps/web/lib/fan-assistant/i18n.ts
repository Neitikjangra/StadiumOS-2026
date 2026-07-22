import type { FanLanguage } from './types';

const TRANSLATIONS: Record<string, Record<FanLanguage, string>> = {
  greeting: {
    en: 'Hello! I\'m your Stadium Assistant for the FIFA World Cup 2026. I can help you find your way, recommend the best gates, restrooms, and food, and keep you safe. How can I help?',
    es: '¡Hola! Soy tu Asistente del Estadio para la Copa Mundial FIFA 2026. Puedo ayudarte a encontrar tu camino, recomendar las mejores puertas, baños y comida, y mantenerte seguro. ¿Cómo puedo ayudar?',
    fr: 'Bonjour! Je suis votre Assistant Stade pour la Coupe du Monde FIFA 2026. Je peux vous aider à vous orienter, recommander les meilleures portes, toilettes et restauration, et vous garder en sécurité. Comment puis-je aider?',
    ar: 'مرحباً! أنا مساعدك في الملعب لكأس العالم FIFA 2026. يمكنني مساعدتك في إيجاد طريقك، وال recommends أفضل الأبواب والحمامات والمطاعم، وإبقائك آمناً. كيف يمكنني المساعدة؟',
  },
  fallback: {
    en: 'I\'m sorry, I don\'t have enough information to answer that. I can help with wayfinding, gate/restroom/food recommendations, safety info, and match-day questions. Try asking about one of those topics.',
    es: 'Lo siento, no tengo suficiente información para responder eso. Puedo ayudar con orientación, recomendaciones de puertas/baños/comida, información de seguridad y preguntas del día del partido.',
    fr: 'Je suis désolé, je n\'ai pas assez d\'informations pour répondre. Je peux vous aider avec l\'orientation, les recommandations de portes/toilettes/restauration, les informations de sécurité et les questions du jour de match.',
    ar: 'أعتذر، ليس لدي معلومات كافية للإجابة على ذلك. يمكنني المساعدة في التوجيه، توصيات الأبواب/الحمامات/الطعام، معلومات السلامة، وأسئلة يوم المباراة.',
  },
  no_ticket: {
    en: 'I don\'t see a ticket linked to your account. For personalized recommendations (best gate, nearest restroom), please link your ticket in Settings, or tell me your section.',
    es: 'No veo un boleto vinculado a tu cuenta. Para recomendaciones personalizadas, vincula tu boleto en Configuración, o dime tu sección.',
    fr: 'Je ne vois pas de billet lié à votre compte. Pour des recommandations personnalisées, liez votre billet dans Paramètres, ou dites-moi votre section.',
    ar: 'لا أرى تذكرة مرتبطة بحسابك. للحصول على توصيات مخصصة، يرجى ربط تذكرتك في الإعدادات، أو أخبرني بقسمك.',
  },
  find_gate: {
    en: 'Based on your section, here\'s the best gate for you:',
    es: 'Basado en tu sección, esta es la mejor puerta para ti:',
    fr: 'Basé sur votre section, voici la meilleure porte pour vous:',
    ar: 'بناءً على قسمك، إليك أفضل بوابة لك:',
  },
  nearest_restroom: {
    en: 'Here are the nearest restrooms, sorted by wait time:',
    es: 'Estos son los baños más cercanos, ordenados por tiempo de espera:',
    fr: 'Voici les toilettes les plus proches, triées par temps d\'attente:',
    ar: 'إليك أقرب الحمامات، مرتبة حسب وقت الانتظار:',
  },
  fastest_food: {
    en: 'Here are the fastest food options right now:',
    es: 'Estas son las opciones de comida más rápidas ahora:',
    fr: 'Voici les options de restauration les plus rapides:',
    ar: 'إليك أسرع خيارات الطعام الآن:',
  },
  safety_info: {
    en: 'Here\'s the safety information:',
    es: 'Aquí está la información de seguridad:',
    fr: 'Voici les informations de sécurité:',
    ar: 'إليك معلومات السلامة:',
  },
  transport_exit: {
    en: 'Best exit routes after the match:',
    es: 'Mejores rutas de salida después del partido:',
    fr: 'Meilleures sorties après le match:',
    ar: 'أفضل مسارات الخروج بعد المباراة:',
  },
  help_request_received: {
    en: 'Your help request has been submitted. A staff member will assist you shortly. Is there anything else I can help with?',
    es: 'Tu solicitud de ayuda ha sido enviada. Un miembro del personal te asistirá pronto. ¿Hay algo más en lo que pueda ayudar?',
    fr: 'Votre demande d\'aide a été soumise. Un membre du personnel vous assistera bientôt. Puis-je vous aider avec autre chose?',
    ar: 'تم إرسال طلب المساعدة الخاص بك. سيساعدك أحد الموظفين قريباً. هل هناك شيء آخر يمكنني مساعفت؟',
  },
  language_changed: {
    en: 'Language changed to English.',
    es: 'Idioma cambiado a Español.',
    fr: 'Langue changée en Français.',
    ar: 'تم تغيير اللغة إلى العربية.',
  },
  accessibility_updated: {
    en: 'Accessibility preferences updated. I\'ll tailor my suggestions accordingly.',
    es: 'Preferencias de accesibilidad actualizadas. Ajustaré mis sugerencias en consecuencia.',
    fr: 'Préférences d\'accessibilité mises à jour. J\'adapterai mes suggestions en conséquence.',
    ar: 'تم تحديث تفضيلات إمكانية الوصول. سأكيف اقتراحاتي وفقاً لذلك.',
  },
  location_needed: {
    en: 'For the best recommendations, I need your location. Please enable location services, or tell me your section.',
    es: 'Para las mejores recomendaciones, necesito tu ubicación. Activa los servicios de ubicación, o dime tu sección.',
    fr: 'Pour les meilleures recommandations, j\'ai besoin de votre position. Activez les services de localisation, ou dites-moi votre section.',
    ar: 'للحصول على أفضل التوصيات، أحتاج إلى موقعك. يرجى تفعيل خدمات الموقع، أو أخبرني بقسمك.',
  },
  faq_gates: {
    en: 'Gates open 2 hours before kickoff. Please arrive early to avoid long lines.',
    es: 'Las puertas se abren 2 horas antes del saque inicial. Llega temprano para evitar filas largas.',
    fr: 'Les portes ouvrent 2 heures avant le coup d\'envoi. Arrivez tôt pour éviter les longues files.',
    ar: 'تفتح الأبواب قبل ساعتين من البداية. يرجى الوصول مبكراً لتجنب الطوابير الطويلة.',
  },
  faq_items: {
    en: 'Allowed: clear bags (max 12"x6"x12"), small clutches, rain ponchos, sealed water. Prohibited: outside food, large bags, umbrellas, flags over 2m.',
    es: 'Permitido: bolsos transparentes, carteras pequeñas, capas de lluvia, agua sellada. Prohibido: comida exterior, bolsos grandes, paraguas, banderas >2m.',
    fr: 'Autorisé: sacs transparents, petites pochettes, ponchos, eau scellée. Interdit: nourriture extérieure, grands sacs, parapluies, drapeaux >2m.',
    ar: 'المسموح: أكياس شفافة، محافظ صغيرة، معاطف مطر، ماء مغلق. المحظور: طعام خارجي، أكياس كبيرة، مظلات، أعلام >2م.',
  },
  faq_payment: {
    en: 'All stands accept contactless payments. Cash accepted at select locations marked "CASH".',
    es: 'Todos los puestos aceptan pagos sin contacto. Efectivo en ubicaciones marcadas "EFECTIVO".',
    fr: 'Tous les stands acceptent les paiements sans contact. Espèces aux points marqués "ESPÈCES".',
    ar: 'جميع الأكشاك تقبل الدفع بدون تلامس. النقد في مواقع محددة.',
  },
  faq_wifi: {
    en: 'Free WiFi: connect to "FIFA2026-Fan". No password needed.',
    es: 'WiFi gratis: conéctate a "FIFA2026-Fan". Sin contraseña.',
    fr: 'WiFi gratuit: connectez-vous à "FIFA2026-Fan". Pas de mot de passe.',
    ar: 'واي فاي مجاني: اتصل بـ "FIFA2026-Fan". بدون كلمة مرور.',
  },
  emergency_instruction: {
    en: 'In an emergency: 1) Stay calm 2) Follow staff instructions 3) Use nearest marked exit 4) Do NOT use elevators 5) Alert staff if you need medical help.',
    es: 'En emergencia: 1) Calma 2) Siga al personal 3) Salida marcada más cercana 4) NO use elevadores 5) Avise si necesita ayuda médica.',
    fr: 'En urgence: 1) Calme 2) Suivez le personnel 3) Sortie la plus proche 4) PAS d\'ascenseurs 5) Alertez si aide médicale nécessaire.',
    ar: 'في الطوارئ: 1) ابقَ هادئاً 2) اتبع الموظفين 3) أقرب مخرج 4) لا مصاعد 5) أبلغ إذا تحتاج مساعدة طبية.',
  },
  accessibility_info: {
    en: 'Accessible seating in all sections. Companion seats available. Accessible restrooms on every level. Assistive listening at Guest Services. Sensory rooms in A3 and B3.',
    es: 'Asientos accesibles en todas las secciones. Asientos de acompañante. Baños accesibles en cada nivel. Asistencia auditiva. Salas sensoriales en A3 y B3.',
    fr: 'Places accessibles dans toutes les sections. Places accompagnant. Toilettes accessibles à chaque niveau. Assistance auditive. Salles sensorielles en A3 et B3.',
    ar: 'مقاعد متاحة في جميع الأقسام. مقاعد مرافقة. حمامات في كل مستوى. أجهزة استماع مساعدة. غرف حسية في A3 و B3.',
  },
  lost_found: {
    en: 'To report a lost item, please describe what you lost and where you last had it. A staff member will check and contact you.',
    es: 'Para reportar un artículo perdido, describe qué perdiste y dónde lo tenías. Un miembro del personal verificará y te contactará.',
    fr: 'Pour signaler un objet perdu, décrivez ce que vous avez perdu et où. Le personnel vérifiera et vous contactera.',
    ar: 'للإبلاغ عن مفقود، يرجى وصف ما فقدته وأين كنت عليه. سيتحقق الموظف ويتواصل معك.',
  },
  transport_info: {
    en: 'Transport options after the match:',
    es: 'Opciones de transporte después del partido:',
    fr: 'Options de transport après le match:',
    ar: 'خيارات النقل بعد المباراة:',
  },
};

export function t(key: string, lang: FanLanguage): string {
  return TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.en || key;
}

export function getLanguageName(lang: FanLanguage): string {
  const names: Record<FanLanguage, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    ar: 'العربية',
  };
  return names[lang];
}

export function getLanguageFlag(lang: FanLanguage): string {
  const flags: Record<FanLanguage, string> = {
    en: '🇺🇸',
    es: '🇪🇸',
    fr: '🇫🇷',
    ar: '🇸🇦',
  };
  return flags[lang];
}
