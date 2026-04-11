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

// 环境变量测试（开发环境）
if (import.meta.env.DEV) {
  console.log('🔧 开发模式：环境变量测试')
  console.log('VITE_AMAP_API_KEY:', import.meta.env.VITE_AMAP_API_KEY ? '已配置' : '未配置')
}

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