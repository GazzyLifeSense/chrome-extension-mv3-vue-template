// popup远程文件
import '@/design/index.less';
import 'tailwindcss/tailwind.css'; // 引入tailwindcss
import { remoteAppInit } from '@/utils/public.ts';
import App from '@/popup/App.vue';
import router from '@/popup/router/index.js'

const vueId = 'vct-popup-app';
remoteAppInit(App, vueId, false, [router] as any)



