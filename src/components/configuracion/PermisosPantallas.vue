<template>
  <q-card bordered>
    <q-card-section>
      <div class="row items-center q-mb-md">
        <div class="text-h6">Permisos de Acceso a Pantallas</div>
        <q-btn
          flat
          round
          color="grey-7"
          icon="settings"
          class="q-ml-sm"
          @click="modalCatalogo = true"
        >
          <q-tooltip>Gestionar Catálogo de Pantallas</q-tooltip>
        </q-btn>
      </div>
      <q-dialog v-model="modalCatalogo">
        <q-card style="width: min(520px, 92vw); max-height: 85vh" class="column">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Catálogo de Pantallas</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="col scroll" style="overflow-x: hidden">
            <!-- Formulario para agregar -->
            <div class="bg-blue-1 q-pa-sm rounded-borders q-mb-md text-caption">
              Añade aquí las secciones de tu sistema para que aparezcan en la matriz de permisos.
            </div>
            <q-input
              v-model="nuevaPantalla.nombre_pantalla"
              label="Nombre de Pantalla *"
              outlined
              dense
              class="q-mb-sm"
            />
            <q-input
              v-model="nuevaPantalla.descripcion"
              label="Descripción"
              outlined
              dense
              class="q-mb-sm"
            />
            <q-btn
              color="secondary"
              label="Añadir al Catálogo"
              icon="add"
              class="full-width q-mb-lg"
              @click="guardarNuevaPantalla"
            />

            <!-- Lista de pantallas existentes -->
            <div class="text-subtitle2 q-mb-sm text-grey-8">Pantallas registradas</div>
            <q-list bordered separator>
              <q-item v-for="p in listaPantallas" :key="p.id ?? p.nombre_pantalla" dense class="q-px-sm">
                <q-item-section style="min-width: 0">
                  <q-item-label class="ellipsis">{{ p.nombre_pantalla }}</q-item-label>
                  <q-item-label caption v-if="p.descripcion" class="ellipsis">{{ p.descripcion }}</q-item-label>
                </q-item-section>
                <q-item-section side style="padding-left: 8px">
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click="confirmarEliminarPantalla(p)"
                  >
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-select
        v-model="rolSeleccionado"
        :options="roles"
        option-label="nombre_rol"
        option-value="id"
        label="Seleccione un Rol para editar permisos"
        outlined
        emit-value
        map-options
        class="q-mb-md"
        @update:model-value="cargarPermisosDelRol"
      />

      <div v-if="rolSeleccionado">
        <div class="row q-gutter-sm q-mb-md justify-end">
          <q-btn label="Activar Todos" color="positive" outline dense @click="marcarTodo(true)" />
          <q-btn
            label="Desactivar Todos"
            color="negative"
            outline
            dense
            @click="marcarTodo(false)"
          />
        </div>

        <q-markup-table flat bordered>
          <thead>
            <tr class="bg-grey-1">
              <th class="text-left">Módulo / Pantalla</th>
              <th class="text-left">Descripción</th>
              <th class="text-center">Acceso</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pantalla in listaPantallas" :key="pantalla.id">
              <td>{{ pantalla.nombre_pantalla }}</td>
              <td class="text-grey-7 text-caption">{{ pantalla.descripcion }}</td>
              <td class="text-center">
                <q-checkbox v-model="pantalla.tiene_acceso" :disable="esAdmin" color="primary" />
              </td>
            </tr>
          </tbody>
        </q-markup-table>

        <div class="row justify-end q-mt-md">
          <q-btn
            label="Guardar Permisos"
            color="primary"
            icon="save"
            @click="guardarPermisosFinales"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import { useUsuariosStore } from 'src/stores/usuariosStore';

const authStore = useAuthStore();
const usuariosStore = useUsuariosStore();

// Cuando cambia la sede, recargar todo
watch(
  () => authStore.sedeActivaId,
  () => {
    void cargarRoles();
    void obtenerCatalogoPantallas();
  },
);

