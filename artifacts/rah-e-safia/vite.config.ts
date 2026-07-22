import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// defineConfig's function form receives `command`:
//   "serve"  → vite dev / vite preview  (a server starts; PORT is consumed)
//   "build"  → vite build               (no server starts; PORT is irrelevant)
export default defineConfig(({ command }) => {
  const isServe = command === "serve";
  const rawPort = process.env.PORT;

  // Enforce PORT only when a server will actually be started.
  if (isServe && !rawPort) throw new Error("PORT environment variable is required.");
  const port = rawPort ? Number(rawPort) : 5173; // 5173 is Vite's default; only used as a fallback during build (never observed)
  if (rawPort && (Number.isNaN(port) || port <= 0)) throw new Error(`Invalid PORT: "${rawPort}"`);

  return {
    // "./" emits relative asset paths (./assets/…) instead of absolute (/assets/…).
    // This is required for Capacitor's file:// origin, where a leading "/" would
    // resolve to the filesystem root rather than the app bundle directory.
    // It is equally correct for the live web deployment: with hash-based routing
    // the browser's path component never changes from the root, so relative paths
    // always resolve identically to absolute ones.
    base: "./",
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
            "vendor-motion": ["framer-motion"],
            "vendor-icons": ["lucide-react"],
            "vendor-router": ["wouter"],
            "vendor-themes": ["next-themes"],
          },
        },
      },
    },
    server: {
      port,
      strictPort: true, // Exit instead of falling back to another port — prevents stealing a sibling service's port on boot.
      host: "0.0.0.0",
      allowedHosts: true,
      // Vite serves index.html for all unmatched routes by default (appType: 'spa'),
      // so no historyApiFallback option is needed here.
    },
    preview: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
