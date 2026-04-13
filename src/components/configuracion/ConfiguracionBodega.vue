<template>
  <div class="q-pa-md">

    <!-- ══════════════════════════════════════════════════
         SECCIÓN 1 — UBICACIONES FÍSICAS
    ═══════════════════════════════════════════════════ -->
    <div class="section-label q-mb-md">UBICACIONES FÍSICAS DE ALMACENAMIENTO</div>
    <div class="row q-col-gutter-md q-mb-xl">

      <!-- ── Bodegas ── -->
      <div class="col-12 col-md-6">
        <div class="cat-panel">
          <!-- Encabezado -->
          <div class="cat-panel__header">
            <div class="col">
              <div class="text-subtitle2 text-weight-bold text-grey-8">Bodegas</div>
              <div class="text-caption text-grey-5">
                Identificadores de bodega usados en asignación, filtros y bitácoras FO-HC-IMP-007 / 008
              </div>
            </div>
            <q-btn
              unelevated color="orange-7" icon="add" label="+ Nueva Bodega"
              style="border-radius:8px; font-size:12px"
              @click="mostrarFormBodega = !mostrarFormBodega"
            />
          </div>

          <div class="text-caption text-grey-5 q-px-md q-pb-sm">
            Clave es el identificador corto usado en filtros, asignación y bitácoras (ej. B1)
          </div>

          <!-- Form nueva bodega -->
          <div v-if="mostrarFormBodega" class="q-mx-md q-mb-sm q-pa-md" style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px">
            <div class="row q-col-gutter-sm items-end">
              <div class="col-4">
                <div class="text-caption text-weight-bold q-mb-xs">Clave <span class="text-negative">*</span></div>
                <q-input v-model="newBodegaClave" dense outlined placeholder="Ej. B7" />
              </div>
              <div class="col-8">
                <div class="text-caption text-weight-bold q-mb-xs">Descripción</div>
                <q-input v-model="newBodegaNombre" dense outlined placeholder="Ej. Bodega Exterior" @keyup.enter="agregarBodega" />
              </div>
            </div>
            <div class="row q-gutter-sm q-mt-sm">
              <q-btn unelevated color="orange-7" icon="check" label="Guardar" style="border-radius:6px" @click="agregarBodega" />
              <q-btn flat color="grey-7" label="Cancelar" @click="cancelarFormBodega" />
            </div>
          </div>

          <!-- Tabla -->
          <div v-if="loadingBodegas" class="flex flex-center q-pa-lg">
            <q-spinner color="orange-7" size="sm" />
          </div>
          <table v-else class="cat-table full-width">
            <thead>
              <tr>
                <th>Clave</th>
                <th>Descripción</th>
                <th style="text-align:right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in bodegas" :key="item.id">
                <td>
                  <template v-if="editingBodegaId !== item.id">
                    <q-badge color="green-2" text-color="green-9" class="text-weight-bold q-px-sm">{{ item.clave }}</q-badge>
                  </template>
                  <template v-else>
                    <q-input v-model="editBodegaClave" dense borderless placeholder="Clave" style="width:70px" />
                  </template>
                </td>
                <td>
                  <template v-if="editingBodegaId !== item.id">{{ item.nombre }}</template>
                  <template v-else>
                    <q-input v-model="editBodegaNombre" dense borderless @keyup.enter="guardarEditBodega" @keyup.escape="cancelarEditBodega" />
                  </template>
                </td>
                <td style="text-align:right;white-space:nowrap">
                  <template v-if="editingBodegaId !== item.id">
                    <q-btn flat round dense icon="edit" size="xs" color="grey-5" @click="iniciarEditBodega(item)" />
                    <q-btn flat round dense icon="close" size="xs" color="grey-5" @click="eliminarBodega(item.id)" />
                  </template>
                  <template v-else>
                    <q-btn flat round dense icon="check" size="xs" color="positive" @click="guardarEditBodega" />
                    <q-btn flat round dense icon="close" size="xs" color="negative" @click="cancelarEditBodega" />
                  </template>
                </td>
              </tr>
              <tr v-if="!bodegas.length && !loadingBodegas">
                <td colspan="3" class="text-center text-caption text-grey-4 q-pa-md">Sin bodegas registradas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Cuadrantes ── -->
      <div class="col-12 col-md-6">
        <div class="cat-panel">
          <div class="cat-panel__header">
            <div class="col">
              <div class="text-subtitle2 text-weight-bold text-grey-8">Cuadrantes</div>
              <div class="text-caption text-grey-5">Subdivisión dentro de cada bodega para ubicar lotes con mayor precisión</div>
            </div>
            <q-btn
              unelevated color="orange-7" icon="add" label="+ Nuevo Cuadrante"
              style="border-radius:8px; font-size:12px"
              @click="mostrarFormCuadrante = !mostrarFormCuadrante"
            />
          </div>

          <!-- Form nuevo cuadrante -->
          <div v-if="mostrarFormCuadrante" class="q-mx-md q-mb-sm q-pa-md" style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px">
            <div class="row q-col-gutter-sm items-end">
              <div class="col-4">
                <div class="text-caption text-weight-bold q-mb-xs">Clave <span class="text-negative">*</span></div>
                <q-input v-model="newCuadranteClave" dense outlined placeholder="Ej. C5" />
              </div>
              <div class="col-8">
                <div class="text-caption text-weight-bold q-mb-xs">Descripción</div>
                <q-input v-model="newCuadranteNombre" dense outlined placeholder="Ej. Cuadrante Central" @keyup.enter="agregarCuadrante" />
              </div>
            </div>
            <div class="row q-gutter-sm q-mt-sm">
              <q-btn unelevated color="orange-7" icon="check" label="Guardar" style="border-radius:6px" @click="agregarCuadrante" />
              <q-btn flat color="grey-7" label="Cancelar" @click="cancelarFormCuadrante" />
            </div>
          </div>

          <div v-if="loadingCuadrantes" class="flex flex-center q-pa-lg">
            <q-spinner color="orange-7" size="sm" />
          </div>
          <table v-else class="cat-table full-width">
            <thead>
              <tr>
                <th>Clave</th>
                <th>Descripción</th>
                <th style="text-align:right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cuadrantes" :key="item.id">
                <td>
                  <template v-if="editingCuadranteId !== item.id">
                    <q-badge color="blue-2" text-color="blue-9" class="text-weight-bold q-px-sm">{{ item.clave }}</q-badge>
                  </template>
                  <template v-else>
                    <q-input v-model="editCuadranteClave" dense borderless placeholder="Clave" style="width:70px" />
                  </template>
                </td>
                <td>
                  <template v-if="editingCuadranteId !== item.id">{{ item.nombre }}</template>
                  <template v-else>
                    <q-input v-model="editCuadranteNombre" dense borderless @keyup.enter="guardarEditCuadrante" @keyup.escape="cancelarEditCuadrante" />
                  </template>
                </td>
                <td style="text-align:right;white-space:nowrap">
                  <template v-if="editingCuadranteId !== item.id">
                    <q-btn flat round dense icon="edit" size="xs" color="grey-5" @click="iniciarEditCuadrante(item)" />
                    <q-btn flat round dense icon="close" size="xs" color="grey-5" @click="eliminarCuadrante(item.id)" />
                  </template>
                  <template v-else>
                    <q-btn flat round dense icon="check" size="xs" color="positive" @click="guardarEditCuadrante" />
                    <q-btn flat round dense icon="close" size="xs" color="negative" @click="cancelarEditCuadrante" />
                  </template>
                </td>
              </tr>
              <tr v-if="!cuadrantes.length && !loadingCuadrantes">
                <td colspan="3" class="text-center text-caption text-grey-4 q-pa-md">Sin cuadrantes registrados</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════
         SECCIÓN 2 — PRESENTACIÓN Y ENVASADO
    ═══════════════════════════════════════════════════ -->
    <div class="section-label q-mb-md">PRESENTACIÓN Y ENVASADO</div>
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-md-6">
        <CatalogCard
          title="Presentaciones (peso)"
          subtitle="Formatos de peso disponibles al asignar producto a bodega (25 kg, 50 kg, etc.)"
          placeholder="Ej. 30 kg"
          api-base="/api/produccion-catalogos/presentacion"
        />
      </div>
      <div class="col-12 col-md-6">
        <CatalogCard
          title="Tipos de Costal / Presentación Específica"
          subtitle="Variantes de empaque que se seleccionan al asignar producto o subproducto a bodega"
          placeholder="Ej. Costal KRAFT 50 KG"
          api-base="/api/bodega-catalogos/tipo-costal"
          :get-params="{ sedeId: sedeIdVal }"
          :mutate-params="{ sedeId: sedeIdVal }"
        />
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════
         SECCIÓN 3 — SUBPRODUCTOS ALMACENABLES
    ═══════════════════════════════════════════════════ -->
    <div class="section-label q-mb-md">SUBPRODUCTOS ALMACENABLES EN BODEGA</div>
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-md-6">
        <CatalogCard
          title="Subproductos almacenables en Bodega"
          subtitle="Tipos de subproducto que pueden ser asignados a una ubicación de bodega junto con el producto terminado"
          placeholder="Ej. Rezaga de Ojo Electrónico"
          api-base="/api/bodega-catalogos/subproducto-bodega"
          :get-params="{ sedeId: sedeIdVal }"
          :mutate-params="{ sedeId: sedeIdVal }"
        />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import { Notify, useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import CatalogCard from './CatalogCard.vue';

const $q        = useQuasar();
const authStore = useAuthStore();
const sedeIdVal = authStore.sedeActivaId ?? 0;

interface CatConClave { id: number; clave: string; nombre: string }

// ─── Bodegas ───────────────────────────────────────────────────────
const bodegas           = ref<CatConClave[]>([]);
const loadingBodegas    = ref(false);
const mostrarFormBodega = ref(false);
const newBodegaClave    = ref('');
const newBodegaNombre   = ref('');
const editingBodegaId   = ref<number | null>(null);
const editBodegaClave   = ref('');
const editBodegaNombre  = ref('');

async function cargarBodegas() {
  loadingBodegas.value = true;
  try {
    const { data } = await api.get('/api/bodega-catalogos/bodega', { params: { sedeId: sedeIdVal } });
    bodegas.value = Array.isArray(data) ? data : [];
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar bodegas. Verifique que la migración SQL del módulo Bodega fue ejecutada.' });
  } finally {
    loadingBodegas.value = false;
  }
}

function cancelarFormBodega() {
  mostrarFormBodega.value = false;
  newBodegaClave.value = '';
  newBodegaNombre.value = '';
}

async function agregarBodega() {
  const clave  = newBodegaClave.value.trim();
  const nombre = newBodegaNombre.value.trim();
  if (!clave || !nombre) {
    Notify.create({ type: 'warning', message: 'La clave y descripción son obligatorias' });
    return;
  }
  try {
    await api.post('/api/bodega-catalogos/bodega', { clave, nombre }, { params: { sedeId: sedeIdVal } });
    cancelarFormBodega();
    await cargarBodegas();
    Notify.create({ type: 'positive', message: 'Bodega agregada', timeout: 1500 });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al agregar bodega' });
  }
}

function iniciarEditBodega(item: CatConClave) {
  editingBodegaId.value  = item.id;
  editBodegaClave.value  = item.clave;
  editBodegaNombre.value = item.nombre;
}

function cancelarEditBodega() {
  editingBodegaId.value  = null;
  editBodegaClave.value  = '';
  editBodegaNombre.value = '';
}

async function guardarEditBodega() {
  if (!editingBodegaId.value) return;
  try {
    await api.put(`/api/bodega-catalogos/bodega/${editingBodegaId.value}`, {
      clave: editBodegaClave.value,
      nombre: editBodegaNombre.value,
    });
    cancelarEditBodega();
    await cargarBodegas();
  } catch {
    Notify.create({ type: 'negative', message: 'Error al actualizar' });
  }
}

function eliminarBodega(id: number) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar esta bodega?',
    cancel: { flat: true, label: 'Cancelar' },
    ok: { unelevated: true, color: 'negative', label: 'Eliminar' },
  }).onOk(() => {
    void api.delete(`/api/bodega-catalogos/bodega/${id}`).then(() => cargarBodegas());
  });
}

