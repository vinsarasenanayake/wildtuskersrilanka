import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

/** Serves PDF downloads with Content-Disposition: attachment so iOS Safari & mobile browsers download instead of navigating away */
function pdfDownloadPlugin() {
  return {
    name: 'pdf-download-attachment',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && (req.url.startsWith('/download/kalawewa-guide.pdf') || req.url.startsWith('/download/'))) {
          const filePath = path.resolve('public/documents/wts_kalawewa_identification_guide_2018.pdf')
          if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath)
            res.writeHead(200, {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename="WTS_Kalawewa_Identification_Guide_2018.pdf"',
              'Content-Length': stat.size,
            })
            fs.createReadStream(filePath).pipe(res)
            return
          }
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), pdfDownloadPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet')) return 'vendor-leaflet';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor-react';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
