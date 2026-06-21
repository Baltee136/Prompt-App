/**
 * Bulk-add prompts from prompts-batch.json (array of prompt objects).
 * Usage: npm run add-batch
 *
 * Edit prompts-batch.json with as many prompts as you want, then run.
 * Useful when you've collected a batch of viral prompts and want to
 * upload them all at once instead of one at a time.
 */
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const prompts = require('./prompts-batch.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function addBatch() {
  if (!Array.isArray(prompts) || prompts.length === 0) {
    console.log('No prompts found in prompts-batch.json. Add an array of prompt objects first.');
    process.exit(0);
  }

  const batch = db.batch();
  prompts.forEach((p) => {
    const ref = db.collection('prompts').doc();
    batch.set(ref, {
      title: p.title ?? '',
      promptText: p.promptText ?? '',
      category: p.category ?? 'general',
      aiTool: p.aiTool ?? '',
      thumbnailUrl: p.thumbnailUrl ?? null,
      exampleImages: p.exampleImages ?? [],
      viewCount: 0,
      downloadCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  try {
    await batch.commit();
    console.log(`✅ Added ${prompts.length} prompts.`);
  } catch (err) {
    console.error('❌ Batch add failed:', err);
    process.exit(1);
  }
  process.exit(0);
}

addBatch();