// ─── Cuadrantes ────────────────────────────────────────────────────
const cuadrantes           = ref<CatConClave[]>([]);
const loadingCuadrantes    = ref(false);
const mostrarFormCuadrante = ref(false);
const newCuadranteClave    = ref('');
const newCuadranteNombre   = ref('');
const editingCuadranteId   = ref<number | null>(null);
const editCuadranteClave   = ref('');
const editCuadranteNombre  = ref('');

async function cargarCuadrantes() {
  loadingCuadrantes.value = true;
  try {
    const { data } = await api.get('/api/bodega-catalogos/cuadrante', { params: { sedeId: sedeIdVal } });
    cuadrantes.value = Array.isArray(data) ? data : [];
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar cuadrantes. Verifique que la migración SQL del módulo Bodega fue ejecutada.' });
  } finally {
    loadingCuadrantes.value = false;
  }
}

function cancelarFormCuadrante() {
  mostrarFormCuadrante.value = false;
  newCuadranteClave.value = '';
  newCuadranteNombre.value = '';
}

async function agregarCuadrante() {
  const clave  = newCuadranteClave.value.trim();
  const nombre = newCuadranteNombre.value.trim();
  if (!clave || !nombre) {
    Notify.create({ type: 'warning', message: 'La clave y descripción son obligatorias' });
    return;
  }
  try {
    await api.post('/api/bodega-catalogos/cuadrante', { clave, nombre }, { params: { sedeId: sedeIdVal } });
    cancelarFormCuadrante();
    await cargarCuadrantes();
    Notify.create({ type: 'positive', message: 'Cuadrante agregado', timeout: 1500 });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al agregar cuadrante' });
  }
}

