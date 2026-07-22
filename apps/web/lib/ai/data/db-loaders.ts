import { prisma } from '@/lib/prisma';
import type { VectorDocument } from '../types';

function parseTags(tagsJson: string): string[] {
  try {
    return JSON.parse(tagsJson);
  } catch {
    return [];
  }
}

function mapCategoryToType(category: string): VectorDocument['metadata']['type'] {
  const mapping: Record<string, VectorDocument['metadata']['type']> = {
    emergency_procedures: 'sop',
    stadium_policy: 'policy',
    fan_services: 'venue',
    security_protocols: 'sop',
    accessibility_guide: 'accessibility',
    match_day_operations: 'transport',
    weather_contingency: 'sop',
    evacuation_plan: 'sop',
    faq: 'faq',
    vendor_operations: 'policy',
  };
  return mapping[category] || 'policy';
}

export async function loadKnowledgeDocuments(
  categories: string[]
): Promise<Omit<VectorDocument, 'embedding'>[]> {
  try {
    const docs = await prisma.knowledgeDocument.findMany({
      where: {
        category: { in: categories as any[] },
        status: 'published',
        isDeleted: false,
      },
    });

    return docs.map((doc) => ({
      id: doc.id,
      content: doc.content,
      metadata: {
        type: mapCategoryToType(doc.category),
        title: doc.title,
        tags: parseTags(doc.tags),
        language: doc.language,
        lastUpdated: doc.updatedAt.toISOString(),
      },
    }));
  } catch (error) {
    console.warn('Failed to load knowledge documents from DB:', error);
    return [];
  }
}

export async function loadFAQDocuments(): Promise<Omit<VectorDocument, 'embedding'>[]> {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: {
        isDeleted: false,
      },
    });

    return faqs.map((faq) => ({
      id: faq.id,
      content: `Q: ${faq.question}\nA: ${faq.answer}`,
      metadata: {
        type: 'faq' as const,
        title: faq.question,
        tags: [faq.category],
        language: faq.language,
        lastUpdated: faq.updatedAt.toISOString(),
      },
    }));
  } catch (error) {
    console.warn('Failed to load FAQ documents from DB:', error);
    return [];
  }
}

export async function loadSOPDocuments(): Promise<Omit<VectorDocument, 'embedding'>[]> {
  try {
    const sops = await prisma.sOPRunbook.findMany({
      where: {
        status: 'published',
        isDeleted: false,
      },
    });

    return sops.map((sop) => ({
      id: sop.id,
      content: sop.content,
      metadata: {
        type: 'sop' as const,
        title: sop.title,
        tags: parseTags(sop.tags),
        language: 'en',
        lastUpdated: sop.updatedAt.toISOString(),
      },
    }));
  } catch (error) {
    console.warn('Failed to load SOP documents from DB:', error);
    return [];
  }
}

export async function loadAllDocuments(): Promise<Omit<VectorDocument, 'embedding'>[]> {
  const [knowledgeDocs, faqDocs, sopDocs] = await Promise.all([
    loadKnowledgeDocuments(['fan_services', 'match_day_operations']),
    loadFAQDocuments(),
    loadSOPDocuments(),
  ]);

  return [...knowledgeDocs, ...faqDocs, ...sopDocs];
}
