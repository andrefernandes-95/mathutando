import { defineConfig, loadEnv } from 'vite'
import { localReviews } from './local/review-route.ts'
export default defineConfig(({ mode }) => ({
  plugins: [
    localReviews(
      process.env.OPENAI_API_KEY ??
        loadEnv(mode, process.cwd(), 'OPENAI_API_KEY').OPENAI_API_KEY,
    ),
  ],
  root: 'web',
  build: { outDir: '../dist', emptyOutDir: true },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    fs: {
      deny: [
        '.env',
        '.env.*',
        '*.{crt,pem}',
        '**/.git/**',
        '**/data.local/**',
        '**/*.sqlite*',
      ],
    },
  },
  preview: { host: '127.0.0.1', port: 5173, strictPort: true },
}))
