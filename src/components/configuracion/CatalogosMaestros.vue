<template>
  <div class="q-gutter-y-md">
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="granos" icon="agriculture" label="Granos" />
      <q-tab name="calibres" icon="straighten" label="Calibres" />
      <q-tab name="compradores" icon="handshake" label="Compradores" />
      <q-tab name="origenes" icon="map" label="Orígenes" />
      <q-tab name="bancos" icon="account_balance" label="Bancos" />
      <q-tab name="silos-calibre" icon="storage" label="Silos Calibre" />
      <q-tab name="silos-pulmon" icon="warehouse" label="Silos Pulmón" />
      <q-tab name="bodegas" icon="store" label="Bodegas" />
      <!-- Solo visible para Admin General (sede_id = 0) -->
      <q-tab v-if="esAdminGlobal" name="sedes" icon="domain" label="Sedes" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel :name="tab" class="q-pa-none">
        <div class="q-pa-md bg-grey-1 q-mb-md bordered rounded-borders">
          <div class="row q-col-gutter-sm items-center">
            <template v-if="tab === 'granos'">
              <div class="col">
                <q-input v-model="form.nombre" dense outlined label="Nombre del Grano" />
              </div>
              <div class="col-auto row items-center">
                <q-checkbox v-model="form.requiere_analisis" label="¿Análisis?" />
              </div>
            </template>

            <template v-else-if="tab === 'calibres'">
              <div class="col">
                <q-input v-model="form.nombre" dense outlined label="Calibre (Ej: 44.01-46.00)" />
              </div>
              <div class="col">
                <q-select
                  v-model="form.grano_id"
                  :options="listaGranos"
                  option-value="id"
                  option-label="nombre"
                  emit-value
                  map-options
                  dense
                  outlined
                  label="Tipo de Grano"
                  clearable
                />
              </div>
            </template>

            <template v-else-if="tab === 'compradores'">
              <div class="col">
                <q-input v-model="form.nombre" dense outlined label="Nombre" />
              </div>
              <div class="col">
                <q-input v-model="form.telefono" dense outlined label="Teléfono" />
              </div>
            </template>

            <template v-else-if="tab === 'origenes'">
              <div class="col">
                <q-input v-model="form.municipio" dense outlined label="Municipio" />
              </div>
              <div class="col">
                <q-input v-model="form.estado" dense outlined label="Estado" />
              </div>
              <div class="col">
                <q-input v-model="form.region" dense outlined label="Región (Opcional)" />
              </div>
            </template>

            <template v-else-if="tab === 'bancos'">
              <div class="col">
                <q-input v-model="form.nombre" dense outlined label="Nombre del Banco" />
              </div>
              <div class="col">
                <q-input v-model="form.codigo" dense outlined label="Código del Banco" />
              </div>
            </template>

            <template v-else-if="tab === 'silos-calibre'">
              <div class="col">
                <q-input v-model="form.nombre" dense outlined label="Nombre del Silo" />
              </div>
              <div class="col">
                <q-select
                  v-model="form.calibre_id"
                  :options="listaCalibresSilos"
                  option-value="id"
                  option-label="nombre"
                  emit-value
                  map-options
                  dense
                  outlined
                  label="Calibre Asignado"
                  clearable
                />
              </div>
              <div class="col">
                <q-input
                  v-model.number="form.capacidad_toneladas"
                  dense
                  outlined
                  label="Capacidad (Toneladas)"
                  type="number"
                />
              </div>
              <div class="col">
                <q-input v-model="form.descripcion" dense outlined label="Descripción" />
              </div>
            </template>

            <template v-else-if="tab === 'silos-pulmon'">
              <div class="col">
                <q-input v-model="form.nombre" dense outlined label="Nombre del Silo" />
              </div>
              <div class="col">
                <q-input
                  v-model.number="form.capacidad_toneladas"
                  dense
                  outlined
                  label="Capacidad (Toneladas)"
                  type="number"
                />
              </div>
              <div class="col">
                <q-select
                  v-model="form.tipo"
                  :options="['ENTRADA', 'SALIDA', 'TEMPORAL']"
                  dense
                  outlined
                  label="Tipo de Silo"
                />
              </div>
              <div class="col">
                <q-input v-model="form.descripcion" dense outlined label="Descripción" />
              </div>
            </template>

            <template v-else-if="tab === 'bodegas'">
              <div class="col">
                <q-input v-model="form.nombre" dense outlined label="Nombre del Almacén" />
              </div>
              <div class="col">
                <q-select
                  v-model="form.grano_id"
                  :options="listaGranos"
                  option-value="id"
                  option-label="nombre"
                  emit-value
                  map-options
                  dense
                  outlined
                  label="Tipo de Grano"
                  clearable
                />
              </div>
            </template>

            <template v-else-if="tab === 'sedes'">
              <div class="col">
                <q-input v-model="form.nombre" dense outlined label="Nombre de la Sede" />
              </div>
              <div class="col">
                <q-input v-model="form.ciudad" dense outlined label="Ciudad" />
              </div>
              <div class="col">
                <q-input v-model="form.estado" dense outlined label="Estado" />
              </div>
              <div class="col">
                <q-input
                  v-model="form.tope_diario"
                  dense
                  outlined
                  label="Tope Diario"
                  type="number"
                />
              </div>
            </template>

            <div class="col-auto">
              <q-btn
                v-if="editandoId"
                color="green-8"
                icon="save"
                label="Guardar Cambios"
                @click="guardarEdicion"
              />
              <q-btn
                v-if="editandoId"
                flat
                color="grey-7"
                icon="close"
                label="Cancelar"
                class="q-ml-sm"
                @click="cancelarEdicion"
              />
              <q-btn
                v-if="!editandoId"
                color="orange-9"
                icon="add"
                label="Agregar"
                @click="agregar"
              />
            </div>
          </div>
        </div>

        <q-table
          :rows="lista"
          :columns="columnas"
          row-key="id"
          flat
          bordered
          :loading="loading"
          dense
          :pagination="{ rowsPerPage: 0 }"
        >
          <template v-slot:body-cell-activo="props">
            <q-td align="center">
              <q-toggle
                v-model="props.row.activo"
                color="green"
                @update:model-value="actualizarEstado(props.row)"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-requiere_analisis="props">
            <q-td align="center">
              <q-badge :color="props.row.requiere_analisis ? 'positive' : 'negative'">
                {{ props.row.requiere_analisis ? 'SÍ' : 'NO' }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td align="center">
              <q-btn
                flat
                dense
                round
                color="primary"
                icon="edit"
                class="q-mr-xs"
                @click="iniciarEdicion(props.row)"
              />
              <q-btn
                flat
                dense
                round
                color="negative"
                icon="delete"
                @click="eliminar(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar'; // Importación normal para código ejecutable
import type { QTableColumn } from 'quasar'; // Importación de tipo
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();

// Verificar si es Admin Global (sede_id = 0 del usuario)
const esAdminGlobal = computed(() => authStore.user?.sede_id === 0);

// Interfaces (DENTRO DEL SCRIPT)
interface RegistroCatalogo {
  id: string | number;
  nombre?: string;
  activo: boolean;
  requiere_analisis?: boolean;
  telefono?: string;
  municipio?: string;
  estado?: string;
  region?: string;
  codigo?: string;
  ciudad?: string;
  tope_diario?: number;
  calibreId?: number;
  calibreNombre?: string;
  capacidadToneladas?: number;
  descripcion?: string;
  tipo?: string;
  granoId?: number;
  granoNombre?: string;
}

// Estado
const tab = ref('granos');
const loading = ref(false);
const lista = ref<RegistroCatalogo[]>([]);
const editandoId = ref<string | number | null>(null);

const form = ref({
  nombre: '',
  requiere_analisis: false,
  telefono: '',
  municipio: '',
  estado: '',
  region: '',
  codigo: '',
  ciudad: '',
  tope_diario: 0,
  calibre_id: null as number | null,
  capacidad_toneladas: 0,
  descripcion: '',
  tipo: 'TEMPORAL',
  grano_id: null as number | null,
});

// Lista de calibres para el selector de Silos Calibre
const listaCalibresSilos = ref<{ id: number; nombre: string }[]>([]);

// Lista de granos para el selector de Calibres
const listaGranos = ref<{ id: number; nombre: string }[]>([]);

// Columnas Computadas
const columnas = computed<QTableColumn[]>(() => {
  const baseActions: QTableColumn[] = [
    { name: 'activo', label: 'Activo', field: 'activo', align: 'center' },
    { name: 'acciones', label: 'Acciones', field: 'id', align: 'center' },
  ];

  switch (tab.value) {
    case 'granos':
      return [
        { name: 'nombre', label: 'Grano', field: 'nombre', align: 'left', sortable: true },
        {
          name: 'requiere_analisis',
          label: 'Análisis',
          field: 'requiere_analisis',
          align: 'center',
        },
        ...baseActions,
      ];
    case 'calibres':
      return [
        { name: 'nombre', label: 'Calibre', field: 'nombre', align: 'left', sortable: true },
        {
          name: 'granoNombre',
          label: 'Tipo de Grano',
          field: 'granoNombre',
          align: 'left',
          sortable: true,
        },
        ...baseActions,
      ];
    case 'compradores':
      return [
        { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
        { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' },
        ...baseActions,
      ];
    case 'origenes':
      return [
        { name: 'municipio', label: 'Municipio', field: 'municipio', align: 'left' },
        { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
        { name: 'region', label: 'Región', field: 'region', align: 'left' },
        ...baseActions,
      ];
    case 'bancos':
      return [
        { name: 'nombre', label: 'Banco', field: 'nombre', align: 'left' },
        { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
        ...baseActions,
      ];
    case 'silos-calibre':
      return [
        { name: 'nombre', label: 'Silo', field: 'nombre', align: 'left', sortable: true },
        { name: 'calibreNombre', label: 'Calibre Asignado', field: 'calibreNombre', align: 'left' },
        {
          name: 'capacidadToneladas',
          label: 'Capacidad (Ton)',
          field: 'capacidadToneladas',
          align: 'right',
        },
        { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
        ...baseActions,
      ];
    case 'silos-pulmon':
      return [
        { name: 'nombre', label: 'Silo', field: 'nombre', align: 'left', sortable: true },
        {
          name: 'capacidadToneladas',
          label: 'Capacidad (Ton)',
          field: 'capacidadToneladas',
          align: 'right',
        },
        { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center' },
        { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
        ...baseActions,
      ];
    case 'bodegas':
      return [
        { name: 'nombre', label: 'Nombre Almacén', field: 'nombre', align: 'left', sortable: true },
        { name: 'granoNombre', label: 'Tipo de Grano', field: 'granoNombre', align: 'left', sortable: true },
        ...baseActions,
      ];
    case 'sedes':
      return [
        { name: 'nombre', label: 'Sede', field: 'nombre', align: 'left' },
        { name: 'ciudad', label: 'Ciudad', field: 'ciudad', align: 'left' },
        { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
        { name: 'tope_diario', label: 'Tope Diario', field: 'tope_diario', align: 'right' },
        ...baseActions,
      ];
    default:
      return [];
  }
});

const cargarDatos = async () => {
  loading.value = true;
  try {
    // 1. Usamos el authStore para obtener la sede actual
    const { data } = await api.get(`/api/catalogos/${tab.value}`, {
      params: {
        sede_id: authStore.sedeActivaId, // <--- Enviamos el parámetro que el Controller espera
      },
    });
    lista.value = data;

    // Cargar calibres para el selector de silos-calibre
    if (tab.value === 'silos-calibre') {
      const { data: calibres } = await api.get('/api/catalogos/calibres', {
        params: { sede_id: authStore.sedeActivaId },
      });
      listaCalibresSilos.value = calibres.filter((c: { activo: boolean }) => c.activo);
    }

    // Cargar granos para el selector de calibres y bodegas
    if (tab.value === 'calibres' || tab.value === 'bodegas') {
      const { data: granos } = await api.get('/api/catalogos/granos', {
        params: { sede_id: authStore.sedeActivaId },
      });
      listaGranos.value = granos.filter((g: { activo: boolean }) => g.activo);
    }
  } catch (error) {
    console.error(error);
    Notify.create({ type: 'negative', message: 'Error al cargar datos' });
  } finally {
    loading.value = false;
  }
};

// Recargar el selector de bodegas del header cuando se modifican sedes
async function refrescarSelectorSedes() {
  if (tab.value === 'sedes') {
    await authStore.cargarSedes();
  }
}

async function agregar() {
  // Validaciones específicas por catálogo
  if (tab.value === 'origenes') {
    if (!form.value.municipio) {
      Notify.create({ type: 'warning', message: 'El municipio es requerido' });
      return;
    }
  } else if (!form.value.nombre) {
    Notify.create({ type: 'warning', message: 'El nombre es requerido' });
    return;
  }

  try {
    // AL GUARDAR, incluimos la sede activa en el payload
    const payload = {
      ...form.value,
      sede_id: authStore.sedeActivaId,
    };

    await api.post(`/api/catalogos/${tab.value}`, payload);
    resetForm();
    await cargarDatos();
    await refrescarSelectorSedes();
    Notify.create({ type: 'positive', message: 'Agregado correctamente' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al guardar' });
  }
}

async function actualizarEstado(row: RegistroCatalogo) {
  try {
    await api.put(`/api/catalogos/${tab.value}/${row.id}`, row);
    await refrescarSelectorSedes();
  } catch {
    Notify.create({ type: 'negative', message: 'Error al actualizar' });
    await cargarDatos();
  }
}

async function eliminar(id: string | number) {
  try {
    await api.delete(`/api/catalogos/${tab.value}/${id}`);
    await cargarDatos();
    await refrescarSelectorSedes();
    Notify.create({ type: 'positive', message: 'Eliminado con éxito' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al eliminar' });
  }
}

function iniciarEdicion(row: RegistroCatalogo) {
  editandoId.value = row.id;
  form.value = {
    nombre: row.nombre || '',
    requiere_analisis: row.requiere_analisis || false,
    telefono: row.telefono || '',
    municipio: row.municipio || '',
    estado: row.estado || '',
    region: row.region || '',
    codigo: row.codigo || '',
    ciudad: row.ciudad || '',
    tope_diario: row.tope_diario || 0,
    calibre_id: row.calibreId ?? null,
    capacidad_toneladas: row.capacidadToneladas || 0,
    descripcion: row.descripcion || '',
    tipo: row.tipo || 'TEMPORAL',
    grano_id: row.granoId ?? null,
  };
}

async function guardarEdicion() {
  try {
    const payload = {
      ...form.value,
      sede_id: authStore.sedeActivaId,
    };
    await api.put(`/api/catalogos/editar/${tab.value}/${editandoId.value}`, payload);
    editandoId.value = null;
    resetForm();
    await cargarDatos();
    await refrescarSelectorSedes();
    Notify.create({ type: 'positive', message: 'Actualizado correctamente' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al actualizar' });
  }
}

function cancelarEdicion() {
  editandoId.value = null;
  resetForm();
}

function resetForm() {
  form.value = {
    nombre: '',
    requiere_analisis: false,
    telefono: '',
    municipio: '',
    estado: '',
    region: '',
    codigo: '',
    ciudad: '',
    tope_diario: 0,
    calibre_id: null,
    capacidad_toneladas: 0,
    descripcion: '',
    tipo: 'TEMPORAL',
    grano_id: null,
  };
}

watch(
  () => authStore.sedeActivaId,
  () => {
    void cargarDatos();
  },
);

watch(tab, () => {
  resetForm();
  void cargarDatos();
});

onMounted(() => void cargarDatos());
</script>
