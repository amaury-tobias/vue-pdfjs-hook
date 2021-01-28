import { defineConfig } from "vite";
import vuePlugin from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vuePlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, "lib/main.ts"),
      name: "vue-pdfjs",
    },
    rollupOptions: {
      external: ['vue', 'pdfjs-dist'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    },
  },
});
