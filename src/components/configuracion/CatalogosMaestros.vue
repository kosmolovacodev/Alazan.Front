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
      <q-tab name="sedes" icon="domain" label="Sedes" />
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
                <q-input v-model="form.tope_diario" dense outlined label="Tope Diario" type="number" />
              </div>
            </template>

            <div class="col-auto">
              <q-btn color="orange-9" icon="add" label="Agregar" @click="agregar" />
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
              <q-btn flat dense round color="negative" icon="delete" @click="eliminar(props.row.id)" />
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
}

// Estado
const tab = ref('granos');
const loading = ref(false);
const lista = ref<RegistroCatalogo[]>([]);

const form = ref({
  nombre: '',
  requiere_analisis: false,
  telefono: '',
  municipio: '',
  estado: '',
  region: '',
  codigo: '',
  ciudad: '',
  tope_diario: 0
});

// Columnas Computadas
const columnas = computed<QTableColumn[]>(() => {
  const baseActions: QTableColumn[] = [
    { name: 'activo', label: 'Activo', field: 'activo', align: 'center' },
    { name: 'acciones', label: 'Acciones', field: 'id', align: 'center' }
  ];

  switch (tab.value) {
    case 'granos':
      return [
        { name: 'nombre', label: 'Grano', field: 'nombre', align: 'left', sortable: true },
        { name: 'requiere_analisis', label: 'Análisis', field: 'requiere_analisis', align: 'center' },
        ...baseActions
      ];
    case 'calibres':
      return [
        { name: 'nombre', label: 'Calibre', field: 'nombre', align: 'left' },
        ...baseActions
      ];
    case 'compradores':
      return [
        { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
        { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' },
        ...baseActions
      ];
    case 'origenes':
      return [
        { name: 'municipio', label: 'Municipio', field: 'municipio', align: 'left' },
        { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
        { name: 'region', label: 'Región', field: 'region', align: 'left' },
        ...baseActions
      ];
    case 'bancos':
      return [
        { name: 'nombre', label: 'Banco', field: 'nombre', align: 'left' },
        { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
        ...baseActions
      ];
    case 'sedes':
      return [
        { name: 'nombre', label: 'Sede', field: 'nombre', align: 'left' },
        { name: 'ciudad', label: 'Ciudad', field: 'ciudad', align: 'left' },
        { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
        { name: 'tope_diario', label: 'Tope Diario', field: 'tope_diario', align: 'right' },
        ...baseActions
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
        sede_id: authStore.sedeActivaId // <--- Enviamos el parámetro que el Controller espera
      }
    });
    lista.value = data;
  } catch (error) {
    console.error(error);
    Notify.create({ type: 'negative', message: 'Error al cargar datos' });
  } finally {
    loading.value = false;
  }
};

async function agregar() {
  if (tab.value !== 'origenes' && !form.value.nombre) return;

  try {
    // AL GUARDAR, incluimos la sede activa en el payload
    const payload = {
      ...form.value,
      sede_id: authStore.sedeActivaId
    };

    await api.post(`/api/catalogos/${tab.value}`, payload);
    resetForm();
    await cargarDatos();
    Notify.create({ type: 'positive', message: 'Agregado correctamente' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al guardar' });
  }
}

async function actualizarEstado(row: RegistroCatalogo) {
  try {
    await api.put(`/api/catalogos/${tab.value}/${row.id}`, row);
  } catch {
    Notify.create({ type: 'negative', message: 'Error al actualizar' });
    await cargarDatos();
  }
}

async function eliminar(id: string | number) {
  try {
    await api.delete(`/api/catalogos/${tab.value}/${id}`);
    await cargarDatos();
    Notify.create({ type: 'positive', message: 'Eliminado con éxito' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al eliminar' });
  }
}

function resetForm() {
  form.value = {
    nombre: '', requiere_analisis: false, telefono: '',
    municipio: '', estado: '', region: '',
    codigo: '', ciudad: '', tope_diario: 0
  };
}

watch(() => authStore.sedeActivaId, () => {
  void cargarDatos();
});

watch(tab, () => {
  resetForm();
  void cargarDatos();
});

onMounted(() => void cargarDatos());
</script>
