<template>
  <q-card flat bordered class="q-mb-lg">
    <q-card-section class="row items-center">
      <div>
        <div class="text-h5 text-weight-bold">
          <q-icon name="shield" color="primary" class="q-mr-sm" />
          Gestión de Roles
        </div>
        <div class="text-caption text-grey-7">Define los roles y permisos del sistema</div>
      </div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nuevo Rol" @click="abrirModalRol()" />
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-table
        :rows="roles"
        :columns="columnasRoles"
        row-key="id"
        flat
        bordered
        :pagination="{ rowsPerPage: 0 }"
      >
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="q-gutter-xs">
            <q-btn flat round dense color="primary" icon="edit" @click="abrirModalRol(props.row)">
              <q-tooltip>Editar Rol</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.nombre_rol !== 'ADMIN'"
              flat
              round
              dense
              color="negative"
              icon="delete"
              @click="eliminarRol(props.row.id)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>

  <q-dialog v-model="modalRol">
    <q-card style="width: 400px">
      <q-card-section>
        <div class="text-h6">{{ editandoRol ? 'Editar Rol' : 'Nuevo Rol' }}</div>
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <q-input
          v-model="formRol.nombre_rol"
          label="Nombre del Rol *"
          outlined
          dense
          :disable="editandoRol && formRol.nombre_rol === 'ADMIN'"
        />
        <q-input v-model="formRol.descripcion" label="Descripción" type="textarea" outlined dense />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn color="primary" :label="editandoRol ? 'Actualizar' : 'Crear'" @click="guardarRol" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
// Importamos el tipo QTableColumn por separado si el linter marca error
import type { QTableColumn } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import { useUsuariosStore } from 'src/stores/usuariosStore';

const $q = useQuasar();
const authStore = useAuthStore();
const usuariosStore = useUsuariosStore();

// --- INTERFACES TYPESCRIPT ---
// Definimos la estructura de los objetos para evitar errores de "never"
interface Rol {
  id: number;
  nombre_rol: string;
  descripcion: string;
  permisos_json?: string; // Puede venir nulo o vacío
}

interface Pantalla {
  id?: number;
  nombre_pantalla: string;
  descripcion: string;
  tiene_acceso: boolean; // Propiedad agregada en el front
}

interface DBPantalla {
  id: number;
  nombre_pantalla: string;
  descripcion: string;
}

// --- ESTADOS CON TIPADO ---
const roles = ref<Rol[]>([]); // Array de Rol
const listaPantallas = ref<Pantalla[]>([]); // Array de Pantalla
const modalRol = ref(false);
const editandoRol = ref(false);

const formRol = ref<Rol>({ id: 0, nombre_rol: '', descripcion: '' });

// Definición estricta de columnas para Quasar
const columnasRoles: QTableColumn[] = [
  {
    name: 'nombre_rol',
    label: 'NOMBRE DEL ROL',
    align: 'left',
    field: 'nombre_rol',
    sortable: true,
  },
  { name: 'descripcion', label: 'DESCRIPCIÓN', align: 'left', field: 'descripcion' },
  { name: 'acciones', label: 'ACCIONES', align: 'center', field: 'id' },
];

// --- CARGA DE DATOS ---
onMounted(async () => {
  await cargarRoles();
  await obtenerCatalogoPantallas();
});

async function cargarRoles() {
  try {
    const { data } = await api.get<Rol[]>('/api/roles');
    roles.value = data;
    // Sincronizar con el store global para que otros componentes reaccionen
    usuariosStore.listaRoles = data;
  } catch (error) {
    console.error(error);
  }
}

async function obtenerCatalogoPantallas() {
  try {
    const { data } = await api.get<DBPantalla[]>('/api/pantallas');
    listaPantallas.value = data.map((p) => ({
      id: p.id,
      nombre_pantalla: p.nombre_pantalla,
      descripcion: p.descripcion,
      tiene_acceso: false,
    }));
  } catch (error) {
    console.error(error);
  }
}

// --- GESTIÓN DE ROLES (CRUD) ---
function abrirModalRol(rol: Rol | null = null) {
  if (rol) {
    editandoRol.value = true;
    // Usamos spread operator de forma segura
    formRol.value = { ...rol };
  } else {
    editandoRol.value = false;
    formRol.value = { id: 0, nombre_rol: '', descripcion: '' };
  }
  modalRol.value = true;
}

async function guardarRol() {
  try {
    if (editandoRol.value) {
      await api.put(`roles/${formRol.value.id}`, formRol.value);
    } else {
      await api.post('roles', formRol.value);
    }
    modalRol.value = false;
    await cargarRoles();
    $q.notify({ type: 'positive', message: 'Rol procesado exitosamente' });
  } catch {
    $q.notify({ type: 'negative', message: 'Error en la operación' });
  }
}

function eliminarRol(id: number) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Deseas eliminar este rol?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // Para solucionar el error de ESLint, envolvemos la llamada en un bloque void
    void (async () => {
      try {
        await api.delete(`/roles/${id}`);
        await cargarRoles(); //
        $q.notify({ type: 'positive', message: 'Rol eliminado' });
      } catch (error) {
        console.error(error);
        $q.notify({ type: 'negative', message: 'No se pudo eliminar el rol' });
      }
    })();
  });
}

// Watcher para recargar cuando cambie de sede
watch(
  () => authStore.sedeActivaId,
  () => {
    void cargarRoles();
    void obtenerCatalogoPantallas();
  },
);
</script>
