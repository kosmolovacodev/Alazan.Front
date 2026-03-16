<template>
  <q-page class="q-pa-md bg-grey-2">

    <!-- ══════════════════════════════════════════════
         HEADER
    ══════════════════════════════════════════════ -->
    <div class="row items-center q-gutter-md q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-grey-8">Pagos – Sede Corporativo</div>
        <div class="text-caption text-grey-6">Autorización y Registro de Pagos</div>
      </div>
      <div class="col-auto">
        <q-btn flat round icon="refresh" color="primary" :loading="loading" @click="cargarDatos" />
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         MONITOR DE TOPES POR SEDE
    ══════════════════════════════════════════════ -->
    <q-card flat bordered class="q-mb-md" style="border: 2px solid #9333EA;">
      <q-card-section class="q-py-sm">
        <div class="row items-center justify-between q-mb-sm">
          <span class="text-subtitle2 text-purple-8">Monitor de Topes Diarios por Sede</span>
          <div class="text-right">
            <div class="text-caption text-grey-6">Total Disponible</div>
            <div class="text-subtitle1 text-weight-bold text-green-7">
              {{ formatCurrencyM(totalDisponibleSedes) }}
            </div>
          </div>
        </div>
        <q-table
          :rows="topesSedes"
          :columns="columnsTopesSedes"
          flat dense hide-bottom
          row-key="id"
          :rows-per-page-options="[0]"
        >
          <template v-slot:body-cell-disponible="props">
            <q-td :props="props" class="text-right">
              <span class="text-weight-bold"
                :class="props.row.disponible > 0 ? 'text-green-7' : 'text-red-7'">
                {{ formatCurrencyM(props.row.disponible) }}
              </span>
            </q-td>
          </template>
          <template v-slot:body-cell-utilizacion="props">
            <q-td :props="props" style="min-width:200px;">
              <div class="row items-center q-gutter-sm">
                <div class="col">
                  <q-linear-progress
                    :value="Math.min(props.row.porcentaje / 100, 1)"
                    :color="getColorTope(props.row.porcentaje)"
                    track-color="grey-3"
                    size="8px" rounded
                  />
                </div>
                <div class="text-caption text-weight-bold" style="min-width:36px;text-align:right;">
                  {{ props.row.porcentaje.toFixed(0) }}%
                </div>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-estado="props">
            <q-td :props="props" class="text-center">
              <q-badge
                :color="getColorTope(props.row.porcentaje)"
                :label="getEtiquetaTope(props.row.porcentaje)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- ══════════════════════════════════════════════
         KPIs (solo registros de HOY)
    ══════════════════════════════════════════════ -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="bg-orange-1">
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-xs q-mb-xs">
              <q-icon name="schedule" color="orange-7" size="18px" />
              <span class="text-caption text-weight-bold text-grey-8">Pago Solicitado (Hoy)</span>
            </div>
            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey-6">Cant.</div>
                <div class="text-h5 text-weight-bold text-orange-9">{{ kpiSolicitadoHoy.count }}</div>
              </div>
              <div class="text-right">
                <div class="text-caption text-grey-6">Monto</div>
                <div class="text-subtitle2 text-weight-bold text-orange-7">{{ formatCurrency(kpiSolicitadoHoy.monto) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="bg-purple-1">
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-xs q-mb-xs">
              <q-icon name="check_circle" color="purple-7" size="18px" />
              <span class="text-caption text-weight-bold text-grey-8">Autorizado (Hoy)</span>
            </div>
            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey-6">Cant.</div>
                <div class="text-h5 text-weight-bold text-purple-9">{{ kpiAutorizadoHoy.count }}</div>
              </div>
              <div class="text-right">
                <div class="text-caption text-grey-6">Monto</div>
                <div class="text-subtitle2 text-weight-bold text-purple-7">{{ formatCurrency(kpiAutorizadoHoy.monto) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="bg-green-1">
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-xs q-mb-xs">
              <q-icon name="check_circle" color="green-7" size="18px" />
              <span class="text-caption text-weight-bold text-grey-8">Pagado (Hoy)</span>
            </div>
            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey-6">Cant.</div>
                <div class="text-h5 text-weight-bold text-green-9">{{ kpiPagadoHoy.count }}</div>
              </div>
              <div class="text-right">
                <div class="text-caption text-grey-6">Monto</div>
                <div class="text-subtitle2 text-weight-bold text-green-7">{{ formatCurrency(kpiPagadoHoy.monto) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         FILTROS
    ══════════════════════════════════════════════ -->
    <q-card flat bordered class="q-mb-md bg-white">
      <q-card-section>
        <div class="text-center text-subtitle2 q-mb-md">Filtros</div>
        <div class="row q-col-gutter-md q-mb-sm">
          <div class="col-12 col-sm-6 col-md">
            <q-input v-model="filtros.ticket" dense outlined placeholder="Ticket" clearable />
          </div>
          <div class="col-12 col-sm-6 col-md">
            <q-input v-model="filtros.productor" dense outlined placeholder="Productor" clearable />
          </div>
          <div class="col-12 col-sm-6 col-md">
            <q-input v-model="filtros.rfc" dense outlined placeholder="RFC" clearable />
          </div>
          <div class="col-12 col-sm-6 col-md">
            <q-input v-model="filtros.centroAcopio" dense outlined placeholder="Centro Acopio" clearable />
          </div>
          <div class="col-12 col-sm-6 col-md">
            <q-select
              v-model="filtros.statusPago"
              dense outlined clearable
              label="Status"
              :options="statusOptions"
              emit-value map-options
            />
          </div>
        </div>
        <div class="row items-center q-col-gutter-sm">
          <div class="col-auto">
            <q-checkbox v-model="filtros.hoy" label="Solo hoy" />
          </div>
          <div class="col-auto">
            <q-input v-model="filtros.fechaInicio" dense outlined type="date" style="max-width:160px;" />
          </div>
          <div class="col-auto text-grey-6">a</div>
          <div class="col-auto">
            <q-input v-model="filtros.fechaFin" dense outlined type="date" style="max-width:160px;" />
          </div>
          <q-space />
          <div class="col-auto">
            <q-btn
              color="green-7"
              icon="table_view"
              label="Exportar Excel"
              :loading="exportando"
              @click="handleExportarExcel"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- ══════════════════════════════════════════════
         TOTAL + BOTÓN AUTORIZAR
    ══════════════════════════════════════════════ -->
    <div class="row items-center justify-between q-mb-sm">
      <div>
        <q-btn
          v-if="todosSeleccionadosSonSolicitados"
          color="blue-7"
          icon="verified"
          :label="`Autorizar Pagos (${selected.length})`"
          :loading="autorizando"
          @click="handleAutorizarPagos"
        />
      </div>
      <q-card flat bordered class="bg-white">
        <q-card-section class="q-py-sm q-px-md">
          <span class="text-caption text-grey-7">TOTAL: </span>
          <span class="text-subtitle1 text-weight-bold">{{ formatCurrency(totalAPagar) }}</span>
        </q-card-section>
      </q-card>
    </div>

    <!-- ══════════════════════════════════════════════
         TABLA
    ══════════════════════════════════════════════ -->
    <q-card flat bordered class="bg-white">
      <q-table
        :rows="pagosFiltrados"
        :columns="columns"
        row-key="id"
        selection="multiple"
        v-model:selected="selected"
        :loading="loading"
        flat dense
        :rows-per-page-options="[15, 25, 50, 0]"
        rows-per-page-label="Filas por página"
      >
        <template v-slot:body-cell-statusPago="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.row.status_pago)" :label="props.row.status_pago" />
          </q-td>
        </template>

        <template v-slot:body-cell-toneladas="props">
          <q-td :props="props" class="text-right">
            {{ Number(props.row.toneladas).toFixed(3) }}
          </q-td>
        </template>

        <template v-slot:body-cell-aPagar="props">
          <q-td :props="props" class="text-right">
            {{ formatCurrency(props.row.monto_solicitado) }}
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-center">
            <q-btn flat round dense icon="visibility" color="primary" size="sm"
              @click="handleVerDetalle(props.row)" />
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-6">
            <q-icon name="inbox" size="24px" class="q-mr-sm" />
            Sin registros
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- ══════════════════════════════════════════════
         MODAL DETALLE / AUTORIZAR / REGISTRAR PAGO
    ══════════════════════════════════════════════ -->
    <q-dialog v-model="showDetalle" persistent>
      <q-card style="min-width: 600px; max-width: 680px;" class="q-pa-sm">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            <span v-if="pagoSeleccionado?.status_pago === 'PAGO SOLICITADO'">Autorizar Pago</span>
            <span v-else-if="pagoSeleccionado?.status_pago === 'AUTORIZADO'">Registrar Pago</span>
            <span v-else>Detalle de Pago</span>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="pagoSeleccionado" class="q-pt-sm">
          <!-- Info básica 2 columnas -->
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input :model-value="pagoSeleccionado.ticket"
                label="No. Ticket" dense outlined readonly />
            </div>
            <div class="col-6">
              <q-input :model-value="pagoSeleccionado.nombre_sede ?? '-'"
                label="Centro de Acopio" dense outlined readonly />
            </div>
            <div class="col-12">
              <q-input :model-value="pagoSeleccionado.nombre_productor"
                label="Nombre Productor" dense outlined readonly />
            </div>
            <div class="col-12">
              <q-input :model-value="formatCurrency(pagoSeleccionado.monto_solicitado)"
                label="A Pagar" dense outlined readonly />
            </div>
          </div>

          <q-separator class="q-mb-sm" />

          <!-- ── PAGO SOLICITADO: autorizar ── -->
          <template v-if="pagoSeleccionado.status_pago === 'PAGO SOLICITADO'">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.fecha_solicitud ?? '-'"
                  label="Fecha de Solicitud" dense outlined readonly />
              </div>
              <div class="col-12">
                <q-input
                  v-model="detallePagoForm.fechaAutorizacion"
                  label="Fecha de Autorización" type="date" dense outlined
                />
              </div>
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.nombre_banco ?? '-'"
                  label="Banco del Productor" dense outlined readonly />
              </div>
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.clabe ?? '-'"
                  label="CLABE" dense outlined readonly />
              </div>
            </div>
            <q-banner dense class="bg-orange-1 text-orange-9 q-mt-sm rounded-borders">
              <template v-slot:avatar><q-icon name="schedule" /></template>
              Revisa los datos y confirma la autorización del pago.
            </q-banner>
          </template>

          <!-- ── AUTORIZADO: registrar pago ── -->
          <template v-else-if="pagoSeleccionado.status_pago === 'AUTORIZADO'">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.fecha_autorizacion ?? '-'"
                  label="Fecha de Autorización" dense outlined readonly />
              </div>
              <div class="col-12">
                <q-input
                  v-model="detallePagoForm.fechaPago"
                  label="Fecha de Pago" type="date" dense outlined
                />
              </div>
              <div class="col-12">
                <q-select
                  v-model="detallePagoForm.formaPagoId"
                  :options="formasPagoOptions"
                  option-value="id" option-label="nombre"
                  emit-value map-options
                  label="Forma de Pago" dense outlined clearable
                />
              </div>
              <div class="col-12">
                <q-select
                  v-model="detallePagoForm.bancoId"
                  :options="bancosOptions"
                  option-value="id" option-label="nombre_banco"
                  emit-value map-options
                  label="Banco" dense outlined clearable
                />
              </div>
              <div class="col-12">
                <q-input v-model="detallePagoForm.cuenta" label="Cuenta" dense outlined />
              </div>
              <div class="col-12">
                <q-input v-model="detallePagoForm.folioPago" label="Folio de Pago" dense outlined />
              </div>
            </div>
            <q-banner dense class="bg-purple-1 text-purple-9 q-mt-sm rounded-borders">
              <template v-slot:avatar><q-icon name="check_circle" /></template>
              Pago autorizado. Completa los datos de ejecución.
            </q-banner>
          </template>

          <!-- ── PAGADO: solo lectura ── -->
          <template v-else-if="pagoSeleccionado.status_pago === 'PAGADO'">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.fecha_autorizacion ?? '-'"
                  label="Fecha de Autorización" dense outlined readonly />
              </div>
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.fecha_pago ?? '-'"
                  label="Fecha de Pago" dense outlined readonly />
              </div>
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.nombre_banco ?? '-'"
                  label="Banco" dense outlined readonly />
              </div>
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.nombre_forma_pago ?? '-'"
                  label="Forma de Pago" dense outlined readonly />
              </div>
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.cuenta ?? '-'"
                  label="Cuenta" dense outlined readonly />
              </div>
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.folio_pago ?? '-'"
                  label="Folio de Pago" dense outlined readonly />
              </div>
            </div>
            <q-banner dense class="bg-green-1 text-green-9 q-mt-sm rounded-borders">
              <template v-slot:avatar><q-icon name="check_circle" /></template>
              Pago ejecutado exitosamente.
            </q-banner>
          </template>
        </q-card-section>

        <!-- Botones del modal -->
        <q-card-actions align="center" class="q-pt-none">
          <template v-if="pagoSeleccionado?.status_pago === 'PAGO SOLICITADO'">
            <q-btn color="grey-6" label="Cancelar" flat v-close-popup class="q-mr-sm" />
            <q-btn
              color="blue-7" label="Autorizar"
              :loading="guardando"
              @click="handleAutorizarPago"
            />
          </template>
          <template v-else-if="pagoSeleccionado?.status_pago === 'AUTORIZADO'">
            <q-btn color="grey-6" label="Cancelar" flat v-close-popup class="q-mr-sm" />
            <q-btn
              color="green-7" label="Registrar Pago"
              :loading="guardando"
              @click="handleRegistrarPago"
            />
          </template>
          <template v-else>
            <q-btn color="grey-6" label="Cerrar" v-close-popup />
          </template>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/auth'

// ══════════════════════════════════════════════════════════════════
//  INTERFACES
// ══════════════════════════════════════════════════════════════════
interface PagoSedeRecord {
  id: number
  facturacion_id: number
  ticket: string
  fecha_entrega: string | null
  fecha_solicitud: string | null
  fecha_autorizacion: string | null
  fecha_pago: string | null
  folio_pago: string | null
  rfc_productor: string
  nombre_productor: string
  toneladas: number
  precio_promedio: number
  importe_factura: number
  monto_solicitado: number
  status_pago: 'PAGO SOLICITADO' | 'AUTORIZADO' | 'PAGADO'
  banco_id: number | null
  nombre_banco: string | null
  forma_pago_id: number | null
  nombre_forma_pago: string | null
  clabe: string | null
  cuenta: string | null
  sede_id: number
  nombre_sede: string | null
}

interface TopeSede {
  id: number
  nombre_sede: string
  ciudad: string
  estado: string
  tope_diario: number
  solicitado_hoy: number
  disponible: number
  porcentaje: number
}

interface BancoOption { id: number; nombre_banco: string; codigo_banco: string }
interface FormaPagoOption { id: number; nombre: string; codigo: string }

// ══════════════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════════════
const $q = useQuasar()
const authStore = useAuthStore()

const pagos      = ref<PagoSedeRecord[]>([])
const loading    = ref(false)
const exportando = ref(false)
const autorizando = ref(false)
const guardando  = ref(false)
const selected   = ref<PagoSedeRecord[]>([])

const topesSedes        = ref<TopeSede[]>([])
const bancosOptions     = ref<BancoOption[]>([])
const formasPagoOptions = ref<FormaPagoOption[]>([])

const filtros = ref({
  ticket:       '',
  productor:    '',
  rfc:          '',
  centroAcopio: '',
  statusPago:   '' as string,
  fechaInicio:  '',
  fechaFin:     '',
  hoy:          false,
})

const showDetalle      = ref(false)
const pagoSeleccionado = ref<PagoSedeRecord | null>(null)
const detallePagoForm  = ref({
  fechaAutorizacion: '',
  fechaPago:         '',
  bancoId:           null as number | null,
  formaPagoId:       null as number | null,
  cuenta:            '',
  folioPago:         '',
})

// ══════════════════════════════════════════════════════════════════
//  COLUMNAS q-table
// ══════════════════════════════════════════════════════════════════
const columns = [
  { name: 'ticket',       label: 'No. Ticket',    field: 'ticket',           align: 'left'   as const, sortable: true },
  { name: 'centroAcopio', label: 'Centro Acopio', field: 'nombre_sede',      align: 'left'   as const, sortable: true },
  { name: 'fechaEntrega', label: 'F. Entrega',    field: 'fecha_entrega',    align: 'left'   as const },
  { name: 'fechaSolicitud', label: 'F. Solicitud', field: 'fecha_solicitud', align: 'left'   as const },
  { name: 'rfc',          label: 'RFC',           field: 'rfc_productor',    align: 'left'   as const },
  { name: 'productor',    label: 'Productor',     field: 'nombre_productor', align: 'left'   as const, sortable: true },
  { name: 'banco',        label: 'Banco',         field: 'nombre_banco',     align: 'left'   as const },
  { name: 'toneladas',    label: 'Tons.',         field: 'toneladas',        align: 'right'  as const, sortable: true },
  { name: 'aPagar',       label: 'A Pagar',       field: 'monto_solicitado', align: 'right'  as const, sortable: true },
  { name: 'statusPago',   label: 'Status',        field: 'status_pago',      align: 'center' as const, sortable: true },
  { name: 'fechaAutorizacion', label: 'F. Autorización', field: 'fecha_autorizacion', align: 'left' as const },
  { name: 'fechaPago',    label: 'Fecha Pago',    field: 'fecha_pago',       align: 'left'   as const },
  { name: 'folioPago',    label: 'Folio Pago',    field: 'folio_pago',       align: 'left'   as const },
  { name: 'acciones',     label: '',              field: 'id',               align: 'center' as const },
]

const columnsTopesSedes = [
  { name: 'nombre_sede', label: 'Sede',        field: 'nombre_sede',   align: 'left'   as const },
  { name: 'tope_diario', label: 'Tope Diario', field: 'tope_diario',   align: 'right'  as const,
    format: (v: number) => formatCurrencyM(v) },
  { name: 'disponible',  label: 'Disponible',  field: 'disponible',    align: 'right'  as const },
  { name: 'utilizacion', label: 'Utilización', field: 'porcentaje',    align: 'left'   as const },
  { name: 'estado',      label: 'Estado',      field: 'porcentaje',    align: 'center' as const },
]

// ══════════════════════════════════════════════════════════════════
//  OPCIONES
// ══════════════════════════════════════════════════════════════════
const statusOptions = [
  { label: 'PAGO SOLICITADO', value: 'PAGO SOLICITADO' },
  { label: 'AUTORIZADO',      value: 'AUTORIZADO' },
  { label: 'PAGADO',          value: 'PAGADO' },
]

// ══════════════════════════════════════════════════════════════════
//  COMPUTED
// ══════════════════════════════════════════════════════════════════
const fechaHoyStr = computed(() => {
  const hoy = new Date()
  return `${String(hoy.getDate()).padStart(2,'0')}/${String(hoy.getMonth()+1).padStart(2,'0')}/${hoy.getFullYear()}`
})

function parseFechaDDMMYYYY(str: string | null): Date | null {
  if (!str) return null
  const [d, m, y] = str.split('/')
  if (!d || !m || !y) return null
  return new Date(Number(y), Number(m) - 1, Number(d))
}

const pagosFiltrados = computed(() => {
  return pagos.value.filter(p => {
    if (filtros.value.ticket       && !p.ticket.includes(filtros.value.ticket)) return false
    if (filtros.value.productor    && !p.nombre_productor?.toLowerCase().includes(filtros.value.productor.toLowerCase())) return false
    if (filtros.value.rfc          && !p.rfc_productor?.toLowerCase().includes(filtros.value.rfc.toLowerCase())) return false
    if (filtros.value.centroAcopio && !p.nombre_sede?.toLowerCase().includes(filtros.value.centroAcopio.toLowerCase())) return false
    if (filtros.value.statusPago   && p.status_pago !== filtros.value.statusPago) return false
    if (filtros.value.hoy && p.fecha_solicitud !== fechaHoyStr.value) return false
    if (filtros.value.fechaInicio || filtros.value.fechaFin) {
      const fechaReg = parseFechaDDMMYYYY(p.fecha_solicitud)
      if (!fechaReg) return false
      if (filtros.value.fechaInicio) {
        const fi = new Date(filtros.value.fechaInicio + 'T00:00:00')
        if (fechaReg < fi) return false
      }
      if (filtros.value.fechaFin) {
        const ff = new Date(filtros.value.fechaFin + 'T23:59:59')
        if (fechaReg > ff) return false
      }
    }
    return true
  })
})

const totalAPagar = computed(() =>
  pagosFiltrados.value.reduce((s, p) => s + (p.monto_solicitado ?? 0), 0))

const totalDisponibleSedes = computed(() =>
  topesSedes.value.reduce((s, t) => s + (t.disponible ?? 0), 0))

const todosSeleccionadosSonSolicitados = computed(() =>
  selected.value.length > 0 &&
  selected.value.every(p => p.status_pago === 'PAGO SOLICITADO'))

// KPIs sólo de HOY
const pagosHoy = computed(() =>
  pagos.value.filter(p => p.fecha_solicitud === fechaHoyStr.value))

const kpiSolicitadoHoy = computed(() => buildKpiDesde(pagosHoy.value, 'PAGO SOLICITADO'))
const kpiAutorizadoHoy = computed(() => buildKpiDesde(pagosHoy.value, 'AUTORIZADO'))
const kpiPagadoHoy     = computed(() => buildKpiDesde(pagosHoy.value, 'PAGADO'))

// ══════════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════════
function buildKpiDesde(list: PagoSedeRecord[], status: string) {
  const f = list.filter(p => p.status_pago === status)
  return { count: f.length, monto: f.reduce((s, p) => s + (p.monto_solicitado ?? 0), 0) }
}

function formatCurrency(val: number | null | undefined) {
  const n = val ?? 0
  return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatCurrencyM(val: number | null | undefined) {
  const n = (val ?? 0) / 1_000_000
  return `$${n.toFixed(2)}M`
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    'PAGO SOLICITADO': 'orange',
    'AUTORIZADO':      'purple',
    'PAGADO':          'green',
  }
  return map[status] ?? 'grey'
}

function getColorTope(pct: number) {
  if (pct >= 100) return 'red'
  if (pct >= 90)  return 'deep-orange'
  if (pct >= 70)  return 'orange'
  return 'green'
}

function getEtiquetaTope(pct: number) {
  if (pct >= 100) return 'TOPE'
  if (pct >= 90)  return 'Límite'
  return 'OK'
}

// ══════════════════════════════════════════════════════════════════
//  API CALLS
// ══════════════════════════════════════════════════════════════════
async function cargarDatos() {
  loading.value = true
  try {
    const sedeId = authStore.esAdminGlobal ? 0 : (authStore.sedeActivaId ?? 0)
    const [solicitudesRes, configRes, topesRes] = await Promise.all([
      api.get('/pagos/solicitudes-sede', { params: { sedeId } }),
      api.get('/pagos/configuracion-completa', { params: { sedeId: authStore.sedeActivaId ?? 0 } }),
      api.get('/pagos/topes-sedes'),
    ])

    pagos.value          = Array.isArray(solicitudesRes.data) ? solicitudesRes.data : []
    bancosOptions.value  = configRes.data.Bancos    ?? []
    formasPagoOptions.value = configRes.data.FormasPago ?? []

    // Enriquecer topes con cálculos de disponibilidad
    topesSedes.value = (topesRes.data as TopeSede[]).map(t => ({
      ...t,
      disponible: (t.tope_diario ?? 0) - (t.solicitado_hoy ?? 0),
      porcentaje: (t.tope_diario ?? 0) > 0
        ? ((t.solicitado_hoy ?? 0) / t.tope_diario) * 100
        : 0,
    }))
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al cargar datos de pagos sede' })
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function handleAutorizarPagos() {
  if (selected.value.length === 0) {
    $q.notify({ type: 'warning', message: 'Seleccione al menos un pago' })
    return
  }

  const solicitados = selected.value.filter(p => p.status_pago === 'PAGO SOLICITADO')
  if (solicitados.length === 0) {
    $q.notify({ type: 'warning', message: 'Los pagos seleccionados ya fueron autorizados' })
    return
  }

  autorizando.value = true
  try {
    await api.put('/pagos/autorizar-pagos', {
      SolicitudIds:      solicitados.map(p => p.id),
      FechaAutorizacion: new Date().toISOString(),
      SedeId:            authStore.sedeActivaId ?? 0,
    })
    $q.notify({ type: 'positive', message: `${solicitados.length} pago(s) autorizados correctamente` })
    selected.value = []
    await cargarDatos()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al autorizar pagos' })
  } finally {
    autorizando.value = false
  }
}

function handleVerDetalle(pago: PagoSedeRecord) {
  pagoSeleccionado.value = pago
  detallePagoForm.value = {
    fechaAutorizacion: '',
    fechaPago:         '',
    bancoId:           pago.banco_id ?? null,
    formaPagoId:       pago.forma_pago_id ?? null,
    cuenta:            pago.cuenta ?? '',
    folioPago:         pago.folio_pago ?? '',
  }
  showDetalle.value = true
}

async function handleAutorizarPago() {
  if (!pagoSeleccionado.value || !detallePagoForm.value.fechaAutorizacion) {
    $q.notify({ type: 'warning', message: 'La fecha de autorización es requerida' })
    return
  }
  guardando.value = true
  try {
    await api.put('/pagos/autorizar-pagos', {
      SolicitudIds:      [pagoSeleccionado.value.id],
      FechaAutorizacion: detallePagoForm.value.fechaAutorizacion,
      SedeId:            authStore.sedeActivaId ?? 0,
    })
    $q.notify({ type: 'positive', message: 'Pago autorizado exitosamente' })
    showDetalle.value = false
    await cargarDatos()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al autorizar el pago' })
  } finally {
    guardando.value = false
  }
}

async function handleRegistrarPago() {
  if (!pagoSeleccionado.value) return
  if (!detallePagoForm.value.fechaPago) {
    $q.notify({ type: 'warning', message: 'La fecha de pago es requerida' })
    return
  }
  guardando.value = true
  try {
    await api.put('/pagos/registrar-pago', {
      SolicitudId: pagoSeleccionado.value.id,
      FechaPago:   detallePagoForm.value.fechaPago,
      FolioPago:   detallePagoForm.value.folioPago,
      BancoId:     detallePagoForm.value.bancoId,
      FormaPagoId: detallePagoForm.value.formaPagoId,
      Cuenta:      detallePagoForm.value.cuenta,
      ImportePago: pagoSeleccionado.value.monto_solicitado,
      SedeId:      authStore.sedeActivaId ?? 0,
    })
    $q.notify({ type: 'positive', message: 'Pago registrado exitosamente' })
    showDetalle.value = false
    await cargarDatos()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al registrar el pago' })
  } finally {
    guardando.value = false
  }
}

async function handleExportarExcel() {
  exportando.value = true
  try {
    const sedeId = authStore.esAdminGlobal ? 0 : (authStore.sedeActivaId ?? 0)
    const res = await api.get('/pagos/exportar-excel', {
      params: { sedeId, corporativo: true },
      responseType: 'blob',
    })
    const url = URL.createObjectURL(new Blob([res.data]))
    const a   = document.createElement('a')
    a.href    = url
    a.download = `pagos_sede_${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    $q.notify({ type: 'negative', message: 'Error al exportar Excel' })
  } finally {
    exportando.value = false
  }
}

// ══════════════════════════════════════════════════════════════════
//  LIFECYCLE
// ══════════════════════════════════════════════════════════════════
onMounted(() => cargarDatos())
</script>
