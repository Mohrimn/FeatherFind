import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.featherfind.ai',
  appName: 'FeatherFind AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
