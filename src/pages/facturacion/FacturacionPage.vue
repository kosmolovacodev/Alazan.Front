<template>
  <!-- =========================
       DETALLE (DetalleFacturacion)
       ========================= -->
  <DetalleFacturacion
    v-if="mostrarDetalle && detalleFactura"
    :productor="detalleFactura.productor"
    :rfc="detalleFactura.rfc"
    :tickets="detalleFactura.tickets"
    @back="handleBackFromDetalle"
    @update-rfc="handleUpdateRfc"
    @update-documentos-status="handleUpdateDocsStatus"
  />

  <!-- =========================
       HISTORIAL (Lista principal)
       ========================= -->
  <q-page v-else class="q-pa-lg bg-grey-2">

    <!-- Header -->
    <div class="row items-center q-gutter-md q-mb-lg">
      <div class="col">
        <div class="text-h5 text-weight-bold text-grey-8">Recepción de Facturas</div>
        <div class="text-caption text-grey-6">Historial de recepciones</div>
      </div>
      <div class="col-auto">
        <q-btn flat round icon="refresh" color="primary" :loading="loading" @click="cargarRecepciones" />
      </div>
    </div>

    <!-- KPIs -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-blue-1">
          <q-card-section>
            <div class="text-caption text-grey-7">Total Registros</div>
            <div class="text-h5 text-blue-10">{{ recepciones.length }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-green-1">
          <q-card-section>
            <div class="text-caption text-grey-7">Con RFC</div>
            <div class="text-h5 text-green-10">{{ conRFC }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-yellow-1">
          <q-card-section>
            <div class="text-caption text-grey-7">Sin RFC (Pendientes)</div>
            <div class="text-h5 text-yellow-10">{{ sinRFC }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-purple-1">
          <q-card-section>
            <div class="text-caption text-grey-7">Total Toneladas</div>
            <div class="text-h5 text-purple-10">{{ totalToneladas }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md bg-white">
      <q-card-section>
        <div class="text-center text-subtitle2 q-mb-md">Filtros</div>

        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-2">
            <q-input v-model="filtros.ticket" dense outlined placeholder="Ticket" clearable />
          </div>
          <div class="col-12 col-md-2">
            <q-input v-model="filtros.productor" dense outlined placeholder="Productor" clearable />
          </div>
          <div class="col-12 col-md-2">
            <q-input v-model="filtros.rfc" dense outlined placeholder="RFC" clearable />
          </div>
          <div class="col-12 col-md-2">
            <q-select
              v-model="filtros.status"
              dense
              outlined
              label="Status"
              :options="statusOptions"
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-12 col-md-4">
            <div class="row items-center q-gutter-sm">
              <q-input v-model="filtros.fechaInicio" dense outlined type="date" style="max-width: 180px;" />
              <div class="text-body2">a</div>
              <q-input v-model="filtros.fechaFin" dense outlined type="date" style="max-width: 180px;" />
            </div>
          </div>
        </div>

        <div class="row items-center justify-end">
          <q-btn
            color="green-7"
            icon="table_view"
            label="Exportar Excel"
            @click="handleExportExcel"
            :loading="exportando"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Total a pagar -->
    <div class="row justify-end q-mb-md">
      <q-card flat bordered class="bg-white">
        <q-card-section class="q-py-sm q-px-md">
          <span class="text-caption text-grey-7">TOTAL A PAGAR: </span>
          <span class="text-subtitle1 text-weight-medium">
            ${{ formatMoney(totalAPagar) }}
          </span>
        </q-card-section>
      </q-card>
    </div>

    <!-- Acciones sobre selección -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <q-btn
          v-if="selectedIds.length > 0 && todosListosParaPago"
          color="green-7"
          icon="send"
          :label="`ENVIAR A PAGOS (${selectedIds.length})`"
          @click="handleEnviarAPagos"
        />
        <q-btn
          v-else-if="selectedIds.length > 0"
          color="deep-purple-7"
          icon="visibility"
          :label="`Ver Seleccionados (${selectedIds.length})`"
          @click="handleVerSeleccionados"
        />
      </div>
    </div>

    <!-- Tabla -->
    <q-card flat bordered class="bg-white">
      <q-table
        :rows="facturasFiltradas"
        :columns="columns"
        row-key="id"
        flat
        bordered
        separator="horizontal"
        selection="multiple"
        v-model:selected="selectedRowsProxy"
        :rows-per-page-options="[10, 25, 50, 0]"
        :loading="loading"
        no-data-label="Sin resultados"
      >
        <!-- checkbox header -->
        <template #header-selection>
          <q-checkbox
            :model-value="allSelectableChecked"
            :indeterminate="someSelectableChecked"
            @update:model-value="handleSelectAll"
          />
        </template>

        <!-- checkbox row -->
        <template #body-selection="scope">
          <q-checkbox
            :model-value="selectedIds.includes(scope.row.id)"
            :disable="!puedeSeleccionar(scope.row)"
            @update:model-value="() => handleSelectRecord(scope.row.id)"
          />
        </template>

        <template #body-cell-rfc="p">
          <q-td :props="p">
            <span :class="p.row.rfc === 'Pendiente RFC' ? 'text-negative text-weight-medium' : ''">
              {{ p.row.rfc }}
            </span>
          </q-td>
        </template>

        <template #body-cell-precio="p">
          <q-td :props="p">
            ${{ formatMoney(p.row.precio) }}
          </q-td>
        </template>

        <template #body-cell-importe="p">
          <q-td :props="p">
            ${{ formatMoney(p.row.importe) }}
          </q-td>
        </template>

        <template #body-cell-aPagar="p">
          <q-td :props="p">
            ${{ formatMoney(p.row.aPagar) }}
          </q-td>
        </template>

        <template #body-cell-status="p">
          <q-td :props="p">
            <span :class="obtenerStatusClase(p.row)">
              {{ obtenerStatusTexto(p.row) }}
            </span>
          </q-td>
        </template>

        <template #body-cell-ver="p">
          <q-td :props="p">
            <q-btn
              dense
              flat
              round
              icon="visibility"
              color="blue-7"
              @click="handleVerFactura(p.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth';
import DetalleFacturacion from './DetalleFacturacion.vue';
import type { QTableColumn } from 'quasar';

const $q = useQuasar();
const authStore = useAuthStore();

/* =========================
   Interfaces
========================= */
interface FacturaRecord {
  id: number;
  ticket: string;
  fecha: string;
  rfc: string;
  productor: string;
  toneladas: number;
  netoAPagar: number;
  precio: number;
  importe: number;
  aPagar: number;
  status: string;
  tieneDocumentos: boolean;
  tieneFacturaXML: boolean;
}

/* =========================
   Estado
========================= */
const recepciones = ref<FacturaRecord[]>([]);
const loading = ref(false);
const exportando = ref(false);
const selectedIds = ref<number[]>([]);
const mostrarDetalle = ref(false);
const detalleFactura = ref<{ productor: string; rfc: string; tickets: string[] } | null>(null);

const filtros = ref({
  ticket: '',
  productor: '',
  rfc: '',
  status: '',
  fechaInicio: '',
  fechaFin: ''
});

const statusOptions = [
  { label: 'PENDIENTE RFC', value: 'PENDIENTE RFC' },
  { label: 'PENDIENTE DOCUMENTOS', value: 'PENDIENTE DOCUMENTOS' },
  { label: 'PENDIENTE FACTURA XML', value: 'PENDIENTE FACTURA XML' },
  { label: 'LISTO PARA SOLICITAR PAGO', value: 'LISTO PARA SOLICITAR PAGO' },
  { label: 'ENVIADO A PAGOS', value: 'ENVIADO_A_PAGOS' }
];

/* =========================
   API calls
========================= */
async function cargarRecepciones() {
  loading.value = true;
  try {
    const { data } = await api.get('/api/facturacion/recepciones');
    recepciones.value = (data as FacturaRecord[]).map((r, idx) => ({
      ...r,
      id: r.id || idx + 1,
      tieneDocumentos: !!r.tieneDocumentos,
      tieneFacturaXML: !!r.tieneFacturaXML
    }));
  } catch (error) {
    console.error('Error al cargar recepciones:', error);
    notifyError('Error al cargar recepciones de facturación');
  } finally {
    loading.value = false;
  }
}

/* =========================
   Status helpers
========================= */
function obtenerStatusTexto(f: FacturaRecord): string {
  if (f.rfc === 'Pendiente RFC') return 'PENDIENTE RFC';
  if (!f.tieneDocumentos) return 'PENDIENTE DOCUMENTOS';
  if (!f.tieneFacturaXML) return 'PENDIENTE FACTURA XML';
  if (f.status === 'ENVIADO_A_PAGOS') return 'ENVIADO A PAGOS';
  return 'LISTO PARA SOLICITAR PAGO';
}

function obtenerStatusClase(f: FacturaRecord): string {
  const texto = obtenerStatusTexto(f);
  switch (texto) {
    case 'PENDIENTE RFC': return 'text-negative text-weight-bold';
    case 'PENDIENTE DOCUMENTOS': return 'text-warning text-weight-bold';
    case 'PENDIENTE FACTURA XML': return 'text-orange text-weight-bold';
    case 'ENVIADO A PAGOS': return 'text-blue text-weight-bold';
    default: return 'text-positive text-weight-bold';
  }
}

/* =========================
   Filtrado
========================= */
const facturasFiltradas = computed(() => {
  const f = filtros.value;
  return recepciones.value.filter((factura) => {
    if (f.ticket && !factura.ticket.toLowerCase().includes(f.ticket.toLowerCase())) return false;
    if (f.productor && !factura.productor.toLowerCase().includes(f.productor.toLowerCase())) return false;
    if (f.rfc && !factura.rfc.toLowerCase().includes(f.rfc.toLowerCase())) return false;
    if (f.status) {
      const status = obtenerStatusTexto(factura);
      if (!status.toLowerCase().includes(f.status.toLowerCase())) return false;
    }
    return true;
  });
});

/* =========================
   KPIs
========================= */
const totalAPagar = computed(() => facturasFiltradas.value.reduce((sum, x) => sum + (x.aPagar || 0), 0));
const totalToneladas = computed(() => facturasFiltradas.value.reduce((sum, x) => sum + (x.toneladas || 0), 0).toFixed(2));
const conRFC = computed(() => facturasFiltradas.value.filter(f => f.rfc !== 'Pendiente RFC').length);
const sinRFC = computed(() => facturasFiltradas.value.filter(f => f.rfc === 'Pendiente RFC').length);

/* =========================
   Selección (solo "listos")
========================= */
function puedeSeleccionar(f: FacturaRecord): boolean {
  return obtenerStatusTexto(f) === 'LISTO PARA SOLICITAR PAGO';
}

function handleSelectRecord(id: number) {
  const factura = recepciones.value.find(f => f.id === id);
  if (!factura || !puedeSeleccionar(factura)) return;

  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(x => x !== id);
  } else {
    selectedIds.value = [...selectedIds.value, id];
  }
}

function handleSelectAll() {
  const listos = facturasFiltradas.value.filter(puedeSeleccionar);
  const listosIds = listos.map(x => x.id);
  const allSelected = listosIds.length > 0 && listosIds.every(id => selectedIds.value.includes(id));
  selectedIds.value = allSelected ? [] : listosIds;
}

const todosListosParaPago = computed(() => {
  if (selectedIds.value.length === 0) return false;
  const sel = recepciones.value.filter(f => selectedIds.value.includes(f.id));
  return sel.every(f => obtenerStatusTexto(f) === 'LISTO PARA SOLICITAR PAGO');
});

const selectedRowsProxy = computed({
  get() {
    return facturasFiltradas.value.filter(r => selectedIds.value.includes(r.id));
  },
  set(rows: FacturaRecord[]) {
    const filtered = rows.filter(puedeSeleccionar).map(r => r.id);
    selectedIds.value = Array.from(new Set(filtered));
  }
});

const selectableIds = computed(() => facturasFiltradas.value.filter(puedeSeleccionar).map(r => r.id));

const allSelectableChecked = computed(() => {
  const ids = selectableIds.value;
  return ids.length > 0 && ids.every(id => selectedIds.value.includes(id));
});

const someSelectableChecked = computed(() => {
  const ids = selectableIds.value;
  const selectedInSelectable = ids.filter(id => selectedIds.value.includes(id));
  return selectedInSelectable.length > 0 && selectedInSelectable.length < ids.length;
});

/* =========================
   Acciones
========================= */
async function handleExportExcel() {
  exportando.value = true;
  try {
    const response = await api.get('/api/facturacion/exportar-excel', {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const filename = response.headers['content-disposition']
      ?.split('filename=')[1]
      ?.replace(/"/g, '') || 'facturacion_recepciones.xlsx';
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    notifyOk('Excel descargado correctamente');
  } catch (error) {
    console.error('Error al exportar:', error);
    notifyError('Error al exportar a Excel');
  } finally {
    exportando.value = false;
  }
}

function handleEnviarAPagos() {
  if (selectedIds.value.length === 0) {
    notifyWarn('Debe seleccionar al menos una factura para enviar a pagos');
    return;
  }

  const ticketsSeleccionados = recepciones.value
    .filter(f => selectedIds.value.includes(f.id))
    .map(f => f.ticket);

  $q.dialog({
    title: 'Confirmación',
    message: `¿Desea enviar ${selectedIds.value.length} factura(s) a Pagos/Productores?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    void (async () => {
      try {
        await api.post('/api/facturacion/enviar-a-pagos', {
          tickets: ticketsSeleccionados,
          sedeId: authStore.sedeActivaId || 0
        });
        const n = selectedIds.value.length;
        selectedIds.value = [];
        notifyOk(`${n} factura(s) enviada(s) a Pagos/Productores`);
        await cargarRecepciones();
      } catch (error) {
        console.error('Error al enviar a pagos:', error);
        notifyError('Error al enviar a pagos');
      }
    })();
  });
}

function handleVerFactura(row: FacturaRecord) {
  detalleFactura.value = { productor: row.productor, rfc: row.rfc, tickets: [row.ticket] };
  mostrarDetalle.value = true;
}

function handleVerSeleccionados() {
  if (selectedIds.value.length === 0) {
    notifyWarn('Por favor seleccione al menos un ticket');
    return;
  }

  const primera = recepciones.value.find(f => f.id === selectedIds.value[0]);
  if (!primera) return;

  const ticketsSeleccionados = recepciones.value
    .filter(f => selectedIds.value.includes(f.id))
    .map(f => f.ticket);

  detalleFactura.value = { productor: primera.productor, rfc: primera.rfc, tickets: ticketsSeleccionados };
  mostrarDetalle.value = true;
}

/* =========================
   Callbacks desde detalle
========================= */
async function handleBackFromDetalle() {
  mostrarDetalle.value = false;
  detalleFactura.value = null;
  selectedIds.value = [];
  await cargarRecepciones();
}

async function handleUpdateRfc(tickets: string[], nuevoRfc: string) {
  try {
    await api.put('/api/facturacion/actualizar-rfc', {
      tickets,
      nuevoRfc,
      sedeId: authStore.sedeActivaId || 0
    });
    // Actualizar localmente
    for (const rec of recepciones.value) {
      if (tickets.includes(rec.ticket)) rec.rfc = nuevoRfc;
    }
    notifyOk('RFC actualizado correctamente');
  } catch (error) {
    console.error('Error al actualizar RFC:', error);
    notifyError('Error al actualizar RFC');
  }
}

async function handleUpdateDocsStatus(tickets: string[], tieneDocumentos: boolean, tieneFacturaXML: boolean) {
  try {
    await api.put('/api/facturacion/actualizar-documentos-status', {
      tickets,
      tieneDocumentos,
      tieneFacturaXml: tieneFacturaXML,
      sedeId: authStore.sedeActivaId || 0
    });
    // Actualizar localmente
    for (const rec of recepciones.value) {
      if (tickets.includes(rec.ticket)) {
        rec.tieneDocumentos = tieneDocumentos;
        rec.tieneFacturaXML = tieneFacturaXML;
      }
    }
  } catch (error) {
    console.error('Error al actualizar status documentos:', error);
    notifyError('Error al actualizar status de documentos');
  }
}

/* =========================
   Tabla columns
========================= */
const columns: QTableColumn[] = [
  { name: 'id', label: '#', field: 'id', align: 'left', sortable: true },
  { name: 'ticket', label: 'No. Ticket', field: 'ticket', align: 'left', sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'rfc', label: 'RFC', field: 'rfc', align: 'left', sortable: true },
  { name: 'productor', label: 'Productor', field: 'productor', align: 'left', sortable: true },
  { name: 'toneladas', label: 'Toneladas', field: 'toneladas', align: 'left', sortable: true },
  { name: 'netoAPagar', label: 'Neto a pagar (KG)', field: 'netoAPagar', align: 'left', sortable: true },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'left', sortable: true },
  { name: 'importe', label: 'Importe', field: 'importe', align: 'left', sortable: true },
  { name: 'aPagar', label: 'A pagar', field: 'aPagar', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'ver', label: 'Ver', field: 'ver', align: 'left' }
];

/* =========================
   Utils
========================= */
function formatMoney(v: number): string {
  return Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function notifyOk(message: string) {
  $q.notify({ type: 'positive', message, position: 'top' });
}
function notifyError(message: string) {
  $q.notify({ type: 'negative', message, position: 'top' });
}
function notifyWarn(message: string) {
  $q.notify({ type: 'warning', message, position: 'top' });
}

/* =========================
   Init
========================= */
onMounted(() => {
  void cargarRecepciones();
});
</script>
