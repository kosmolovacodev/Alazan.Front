<template>
  <div class="q-pa-md">
    <!-- Loading -->
    <div v-if="loading" class="row items-center justify-center q-py-xl">
      <div class="text-grey-7">Cargando roles...</div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="q-pa-sm">
      <q-card flat bordered class="bg-red-1">
        <q-card-section class="row items-start q-gutter-md">
          <div class="text-h4">⚠️</div>

          <div class="col">
            <div class="text-h6 text-weight-bold text-red-10">
              Error al conectar con la base de datos
            </div>
            <div class="text-body2 text-red-10 q-mt-xs">
              {{ error }}
            </div>

            <q-card flat bordered class="bg-white q-mt-md">
              <q-card-section>
                <div class="text-subtitle2 text-weight-bold text-red-10 q-mb-sm">🔧 Solución:</div>
                <ol class="q-pl-md text-body2 text-red-10">
                  <li>Ve a la pestaña <b>"Diagnóstico BD"</b> en Configuración</li>
                  <li>Ejecuta el diagnóstico para identificar el problema específico</li>
                  <li>
                    Sigue las instrucciones del diagnóstico para ejecutar los scripts necesarios
                  </li>
                </ol>
              </q-card-section>
            </q-card>

            <q-btn
              class="q-mt-md"
              color="negative"
              unelevated
              icon="refresh"
              label="Reintentar conexión"
              @click="cargarRoles"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Main -->
    <div v-else class="column q-gutter-md">
      <!-- Header -->
      <div class="row items-start justify-between q-gutter-md">
        <div>
          <div class="text-h6 text-weight-bold text-grey-9 row items-center q-gutter-sm">
            <q-icon name="shield" size="20px" />
            <span>Gestión de Roles</span>
          </div>
          <div class="text-body2 text-grey-7 q-mt-xs">Define los roles y permisos del sistema</div>
        </div>

        <q-btn color="purple" unelevated icon="add" label="Nuevo Rol" @click="abrirModal()" />
      </div>

      <!-- Alerta informativa -->
      <q-banner dense rounded class="bg-blue-1 text-blue-10">
        <template #avatar>
          <q-icon name="shield" />
        </template>
        <div>
          <div class="text-weight-bold">Roles del Sistema</div>
          <div class="text-body2">
            Los roles <b>ADMIN</b> y <b>SUPERUSUARIO</b> son roles protegidos del sistema y no
            pueden ser eliminados.
          </div>
        </div>
      </q-banner>

      <!-- Tabla -->
      <q-card flat bordered>
        <q-table
          :rows="roles"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :rows-per-page-options="[0]"
          hide-pagination
        >
          <template #no-data>
            <div class="full-width row items-center justify-center q-py-lg text-grey-7">
              No hay roles registrados
            </div>
          </template>

          <template #body-cell-nombre_rol="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-sm">
                <div class="text-weight-medium text-grey-9">
                  {{ props.row.nombre_rol }}
                </div>

                <q-chip
                  v-if="esRolSistema(props.row.nombre_rol)"
                  dense
                  color="yellow-3"
                  text-color="yellow-10"
                  icon="shield"
                  label="Sistema"
                />
              </div>
            </q-td>
          </template>

          <template #body-cell-descripcion="props">
            <q-td :props="props">
              <span v-if="props.row.descripcion">{{ props.row.descripcion }}</span>
              <span v-else class="text-grey-6"><i>Sin descripción</i></span>
            </q-td>
          </template>

          <template #body-cell-tipo="props">
            <q-td :props="props">
              <q-chip
                dense
                :color="esRolSistema(props.row.nombre_rol) ? 'purple-2' : 'grey-3'"
                :text-color="esRolSistema(props.row.nombre_rol) ? 'purple-10' : 'grey-9'"
                :label="esRolSistema(props.row.nombre_rol) ? 'Protegido' : 'Personalizado'"
              />
            </q-td>
          </template>

          <template #body-cell-acciones="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-sm">
                <q-btn flat round dense color="primary" icon="edit" @click="abrirModal(props.row)">
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="!esRolSistema(props.row.nombre_rol)"
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="handleEliminar(props.row)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card>

      <!-- Modal -->
      <q-dialog v-model="showModal" persistent>
        <q-card style="width: 520px; max-width: 95vw">
          <q-card-section class="row items-center justify-between">
            <div class="text-h6 text-weight-bold">
              {{ editingRol ? 'Editar Rol' : 'Nuevo Rol' }}
            </div>

            <q-btn flat round dense icon="close" @click="cerrarModal" />
          </q-card-section>

          <q-separator />

          <q-form @submit.prevent="handleSubmit">
            <q-card-section class="column q-gutter-md">
              <!-- Nombre -->
              <div>
                <div class="text-body2 text-weight-medium text-grey-8 q-mb-xs">
                  Nombre del rol *
                </div>

                <q-input
                  v-model="formData.nombre_rol"
                  outlined
                  dense
                  placeholder="Ej: OPERADOR_BASCULA"
                  :disable="!!editingRol && esRolSistema(editingRol.nombre_rol)"
                  :rules="[(v) => !!String(v || '').trim() || 'Requerido']"
                />

                <div
                  v-if="editingRol && esRolSistema(editingRol.nombre_rol)"
                  class="text-caption text-grey-7 q-mt-xs"
                >
                  El nombre de los roles del sistema no se puede modificar
                </div>
              </div>

              <!-- Descripción -->
              <div>
                <div class="text-body2 text-weight-medium text-grey-8 q-mb-xs">Descripción</div>
                <q-input
                  v-model="formData.descripcion"
                  type="textarea"
                  outlined
                  dense
                  rows="3"
                  placeholder="Describe las responsabilidades de este rol..."
                />
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="q-pa-md">
              <q-btn outline color="grey-8" label="Cancelar" @click="cerrarModal" />
              <q-btn
                color="purple"
                unelevated
                icon="save"
                :label="editingRol ? 'Actualizar' : 'Crear'"
                type="submit"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Dialog, Notify } from 'quasar';
