import { defineConfig } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vuePlugin()],
  build: {
    lib: {
      entry: 'lib/main.ts',
      name: 'vue-pdfjs-hook',
    },
    rollupOptions: {
      external: ['vue', 'pdfjs-dist'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'pdfjs-dist': 'pdfjsLib',
        },
      },
    },
  },
})
