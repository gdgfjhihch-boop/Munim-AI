# GENESIS-1 Project TODO

## Phase 1: Core UI and Chat Interface
- [x] Set up app branding (logo, app name, colors)
- [x] Create Chat Screen with message list and input field
- [x] Implement message display (user vs AI messages)
- [x] Add loading indicator for AI responses
- [x] Create bottom tab navigation (Chat, Knowledge Hub, Settings)
- [x] Implement dark theme by default
- [ ] Add "Search Web" toggle in chat header

## Phase 2: Local LLM Integration
- [ ] Research and integrate MLC LLM SDK
- [ ] Download and bundle Llama-3.2-3B-Instruct (4-bit quantized)
- [ ] Implement local inference engine
- [ ] Add GPU acceleration (Vulkan/Metal)
- [ ] Create LLM service wrapper
- [ ] Test basic chat functionality with local model
- [ ] Implement token counting and usage display

## Phase 3: Vector Database Setup
- [ ] Integrate ObjectBox package
- [ ] Define vector schema for embeddings
- [ ] Create ObjectBox service wrapper
- [ ] Implement embedding storage and retrieval
- [ ] Add vector similarity search functionality
- [ ] Test basic vector operations

## Phase 3.5: Core Architecture
- [x] Create type definitions for Message, Document, SearchResult
- [x] Implement ChatProvider context for state management
- [x] Create router logic for query routing (local/RAG/web/LLM)
- [x] Write and pass unit tests for router logic
- [x] Create Knowledge Hub screen UI
- [x] Create Settings screen UI
- [x] Update tab navigation with all screens

## Phase 4: Document Upload and Embedding
- [ ] Create Knowledge Hub Screen UI
- [ ] Implement document picker (PDF and text files)
- [ ] Create document upload handler
- [ ] Integrate Sentence-Transformers (ONNX) for embeddings
- [ ] Implement embedding pipeline
- [ ] Add progress indicator for embedding
- [ ] Store embeddings in ObjectBox
- [ ] Display uploaded documents list
- [ ] Implement document deletion
- [ ] Add document preview

## Phase 5: Tavily API Integration
- [ ] Create Tavily API service wrapper
- [ ] Implement API key management (SecureStore)
- [ ] Add web search functionality
- [ ] Create search results display
- [ ] Implement error handling for API failures
- [ ] Add rate limiting and quota tracking

## Phase 6: Router Logic and Agentic Tool-Use
- [ ] Implement query router decision tree
- [ ] Add local document search logic (RAG)
- [ ] Implement real-time question detection
- [ ] Add Tavily API call logic
- [ ] Implement response synthesis with sources
- [ ] Add source citation in chat responses
- [ ] Test router with various query types

## Phase 7: Settings and Configuration
- [ ] Create Settings Screen UI
- [ ] Implement Tavily API key input (secure)
- [ ] Add LLM model selection
- [ ] Add GPU acceleration toggle
- [ ] Implement theme toggle (dark/light)
- [ ] Add clear all data button
- [ ] Create system information display
- [ ] Add privacy policy and about section
- [ ] Implement settings persistence

## Phase 8: Testing and Optimization
- [ ] Unit tests for LLM service
- [ ] Unit tests for vector database
- [ ] Unit tests for router logic
- [ ] Integration tests for chat flow
- [ ] Performance testing and optimization
- [ ] Memory usage optimization
- [ ] Battery usage optimization
- [ ] Test on iOS and Android devices
- [ ] Fix bugs and edge cases

## Phase 9: Documentation and Build
- [ ] Create system prompt documentation
- [ ] Write setup instructions
- [ ] Create APK build instructions
- [ ] Create iOS build instructions
- [ ] Document API key setup
- [ ] Create user guide
- [ ] Generate production APK

