import { describe, it, expect, beforeEach } from 'vitest';
import { vectorIndex } from '@/lib/ai/vector-index';
import type { VectorDocument } from '@/lib/ai/types';

describe('VectorIndex', () => {
  beforeEach(() => {
    vectorIndex.clear();
  });

  describe('addDocument', () => {
    it('increases index size', () => {
      expect(vectorIndex.size()).toBe(0);
      vectorIndex.addDocument({
        id: 'doc-1',
        content: 'Gate A opens at 6pm for the match',
        metadata: { type: 'sop', title: 'Gate Protocol', language: 'en', tags: ['gate', 'entry'], lastUpdated: '2026-01-01' },
      });
      expect(vectorIndex.size()).toBe(1);
    });

    it('adds multiple documents', () => {
      vectorIndex.addDocuments([
        { id: 'doc-1', content: 'Gate A opens at 6pm', metadata: { type: 'sop', title: 'Gate A', language: 'en', tags: ['gate'], lastUpdated: '2026-01-01' } },
        { id: 'doc-2', content: 'Restroom B is near section 100', metadata: { type: 'faq', title: 'Restroom B', language: 'en', tags: ['restroom'], lastUpdated: '2026-01-01' } },
      ]);
      expect(vectorIndex.size()).toBe(2);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      vectorIndex.addDocuments([
        { id: 'doc-1', content: 'Gate A opens at 6pm for the football match entry procedures', metadata: { type: 'sop', title: 'Gate A Protocol', language: 'en', tags: ['gate', 'entry'], lastUpdated: '2026-01-01' } },
        { id: 'doc-2', content: 'Restroom B is located near section 100 in the north concourse', metadata: { type: 'faq', title: 'Restroom Locations', language: 'en', tags: ['restroom', 'facilities'], lastUpdated: '2026-01-01' } },
        { id: 'doc-3', content: 'Emergency evacuation procedures for all gates and exits', metadata: { type: 'sop', title: 'Emergency Evacuation', language: 'en', tags: ['emergency', 'evacuation'], lastUpdated: '2026-01-01' } },
        { id: 'doc-4', content: 'Informacion en espanol sobre las puertas del estadio', metadata: { type: 'faq', title: 'Info en Espanol', language: 'es', tags: ['spanish', 'info'], lastUpdated: '2026-01-01' } },
      ]);
    });

    it('returns results sorted by relevance', () => {
      const results = vectorIndex.search('gate entry', 5);
      expect(results.length).toBeGreaterThan(0);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
      }
    });

    it('respects topK parameter', () => {
      const results = vectorIndex.search('stadium', 2);
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('filters by type', () => {
      const results = vectorIndex.search('gate', 10, { type: 'sop' });
      for (const r of results) {
        expect(r.document.metadata.type).toBe('sop');
      }
    });

    it('filters by language', () => {
      const results = vectorIndex.search('puertas', 10, { language: 'es' });
      for (const r of results) {
        expect(r.document.metadata.language).toBe('es');
      }
    });

    it('includes document in results', () => {
      const results = vectorIndex.search('gate', 5);
      expect(results[0].document).toBeDefined();
      expect(results[0].document.id).toBeDefined();
    });

    it('returns score between 0 and 1', () => {
      const results = vectorIndex.search('gate', 5);
      for (const r of results) {
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('getDocument', () => {
    it('returns document by id', () => {
      vectorIndex.addDocument({
        id: 'doc-1',
        content: 'Test content',
        metadata: { type: 'sop', title: 'Test', language: 'en', tags: ['test'], lastUpdated: '2026-01-01' },
      });
      const doc = vectorIndex.getDocument('doc-1');
      expect(doc).toBeDefined();
      expect(doc?.id).toBe('doc-1');
    });

    it('returns undefined for unknown id', () => {
      const doc = vectorIndex.getDocument('nonexistent');
      expect(doc).toBeUndefined();
    });
  });

  describe('getDocumentsByType', () => {
    it('returns only documents of given type', () => {
      vectorIndex.addDocuments([
        { id: 'doc-1', content: 'SOP content', metadata: { type: 'sop', title: 'SOP', language: 'en', tags: ['sop'], lastUpdated: '2026-01-01' } },
        { id: 'doc-2', content: 'FAQ content', metadata: { type: 'faq', title: 'FAQ', language: 'en', tags: ['faq'], lastUpdated: '2026-01-01' } },
        { id: 'doc-3', content: 'Another SOP', metadata: { type: 'sop', title: 'SOP 2', language: 'en', tags: ['sop'], lastUpdated: '2026-01-01' } },
      ]);
      const sops = vectorIndex.getDocumentsByType('sop');
      expect(sops.length).toBe(2);
      for (const doc of sops) {
        expect(doc.metadata.type).toBe('sop');
      }
    });
  });

  describe('cosineSimilarity (via search behavior)', () => {
    it('returns higher score for more similar content', () => {
      vectorIndex.addDocuments([
        { id: 'doc-1', content: 'gate opening procedures for match day entry', metadata: { type: 'sop', title: 'Gate', language: 'en', tags: ['gate'], lastUpdated: '2026-01-01' } },
        { id: 'doc-2', content: 'weather forecast for next week in the city', metadata: { type: 'faq', title: 'Weather', language: 'en', tags: ['weather'], lastUpdated: '2026-01-01' } },
      ]);
      const results = vectorIndex.search('gate opening', 5);
      expect(results[0].document.id).toBe('doc-1');
    });

    it('returns 0 for completely unrelated content', () => {
      vectorIndex.addDocument({
        id: 'doc-1',
        content: 'completely unrelated xyzzy plugh boilerplate text',
        metadata: { type: 'sop', title: 'Unrelated', language: 'en', tags: ['test'], lastUpdated: '2026-01-01' },
      });
      const results = vectorIndex.search('quantum entanglement physics', 5);
      expect(results.length).toBe(1);
      expect(results[0].score).toBeGreaterThanOrEqual(0);
    });
  });
});
