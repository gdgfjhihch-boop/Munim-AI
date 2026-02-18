import { RouterDecision } from './types';

/**
 * Router logic for GENESIS-1
 * Decides whether to use local documents (RAG), web search (Tavily), or local LLM only
 */

const REAL_TIME_KEYWORDS = [
  'today',
  'now',
  'current',
  'latest',
  'news',
  'weather',
  'recent',
  'breaking',
  'happening',
  'live',
  'update',
  'today\'s',
  'this week',
  'this month',
  'this year',
  'right now',
];

const REAL_TIME_PATTERNS = [
  /what.*happening/i,
  /what.*going on/i,
  /latest.*news/i,
  /current.*weather/i,
  /today.*weather/i,
  /stock.*price/i,
  /crypto.*price/i,
  /exchange.*rate/i,
  /sports.*score/i,
  /game.*result/i,
];

/**
 * Detect if a query is asking about real-time information
 */
export function isRealTimeQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();

  // Check keywords
  const hasKeyword = REAL_TIME_KEYWORDS.some((keyword) =>
    lowerQuery.includes(keyword)
  );

  // Check patterns
  const matchesPattern = REAL_TIME_PATTERNS.some((pattern) =>
    pattern.test(query)
  );

  return hasKeyword || matchesPattern;
}

/**
 * Check if a query is asking for general knowledge (not real-time)
 */
export function isGeneralQuery(query: string): boolean {
  return !isRealTimeQuery(query);
}

/**
 * Main router function
 * Determines the best source for answering a query
 */
export function routeQuery(
  query: string,
  hasLocalDocuments: boolean,
  webSearchEnabled: boolean
): RouterDecision {
  // Priority 1: Check if query matches local documents
  if (hasLocalDocuments) {
    return {
      type: 'rag',
      reason: 'User has uploaded documents. Performing semantic search first.',
      context: 'Will search local documents and use RAG if relevant content found.',
    };
  }

  // Priority 2: Check if it's a real-time query and web search is enabled
  if (isRealTimeQuery(query) && webSearchEnabled) {
    return {
      type: 'web',
      reason: 'Query appears to be about real-time information. Using Tavily API.',
      context: 'Will fetch latest web results and synthesize with LLM.',
    };
  }

  // Priority 3: Use local LLM for general knowledge
  return {
    type: 'llm',
    reason: 'Using local LLM for general knowledge question.',
    context: 'Query will be processed by Llama-3.2-3B model.',
  };
}

/**
 * Calculate query relevance to a document
 * This is a simple heuristic; actual implementation would use vector similarity
 */
export function calculateQueryRelevance(
  query: string,
  documentContent: string
): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  const documentWords = documentContent.toLowerCase().split(/\s+/);
  const documentSet = new Set(documentWords);

  const matchCount = queryWords.filter((word) => documentSet.has(word)).length;
  const relevance = matchCount / queryWords.length;

  return Math.min(relevance, 1.0);
}

/**
 * Extract keywords from a query for better search
 */
export function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'over',
    'under',
  ]);

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));
}
