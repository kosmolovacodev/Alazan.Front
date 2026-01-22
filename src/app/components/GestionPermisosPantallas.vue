<template>
  <div class="q-pa-md">
    <!-- Loading -->
    <div v-if="loading" class="row items-center justify-center q-py-xl">
      <div class="text-grey-7">Cargando roles...</div>
    </div>

    <!-- No roles -->
    <q-card v-else-if="roles.length === 0" flat bordered class="bg-yellow-1">
      <q-card-section class="row items-start q-gutter-sm">
        <q-icon name="warning" class="text-yellow-9" size="20px" />
        <div>
          <div class="text-subtitle1 text-weight-medium text-yellow-10">
            No hay roles disponibles
          </div>
          <div class="text-body2 text-yellow-10 q-mt-xs">
            Primero debes crear roles en la sección de "Gestión de Roles" antes de asignar permisos.
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Main -->
    <div v-else class="column q-gutter-md">
      <!-- Header -->
      <div>
        <div class="text-h6 text-weight-medium text-grey-9">Permisos de Acceso por Rol</div>
        <div class="text-body2 text-grey-7 q-mt-xs">
          Configura qué pantallas puede acceder cada rol en el sistema
        </div>
      </div>

      <!-- Selector Rol -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-body2 text-weight-medium text-grey-8 q-mb-sm">Seleccionar Rol</div>

          <q-select
            v-model="selectedRol"
            :options="rolOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            dense
            outlined
            class="q-mb-sm"
            style="max-width: 520px"
            @update:model-value="handleRolChange"
          />

          <q-banner
            v-if="esRolSistema && rolSeleccionado"
            dense
            rounded
            class="bg-blue-1 text-blue-10 q-mt-sm"
          >
            <template #avatar>
              <q-icon name="shield" />
            </template>
            <div>
              <strong>{{ rolSeleccionado.nombre_rol }}</strong>
              es un rol del sistema con todos los permisos habilitados permanentemente.
            </div>
          </q-banner>
        </q-card-section>
      </q-card>

      <!-- Resumen -->
      <q-card flat bordered class="bg-purple-1">
        <q-card-section class="row items-center justify-between q-gutter-md">
          <div>
            <div class="text-body2 text-weight-medium text-purple-10">
              Permisos activos: {{ permisosActivos }} de {{ MODULOS_SISTEMA.length }}
            </div>
            <div class="text-caption text-purple-9 q-mt-xs">
              {{
                esRolSistema
                  ? 'Todos los módulos están habilitados'
                  : 'Selecciona los módulos a los que este rol tendrá acceso'
              }}
            </div>
          </div>

          <div v-if="!esRolSistema" class="row q-gutter-sm">
            <q-btn color="positive" unelevated label="Activar Todos" @click="handleActivarTodos" />
            <q-btn
              color="grey-7"
              unelevated
              label="Desactivar Todos"
              @click="handleDesactivarTodos"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla -->
      <q-card flat bordered>
        <q-table
          :rows="modulosRows"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :rows-per-page-options="[0]"
          hide-pagination
        >
          <template #body-cell-acceso="props">
            <q-td :props="props" class="text-center">
              <q-toggle
                :model-value="props.row.tienePermiso"
                :disable="esRolSistema"
                @update:model-value="() => handlePermisoToggle(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>

      <!-- Acciones -->
      <div v-if="!esRolSistema" class="row justify-end q-gutter-sm q-pt-md">
        <q-btn
          outline
          color="grey-8"
          icon="refresh"
          label="Restablecer"
          :disable="saving"
          @click="handleResetearPermisos"
        />
        <q-btn
          color="orange"
          unelevated
          icon="save"
          :label="saving ? 'Guardando...' : 'Guardar Permisos'"
          :loading="saving"
          @click="handleGuardarPermisos"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Notify } from 'quasar';
// import { supabase } from '@/lib/supabase';

interface Rol {
  id: number;
  nombre_rol: string;
  descripcion: string | null;
  permisos_json: Record<string, boolean>;
}

