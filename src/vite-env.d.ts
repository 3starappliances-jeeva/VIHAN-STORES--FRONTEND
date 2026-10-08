/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_MOCK_API?: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_SUPPORT_PHONE?: string;
  readonly VITE_FSSAI_LICENCE?: string;
  readonly VITE_FREE_SHIPPING_THRESHOLD?: string;
  readonly VITE_COD_FEE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
