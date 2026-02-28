import { defineStore } from 'pinia';
import axios from 'axios';

// En desarrollo: usa el proxy de Vite (/mba3 → http://201.148.25.52:8443)
// En producción: el backend .NET en /api/v1/mba3 hace de proxy hacia MBA3
const MBA3_BASE_URL = process.env.DEV
  ? '/mba3'
  : 'https://alazan-app.consul-tek.com/api/v1/mba3';
const TOKEN_TTL = 270_000; // 4 minutos 30 segundos en ms (token dura 5 min)

interface Mba3TokenEntry {
  jwt: string;
  obtainedAt: number; // Date.now() al momento de obtenerlo
}

interface Mba3State {
  tokens: Record<string, Mba3TokenEntry>;
  isRefreshing: Record<string, boolean>;
}

// Cliente axios exclusivo para auth de MBA3 (sin interceptores del sistema interno)
const mba3AuthClient = axios.create({ baseURL: MBA3_BASE_URL });

export const useMba3Store = defineStore('mba3', {
  state: (): Mba3State => ({
    tokens: {},
    isRefreshing: {},
  }),

  getters: {
    // Verifica si el token de un codigo específico sigue vigente
    isTokenValid: (state) => (codigo: string): boolean => {
      const entry = state.tokens[codigo];
      if (!entry) return false;
      return Date.now() - entry.obtainedAt < TOKEN_TTL;
    },

    // Retorna información de estado del token para mostrar en UI
    tokenInfo: (state) => (codigo: string) => {
      const entry = state.tokens[codigo];
      if (!entry) return { status: 'sin_token', segundosRestantes: 0 };
      const elapsed = Date.now() - entry.obtainedAt;
      const remaining = TOKEN_TTL - elapsed;
      if (remaining <= 0) return { status: 'expirado', segundosRestantes: 0 };
      return { status: 'activo', segundosRestantes: Math.floor(remaining / 1000) };
    },
  },

  actions: {
    /**
     * Autentica con MBA3 usando las credenciales dadas y guarda el token.
     * Retorna el JWT obtenido.
     */
    async authenticate(codigo: string, pwd: string): Promise<string> {
      console.log(`[MBA3] Autenticando con codigo: ${codigo}`);
      const { data } = await mba3AuthClient.post('/login_servicio', {
        codigo,
        pwd,
      });

      if (!data?.jwt) {
        throw new Error('MBA3 no retornó un JWT válido en la respuesta de autenticación');
      }

      this.tokens[codigo] = {
        jwt: data.jwt,
        obtainedAt: Date.now(),
      };

      console.log(`[MBA3] Token obtenido para ${codigo}. Válido por ${TOKEN_TTL / 1000}s`);
      return data.jwt;
    },

    /**
     * Retorna el JWT vigente para el codigo dado.
     * Si está expirado o no existe, lo renueva automáticamente.
     * Maneja el caso de peticiones concurrentes (evita doble autenticación).
     */
    async getValidToken(codigo: string, pwd: string): Promise<string> {
      // Si el token es válido, retornarlo directo
      if (this.isTokenValid(codigo)) {
        return this.tokens[codigo]!.jwt;
      }

      // Si ya hay una renovación en curso para este codigo, esperar a que termine
      if (this.isRefreshing[codigo]) {
        console.log(`[MBA3] Esperando renovación en curso para ${codigo}...`);
        return new Promise((resolve, reject) => {
          const interval = setInterval(() => {
            if (!this.isRefreshing[codigo]) {
              clearInterval(interval);
              const entry = this.tokens[codigo];
              if (entry) {
                resolve(entry.jwt);
              } else {
                reject(new Error('La renovación del token MBA3 falló'));
              }
            }
          }, 100);
        });
      }

      // Iniciar renovación
      this.isRefreshing[codigo] = true;
      try {
        const jwt = await this.authenticate(codigo, pwd);
        return jwt;
      } finally {
        this.isRefreshing[codigo] = false;
      }
    },

    /**
     * Fuerza la renovación del token de un codigo específico (útil para tests).
     */
    async forceRefresh(codigo: string, pwd: string): Promise<string> {
      delete this.tokens[codigo];
      return this.getValidToken(codigo, pwd);
    },

    /**
     * Limpia el token de un codigo (al desconectarse o cambiar de módulo).
     */
    clearToken(codigo: string) {
      delete this.tokens[codigo];
      delete this.isRefreshing[codigo];
    },
  },
});
