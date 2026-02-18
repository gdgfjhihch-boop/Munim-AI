/**
 * Core types and interfaces for GENESIS-1
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: string[];
  isLoading?: boolean;
}

export interface Document {
  id: string;
  name: string;
  content: string;
  size: number;
  uploadedAt: number;
  embeddingStatus: 'pending' | 'completed' | 'failed';
  embeddingProgress?: number;
  embedding?: number[];
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface RouterDecision {
  type: 'local' | 'rag' | 'web' | 'llm';
  reason: string;
  context?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error?: string;
  webSearchEnabled: boolean;
}

export interface SettingsState {
  tavilyApiKey?: string;
  theme: 'light' | 'dark' | 'auto';
  gpuAcceleration: boolean;
  modelName: string;
}

export interface EmbeddingResult {
  text: string;
  embedding: number[];
  dimensions: number;
}

export interface RAGContext {
  documents: Document[];
  relevanceThreshold: number;
  maxResults: number;
}
