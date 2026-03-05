import axios, { type AxiosRequestConfig } from 'axios';
import { useMba3Store } from 'src/stores/mba3Store';

// En desarrollo: usa el proxy de Vite (/mba3 → http://201.148.25.52:8443)
// En producción: el backend .NET en /api/v1/mba3 hace de proxy hacia MBA3
const MBA3_BASE_URL = process.env.DEV ? '/mba3' : 'https://alazan-app.consul-tek.com/api/v1/mba3';

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
 * - Retry automático con "Bearer": si el primer intento sin "Bearer" devuelve
 *   401, reintenta añadiendo el prefijo "Bearer " al header Authorization.
 */
export async function mba3Request<T = unknown>(config: Mba3RequestConfig): Promise<T> {
  const store = useMba3Store();
  const bearerMode = config.useBearerPrefix ?? false;

  // 2. Preparar body y content-type
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

  // 1. Obtener token vigente y limpiar de inmediato (MBA3 usa tokens de un solo uso)
  let jwt = await store.getValidToken(config.codigo, config.pwd);
  store.clearToken(config.codigo);

  // 3. Primer intento con el formato de Authorization configurado
  try {
    const authHeader = bearerMode ? `Bearer ${jwt}` : jwt;
    const response = await mba3Client.request<T>(buildAxiosConfig(authHeader));
    return response.data;
  } catch (firstError: unknown) {
    if (!is401(firstError)) throw firstError;

    // 4. Si el primer intento falla con 401 y no era Bearer, reintentar con Bearer
    if (!bearerMode) {
      console.warn('[MBA3] JWT directo rechazado (401). Reintentando con Bearer prefix...');
      try {
        const response = await mba3Client.request<T>(buildAxiosConfig(`Bearer ${jwt}`));
        return response.data;
      } catch (bearerError: unknown) {
        if (!is401(bearerError)) throw bearerError;
        // Bearer también rechazado — el token ya fue invalidado en MBA3, caer a re-auth
        console.warn('[MBA3] Bearer también rechazado (401). El token fue invalidado en servidor.');
      }
    }

    // 5. Token inválido en servidor (uso único o expirado anticipadamente).
    //    Forzar re-autenticación y un último reintento.
    console.warn('[MBA3] Forzando re-autenticación tras 401...');
    store.clearToken(config.codigo);
    jwt = await store.getValidToken(config.codigo, config.pwd);
    store.clearToken(config.codigo); // MBA3 token es de un solo uso: limpiar igual que en paso 1
    const authHeader = bearerMode ? `Bearer ${jwt}` : jwt;
    const response = await mba3Client.request<T>(buildAxiosConfig(authHeader));
    return response.data;
  }
}
