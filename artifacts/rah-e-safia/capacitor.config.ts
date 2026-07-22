import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Reverse-domain app identifier — used as the Android package name and iOS bundle ID.
  // Must be all-lowercase with dot-separated segments; cannot be changed after store submission.
  appId: 'app.quran.alfalah',

  appName: 'Quran Al-Falah',

  // Path to the Vite production build output, relative to this config file.
  // `cap sync` copies this directory into the native Android/iOS projects.
  webDir: 'dist',

  server: {
    // Serve the WebView over https:// on Android (required for Android 12+ secure-origin APIs:
    // Web Crypto, Clipboard, etc.).  Has no effect on iOS or the web deployment.
    androidScheme: 'https',
  },
};

export default config;
