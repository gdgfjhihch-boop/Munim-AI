import { describe, it, expect } from 'vitest';
import {
  isRealTimeQuery,
  isGeneralQuery,
  routeQuery,
  calculateQueryRelevance,
  extractKeywords,
} from './router';

describe('Router Logic', () => {
  describe('isRealTimeQuery', () => {
    it('should detect real-time keywords', () => {
      expect(isRealTimeQuery('What is the weather today?')).toBe(true);
      expect(isRealTimeQuery('What is happening now?')).toBe(true);
      expect(isRealTimeQuery('Latest news')).toBe(true);
      expect(isRealTimeQuery('Current stock price')).toBe(true);
    });

    it('should detect real-time patterns', () => {
      expect(isRealTimeQuery('What is the current weather?')).toBe(true);
      expect(isRealTimeQuery('What are the latest news?')).toBe(true);
      expect(isRealTimeQuery('What is happening right now?')).toBe(true);
    });

    it('should not detect general queries as real-time', () => {
      expect(isRealTimeQuery('What is machine learning?')).toBe(false);
      expect(isRealTimeQuery('How does photosynthesis work?')).toBe(false);
      expect(isRealTimeQuery('Explain quantum computing')).toBe(false);
    });
  });

  describe('isGeneralQuery', () => {
    it('should identify general queries', () => {
      expect(isGeneralQuery('What is Python?')).toBe(true);
      expect(isGeneralQuery('How to cook pasta')).toBe(true);
    });

    it('should not identify real-time queries as general', () => {
      expect(isGeneralQuery('What is the weather today?')).toBe(false);
      expect(isGeneralQuery('Latest news')).toBe(false);
    });
  });

  describe('routeQuery', () => {
    it('should prioritize RAG when documents are available', () => {
      const decision = routeQuery('Tell me about my project', true, false);
      expect(decision.type).toBe('rag');
    });

    it('should use web search for real-time queries when enabled', () => {
      const decision = routeQuery('What is the weather today?', false, true);
      expect(decision.type).toBe('web');
    });

    it('should use LLM for general queries without documents', () => {
      const decision = routeQuery('What is machine learning?', false, false);
      expect(decision.type).toBe('llm');
    });

    it('should use LLM for real-time queries when web search is disabled', () => {
      const decision = routeQuery('What is the weather today?', false, false);
      expect(decision.type).toBe('llm');
    });
  });

  describe('calculateQueryRelevance', () => {
    it('should calculate relevance based on keyword overlap', () => {
      const query = 'machine learning algorithms';
      const document = 'This document discusses machine learning and deep learning algorithms';
      const relevance = calculateQueryRelevance(query, document);
      expect(relevance).toBeGreaterThan(0);
      expect(relevance).toBeLessThanOrEqual(1);
    });

    it('should return 0 for completely unrelated content', () => {
      const query = 'quantum physics';
      const document = 'This is about cooking recipes and food preparation';
      const relevance = calculateQueryRelevance(query, document);
      expect(relevance).toBe(0);
    });

    it('should return 1 for perfect matches', () => {
      const query = 'hello world';
      const document = 'hello world hello world hello world';
      const relevance = calculateQueryRelevance(query, document);
      expect(relevance).toBe(1);
    });
  });

  describe('extractKeywords', () => {
    it('should extract meaningful keywords', () => {
      const keywords = extractKeywords('What is machine learning and deep learning?');
      expect(keywords).toContain('machine');
      expect(keywords).toContain('learning');
      expect(keywords).toContain('deep');
    });

    it('should filter out stop words', () => {
      const keywords = extractKeywords('the quick brown fox jumps over the lazy dog');
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('over');
      expect(keywords).toContain('quick');
      expect(keywords).toContain('brown');
    });

    it('should filter out short words', () => {
      const keywords = extractKeywords('a big cat and a small dog');
      expect(keywords.every((word) => word.length > 3)).toBe(true);
    });
  });
});
