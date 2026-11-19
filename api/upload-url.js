import { handleUploadUrl } from './_upload.js';

/** Vercel serverless function: POST /api/upload-url */
export default async function handler(req, res) {
  try {
    const { status, json } = await handleUploadUrl({
      method: req.method,
      body: typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body,
      authorization: req.headers.authorization,
      env: process.env,
    });
    res.status(status).json(json);
  } catch (err) {
    console.error('[upload-url]', err);
    res.status(500).json({ error: 'Upload authorization failed' });
  }
}
