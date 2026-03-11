<template>
  <div class="q-gutter-y-md">
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="left"
      narrow-indicator
    >
      <q-tab name="tipo-proceso"   icon="category"       label="Tipo Proceso" />
      <q-tab name="presentacion"   icon="inventory_2"    label="Presentación" />
      <q-tab name="bloque-insumos" icon="handyman"       label="Bloque Insumos" />
      <q-tab name="subproducto"    icon="recycling"      label="Subproductos" />
      <q-tab name="desecho"        icon="delete_outline" label="Desechos" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel :name="tab" class="q-pa-none">
        <div class="q-pa-md bg-grey-1 q-mb-md bordered rounded-borders">
          <div class="row q-col-gutter-sm items-center">
            <div class="col">
              <q-input v-model="form.nombre" dense outlined :label="labelNombre" />
            </div>
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
          :rows-per-page-options="[0]"
        >
          <template #body-cell-activo="props">
            <q-td align="center">
              <q-toggle
                v-model="props.row.activo"
                color="green"
                @update:model-value="toggleActivo(props.row)"
              />
            </q-td>
          </template>
          <template #body-cell-acciones="props">
            <q-td align="center">
              <q-btn flat dense round color="primary" icon="edit" class="q-mr-xs"
                @click="iniciarEdicion(props.row)" />
              <q-btn flat dense round color="negative" icon="delete"
                @click="eliminar(props.row.id)" />
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import type { QTableColumn } from 'quasar';

interface Item { id: number; nombre: string; activo: boolean }

const tab = ref('tipo-proceso');
const loading = ref(false);
const lista = ref<Item[]>([]);
const editandoId = ref<number | null>(null);
const form = ref({ nombre: '' });

const labelNombre = computed(() => {
  const labels: Record<string, string> = {
    'tipo-proceso':   'Tipo de Proceso (Ej: Limpia)',
    'presentacion':   'Presentación (Ej: 25kg)',
    'bloque-insumos': 'Insumo (Ej: Costales)',
    'subproducto':    'Subproducto (Ej: Granillo Calibrador)',
    'desecho':        'Desecho (Ej: Terrón)',
  };
  return labels[tab.value] ?? 'Nombre';
});

const columnas = computed<QTableColumn[]>(() => [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'activo', label: 'Activo', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'center' },
]);

async function cargar() {
  loading.value = true;
  try {
    const { data } = await api.get(`/api/produccion-catalogos/${tab.value}`);
    lista.value = data as Item[];
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar datos' });
  } finally {
    loading.value = false;
  }
}

async function agregar() {
  if (!form.value.nombre.trim()) {
    Notify.create({ type: 'warning', message: 'El nombre es requerido' });
    return;
  }
  try {
    await api.post(`/api/produccion-catalogos/${tab.value}`, { nombre: form.value.nombre });
    form.value.nombre = '';
    await cargar();
    Notify.create({ type: 'positive', message: 'Agregado correctamente' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al guardar' });
  }
}

async function toggleActivo(row: Item) {
  try {
    await api.put(`/api/produccion-catalogos/${tab.value}/${row.id}`, { nombre: row.nombre, activo: row.activo });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al actualizar' });
    await cargar();
  }
}

function iniciarEdicion(row: Item) {
  editandoId.value = row.id;
  form.value.nombre = row.nombre;
}

async function guardarEdicion() {
  try {
    await api.put(`/api/produccion-catalogos/${tab.value}/${editandoId.value}`, { nombre: form.value.nombre, activo: true });
    cancelarEdicion();
    await cargar();
    Notify.create({ type: 'positive', message: 'Actualizado correctamente' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al actualizar' });
  }
}

function cancelarEdicion() {
  editandoId.value = null;
  form.value.nombre = '';
}

async function eliminar(id: number) {
  try {
    await api.delete(`/api/produccion-catalogos/${tab.value}/${id}`);
    await cargar();
    Notify.create({ type: 'positive', message: 'Eliminado con éxito' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al eliminar' });
  }
}

watch(tab, () => {
  editandoId.value = null;
  form.value.nombre = '';
  void cargar();
});

onMounted(() => void cargar());
</script>
