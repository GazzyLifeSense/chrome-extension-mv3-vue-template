import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { crx } from '@crxjs/vite-plugin';
import manifest from './src/manifest.json' assert { type: 'json' };
import packageJson from './package.json';
import path from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'

manifest.version = packageJson.version;


// https://vitejs.dev/config/
export default defineConfig((conditionalConfig: any)=>{

  const { mode } = conditionalConfig;

  // postcss插件
  const postcssPlugins = [
    // 支持h-[40px]类似写法
    tailwindcss(),
    // 添加浏览器兼容样式前缀   
    autoprefixer(),
  ]
  if(mode == 'production'){
    // css压缩
    postcssPlugins.push(cssnano())
  }
  return{
    css:{
      preprocessorOptions: {
        less: {
          charset: false,
          // 这里可以配置LESS的全局变量等
          additionalData: `@import "${path.resolve(__dirname, './src/design/index.less')}";`,
        },
      },
      postcss: {
        plugins: postcssPlugins
      }
    },
    optimizeDeps: {
      include: ['webextension-polyfill'],
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    resolve: {
      alias: {
          '@': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [vue(), crx({ manifest })],
    server: {
      // Fix for HMR based on https://github.com/crxjs/chrome-extension-tools/issues/746
      strictPort: true,
      port: 5173,
      hmr: {
        clientPort: 5173,
      },
    }
  }
});
