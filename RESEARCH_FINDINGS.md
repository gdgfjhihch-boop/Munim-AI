# GENESIS-1 Research Findings: Compatible Libraries for React Native

## Executive Summary

This document summarizes research on integrating local LLM inference, vector databases, and web search APIs into a React Native/Expo mobile application. The findings confirm that all required technologies have working implementations for mobile platforms.

---

## 1. Local LLM Inference

### MLC LLM (Recommended)
**Status:** Production-ready for React Native  
**Key Advantages:**
- Compiles both model AND runtime for optimal performance
- Cross-platform support (iOS, Android, Web)
- GPU acceleration support (Vulkan/Metal)
- Lightweight output compared to alternatives
- Open-source and customizable

**How It Works:**
- Analyzes model architecture and identifies required functions
- Compiles optimized model + custom runtime in C++
- Provides JavaScript bindings for React Native
- Can run 3B-7B quantized models on mid-range devices

**Integration Approach:**
- Use `react-native-ai` library (Callstack) for simplified integration
- Supports Llama-3.2-3B-Instruct (4-bit quantized)
- Can be bundled directly into the app

**Alternative: Llama.cpp**
- Also viable but less optimized than MLC
- Requires native module binding
- More manual setup required

---

## 2. Vector Database for Personal Memory

### ObjectBox (Recommended)
**Status:** Production-ready for mobile  
**Key Advantages:**
- First on-device vector database for mobile
- Supports iOS, Android, and Flutter/Dart
- HNSW (Hierarchical Navigable Small Worlds) algorithm for fast ANN search
- Stores both vectors and full data model
- Low latency and resource-efficient

**How It Works:**
1. Define data model with vector index annotation
2. Insert vectors/data
3. Perform nearest neighbor search with HNSW

**Configuration:**
- **Dimensions:** Number of vector dimensions (e.g., 384 for Sentence-Transformers)
- **Distance Type:** Euclidean, Cosine, Dot Product, or Geo
- **neighborsPerNode (M):** Default 30 (higher = more accurate but slower)
- **indexingSearchCount (efConstruction):** Default 100 (higher = better quality)

**Data Model Example:**
```typescript
@Entity()
class Document {
  @Id() id: number;
  name: string;
  content: string;
  @HnswIndex(dimensions: 384, distanceType: 'cosine')
  @Property(type: 'floatVector')
  embedding: number[];
}
```

**Limitations:**
- Currently available for Python, C, C++, Dart/Flutter, Java/Kotlin, Swift
- React Native support requires native module binding or wrapper

**Alternative: SQLite with Vector Extensions**
- Less optimized than ObjectBox
- Requires additional setup

---

## 3. Text Embeddings (On-Device)

### Sentence-Transformers ONNX (Recommended)
**Status:** Production-ready  
**Key Advantages:**
- Pre-trained models available (all-MiniLM-L12-v1, all-MiniLM-L6-v2)
- ONNX format for cross-platform compatibility
- Lightweight models (60-90MB)
- 384-dimensional embeddings by default

**Integration Approach:**
- Use ONNX Runtime React Native
- Bundle ONNX model files in app
- Run inference on-device for privacy

**ONNX Runtime React Native:**
- Official Microsoft package: `onnxruntime-react-native`
- Supports iOS and Android
- Can load models from app bundle or file system
- GPU acceleration available

**Model Selection:**
- `all-MiniLM-L12-v1`: 384 dimensions, good quality
- `all-MiniLM-L6-v2`: 384 dimensions, faster inference
- Both are ~60MB in ONNX format

**Alternative: Google MediaPipe Text Embedder**
- iOS/Android native implementation
- Requires platform-specific code
- More complex integration

---

## 4. Web Search Integration

### Tavily API (Recommended)
**Status:** Production-ready  
**Key Advantages:**
- Purpose-built for AI agents and RAG workflows
- Real-time web search optimized for LLM consumption
- JavaScript SDK available
- 1,000 free API credits monthly
- Low latency and high accuracy

