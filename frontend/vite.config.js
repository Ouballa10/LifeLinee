import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function pwaAssetManifestPlugin() {
  return {
    name: "lifeline-pwa-asset-manifest",
    apply: "build",
    generateBundle(_, bundle) {
      const assetPaths = Object.values(bundle)
        .map((item) => item?.fileName)
        .filter(Boolean)
        .filter((fileName) => !fileName.endsWith(".map"))
        .filter((fileName) => fileName !== "index.html")
        .map((fileName) => `/${fileName}`);

      this.emitFile({
        type: "asset",
        fileName: "pwa-assets.json",
        source: JSON.stringify([...new Set(assetPaths)], null, 2),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), pwaAssetManifestPlugin()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});
