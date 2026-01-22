<template>
  <div class="q-pa-md">
    <!-- Loading -->
    <div v-if="loading" class="row items-center justify-center q-py-xl">
      <div class="text-grey-7">Cargando usuarios...</div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="q-pa-sm">
      <AlertaConfiguracionBD :error="error" :onRetry="cargarDatos" />
    </div>

    <!-- Main -->
    <div v-else class="column q-gutter-md">
      <!-- Header -->
      <div class="row items-start justify-between q-gutter-md">
        <div>
          <div class="text-h6 text-weight-bold text-grey-9 row items-center q-gutter-sm">
            <q-icon name="person" size="20px" />
            <span>Gestión de Usuarios</span>
          </div>
          <div class="text-body2 text-grey-7 q-mt-xs">Administra los usuarios del sistema</div>
        </div>

        <q-btn color="purple" unelevated icon="add" label="Nuevo Usuario" @click="abrirModal()" />
      </div>

      <!-- Tabla usuarios -->
      <q-card flat bordered>
        <q-table
          :rows="usuarios"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :rows-per-page-options="[0]"
          hide-pagination
        >
          <template #no-data>
            <div class="full-width row items-center justify-center q-py-lg text-grey-7">
              No hay usuarios registrados
            </div>
          </template>

          <template #body-cell-nombre_completo="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-sm">
                <div class="text-weight-medium text-grey-9">
                  {{ props.row.nombre_completo }}
                </div>

                <q-chip
                  v-if="esSuperusuario(props.row)"
                  dense
                  color="yellow-3"
                  text-color="yellow-10"
                  label="Superusuario"
                />
              </div>
            </q-td>
          </template>

          <template #body-cell-rol="props">
            <q-td :props="props">
              <q-chip
                dense
                color="blue-2"
                text-color="blue-10"
                :label="props.row.roles?.nombre_rol || 'Sin rol'"
              />
            </q-td>
          </template>

          <template #body-cell-estado="props">
            <q-td :props="props">
              <q-chip
                dense
                :color="props.row.activo ? 'green-2' : 'red-2'"
                :text-color="props.row.activo ? 'green-10' : 'red-10'"
                :label="props.row.activo ? 'Activo' : 'Inactivo'"
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
                  v-if="!esSuperusuario(props.row)"
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
              {{ editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </div>

            <q-btn flat round dense icon="close" @click="cerrarModal" />
          </q-card-section>

          <q-separator />

          <q-form @submit.prevent="handleSubmit">
            <q-card-section class="column q-gutter-md">
              <!-- Nombre -->
              <div>
                <div class="text-body2 text-weight-medium text-grey-8 q-mb-xs">
                  Nombre completo *
                </div>
                <q-input
                  v-model="formData.nombre_completo"
                  outlined
                  dense
                  placeholder="Ej: Juan Pérez García"
                  :rules="[(v) => !!String(v || '').trim() || 'Requerido']"
                />
              </div>

              <!-- Email -->
              <div>
                <div class="text-body2 text-weight-medium text-grey-8 q-mb-xs">Email *</div>
                <q-input
                  v-model="formData.email"
                  type="email"
                  outlined
                  dense
                  placeholder="usuario@ejemplo.com"
                  :rules="[(v) => !!String(v || '').trim() || 'Requerido']"
                />
              </div>

              <!-- Password -->
              <div>
                <div class="text-body2 text-weight-medium text-grey-8 q-mb-xs">Contraseña</div>
                <q-input
                  v-model="formData.password"
                  type="password"
                  outlined
                  dense
                  placeholder="********"
                />
                <div class="text-caption text-grey-7 q-mt-xs">
                  (Opcional) Si lo dejas vacío, no se cambia en edición / queda null en creación.
                </div>
              </div>

              <!-- Firma -->
              <div>
                <div class="text-body2 text-weight-medium text-grey-8 q-mb-xs">Firma</div>
                <q-input v-model="formData.firma" outlined dense placeholder="Ej: 12345" />
              </div>

              <!-- Rol -->
              <div>
                <div class="text-body2 text-weight-medium text-grey-8 q-mb-xs">Rol *</div>
                <q-select
                  v-model="formData.rol_id"
                  :options="rolOptions"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Requerido']"
                  placeholder="Seleccionar rol"
                />
              </div>

              <!-- Departamento -->
              <div>
                <div class="text-body2 text-weight-medium text-grey-8 q-mb-xs">
                  Departamento (opcional)
                </div>
                <q-input
                  v-model="formData.departamento"
                  outlined
                  dense
                  placeholder="Ej: Recursos Humanos"
                />
              </div>

              <!-- Teléfono -->
              <div>
                <div class="text-body2 text-weight-medium text-grey-8 q-mb-xs">
                  Teléfono (opcional)
                </div>
                <q-input
                  v-model="formData.telefono"
                  outlined
                  dense
                  placeholder="Ej: 123-456-7890"
                />
              </div>

              <!-- Estado -->
              <div class="row items-center q-gutter-sm">
                <q-toggle v-model="formData.activo" />
                <div class="text-body2 text-grey-8">Usuario activo</div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="q-pa-md">
              <q-btn outline color="grey-8" label="Cancelar" @click="cerrarModal" />
              <q-btn
                color="purple"
                unelevated
                icon="save"
                :label="editingUsuario ? 'Actualizar' : 'Crear'"
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
import AlertaConfiguracionBD from './AlertaConfiguracionBD.vue';

interface Usuario {
  id: number;
  nombre_completo: string;
  email: string;
  password: string | null;
  firma: number | null;
  rol_id: number | null;
  departamento: string | null;
  telefono: string | null;
  activo: boolean;
  fecha_registro: string;
  created_at: string;
  roles?: {
    nombre_rol: string;
  };
}

interface Rol {
  id: number;
  nombre_rol: string;
  descripcion: string | null;
}

interface Sede {
  id: number;
  nombre_sede: string;
}

const usuarios = ref<Usuario[]>([]);
const roles = ref<Rol[]>([]);
const sedes = ref<Sede[]>([]);

const loading = ref<boolean>(true);
const error = ref<string | null>(null);

const showModal = ref<boolean>(false);
const editingUsuario = ref<Usuario | null>(null);

// Formulario (manteniendo strings como en TSX)
const formData = ref({
  nombre_completo: '',
  email: '',
  password: '',
  firma: '',
  rol_id: '' as string | number, // por q-select emit-value: number
  departamento: '',
  telefono: '',
  activo: true,
});

onMounted(() => {
  void cargarDatos();
});

async function cargarDatos(): Promise<void> {
  loading.value = true;
  error.value = null;

  // try {
  //   // Usuarios con roles(nombre_rol)
  //   const { data: usuariosData, error: usuariosError } = await supabase
  //     .from('usuarios')
  //     .select(`*, roles (nombre_rol)`)
  //     .order('created_at', { ascending: false });

  //   if (usuariosError) throw usuariosError;

  //   // Roles
  //   const { data: rolesData, error: rolesError } = await supabase
  //     .from('roles')
  //     .select('*')
  //     .order('nombre_rol');

  //   if (rolesError) throw rolesError;

  //   // Sedes (opcional)
  //   let sedesData: Sede[] = [];
  //   try {
  //     const { data } = await supabase.from('sedes').select('*').order('nombre_sede');
  //     sedesData = (data as Sede[]) || [];
  //   } catch {
  //     // ignorar si no existe tabla sedes
  //     // eslint-disable-next-line no-console
  //     console.log('Tabla sedes no disponible');
  //   }

  //   usuarios.value = (usuariosData as Usuario[]) || [];
  //   roles.value = (rolesData as Rol[]) || [];
  //   sedes.value = sedesData;
  // } catch (e: any) {
  //   // eslint-disable-next-line no-console
  //   console.error('Error al cargar datos:', e);

  //   const msg = String(e?.message || '');
  //   if (msg === 'Failed to fetch' || msg.includes('fetch')) {
  //     error.value =
  //       'No se pudo conectar a la base de datos. Verifica que hayas ejecutado los scripts de inicialización.';
  //   } else if (msg.includes('does not exist')) {
  //     error.value =
  //       'Las tablas no existen. Por favor ejecuta el script de inicialización en Supabase.';
  //   } else {
  //     error.value = e?.message || 'Error desconocido';
  //   }
  // } finally {
  //   loading.value = false;
  // }
}

function abrirModal(usuario?: Usuario): void {
  if (usuario) {
    editingUsuario.value = usuario;
    formData.value = {
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      password: '',
      firma: usuario.firma?.toString() || '',
      rol_id: usuario.rol_id ?? '',
      departamento: usuario.departamento || '',
      telefono: usuario.telefono || '',
      activo: usuario.activo,
    };
  } else {
    editingUsuario.value = null;
    formData.value = {
      nombre_completo: '',
      email: '',
      password: '',
      firma: '',
      rol_id: '',
      departamento: '',
      telefono: '',
      activo: true,
    };
  }
  showModal.value = true;
}

function cerrarModal(): void {
  showModal.value = false;
  editingUsuario.value = null;
  formData.value = {
    nombre_completo: '',
    email: '',
    password: '',
    firma: '',
    rol_id: '',
    departamento: '',
    telefono: '',
    activo: true,
  };
}

function esSuperusuario(u: Usuario): boolean {
  return u.id === 1 || u.email === 'admin@alazan.com';
}

async function handleSubmit(): Promise<void> {
  const nombre = String(formData.value.nombre_completo || '').trim();
  const email = String(formData.value.email || '').trim();
  const rolId = formData.value.rol_id;

  if (!nombre || !email || !rolId) {
    Notify.create({
      type: 'negative',
      message: 'Por favor completa todos los campos obligatorios',
    });
    return;
  }

  try {
    const datosUsuario = {
      nombre_completo: nombre,
      email,
      password: formData.value.password ? String(formData.value.password) : null,
      firma: formData.value.firma ? parseInt(String(formData.value.firma), 10) : null,
      rol_id: parseInt(String(rolId), 10),
      departamento: formData.value.departamento ? String(formData.value.departamento) : null,
      telefono: formData.value.telefono ? String(formData.value.telefono) : null,
      activo: !!formData.value.activo,
    };

    // if (editingUsuario.value) {
    //   const { error: err } = await supabase
    //     .from('usuarios')
    //     .update(datosUsuario)
    //     .eq('id', editingUsuario.value.id);

    //   if (err) throw err;
    //   Notify.create({ type: 'positive', message: 'Usuario actualizado correctamente' });
    // } else {
    //   const { error: err } = await supabase.from('usuarios').insert([datosUsuario]);
    //   if (err) throw err;
    //   Notify.create({ type: 'positive', message: 'Usuario creado correctamente' });
    // }

    cerrarModal();
    await cargarDatos();
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('Error al guardar usuario:', e);
    Notify.create({ type: 'negative', message: 'Error: ' + (e?.message || 'desconocido') });
  }
}

function handleEliminar(usuario: Usuario): void {
  if (esSuperusuario(usuario)) {
    Notify.create({
      type: 'negative',
      message: 'No se puede eliminar el superusuario del sistema',
    });
    return;
  }

  // Dialog.create({
  //   title: 'Confirmar eliminación',
  //   message: `¿Estás seguro de eliminar al usuario "${usuario.nombre_completo}"?`,
  //   cancel: true,
  //   persistent: true,
  // }).onOk(async () => {
  //   try {
  //     const { error: err } = await supabase.from('usuarios').delete().eq('id', usuario.id);
  //     if (err) throw err;

  //     Notify.create({ type: 'positive', message: 'Usuario eliminado correctamente' });
  //     await cargarDatos();
  //   } catch (e: any) {
  //     // eslint-disable-next-line no-console
  //     console.error('Error al eliminar usuario:', e);
  //     Notify.create({ type: 'negative', message: 'Error: ' + (e?.message || 'desconocido') });
  //   }
  // });
}

const rolOptions = computed(() =>
  roles.value.map((r) => ({
    value: r.id,
    label: r.nombre_rol,
  })),
);

const columns = [
  { name: 'nombre_completo', label: 'Nombre', field: 'nombre_completo', align: 'left' as const },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const },
  { name: 'rol', label: 'Rol', field: 'roles', align: 'left' as const },
  { name: 'estado', label: 'Estado', field: 'activo', align: 'left' as const },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'left' as const },
];
</script>
