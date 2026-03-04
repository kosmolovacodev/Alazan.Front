import axios, { type AxiosRequestConfig } from 'axios';
import { useMba3Store } from 'src/stores/mba3Store';

// En desarrollo: usa el proxy de Vite (/mba3 → http://201.148.25.52:8443)
// En producción: el backend .NET en /api/v1/mba3 hace de proxy hacia MBA3
const MBA3_BASE_URL = process.env.DEV
  ? '/mba3'
  : 'https://alazan-app.consul-tek.com/api/v1/mba3';

// Instancia axios exclusiva para MBA3 (separada del 'api' interno de Alazan)
export const mba3Client = axios.create({ baseURL: MBA3_BASE_URL });

export interface Mba3RequestConfig {
  method: 'get' | 'post' | 'put' | 'delete';
  endpoint: string;
  /** Codigo de autenticación para este módulo/endpoint */
  codigo: string;
  /** Contraseña correspondiente al codigo */
  pwd: string;
  /** Body en formato x-www-form-urlencoded (clave: valor) */
  formData?: Record<string, string>;
  /** Body en formato JSON (para otros endpoints) */
  jsonData?: unknown;
  /** Headers adicionales */
  extraHeaders?: Record<string, string> | undefined;
  /** Forzar prefijo "Bearer " en el header Authorization (default: false) */
  useBearerPrefix?: boolean | undefined;
}

/**
 * Realiza una petición autenticada a la API externa MBA3.
 *
 * - Gestión de token automática: reutiliza el JWT si sigue vigente (<4m30s),
 *   o solicita uno nuevo antes de continuar.
 * - Retry automático: si el primer intento devuelve 401, fuerza re-autenticación
 *   y reintenta una vez más.
 */
export async function mba3Request<T = unknown>(config: Mba3RequestConfig): Promise<T> {
  const store = useMba3Store();
  const bearerMode = config.useBearerPrefix ?? false;

  let requestData: unknown;
  let contentType: string | undefined;

  if (config.formData) {
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

  // 1. Obtener token (usa caché si sigue vigente, autentica si no)
  let jwt = await store.getValidToken(config.codigo, config.pwd);

  // 2. Primer intento
  try {
    const authHeader = bearerMode ? `Bearer ${jwt}` : jwt;
    const response = await mba3Client.request<T>(buildAxiosConfig(authHeader));
    return response.data;
  } catch (firstError: unknown) {
    if (!is401(firstError)) throw firstError;

    // 3. Token rechazado — forzar re-autenticación y un último reintento.
    store.clearToken(config.codigo);
    jwt = await store.getValidToken(config.codigo, config.pwd);
    const authHeader = bearerMode ? `Bearer ${jwt}` : jwt;
    const response = await mba3Client.request<T>(buildAxiosConfig(authHeader));
    return response.data;
  }
}
