import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: "com.resqnet.app",
  appName: "RESQNET",
  // Remote-server mode does not bundle the Next.js build. `public` is a
  // symlink-free fallback asset directory for Capacitor's sync step.
  webDir: "public",
  server: {
    // Remote-server mode keeps the existing Next.js UI and server APIs intact.
    url: serverUrl || "https://replace-with-your-resqnet-domain.example.com",
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1800,
      backgroundColor: "#060a14",
      showSpinner: false,
    },
  },
};

export default config;
