import { defineStore } from 'pinia';





export interface UsuarioPendiente {
  id: number | null | undefined; // Añadimos undefined aquí
  nombre: string;
  username: string;
  password?: string;
  rol_id: number | null;
  activo: boolean;
  tipoOperacion: 'CREATE' | 'UPDATE';
  fechaLocal: string;
  firma?: string;
  departamento?: string;
  telefono?: string;
}

export const useOfflineStore = defineStore('offline', {
  state: () => ({
    colaUsuarios: [] as UsuarioPendiente[]
  }),
  persist: true
});
