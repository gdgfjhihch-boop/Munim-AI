import * as SecureStore from 'expo-secure-store';
import { SearchResult } from './types';

/**
 * Tavily API Service for GENESIS-1
 * Provides real-time web search capabilities
 * Securely stores API key using Expo SecureStore
 */

interface TavilySearchResponse {
  results: Array<{
    title: string;
    url: string;
    snippet: string;
    content?: string;
  }>;
  query: string;
  answer: string;
}

class TavilyService {
  private apiKey: string | null = null;
  private readonly API_ENDPOINT = 'https://api.tavily.com/search';
  private readonly SECURE_KEY = 'TAVILY_API_KEY';
  private isInitialized = false;

  /**
   * Initialize Tavily service and load API key from secure storage
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.apiKey = await SecureStore.getItemAsync(this.SECURE_KEY);
      this.isInitialized = true;
      console.log('Tavily service initialized');
    } catch (error) {
      console.error('Failed to initialize Tavily service:', error);
      // Continue without API key - web search will be unavailable
    }
  }

  /**
   * Set or update the API key securely
   */
  async setApiKey(key: string): Promise<void> {
    try {
      if (!key || key.trim().length === 0) {
        throw new Error('API key cannot be empty');
      }

      await SecureStore.setItemAsync(this.SECURE_KEY, key);
      this.apiKey = key;
      console.log('API key saved securely');
    } catch (error) {
      console.error('Failed to save API key:', error);
      throw error;
    }
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Perform a web search using Tavily API
   */
  async search(query: string): Promise<SearchResult[]> {
    await this.initialize();

    if (!this.apiKey) {
      throw new Error(
        'Tavily API key not configured. Please add your API key in Settings.'
      );
    }

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          include_answer: true,
          max_results: 5,
          search_depth: 'basic',
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
      }

      const data: TavilySearchResponse = await response.json();

      return data.results.map((result) => ({
        title: result.title,
        url: result.url,
        snippet: result.snippet,
        source: this.extractDomain(result.url),
      }));
    } catch (error) {
      console.error('Tavily search failed:', error);
      throw error;
    }
  }

  /**
   * Perform a search and get an AI-generated answer
   */
  async searchWithAnswer(query: string): Promise<{
    answer: string;
    results: SearchResult[];
  }> {
    await this.initialize();

    if (!this.apiKey) {
      throw new Error(
        'Tavily API key not configured. Please add your API key in Settings.'
      );
    }

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          include_answer: true,
          max_results: 5,
          search_depth: 'basic',
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
      }

      const data: TavilySearchResponse = await response.json();

      return {
        answer: data.answer,
        results: data.results.map((result) => ({
          title: result.title,
          url: result.url,
          snippet: result.snippet,
          source: this.extractDomain(result.url),
        })),
      };
    } catch (error) {
      console.error('Tavily search with answer failed:', error);
      throw error;
    }
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Clear the API key
   */
  async clearApiKey(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.SECURE_KEY);
      this.apiKey = null;
      console.log('API key cleared');
    } catch (error) {
      console.error('Failed to clear API key:', error);
      throw error;
    }
  }

  /**
   * Get API key status (for debugging)
   */
  getStatus() {
    return {
      isConfigured: this.isConfigured(),
      endpoint: this.API_ENDPOINT,
      initialized: this.isInitialized,
    };
  }
}

export const tavilyService = new TavilyService();