// Cuando GestionRoles agrega/edita/elimina un rol, el store se actualiza
// y este componente refleja los cambios sin F5
watch(
  () => usuariosStore.listaRoles,
  (nuevosRoles) => {
    roles.value = nuevosRoles as Rol[];
    // Si el rol actualmente seleccionado ya no existe, limpiar selección
    if (rolSeleccionado.value && !nuevosRoles.find(r => r.id === rolSeleccionado.value)) {
      rolSeleccionado.value = null;
    }
  },
  { deep: true },
);

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

const $q = useQuasar();

// --- ESTADOS CON TIPADO ---
const roles = ref<Rol[]>([]); // Array de Rol
const rolSeleccionado = ref<number | null>(null);
const listaPantallas = ref<Pantalla[]>([]); // Array de Pantalla

const modalCatalogo = ref(false);
const nuevaPantalla = ref({ nombre_pantalla: '', descripcion: '' });

const esAdmin = computed(() => {
  const rol = roles.value.find((r) => r.id === rolSeleccionado.value);
  return rol?.nombre_rol === 'ADMIN';
});

// --- CARGA DE DATOS ---
onMounted(async () => {
  await cargarRoles();
  await obtenerCatalogoPantallas();
});

async function cargarRoles() {
  try {
    const { data } = await api.get<Rol[]>('/api/roles');
    roles.value = data;
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

// --- LÓGICA DE PERMISOS ---
// Quitamos 'async' porque es lógica local, no espera a la DB
function cargarPermisosDelRol(rolId: number) {
  const rol = roles.value.find((r) => r.id === rolId);
  if (!rol) return;

  // Limpiar estados previos
  listaPantallas.value.forEach((p) => (p.tiene_acceso = false));

  if (rol.permisos_json) {
    try {
      const permisos: string[] = JSON.parse(rol.permisos_json);
      listaPantallas.value.forEach((p) => {
        if (permisos.includes(p.nombre_pantalla)) p.tiene_acceso = true;
      });
    } catch (e) {
      console.error('Error parseando JSON de permisos', e);
    }
  }
}

function marcarTodo(estado: boolean) {
  listaPantallas.value.forEach((p) => (p.tiene_acceso = estado));
}

async function guardarPermisosFinales() {
  if (!rolSeleccionado.value) return;

  try {
    const permisos = listaPantallas.value
      .filter((p) => p.tiene_acceso)
      .map((p) => p.nombre_pantalla);

    await api.post(`/api/permisos/${rolSeleccionado.value}`, {
      permisos: JSON.stringify(permisos),
    });
    $q.notify({ type: 'positive', message: 'Permisos guardados' });
    await cargarRoles(); // Recargar para actualizar el json local
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar permisos' });
  }
}

// --- GESTIÓN DE ROLES (CRUD) ---

// --- GESTIÓN DE PANTALLAS ---
async function guardarNuevaPantalla() {
  if (!nuevaPantalla.value.nombre_pantalla) return;
  try {
    await api.post('/api/pantallas', {
      ...nuevaPantalla.value,
      sede_id: authStore.sedeActivaId,
    });
    nuevaPantalla.value = { nombre_pantalla: '', descripcion: '' };
    await obtenerCatalogoPantallas();
    if (rolSeleccionado.value) cargarPermisosDelRol(rolSeleccionado.value);
    $q.notify({ type: 'positive', message: 'Pantalla agregada al catálogo' });
  } catch {
    $q.notify({ type: 'negative', message: 'Error al registrar pantalla' });
  }
}

function confirmarEliminarPantalla(pantalla: Pantalla) {
  $q.dialog({
    title: 'Eliminar Pantalla',
    message: `¿Eliminar "${pantalla.nombre_pantalla}" del catálogo? Los roles que la tengan asignada perderán ese permiso.`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Eliminar', color: 'negative' },
    persistent: true,
  }).onOk(() => {
    void eliminarPantalla(pantalla);
  });
}

async function eliminarPantalla(pantalla: Pantalla) {
  try {
    await api.delete(`/api/pantallas/${pantalla.id}`);
    await obtenerCatalogoPantallas();
    if (rolSeleccionado.value) cargarPermisosDelRol(rolSeleccionado.value);
    $q.notify({ type: 'positive', message: `"${pantalla.nombre_pantalla}" eliminada` });
  } catch {
    $q.notify({ type: 'negative', message: 'Error al eliminar la pantalla' });
  }
}
</script>