// import { supabase } from '@/lib/supabase';

interface Rol {
  id: number;
  nombre_rol: string;
  descripcion: string | null;
  created_at: string;
}

// Roles del sistema que no se pueden eliminar
const ROLES_SISTEMA = ['ADMIN', 'SUPERUSUARIO'];

const roles = ref<Rol[]>([]);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

const showModal = ref<boolean>(false);
const editingRol = ref<Rol | null>(null);

const formData = ref<{ nombre_rol: string; descripcion: string }>({
  nombre_rol: '',
  descripcion: '',
});

const columns = [
  { name: 'nombre_rol', label: 'Nombre del Rol', field: 'nombre_rol', align: 'left' as const },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' as const },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' as const },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'left' as const },
];

onMounted(() => {
  void cargarRoles();
});

function esRolSistema(nombreRol: string): boolean {
  return ROLES_SISTEMA.includes(String(nombreRol).toUpperCase());
}

async function cargarRoles(): Promise<void> {
  loading.value = true;
  error.value = null;

  try {
    // const { data, error: err } = await supabase.from('roles').select('*').order('nombre_rol');
    // if (err) throw err;
    // roles.value = (data as Rol[]) || [];
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('Error al cargar roles:', e);

    const msg = String(e?.message || '');

    if (msg === 'Failed to fetch' || msg.includes('fetch')) {
      error.value =
        'No se pudo conectar a la base de datos. Verifica que hayas ejecutado los scripts de inicialización.';
    } else if (msg.includes('does not exist')) {
      error.value =
        'Las tablas no existen. Por favor ejecuta el script de inicialización en Supabase.';
    } else {
      error.value = e?.message || 'Error desconocido';
    }
  } finally {
    loading.value = false;
  }
}

function abrirModal(rol?: Rol): void {
  if (rol) {
    editingRol.value = rol;
    formData.value = {
      nombre_rol: rol.nombre_rol,
      descripcion: rol.descripcion || '',
    };
  } else {
    editingRol.value = null;
    formData.value = { nombre_rol: '', descripcion: '' };
  }

  showModal.value = true;
}

function cerrarModal(): void {
  showModal.value = false;
  editingRol.value = null;
  formData.value = { nombre_rol: '', descripcion: '' };
}

async function handleSubmit(): Promise<void> {
  const nombre = String(formData.value.nombre_rol || '').trim();
  const desc = String(formData.value.descripcion || '').trim();

  if (!nombre) {
    Notify.create({ type: 'negative', message: 'Por favor ingresa el nombre del rol' });
    return;
  }

  // Validar que no se edite el nombre de un rol del sistema
  if (editingRol.value && esRolSistema(editingRol.value.nombre_rol)) {
    if (nombre.toUpperCase() !== editingRol.value.nombre_rol.toUpperCase()) {
      Notify.create({
        type: 'negative',
        message: 'No se puede cambiar el nombre de un rol del sistema',
      });
      return;
    }
  }

  try {
    const datosRol = {
      nombre_rol: nombre,
      descripcion: desc || null,
    };

    if (editingRol.value) {
      // const { error: err } = await supabase
      //   .from('roles')
      //   .update(datosRol)
      //   .eq('id', editingRol.value.id);
      // if (err) throw err;
      // Notify.create({ type: 'positive', message: 'Rol actualizado correctamente' });
    } else {
      // const { error: err } = await supabase.from('roles').insert([datosRol]);
      // if (err) throw err;
      // Notify.create({ type: 'positive', message: 'Rol creado correctamente' });
    }

    cerrarModal();
    await cargarRoles();
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('Error al guardar rol:', e);

    if (String(e?.code) === '23505') {
      Notify.create({ type: 'negative', message: 'Ya existe un rol con ese nombre' });
    } else {
      Notify.create({ type: 'negative', message: 'Error: ' + (e?.message || 'desconocido') });
    }
  }
}

function handleEliminar(rol: Rol): void {
  if (esRolSistema(rol.nombre_rol)) {
    Notify.create({ type: 'negative', message: 'No se puede eliminar un rol del sistema' });
    return;
  }

  Dialog.create({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar el rol "${rol.nombre_rol}"?\n\nLos usuarios con este rol quedarán sin asignar.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      // const { error: err } = await supabase.from('roles').delete().eq('id', rol.id);
      // if (err) {
      //   // FK: hay usuarios con este rol
      //   if (String(err.code) === '23503') {
      //     Notify.create({
      //       type: 'negative',
      //       message: 'No se puede eliminar: hay usuarios asignados a este rol',
      //     });
      //     return;
      //   }
      //   throw err;
      // }
      // Notify.create({ type: 'positive', message: 'Rol eliminado correctamente' });
      // await cargarRoles();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Error al eliminar rol:', e);
      Notify.create({ type: 'negative', message: 'Error: ' + (e?.message || 'desconocido') });
    }
  });
}
</script>
