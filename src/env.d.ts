/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMAP_API_KEY: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_PORT: string
  readonly VITE_HOST: string
  readonly VITE_DEBUG: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_PWA: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}