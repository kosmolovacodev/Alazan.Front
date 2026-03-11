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
      <q-tab name="productores" icon="people" label="Productores" />
      <q-tab name="silos-calibre" icon="storage" label="Silos Calibre" />
      <q-tab name="silos-pulmon" icon="warehouse" label="Silos Pulmón" />
      <q-tab name="bodegas" icon="store" label="Almacenes" />
      <q-tab name="trenes" icon="precision_manufacturing" label="Trenes" />
      <!-- Solo visible para Admin General (sede_id = 0) -->
      <q-tab v-if="esAdminGlobal" name="sedes" icon="domain" label="Bodegas" />
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

            <template v-else-if="tab === 'productores'">
              <div class="col-12 col-md-3">
                <q-input v-model="form.nombre" dense outlined label="Nombre *" />
              </div>
              <div class="col-12 col-md-2">
                <q-select
                  v-model="form.tipo_persona"
                  :options="['Fisica', 'Moral']"
                  dense outlined label="Tipo persona"
                />
              </div>
              <div class="col-12 col-md-2">
                <q-input v-model="form.rfc" dense outlined label="RFC" />
              </div>
              <div class="col-12 col-md-2">
                <q-input v-model="form.telefono" dense outlined label="Teléfono" />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="form.correo" dense outlined label="Correo" />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="form.banco_id"
                  :options="listaBancos"
                  option-value="id"
                  option-label="nombre"
                  emit-value map-options
                  dense outlined label="Banco" clearable
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="form.cuenta_clabe" dense outlined label="Cuenta / CLABE" />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="form.atiende" dense outlined label="Atiende / Contacto" />
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

            <template v-else-if="tab === 'trenes'">
              <div class="col">
                <q-input v-model="form.nombre" dense outlined label="Nombre del Tren (Ej: Tren 1)" />
              </div>
            </template>

            <template v-else-if="tab === 'sedes'">
              <div class="col">
                <q-input v-model="form.nombre" dense outlined label="Nombre de la Bodega" />
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
                :disable="importando"
                @click="agregar"
              />
              <q-btn
                v-if="!editandoId && tab === 'productores'"
                color="teal-7"
                icon="upload_file"
                label="Importar XLSX"
                class="q-ml-sm"
                :loading="importando"
                :disable="importando"
                @click="abrirImportador"
              >
                <template v-slot:loading>
                  <q-spinner-dots size="20px" />
                  <span class="q-ml-sm">Importando...</span>
                </template>
              </q-btn>
              <q-btn
                v-if="!editandoId && tab === 'productores'"
                color="green-8"
                icon="download"
                label="Exportar XLSX"
                class="q-ml-sm"
                :disable="importando"
                @click="exportarProductoresXlsx"
              />
          </div>
          <!-- Buscador productores -->
          <div v-if="tab === 'productores'" class="row q-col-gutter-sm items-center q-mt-sm">
            <div class="col">
              <q-input
                v-model="busquedaProductores"
                dense
                outlined
                clearable
                label="Buscar por nombre, RFC, correo o razón social"
                debounce="400"
                @update:model-value="onBusquedaProductores"
              >
                <template v-slot:prepend><q-icon name="search" /></template>
              </q-input>
            </div>
          </div>
          </div>
        </div>

        <!-- Input oculto para seleccionar archivo xlsx -->
        <input
          ref="fileInputRef"
          type="file"
          accept=".xlsx,.xls"
          style="display:none"
          @change="procesarArchivoXlsx"
        />

        <q-table
          :rows="lista"
          :columns="columnas"
          row-key="id"
          flat
          bordered
          :loading="loading"
          dense
          v-model:pagination="paginacion"
          :rows-per-page-options="tab === 'productores' ? [10, 20, 50] : [0]"
          @request="onRequest"
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
import { Notify, Dialog } from 'quasar';
import type { QTableColumn } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import * as XLSX from 'xlsx';

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
  // Productores
  rfc?: string;
  correo?: string;
  tipo_persona?: string;
  banco_id?: number | null;
  nombreBanco?: string;
  cuenta_clabe?: string;
  atiende?: string;
}

// Estado
const tab = ref('granos');
const loading = ref(false);
const lista = ref<RegistroCatalogo[]>([]);
const editandoId = ref<string | number | null>(null);

