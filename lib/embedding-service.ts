import { EmbeddingResult } from './types';

/**
 * Embedding Service for GENESIS-1
 * Uses all-MiniLM-L6-v2 ONNX model (384-dimensional embeddings)
 * Lightweight and optimized for mobile devices
 */

class EmbeddingService {
  private isInitialized = false;
  private readonly EMBEDDING_DIM = 384;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Initialize the embedding service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = (async () => {
      try {
        // TODO: Load all-MiniLM-L6-v2 ONNX model
        // Model should be bundled with the app or downloaded on first use
        console.log('Embedding service initialized');
        this.isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize embedding service:', error);
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Generate embedding for a single text
   */
  async embed(text: string): Promise<EmbeddingResult> {
    await this.initialize();

    try {
      // TODO: Implement actual ONNX inference
      // For now, return mock embedding
      const mockEmbedding = this.generateMockEmbedding(text);

      return {
        text,
        embedding: mockEmbedding,
        dimensions: this.EMBEDDING_DIM,
      };
    } catch (error) {
      console.error('Embedding failed:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts
   */
  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    await this.initialize();

    try {
      return Promise.all(texts.map((text) => this.embed(text)));
    } catch (error) {
      console.error('Batch embedding failed:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for document content
   */
  async embedDocument(
    documentName: string,
    content: string
  ): Promise<EmbeddingResult> {
    await this.initialize();

    try {
      // For documents, we might want to chunk and embed sections
      // For now, embed the full content
      return this.embed(content);
    } catch (error) {
      console.error('Document embedding failed:', error);
      throw error;
    }
  }

  /**
   * Get embedding dimension
   */
  getEmbeddingDimension(): number {
    return this.EMBEDDING_DIM;
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Generate mock embedding for testing
   * In production, this would use actual ONNX inference
   */
  private generateMockEmbedding(text: string): number[] {
    // Create a deterministic embedding based on text
    // This is for testing only - real implementation uses ONNX model
    const embedding = new Array(this.EMBEDDING_DIM).fill(0);

    // Simple hash-based approach for determinism
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Fill embedding with pseudo-random values based on hash
    for (let i = 0; i < this.EMBEDDING_DIM; i++) {
      embedding[i] = Math.sin(hash + i) * 0.5 + 0.5; // Normalize to [0, 1]
    }

    // Normalize to unit vector
    let norm = 0;
    for (let i = 0; i < this.EMBEDDING_DIM; i++) {
      norm += embedding[i] * embedding[i];
    }
    norm = Math.sqrt(norm);

    for (let i = 0; i < this.EMBEDDING_DIM; i++) {
      embedding[i] /= norm;
    }

    return embedding;
  }
}

export const embeddingService = new EmbeddingService();
