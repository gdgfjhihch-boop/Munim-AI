# GENESIS-1 Implementation Guide

## Overview

This guide provides step-by-step instructions for completing the GENESIS-1 private AI agent mobile app. The project is built with React Native/Expo and integrates local LLM inference, vector database, and web search capabilities.

---

## Current Status

### Completed
- ✅ Project initialization with Expo 54
- ✅ App branding (custom logo, dark theme colors)
- ✅ Core UI screens (Chat, Knowledge Hub, Settings)
- ✅ Tab navigation with icons
- ✅ Type definitions and interfaces
- ✅ ChatProvider context for state management
- ✅ Router logic for query routing (local/RAG/web/LLM)
- ✅ Unit tests for router logic (15/15 passing)

### In Progress
- 🔄 Local LLM integration (MLC LLM)
- 🔄 Vector database setup (ObjectBox)
- 🔄 Document upload and embedding pipeline

### Not Started
- ⏳ Tavily API integration
- ⏳ Settings persistence
- ⏳ Production build and APK generation

---

## Phase 2: Local LLM Integration (MLC LLM)

### Step 1: Install MLC LLM Package

```bash
cd /home/ubuntu/genesis-1
npm install @mlc-ai/web-llm
```

### Step 2: Create LLM Service Wrapper

Create `/home/ubuntu/genesis-1/lib/llm-service.ts`:

```typescript
import { MLCEngine } from '@mlc-ai/web-llm';
import { Message } from './types';

class LLMService {
  private engine: MLCEngine | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.engine = new MLCEngine({
        model: 'Llama-3.2-3B-Instruct-q4f32_1',
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize LLM:', error);
      throw error;
    }
  }

  async generateResponse(
    messages: Message[],
    systemPrompt: string
  ): Promise<string> {
    if (!this.engine) {
      await this.initialize();
    }

    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const response = await this.engine!.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedMessages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('LLM generation failed:', error);
      throw error;
    }
  }

  async streamResponse(
    messages: Message[],
    systemPrompt: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.engine) {
      await this.initialize();
    }

    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const stream = await this.engine!.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedMessages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          onChunk(content);
        }
      }
    } catch (error) {
      console.error('LLM streaming failed:', error);
      throw error;
    }
  }
}

export const llmService = new LLMService();
```

### Step 3: Create System Prompt

Create `/home/ubuntu/genesis-1/lib/system-prompt.ts`:

```typescript
export const SYSTEM_PROMPT = `You are GENESIS-1, a private AI assistant running entirely on the user's device.

Your core principles:
1. **Privacy First**: All conversations and data stay on the user's device. Never suggest uploading data to cloud services.
2. **Honesty**: Be transparent about your limitations. You have knowledge up to your training date.
3. **Helpfulness**: Provide clear, concise, and actionable responses.
4. **Respect**: Treat the user with respect and acknowledge their concerns.

When answering questions:
- If you're uncertain, say so clearly
- Provide sources or citations when relevant
- Ask clarifying questions if the query is ambiguous
- Offer to search the web if the user has enabled web search and the question is about recent events

Remember: You are the user's loyal, private executive assistant. Your only goal is to help them accomplish their objectives while maintaining complete privacy.`;
```

### Step 4: Update Chat Screen to Use LLM

Update `/home/ubuntu/genesis-1/app/(tabs)/chat.tsx` to integrate the LLM service:

```typescript
import { llmService } from '@/lib/llm-service';
import { SYSTEM_PROMPT } from '@/lib/system-prompt';

