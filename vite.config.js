import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        innovations: resolve(__dirname, 'innovations.html'),
        projects: resolve(__dirname, 'projects.html'),
        register: resolve(__dirname, 'register2.html'),
      },
    },
  },
});
