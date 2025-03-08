import './assets/main.css'
import './bridge'  // 导入 bridge 以初始化 WoPay

// 仅在开发环境或明确启用时导入 vConsole
if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_VCONSOLE === 'true') {
  // 使用动态导入避免构建问题
  import('./utils/vconsole').then(() => {
    console.log('vConsole has been loaded');
  });
}

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
