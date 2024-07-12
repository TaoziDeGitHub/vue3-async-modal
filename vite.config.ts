import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [
    vue(),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
      ],
      imports: [
        'vue',
        'vue-router',
        {
          '@/use': ['openModal']
        },
      ],
      vueTemplate: true,
      resolvers: [
        ElementPlusResolver()
      ],
      dts: resolve(__dirname, './src/auto-imports.d.ts'),
      eslintrc: {
        enabled: true,
        filepath: resolve(__dirname, './.eslintrc-auto-import.json'),
        globalsPropValue: true,
      },
    }),
    Components({
      resolvers: [
        ElementPlusResolver()
      ],
      dts: resolve(__dirname, './src/components.d.ts'),
    }),
  ],
})