// Paginación (server-side para productores, sin límite para el resto)
const paginacion = ref({
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
});
const busquedaProductores = ref('');

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
  // Productores
  rfc: '',
  correo: '',
  tipo_persona: 'Fisica' as string | null,
  banco_id: null as number | null,
  cuenta_clabe: '',
  atiende: '',
});

// Lista de calibres para el selector de Silos Calibre
const listaCalibresSilos = ref<{ id: number; nombre: string }[]>([]);

// Lista de granos para el selector de Calibres
const listaGranos = ref<{ id: number; nombre: string }[]>([]);

// Lista de bancos para el selector de Productores
const listaBancos = ref<{ id: number; nombre: string }[]>([]);

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
    case 'productores':
      return [
        { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
        { name: 'tipo_persona', label: 'Tipo', field: 'tipo_persona', align: 'center' },
        { name: 'rfc', label: 'RFC', field: 'rfc', align: 'left' },
        { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' },
        { name: 'correo', label: 'Correo', field: 'correo', align: 'left' },
        { name: 'nombreBanco', label: 'Banco', field: 'nombreBanco', align: 'left' },
        { name: 'cuenta_clabe', label: 'Cuenta / CLABE', field: 'cuenta_clabe', align: 'left' },
        { name: 'atiende', label: 'Atiende', field: 'atiende', align: 'left' },
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
        {
          name: 'granoNombre',
          label: 'Tipo de Grano',
          field: 'granoNombre',
          align: 'left',
          sortable: true,
        },
        ...baseActions,
      ];
    case 'trenes':
      return [
        { name: 'nombre', label: 'Tren', field: 'nombre', align: 'left', sortable: true },
        ...baseActions,
      ];
    case 'sedes':
      return [
        { name: 'nombre', label: 'Bodega', field: 'nombre', align: 'left' },
        { name: 'ciudad', label: 'Ciudad', field: 'ciudad', align: 'left' },
        { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
        { name: 'tope_diario', label: 'Tope Diario', field: 'tope_diario', align: 'right' },
        ...baseActions,
      ];
    default:
      return [];
  }
});

const cargarDatos = async (page = 1) => {
  loading.value = true;
  try {
    if (tab.value === 'productores') {
      // Server-side pagination + búsqueda
      const { data } = await api.get('/api/catalogos/productores', {
        params: {
          sedeId: authStore.sedeActivaId,
          page,
          pageSize: paginacion.value.rowsPerPage,
          search: busquedaProductores.value,
        },
      });
      const resp = data as { items: RegistroCatalogo[]; total: number };
      lista.value = resp.items;
      paginacion.value.rowsNumber = resp.total;
      paginacion.value.page = page;

      // Cargar bancos para el selector
      if (!listaBancos.value.length) {
        const { data: bancos } = await api.get('/api/catalogos/bancos', {
          params: { sedeId: authStore.sedeActivaId },
        });
        listaBancos.value = (bancos as { activo: boolean; id: number; nombre: string }[]).filter((b) => b.activo);
      }
    } else {
      // Carga completa para el resto de catálogos (son pequeños)
      const { data } = await api.get(`/api/catalogos/${tab.value}`, {
        params: { sede_id: authStore.sedeActivaId },
      });
      lista.value = data as RegistroCatalogo[];

      if (tab.value === 'silos-calibre') {
        const { data: calibres } = await api.get('/api/catalogos/calibres', {
          params: { sede_id: authStore.sedeActivaId },
        });
        listaCalibresSilos.value = (calibres as { activo: boolean; id: number; nombre: string }[]).filter((c) => c.activo);
      }
      if (tab.value === 'calibres' || tab.value === 'bodegas') {
        const { data: granos } = await api.get('/api/catalogos/granos', {
          params: { sede_id: authStore.sedeActivaId },
        });
        listaGranos.value = (granos as { activo: boolean; id: number; nombre: string }[]).filter((g) => g.activo);
      }
    }
  } catch (error) {
    console.error(error);
    Notify.create({ type: 'negative', message: 'Error al cargar datos' });
  } finally {
    loading.value = false;
  }
};

