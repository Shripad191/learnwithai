# Separate API Keys Configuration

## Overview
The application now supports using separate Gemini API keys for each feature (Summary Generator, Mind Map Generator, and Quiz Generator).

## Environment Variables

Add these to your `.env.local` file:

```env
# Default API key (fallback for all features)
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDF-zkgpgJTNT3AMF3HjjU9o-au5Uc0z6s

# Feature-specific API keys (optional)
NEXT_PUBLIC_GEMINI_API_KEY_SUMMARY=AIzaSyCKcyvnN8vZLpeegIHGqjeHDJxSh3Tl1qk
NEXT_PUBLIC_GEMINI_API_KEY_MINDMAP=AIzaSyBzPcwOYwjW7HLMMNRGCTBrbXszqjmm1es
NEXT_PUBLIC_GEMINI_API_KEY_QUIZ=AIzaSyBzPcwOYwjW7HLMMNRGCTBrbXszqjmm1es
```

## How It Works

**Fallback System:**
- If a feature-specific key is not provided, the system falls back to `NEXT_PUBLIC_GEMINI_API_KEY`
- You can use all separate keys, or just the default key, or a mix

**Feature Mapping:**
1. **Summary Generator** → Uses `NEXT_PUBLIC_GEMINI_API_KEY_SUMMARY`
   - Fallback: `NEXT_PUBLIC_GEMINI_API_KEY`
   
2. **Mind Map Generator** → Uses `NEXT_PUBLIC_GEMINI_API_KEY_MINDMAP`
   - Fallback: `NEXT_PUBLIC_GEMINI_API_KEY`
   
3. **Quiz Generator** → Uses `NEXT_PUBLIC_GEMINI_API_KEY_QUIZ`
   - Fallback: `NEXT_PUBLIC_GEMINI_API_KEY`

## Configuration Options

### Option 1: Single Key (Simplest)
```env
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDF-zkgpgJTNT3AMF3HjjU9o-au5Uc0z6s
```
All features use the same key.

### Option 2: Separate Keys for Each Feature
```env
NEXT_PUBLIC_GEMINI_API_KEY_SUMMARY=AIzaSyCKcyvnN8vZLpeegIHGqjeHDJxSh3Tl1qk
NEXT_PUBLIC_GEMINI_API_KEY_MINDMAP=AIzaSyBzPcwOYwjW7HLMMNRGCTBrbXszqjmm1es
NEXT_PUBLIC_GEMINI_API_KEY_QUIZ=AIzaSyBN04otMwJk4QaaRDOJIvW9qkXugIqLYF8
```
Each feature uses its own dedicated key.

### Option 3: Mixed (Recommended for Testing)
```env
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDF-zkgpgJTNT3AMF3HjjU9o-au5Uc0z6s
NEXT_PUBLIC_GEMINI_API_KEY_SUMMARY=AIzaSyCKcyvnN8vZLpeegIHGqjeHDJxSh3Tl1qk
```
Summary uses its own key, Mind Map and Quiz use the default.

## Benefits

- **Usage Tracking:** Track API usage per feature
- **Cost Management:** Allocate different budgets per feature
- **Rate Limiting:** Separate rate limits for each feature
- **Testing:** Use test keys for specific features
- **Security:** Isolate keys if one is compromised

## After Configuration

1. Add the keys to `.env.local`
2. Restart the development server: `npm run dev`
3. Each feature will automatically use its designated key
