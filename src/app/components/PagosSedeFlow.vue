<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-btn flat round icon="arrow_back" @click="onBackSafe" />
      <div class="text-h5 text-grey-8">Pagos - Sede Corporativo</div>
    </div>

    <div class="text-h6 text-grey-7 q-mb-md">Autorización y Registro de Pagos</div>

    <!-- Monitor de Topes por Sede -->
    <q-card
      v-if="metricasPorSede.length > 0"
      flat
      bordered
      class="q-mb-md"
      style="border: 2px solid #b39ddb;"
    >
      <q-card-section class="q-pa-sm">
        <div class="row items-start justify-between q-mb-sm">
          <div class="text-body2 text-weight-bold" style="color:#6a1b9a;">
            Monitor de Topes Diarios por Sede
          </div>

          <div class="text-right">
            <div class="text-caption text-grey-7">Total Disponible</div>
            <div class="text-weight-bold text-positive" style="font-size: 16px;">
              ${{ money(totalDisponible / 1_000_000) }}M
            </div>
          </div>
        </div>

        <q-card flat bordered>
          <q-table
            :rows="metricasPorSede"
            :columns="columnsTopes"
            row-key="id"
            flat
            bordered
            hide-pagination
            :rows-per-page-options="[0]"
          >
            <template #body-cell-disponible="props">
              <q-td :props="props">
                <div
                  class="text-weight-bold"
                  :class="props.row.disponible > 0 ? 'text-positive' : 'text-negative'"
                  style="font-size: 16px;"
                >
                  ${{ money(props.row.disponible / 1_000_000) }}M
                </div>
              </q-td>
            </template>

            <template #body-cell-utilizacion="props">
              <q-td :props="props">
                <div class="row items-center q-gutter-sm">
                  <q-linear-progress
                    :value="Math.min(props.row.porcentaje, 100) / 100"
                    :color="colorPorcentaje(props.row.porcentaje)"
                    rounded
                    size="8px"
                    class="col"
                  />
                  <div class="text-caption text-weight-bold" style="width: 40px; text-align:right;">
                    {{ Number(props.row.porcentaje || 0).toFixed(0) }}%
                  </div>
                </div>
              </q-td>
            </template>

            <template #body-cell-status="props">
              <q-td :props="props" class="text-center">
                <q-chip
                  dense
                  :color="chipTope(props.row.porcentaje).bg"
                  :text-color="chipTope(props.row.porcentaje).text"
                  class="text-weight-bold"
                >
                  {{ chipTope(props.row.porcentaje).label }}
                </q-chip>
              </q-td>
            </template>
          </q-table>
        </q-card>
      </q-card-section>
    </q-card>

    <!-- Resumen Ejecutivo (Hoy) -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="bg-orange-1">
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-sm q-mb-xs">
              <q-icon name="schedule" class="text-orange-8" />
              <div class="text-caption text-weight-bold text-grey-8">Pago Solicitado (Hoy)</div>
            </div>

            <div class="row items-end justify-between">
              <div>
                <div class="text-caption text-grey-7">Cantidad</div>
                <div class="text-h5 text-weight-bold text-orange-9">{{ totalSolicitados }}</div>
              </div>
              <div class="text-right">
                <div class="text-caption text-grey-7">Monto</div>
                <div class="text-subtitle1 text-weight-bold text-orange-9">
                  ${{ money(totalSolicitadosPago) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="bg-blue-1">
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-sm q-mb-xs">
              <q-icon name="check_circle" class="text-primary" />
              <div class="text-caption text-weight-bold text-grey-8">Autorizado (Hoy)</div>
            </div>

            <div class="row items-end justify-between">
              <div>
                <div class="text-caption text-grey-7">Cantidad</div>
                <div class="text-h5 text-weight-bold text-primary">{{ totalAutorizados }}</div>
              </div>
              <div class="text-right">
                <div class="text-caption text-grey-7">Monto</div>
                <div class="text-subtitle1 text-weight-bold text-primary">
                  ${{ money(totalAutorizadosPago) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="bg-green-1">
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-sm q-mb-xs">
              <q-icon name="check_circle" class="text-positive" />
              <div class="text-caption text-weight-bold text-grey-8">Pagado (Hoy)</div>
            </div>

            <div class="row items-end justify-between">
              <div>
                <div class="text-caption text-grey-7">Cantidad</div>
                <div class="text-h5 text-weight-bold text-positive">{{ totalPagados }}</div>
              </div>
              <div class="text-right">
                <div class="text-caption text-grey-7">Monto</div>
                <div class="text-subtitle1 text-weight-bold text-positive">
                  ${{ money(totalPagadosPago) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2 text-weight-bold text-center q-mb-md">Filtros</div>

        <div class="row q-col-gutter-md q-mb-sm">
          <div class="col-12 col-md-2">
            <q-input v-model="filtros.ticket" outlined dense label="Ticket" />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="filtros.productor" outlined dense label="Productor" />
          </div>
          <div class="col-12 col-md-2">
            <q-input v-model="filtros.rfc" outlined dense label="RFC" />
          </div>
          <div class="col-12 col-md-2">
            <q-input v-model="filtros.centroAcopio" outlined dense label="Centro Acopio" />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.statusPago"
              outlined
              dense
              label="Status"
              :options="statusOptions"
              emit-value
              map-options
            />
          </div>
        </div>

        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-2">
            <q-checkbox v-model="filtros.hoy" label="Hoy" />
          </div>

          <div class="col-12 col-md-6">
            <div class="row items-center q-gutter-sm">
              <div class="text-body2 text-grey-7">Fecha:</div>
              <q-input v-model="filtros.fechaInicio" outlined dense type="date" style="max-width: 190px" />
              <div class="text-body2 text-grey-7">a</div>
              <q-input v-model="filtros.fechaFin" outlined dense type="date" style="max-width: 190px" />
            </div>
          </div>

          <div class="col-12 col-md-4 row justify-end">
            <q-btn
              color="positive"
              unelevated
              icon="table_view"
              label="Exportar Excel"
              @click="handleExportExcel"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Total -->
    <div class="row justify-end q-mb-md">
      <q-card flat bordered>
        <q-card-section class="q-px-md q-py-sm">
          <span class="text-caption text-grey-7">TOTAL: </span>
          <span class="text-subtitle1 text-weight-medium">
            ${{ money(totalAPagar) }}
          </span>
        </q-card-section>
      </q-card>
    </div>

    <!-- Botón autorizar -->
    <div class="row items-center justify-between q-mb-sm">
      <div>
        <q-btn
          v-if="todosSeleccionadosSonSolicitados"
          color="primary"
          unelevated
          :label="`AUTORIZAR PAGOS (${selectedRecords.length})`"
          @click="handleAutorizarPagos"
        />
      </div>
    </div>

    <!-- Tabla principal -->
    <q-card flat bordered>
      <q-table
        :rows="pagosFiltrados"
        :columns="columns"
        row-key="id"
        flat
        bordered
        hide-pagination
        :rows-per-page-options="[0]"
        selection="multiple"
        v-model:selected="selectedRowsProxy"
      >
        <template #body-cell-toneladas="props">
          <q-td :props="props">{{ props.row.toneladas }}</q-td>
        </template>

        <template #body-cell-aPagar="props">
          <q-td :props="props">${{ money(props.row.aPagar) }}</q-td>
        </template>

        <template #body-cell-statusPago="props">
          <q-td :props="props">
            <q-chip dense :color="statusChip(props.row.statusPago).bg" :text-color="statusChip(props.row.statusPago).text">
              {{ statusChip(props.row.statusPago).label }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-fechaAutorizacion="props">
          <q-td :props="props">{{ props.row.fechaAutorizacion || '-' }}</q-td>
        </template>

        <template #body-cell-fechaPago="props">
          <q-td :props="props">{{ props.row.fechaPago || '-' }}</q-td>
        </template>

        <template #body-cell-folioPago="props">
          <q-td :props="props">{{ props.row.folioPago || '-' }}</q-td>
        </template>

        <template #body-cell-ver="props">
          <q-td :props="props" class="text-center">
            <q-btn flat round dense icon="visibility" color="primary" @click="handleVerDetallePago(props.row)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Modal detalle -->
    <q-dialog v-model="showDetallePago" persistent>
      <q-card style="width: 720px; max-width: 96vw;">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6 text-grey-8">
            {{
              pagoSeleccionado?.statusPago === 'PAGO SOLICITADO'
                ? 'Autorizar Pago'
                : pagoSeleccionado?.statusPago === 'AUTORIZADO'
                ? 'Registrar Pago'
                : 'Detalle de Pago'
            }}
          </div>
          <q-btn flat round dense icon="close" @click="handleCerrarDetallePago" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <!-- General -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-caption text-grey-7">No. Ticket</div>
                  <q-input dense outlined readonly :model-value="pagoSeleccionado?.ticket || ''" />
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-caption text-grey-7">Centro de Acopio</div>
                  <q-input dense outlined readonly :model-value="pagoSeleccionado?.centroAcopio || ''" />
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12">
              <q-card flat bordered class="bg-grey-2">
                <q-card-section>
                  <div class="text-caption text-grey-7">Nombre Productor</div>
                  <q-input dense outlined readonly :model-value="pagoSeleccionado?.productor || ''" />
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Sección -->
          <q-card flat bordered>
            <q-card-section class="q-gutter-md">
              <div class="row items-center justify-between">
                <div class="text-weight-bold text-grey-8">A Pagar</div>
                <q-input
                  dense
                  outlined
                  readonly
                  style="width: 260px"
                  :model-value="`$${money(pagoSeleccionado?.aPagar || 0)}`"
                />
              </div>

              <!-- Fecha Autorización -->
              <div
                v-if="pagoSeleccionado && ['PAGO SOLICITADO','AUTORIZADO','PAGADO'].includes(pagoSeleccionado.statusPago)"
                class="row items-center justify-between"
              >
                <div class="text-weight-bold text-grey-8">Fecha de Autorización</div>
                <q-input
                  dense
                  outlined
                  type="date"
                  style="width: 260px"
                  v-model="detallePagoForm.fechaAutorizacion"
                  :disable="pagoSeleccionado?.statusPago !== 'PAGO SOLICITADO'"
                />
              </div>

              <!-- Campos de Pago -->
              <template v-if="pagoSeleccionado && (pagoSeleccionado.statusPago === 'AUTORIZADO' || pagoSeleccionado.statusPago === 'PAGADO')">
                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Fecha de Pago</div>
                  <q-input
                    dense
                    outlined
                    type="date"
                    style="width: 260px"
                    v-model="detallePagoForm.fechaPago"
                    :disable="pagoSeleccionado.statusPago === 'PAGADO'"
                  />
                </div>

                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Forma de Pago</div>
                  <q-select
                    dense
                    outlined
                    style="width: 260px"
                    v-model="detallePagoForm.formaPago"
                    :options="formaPagoOptions"
                    :disable="pagoSeleccionado.statusPago === 'PAGADO'"
                  />
                </div>

                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Banco</div>
                  <q-select
                    dense
                    outlined
                    style="width: 260px"
                    v-model="detallePagoForm.banco"
                    :options="bancosOptions"
                    :disable="pagoSeleccionado.statusPago === 'PAGADO'"
                  />
                </div>

                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Cuenta</div>
                  <q-input
                    dense
                    outlined
                    style="width: 260px"
                    v-model="detallePagoForm.cuenta"
                    :disable="pagoSeleccionado.statusPago === 'PAGADO'"
                  />
                </div>

                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Folio de Pago</div>
                  <q-input
                    dense
                    outlined
                    style="width: 260px"
                    v-model="detallePagoForm.folioPago"
                    :disable="pagoSeleccionado.statusPago === 'PAGADO'"
                  />
                </div>
              </template>
            </q-card-section>
          </q-card>
        </q-card-section>

        <q-separator />

        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            v-if="pagoSeleccionado?.statusPago === 'PAGO SOLICITADO'"
            color="primary"
            unelevated
            label="Autorizar"
            style="min-width: 280px"
            @click="handleAutorizarPago"
          />
          <q-btn
            v-else-if="pagoSeleccionado?.statusPago === 'AUTORIZADO'"
            color="positive"
            unelevated
            label="Registrar Pago"
            style="min-width: 280px"
            @click="handleRegistrarPago"
          />
          <q-btn
            v-else
            color="grey-7"
            unelevated
            label="Cerrar"
            style="min-width: 280px"
            @click="handleCerrarDetallePago"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Dialog, Notify } from 'quasar';

interface PagosSedeFlowProps {
  onBack?: () => void;
  topesPagosSede?: Array<{
    id: number;
    sede: string;
    topeDiario: number;
    activo: boolean;
  }>;
}

type StatusPago = 'PAGO SOLICITADO' | 'AUTORIZADO' | 'PAGADO';

interface PagoSedeRecord {
  id: number;
  ticket: string;
  fechaEntrega: string;
  fechaSolicitud: string;
  centroAcopio: string;
  rfc: string;
  productor: string;
  toneladas: number;
  aPagar: number;
  statusPago: StatusPago;
  fechaAutorizacion?: string;
  fechaPago?: string;
  folioPago?: string;
  banco: string;
}

const props = withDefaults(defineProps<PagosSedeFlowProps>(), {
  onBack: undefined,
  topesPagosSede: () => [],
});

const onBackSafe = () => (props.onBack ? props.onBack() : undefined);

// Estado selección/tabla (en TSX era number[])
const selectedRecords = ref<number[]>([]);

// Modal
const showDetallePago = ref(false);
const pagoSeleccionado = ref<PagoSedeRecord | null>(null);
const detallePagoForm = ref({
  fechaAutorizacion: '',
  fechaPago: '',
  importePago: '',
  formaPago: '',
  banco: '',
  cuenta: '',
  folioPago: '',
});

// Filtros
const filtros = ref({
  ticket: '',
  productor: '',
  rfc: '',
  centroAcopio: '',
  fecha: '',
  statusPago: '' as '' | StatusPago,
  hoy: false,
  fechaInicio: '',
  fechaFin: '',
});

// Fecha “hoy” fijo como TSX
const fechaHoy = '07/01/2026';

// Datos mock (igual que TSX)
const pagos = ref<PagoSedeRecord[]>([
  {
    id: 1,
    ticket: '4174',
    fechaEntrega: '06/01/2026',
    fechaSolicitud: '07/01/2026',
    centroAcopio: 'Navojoa',
    rfc: 'AGR140525KP8',
    productor: 'Agrícola San José S.P.R. de R.L.',
    toneladas: 15,
    aPagar: 294431.63,
    statusPago: 'PAGO SOLICITADO',
    banco: 'HSBC',
  },
  {
    id: 2,
    ticket: '4164',
    fechaEntrega: '04/01/2026',
    fechaSolicitud: '06/01/2026',
    centroAcopio: 'Hermosillo',
    rfc: 'LAAA9283920',
    productor: 'Agustín Lara',
    toneladas: 10,
    aPagar: 169959.67,
    statusPago: 'PAGO SOLICITADO',
    banco: 'Banorte',
  },
  {
    id: 3,
    ticket: '4160',
    fechaEntrega: '04/01/2026',
    fechaSolicitud: '06/01/2026',
    centroAcopio: 'Guaymas',
    rfc: 'CAMA901125',
    productor: 'Manuel Camacho',
    toneladas: 6,
    aPagar: 107175.28,
    statusPago: 'AUTORIZADO',
    fechaAutorizacion: '08/01/2026',
    banco: 'Banorte',
  },
  {
    id: 4,
    ticket: '4168',
    fechaEntrega: '06/01/2026',
    fechaSolicitud: '07/01/2026',
    centroAcopio: 'Navojoa',
    rfc: 'GOMM298392',
    productor: 'Mariano Gómez',
    toneladas: 2.5,
    aPagar: 48873.03,
    statusPago: 'AUTORIZADO',
    fechaAutorizacion: '08/01/2026',
    banco: 'BBVA Bancomer',
  },
  {
    id: 5,
    ticket: '4159',
    fechaEntrega: '03/01/2026',
    fechaSolicitud: '05/01/2026',
    centroAcopio: 'Hermosillo',
    rfc: 'VALE920820',
    productor: 'Laura Valenzuela',
    toneladas: 4.5,
    aPagar: 82535.16,
    statusPago: 'PAGADO',
    fechaAutorizacion: '07/01/2026',
    fechaPago: '09/01/2026',
    folioPago: 'FP-2026-001250',
    banco: 'BBVA Bancomer',
  },
  {
    id: 6,
    ticket: '4162',
    fechaEntrega: '06/01/2026',
    fechaSolicitud: '07/01/2026',
    centroAcopio: 'Navojoa',
    rfc: 'GOMM298392',
    productor: 'Mariano Gómez',
    toneladas: 3.195,
    aPagar: 63059.58,
    statusPago: 'PAGADO',
    fechaAutorizacion: '08/01/2026',
    fechaPago: '09/01/2026',
    folioPago: 'FP-2026-001234',
    banco: 'BBVA Bancomer',
  },
]);

// Filtrar pagos (igual TSX: no usa rango de fechas)
const pagosFiltrados = computed(() => {
  return pagos.value.filter((pago) => {
    if (filtros.value.ticket && !pago.ticket.toLowerCase().includes(filtros.value.ticket.toLowerCase())) return false;
    if (filtros.value.productor && !pago.productor.toLowerCase().includes(filtros.value.productor.toLowerCase())) return false;
    if (filtros.value.rfc && !pago.rfc.toLowerCase().includes(filtros.value.rfc.toLowerCase())) return false;
    if (filtros.value.centroAcopio && !pago.centroAcopio.toLowerCase().includes(filtros.value.centroAcopio.toLowerCase())) return false;
    if (filtros.value.statusPago && pago.statusPago !== filtros.value.statusPago) return false;
    if (filtros.value.hoy && pago.fechaSolicitud !== fechaHoy) return false;
    return true;
  });
});

// Pagos de HOY (por fechaSolicitud)
const pagosHoy = computed(() => pagos.value.filter((p) => p.fechaSolicitud === fechaHoy));

const totalSolicitados = computed(() => pagosHoy.value.filter((p) => p.statusPago === 'PAGO SOLICITADO').length);
const totalAutorizados = computed(() => pagosHoy.value.filter((p) => p.statusPago === 'AUTORIZADO').length);
const totalPagados = computed(() => pagosHoy.value.filter((p) => p.statusPago === 'PAGADO').length);

const totalSolicitadosPago = computed(() =>
  pagosHoy.value.filter((p) => p.statusPago === 'PAGO SOLICITADO').reduce((sum, p) => sum + p.aPagar, 0)
);
const totalAutorizadosPago = computed(() =>
  pagosHoy.value.filter((p) => p.statusPago === 'AUTORIZADO').reduce((sum, p) => sum + p.aPagar, 0)
);
const totalPagadosPago = computed(() =>
  pagosHoy.value.filter((p) => p.statusPago === 'PAGADO').reduce((sum, p) => sum + p.aPagar, 0)
);

const totalAPagar = computed(() => pagosFiltrados.value.reduce((sum, p) => sum + p.aPagar, 0));

// Métricas por sede (usa topesPagosSede como entrada)
const metricasPorSede = computed(() => {
  return (props.topesPagosSede || []).map((tope) => {
    const solicitadoHoy = pagos.value
      .filter((p) => p.centroAcopio === tope.sede && p.statusPago === 'PAGO SOLICITADO' && p.fechaSolicitud === fechaHoy)
      .reduce((sum, p) => sum + p.aPagar, 0);

    const disponible = Number(tope.topeDiario || 0) - solicitadoHoy;
    const porcentaje = Number(tope.topeDiario || 0) > 0 ? (solicitadoHoy / Number(tope.topeDiario || 0)) * 100 : 0;

    return { ...tope, solicitadoHoy, disponible, porcentaje };
  });
});

const totalDisponible = computed(() => metricasPorSede.value.reduce((sum, m) => sum + Number(m.disponible || 0), 0));

// Selección proxy para q-table (usa objetos; en TSX usabas IDs)
const selectedRowsProxy = computed({
  get: () => pagosFiltrados.value.filter((p) => selectedRecords.value.includes(p.id)),
  set: (rows: PagoSedeRecord[]) => {
    selectedRecords.value = rows.map((r) => r.id);
  },
});

const todosSeleccionadosSonSolicitados = computed(() => {
  if (selectedRecords.value.length === 0) return false;
  return selectedRecords.value.every((id) => {
    const pago = pagosFiltrados.value.find((p) => p.id === id);
    return pago?.statusPago === 'PAGO SOLICITADO';
  });
});

// Acciones
function handleExportExcel(): void {
  Notify.create({ type: 'info', message: 'Exportando a Excel (mock)...' });
}

function handleAutorizarPagos(): void {
  if (selectedRecords.value.length === 0) {
    Notify.create({ type: 'warning', message: 'Por favor seleccione al menos un pago' });
    return;
  }

  const solicitados = pagosFiltrados.value.filter(
    (p) => selectedRecords.value.includes(p.id) && p.statusPago === 'PAGO SOLICITADO'
  );

  if (solicitados.length === 0) {
    Notify.create({ type: 'warning', message: 'Los pagos seleccionados ya fueron autorizados' });
    return;
  }

  Notify.create({ type: 'info', message: `Autorizando ${solicitados.length} pago(s)... (mock)` });
  selectedRecords.value = [];
}

function handleVerDetallePago(pago: PagoSedeRecord): void {
  pagoSeleccionado.value = pago;
  detallePagoForm.value = {
    fechaAutorizacion: pago.fechaAutorizacion || '',
    fechaPago: pago.fechaPago || '',
    importePago: String(pago.aPagar),
    formaPago: '',
    banco: pago.banco,
    cuenta: '',
    folioPago: pago.folioPago || '',
  };
  showDetallePago.value = true;
}

function handleCerrarDetallePago(): void {
  showDetallePago.value = false;
  pagoSeleccionado.value = null;
  detallePagoForm.value = {
    fechaAutorizacion: '',
    fechaPago: '',
    importePago: '',
    formaPago: '',
    banco: '',
    cuenta: '',
    folioPago: '',
  };
}

function handleAutorizarPago(): void {
  if (!pagoSeleccionado.value) return;

  Notify.create({
    type: 'positive',
    message: `Pago autorizado exitosamente. Fecha: ${detallePagoForm.value.fechaAutorizacion || '-'}`,
  });
  handleCerrarDetallePago();
}

function handleRegistrarPago(): void {
  if (!pagoSeleccionado.value) return;

  Notify.create({
    type: 'positive',
    message: `Pago registrado exitosamente. Folio: ${detallePagoForm.value.folioPago || '-'}`,
  });
  handleCerrarDetallePago();
}

// ESC para cerrar modal (igual TSX)
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && showDetallePago.value) {
    handleCerrarDetallePago();
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

// UI helpers
function money(n: number): string {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusChip(s: StatusPago) {
  switch (s) {
    case 'PAGO SOLICITADO':
      return { label: 'PAGO SOLICITADO', bg: 'orange-2', text: 'orange-10' };
    case 'AUTORIZADO':
      return { label: 'AUTORIZADO', bg: 'blue-2', text: 'blue-10' };
    case 'PAGADO':
      return { label: 'PAGADO', bg: 'green-2', text: 'green-10' };
    default:
      return { label: String(s), bg: 'grey-3', text: 'grey-9' };
  }
}

function colorPorcentaje(pct: number) {
  if (pct >= 100) return 'negative';
  if (pct >= 90) return 'negative';
  if (pct >= 70) return 'warning';
  return 'positive';
}

function chipTope(pct: number) {
  if (pct >= 100) return { label: '🚫 TOPE', bg: 'red-2', text: 'red-10' };
  if (pct >= 90) return { label: '⚠️ Límite', bg: 'orange-2', text: 'orange-10' };
  return { label: '✓ OK', bg: 'green-2', text: 'green-10' };
}

// Options
const statusOptions = [
  { label: 'Todos los Status', value: '' },
  { label: 'PAGO SOLICITADO', value: 'PAGO SOLICITADO' },
  { label: 'AUTORIZADO', value: 'AUTORIZADO' },
  { label: 'PAGADO', value: 'PAGADO' },
];

const bancosOptions = ['BBVA Bancomer', 'Banorte', 'Santander', 'HSBC', 'Scotiabank', 'Banamex'];
const formaPagoOptions = ['Transferencia', 'Cheque'];

// Columnas
const columns = [
  { name: 'index', label: '#', field: 'id', align: 'left' as const },
  { name: 'ticket', label: 'No. Ticket', field: 'ticket', align: 'left' as const },
  { name: 'centroAcopio', label: 'Centro Acopio', field: 'centroAcopio', align: 'left' as const },
  { name: 'fechaEntrega', label: 'Fecha Entrega', field: 'fechaEntrega', align: 'left' as const },
  { name: 'fechaSolicitud', label: 'Fecha Solicitud', field: 'fechaSolicitud', align: 'left' as const },
  { name: 'rfc', label: 'RFC', field: 'rfc', align: 'left' as const },
  { name: 'productor', label: 'Productor', field: 'productor', align: 'left' as const },
  { name: 'banco', label: 'Banco', field: 'banco', align: 'left' as const },
  { name: 'toneladas', label: 'Toneladas', field: 'toneladas', align: 'left' as const },
  { name: 'aPagar', label: 'A Pagar', field: 'aPagar', align: 'left' as const },
  { name: 'statusPago', label: 'Status Pago', field: 'statusPago', align: 'left' as const },
  { name: 'fechaAutorizacion', label: 'Fecha Autorización', field: 'fechaAutorizacion', align: 'left' as const },
  { name: 'fechaPago', label: 'Fecha Pago', field: 'fechaPago', align: 'left' as const },
  { name: 'folioPago', label: 'Folio Pago', field: 'folioPago', align: 'left' as const },
  { name: 'ver', label: 'Ver', field: 'ver', align: 'center' as const },
];

const columnsTopes = [
  { name: 'sede', label: 'Sede', field: 'sede', align: 'left' as const },
  { name: 'disponible', label: 'Disponible', field: 'disponible', align: 'right' as const },
  { name: 'utilizacion', label: 'Utilización', field: 'porcentaje', align: 'left' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'center' as const },
];
</script>
