# GENESIS-1 Build & Deployment Guide

## Overview

GENESIS-1 is a fully autonomous private AI agent running entirely on your device. This guide provides step-by-step instructions to build and deploy the APK for Android devices with 4GB RAM or more.

---

## Prerequisites

### System Requirements
- **Node.js**: v18+ (recommended: v22.13.0)
- **npm/pnpm**: Latest version
- **Android SDK**: API level 31+ (Android 12+)
- **Java Development Kit**: JDK 11+
- **Git**: For version control

### Device Requirements
- **RAM**: 4GB minimum (1B model optimized for this)
- **Storage**: 2GB free space
- **Android Version**: 12+ (API 31+)

---

## Local Development Setup

### 1. Clone & Install Dependencies

```bash
cd /home/ubuntu/genesis-1
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Tavily API Key (optional, can be added in Settings)
TAVILY_API_KEY=tvly-your-api-key-here

# LLM Model Configuration
LLM_MODEL=Llama-3.2-1B-Instruct-q4f32_1
GPU_ACCELERATION=true
```

### 3. Start Development Server

```bash
npm run dev
# or
pnpm dev
```

This starts:
- Metro bundler on port 8081
- Backend server on port 3000

### 4. Test on Device

#### Option A: Expo Go (Fastest for Testing)
```bash
npm run qr
# Scan QR code with Expo Go app on your device
```

#### Option B: Android Emulator
```bash
npm run android
```

---

## Production Build for Android

### Method 1: Using EAS Build (Recommended)

EAS (Expo Application Services) handles the build process in the cloud.

#### Prerequisites
```bash
npm install -g eas-cli
eas login
```

#### Build APK
```bash
cd /home/ubuntu/genesis-1

# Build for Android (generates APK)
eas build -p android --profile distribution

# Monitor build progress
eas build:list
```

The APK will be available for download after the build completes.

### Method 2: Local Build with Android Studio

#### Prerequisites
- Android Studio installed
- Android SDK (API 31+)
- NDK (for native modules)

#### Build Steps

```bash
cd /home/ubuntu/genesis-1

# Generate Android project
npx expo prebuild --clean

# Navigate to Android directory
cd android

# Build APK
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Method 3: Local Build with Gradle CLI

```bash
cd /home/ubuntu/genesis-1

# Prebuild
npx expo prebuild --clean

# Build
cd android && ./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

---

## Installation on Device

### Via ADB (Android Debug Bridge)

```bash
# Connect device via USB
adb devices

# Install APK
adb install path/to/app-release.apk

# Launch app
adb shell am start -n space.manus.genesis-1/space.manus.genesis-1.MainActivity
```

### Via Direct Download

1. Download APK from build service
2. Transfer to device
3. Open file manager → tap APK → Install
4. Grant permissions when prompted

---

## First-Time Setup

### 1. Grant Permissions

When you first launch GENESIS-1, grant these permissions:
- **Storage**: Required for document upload
- **Camera**: Optional, for future features
- **Microphone**: Optional, for voice input

### 2. Configure Tavily API Key

