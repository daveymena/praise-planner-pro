import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.ministerio.alabanza.planner',
    appName: 'Alabanza Planner Pro',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
