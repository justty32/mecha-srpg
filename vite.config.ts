// Vite 設定：index.html 在專案根；入口 src/ui-adapter/dom/main.ts。
// content/ 的 JSON 由 import.meta.glob 打包。src/content/loader.ts 頂層 import node:fs／node:path，
// 瀏覽器端只用其中的 loadPacks（不呼叫 fs），Vite 會把這兩個模組外部化成空殼——警告無害。
import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: { port: 5173, strictPort: false, open: false },
  preview: { port: 4173, open: false },
  build: { outDir: "dist", emptyOutDir: true, target: "es2023", chunkSizeWarningLimit: 1500 },
});
