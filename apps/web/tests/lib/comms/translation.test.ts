import { describe, it, expect } from 'vitest';
import { translateText, translateBatch, detectLanguage } from '@/lib/comms/translation';
import type { Language } from '@/lib/comms/types';

describe('translation', () => {
  describe('translateText', () => {
    it('translates high crowd density alert to Spanish', () => {
      const result = translateText('⚠️ High Crowd Density — {{zone}}', 'es', { zone: 'North' });
      expect(result).toBe('⚠️ Alta Densidad de Multitud — North');
    });

    it('translates high crowd density alert to French', () => {
      const result = translateText('⚠️ High Crowd Density — {{zone}}', 'fr', { zone: 'East' });
      expect(result).toBe('⚠️ Forte Densité de Foule — East');
    });

    it('translates high crowd density alert to Arabic', () => {
      const result = translateText('⚠️ High Crowd Density — {{zone}}', 'ar', { zone: 'South' });
      expect(result).toContain('كثافة بشرية عالية');
    });

    it('keeps English text in English', () => {
      const result = translateText('⚠️ High Crowd Density — {{zone}}', 'en', { zone: 'North' });
      expect(result).toBe('⚠️ High Crowd Density — North');
    });

    it('translates congestion alert', () => {
      const result = translateText('⚠️ Congestion Alert: {{zone}}', 'es', { zone: 'West' });
      expect(result).toContain('Alerta de Congestión');
    });

    it('translates gate reroute message', () => {
      const result = translateText('🚧 Gate {{gate}} Temporarily Redirected', 'fr', { gate: 'A' });
      expect(result).toContain('Porte A Temporairement Redirigée');
    });

    it('translates transit advisory', () => {
      const result = translateText('🚇 Transit Advisory: {{service}} Delays', 'es', { service: 'NJ Transit' });
      expect(result).toContain('Retrasos en NJ Transit');
    });

    it('translates weather advisory', () => {
      const result = translateText('🌧️ Weather Advisory: {{condition}}', 'fr', { condition: 'Heavy Rain' });
      expect(result).toContain('Heavy Rain');
    });

    it('translates accessibility update', () => {
      const result = translateText('♿ Accessibility Update: {{service}}', 'es', { service: 'Elevator' });
      expect(result).toContain('Elevator');
    });

    it('translates security directive', () => {
      const result = translateText('🔒 SECURITY DIRECTIVE: {{title}}', 'ar', { title: 'Evacuate' });
      expect(result).toContain('تعليمات أمنية');
    });

    it('translates lost child alert', () => {
      const result = translateText('🚨 LOST CHILD — {{childName}}', 'fr', { childName: 'John' });
      expect(result).toContain('ENFANT PERDU');
      expect(result).toContain('John');
    });

    it('translates post-match exit guide', () => {
      const result = translateText('🏟️ Post-Match Exit Guide', 'es');
      expect(result).toContain('Guía de Salida Post-Partido');
    });

    it('translates exit gate message', () => {
      const result = translateText('🏟️ EXIT: Use {{exitGate}}', 'ar', { exitGate: 'Gate B' });
      expect(result).toContain('Gate B');
    });

    it('returns original text for unknown template', () => {
      const result = translateText('Custom unknown message', 'es');
      expect(result).toBe('Custom unknown message');
    });

    it('replaces multiple variables', () => {
      const result = translateText('⚠️ High Crowd Density — {{zone}}', 'en', { zone: 'North' });
      expect(result).toContain('North');
    });

    it('handles missing variables gracefully', () => {
      const result = translateText('⚠️ High Crowd Density — {{zone}}', 'es');
      expect(result).toContain('{{zone}}');
    });

    it('handles empty variables object', () => {
      const result = translateText('⚠️ High Crowd Density — {{zone}}', 'fr', {});
      expect(result).toContain('{{zone}}');
    });
  });

  describe('translateBatch', () => {
    it('translates multiple messages at once', () => {
      const messages = [
        { text: '⚠️ High Crowd Density — {{zone}}', language: 'es' as Language, variables: { zone: 'North' } },
        { text: '⚠️ High Crowd Density — {{zone}}', language: 'fr' as Language, variables: { zone: 'South' } },
      ];
      const results = translateBatch(messages);
      expect(results.length).toBe(2);
      expect(results[0].language).toBe('es');
      expect(results[0].translated).toContain('Alta Densidad');
      expect(results[1].language).toBe('fr');
      expect(results[1].translated).toContain('Forte Densité');
    });

    it('preserves original text', () => {
      const messages = [
        { text: '⚠️ High Crowd Density — {{zone}}', language: 'es' as Language, variables: { zone: 'Test' } },
      ];
      const results = translateBatch(messages);
      expect(results[0].original).toBe('⚠️ High Crowd Density — {{zone}}');
    });

    it('handles empty batch', () => {
      const results = translateBatch([]);
      expect(results).toEqual([]);
    });

    it('handles messages without variables', () => {
      const messages = [
        { text: '🏟️ Post-Match Exit Guide', language: 'ar' as Language },
      ];
      const results = translateBatch(messages);
      expect(results[0].translated).toContain('دليل الخروج');
    });

    it('handles mixed languages in batch', () => {
      const messages = [
        { text: '⚠️ High Crowd Density — {{zone}}', language: 'en' as Language, variables: { zone: 'A' } },
        { text: '⚠️ High Crowd Density — {{zone}}', language: 'es' as Language, variables: { zone: 'B' } },
        { text: '⚠️ High Crowd Density — {{zone}}', language: 'fr' as Language, variables: { zone: 'C' } },
        { text: '⚠️ High Crowd Density — {{zone}}', language: 'ar' as Language, variables: { zone: 'D' } },
      ];
      const results = translateBatch(messages);
      expect(results.length).toBe(4);
      expect(results[0].translated).toContain('High Crowd Density');
      expect(results[1].translated).toContain('Alta Densidad');
      expect(results[2].translated).toContain('Forte Densité');
      expect(results[3].translated).toContain('كثافة بشرية عالية');
    });
  });

  describe('detectLanguage', () => {
    it('detects Arabic text', () => {
      expect(detectLanguage('مرحبا بالعالم')).toBe('ar');
    });

    it('detects Arabic with mixed characters', () => {
      expect(detectLanguage('Hello مرحبا World')).toBe('ar');
    });

    it('detects French text', () => {
      expect(detectLanguage('Le ballon est dans le terrain pour les joueurs')).toBe('fr');
    });

    it('detects Spanish text', () => {
      expect(detectLanguage('El balón está en el campo para los jugadores')).toBe('es');
    });

    it('defaults to English for short text', () => {
      expect(detectLanguage('Hello')).toBe('en');
    });

    it('defaults to English for text without common words', () => {
      expect(detectLanguage('Stadium WiFi password is 1234')).toBe('en');
    });

    it('detects French with common words', () => {
      expect(detectLanguage('Les enfants sont avec les parents dans le stade')).toBe('fr');
    });

    it('detects Spanish with common words', () => {
      expect(detectLanguage('Los niños están con los padres en el estadio')).toBe('es');
    });

    it('returns a valid Language type', () => {
      const validLanguages: Language[] = ['en', 'es', 'fr', 'ar'];
      expect(validLanguages).toContain(detectLanguage('test'));
    });

    it('handles empty string', () => {
      expect(detectLanguage('')).toBe('en');
    });
  });
});
