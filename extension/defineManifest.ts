//這是CRXJS的小幫手，可以讓我們用程式碼的方式來寫manifest.json(有輔助提示和自動補全)

// 1. 引入 CRXJS 的小幫手
import { defineManifest } from '@crxjs/vite-plugin'


export default defineManifest({
  manifest_version: 3,
  name: "JPDictionary 雲端廚房助手",
  version: "1.0.0",
  description: "幫助你在任何網頁快速點餐查單字",
  permissions: ["storage", "activeTab", "scripting","contextMenus"],
  action: {
    default_popup: "index.html"
  },
  background: {
    service_worker: "src/background/index.js",
    type: "module"
  },
  content_scripts: [
    {
      js: ["src/content/index.jsx"],
      matches: ["<all_urls>"]
    }
  ]
})