// Definición de todos los módulos/pantallas del sistema
const MODULOS_SISTEMA: Array<{ id: string; nombre: string; descripcion: string }> = [
  {
    id: 'bascula',
    nombre: 'Báscula Recepción',
    descripcion: 'Captura de peso bruto y datos iniciales',
  },
  {
    id: 'analisis',
    nombre: 'Análisis (Laboratorio)',
    descripcion: 'Análisis de calidad del grano',
  },
  { id: 'boleta', nombre: 'Boleta', descripcion: 'Generación de boletas preliminares y finales' },
  { id: 'precio', nombre: 'Precio', descripcion: 'Autorización y renegociación de precios' },
  {
    id: 'preliquidacion',
    nombre: 'Preliquidación',
    descripcion: 'Captura de peso neto y cálculo de preliquidación',
  },
  { id: 'volcado', nombre: 'Volcado', descripcion: 'Asignación de silos' },
  {
    id: 'recepcion_facturas',
    nombre: 'Recepción de Facturas',
    descripcion: 'Captura y validación de facturas',
  },
  { id: 'facturacion', nombre: 'Facturación', descripcion: 'Emisión de facturas' },
  {
    id: 'pagos_productores',
    nombre: 'Pagos - Productores',
    descripcion: 'Gestión de pagos a productores',
  },
  { id: 'pagos_sede', nombre: 'Pagos - Sede', descripcion: 'Control de topes de pago por sede' },
  { id: 'produccion', nombre: 'Producción', descripcion: 'Módulo de producción' },
  { id: 'bodega', nombre: 'Bodega', descripcion: 'Control de inventarios' },
  {
    id: 'instrucciones_embarque',
    nombre: 'Instrucciones de Embarque',
    descripcion: 'Gestión de embarques',
  },
  { id: 'bitacoras', nombre: 'Bitácoras', descripcion: 'Registro de operaciones' },
  { id: 'consultas', nombre: 'Consultas', descripcion: 'Reportes y consultas' },
  {
    id: 'configuracion',
    nombre: 'Configuración',
    descripcion: 'Parámetros y configuración del sistema',
  },
];

// Roles del sistema que tienen todos los permisos
const ROLES_SISTEMA = ['ADMIN', 'SUPERUSUARIO'];

const roles = ref<Rol[]>([]);
const loading = ref<boolean>(true);
const saving = ref<boolean>(false);
const selectedRol = ref<number | null>(null);
const permisos = ref<Record<string, boolean>>({});

onMounted(() => {
  void cargarRoles();
});

async function cargarRoles(): Promise<void> {
  // loading.value = true;
  // try {
  //   const { data, error } = await supabase
  //     .from('roles')
  //     .select('*')
  //     .eq('activo', true)
  //     .order('nombre_rol');
  //   if (error) throw error;
  //   roles.value = (data as Rol[]) || [];
  //   // Seleccionar el primer rol por defecto
  //   if (roles.value.length > 0) {
  //     selectedRol.value = roles.value[0].id;
  //     permisos.value = roles.value[0].permisos_json || {};
  //   }
  // } catch (error: any) {
  //   // eslint-disable-next-line no-console
  //   console.error('Error al cargar roles:', error);
  //   Notify.create({ type: 'negative', message: `Error al cargar roles: ${error?.message || 'Error desconocido'}` });
  // } finally {
  //   loading.value = false;
  // }
}

const rolSeleccionado = computed<Rol | undefined>(() =>
  roles.value.find((r) => r.id === selectedRol.value),
);

const esRolSistema = computed<boolean>(() => {
  const r = rolSeleccionado.value;
  return !!r && ROLES_SISTEMA.includes(String(r.nombre_rol).toUpperCase());
});

const rolOptions = computed(() =>
  roles.value.map((r) => ({
    value: r.id,
    label: `${r.nombre_rol}${r.descripcion ? ` - ${r.descripcion}` : ''}`,
  })),
);

function handleRolChange(rolId: number | null): void {
  if (!rolId) return;
  selectedRol.value = rolId;
  const rol = roles.value.find((r) => r.id === rolId);
  if (rol) permisos.value = rol.permisos_json || {};
}

