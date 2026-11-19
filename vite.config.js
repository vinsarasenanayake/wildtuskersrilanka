import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Serves /api/upload-url during `npm run dev` (Vercel serves it in production). */
function devApi(env) {
  return {
    name: 'wts-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/upload-url', async (req, res) => {
        let raw = '';
        for await (const chunk of req) raw += chunk;
        try {
          const { handleUploadUrl } = await server.ssrLoadModule('/api/_upload.js');
          const { status, json } = await handleUploadUrl({
            method: req.method,
            body: raw ? JSON.parse(raw) : {},
            authorization: req.headers.authorization,
            env,
          });
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(json));
        } catch (err) {
          server.config.logger.error(`[upload-url] ${err.message}`);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Upload authorization failed' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');   // includes non-VITE_ R2 keys, server-side only
  return {
    plugins: [tailwindcss(), react(), devApi(env)],
  };
});
