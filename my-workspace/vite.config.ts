import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main/index.ts',
        vite: {
          build: {
            outDir: 'dist/main',
            emptyOutDir: false,
            rollupOptions: {
              external: ['electron', 'fluent-ffmpeg', 'keytar'],
            },
          },
        },
      },
      {
        entry: 'src/preload/index.ts',
        onstart(args) { args.reload(); },
        vite: {
          build: { outDir: 'dist/preload', emptyOutDir: false },
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
    },
  },
  build: {
    emptyOutDir: false,
  },
});