1. Open Settings tab
2. Scroll to "Web Search (Tavily API)"
3. Paste your API key from [tavily.com](https://tavily.com)
4. Tap "Save API Key"

To get a free API key:
- Visit [tavily.com](https://tavily.com)
- Sign up for free
- Copy your API key
- Paste in GENESIS-1 Settings

### 3. Upload Documents

1. Open Knowledge Hub tab
2. Tap "+ Upload Document"
3. Select PDF or text file
4. Wait for embedding to complete (status: ✓ Ready)

---

## Performance Optimization

### Memory Management

GENESIS-1 automatically:
- Releases LLM from memory when app goes to background
- Clears old messages to free memory
- Limits embedding batch size to 5 documents

### For 4GB RAM Devices

**Recommended Settings:**
- Model: Llama-3.2-1B-Instruct (default)
- GPU Acceleration: ON (Vulkan)
- Max Documents: 50
- Max Chat History: 100 messages

**To Optimize:**
1. Settings → Clear All Data (if app is slow)
2. Restart device
3. Close other apps before using GENESIS-1

---

## Troubleshooting

### Issue: "Insufficient Memory" Error

**Solution:**
1. Settings → Clear All Data
2. Restart device
3. Reduce number of documents in Knowledge Hub

### Issue: Web Search Not Working

**Solution:**
1. Check internet connection
2. Verify Tavily API key in Settings
3. Ensure "Web Search" toggle is ON in Chat

### Issue: Document Embedding Failed

**Solution:**
1. Check file size (max 10MB recommended)
2. Try a smaller file
3. Ensure file is valid PDF or text
4. Check available storage space

### Issue: App Crashes on Startup

**Solution:**
```bash
# Clear app data via ADB
adb shell pm clear space.manus.genesis-1

# Or manually:
# Settings → Apps → GENESIS-1 → Storage → Clear Data
```

### Issue: Slow Performance

**Solution:**
1. Disable GPU acceleration (Settings)
2. Reduce chat history (Settings → Clear All Data)
3. Close background apps
4. Restart device

---

## Advanced Configuration

### Custom LLM Model

To use a different model, edit `lib/llm-service.ts`:

```typescript
private config: LLMConfig = {
  model: 'Llama-3.2-1B-Instruct-q4f32_1', // Change this
  temperature: 0.7,
  maxTokens: 512,
  gpuAcceleration: true,
};
```

Available models:
- `Llama-3.2-1B-Instruct-q4f32_1` (1.2GB) - Default, recommended for 4GB RAM
- `Llama-3.2-3B-Instruct-q4f32_1` (3GB) - For 8GB+ RAM devices
- `Mistral-7B-Instruct-v0.2-q4f32_1` (7GB) - For 16GB+ RAM devices

### Custom System Prompt

Edit `app/(tabs)/chat.tsx` to change the system prompt:

```typescript
const systemPrompt = `You are GENESIS-1, a private AI assistant...
// Customize this prompt
`;
```

---

## Security & Privacy

### Data Storage

- **All data stays on your device** - no cloud sync
- Conversations stored in AsyncStorage (encrypted by OS)
- Documents stored in app's private directory
- API keys stored in SecureStore (hardware-backed)

### Network

- Tavily API calls only when "Web Search" is enabled
- No telemetry or tracking
- No user data sent to Manus servers

### Permissions

GENESIS-1 requests only necessary permissions:
- **Storage**: For document upload/access
- **Camera**: For future image recognition
- **Microphone**: For future voice input

---

## Build Artifacts

After building, you'll have:

```
android/app/build/outputs/apk/
├── release/
│   ├── app-release.apk          # Production APK (signed)
│   └── app-release-unsigned.apk # Unsigned APK
└── debug/
    └── app-debug.apk             # Debug APK
```

### APK Specifications

- **Size**: ~150-200MB (includes LLM model)
- **Min API**: 31 (Android 12)
- **Target API**: 34 (Android 14)
- **Architecture**: arm64-v8a, armeabi-v7a

---

## Deployment Checklist

Before releasing:

- [ ] Test on 4GB RAM device
- [ ] Verify Tavily API integration
- [ ] Test document upload (5+ files)
- [ ] Test web search functionality
- [ ] Verify memory management (background/foreground)
- [ ] Check all UI screens render correctly
- [ ] Test error handling (no API key, low storage)
- [ ] Verify app doesn't crash on startup
- [ ] Check battery consumption (should be minimal)
- [ ] Test on multiple Android versions (12, 13, 14)

---

## Support & Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Tavily API Docs](https://docs.tavily.com)
- [MLC LLM Docs](https://mlc.ai/docs)

### Community
- [Expo Discord](https://discord.gg/expo)
- [React Native Community](https://github.com/react-native-community)

---

## Version History

- **v1.0.0** (2026-02-19)
  - Initial release
  - Llama-3.2-1B model integration
  - Tavily API web search
  - Local vector database (AsyncStorage)
  - Document upload & embedding
  - Memory management for 4GB RAM

---

## License

GENESIS-1 is provided as-is for personal use. All dependencies are licensed under their respective licenses.

---

## Next Steps

1. **Build the APK** using one of the methods above
2. **Install on your device**
3. **Configure Tavily API key** in Settings
4. **Upload documents** to Knowledge Hub
5. **Start chatting** with your private AI assistant!

For questions or issues, refer to the troubleshooting section or check the project README.
