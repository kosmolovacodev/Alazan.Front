import { defineStore } from 'pinia';
import { api } from 'boot/axios';

export interface User {
  id: string;
  nombre_completo: string;
  email: string;
  nombre_rol: string;
  permisos_json: string;
  sede_id: number;
}

export interface Sede {
  id: number;
  nombre_sede: string;
  nombre : string;
}

// Definimos el tipo del estado para que TS no adivine mal
interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  sedeActivaId: number | null;
  listaSedes: Sede[];
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: JSON.parse(localStorage.getItem('alazan_user') || 'null') as User | null,
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

    // En auth.ts -> getters
    nombreSedeActiva: (state): string => {
    if (state.sedeActivaId === null || state.sedeActivaId === undefined) return 'Sede no seleccionada';

    // Buscamos en la lista. Usamos 'nombre' porque así viene del Controller
    const sede = state.listaSedes.find(s => s.id == state.sedeActivaId);

    if (sede) {
      // Si tu SQL dice 'as nombre', usa .nombre.
      // Si no usaste el 'as', usa .nombre_sede
      return sede.nombre || sede.nombre_sede || `Sede ${state.sedeActivaId}`;
    }

    return `Sede ID: ${state.sedeActivaId}`;
  },

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
        const { data } = await api.post('/api/auth/login', { email, password: pass });

        // Verificación de seguridad: si data no existe o no tiene id
        if (!data || !data.id) {
          throw new Error('Respuesta del servidor inválida');
        }

        this.user = data;
        this.isLoggedIn = true;

        // Si el sede_id viene como string en el JSON, conviértelo a número aquí
        const sedeId = Number(data.sede_id);
        this.sedeActivaId = sedeId;

        localStorage.setItem('alazan_user', JSON.stringify(data));
        localStorage.setItem('alazan_sede_activa', sedeId.toString());

        // Cargamos sedes (esto llenará el selector de arriba a la derecha)
        await this.cargarSedes();

        return { success: true };
      } catch (err: unknown) {
        console.error('Error en Login:', err); // Revisa la consola del navegador para ver el error real

        let msg = 'Error de conexión con el servidor';
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
        this.listaSedes = data;

        if (this.esAdminGlobal && (!this.sedeActivaId || this.sedeActivaId === 0)) {
          // Acceso seguro: Guardamos el primer elemento en una constante
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

    logout() {
      this.user = null;
      this.isLoggedIn = false;
      this.sedeActivaId = null;
      this.listaSedes = [];
      localStorage.removeItem('alazan_user');
      localStorage.removeItem('alazan_sede_activa');
      // Usar router mejor que href si es posible, pero esto funciona:
      window.location.href = '#/login';
    },
  },
});
