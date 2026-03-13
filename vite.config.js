import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      // Serve project-root data/ folder at /trip-dashboard/data/ in dev mode
      // and copy it into dist/data/ during production build
      name: 'serve-data-dir',
      configureServer(server) {
        server.middlewares.use('/trip-dashboard/data', (req, res, next) => {
          const file = req.url.replace(/\?.*$/, ''); // strip cache-buster
          const filePath = path.join(process.cwd(), 'data', file);
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Cache-Control', 'no-store');
            fs.createReadStream(filePath).pipe(res);
          } else {
            next();
          }
        });
      },
      closeBundle() {
        const dataDir = path.join(process.cwd(), 'data');
        const distDataDir = path.join(process.cwd(), 'dist', 'data');
        if (!fs.existsSync(distDataDir)) {
          fs.mkdirSync(distDataDir, { recursive: true });
        }
        for (const file of fs.readdirSync(dataDir)) {
          fs.copyFileSync(path.join(dataDir, file), path.join(distDataDir, file));
        }
      },
    },
  ],
  base: '/trip-dashboard/', // This MUST match your repo name exactly
})