// Handler del q-table para cambios de página/tamaño
function onRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
  paginacion.value.rowsPerPage = props.pagination.rowsPerPage;
  void cargarDatos(props.pagination.page);
}

// Handler del buscador (reinicia a página 1)
function onBusquedaProductores() {
  void cargarDatos(1);
}

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
    rfc: row.rfc || '',
    correo: row.correo || '',
    tipo_persona: row.tipo_persona || 'Fisica',
    banco_id: row.banco_id ?? null,
    cuenta_clabe: row.cuenta_clabe || '',
    atiende: row.atiende || '',
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
    rfc: '',
    correo: '',
    tipo_persona: 'Fisica',
    banco_id: null,
    cuenta_clabe: '',
    atiende: '',
  };
}

// ── IMPORTAR XLSX ──────────────────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null);
const importando = ref(false);

function abrirImportador() {
  fileInputRef.value?.click();
}

// Normaliza texto para comparar nombres de banco (sin acentos, mayúsculas)
function normalizar(texto: string): string {
  return (texto ?? '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Infiere tipo_persona desde la longitud del RFC mexicano
// Moral = 12 chars (3 letras + 6 dígitos + 3 homoclave)
// Física = 13 chars (4 letras + 6 dígitos + 3 homoclave)
function inferirTipoPersona(rfc: string): string {
  const r = (rfc ?? '').trim();
  if (!r) return 'Fisica';
  return r.length <= 12 ? 'Moral' : 'Fisica';
}

// Repara strings con bytes UTF-8 interpretados como Windows-1252
// (Ej: "ZUÃ'IGA" → "ZUÑIGA")
function repairEncoding(str: string): string {
  // Mapeo inverso: Unicode → byte Windows-1252 para el rango 0x80-0x9F
  const cp1252Reverse = new Map<number, number>([
    [0x20AC, 0x80], [0x201A, 0x82], [0x0192, 0x83], [0x201E, 0x84],
    [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02C6, 0x88],
    [0x2030, 0x89], [0x0160, 0x8A], [0x2039, 0x8B], [0x0152, 0x8C],
    [0x017D, 0x8E], [0x2018, 0x91], [0x2019, 0x92], [0x201C, 0x93],
    [0x201D, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
    [0x02DC, 0x98], [0x2122, 0x99], [0x0161, 0x9A], [0x203A, 0x9B],
    [0x0153, 0x9C], [0x017E, 0x9E], [0x0178, 0x9F],
  ]);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const cp = str.charCodeAt(i);
    bytes[i] = cp1252Reverse.get(cp) ?? (cp < 256 ? cp : 0x3F);
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return str;
  }
}

// Convierte unknown a string primitivo de forma segura (evita [object Object])
function toStr(val: unknown): string {
  if (val == null) return '';
  if (typeof val === 'string') return repairEncoding(val);
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return '';
}

// Convierte serial de fecha Excel a string ISO (yyyy-mm-dd)
function excelSerialToDate(serial: unknown): string | null {
  const n = Number(serial);
  if (!n || isNaN(n)) return null;
  return new Date(Math.round((n - 25569) * 86400 * 1000)).toISOString().split('T')[0] ?? null;
}

// Convierte valores que pueden venir en notación científica a string limpio
function toStringNumerico(raw: unknown): string | null {
  if (raw === '' || raw == null) return null;
  const n = Number(raw);
  return isNaN(n) ? toStr(raw).trim() || null : Math.round(n).toString();
}

// Convierte "TRUE"/"FALSE"/true/false a boolean o null
function toBool(val: unknown): boolean | null {
  if (val === '' || val == null) return null;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toUpperCase() === 'TRUE';
  return null;
}

async function procesarArchivoXlsx(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  input.value = '';

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]!]!;
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });

    if (rows.length < 2) {
      Notify.create({ type: 'warning', message: 'El archivo no contiene datos' });
      return;
    }

    const headers = (rows[0] as string[]).map((h) => normalizar(String(h)));
    const col = (nombre: string) => headers.indexOf(normalizar(nombre));

    const iNumero       = col('Numero');
    const iCodigo       = col('Codigo Proveedor');
    const iNombre       = col('Nombre Proveedor');
    const iRfc          = col('RFC/RUC/CI');
    const iContacto     = col('Contacto');
    const iDir1         = col('Direccion 1');
    const iDir2         = col('Direccion 2');
    const iPais         = col('Pais');
    const iEstado       = col('Estado');
    const iCiudad       = col('Ciudad');
    const iSector       = col('Sector');
    const iCP           = col('Codigo Postal');
    const iTelef1       = col('Telef. 1');
    const iTelef2       = col('Telef. 2');
    const iEmail        = col('E - mail');
    const iFax          = col('Fax');
    const iTermino      = col('Termino pago');
    const iLimCred      = col('Limite Credito');
    const iLimCred2     = col('Limite credito 2da moneda');
    const iTipoP        = col('Codigo Tipo Proveedor');
    const iMoneda       = col('Cod. Moneda');
    const iZona         = col('Cod. Zona');
    const iMemo         = col('Memo');
    const iLocalizacion = col('Localizacion');
    const iNombreAlt    = col('Nombre Alterno');
    const iSucursal     = col('Sucursal');
    const iCtaPagar     = col('Cuenta Contable x Pagar');
    const iBanco        = col('Nombre de banco');
    const iCuenta1      = col('Cuenta bancaria 1');
    const iCuenta2      = col('Cuenta bancaria 2');
    const iSwift        = col('aba swift');
    const iBenef        = col('Beneficiario');
    const iCodTransf    = col('Codigo tarnsferencoa proveedor');
    const iCodTrans     = col('Codigo  transaccion');
    const iDef1         = col('Definible transferecnia1');
    const iDef2         = col('Definible transferecnia2');
    const iDef3         = col('Definible transferecnia3');
    const iRetenciones  = col('Retenciones');
    const iImpuestos    = col('Impuestos');
    const iRelacionada  = col('Relacionada');
    const iUsarNombre   = col('Usar Nombre Alterno en impresion (Campo 25)');
    const iNumExt       = col('Numero Exterior');
    const iNumInt       = col('Numero Interior');
    const iColonia      = col('Colonia');
    const iLocalidad    = col('Localidad');
    const iMonedaUnica  = col('Moneda Unica');
    const iProvGlobal   = col('Proveedor Global');
    const iGrupoImp     = col('Grupo de Impuestos');
    const iRegimen      = col('Codigo del Regimen Fiscal');
    const iFechaCrea    = col('Fecha de Creacion del Registro');
    const iCtaAnticipo  = col('Cuenta Contable Anticipo');

    if (iNombre === -1) {
      Notify.create({ type: 'negative', message: 'El archivo no tiene la columna "Nombre Proveedor"' });
      return;
    }

    const mapaBancos = new Map<string, number>();
    listaBancos.value.forEach((b) => mapaBancos.set(normalizar(b.nombre), b.id));

    const productores = rows.slice(1)
      .filter((row: unknown[]) => toStr(row[iNombre]).trim() !== '')
      .map((row: unknown[]) => {
        const rfcRaw = toStr(row[iRfc]).trim();
        return {
          // Originales
          Nombre:       toStr(row[iNombre]).trim(),
          Rfc:          rfcRaw || null,
          Atiende:      toStr(row[iContacto]).trim() || null,
          Telefono:     toStr(row[iTelef1]).trim() || null,
          Correo:       toStr(row[iEmail]).trim() || null,
          Banco_id:     mapaBancos.get(normalizar(toStr(row[iBanco]))) ?? null,
          Cuenta_clabe: toStringNumerico(row[iCuenta1]),
          Tipo_persona: inferirTipoPersona(rfcRaw),
          // MBA3 - Identificadores
          Numero_erp:          row[iNumero] !== '' ? Number(row[iNumero]) || null : null,
          Codigo_proveedor:    toStringNumerico(row[iCodigo]),
          // MBA3 - Dirección
          Direccion1:          toStr(row[iDir1]).trim() || null,
          Direccion2:          toStr(row[iDir2]).trim() || null,
          Pais:                toStr(row[iPais]).trim() || null,
          Estado:              toStr(row[iEstado]).trim() || null,
          Ciudad:              toStr(row[iCiudad]).trim() || null,
          Sector:              toStr(row[iSector]).trim() || null,
          Codigo_postal:       toStringNumerico(row[iCP]),
          Numero_exterior:     toStr(row[iNumExt]).trim() || null,
          Numero_interior:     toStr(row[iNumInt]).trim() || null,
          Colonia:             toStr(row[iColonia]).trim() || null,
          Localidad:           toStr(row[iLocalidad]).trim() || null,
          // MBA3 - Contacto extra
          Telefono2:           toStr(row[iTelef2]).trim() || null,
          Fax:                 toStr(row[iFax]).trim() || null,
          // MBA3 - Legal
          Nombre_alterno:      toStr(row[iNombreAlt]).trim() || null,
          Sucursal:            toStr(row[iSucursal]).trim() || null,
          Localizacion:        toStr(row[iLocalizacion]).trim() || null,
          Regimen_fiscal:      toStr(row[iRegimen]).trim() || null,
          // MBA3 - Comercial
          Termino_pago:        row[iTermino] !== '' ? Number(row[iTermino]) || null : null,
          Limite_credito:      row[iLimCred] !== '' ? Number(row[iLimCred]) || null : null,
          Limite_credito2:     row[iLimCred2] !== '' ? Number(row[iLimCred2]) || null : null,
          Codigo_tipo_proveedor: toStr(row[iTipoP]).trim() || null,
          Codigo_moneda:       toStr(row[iMoneda]).trim() || null,
          Codigo_zona:         toStr(row[iZona]).trim() || null,
          Moneda_unica:        toBool(row[iMonedaUnica]),
          Proveedor_global:    toBool(row[iProvGlobal]),
          Usar_nombre_alterno: toBool(row[iUsarNombre]),
          Relacionada:         toBool(row[iRelacionada]),
          // MBA3 - Fiscal
          Retenciones:         toStr(row[iRetenciones]).trim() || null,
          Impuestos:           toStr(row[iImpuestos]).trim() || null,
          Grupo_impuestos:     toStr(row[iGrupoImp]).trim() || null,
          // MBA3 - Contabilidad
          Cuenta_contable_pagar:    toStringNumerico(row[iCtaPagar]),
          Cuenta_contable_anticipo: toStringNumerico(row[iCtaAnticipo]),
          // MBA3 - Bancario extra
          Cuenta_bancaria2:         toStr(row[iCuenta2]).trim() || null,
          Aba_swift:                toStringNumerico(row[iSwift]),
          Beneficiario:             toStr(row[iBenef]).trim() || null,
          Codigo_transferencia:     toStringNumerico(row[iCodTransf]),
          Codigo_transaccion:       toStringNumerico(row[iCodTrans]),
          Definible_transferencia1: toStringNumerico(row[iDef1]),
          Definible_transferencia2: toStringNumerico(row[iDef2]),
          Definible_transferencia3: toStringNumerico(row[iDef3]),
          // MBA3 - Notas y metadata
          Memo:               toStr(row[iMemo]).trim() || null,
          Fecha_creacion_erp: excelSerialToDate(row[iFechaCrea]),
        };
      });

    if (productores.length === 0) {
      Notify.create({ type: 'warning', message: 'No se encontraron filas con datos válidos' });
      return;
    }

    const enviarImportacion = async () => {
      importando.value = true;
      try {
        const { data } = await api.post('/api/catalogos/productores/importar', productores, {
          params: { sedeId: authStore.sedeActivaId },
        });
        await cargarDatos();
        Notify.create({
          type: 'positive',
          message: `${(data as { insertados: number }).insertados} productores procesados (nuevos/actualizados)`,
        });
      } catch {
        Notify.create({ type: 'negative', message: 'Error al importar' });
      } finally {
        importando.value = false;
      }
    };

    Dialog.create({
      title: 'Importar productores',
      message: `Se procesarán <strong>${productores.length}</strong> productores (UPSERT por RFC). ¿Continuar?`,
      html: true,
      cancel: { flat: true, label: 'Cancelar' },
      ok: { color: 'teal-7', label: 'Importar' },
    }).onOk(() => { void enviarImportacion(); });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al leer el archivo XLSX' });
  }
}

