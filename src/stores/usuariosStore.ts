import { defineStore } from 'pinia';

// 1. Copiamos las interfaces aquí también
interface Rol {
  id: number;
  nombre_rol: string;
  descripcion?: string;
}

interface Usuario {
  id?: number | null | undefined;
  nombre: string;
  username: string;
  sede_id: number | null;
  nombre_sede?: string;
  password?: string;
  rol_id: number | null;
  nombre_rol?: string;
  firma?: string;
  departamento?: string;
  telefono?: string;
  activo: boolean;
}

export const useUsuariosStore = defineStore('usuarios', {
  state: () => ({
    // 2. Usamos las interfaces en lugar de 'any'
    listaUsuarios: [] as Usuario[],
    listaRoles: [] as Rol[],
  }),
  persist: true,
});
