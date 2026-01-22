<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-btn flat round icon="arrow_back" @click="onBackSafe" />
      <div class="text-h5 text-grey-8">Pagos</div>
    </div>

    <div class="text-h6 text-grey-7 q-mb-md">
      Control de Pagos a Productores - Sede: {{ sedeActualSafe }}
    </div>

    <!-- Tope Diario -->
    <q-card flat bordered class="q-mb-md" style="border: 2px solid #b39ddb;">
      <q-card-section class="q-pa-sm">
        <div class="row items-start justify-between">
          <div class="text-body2 text-weight-bold" style="color:#6a1b9a;">
            Tope Diario de Solicitudes
          </div>

          <div class="text-center">
            <div class="text-caption text-grey-7">Disponible</div>
            <div class="text-weight-bold" :class="montoDisponible > 0 ? 'text-positive' : 'text-negative'">
              ${{ money(montoDisponible) }}
            </div>
          </div>
        </div>

        <div class="row items-center q-gutter-sm q-mt-sm">
          <q-linear-progress
            :value="Math.min(porcentajeUtilizado, 100) / 100"
            :color="colorTope"
            rounded
            size="8px"
            class="col"
          />
          <div class="text-caption text-weight-bold" style="width:42px; text-align:right;">
            {{ porcentajeUtilizado.toFixed(0) }}%
          </div>

          <q-chip
            dense
            :color="chipTopeColor"
            :text-color="chipTopeTextColor"
            class="text-weight-bold"
          >
            {{ chipTopeLabel }}
          </q-chip>
        </div>
      </q-card-section>
    </q-card>

    <!-- Resumen ejecutivo (Cantidad + Monto) -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-md-3">
        <q-card flat bordered class="bg-red-1">
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-sm q-mb-xs">
              <q-icon name="report" class="text-negative" />
              <div class="text-caption text-weight-bold text-grey-8">Solicitar</div>
            </div>
            <div class="row items-end justify-between">
              <div>
                <div class="text-caption text-grey-7">Cantidad</div>
                <div class="text-h5 text-weight-bold text-negative">{{ totalPendientes }}</div>
              </div>
              <div class="text-right">
                <div class="text-caption text-grey-7">Monto</div>
                <div class="text-subtitle1 text-weight-bold text-negative">
                  ${{ money(totalPendientesPago) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered class="bg-orange-1">
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-sm q-mb-xs">
              <q-icon name="schedule" class="text-orange-8" />
              <div class="text-caption text-weight-bold text-grey-8">Pago Solicitado</div>
            </div>
            <div class="row items-end justify-between">
              <div>
                <div class="text-caption text-grey-7">Cantidad</div>
                <div class="text-h5 text-weight-bold text-orange-9">{{ totalEnviados }}</div>
              </div>
              <div class="text-right">
                <div class="text-caption text-grey-7">Monto</div>
                <div class="text-subtitle1 text-weight-bold text-orange-9">
                  ${{ money(totalEnviadosPago) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered class="bg-blue-1">
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-sm q-mb-xs">
              <q-icon name="check_circle" class="text-primary" />
              <div class="text-caption text-weight-bold text-grey-8">Autorizado</div>
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

      <div class="col-12 col-md-3">
        <q-card flat bordered class="bg-green-1">
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-sm q-mb-xs">
              <q-icon name="check_circle" class="text-positive" />
              <div class="text-caption text-weight-bold text-grey-8">Pagado</div>
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
            <q-input v-model="filtros.fecha" outlined dense label="Fecha (texto)" />
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
            <q-btn color="positive" unelevated icon="table_view" label="Exportar Excel" @click="handleExportExcel" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Total a pagar -->
    <div class="row justify-end q-mb-md">
      <q-card flat bordered>
        <q-card-section class="q-px-md q-py-sm">
          <span class="text-caption text-grey-7">TOTAL A PAGAR: </span>
          <span class="text-subtitle1 text-weight-medium">
            ${{ money(totalAPagar) }}
          </span>
        </q-card-section>
      </q-card>
    </div>

    <!-- Acción Enviar a corporativo -->
    <div class="row items-center justify-between q-mb-sm">
      <div>
        <q-btn
          v-if="todosSeleccionadosSonSolicitar"
          color="purple"
          unelevated
          :label="`ENVIAR A CORPORATIVO (${selectedRows.length})`"
          @click="handleEnviarACorporativo"
        />
      </div>
    </div>

    <!-- Tabla -->
    <q-card flat bordered>
      <q-table
        :rows="pagosFiltrados"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :rows-per-page-options="[0]"
        hide-pagination
        selection="multiple"
        v-model:selected="selectedRows"
      >
        <template #body-cell-aPagar="props">
          <q-td :props="props">
            ${{ money(props.row.aPagar) }}
          </q-td>
        </template>

        <template #body-cell-statusPago="props">
          <q-td :props="props">
            <q-chip dense :color="statusChip(props.row.statusPago).color" :text-color="statusChip(props.row.statusPago).text">
              {{ statusChip(props.row.statusPago).label }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-ver="props">
          <q-td :props="props">
            <q-btn flat round dense icon="visibility" color="primary" @click="handleVerDetallePago(props.row)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Modal Detalle de Pago -->
    <q-dialog v-model="showDetallePago" persistent>
      <q-card style="width: 680px; max-width: 96vw;">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6 text-grey-8">Detalle de Pago</div>
          <q-btn flat round dense icon="close" @click="handleCerrarDetallePago" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <!-- Ticket / Productor -->
          <q-card flat bordered>
            <q-card-section class="row items-center justify-between">
              <div class="text-weight-bold text-grey-8">No. Ticket</div>
              <q-input dense outlined readonly style="width: 260px" :model-value="pagoSeleccionado?.ticket || ''" />
            </q-card-section>
          </q-card>

          <q-card flat bordered>
            <q-card-section class="row items-center justify-between">
              <div class="text-weight-bold text-grey-8">Nombre Productor</div>
              <q-input dense outlined readonly style="width: 260px" :model-value="pagoSeleccionado?.productor || ''" />
            </q-card-section>
          </q-card>

          <!-- Contenido por status -->
          <q-card flat bordered class="q-pa-sm">
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

              <template v-if="pagoSeleccionado?.statusPago === 'SOLICITAR'">
                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Fecha de Solicitud</div>
                  <q-input dense outlined type="date" style="width: 260px" v-model="detallePagoForm.fechaSolicitud" />
                </div>

                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Banco</div>
                  <q-select
                    dense outlined style="width: 260px"
                    v-model="detallePagoForm.banco"
                    :options="bancosOptions"
                  />
                </div>

                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Método de Pago</div>
                  <q-select
                    dense outlined style="width: 260px"
                    v-model="detallePagoForm.metodoPago"
                    :options="metodoPagoOptions"
                  />
                </div>

                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">CLABE</div>
                  <q-input
                    dense outlined style="width: 260px"
                    v-model="detallePagoForm.clabe"
                    maxlength="18"
                    placeholder="Ingresa CLABE (18 dígitos)"
                  />
                </div>

                <q-banner dense rounded class="bg-yellow-1 text-yellow-10 q-mt-md">
                  📝 Captura los datos bancarios antes de enviar a Corporativo
                </q-banner>
              </template>

              <template v-else-if="pagoSeleccionado?.statusPago === 'PAGO SOLICITADO'">
                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Fecha de Solicitud</div>
                  <q-input dense outlined readonly style="width: 260px" :model-value="pagoSeleccionado?.fechaSolicitud || ''" />
                </div>

                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Banco</div>
                  <q-input dense outlined readonly style="width: 260px" :model-value="pagoSeleccionado?.banco || ''" />
                </div>

                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Método de Pago</div>
                  <q-input dense outlined readonly style="width: 260px" :model-value="pagoSeleccionado?.metodoPago || '-'" />
                </div>

                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">CLABE</div>
                  <q-input dense outlined readonly style="width: 260px" :model-value="pagoSeleccionado?.clabe || '-'" />
                </div>

                <q-banner dense rounded class="bg-orange-1 text-orange-10 q-mt-md">
                  ⏳ Este pago está esperando autorización de Corporativo
                </q-banner>
              </template>

              <template v-else>
                <div v-if="pagoSeleccionado?.fechaAutorizacion" class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Fecha de Autorización</div>
                  <q-input dense outlined readonly style="width: 260px" :model-value="pagoSeleccionado?.fechaAutorizacion || ''" />
                </div>

                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Fecha de Pago</div>
                  <q-input
                    dense
                    outlined
                    type="date"
                    style="width: 260px"
                    v-model="detallePagoForm.fechaPago"
                    :disable="pagoSeleccionado?.statusPago === 'PAGADO'"
                  />
                </div>

                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Importe de Pago</div>
                  <q-input
                    dense
                    outlined
                    style="width: 260px"
                    v-model="detallePagoForm.importePago"
                    :disable="pagoSeleccionado?.statusPago === 'PAGADO'"
                  />
                </div>

                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Forma de Pago</div>
                  <q-select
                    dense outlined style="width: 260px"
                    v-model="detallePagoForm.formaPago"
                    :options="formaPagoOptions"
                    :disable="pagoSeleccionado?.statusPago === 'PAGADO'"
                  />
                </div>

                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Banco</div>
                  <q-select
                    dense outlined style="width: 260px"
                    v-model="detallePagoForm.banco"
                    :options="bancosOptions"
                    :disable="pagoSeleccionado?.statusPago === 'PAGADO'"
                  />
                </div>

                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Cuenta</div>
                  <q-input
                    dense outlined style="width: 260px"
                    v-model="detallePagoForm.cuenta"
                    :disable="pagoSeleccionado?.statusPago === 'PAGADO'"
                  />
                </div>

                <div v-if="pagoSeleccionado?.folioPago" class="row items-center justify-between">
                  <div class="text-weight-bold text-grey-8">Folio de Pago</div>
                  <q-input dense outlined readonly style="width: 260px" :model-value="pagoSeleccionado?.folioPago || ''" />
                </div>

                <q-banner
                  v-if="pagoSeleccionado?.statusPago === 'AUTORIZADO'"
                  dense rounded class="bg-blue-1 text-blue-10 q-mt-md"
                >
                  ✅ Este pago está autorizado. Captura los datos de ejecución del pago.
                </q-banner>

                <q-banner
                  v-if="pagoSeleccionado?.statusPago === 'PAGADO'"
                  dense rounded class="bg-green-1 text-green-10 q-mt-md"
                >
                  ✅ Este pago ya fue ejecutado exitosamente.
                </q-banner>
              </template>
            </q-card-section>
          </q-card>
        </q-card-section>

        <q-separator />

        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            v-if="pagoSeleccionado?.statusPago === 'AUTORIZADO'"
            color="orange"
            unelevated
            label="Ejecutar Pago"
            style="min-width: 260px"
            @click="handleGuardarDetallePago"
          />
          <q-btn
            v-else
            color="grey-7"
            unelevated
            label="Cerrar"
            style="min-width: 260px"
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

type StatusPago = 'SOLICITAR' | 'PAGO SOLICITADO' | 'AUTORIZADO' | 'PAGADO';

interface PagosProductoresFlowProps {
  onBack?: () => void;
  ticketsPendientes?: string[];
  sedeActual?: string;
  topeDiario?: number;
}

interface PagoRecord {
  id: number;
  ticket: string;
  fecha: string;
  fechaSolicitud: string;
  rfc: string;
  productor: string;
  toneladas: number;
  netoAPagar: number;
  precio: number;
  importe: number;
  aPagar: number;
  statusPago: StatusPago;
  fechaAutorizacion?: string;
  fechaPago?: string;
  folioPago?: string;
  banco: string;
  metodoPago?: string;
  clabe?: string;
}

const props = withDefaults(defineProps<PagosProductoresFlowProps>(), {
  onBack: undefined,
  ticketsPendientes: () => [],
  sedeActual: 'Navojoa',
  topeDiario: 5000000,
});

const onBackSafe = () => (props.onBack ? props.onBack() : undefined);
const sedeActualSafe = computed(() => props.sedeActual || 'Navojoa');
const topeDiarioSafe = computed(() => Number(props.topeDiario || 0));

// Estado selección/tabla
const selectedRows = ref<PagoRecord[]>([]);

// Modal detalle
const showDetallePago = ref(false);
const pagoSeleccionado = ref<PagoRecord | null>(null);
const detallePagoForm = ref({
  fechaPago: '',
  importePago: '',
  formaPago: '',
  banco: '',
  cuenta: '',
  metodoPago: '',
  clabe: '',
  fechaSolicitud: '',
});

// Filtros
const filtros = ref({
  ticket: '',
  productor: '',
  rfc: '',
  fecha: '',
  statusPago: '' as '' | StatusPago,
  hoy: false,
  fechaInicio: '',
  fechaFin: '',
});

// Datos (mock igual que TSX)
const pagos = ref<PagoRecord[]>([
  {
    id: 1,
    ticket: '4162',
    fecha: '06/01/2026',
    fechaSolicitud: '07/01/2026',
    rfc: 'GOMM298392',
    productor: 'Mariano Gómez',
    toneladas: 3.195,
    netoAPagar: 3195,
    precio: 20,
    importe: 63900,
    aPagar: 63059.58,
    statusPago: 'PAGADO',
    fechaAutorizacion: '08/01/2026',
    fechaPago: '09/01/2026',
    folioPago: 'FP-2026-001234',
    banco: 'BBVA Bancomer',
  },
  {
    id: 2,
    ticket: '4165',
    fecha: '06/01/2026',
    fechaSolicitud: '07/01/2026',
    rfc: 'GOMM298392',
    productor: 'Mariano Gómez',
    toneladas: 5,
    netoAPagar: 4950,
    precio: 20,
    importe: 99000,
    aPagar: 97746.05,
    statusPago: 'PAGADO',
    fechaAutorizacion: '08/01/2026',
    fechaPago: '09/01/2026',
    folioPago: 'FP-2026-001235',
    banco: 'BBVA Bancomer',
  },
  {
    id: 3,
    ticket: '4168',
    fecha: '06/01/2026',
    fechaSolicitud: '07/01/2026',
    rfc: 'GOMM298392',
    productor: 'Mariano Gómez',
    toneladas: 2.5,
    netoAPagar: 2475,
    precio: 20,
    importe: 49500,
    aPagar: 48873.03,
    statusPago: 'AUTORIZADO',
    fechaAutorizacion: '08/01/2026',
    banco: 'BBVA Bancomer',
  },
  {
    id: 4,
    ticket: '4164',
    fecha: '04/01/2026',
    fechaSolicitud: '06/01/2026',
    rfc: 'LAAA9283920',
    productor: 'Agustín Lara',
    toneladas: 10,
    netoAPagar: 8607,
    precio: 20,
    importe: 172140,
    aPagar: 169959.67,
    statusPago: 'PAGO SOLICITADO',
    banco: 'Banorte',
  },
  {
    id: 5,
    ticket: '4174',
    fecha: '06/01/2026',
    fechaSolicitud: '07/01/2026',
    rfc: 'AGR140525KP8',
    productor: 'Agrícola San José S.P.R. de R.L.',
    toneladas: 15,
    netoAPagar: 14550,
    precio: 20.5,
    importe: 298275,
    aPagar: 294431.63,
    statusPago: 'SOLICITAR',
    banco: 'HSBC',
  },
  {
    id: 6,
    ticket: '4158',
    fecha: '03/01/2026',
    fechaSolicitud: '05/01/2026',
    rfc: 'ROME850615',
    productor: 'Eduardo Romero Méndez',
    toneladas: 8,
    netoAPagar: 7720,
    precio: 19.5,
    importe: 150540,
    aPagar: 148533.3,
    statusPago: 'PAGADO',
    fechaAutorizacion: '06/01/2026',
    fechaPago: '08/01/2026',
    folioPago: 'FP-2026-001220',
    banco: 'Santander',
  },
  {
    id: 7,
    ticket: '4159',
    fecha: '03/01/2026',
    fechaSolicitud: '05/01/2026',
    rfc: 'VALE920820',
    productor: 'Laura Valenzuela',
    toneladas: 4.5,
    netoAPagar: 4342,
    precio: 19.25,
    importe: 83583.5,
    aPagar: 82535.16,
    statusPago: 'AUTORIZADO',
    fechaAutorizacion: '07/01/2026',
    banco: 'BBVA Bancomer',
  },
  {
    id: 8,
    ticket: '4160',
    fecha: '04/01/2026',
    fechaSolicitud: '06/01/2026',
    rfc: 'CAMA901125',
    productor: 'Manuel Camacho',
    toneladas: 6,
    netoAPagar: 5790,
    precio: 18.75,
    importe: 108562.5,
    aPagar: 107175.28,
    statusPago: 'PAGO SOLICITADO',
    banco: 'Banorte',
  },
]);

// Fecha “hoy” (manteniendo fijo como en TSX)
const fechaHoy = '07/01/2026';

// Filtro
const pagosFiltrados = computed(() => {
  return pagos.value.filter((pago) => {
    if (filtros.value.ticket && !pago.ticket.toLowerCase().includes(filtros.value.ticket.toLowerCase())) return false;
    if (filtros.value.productor && !pago.productor.toLowerCase().includes(filtros.value.productor.toLowerCase())) return false;
    if (filtros.value.rfc && !pago.rfc.toLowerCase().includes(filtros.value.rfc.toLowerCase())) return false;
    if (filtros.value.statusPago && pago.statusPago !== filtros.value.statusPago) return false;

    // “fecha” del filtro es texto libre como en TSX (no se usaba realmente para filtrar por rango)
    if (filtros.value.fecha && !pago.fecha.toLowerCase().includes(filtros.value.fecha.toLowerCase())) return false;

    if (filtros.value.hoy && pago.fecha !== fechaHoy) return false;

    // NOTA: fechaInicio/fechaFin existen en UI original pero no se aplicaban en el TSX.
    // Se conservan sin “inventar” lógica adicional.

    return true;
  });
});

// Métricas
const totalPendientes = computed(() => pagosFiltrados.value.filter((p) => p.statusPago === 'SOLICITAR').length);
const totalEnviados = computed(() => pagosFiltrados.value.filter((p) => p.statusPago === 'PAGO SOLICITADO').length);
const totalAutorizados = computed(() => pagosFiltrados.value.filter((p) => p.statusPago === 'AUTORIZADO' && p.fechaAutorizacion === fechaHoy).length);
const totalPagados = computed(() => pagosFiltrados.value.filter((p) => p.statusPago === 'PAGADO' && p.fechaPago === fechaHoy).length);

const totalAPagar = computed(() => pagosFiltrados.value.reduce((sum, p) => sum + p.aPagar, 0));
const totalPendientesPago = computed(() => pagosFiltrados.value.filter((p) => p.statusPago === 'SOLICITAR').reduce((sum, p) => sum + p.aPagar, 0));
const totalEnviadosPago = computed(() => pagosFiltrados.value.filter((p) => p.statusPago === 'PAGO SOLICITADO').reduce((sum, p) => sum + p.aPagar, 0));
const totalAutorizadosPago = computed(() => pagosFiltrados.value.filter((p) => p.statusPago === 'AUTORIZADO' && p.fechaAutorizacion === fechaHoy).reduce((sum, p) => sum + p.aPagar, 0));
const totalPagadosPago = computed(() => pagosFiltrados.value.filter((p) => p.statusPago === 'PAGADO' && p.fechaPago === fechaHoy).reduce((sum, p) => sum + p.aPagar, 0));

// Tope diario
const montoSolicitadoHoy = computed(() =>
  pagos.value
    .filter((p) => p.statusPago === 'PAGO SOLICITADO' && p.fechaSolicitud === fechaHoy)
    .reduce((sum, p) => sum + p.aPagar, 0)
);

const montoDisponible = computed(() => topeDiarioSafe.value - montoSolicitadoHoy.value);
const porcentajeUtilizado = computed(() => (topeDiarioSafe.value <= 0 ? 0 : (montoSolicitadoHoy.value / topeDiarioSafe.value) * 100));

const colorTope = computed(() => {
  const pct = porcentajeUtilizado.value;
  if (pct >= 100) return 'negative';
  if (pct >= 90) return 'negative';
  if (pct >= 70) return 'warning';
  return 'positive';
});

const chipTopeLabel = computed(() => {
  const pct = porcentajeUtilizado.value;
  if (pct >= 100) return '🚫 TOPE';
  if (pct >= 90) return '⚠️ Límite';
  return '✓ OK';
});

const chipTopeColor = computed(() => {
  const pct = porcentajeUtilizado.value;
  if (pct >= 100) return 'red-2';
  if (pct >= 90) return 'orange-2';
  return 'green-2';
});

const chipTopeTextColor = computed(() => {
  const pct = porcentajeUtilizado.value;
  if (pct >= 100) return 'red-10';
  if (pct >= 90) return 'orange-10';
  return 'green-10';
});

// Selección válida para botón
const todosSeleccionadosSonSolicitar = computed(() => {
  if (selectedRows.value.length === 0) return false;
  return selectedRows.value.every((r) => r.statusPago === 'SOLICITAR');
});

// UI helpers
function money(n: number): string {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusChip(s: StatusPago) {
  switch (s) {
    case 'SOLICITAR':
      return { label: 'SOLICITAR', color: 'red-2', text: 'red-10' };
    case 'PAGO SOLICITADO':
      return { label: 'PAGO SOLICITADO', color: 'orange-2', text: 'orange-10' };
    case 'AUTORIZADO':
      return { label: 'AUTORIZADO', color: 'blue-2', text: 'blue-10' };
    case 'PAGADO':
      return { label: 'PAGADO', color: 'green-2', text: 'green-10' };
    default:
      return { label: String(s), color: 'grey-3', text: 'grey-9' };
  }
}

// Acciones
function handleExportExcel(): void {
  Notify.create({ type: 'info', message: 'Exportando a Excel (mock)...' });
}

function handleEnviarACorporativo(): void {
  if (selectedRows.value.length === 0) {
    Notify.create({ type: 'warning', message: 'Por favor seleccione al menos un pago' });
    return;
  }

  const pendientes = selectedRows.value.filter((p) => p.statusPago === 'SOLICITAR');
  if (pendientes.length === 0) {
    Notify.create({ type: 'warning', message: 'Los pagos seleccionados ya fueron enviados' });
    return;
  }

  const montoSeleccionado = pendientes.reduce((sum, p) => sum + p.aPagar, 0);
  const nuevoMontoSolicitado = montoSolicitadoHoy.value + montoSeleccionado;

  if (nuevoMontoSolicitado > topeDiarioSafe.value) {
    const excedente = nuevoMontoSolicitado - topeDiarioSafe.value;

    Dialog.create({
      title: '⚠️ ERROR: TOPE DIARIO EXCEDIDO',
      message:
        `Monto seleccionado: $${money(montoSeleccionado)}\n` +
        `Ya solicitado hoy: $${money(montoSolicitadoHoy.value)}\n` +
        `Total: $${money(nuevoMontoSolicitado)}\n\n` +
        `Tope diario: $${money(topeDiarioSafe.value)}\n` +
        `Excedente: $${money(excedente)}\n\n` +
        'Por favor, reduce la selección o espera hasta mañana.',
      ok: { label: 'Entendido', color: 'negative' },
    });
    return;
  }

  const porcentajeNuevo = (nuevoMontoSolicitado / topeDiarioSafe.value) * 100;
  const ejecutar = () => {
    // Mock: solo notifica y limpia selección
    Dialog.create({
      title: '✅ Solicitud enviada a Corporativo',
      message:
        `Pagos enviados: ${pendientes.length}\n` +
        `Monto: $${money(montoSeleccionado)}\n\n` +
        'Los pagos quedarán en estado "PAGO SOLICITADO" esperando autorización.',
      ok: { label: 'OK', color: 'positive' },
    });

    selectedRows.value = [];
  };

  if (porcentajeNuevo >= 90) {
    Dialog.create({
      title: '⚠️ ADVERTENCIA',
      message:
        `Utilizarás el ${porcentajeNuevo.toFixed(1)}% del tope diario\n\n` +
        `Monto a solicitar: $${money(montoSeleccionado)}\n` +
        `Total solicitado hoy: $${money(nuevoMontoSolicitado)}\n` +
        `Tope diario: $${money(topeDiarioSafe.value)}\n\n` +
        '¿Deseas continuar?',
      cancel: true,
      persistent: true,
      ok: { label: 'Continuar', color: 'purple' },
    }).onOk(() => ejecutar());
    return;
  }

  ejecutar();
}

function handleVerDetallePago(pago: PagoRecord): void {
  pagoSeleccionado.value = pago;
  showDetallePago.value = true;

  // Precarga similar a TSX (manteniendo campos)
  detallePagoForm.value = {
    fechaPago: pago.fechaPago || '',
    importePago: pago.statusPago === 'PAGADO' ? `$${money(pago.aPagar)}` : `$${money(pago.aPagar)}`,
    formaPago: '',
    banco: pago.banco || '',
    cuenta: '',
    metodoPago: pago.metodoPago || '',
    clabe: pago.clabe || '',
    fechaSolicitud: pago.fechaSolicitud || fechaHoy,
  };
}

function handleCerrarDetallePago(): void {
  showDetallePago.value = false;
  pagoSeleccionado.value = null;
  detallePagoForm.value = {
    fechaPago: '',
    importePago: '',
    formaPago: '',
    banco: '',
    cuenta: '',
    metodoPago: '',
    clabe: '',
    fechaSolicitud: '',
  };
}

function handleGuardarDetallePago(): void {
  if (!pagoSeleccionado.value) return;

  // Mock: marcar como PAGADO y asignar folio
  const id = pagoSeleccionado.value.id;
  const folio = 'FP-2026-001236';

  pagos.value = pagos.value.map((p) =>
    p.id === id
      ? {
          ...p,
          fechaPago: detallePagoForm.value.fechaPago || p.fechaPago || fechaHoy,
          folioPago: folio,
          statusPago: 'PAGADO',
        }
      : p
  );

  handleCerrarDetallePago();
  Notify.create({ type: 'positive', message: 'Pago guardado exitosamente (mock)' });
}

// Cerrar modal con ESC (equivalente al useEffect TSX)
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && showDetallePago.value) {
    handleCerrarDetallePago();
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

// Options UI
const statusOptions = [
  { label: 'Todos los Status', value: '' },
  { label: 'SOLICITAR', value: 'SOLICITAR' },
  { label: 'PAGO SOLICITADO', value: 'PAGO SOLICITADO' },
  { label: 'AUTORIZADO', value: 'AUTORIZADO' },
  { label: 'PAGADO', value: 'PAGADO' },
];

const bancosOptions = ['BBVA Bancomer', 'Banorte', 'Santander', 'HSBC', 'Scotiabank', 'Banamex'];
const metodoPagoOptions = ['Transferencia', 'Cheque', 'Efectivo'];
const formaPagoOptions = ['Transferencia', 'Cheque', 'Efectivo'];

// Columnas tabla
const columns = [
  { name: 'ticket', label: 'No. Ticket', field: 'ticket', align: 'left' as const },
  { name: 'fecha', label: 'Fecha Entrega', field: 'fecha', align: 'left' as const },
  { name: 'fechaSolicitud', label: 'Fecha Solicitud', field: 'fechaSolicitud', align: 'left' as const },
  { name: 'rfc', label: 'RFC', field: 'rfc', align: 'left' as const },
  { name: 'productor', label: 'Productor', field: 'productor', align: 'left' as const },
  { name: 'banco', label: 'Banco', field: 'banco', align: 'left' as const },
  { name: 'toneladas', label: 'Toneladas', field: 'toneladas', align: 'right' as const },
  { name: 'aPagar', label: 'A Pagar', field: 'aPagar', align: 'right' as const },
  { name: 'statusPago', label: 'Status Pago', field: 'statusPago', align: 'left' as const },
  { name: 'fechaPago', label: 'Fecha Pago', field: 'fechaPago', align: 'left' as const },
  { name: 'folioPago', label: 'Folio Pago', field: 'folioPago', align: 'left' as const },
  { name: 'ver', label: 'Ver', field: 'ver', align: 'center' as const },
];
</script>
