import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  server: {
    port: 3001,     // port bạn muốn
    strictPort: true, // nếu port bận thì báo lỗi, không tự nhảy port khác
  },

  optimizeDeps: {
    exclude: [
      'autoprefixer',
      'postcss',
      'source-map-js',
    ],
  },
});
