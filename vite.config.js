import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        caseNis2100: resolve(__dirname, 'case-nis2100.html'),
        caseEs200: resolve(__dirname, 'case-es200.html'),
        caseWorkshop: resolve(__dirname, 'case-workshop.html'),
        caseChannel: resolve(__dirname, 'case-channel.html'),
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
