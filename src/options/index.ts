import '@/design/index.less';
import 'tailwindcss/tailwind.css';
import { remoteAppInit } from '@/utils/public.ts';
import App from '@/options/App.vue';

const vueId = 'vct-options-app';

remoteAppInit(App, vueId, false)