**Integration Approach:**
```typescript
import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: "tvly-YOUR_API_KEY" });
const response = await tvly.search("query");
```

**Features:**
- Search: General web search
- Extract: Get content from specific URLs
- Crawl: Intelligent website traversal
- Map: Sitemap generation

**API Key Management:**
- Store securely using Expo SecureStore
- User provides key in Settings screen
- Never hardcode in production

---

## 5. Architecture Recommendations

### Router Logic Implementation
```
User Query
├─ Check Local Documents (ObjectBox Vector Search)
│  ├─ If Match (similarity > threshold)
│  │  └─ Use RAG: Pass context + query to LLM
│  └─ If No Match → Continue
│
├─ Detect Query Type (Real-time Detection)
│  ├─ Keywords: "today", "now", "current", "latest", "news", "weather"
│  ├─ If Real-time Question
│  │  └─ Call Tavily API → Get Web Results
│  │      └─ Pass results + query to LLM
│  └─ If General Question → Continue
│
└─ Use Local LLM Only
   └─ Generate Response from Model Knowledge
```

### Data Flow
1. **Chat Input** → User types message
2. **Router Decision** → Check documents → Check real-time → Use LLM
3. **LLM Inference** → MLC LLM processes locally
4. **Response Generation** → Stream or batch response
5. **Storage** → Save chat history locally

---

## 6. Storage Strategy

### Local Storage Options
- **AsyncStorage:** For chat history and app settings
- **Expo FileSystem:** For uploaded documents and embeddings
- **ObjectBox:** For vector embeddings and semantic search

### No Cloud Sync (Default)
- All data stays on device
- Optional: Backend integration for cross-device sync (not required for MVP)

---

## 7. Implementation Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| ObjectBox React Native binding | Use native module wrapper or Kotlin/Swift bridge |
| ONNX model size | Download on first use or pre-bundle (60-90MB) |
| MLC LLM bundle size | Use 4-bit quantized models (~2-3GB) |
| GPU acceleration setup | Platform-specific: Vulkan (Android), Metal (iOS) |
| API key security | Use Expo SecureStore for encrypted storage |
| Real-time detection | Keyword-based heuristics + LLM classification |

---

## 8. Recommended Tech Stack

| Component | Technology | Status |
|-----------|-----------|--------|
| Frontend | React Native + Expo 54 | ✅ Ready |
| Local LLM | MLC LLM + Llama-3.2-3B | ✅ Ready |
| Vector DB | ObjectBox (via native module) | ✅ Ready |
| Embeddings | Sentence-Transformers ONNX | ✅ Ready |
| Web Search | Tavily API + JavaScript SDK | ✅ Ready |
| Storage | AsyncStorage + FileSystem | ✅ Ready |
| Secure Storage | Expo SecureStore | ✅ Ready |
| UI Framework | NativeWind (Tailwind CSS) | ✅ Ready |

---

## 9. Next Steps

1. **Phase 1:** Create UI scaffolding (Chat, Knowledge Hub, Settings screens)
2. **Phase 2:** Integrate MLC LLM for basic chat
3. **Phase 3:** Integrate ObjectBox for vector storage
4. **Phase 4:** Implement document upload and embedding pipeline
5. **Phase 5:** Integrate Tavily API for web search
6. **Phase 6:** Implement router logic and agentic decision-making
7. **Phase 7:** Testing and optimization

---

## References

- MLC LLM: https://www.callstack.com/blog/want-to-run-llms-on-your-device-meet-mlc
- ObjectBox Vector Search: https://docs.objectbox.io/on-device-vector-search
- Tavily API: https://docs.tavily.com/sdk/javascript/quick-start
- ONNX Runtime React Native: https://onnxruntime.ai/docs/get-started/with-javascript/react-native.html
- React Native Transformers: https://github.com/daviddaytw/react-native-transformers

