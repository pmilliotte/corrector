/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_API_URL: string
  readonly VITE_APP_REGION: string
  readonly VITE_APP_USER_POOL_ID: string
  readonly VITE_APP_USER_POOL_CLIENT_ID: string
  readonly VITE_REVERSE_PROXY_DOMAIN_NAME: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}