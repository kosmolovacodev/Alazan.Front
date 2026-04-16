import { defineStore } from 'pinia';
import { api } from 'boot/axios';

export interface User {
  id: string;
  usuario_id: number;        // dbo.usuarios.id (entero)
  nombre_completo: string;
  email: string;
  nombre_rol: string;
  permisos_json: string;
  sede_id: number;
  departamento?: string;
  seccion_inicio_dia?: string;    // BASCULA | VOLCADO | PROCESO | ALMACEN — viene del rol
  tipo_inicio_dia?: string;       // SUPERVISOR | ASISTENTE | OPERADOR | null — define el flujo del modal
}

export interface Sede {
  id: number;
  nombre_sede: string;
  nombre: string;
  activo?: number | boolean; // Agregado para soportar tu filtro
}

// Definimos el tipo del estado para que TS no adivine mal
interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  sedeActivaId: number | null;
  listaSedes: Sede[];
  token: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: JSON.parse(localStorage.getItem('alazan_user') || 'null') as User | null,
    token: localStorage.getItem('jwt') || null,
    isLoggedIn: !!localStorage.getItem('alazan_user'),
    // Aseguramos que se recupere como número o null
    sedeActivaId: localStorage.getItem('alazan_sede_activa')
      ? Number(localStorage.getItem('alazan_sede_activa'))
      : null,
    listaSedes: [] as Sede[],
  }),

  getters: {
    // IMPORTANTE: Tipamos explícitamente el retorno para evitar errores en el template
    esAdminGlobal: (state): boolean => state.user?.sede_id === 0,

    // Tu lógica original para el nombre de la sede
    nombreSedeActiva: (state): string => {
      if (state.sedeActivaId === null || state.sedeActivaId === undefined)
        return 'Sede no seleccionada';

      // Buscamos en la lista. Usamos 'nombre' porque así viene del Controller
      const sede = state.listaSedes.find((s) => s.id == state.sedeActivaId);

      if (sede) {
        // Si tu SQL dice 'as nombre', usa .nombre.
        // Si no usaste el 'as', usa .nombre_sede
        return sede.nombre || sede.nombre_sede || `Sede ${state.sedeActivaId}`;
      }

      return `Sede ID: ${state.sedeActivaId}`;
    },

    // Tu lógica original de permisos JSON
    tienePermiso: (state) => {
      return (nombrePantalla: string): boolean => {
        if (state.user?.nombre_rol === 'ADMIN') return true;
        if (!state.user?.permisos_json) return false;
        try {
          const lista: string[] = JSON.parse(state.user.permisos_json);
          return lista.includes(nombrePantalla);
        } catch {
          return false;
        }
      };
    },
  },

  actions: {
    async login(email: string, pass: string): Promise<{ success: boolean; message?: string }> {
      try {
        // 1. Llamada al endpoint
        const { data } = await api.post('/auth/login', { email, password: pass });

        // 2. Validación de respuesta
        if (!data || !data.jwt || !data.user) {
          throw new Error('Estructura de respuesta inválida del servidor');
        }

        // 3. Guardar el Token
        this.token = data.jwt;
        localStorage.setItem('jwt', data.jwt);

        // 4. Guardar los datos del usuario
        this.user = data.user;
        this.isLoggedIn = true;

        // 5. Configurar la Sede Activa
        const sedeId = Number(data.user.sede_id);
        this.sedeActivaId = sedeId;

        // 6. Persistencia de datos
        localStorage.setItem('alazan_user', JSON.stringify(data.user));
        localStorage.setItem('alazan_sede_activa', sedeId.toString());

        // 7. Cargar sedes/bodegas
        await this.cargarSedes();

        return { success: true };
      } catch (err: unknown) {
        console.error('Error en Login:', err);

        let msg = 'Error de conexión con el servidor';

        // Manejo de errores de Axios
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data?: { message?: string } } };
          if (axiosError.response?.data?.message) {
            msg = axiosError.response.data.message;
          }
        } else if (err instanceof Error) {
          msg = err.message;
        }

        return { success: false, message: msg };
      }
    },

    async cargarSedes() {
      try {
        const { data } = await api.get('/api/catalogos/sedes');
        // Tu filtro original de activos
        this.listaSedes = (data as Sede[]).filter((s) => !!s.activo);

        if (this.esAdminGlobal && (!this.sedeActivaId || this.sedeActivaId === 0)) {
          const primeraSede = this.listaSedes[0];
          if (primeraSede) {
            this.setSedeActiva(primeraSede.id);
          }
        }
      } catch (error) {
        console.error('Error cargando sedes:', error);
      }
    },

    setSedeActiva(id: number) {
      this.sedeActivaId = id;
      localStorage.setItem('alazan_sede_activa', id.toString());
    },

    // --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE ---
    // Esta función logout ahora limpia TODO para que el interceptor funcione bien
    logout() {
      this.user = null;
      this.token = null;
      this.isLoggedIn = false;
      this.sedeActivaId = null;
      this.listaSedes = [];

      localStorage.removeItem('alazan_user');
      localStorage.removeItem('alazan_sede_activa');
      localStorage.removeItem('jwt');

      // Redirección forzada al login
      window.location.href = '#/login';
    },
  },
});