// In handleSendMessage function:
const handleSendMessage = async () => {
  if (!inputText.trim()) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: inputText,
    timestamp: Date.now(),
  };

  addMessage(userMessage);
  setInputText('');
  setLoading(true);

  try {
    const response = await llmService.generateResponse(
      [...state.messages, userMessage],
      SYSTEM_PROMPT
    );

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    };
    addMessage(aiMessage);
  } catch (error) {
    setError('Failed to generate response. Please try again.');
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

---

## Phase 3: Vector Database Setup (ObjectBox)

### Step 1: Install ObjectBox

```bash
npm install objectbox
```

### Step 2: Create Vector Database Schema

Create `/home/ubuntu/genesis-1/lib/vector-db.ts`:

```typescript
import { ObjectBox } from 'objectbox';
import { Document } from './types';

interface VectorDocument {
  id: string;
  name: string;
  content: string;
  embedding: number[];
  uploadedAt: number;
}

class VectorDatabase {
  private db: ObjectBox | null = null;

  async initialize() {
    try {
      this.db = await ObjectBox.init({
        directory: './objectbox',
      });
    } catch (error) {
      console.error('Failed to initialize ObjectBox:', error);
      throw error;
    }
  }

  async storeEmbedding(doc: VectorDocument) {
    if (!this.db) {
      await this.initialize();
    }

    try {
      // Store document with embedding
      // Implementation depends on ObjectBox API
    } catch (error) {
      console.error('Failed to store embedding:', error);
      throw error;
    }
  }

  async searchSimilar(embedding: number[], topK: number = 5) {
    if (!this.db) {
      await this.initialize();
    }

    try {
      // Perform vector similarity search using HNSW
      // Implementation depends on ObjectBox API
    } catch (error) {
      console.error('Failed to search embeddings:', error);
      throw error;
    }
  }

  async deleteDocument(id: string) {
    if (!this.db) {
      await this.initialize();
    }

    try {
      // Delete document and its embedding
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }
}

export const vectorDb = new VectorDatabase();
```

---

## Phase 4: Document Upload and Embedding

### Step 1: Install Document Picker and ONNX Runtime

```bash
npm install expo-document-picker onnxruntime-react-native
```

### Step 2: Create Embedding Service

Create `/home/ubuntu/genesis-1/lib/embedding-service.ts`:

```typescript
import * as ONNX from 'onnxruntime-react-native';
import { EmbeddingResult } from './types';

class EmbeddingService {
  private session: ONNX.InferenceSession | null = null;

  async initialize(modelPath: string) {
    try {
      this.session = await ONNX.InferenceSession.create(modelPath);
    } catch (error) {
      console.error('Failed to load embedding model:', error);
      throw error;
    }
  }

  async embed(text: string): Promise<EmbeddingResult> {
    if (!this.session) {
      throw new Error('Embedding service not initialized');
    }

    try {
      // Tokenize text
      // Run inference
      // Return embedding vector
      return {
        text,
        embedding: [], // Placeholder
        dimensions: 384,
      };
    } catch (error) {
      console.error('Embedding failed:', error);
      throw error;
    }
  }

  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    return Promise.all(texts.map((text) => this.embed(text)));
  }
}

export const embeddingService = new EmbeddingService();
```

---

## Phase 5: Tavily API Integration

### Step 1: Install Tavily SDK

```bash
npm install @tavily/core
```

### Step 2: Create Tavily Service

Create `/home/ubuntu/genesis-1/lib/tavily-service.ts`:

```typescript
import { tavily } from '@tavily/core';
import { SearchResult } from './types';
import * as SecureStore from 'expo-secure-store';

class TavilyService {
  private apiKey: string | null = null;

  async initialize() {
    try {
      this.apiKey = await SecureStore.getItemAsync('TAVILY_API_KEY');
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
    }
  }

  async setApiKey(key: string) {
    try {
      await SecureStore.setItemAsync('TAVILY_API_KEY', key);
      this.apiKey = key;
    } catch (error) {
      console.error('Failed to save API key:', error);
      throw error;
    }
  }

  async search(query: string): Promise<SearchResult[]> {
    if (!this.apiKey) {
      throw new Error('Tavily API key not configured');
    }

    try {
      const tvly = tavily({ apiKey: this.apiKey });
      const response = await tvly.search(query);

      return response.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        snippet: result.snippet,
        source: new URL(result.url).hostname,
      }));
    } catch (error) {
      console.error('Tavily search failed:', error);
      throw error;
    }
  }

  async extract(url: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Tavily API key not configured');
    }

    try {
      const tvly = tavily({ apiKey: this.apiKey });
      const response = await tvly.extract(url);
      return response.raw_content;
    } catch (error) {
      console.error('Content extraction failed:', error);
      throw error;
    }
  }
}

export const tavilyService = new TavilyService();
```

---

## Phase 6: Router Logic Integration

Update the Chat Screen to use the router:

```typescript
import { routeQuery } from '@/lib/router';
import { llmService } from '@/lib/llm-service';
import { tavilyService } from '@/lib/tavily-service';
import { vectorDb } from '@/lib/vector-db';

const handleSendMessage = async () => {
  // ... existing code ...

  // Route the query
  const decision = routeQuery(
    inputText,
    state.messages.length > 0, // hasLocalDocuments
    state.webSearchEnabled
  );

  let context = '';
  let sources: string[] = [];

  // Execute routing decision
  if (decision.type === 'rag') {
    // Search local documents
    // context = await vectorDb.searchSimilar(...)
  } else if (decision.type === 'web') {
    // Search web
    const results = await tavilyService.search(inputText);
    context = results.map((r) => `${r.title}: ${r.snippet}`).join('\n');
    sources = results.map((r) => r.url);
  }

  // Generate response with context
  const response = await llmService.generateResponse(
    [...state.messages, userMessage],
    SYSTEM_PROMPT + (context ? `\n\nContext:\n${context}` : '')
  );

  // ... rest of code ...
};
```

---

## Building for Production

### Android APK Build

```bash
cd /home/ubuntu/genesis-1
eas build --platform android --profile preview
```

### iOS Build

```bash
cd /home/ubuntu/genesis-1
eas build --platform ios --profile preview
```

### Local Development Build

```bash
cd /home/ubuntu/genesis-1
npm run android  # or npm run ios
```

---

## Troubleshooting

### LLM Not Loading
- Ensure model files are bundled correctly
- Check device storage space (3GB+ required)
- Verify GPU acceleration settings

### Vector Database Issues
- Clear ObjectBox cache: `rm -rf ./objectbox`
- Rebuild embeddings for documents
- Check ONNX model compatibility

### Tavily API Errors
- Verify API key is correctly stored
- Check rate limiting (1000 credits/month)
- Ensure internet connection for web search

---

## Next Steps

1. Complete LLM integration and test basic chat
2. Set up vector database and document embedding
3. Integrate Tavily API for web search
4. Implement settings persistence
5. Build and test on physical devices
6. Generate production APK/IPA

---

## References

- MLC LLM: https://mlc.ai/
- ObjectBox: https://objectbox.io/
- Tavily API: https://tavily.com/
- Expo Documentation: https://docs.expo.dev/
- React Native: https://reactnative.dev/

