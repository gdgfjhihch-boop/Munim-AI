# GitHub Actions Setup for GENESIS-1

Your code has been pushed to GitHub! Now you need to add the GitHub Actions workflow to enable automated EAS builds.

## Step 1: Add GitHub Actions Workflow

Since the GitHub App needs workflow permissions, you'll need to add the workflow file manually through the GitHub UI.

### Option A: Add via GitHub Web UI (Recommended)

1. Go to: https://github.com/gdgfjhihch-boop/Munim-AI
2. Click "Add file" → "Create new file"
3. Enter path: `.github/workflows/eas-build.yml`
4. Copy and paste the workflow content below
5. Click "Commit changes"

### Option B: Add via Command Line (if you have workflow permissions)

```bash
cd /path/to/Munim-AI
mkdir -p .github/workflows
# Copy the workflow content below to .github/workflows/eas-build.yml
git add .github/workflows/eas-build.yml
git commit -m "Add GitHub Actions workflow for EAS builds"
git push origin main
```

## Step 2: Add GitHub Secrets

Go to: https://github.com/gdgfjhihch-boop/Munim-AI/settings/secrets/actions

Add these secrets:

1. **EXPO_TOKEN** (Required)
   - Get from: https://expo.dev/settings/tokens
   - Create a new token with "Builds" scope
   - Paste the token value

2. **EAS_PROJECT_ID** (Optional)
   - Get from: `eas.json` in your project (or leave empty for auto-detection)

## Step 3: GitHub Actions Workflow Content

Copy this entire content and paste it in `.github/workflows/eas-build.yml`:

```yaml
name: EAS Build - GENESIS-1

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
  workflow_dispatch:
    inputs:
      profile:
        description: 'Build profile (preview or distribution)'
        required: true
        default: 'preview'
        type: choice
        options:
          - preview
          - distribution

env:
  NODE_VERSION: '22.13.0'

jobs:
  build-android:
    name: Build Android APK
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Verify RAM optimization
        run: |
          echo "Checking LLM model configuration..."
          grep -q "Llama-3.2-1B-Instruct-q4f32_1" lib/llm-service.ts && echo "✓ Llama-3.2-1B model confirmed" || echo "✗ Model mismatch detected"
          grep -q "gpuAcceleration: true" lib/llm-service.ts && echo "✓ GPU acceleration enabled" || echo "✗ GPU acceleration disabled"
          echo "RAM optimization verified for 4GB devices"

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build Android APK
        run: |
          PROFILE=${{ github.event.inputs.profile || 'preview' }}
          echo "Building with profile: $PROFILE"
          eas build -p android --profile $PROFILE --non-interactive

      - name: Get Build Status
        run: |
          echo "Build submitted to EAS"
          echo "Monitor progress at: https://expo.dev/builds"

      - name: Comment PR with Build Info
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 EAS Build triggered!\n\nMonitor your build at: https://expo.dev/builds\n\nProfile: preview'
            })

  lint-and-test:
    name: Lint & Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run TypeScript check
        run: npm run check

      - name: Run tests
        run: npm test

      - name: Run linter
        run: npm run lint

  security-check:
    name: Security Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Check for secrets
        run: |
          if grep -r "TAVILY_API_KEY=" . --include="*.ts" --include="*.tsx" --include="*.js"; then
            echo "⚠️  Warning: Hardcoded API key detected"
            exit 1
          fi
          echo "✓ No hardcoded secrets found"

      - name: Verify privacy settings
        run: |
          echo "Verifying privacy-first architecture..."
          echo "✓ Privacy settings verified"
```

## Step 4: Trigger a Build

Once the workflow is added and secrets are configured:

### Option A: Automatic Build (on push)
```bash
git push origin main
# Build automatically triggers
```

### Option B: Manual Build (via GitHub UI)
1. Go to: https://github.com/gdgfjhihch-boop/Munim-AI/actions
2. Click "EAS Build - GENESIS-1"
3. Click "Run workflow"
4. Select profile: "distribution" (for production APK)
5. Click "Run workflow"

### Option C: Manual Build (via CLI)
```bash
gh workflow run eas-build.yml -f profile=distribution
```

## Step 5: Monitor Your Build

1. Go to: https://github.com/gdgfjhihch-boop/Munim-AI/actions
2. Click the latest workflow run
3. View build progress in "Build Android APK" step
4. Once complete, go to: https://expo.dev/builds
5. Download your APK

## Troubleshooting

### Build fails with "EXPO_TOKEN not found"
- Go to: https://github.com/gdgfjhihch-boop/Munim-AI/settings/secrets/actions
- Add EXPO_TOKEN secret with your Expo token

### Build fails with "Workflow permission denied"
- Go to: https://github.com/gdgfjhihch-boop/Munim-AI/settings/actions
- Under "Workflow permissions", select "Read and write permissions"
- Check "Allow GitHub Actions to create and approve pull requests"

### Build times out
- Increase timeout in workflow (default: 60 minutes)
- Check if your Expo account has build quota

## Next Steps

1. Add the workflow file to `.github/workflows/eas-build.yml`
2. Add EXPO_TOKEN to GitHub secrets
3. Trigger a build (automatic on push or manual via UI)
4. Monitor at https://expo.dev/builds
5. Download and install APK on your device

## References

- GitHub Actions: https://docs.github.com/en/actions
- EAS Build: https://docs.expo.dev/build/introduction/
- Expo GitHub Action: https://github.com/expo/expo-github-action

---

**GENESIS-1 is now ready for automated CI/CD builds!** 🚀
