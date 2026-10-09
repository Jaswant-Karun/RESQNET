import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: "com.resqnet.app",
  appName: "RESQNET",
  webDir: ".next",
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
