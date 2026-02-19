# GENESIS-1: Fully Autonomous Private AI Agent

> Your personal AI assistant that runs entirely on your device. No cloud, no tracking, no compromise on privacy.

---

## 🎯 What is GENESIS-1?

GENESIS-1 is a production-ready mobile app that brings powerful AI capabilities to your Android device while keeping all your data private. It combines:

- **Local LLM**: Llama-3.2-1B (4-bit quantized) for fast, private inference
- **Vector Database**: Local embeddings for semantic search over your documents
- **Web Intelligence**: Tavily API for real-time information when you need it
- **Smart Routing**: Automatically decides between local knowledge, document search, and web search

**Key Features:**
✅ 100% private - all data stays on your device
✅ Works offline - no internet required for core functionality
✅ Fast inference - optimized for 4GB RAM devices
✅ Document upload - build a personal knowledge base
✅ Web search - access current information when enabled
✅ Beautiful UI - dark-themed ChatGPT-style interface
✅ Memory efficient - automatically manages RAM

---

## 🚀 Quick Start

### Prerequisites
- Android 12+ device with 4GB RAM minimum
- 2GB free storage space
- (Optional) Tavily API key for web search

### Installation

1. **Download APK** from the releases page
2. **Transfer to device** and tap to install
3. **Grant permissions** when prompted
4. **Open GENESIS-1** and start chatting!

### First Time Setup

1. **Chat Tab**: Start asking questions immediately
2. **Knowledge Hub**: Upload PDF or text files (optional)
3. **Settings**: Add Tavily API key for web search (optional)

---

## 📋 Features

### Chat Interface
- Clean, intuitive ChatGPT-style UI
- Real-time message streaming
- Web search toggle in header
- Error handling and loading states
- Message history within session

### Knowledge Hub
- Upload PDF and text files
- Automatic semantic embedding
- Document management (view, delete)
- Shows embedding status
- File size and upload date tracking

### Settings
- Secure Tavily API key storage
- GPU acceleration toggle
- Model configuration display
- Knowledge base statistics
- Clear data options
- About and version info

### Smart Routing
The app automatically decides:
1. **Local Documents First**: If you have documents and the query matches them
2. **Web Search**: If web search is enabled and the query needs current info
3. **General Knowledge**: For questions answerable from training data

---

## 🏗️ Architecture

### Core Components

```
GENESIS-1/
├── app/
│   ├── (tabs)/
│   │   ├── chat.tsx           # Main chat interface
│   │   ├── knowledge-hub.tsx  # Document management
│   │   └── settings.tsx       # Configuration
│   └── _layout.tsx            # Root layout with providers
├── lib/
│   ├── llm-service.ts         # Llama-3.2-1B integration
│   ├── vector-db-service.ts   # Local vector database
│   ├── embedding-service.ts   # all-MiniLM-L6-v2 embeddings
│   ├── tavily-service.ts      # Web search integration
│   ├── router.ts              # Query routing logic
│   ├── chat-context.tsx       # State management
│   └── types.ts               # TypeScript definitions
├── hooks/
│   └── use-memory-management.ts # RAM optimization
├── components/
│   ├── screen-container.tsx   # SafeArea wrapper
│   └── ui/
│       └── icon-symbol.tsx    # Icon mapping
└── BUILD_GUIDE.md             # Deployment instructions
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React Native 0.81 | Mobile UI |
| **Styling** | NativeWind (Tailwind) | Responsive design |
| **State** | React Context | Chat state management |
| **Storage** | AsyncStorage | Persistent data |
| **LLM** | @mlc-ai/web-llm | Local inference |
| **Embeddings** | all-MiniLM-L6-v2 | Vector embeddings |
| **Web Search** | Tavily API | Real-time information |
| **Secure Store** | Expo SecureStore | API key storage |

---

## 🔧 Configuration

### Environment Variables

Create `.env.local`:
```env
TAVILY_API_KEY=tvly-your-api-key-here
LLM_MODEL=Llama-3.2-1B-Instruct-q4f32_1
GPU_ACCELERATION=true
```

### Model Selection

Edit `lib/llm-service.ts`:
```typescript
private config: LLMConfig = {
  model: 'Llama-3.2-1B-Instruct-q4f32_1', // 1.2GB (default)
  temperature: 0.7,
  maxTokens: 512,
  gpuAcceleration: true,
};
```

Available models:
- **1B** (1.2GB) - Default, 4GB RAM ✅
- **3B** (3GB) - 8GB RAM ✅
- **7B** (7GB) - 16GB RAM ✅

### System Prompt

Edit `app/(tabs)/chat.tsx` to customize AI behavior:
```typescript
const systemPrompt = `You are GENESIS-1, a private AI assistant...
[Your custom instructions]
`;
```

See `SYSTEM_PROMPT.md` for detailed customization guide.

---

## 📱 Usage Guide

### Starting a Conversation

1. Open the Chat tab
2. Type your question in the input field
3. Tap "Send" or press Enter
4. Wait for the response

### Using Web Search

1. Tap the "Web Search" toggle in the Chat header
2. Ensure you've added your Tavily API key in Settings
3. Ask questions that need current information
4. Results will include sources

### Uploading Documents

1. Go to Knowledge Hub tab
2. Tap "+ Upload Document"
3. Select a PDF or text file
4. Wait for embedding to complete (✓ Ready)
5. Ask questions about your documents

### Managing Settings

1. Go to Settings tab
2. Add/remove Tavily API key
3. Toggle GPU acceleration
4. View knowledge base statistics
5. Clear data if needed

---

## 🔒 Privacy & Security

### Data Storage
- **Conversations**: Stored locally in AsyncStorage (encrypted by OS)
- **Documents**: Stored in app's private directory
- **API Keys**: Stored in SecureStore (hardware-backed)
- **Embeddings**: Stored with documents

### Network
- **Tavily API**: Only called when web search is enabled
- **No Telemetry**: No tracking or analytics
- **No Cloud Sync**: All data stays on device
- **No User Profiling**: Your data is yours alone

### Permissions
- **Storage**: For document upload/access
- **Camera**: For future image recognition
- **Microphone**: For future voice input

---

## ⚡ Performance Optimization

### For 4GB RAM Devices

**Automatic Optimizations:**
- LLM released from memory when app goes to background
- Old messages cleared to free memory
- Embedding batch size limited to 5 documents
- GPU acceleration enabled by default

**Manual Optimization:**
1. Settings → Clear All Data (if app is slow)
2. Restart device
3. Close other apps before using GENESIS-1
4. Disable GPU acceleration if needed

### Memory Usage

| Component | Memory |
|-----------|--------|
| LLM Model (loaded) | ~1.2GB |
| Vector DB (100 docs) | ~50MB |
| Chat History (100 msgs) | ~10MB |
| App Overhead | ~100MB |
| **Total** | **~1.4GB** |

---

## 🐛 Troubleshooting

### App Crashes on Startup
```bash
# Clear app data
adb shell pm clear space.manus.genesis-1
```

### Insufficient Memory Error
1. Settings → Clear All Data
2. Restart device
3. Reduce number of documents

### Web Search Not Working
1. Check internet connection
2. Verify Tavily API key in Settings
3. Ensure "Web Search" toggle is ON

### Document Embedding Failed
1. Check file size (max 10MB recommended)
2. Ensure file is valid PDF or text
3. Check available storage space

### Slow Performance
1. Disable GPU acceleration
2. Clear chat history
3. Close background apps
4. Restart device

---

## 📚 Documentation

- **BUILD_GUIDE.md**: Complete build and deployment instructions
- **SYSTEM_PROMPT.md**: AI behavior customization guide
- **IMPLEMENTATION_GUIDE.md**: Technical implementation details
- **RESEARCH_FINDINGS.md**: Library research and decisions

---

## 🔄 Development

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Test on device
npm run qr

# Build for Android
npm run android
```

