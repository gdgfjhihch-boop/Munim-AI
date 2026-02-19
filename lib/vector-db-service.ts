import AsyncStorage from '@react-native-async-storage/async-storage';
import { Document, EmbeddingResult } from './types';

/**
 * Vector Database Service for GENESIS-1
 * Uses all-MiniLM-L6-v2 (lightweight 384-dim embeddings)
 * Stores embeddings in AsyncStorage for mobile optimization
 */

interface StoredDocument extends Document {
  embedding?: number[];
}

interface VectorSearchResult {
  document: Document;
  similarity: number;
}

class VectorDatabaseService {
  private documents: Map<string, StoredDocument> = new Map();
  private isInitialized = false;
  private readonly STORAGE_KEY = 'genesis1_documents';
  private readonly EMBEDDING_DIM = 384; // all-MiniLM-L6-v2 dimension

  /**
   * Initialize vector database from AsyncStorage
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const docs = JSON.parse(stored);
        this.documents = new Map(docs);
      }
      this.isInitialized = true;
      console.log('Vector DB initialized with', this.documents.size, 'documents');
    } catch (error) {
      console.error('Failed to initialize vector DB:', error);
      throw error;
    }
  }

  /**
   * Store a document with its embedding
   */
  async storeDocument(
    doc: Document,
    embedding: number[]
  ): Promise<void> {
    await this.initialize();

    try {
      const storedDoc: StoredDocument = {
        ...doc,
        embedding,
        embeddingStatus: 'completed',
      };

      this.documents.set(doc.id, storedDoc);
      await this.persist();
      console.log('Stored document:', doc.name);
    } catch (error) {
      console.error('Failed to store document:', error);
      throw error;
    }
  }

  /**
   * Search for similar documents using cosine similarity
   */
  async searchSimilar(
    queryEmbedding: number[],
    topK: number = 5,
    threshold: number = 0.5
  ): Promise<VectorSearchResult[]> {
    await this.initialize();

    try {
      const results: VectorSearchResult[] = [];

      for (const doc of this.documents.values()) {
        if (!doc.embedding) continue;

        const similarity = this.cosineSimilarity(
          queryEmbedding,
          doc.embedding
        );

        if (similarity >= threshold) {
          results.push({
            document: doc,
            similarity,
          });
        }
      }

      // Sort by similarity and return top K
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  /**
   * Delete a document from the database
   */
  async deleteDocument(id: string): Promise<void> {
    await this.initialize();

    try {
      this.documents.delete(id);
      await this.persist();
      console.log('Deleted document:', id);
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }

  /**
   * Get all documents
   */
  async getAllDocuments(): Promise<Document[]> {
    await this.initialize();
    return Array.from(this.documents.values());
  }

  /**
   * Get a specific document by ID
   */
  async getDocument(id: string): Promise<Document | null> {
    await this.initialize();
    return this.documents.get(id) || null;
  }

  /**
   * Clear all documents
   */
  async clearAll(): Promise<void> {
    try {
      this.documents.clear();
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('Cleared all documents');
    } catch (error) {
      console.error('Failed to clear documents:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  getStats() {
    return {
      documentCount: this.documents.size,
      totalSize: Array.from(this.documents.values()).reduce(
        (sum, doc) => sum + doc.size,
        0
      ),
      embeddingDimension: this.EMBEDDING_DIM,
    };
  }

  /**
   * Cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vector dimensions must match');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Persist documents to AsyncStorage
   */
  private async persist(): Promise<void> {
    try {
      const docs = Array.from(this.documents.entries());
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(docs));
    } catch (error) {
      console.error('Failed to persist documents:', error);
      throw error;
    }
  }
}

export const vectorDbService = new VectorDatabaseService();