function iniciarEditCuadrante(item: CatConClave) {
  editingCuadranteId.value  = item.id;
  editCuadranteClave.value  = item.clave;
  editCuadranteNombre.value = item.nombre;
}

function cancelarEditCuadrante() {
  editingCuadranteId.value  = null;
  editCuadranteClave.value  = '';
  editCuadranteNombre.value = '';
}

async function guardarEditCuadrante() {
  if (!editingCuadranteId.value) return;
  try {
    await api.put(`/api/bodega-catalogos/cuadrante/${editingCuadranteId.value}`, {
      clave: editCuadranteClave.value,
      nombre: editCuadranteNombre.value,
    });
    cancelarEditCuadrante();
    await cargarCuadrantes();
  } catch {
    Notify.create({ type: 'negative', message: 'Error al actualizar' });
  }
}

function eliminarCuadrante(id: number) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar este cuadrante?',
    cancel: { flat: true, label: 'Cancelar' },
    ok: { unelevated: true, color: 'negative', label: 'Eliminar' },
  }).onOk(() => {
    void api.delete(`/api/bodega-catalogos/cuadrante/${id}`).then(() => cargarCuadrantes());
  });
}

onMounted(() => {
  void cargarBodegas();
  void cargarCuadrantes();
});
</script>

<style scoped>
.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #9e9e9e;
}

/* Panel contenedor */
.cat-panel {
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.cat-panel__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 16px 10px;
  border-bottom: 1px solid #f0f0f0;
}

/* Tabla */
.cat-table {
  border-collapse: collapse;
}

.cat-table thead tr {
  background: #fafafa;
}

.cat-table thead th {
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 700;
  color: #9e9e9e;
  letter-spacing: 0.5px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.cat-table tbody tr {
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.1s;
}

.cat-table tbody tr:hover {
  background: #fafafa;
}

.cat-table tbody tr:last-child {
  border-bottom: none;
}

.cat-table tbody td {
  padding: 10px 16px;
  font-size: 14px;
  color: #424242;
}
</style>
