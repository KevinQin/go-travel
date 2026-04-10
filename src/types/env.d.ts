// 扩展 ImportMeta 接口
interface ImportMeta {
  env: {
    VITE_AMAP_API_KEY?: string
    VITE_APP_TITLE?: string
    VITE_APP_DESCRIPTION?: string
    VITE_PORT?: string
    VITE_HOST?: string
    VITE_DEBUG?: string
  }
}