function handlePermisoToggle(moduloId: string): void {
  const rolActual = rolSeleccionado.value;

  if (rolActual && ROLES_SISTEMA.includes(String(rolActual.nombre_rol).toUpperCase())) {
    Notify.create({
      type: 'warning',
      message: 'Los roles del sistema tienen todos los permisos por defecto',
    });
    return;
  }

  permisos.value = {
    ...permisos.value,
    [moduloId]: !permisos.value[moduloId],
  };
}

async function handleGuardarPermisos(): Promise<void> {
  if (!selectedRol.value) {
    Notify.create({ type: 'negative', message: 'Por favor selecciona un rol' });
    return;
  }

  const rolActual = rolSeleccionado.value;
  if (rolActual && ROLES_SISTEMA.includes(String(rolActual.nombre_rol).toUpperCase())) {
    Notify.create({
      type: 'warning',
      message: 'No se pueden modificar los permisos de roles del sistema',
    });
    return;
  }

  saving.value = true;
  try {
    // const { error } = await supabase
    //   .from('roles')
    //   .update({ permisos_json: permisos.value })
    //   .eq('id', selectedRol.value);
    // if (error) throw error;
    // Notify.create({ type: 'positive', message: 'Permisos guardados correctamente' });
    // // Actualizar el estado local
    // roles.value = roles.value.map((r) =>
    //   r.id === selectedRol.value ? { ...r, permisos_json: permisos.value } : r,
    // );
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Error al guardar permisos:', error);
    Notify.create({
      type: 'negative',
      message: `Error al guardar: ${error?.message || 'Error desconocido'}`,
    });
  } finally {
    saving.value = false;
  }
}

function handleResetearPermisos(): void {
  const rolActual = rolSeleccionado.value;
  if (rolActual) {
    permisos.value = rolActual.permisos_json || {};
    Notify.create({ type: 'info', message: 'Permisos restablecidos' });
  }
}

function handleActivarTodos(): void {
  const rolActual = rolSeleccionado.value;
  if (rolActual && ROLES_SISTEMA.includes(String(rolActual.nombre_rol).toUpperCase())) {
    Notify.create({
      type: 'warning',
      message: 'Los roles del sistema ya tienen todos los permisos',
    });
    return;
  }

  const todosActivos = MODULOS_SISTEMA.reduce<Record<string, boolean>>((acc, modulo) => {
    acc[modulo.id] = true;
    return acc;
  }, {});
  permisos.value = todosActivos;
  Notify.create({ type: 'info', message: 'Todos los permisos activados' });
}

function handleDesactivarTodos(): void {
  const rolActual = rolSeleccionado.value;
  if (rolActual && ROLES_SISTEMA.includes(String(rolActual.nombre_rol).toUpperCase())) {
    Notify.create({
      type: 'warning',
      message: 'No se pueden desactivar los permisos de roles del sistema',
    });
    return;
  }

  const todosInactivos = MODULOS_SISTEMA.reduce<Record<string, boolean>>((acc, modulo) => {
    acc[modulo.id] = false;
    return acc;
  }, {});
  permisos.value = todosInactivos;
  Notify.create({ type: 'info', message: 'Todos los permisos desactivados' });
}

const permisosActivos = computed<number>(
  () => Object.values(permisos.value).filter((p) => p === true).length,
);

const modulosRows = computed(() =>
  MODULOS_SISTEMA.map((m) => ({
    ...m,
    tienePermiso: esRolSistema.value ? true : permisos.value[m.id] || false,
  })),
);

const columns = [
  {
    name: 'nombre',
    label: 'Módulo / Pantalla',
    field: 'nombre',
    align: 'left' as const,
    sortable: false,
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'descripcion',
    align: 'left' as const,
    sortable: false,
  },
  {
    name: 'acceso',
    label: 'Acceso',
    field: 'tienePermiso',
    align: 'center' as const,
    sortable: false,
    style: 'width: 120px',
  },
];
</script>
