# GENESIS-1 Mobile App Design

## Overview

GENESIS-1 is a fully autonomous private AI agent built for iOS and Android. It combines local LLM inference, local vector database storage for personal memory, and Tavily API integration for real-time web intelligence. The app provides a ChatGPT-style interface with dark theme, enabling users to chat with their personal AI assistant while maintaining complete privacy.

---

## Screen List

1. **Chat Screen (Home)** - Main conversation interface with message history
2. **Knowledge Hub Screen** - Upload and manage personal documents (PDFs, text files)
3. **Settings Screen** - Configure API keys, LLM settings, and app preferences
4. **Document Detail Screen** - View uploaded documents and manage embeddings
5. **Search Results Screen** - Display web search results from Tavily API

---

## Primary Content and Functionality

### 1. Chat Screen (Home)
**Content:**
- Message history displayed in a scrollable list (user messages on right, AI responses on left)
- Input field at bottom with send button
- Loading indicator while AI is thinking
- Toggle for "Search Web" mode (Tavily integration)
- Token usage indicator (optional)

**Functionality:**
- Send text messages to the AI
- Receive responses from local LLM
- Router logic: Check local documents first → Check if web search needed → Use local LLM
- Display source citations when information comes from uploaded documents
- Clear conversation history
- Copy AI responses to clipboard

### 2. Knowledge Hub Screen
**Content:**
- List of uploaded documents with file names, sizes, and upload dates
- "Upload Document" button
- Search bar to filter documents
- Document status indicators (embedding in progress, completed, failed)

**Functionality:**
- Upload PDF and text files
- Trigger local embedding using Sentence-Transformers (ONNX)
- Store embeddings in ObjectBox vector database
- Delete documents
- View document metadata
- Show embedding progress

### 3. Settings Screen
**Content:**
- Tavily API Key input field (secure input)
- LLM Model selection (Llama-3.2-3B-Instruct)
- Hardware acceleration toggle (GPU/Vulkan/Metal)
- Dark/Light theme toggle
- Privacy policy and about section
- App version

**Functionality:**
- Save API key securely using Expo SecureStore
- Toggle web search capability
- Configure GPU acceleration settings
- View system information
- Clear all local data (documents and chat history)

### 4. Document Detail Screen
**Content:**
- Document name and metadata
- File size and upload date
- Embedding status and progress
- Preview of document content (first 500 characters)
- Delete button

**Functionality:**
- View document details
- Delete document and its embeddings
- Retry embedding if failed

### 5. Search Results Screen
**Content:**
- List of web search results from Tavily API
- Result title, URL, and snippet
- Source attribution

**Functionality:**
- Display search results
- Open URLs in browser
- Copy links to clipboard

---

## Key User Flows

### Flow 1: Chat with AI (Local LLM Only)
1. User opens app → Chat Screen loads
2. User types message and taps send
3. Router checks: Is answer in local documents? (No)
4. Router checks: Is it a real-time question? (No)
5. LLM processes query locally
6. AI response displayed in chat
7. User can continue conversation

### Flow 2: Chat with Web Search
1. User enables "Search Web" toggle
2. User types question about current events
3. Router checks: Is answer in local documents? (No)
4. Router checks: Is it a real-time question? (Yes) → Call Tavily API
5. Search results retrieved
6. LLM synthesizes response using search results
7. Response displayed with source citations
8. User can view search results in detail

### Flow 3: Chat with Personal Documents
1. User uploads PDF to Knowledge Hub
2. Document is embedded using Sentence-Transformers (ONNX)
3. Embeddings stored in ObjectBox
4. User asks question related to document
5. Router checks: Is answer in local documents? (Yes)
6. Vector DB performs semantic search
7. Relevant passages retrieved and passed to LLM
8. LLM generates response with document context
9. Response displayed with source citations

### Flow 4: Upload and Manage Documents
1. User navigates to Knowledge Hub
2. Taps "Upload Document"
3. File picker opens
4. User selects PDF or text file
5. File uploaded and embedding starts
6. Progress indicator shows embedding status
7. Document appears in list when complete
8. User can delete document anytime

---

## Color Scheme

**Dark Theme (Primary):**
- **Background:** #0F0F0F (Deep Black)
- **Surface:** #1A1A1A (Card backgrounds)
- **Primary Accent:** #10A37F (Teal/Green - OpenAI-inspired)
- **Secondary Accent:** #0D47A1 (Deep Blue)
- **Text Primary:** #FFFFFF (White)
- **Text Secondary:** #B0B0B0 (Light Gray)
- **Border:** #2A2A2A (Dark Gray)
- **Success:** #22C55E (Green)
- **Warning:** #F59E0B (Amber)
- **Error:** #EF4444 (Red)

**Light Theme (Secondary):**
- **Background:** #FFFFFF (White)
- **Surface:** #F5F5F5 (Light Gray)
- **Primary Accent:** #10A37F (Teal/Green)
- **Text Primary:** #0F0F0F (Black)
- **Text Secondary:** #666666 (Gray)
- **Border:** #E5E5E5 (Light Gray)

---

## Architecture & Privacy

### Router Logic (Decision Tree)
```
User Query
  ├─ Check Local Documents (Vector DB)
  │   ├─ If Match Found → Use RAG (Retrieval-Augmented Generation)
  │   │   └─ Pass context to LLM → Generate Response
  │   └─ If No Match → Continue
  │
  ├─ Check Query Type (Real-time Detection)
  │   ├─ If Real-time Question (news, weather, current events)
  │   │   └─ Call Tavily API → Get Web Results
  │   │       └─ Pass results to LLM → Generate Response
  │   └─ If General Question → Continue
  │
  └─ Use Local LLM Only
      └─ Generate Response from Model Knowledge
```

### Privacy Guarantees
- **100% Local Processing:** All conversations, documents, and embeddings stored locally
- **No Cloud Sync:** No data leaves the device unless explicitly calling Tavily API
- **Secure API Key Storage:** Tavily API key stored using Expo SecureStore (device keychain)
- **Optional Web Search:** Users control when web search is enabled
- **No User Tracking:** No analytics or telemetry

---

## Technical Stack

- **Frontend:** React Native with Expo 54
- **UI Framework:** NativeWind (Tailwind CSS)
- **Local LLM:** MLC LLM or Llama.cpp (Llama-3.2-3B-Instruct, 4-bit quantized)
- **Vector Database:** ObjectBox (local, on-device)
- **Embeddings:** Sentence-Transformers (ONNX format)
- **Web Intelligence:** Tavily API
- **Storage:** Expo FileSystem + ObjectBox
- **Secure Storage:** Expo SecureStore
- **State Management:** React Context + AsyncStorage

---

## Implementation Phases

1. **Phase 1:** Core UI and Chat Interface
2. **Phase 2:** Local LLM Integration (MLC LLM)
3. **Phase 3:** Vector Database Setup (ObjectBox)
4. **Phase 4:** Document Upload and Embedding
5. **Phase 5:** Tavily API Integration
6. **Phase 6:** Router Logic and Agentic Tool-Use
7. **Phase 7:** Settings and Configuration
8. **Phase 8:** Testing and Optimization

