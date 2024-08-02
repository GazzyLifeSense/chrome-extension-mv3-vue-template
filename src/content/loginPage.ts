import { remoteAppInit } from '@/utils/public.ts';
import App from '@/content/loginPage/App.vue';

const appName = 'loginPage';
const vueId = import.meta.env.VITE_CRX_CLASS_PREFIX + '-' + appName;

async function bootstrap() {
  remoteAppInit(App, vueId);
}

bootstrap();