function exportarProductoresXlsx() {
  if (!lista.value.length) {
    Notify.create({ type: 'warning', message: 'No hay datos para exportar' });
    return;
  }
  const datos = lista.value.map((p) => {
    const r = p as Record<string, unknown>;
    return {
      'ID':                    p.id,
      'Código Proveedor':      r['codigo_proveedor'] ?? '',
      'Número ERP':            r['numero_erp'] ?? '',
      'Nombre':                p.nombre ?? '',
      'Nombre Alterno':        r['nombre_alterno'] ?? '',
      'RFC':                   p.rfc ?? '',
      'Tipo Persona':          p.tipo_persona ?? '',
      'Régimen Fiscal':        r['regimen_fiscal'] ?? '',
      'Teléfono 1':            p.telefono ?? '',
      'Teléfono 2':            r['telefono2'] ?? '',
      'Fax':                   r['fax'] ?? '',
      'Correo':                p.correo ?? '',
      'Atiende':               p.atiende ?? '',
      'Banco':                 p.nombreBanco ?? '',
      'Cuenta / CLABE':        p.cuenta_clabe ?? '',
      'Cuenta Bancaria 2':     r['cuenta_bancaria2'] ?? '',
      'ABA/SWIFT':             r['aba_swift'] ?? '',
      'Beneficiario':          r['beneficiario'] ?? '',
      'Cód. Transferencia':    r['codigo_transferencia'] ?? '',
      'Cód. Transacción':      r['codigo_transaccion'] ?? '',
      'Def. Transferencia 1':  r['definible_transferencia1'] ?? '',
      'Def. Transferencia 2':  r['definible_transferencia2'] ?? '',
      'Def. Transferencia 3':  r['definible_transferencia3'] ?? '',
      'Dirección 1':           r['direccion1'] ?? '',
      'Dirección 2':           r['direccion2'] ?? '',
      'Núm. Exterior':         r['numero_exterior'] ?? '',
      'Núm. Interior':         r['numero_interior'] ?? '',
      'Colonia':               r['colonia'] ?? '',
      'Ciudad':                r['ciudad'] ?? '',
      'Estado':                r['estado'] ?? '',
      'CP':                    r['codigo_postal'] ?? '',
      'País':                  r['pais'] ?? '',
      'Localidad':             r['localidad'] ?? '',
      'Sector':                r['sector'] ?? '',
      'Sucursal':              r['sucursal'] ?? '',
      'Localización':          r['localizacion'] ?? '',
      'Tipo Proveedor':        r['codigo_tipo_proveedor'] ?? '',
      'Moneda':                r['codigo_moneda'] ?? '',
      'Zona':                  r['codigo_zona'] ?? '',
      'Término Pago':          r['termino_pago'] ?? '',
      'Límite Crédito':        r['limite_credito'] ?? '',
      'Límite Crédito 2':      r['limite_credito2'] ?? '',
      'Moneda Única':          r['moneda_unica'] ?? '',
      'Proveedor Global':      r['proveedor_global'] ?? '',
      'Usar Nombre Alterno':   r['usar_nombre_alterno'] ?? '',
      'Relacionada':           r['relacionada'] ?? '',
      'Retenciones':           r['retenciones'] ?? '',
      'Impuestos':             r['impuestos'] ?? '',
      'Grupo Impuestos':       r['grupo_impuestos'] ?? '',
      'Cta. Contable x Pagar': r['cuenta_contable_pagar'] ?? '',
      'Cta. Contable Anticipo':r['cuenta_contable_anticipo'] ?? '',
      'Memo':                  r['memo'] ?? '',
      'Fecha Creación ERP':    r['fecha_creacion_erp'] ?? '',
      'Activo':                p.activo ? 'Sí' : 'No',
    };
  });

  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Productores');
  XLSX.writeFile(wb, `Productores_${new Date().toISOString().split('T')[0]}.xlsx`);
}
// ───────────────────────────────────────────────────────────────────────────

watch(
  () => authStore.sedeActivaId,
  () => {
    void cargarDatos();
  },
);

watch(tab, () => {
  resetForm();
  busquedaProductores.value = '';
  paginacion.value = { page: 1, rowsPerPage: 20, rowsNumber: 0 };
  void cargarDatos(1);
});

onMounted(() => void cargarDatos());
</script>
