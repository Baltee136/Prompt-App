/**
 * Admin script for adding viral prompts to Firestore.
 *
 * Setup:
 *   1. Firebase Console -> Project Settings -> Service Accounts
 *      -> "Generate new private key" -> save as admin/serviceAccountKey.json
 *      (this file is in .gitignore — NEVER commit it)
 *   2. cd admin && npm install
 *   3. Edit the `newPrompt` object below, then: npm run add
 *
 * This intentionally uses the Admin SDK (not the client SDK) because it
 * bypasses Firestore security rules — exactly what you want for an
 * admin-only write path with no user accounts in the app itself.
 */
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ---- EDIT THIS to add a new prompt ----
const newPrompt = {
  title: 'Cinematic Golden Hour Portrait',
  promptText:
    'Transform this photo into a cinematic golden hour portrait, warm rim lighting, ' +
    'soft bokeh background, film grain, shot on 85mm lens, dramatic but natural skin tones',
  category: 'photo-editing',
  aiTool: 'Midjourney',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  exampleImages: [
    'https://example.com/example1.jpg',
    'https://example.com/example2.jpg',
  ],
  viewCount: 0,
  downloadCount: 0,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
};
// ----------------------------------------

async function addPrompt() {
  try {
    const ref = await db.collection('prompts').add(newPrompt);
    console.log(`✅ Prompt added with id: ${ref.id}`);
  } catch (err) {
    console.error('❌ Failed to add prompt:', err);
    process.exit(1);
  }
  process.exit(0);
}

addPrompt();
