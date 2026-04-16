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
        <template v-slot:body-cell-seccion_inicio_dia="props">
          <q-td :props="props" class="text-center">
            <q-badge
              v-if="props.row.seccion_inicio_dia"
              :style="{ background: colorSeccion(props.row.seccion_inicio_dia) }"
              class="text-uppercase text-white"
            >
              {{ props.row.seccion_inicio_dia }}
            </q-badge>
            <span v-else class="text-grey-4 text-caption">—</span>
          </q-td>
        </template>

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
        <q-select
          v-model="formRol.seccion_inicio_dia"
          :options="SECCIONES_OPTIONS"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          label="Sección Inicio de Día"
          outlined
          dense
          clearable
          hint="¿A qué sección pertenece este rol?"
        />
        <q-select
          v-model="formRol.tipo_inicio_dia"
          :options="TIPO_INICIO_OPTIONS"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          label="Tipo de participación en Inicio de Día"
          outlined
          dense
          clearable
          hint="Define el flujo que verá este rol al iniciar sesión"
        />
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
  permisos_json?: string;
  seccion_inicio_dia?: string | null;
  tipo_inicio_dia?: string | null;
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

const formRol = ref<Rol>({ id: 0, nombre_rol: '', descripcion: '', seccion_inicio_dia: null, tipo_inicio_dia: null });

// Definición estricta de columnas para Quasar
const columnasRoles: QTableColumn[] = [
  { name: 'nombre_rol',         label: 'NOMBRE DEL ROL',        align: 'left',   field: 'nombre_rol',         sortable: true },
  { name: 'descripcion',        label: 'DESCRIPCIÓN',            align: 'left',   field: 'descripcion' },
  { name: 'seccion_inicio_dia', label: 'SECCIÓN INICIO DE DÍA', align: 'center', field: 'seccion_inicio_dia' },
  { name: 'acciones',           label: 'ACCIONES',               align: 'center', field: 'id' },
];

interface SeccionOpcion { label: string; value: string | null; color?: string }

const SECCIONES_OPTIONS = ref<SeccionOpcion[]>([{ label: '— Ninguna —', value: null }]);

async function cargarSecciones() {
  try {
    const { data } = await api.get<{ codigo: string; nombre: string; color: string }[]>('/api/inicio-dia/secciones');
    SECCIONES_OPTIONS.value = [
      { label: '— Ninguna —', value: null },
      ...data.map(s => ({ label: s.nombre, value: s.codigo, color: s.color })),
    ];
  } catch {
    // Si falla, las opciones quedan solo con "Ninguna"
  }
}

const TIPO_INICIO_OPTIONS = [
  { label: '— No participa —', value: null },
  { label: 'Supervisor  — llena asistencia directamente',      value: 'SUPERVISOR' },
  { label: 'Asistente   — pregunta si asistió el supervisor',  value: 'ASISTENTE'  },
  { label: 'Analista    — espera a que otro inicie el día',     value: 'ANALISTA'   },
];

// --- CARGA DE DATOS ---
onMounted(async () => {
  await cargarRoles();
  await obtenerCatalogoPantallas();
  await cargarSecciones();
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
function colorSeccion(seccion: string): string {
  return SECCIONES_OPTIONS.value.find(s => s.value === seccion)?.color ?? 'grey-6';
}

function abrirModalRol(rol: Rol | null = null) {
  if (rol) {
    editandoRol.value = true;
    formRol.value = { ...rol };
  } else {
    editandoRol.value = false;
    formRol.value = { id: 0, nombre_rol: '', descripcion: '', seccion_inicio_dia: null, tipo_inicio_dia: null };
  }
  modalRol.value = true;
}

async function guardarRol() {
  try {
    if (editandoRol.value) {
      await api.put(`/api/roles/${formRol.value.id}`, formRol.value);
    } else {
      await api.post('/api/roles', formRol.value);
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
        await api.delete(`/api/roles/${id}`);
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
