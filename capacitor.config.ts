import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.taxforgeng.com',
  appName: 'TaxForge NG',
  webDir: 'dist',

  server: {
    // Required for Supabase auth (secure cookies) to work on Android.
    // Without this, the WebView uses 'http' scheme and auth sessions break.
    androidScheme: 'https',
  },

  plugins: {
    SplashScreen: {
      // Prevent white flash before React loads. Call SplashScreen.hide()
      // manually in main.tsx once the app is ready.
      launchAutoHide: false,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    StatusBar: {
      // Match the app's default light theme header colour
      style: 'DEFAULT',
      backgroundColor: '#ffffff',
    },
    Keyboard: {
      // Resize the body (not the whole viewport) when the Android keyboard
      // appears, so React layout keeps working correctly on form pages.
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
