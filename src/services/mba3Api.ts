import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { useMba3Store } from 'src/stores/mba3Store';

// En desarrollo: usa el proxy de Vite (/mba3 → http://201.148.25.52:8443)
// En producción: el backend .NET en /api/v1/mba3 hace de proxy hacia MBA3
const MBA3_BASE_URL = process.env.DEV ? '/mba3' : 'https://alazan-app.consul-tek.com/api/v1/mba3';

// Instancia axios exclusiva para MBA3 (separada del 'api' interno de Alazan)
export const mba3Client = axios.create({ baseURL: MBA3_BASE_URL });

/** Registra interceptores de diagnóstico en un cliente axios (llamar una sola vez por instancia). */
function addDebugInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use((req) => {
    console.group(
      `[mba3Request] ${req.method?.toUpperCase()} ${req.baseURL ?? ''}${req.url ?? ''}`,
    );
    console.log('[mba3Request] Headers enviados:', JSON.stringify(req.headers));
    console.log(
      '[mba3Request] Content-Type:',
      req.headers?.['Content-Type'] ?? req.headers?.['content-type'] ?? '—',
    );
    console.log(
      '[mba3Request] Authorization:',
      req.headers?.['Authorization'] ?? req.headers?.['authorization'] ?? '(AUSENTE)',
    );
    if (req.data) {
      const bodyStr = typeof req.data === 'string' ? req.data : JSON.stringify(req.data);
      console.log('[mba3Request] Body completo:', bodyStr);
    }
    console.groupEnd();
    return req;
  });

  client.interceptors.response.use(
    (res) => {
      console.log(`[mba3Request] Respuesta ${res.status} de ${res.config.url}`);
      return res;
    },
    (err: unknown) => {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as {
          response?: { status?: number; headers?: unknown; data?: unknown };
          config?: { url?: string };
        };
        console.warn(`[mba3Request] Error ${e.response?.status ?? '?'} de ${e.config?.url ?? '?'}`);
        console.warn('[mba3Request] Response headers:', JSON.stringify(e.response?.headers ?? {}));
        console.warn('[mba3Request] Response body:', JSON.stringify(e.response?.data ?? null));
      }
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      return Promise.reject(err); // preservar error axios para que is401() funcione
    },
  );
}

// Registrar interceptores una sola vez en el cliente compartido
addDebugInterceptors(mba3Client);

export interface Mba3RequestConfig {
  method: 'get' | 'post' | 'put' | 'delete';
  endpoint: string;
  /** Codigo de autenticación para este módulo/endpoint */
  codigo: string;
  /** Contraseña correspondiente al codigo */
  pwd: string;
  /** Body en formato x-www-form-urlencoded (clave: valor) */
  formData?: Record<string, string>;
  /** Body en formato multipart/form-data (axios detecta boundary automáticamente) */
  multipartData?: FormData;
  /** Body en formato JSON (para otros endpoints) */
  jsonData?: unknown;
  /** Headers adicionales */
  extraHeaders?: Record<string, string> | undefined;
  /** Forzar prefijo "Bearer " en el header Authorization (default: false) */
  useBearerPrefix?: boolean | undefined;
  /** Sobreescribe la base URL (para apuntar a un servidor MBA3 diferente) */
  baseURL?: string;
}

/**
 * Realiza una petición autenticada a la API externa MBA3.
 *
 * - Gestión de token automática: reutiliza el JWT si sigue vigente (<4m30s),
 *   o solicita uno nuevo antes de continuar.
 * - Retry automático con "Bearer": si el primer intento sin "Bearer" devuelve
 *   401, reintenta añadiendo el prefijo "Bearer " al header Authorization.
 */
export async function mba3Request<T = unknown>(config: Mba3RequestConfig): Promise<T> {
  const store = useMba3Store();
  const bearerMode = config.useBearerPrefix ?? false;

  // 2. Preparar body y content-type
  let requestData: unknown;
  let contentType: string | undefined;

  if (config.multipartData) {
    // multipart/form-data: axios detecta el boundary automáticamente — NO poner Content-Type manual
    requestData = config.multipartData;
    contentType = undefined;
  } else if (config.formData) {
    requestData = new URLSearchParams(config.formData).toString();
    contentType = 'application/x-www-form-urlencoded';
  } else if (config.jsonData !== undefined) {
    requestData = config.jsonData;
    contentType = 'application/json';
  }

  const buildAxiosConfig = (authHeader: string): AxiosRequestConfig => ({
    method: config.method,
    url: config.endpoint,
    data: requestData,
    headers: {
      Authorization: authHeader,
      'X-MBA3-Auth': authHeader, // IIS elimina Authorization estándar → este header llega intacto al proxy .NET
      ...(contentType ? { 'Content-Type': contentType } : {}),
      ...config.extraHeaders,
    },
  });

  const is401 = (err: unknown): boolean =>
    !!(
      err &&
      typeof err === 'object' &&
      'response' in err &&
      (err as { response?: { status?: number } }).response?.status === 401
    );

  // Para baseURL personalizada: crear instancia fresca y añadirle interceptores una sola vez
  const client = config.baseURL
    ? (() => {
        const c = axios.create({ baseURL: config.baseURL });
        addDebugInterceptors(c);
        return c;
      })()
    : mba3Client;

  // 1. Obtener token (usa caché si sigue vigente, autentica si no)
  let jwt = await store.getValidToken(config.codigo, config.pwd);
  store.clearToken(config.codigo);

  // 3. Primer intento con el formato de Authorization configurado
  try {
    const authHeader = bearerMode ? `Bearer ${jwt}` : jwt;
    console.log(`[mba3Request] Intento 1 — bearerMode=${bearerMode} | JWT: ${jwt.slice(0, 20)}...`);
    const response = await client.request<T>(buildAxiosConfig(authHeader));
    return response.data;
  } catch (firstError: unknown) {
    if (!is401(firstError)) throw firstError;

    // 3. Token rechazado — forzar re-autenticación y un último reintento.
    console.warn('[mba3Request] 401 en intento 1 — renovando token...');
    store.clearToken(config.codigo);
    jwt = await store.getValidToken(config.codigo, config.pwd);
    store.clearToken(config.codigo); // MBA3 token es de un solo uso: limpiar igual que en paso 1
    const authHeader = bearerMode ? `Bearer ${jwt}` : jwt;
    console.log(`[mba3Request] Intento 2 — nuevo JWT: ${jwt.slice(0, 20)}...`);
    const response = await client.request<T>(buildAxiosConfig(authHeader));
    return response.data;
  }
}
