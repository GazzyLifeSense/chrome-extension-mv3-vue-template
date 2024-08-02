import '@/design/index.less';
import 'tailwindcss/tailwind.css'; 
import { remoteAppInit } from '@/utils/public.ts';
import App from '@/content/pluginPanel/App.vue';

const appName = 'pluginPanel';
const vueId = import.meta.env.VITE_CRX_CLASS_PREFIX + '-' + appName;
console.log(vueId)
async function bootstrap() {
  remoteAppInit(App, vueId);
}

bootstrap();
