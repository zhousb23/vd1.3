import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  base: './',
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api/deepseek': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/deepseek/, ''),
      },
      '/api/ark': {
        target: 'https://ark.cn-beijing.volces.com/api/v3',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/ark/, ''),
      },
      '/api/tts': {
        target: 'https://openspeech.bytedance.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/tts/, ''),
      },
    },
  },
});