### Project Structure

```
genesis-1/
├── app/               # Expo Router screens
├── lib/               # Core services and utilities
├── hooks/             # Custom React hooks
├── components/        # Reusable UI components
├── constants/         # App constants
├── assets/            # Images and icons
├── package.json       # Dependencies
├── app.config.ts      # Expo configuration
└── tailwind.config.js # Tailwind CSS config
```

### Building APK

```bash
# Using EAS (recommended)
eas build -p android --profile distribution

# Or locally
npx expo prebuild --clean
cd android && ./gradlew assembleRelease
```

---

## 📊 Model Specifications

### Llama-3.2-1B-Instruct

| Metric | Value |
|--------|-------|
| Parameters | 1.2B |
| Quantization | 4-bit |
| Context Length | 8K tokens |
| Model Size | 1.2GB |
| RAM Required | 2GB minimum |
| Inference Speed | ~50ms per token (GPU) |
| Supported Platforms | Android 12+, iOS 14+ |

### all-MiniLM-L6-v2

| Metric | Value |
|--------|-------|
| Dimensions | 384 |
| Model Size | 22MB |
| Inference Speed | ~10ms per document |
| Similarity Metric | Cosine |
| Max Sequence Length | 256 tokens |

---

## 🎓 Learning Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Tavily API Docs](https://docs.tavily.com)
- [MLC LLM Docs](https://mlc.ai/docs)
- [NativeWind Docs](https://www.nativewind.dev)

---

## 📝 License

GENESIS-1 is provided as-is for personal use. All dependencies are licensed under their respective licenses.

---

## 🤝 Contributing

This is a personal project. For improvements or bug reports, please refer to the BUILD_GUIDE.md troubleshooting section.

---

## 📞 Support

For technical issues:
1. Check BUILD_GUIDE.md troubleshooting section
2. Review SYSTEM_PROMPT.md for customization
3. Check app logs via `adb logcat`

---

## 🎉 Getting Started

1. **Download** the latest APK
2. **Install** on your Android device
3. **Grant permissions** when prompted
4. **Add Tavily API key** in Settings (optional)
5. **Upload documents** to Knowledge Hub (optional)
6. **Start chatting** with your private AI assistant!

---

## Version

**GENESIS-1 v1.0.0** (2026-02-19)

- ✅ Llama-3.2-1B model integration
- ✅ Local vector database with embeddings
- ✅ Tavily API web search
- ✅ Document upload and management
- ✅ Aggressive memory management
- ✅ Beautiful dark-themed UI
- ✅ Full privacy protection

---

**Your private AI assistant awaits. Welcome to GENESIS-1.** 🚀
