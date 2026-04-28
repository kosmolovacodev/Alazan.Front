/// <reference types="vite/client" />


declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}

declare module 'quasar/wrappers' {
  import type { Pinia } from 'pinia';

  // Eliminamos <TStore = unknown> porque causaba el error de ESLint
  interface BootFileParams {
    store: Pinia;
    ssrContext?: unknown;
  }

  export function route<T>(callback: (params: BootFileParams) => T): () => T;
}
