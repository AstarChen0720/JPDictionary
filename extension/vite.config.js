import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// 引入 crx 插件
import { crx } from '@crxjs/vite-plugin'
import manifest from './defineManifest'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 使用 crx 插件並傳入 manifest 配置
    crx({ manifest })
  ],
})
