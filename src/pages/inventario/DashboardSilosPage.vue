<template>
  <q-page class="bg-grey-2 q-pa-md">

    <!-- Header -->
    <div class="row items-center q-mb-md q-gutter-sm">
      <div>
        <div class="text-h6 text-weight-bold text-blue-9">Dashboard Silos</div>
        <div class="text-caption text-grey-7">Movimientos de inventario por silo y fecha</div>
      </div>
      <q-space />
      <q-btn flat round icon="refresh" color="blue-8" :loading="cargando" @click="cargarDatos">
        <q-tooltip>Actualizar</q-tooltip>
      </q-btn>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-sm items-end">
        <div class="col-12 col-sm-5 col-md-4">
          <q-input
            v-model="filtros.fechaInicio"
            type="date"
            dense
            outlined
            label="Fecha inicio"
            @update:model-value="cargarDatos"
          />
        </div>
        <div class="col-12 col-sm-5 col-md-4">
          <q-input
            v-model="filtros.fechaFin"
            type="date"
            dense
            outlined
            label="Fecha fin"
            @update:model-value="cargarDatos"
          />
        </div>
        <div class="col-12 col-sm-2 col-md-4 row q-gutter-xs">
          <q-btn dense flat color="blue-7" label="Hoy" @click="setRango('hoy')" />
          <q-btn dense flat color="blue-7" label="7 días" @click="setRango('7d')" />
          <q-btn dense flat color="blue-7" label="30 días" @click="setRango('30d')" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Tarjetas resumen por silo -->
    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner-dots size="50px" color="blue-8" />
    </div>

    <template v-else>
      <!-- Tarjetas acumuladas por silo -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div
          v-for="silo in silosResumen"
          :key="silo.bodegaNombre + silo.calibre"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card flat bordered class="silo-card full-height">
            <q-card-section class="bg-blue-9 text-white q-py-sm">
              <div class="text-subtitle1 text-weight-bold">{{ silo.bodegaNombre }}</div>
              <div class="text-caption opacity-80">Calibre {{ silo.calibre || 'N/A' }}</div>
            </q-card-section>
            <q-card-section class="q-pa-md">
              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <div class="text-caption text-grey-6">Kg Netos totales</div>
                  <div class="text-h6 text-weight-bold text-blue-9">
                    {{ formatNum(silo.totalKgNeto) }}
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-6">Toneladas netas</div>
                  <div class="text-h6 text-weight-bold text-green-8">
                    {{ formatTon(silo.totalTonNetas) }} t
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-6">Recepciones</div>
                  <div class="text-subtitle2 text-weight-medium">{{ silo.recepciones }}</div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-6">Rango</div>
                  <div class="text-caption text-weight-medium">
                    {{ formatFecha(silo.primerFecha) }} – {{ formatFecha(silo.ultimaFecha) }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div v-if="silosResumen.length === 0" class="col-12">
          <q-banner class="bg-blue-1 text-blue-9" rounded>
            <template #avatar><q-icon name="info" /></template>
            Sin movimientos en el período seleccionado.
          </q-banner>
        </div>
      </div>

      <!-- Tabla detallada por fecha y silo -->
      <q-card flat bordered>
        <q-card-section class="row items-center q-pb-sm">
          <div class="text-subtitle1 text-weight-medium">Detalle por día</div>
          <q-space />
          <q-input
            v-model="busqueda"
            dense
            outlined
            placeholder="Buscar silo o calibre..."
            style="min-width: 220px"
          >
            <template #prepend><q-icon name="search" size="xs" /></template>
          </q-input>
        </q-card-section>

        <q-table
          :rows="filasFiltradas"
          :columns="columnas"
          row-key="rowKey"
          flat
          dense
          :pagination="{ rowsPerPage: 0, sortBy: 'fecha', descending: true }"
          class="silo-table"
        >
          <!-- Fecha -->
          <template #body-cell-fecha="props">
            <q-td :props="props" class="text-weight-medium">
              {{ formatFecha(props.row.fecha) }}
            </q-td>
          </template>

          <!-- Bodega -->
          <template #body-cell-bodegaNombre="props">
            <q-td :props="props">
              <q-badge color="blue-9" :label="props.row.bodegaNombre" />
            </q-td>
          </template>

          <!-- Kg neto -->
          <template #body-cell-totalKgNeto="props">
            <q-td :props="props" class="text-right text-weight-bold text-blue-9">
              {{ formatNum(props.row.totalKgNeto) }}
            </q-td>
          </template>

          <!-- Ton netas -->
          <template #body-cell-totalTonNetas="props">
            <q-td :props="props" class="text-right text-green-8 text-weight-medium">
              {{ formatTon(props.row.totalTonNetas) }} t
            </q-td>
          </template>

          <!-- Recepciones -->
          <template #body-cell-recepciones="props">
            <q-td :props="props" class="text-center">
              <q-badge color="grey-6" :label="String(props.row.recepciones)" />
            </q-td>
          </template>

          <!-- Acción ver tickets -->
          <template #body-cell-accion="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                size="sm"
                icon="list"
                color="blue-8"
                @click="verDetalle(props.row)"
              >
                <q-tooltip>Ver tickets del día</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </template>

    <!-- Dialog de detalle de tickets -->
    <q-dialog v-model="modalDetalle" maximized>
      <q-card>
        <q-bar class="bg-blue-9 text-white">
          <div class="text-weight-bold">
            {{ detalleActual?.bodegaNombre }} — {{ formatFecha(detalleActual?.fecha) }}
            <span v-if="detalleActual?.calibre" class="q-ml-sm text-caption opacity-80">
              Calibre {{ detalleActual.calibre }}
            </span>
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-bar>

        <q-card-section>
          <div v-if="cargandoDetalle" class="text-center q-pa-xl">
            <q-spinner-dots size="40px" color="blue-8" />
          </div>
          <q-table
            v-else
            :rows="ticketsDetalle"
            :columns="columnasDetalle"
            row-key="id"
            flat
            dense
            :pagination="{ rowsPerPage: 0 }"
          >
            <template #body-cell-kgNeto="props">
              <q-td :props="props" class="text-right text-weight-bold text-blue-9">
                {{ formatNum(props.row.kgNeto) }}
              </q-td>
            </template>
            <template #body-cell-toneladasNetas="props">
              <q-td :props="props" class="text-right text-green-8">
                {{ formatTon(props.row.toneladasNetas) }} t
              </q-td>
            </template>
            <template #body-cell-status="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.status === 'SinOC' ? 'orange-7' : 'green-7'"
                  :label="props.row.status"
                />
              </q-td>
            </template>
          </q-table>

          <!-- Totales del día -->
          <div v-if="!cargandoDetalle && ticketsDetalle.length > 0" class="row q-mt-md q-col-gutter-md">
            <div class="col-auto">
              <div class="text-caption text-grey-6">Total Kg Neto del día</div>
              <div class="text-h6 text-weight-bold text-blue-9">
                {{ formatNum(ticketsDetalle.reduce((s, r) => s + (r.kgNeto || 0), 0)) }}
              </div>
            </div>
            <div class="col-auto">
              <div class="text-caption text-grey-6">Total Toneladas</div>
              <div class="text-h6 text-weight-bold text-green-8">
                {{ formatTon(ticketsDetalle.reduce((s, r) => s + (r.toneladasNetas || 0), 0)) }} t
              </div>
            </div>
            <div class="col-auto">
              <div class="text-caption text-grey-6">Tickets</div>
              <div class="text-h6 text-weight-bold">{{ ticketsDetalle.length }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();

// ─── Estado ──────────────────────────────────────────────────────────────────

interface FilaResumen {
  bodegaNombre: string;
  fecha: string;
  calibre: string;
  recepciones: number;
  totalKgBruto: number;
  totalKgNeto: number;
  totalTonBrutas: number;
  totalTonNetas: number;
}

interface FilaTotal {
  bodegaNombre: string;
  calibre: string;
  recepciones: number;
  totalKgNeto: number;
  totalTonNetas: number;
  primerFecha: string;
  ultimaFecha: string;
}

interface TicketDetalle {
  id: number;
  ticketNumero: string;
  calibre: string;
  kgBruto: number;
  kgNeto: number;
  toneladasBrutas: number;
  toneladasNetas: number;
  status: string;
  hora: string;
  productor: string;
}

const cargando = ref(false);
const cargandoDetalle = ref(false);
const filas = ref<FilaResumen[]>([]);
const silosResumen = ref<FilaTotal[]>([]);
const busqueda = ref('');
const modalDetalle = ref(false);
const detalleActual = ref<FilaResumen | null>(null);
const ticketsDetalle = ref<TicketDetalle[]>([]);

const filtros = reactive({
  fechaInicio: (() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  })(),
  fechaFin: new Date().toISOString().split('T')[0],
});

// ─── Computed ─────────────────────────────────────────────────────────────────

const filasFiltradas = computed(() => {
  if (!busqueda.value) return filas.value;
  const q = busqueda.value.toUpperCase();
  return filas.value.filter(
    (r) =>
      r.bodegaNombre.toUpperCase().includes(q) ||
      (r.calibre ?? '').toUpperCase().includes(q),
  );
});

// ─── Columnas tabla principal ─────────────────────────────────────────────────

const columnas = [
  { name: 'fecha',         label: 'Fecha',            field: 'fecha',         align: 'left'  as const, sortable: true },
  { name: 'bodegaNombre',  label: 'Silo',             field: 'bodegaNombre',  align: 'left'  as const, sortable: true },
  { name: 'calibre',       label: 'Calibre',          field: 'calibre',       align: 'left'  as const, sortable: true },
  { name: 'recepciones',   label: 'Recepciones',      field: 'recepciones',   align: 'center' as const, sortable: true },
  { name: 'totalKgNeto',   label: 'Kg Neto Total',    field: 'totalKgNeto',   align: 'right' as const, sortable: true },
  { name: 'totalTonNetas', label: 'Ton Netas',        field: 'totalTonNetas', align: 'right' as const, sortable: true },
  { name: 'accion',        label: '',                 field: 'accion',        align: 'center' as const },
];

const columnasDetalle = [
  { name: 'hora',           label: 'Hora',            field: 'hora',           align: 'left'  as const },
  { name: 'ticketNumero',   label: 'Ticket',          field: 'ticketNumero',   align: 'left'  as const },
  { name: 'productor',      label: 'Proveedor',       field: 'productor',      align: 'left'  as const, sortable: true },
  { name: 'calibre',        label: 'Calibre',         field: 'calibre',        align: 'left'  as const },
  { name: 'kgBruto',        label: 'Kg Bruto',        field: 'kgBruto',        align: 'right' as const, format: (v: number) => formatNum(v) },
  { name: 'kgNeto',         label: 'Kg Neto',         field: 'kgNeto',         align: 'right' as const },
  { name: 'toneladasNetas', label: 'Ton Netas',       field: 'toneladasNetas', align: 'right' as const },
  { name: 'status',         label: 'Status',          field: 'status',         align: 'center' as const },
];

// ─── Métodos ──────────────────────────────────────────────────────────────────

function formatNum(n: number | null | undefined): string {
  if (n == null) return '—';
  return Number(n).toLocaleString('es-MX', { maximumFractionDigits: 2 });
}

function formatTon(n: number | null | undefined): string {
  if (n == null) return '—';
  return Number(n).toLocaleString('es-MX', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function formatFecha(f: string | null | undefined): string {
  if (!f) return '—';
  const parts = (f.split('T')[0] ?? f).split('-');
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

function setRango(rango: 'hoy' | '7d' | '30d') {
  const hoy = new Date();
  filtros.fechaFin = hoy.toISOString().split('T')[0];
  if (rango === 'hoy') {
    filtros.fechaInicio = filtros.fechaFin;
  } else if (rango === '7d') {
    const d = new Date(hoy);
    d.setDate(d.getDate() - 6);
    filtros.fechaInicio = d.toISOString().split('T')[0];
  } else {
    const d = new Date(hoy);
    d.setDate(d.getDate() - 29);
    filtros.fechaInicio = d.toISOString().split('T')[0];
  }
  void cargarDatos();
}

async function cargarDatos() {
  const sedeId = authStore.sedeActivaId ?? 0;
  cargando.value = true;
  try {
    const [resResumen, resTotales] = await Promise.all([
      api.get('/api/dashboardsilos/resumen', {
        params: { sedeId, fechaInicio: filtros.fechaInicio, fechaFin: filtros.fechaFin },
      }),
      api.get('/api/dashboardsilos/totales', { params: { sedeId } }),
    ]);

    filas.value = (resResumen.data as FilaResumen[]).map((r) => ({
      ...r,
      rowKey: `${r.bodegaNombre}_${r.fecha}_${r.calibre}`,
    }));

    silosResumen.value = resTotales.data as FilaTotal[];
  } catch {
    filas.value = [];
    silosResumen.value = [];
  } finally {
    cargando.value = false;
  }
}

async function verDetalle(fila: FilaResumen) {
  detalleActual.value = fila;
  modalDetalle.value = true;
  cargandoDetalle.value = true;
  ticketsDetalle.value = [];
  try {
    const sedeId = authStore.sedeActivaId ?? 0;
    const { data } = await api.get('/api/dashboardsilos/detalle', {
      params: { sedeId, bodegaNombre: fila.bodegaNombre, fecha: fila.fecha.split('T')[0] },
    });
    ticketsDetalle.value = data as TicketDetalle[];
  } catch {
    ticketsDetalle.value = [];
  } finally {
    cargandoDetalle.value = false;
  }
}

onMounted(() => {
  void cargarDatos();
});
</script>

<style scoped>
.silo-card {
  border-left: 4px solid var(--q-color-blue-9);
  transition: box-shadow 0.2s;
}
.silo-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
</style>
