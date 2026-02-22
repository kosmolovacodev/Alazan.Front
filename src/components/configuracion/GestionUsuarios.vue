<template>
  <div>
    <div class="row justify-between items-center q-mb-md">
      <div class="text-subtitle1 text-weight-bold">Usuarios del Sistema</div>
      <q-btn
        color="purple"
        icon="person_add"
        label="Nuevo Usuario"
        unelevated
        @click="abrirModal"
      />
    </div>

    <q-table :rows="usuarios" :columns="columns" row-key="id" flat bordered :loading="loading">
      <template v-slot:body-cell-nombre_sede="props">
        <q-td :props="props">
          <q-badge :color="props.row.sede_id === 0 ? 'black' : 'grey-7'" outline>
            {{ props.row.nombre_sede || 'Sin Sede' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-activo="props">
        <q-td :props="props" class="text-center">
          <q-chip :color="props.row.activo ? 'green' : 'red'" text-color="white" size="sm">
            {{ props.row.activo ? 'Activo' : 'Inactivo' }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn flat round icon="edit" color="blue" size="sm" @click="editar(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="modal" persistent>
      <q-card style="width: 700px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">{{ form.id ? 'Editar Usuario' : 'Nuevo Usuario' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6 q-gutter-y-sm">
              <q-input v-model="form.nombre" label="Nombre Completo *" outlined dense />
              <q-input
                v-model="form.username"
                label="Email / Usuario *"
                outlined
                dense
                type="email"
              />
              <q-input
                v-model="form.password"
                label="Contraseña"
                type="password"
                outlined
                dense
                :hint="form.id ? 'Dejar vacío para no cambiar' : 'Requerido'"
              />

              <q-select
                v-model="form.rol_id"
                :options="rolesOptions"
                label="Rol *"
                outlined
                dense
                emit-value
                map-options
              />

              <q-select
                v-model="form.sede_id"
                :options="authStore.listaSedes"
                option-value="id"
                option-label="nombre"
                label="Bodega Asignada *"
                outlined
                dense
                emit-value
                map-options
                :readonly="!authStore.esAdminGlobal"
              >
                <template v-slot:prepend>
                  <q-icon name="place" />
                </template>
                <q-tooltip v-if="!authStore.esAdminGlobal"
                  >Solo el Admin Global puede cambiar la sede</q-tooltip
                >
              </q-select>
            </div>

            <div class="col-12 col-md-6 q-gutter-y-sm">
              <q-input v-model="form.firma" label="Firma" outlined dense />
              <q-input v-model="form.departamento" label="Departamento (Opcional)" outlined dense />
              <q-input
                v-model="form.telefono"
                label="Teléfono (Opcional)"
                outlined
                dense
                mask="##########"
              />
              <q-checkbox v-model="form.activo" label="Usuario Activo" color="purple" />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup color="grey" />
          <q-btn color="purple" label="Guardar Usuario" @click="guardar" :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import { useOfflineStore } from 'src/stores/offlineStore';
import { useUsuariosStore } from 'src/stores/usuariosStore';
import { useAuthStore } from 'src/stores/auth'; // Importamos el AuthStore para sedes

const usuariosStore = useUsuariosStore();
const offlineStore = useOfflineStore();
const authStore = useAuthStore();

interface Usuario {
  id?: number | null | undefined;
  nombre: string;
  username: string;
  password?: string;
  rol_id: number | null;
  nombre_rol?: string;
  nombre_sede?: string; // Para mostrar el nombre en la tabla
  sede_id: number | null; // <--- NUEVO
  firma?: string;
  departamento?: string;
  telefono?: string;
  activo: boolean;
}

interface Rol {
  id: number;
  nombre_rol: string;
  descripcion?: string;
}

const usuarios = ref<Usuario[]>([]);
const rolesOptions = ref<{ label: string; value: number }[]>([]);
const loading = ref(false);
const modal = ref(false);

const initialForm: Usuario = {
  id: null,
  nombre: '',
  username: '',
  password: '',
  rol_id: null,
  sede_id: null,
  firma: '',
  departamento: '',
  telefono: '',
  activo: true,
};

const form = ref<Usuario>({ ...initialForm });

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const },
  { name: 'username', label: 'Email', field: 'username', align: 'left' as const },
  { name: 'nombre_rol', label: 'Rol', field: 'nombre_rol', align: 'left' as const },
  { name: 'nombre_sede', label: 'Sede', field: 'nombre', align: 'left' as const }, // NUEVA COLUMNA
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' as const },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'right' as const },
];

watch(
  () => authStore.sedeActivaId,
  () => {
    void cargarData();
  },
);

const cargarData = async () => {
  loading.value = true;
  if (window.navigator.onLine) {
    try {
      if (authStore.listaSedes.length === 0) await authStore.cargarSedes();

      // Tipamos explícitamente la respuesta como Usuario[]

      const miSedeId = authStore.user?.sede_id ?? 0;

      // En GestionUsuarios.vue
      const [resUsers, resRoles] = await Promise.all([
        api.get<Usuario[]>(`usuarios?sedeId=${miSedeId}`), // El interceptor pondrá solo el ?sedeId=X
        api.get<Rol[]>('roles'),
      ]);

      // Forzamos el guardado con el tipo correcto
      usuariosStore.listaUsuarios = resUsers.data;
      usuariosStore.listaRoles = resRoles.data;
    } catch (err) {
      console.warn('Error cargando datos', err);
    }
  }

  // 1. Mapeamos y aseguramos que cada objeto sea tratado como 'Usuario'
  const datosMezclados = (usuariosStore.listaUsuarios as Usuario[]).map((uServidor) => {
    const cambioPendiente = offlineStore.colaUsuarios.find((p) => p.id === uServidor.id);

    // Creamos una copia limpia para evitar problemas de referencia
    const usuarioFinal: Usuario = cambioPendiente
      ? { ...uServidor, ...cambioPendiente }
      : { ...uServidor };

    // Buscamos la sede en el catálogo (que usa .nombre según tu API)
    const sedeObj = authStore.listaSedes.find((s) => s.id === usuarioFinal.sede_id);

    // Asignamos el texto a mostrar en la columna 'nombre_sede' de la tabla
    usuarioFinal.nombre_sede = sedeObj?.nombre || (usuarioFinal.sede_id === 0 ? 'Global' : 'N/A');

    return usuarioFinal;
  });

  // Asignamos el resultado a la tabla
  usuarios.value = datosMezclados;

  // Corregimos el error de ESLint 'any' usando la interfaz Rol
  rolesOptions.value = (usuariosStore.listaRoles as Rol[]).map((r) => ({
    label: r.nombre_rol,
    value: r.id,
  }));

  loading.value = false;
};

function abrirModal() {
  form.value = { ...initialForm };
  // Si no es admin global, se le asigna su propia sede automáticamente
  if (!authStore.esAdminGlobal) {
    form.value.sede_id = authStore.user?.sede_id || null;
  } else {
    // Si es global, sugerimos la sede que está viendo actualmente
    form.value.sede_id = authStore.sedeActivaId;
  }
  modal.value = true;
}

function editar(usuario: Usuario) {
  form.value = { ...usuario, password: '' };
  modal.value = true;
}

async function guardar() {
  if (
    !form.value.nombre ||
    !form.value.username ||
    !form.value.rol_id ||
    form.value.sede_id === null
  ) {
    Notify.create({ type: 'warning', message: 'Nombre, Email, Rol y Sede son obligatorios' });
    return;
  }

  if (!window.navigator.onLine) {
    // Lógica Offline (Igual a la que tienes, solo asegúrate de incluir sede_id en el objeto 'pendiente')
    Notify.create({
      type: 'warning',
      message: 'Modo offline no implementado para sede_id en este ejemplo',
    });
    return;
  }

  try {
    loading.value = true;
    if (form.value.id) {
      await api.put(`usuarios/${form.value.id}`, form.value);
      Notify.create({ type: 'positive', message: 'Usuario actualizado' });
    } else {
      await api.post('usuarios', form.value);
      Notify.create({ type: 'positive', message: 'Usuario creado' });
    }
    modal.value = false;
    await cargarData();
  } catch {
    Notify.create({ type: 'negative', message: 'Error en la operación' });
  } finally {
    loading.value = false;
  }
}

onMounted(() => void cargarData());
</script>
