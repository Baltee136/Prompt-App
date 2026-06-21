# Viral Prompts App

A mobile app (iOS/Android) for browsing viral AI photo-editing prompts.
Read-only for users — no account needed. You (the admin) push new prompts
in via a script or the Firebase Console. The feed updates in real time and
always caches the latest 5 prompts on-device for instant load and offline use.

## How it works

```
App Launch
   │
   ├─→ Load cache (instant render, last 5 prompts) ──┐
   │                                                  ▼
   └─→ Firestore onSnapshot (latest 5) ──→ Diff → Update UI + overwrite cache
```

- **Real-time:** `src/hooks/useLatestPrompts.js` opens a Firestore `onSnapshot`
  listener, so any prompt you add in the Console appears in every open app
  instantly — no refresh, no polling.
- **Cache-first:** `src/services/promptCache.js` stores the latest 5 prompts
  in AsyncStorage. On launch, the cached version renders immediately while
  the live listener confirms/updates it in the background.
- **Offline:** Firestore's built-in offline persistence plus the manual
  cache mean the last known 5 prompts always show, even with no signal.
  When the user comes back online, the listener automatically re-syncs.

## Project structure

```
viral-prompts-app/
├── App.js                      # Navigation setup
├── app.json                    # Expo config
├── src/
│   ├── config/firebase.js      # Firebase init — ADD YOUR CONFIG HERE
│   ├── services/
│   │   ├── promptService.js    # Firestore reads (real-time + one-off)
│   │   └── promptCache.js      # AsyncStorage cache layer
│   ├── hooks/
│   │   └── useLatestPrompts.js # Cache + real-time sync logic
│   ├── screens/
│   │   ├── FeedScreen.js
│   │   ├── PromptDetailScreen.js
│   │   ├── SearchScreen.js
│   │   └── SavedScreen.js      # Local-only bookmarks, no account needed
│   └── components/
│       ├── PromptCard.js
│       └── EmptyState.js
├── admin/                      # NOT part of the app — your CLI tools
│   ├── addPrompt.js             # Add one prompt
│   ├── addPromptsBatch.js       # Bulk add from JSON
│   ├── prompts-batch.json       # Edit this for bulk uploads
│   └── serviceAccountKey.json   # YOU add this, never commit it
└── firestore.rules             # Public read, admin-only write
```

## Setup

### 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Build a **Firestore Database** (start in production mode)
3. Project Settings → General → Add app → **Web** (`</>`) → copy the config object
4. Paste it into `src/config/firebase.js`, replacing the placeholder values

### 2. Deploy security rules

Install the Firebase CLI if you don't have it, then from the project root:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # point it at this project, use existing firestore.rules
firebase deploy --only firestore:rules
```

### 3. Run the app

```bash
npm install
npx expo start
```
Scan the QR code with Expo Go (iOS/Android) or press `i` / `a` for a simulator.

### 4. Set up the admin scripts (how you add prompts)

1. Firebase Console → Project Settings → **Service Accounts** → Generate new private key
2. Save the downloaded file as `admin/serviceAccountKey.json` (already in `.gitignore`)
3. ```bash
   cd admin
   npm install
   ```
4. **Add one prompt:** edit the `newPrompt` object in `addPrompt.js`, then:
   ```bash
   npm run add
   ```
5. **Bulk add:** edit `prompts-batch.json` with an array of prompts, then:
   ```bash
   npm run add-batch
   ```

New prompts appear in every open app within moments — no app update needed.

### 5. Image hosting

`thumbnailUrl` and `exampleImages` are just URLs — upload images to
[Firebase Storage](https://firebase.google.com/docs/storage), Cloudinary, or
even a GitHub repo, and paste the public URL into your prompt object.

## Firestore data shape

```js
prompts/{promptId}
  - title: string
  - promptText: string
  - category: string        // e.g. "photo-editing", "portrait"
  - aiTool: string           // e.g. "Midjourney", "ChatGPT", "Nano Banana"
  - thumbnailUrl: string | null
  - exampleImages: string[]
  - viewCount: number
  - downloadCount: number
  - createdAt: Timestamp     // drives the "latest 5" ordering
```

## Notes

- `viewCount`/`downloadCount` increment automatically when users view/copy
  a prompt — useful for seeing what's actually going viral.
- Saved/bookmarked prompts are **local-only** (AsyncStorage), since there
  are no accounts — they won't sync across a user's devices.
- To change the cache size from "latest 5" to another number, update the
  `count` default in `promptService.subscribeToLatest()`.
