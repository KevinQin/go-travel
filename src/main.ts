import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

import './assets/main.css'

// 导入API错误处理器
import { initApiErrorMonitoring } from './utils/apiErrorHandler'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 初始化API错误监控
if (import.meta.env.DEV) {
  initApiErrorMonitoring()
  console.log('🔧 开发模式：API错误监控已启用')
}

app.mount('#app')