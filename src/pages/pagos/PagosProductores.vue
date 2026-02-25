<template>
  <q-page class="q-pa-md bg-grey-2">

    <!-- ══════════════════════════════════════════════
         HEADER
    ══════════════════════════════════════════════ -->
    <div class="row items-center q-gutter-md q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-grey-8">Pagos a Productores</div>
        <div class="text-caption text-grey-6">
          Sede: {{ authStore.nombreSedeActiva }}
        </div>
      </div>
      <div class="col-auto">
        <q-btn flat round icon="refresh" color="primary" :loading="loading" @click="cargarDatos" />
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         TOPE DIARIO
    ══════════════════════════════════════════════ -->
    <q-card flat bordered class="q-mb-md" style="border: 2px solid #9333EA;">
      <q-card-section class="q-py-sm">
        <div class="row items-center justify-between q-mb-xs">
          <span class="text-subtitle2 text-purple-8">Tope Diario de Solicitudes</span>
          <div class="text-right">
            <div class="text-caption text-grey-6">Disponible</div>
            <div class="text-subtitle1 text-weight-bold"
                 :class="montoDisponible > 0 ? 'text-green-7' : 'text-red-7'">
              {{ formatCurrency(montoDisponible) }}
            </div>
          </div>
        </div>
        <div class="row items-center q-gutter-sm">
          <div class="col">
            <q-linear-progress
              :value="Math.min(porcentajeUtilizado / 100, 1)"
              :color="colorTope"
              track-color="grey-3"
              size="10px"
              rounded
            />
          </div>
          <div class="text-caption text-weight-bold" style="min-width: 42px; text-align:right;">
            {{ porcentajeUtilizado.toFixed(0) }}%
          </div>
          <q-badge
            :color="colorTope"
            :label="etiquetaTope"
            class="text-caption"
          />
        </div>
        <div class="row q-mt-xs text-caption text-grey-6">
          <span>Solicitado hoy: <b>{{ formatCurrency(montoSolicitadoHoy) }}</b></span>
          <q-space />
          <span>Tope: <b>{{ formatCurrency(topeDiario) }}</b></span>
        </div>
      </q-card-section>
    </q-card>

    <!-- ══════════════════════════════════════════════
         KPIs
    ══════════════════════════════════════════════ -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-6 col-md-3">
        <q-card flat bordered class="bg-red-1">
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-xs q-mb-xs">
              <q-icon name="warning" color="red-7" size="18px" />
              <span class="text-caption text-weight-bold text-grey-8">Solicitar</span>
            </div>
            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey-6">Cant.</div>
                <div class="text-h5 text-weight-bold text-red-9">{{ kpiSolicitar.count }}</div>
              </div>
              <div class="text-right">
                <div class="text-caption text-grey-6">Monto</div>
                <div class="text-subtitle2 text-weight-bold text-red-7">{{ formatCurrency(kpiSolicitar.monto) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md-3">
        <q-card flat bordered class="bg-orange-1">
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-xs q-mb-xs">
              <q-icon name="schedule" color="orange-7" size="18px" />
              <span class="text-caption text-weight-bold text-grey-8">Pago Solicitado</span>
            </div>
            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey-6">Cant.</div>
                <div class="text-h5 text-weight-bold text-orange-9">{{ kpiSolicitado.count }}</div>
              </div>
              <div class="text-right">
                <div class="text-caption text-grey-6">Monto</div>
                <div class="text-subtitle2 text-weight-bold text-orange-7">{{ formatCurrency(kpiSolicitado.monto) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md-3">
        <q-card flat bordered class="bg-purple-1">
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-xs q-mb-xs">
              <q-icon name="check_circle" color="purple-7" size="18px" />
              <span class="text-caption text-weight-bold text-grey-8">Autorizado</span>
            </div>
            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey-6">Cant.</div>
                <div class="text-h5 text-weight-bold text-purple-9">{{ kpiAutorizado.count }}</div>
              </div>
              <div class="text-right">
                <div class="text-caption text-grey-6">Monto</div>
                <div class="text-subtitle2 text-weight-bold text-purple-7">{{ formatCurrency(kpiAutorizado.monto) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md-3">
        <q-card flat bordered class="bg-green-1">
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-xs q-mb-xs">
              <q-icon name="check_circle" color="green-7" size="18px" />
              <span class="text-caption text-weight-bold text-grey-8">Pagado</span>
            </div>
            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey-6">Cant.</div>
                <div class="text-h5 text-weight-bold text-green-9">{{ kpiPagado.count }}</div>
              </div>
              <div class="text-right">
                <div class="text-caption text-grey-6">Monto</div>
                <div class="text-subtitle2 text-weight-bold text-green-7">{{ formatCurrency(kpiPagado.monto) }}</div>
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
         TOTAL + BOTÓN ACCIÓN
    ══════════════════════════════════════════════ -->
    <div class="row items-center justify-between q-mb-sm">
      <div>
        <q-btn
          v-if="todosSeleccionadosSonSolicitar"
          color="purple"
          icon="send"
          :label="`Enviar a Corporativo (${selected.length})`"
          :loading="solicitando"
          @click="handleEnviarACorporativo"
        />
      </div>
      <q-card flat bordered class="bg-white">
        <q-card-section class="q-py-sm q-px-md">
          <span class="text-caption text-grey-7">TOTAL A PAGAR: </span>
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
        flat
        dense
        :rows-per-page-options="[15, 25, 50, 0]"
        rows-per-page-label="Filas por página"
      >
        <!-- Status badge -->
        <template v-slot:body-cell-statusPago="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.row.status_pago)" :label="props.row.status_pago" />
          </q-td>
        </template>

        <!-- Toneladas formateadas -->
        <template v-slot:body-cell-toneladas="props">
          <q-td :props="props" class="text-right">
            {{ Number(props.row.toneladas).toFixed(3) }}
          </q-td>
        </template>

        <!-- Monto formateado -->
        <template v-slot:body-cell-aPagar="props">
          <q-td :props="props" class="text-right">
            {{ formatCurrency(props.row.monto_solicitado) }}
          </q-td>
        </template>

        <!-- Botón Ver -->
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
         MODAL DETALLE DE PAGO
    ══════════════════════════════════════════════ -->
    <q-dialog v-model="showDetalle" persistent>
      <q-card style="min-width: 560px; max-width: 620px;" class="q-pa-sm">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Detalle de Pago</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="pagoSeleccionado" class="q-pt-sm">
          <!-- Info básica -->
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input
                :model-value="pagoSeleccionado.ticket"
                label="No. Ticket" dense outlined readonly
              />
            </div>
            <div class="col-6">
              <q-input
                :model-value="pagoSeleccionado.status_pago"
                label="Status" dense outlined readonly
              >
                <template v-slot:prepend>
                  <q-icon name="circle" :color="getStatusColor(pagoSeleccionado.status_pago)" size="12px" />
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                :model-value="pagoSeleccionado.nombre_productor"
                label="Productor" dense outlined readonly
              />
            </div>
            <div class="col-12">
              <q-input
                :model-value="formatCurrency(pagoSeleccionado.monto_solicitado)"
                label="A Pagar" dense outlined readonly
              />
            </div>
          </div>

          <q-separator class="q-mb-sm" />

          <!-- ── SOLICITAR: captura datos bancarios ── -->
          <template v-if="pagoSeleccionado.status_pago === 'SOLICITAR'">
            <!-- Datos ya capturados → solo lectura (bloqueado) -->
            <template v-if="datosBancariosCompletos">
              <div class="row q-col-gutter-sm">
                <div class="col-12">
                  <q-input :model-value="pagoSeleccionado.nombre_banco ?? '-'"
                    label="Banco" dense outlined readonly bg-color="grey-1" />
                </div>
                <div class="col-12">
                  <q-input :model-value="pagoSeleccionado.nombre_forma_pago ?? '-'"
                    label="Método de Pago" dense outlined readonly bg-color="grey-1" />
                </div>
                <div class="col-12">
                  <q-input :model-value="pagoSeleccionado.cuenta_clabe ?? '-'"
                    label="CLABE" dense outlined readonly bg-color="grey-1" />
                </div>
              </div>
              <q-banner dense class="bg-green-1 text-green-9 q-mt-sm rounded-borders">
                <template v-slot:avatar><q-icon name="lock" /></template>
                Datos bancarios capturados. Listo para enviar a Corporativo.
              </q-banner>
            </template>
            <!-- Sin datos bancarios → formulario editable -->
            <template v-else>
              <div class="row q-col-gutter-sm">
                <div class="col-12">
                  <q-input
                    v-model="detallePagoForm.fechaSolicitud"
                    label="Fecha de Solicitud" type="date" dense outlined
                  />
                </div>
                <div class="col-12">
                  <q-select
                    v-model="detallePagoForm.bancoId"
                    :options="bancosOptions"
                    option-value="id"
                    option-label="nombre_banco"
                    emit-value map-options
                    label="Banco" dense outlined clearable
                  />
                </div>
                <div class="col-12">
                  <q-select
                    v-model="detallePagoForm.formaPagoId"
                    :options="formasPagoOptions"
                    option-value="id"
                    option-label="nombre"
                    emit-value map-options
                    label="Método de Pago" dense outlined clearable
                  />
                </div>
                <div v-if="requiereClabe" class="col-12">
                  <q-input
                    v-model="detallePagoForm.clabe"
                    label="CLABE (18 dígitos)" dense outlined
                    maxlength="18"
                    :hint="pagoSeleccionado.cuenta_clabe_productor ? `CLABE registrada: ${pagoSeleccionado.cuenta_clabe_productor}` : ''"
                  />
                </div>
              </div>
              <q-banner dense class="bg-yellow-1 text-yellow-9 q-mt-sm rounded-borders">
                <template v-slot:avatar><q-icon name="info" /></template>
                Captura los datos bancarios antes de enviar a Corporativo.
              </q-banner>
            </template>
          </template>

          <!-- ── PAGO SOLICITADO: solo lectura ── -->
          <template v-else-if="pagoSeleccionado.status_pago === 'PAGO SOLICITADO'">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.fecha_solicitud ?? '-'"
                  label="Fecha Solicitud" dense outlined readonly />
              </div>
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.nombre_banco ?? '-'"
                  label="Banco" dense outlined readonly />
              </div>
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.nombre_forma_pago ?? '-'"
                  label="Método de Pago" dense outlined readonly />
              </div>
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.cuenta_clabe ?? '-'"
                  label="CLABE" dense outlined readonly />
              </div>
            </div>
            <q-banner dense class="bg-orange-1 text-orange-9 q-mt-sm rounded-borders">
              <template v-slot:avatar>
                <q-icon name="schedule" />
              </template>
              Este pago está esperando autorización de Corporativo.
            </q-banner>
          </template>

          <!-- ── AUTORIZADO: ejecutar pago ── -->
          <template v-else-if="pagoSeleccionado.status_pago === 'AUTORIZADO'">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.fecha_autorizacion ?? '-'"
                  label="Fecha Autorización" dense outlined readonly />
              </div>
              <div class="col-12">
                <q-input
                  v-model="detallePagoForm.fechaPago"
                  label="Fecha de Pago" type="date" dense outlined
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model.number="detallePagoForm.importePago"
                  label="Importe de Pago" type="number" dense outlined
                  :hint="`Monto a pagar: ${formatCurrency(pagoSeleccionado.monto_solicitado)}`"
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
                <q-input v-model="detallePagoForm.folioPago" label="Folio de Pago" dense outlined />
              </div>
            </div>
            <q-banner dense class="bg-blue-1 text-blue-9 q-mt-sm rounded-borders">
              <template v-slot:avatar><q-icon name="check_circle" /></template>
              Pago autorizado. Completa los datos para ejecutar.
            </q-banner>
          </template>

          <!-- ── PAGADO: solo lectura ── -->
          <template v-else-if="pagoSeleccionado.status_pago === 'PAGADO'">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input :model-value="pagoSeleccionado.fecha_autorizacion ?? '-'"
                  label="Fecha Autorización" dense outlined readonly />
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
          <!-- SOLICITAR: guardar datos bancarios (solo si aún no están capturados) -->
          <template v-if="pagoSeleccionado?.status_pago === 'SOLICITAR'">
            <q-btn color="grey-6" label="Cancelar" flat v-close-popup class="q-mr-sm" />
            <q-btn
              v-if="!datosBancariosCompletos"
              color="purple" label="Guardar Datos Bancarios"
              :loading="guardando"
              @click="handleGuardarDatosBancarios"
            />
          </template>
          <!-- AUTORIZADO: ejecutar pago -->
          <template v-else-if="pagoSeleccionado?.status_pago === 'AUTORIZADO'">
            <q-btn
              color="grey-6" label="Cancelar" flat v-close-popup class="q-mr-sm"
            />
            <q-btn
              color="orange-7" label="Ejecutar Pago"
              :loading="guardando"
              @click="handleEjecutarPago"
            />
          </template>
          <!-- Otros estados: solo cerrar -->
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
interface PagoRecord {
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
  status_pago: 'SOLICITAR' | 'PAGO SOLICITADO' | 'AUTORIZADO' | 'PAGADO'
  banco_id: number | null
  nombre_banco: string | null
  metodo_pago: number | null
  nombre_forma_pago: string | null
  cuenta_clabe: string | null
  cuenta: string | null
  cuenta_clabe_productor: string | null
  banco_id_productor: number | null
  banco_productor: string | null
  sede_id: number
}

interface BancoOption { id: number; nombre_banco: string; codigo_banco: string }
interface FormaPagoOption { id: number; nombre: string; codigo: string; requiere_clabe?: boolean }

// ══════════════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════════════
const $q = useQuasar()
const authStore = useAuthStore()

const pagos       = ref<PagoRecord[]>([])
const loading     = ref(false)
const exportando  = ref(false)
const solicitando = ref(false)
const guardando   = ref(false)
const selected    = ref<PagoRecord[]>([])

const bancosOptions    = ref<BancoOption[]>([])
const formasPagoOptions = ref<FormaPagoOption[]>([])
const topeDiario       = ref(0)
const montoSolicitadoHoy = ref(0)

const filtros = ref({
  ticket:     '',
  productor:  '',
  rfc:        '',
  statusPago: '' as string,
  fechaInicio: '',
  fechaFin:    '',
  hoy:         false,
})

const showDetalle      = ref(false)
const pagoSeleccionado = ref<PagoRecord | null>(null)
const detallePagoForm  = ref({
  fechaSolicitud: '',
  bancoId:        null as number | null,
  formaPagoId:    null as number | null,
  clabe:          '',
  cuenta:         '',
  fechaPago:      '',
  importePago:    0,
  folioPago:      '',
})

// ══════════════════════════════════════════════════════════════════
//  COLUMNAS q-table
// ══════════════════════════════════════════════════════════════════
const columns = [
  { name: 'ticket',     label: 'No. Ticket',    field: 'ticket',            align: 'left'   as const, sortable: true },
  { name: 'fechaEntrega', label: 'F. Entrega',  field: 'fecha_entrega',     align: 'left'   as const },
  { name: 'fechaSolicitud', label: 'F. Solicitud', field: 'fecha_solicitud', align: 'left'  as const },
  { name: 'rfc',        label: 'RFC',           field: 'rfc_productor',     align: 'left'   as const },
  { name: 'productor',  label: 'Productor',     field: 'nombre_productor',  align: 'left'   as const, sortable: true },
  { name: 'banco',      label: 'Banco',         field: 'nombre_banco',      align: 'left'   as const },
  { name: 'toneladas',  label: 'Tons.',         field: 'toneladas',         align: 'right'  as const, sortable: true },
  { name: 'aPagar',     label: 'A Pagar',       field: 'monto_solicitado',  align: 'right'  as const, sortable: true },
  { name: 'statusPago', label: 'Status',        field: 'status_pago',       align: 'center' as const, sortable: true },
  { name: 'fechaPago',  label: 'Fecha Pago',    field: 'fecha_pago',        align: 'left'   as const },
  { name: 'folioPago',  label: 'Folio Pago',    field: 'folio_pago',        align: 'left'   as const },
  { name: 'acciones',   label: '',              field: 'id',                align: 'center' as const },
]

// ══════════════════════════════════════════════════════════════════
//  OPCIONES
// ══════════════════════════════════════════════════════════════════
const statusOptions = [
  { label: 'SOLICITAR',        value: 'SOLICITAR' },
  { label: 'PAGO SOLICITADO',  value: 'PAGO SOLICITADO' },
  { label: 'AUTORIZADO',       value: 'AUTORIZADO' },
  { label: 'PAGADO',           value: 'PAGADO' },
]

// ══════════════════════════════════════════════════════════════════
//  COMPUTED
// ══════════════════════════════════════════════════════════════════
const hoy = computed(() => new Date().toLocaleDateString('es-MX', { day:'2-digit', month:'2-digit', year:'numeric' }).replace(/\//g,'/'))

const pagosFiltrados = computed(() => {
  return pagos.value.filter(p => {
    if (filtros.value.ticket    && !p.ticket.includes(filtros.value.ticket)) return false
    if (filtros.value.productor && !p.nombre_productor?.toLowerCase().includes(filtros.value.productor.toLowerCase())) return false
    if (filtros.value.rfc       && !p.rfc_productor?.toLowerCase().includes(filtros.value.rfc.toLowerCase())) return false
    if (filtros.value.statusPago && p.status_pago !== filtros.value.statusPago) return false
    if (filtros.value.hoy && p.fecha_entrega !== hoy.value) return false
    if (filtros.value.fechaInicio || filtros.value.fechaFin) {
      const fechaRaw = p.fecha_entrega ?? ''
      if (filtros.value.fechaInicio) {
        const fi = filtros.value.fechaInicio.split('-').reverse().join('/')
        if (fechaRaw < fi) return false
      }
      if (filtros.value.fechaFin) {
        const ff = filtros.value.fechaFin.split('-').reverse().join('/')
        if (fechaRaw > ff) return false
      }
    }
    return true
  })
})

const totalAPagar = computed(() =>
  pagosFiltrados.value.reduce((s, p) => s + (p.monto_solicitado ?? 0), 0))

const kpiSolicitar  = computed(() => buildKpi('SOLICITAR'))
const kpiSolicitado = computed(() => buildKpi('PAGO SOLICITADO'))
const kpiAutorizado = computed(() => buildKpi('AUTORIZADO'))
const kpiPagado     = computed(() => buildKpi('PAGADO'))

const montoDisponible    = computed(() => topeDiario.value - montoSolicitadoHoy.value)
const porcentajeUtilizado = computed(() =>
  topeDiario.value > 0 ? (montoSolicitadoHoy.value / topeDiario.value) * 100 : 0)

const colorTope = computed(() => {
  if (porcentajeUtilizado.value >= 100) return 'red'
  if (porcentajeUtilizado.value >= 90)  return 'deep-orange'
  if (porcentajeUtilizado.value >= 70)  return 'orange'
  return 'green'
})

const etiquetaTope = computed(() => {
  if (porcentajeUtilizado.value >= 100) return 'TOPE'
  if (porcentajeUtilizado.value >= 90)  return 'Límite'
  return 'OK'
})

const todosSeleccionadosSonSolicitar = computed(() =>
  selected.value.length > 0 &&
  selected.value.every(p => p.status_pago === 'SOLICITAR'))

const requiereClabe = computed(() => {
  if (!detallePagoForm.value.formaPagoId) return false
  const forma = formasPagoOptions.value.find(f => f.id === detallePagoForm.value.formaPagoId)
  return forma?.requiere_clabe ?? false
})

const datosBancariosCompletos = computed(() => {
  const p = pagoSeleccionado.value
  if (!p) return false
  return !!p.banco_id && !!p.metodo_pago
})

// ══════════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════════
function buildKpi(status: string) {
  const filtered = pagosFiltrados.value.filter(p => p.status_pago === status)
  return {
    count: filtered.length,
    monto: filtered.reduce((s, p) => s + (p.monto_solicitado ?? 0), 0)
  }
}

function formatCurrency(val: number | null | undefined) {
  const n = val ?? 0
  return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    'SOLICITAR':       'blue',
    'PAGO SOLICITADO': 'orange',
    'AUTORIZADO':      'purple',
    'PAGADO':          'green',
  }
  return map[status] ?? 'grey'
}

// ══════════════════════════════════════════════════════════════════
//  API CALLS
// ══════════════════════════════════════════════════════════════════
async function cargarDatos() {
  loading.value = true
  try {
    const [solicitudesRes, configRes, topeRes] = await Promise.all([
      api.get('/pagos/solicitudes'),
      api.get('/pagos/configuracion-completa'),
      api.get('/pagos/tope-diario'),
    ])

    pagos.value          = solicitudesRes.data
    bancosOptions.value  = configRes.data.bancos   ?? []
    formasPagoOptions.value = configRes.data.formasPago ?? []
    topeDiario.value       = topeRes.data.topeDiario ?? 0
    montoSolicitadoHoy.value = topeRes.data.solicitadoHoy ?? 0
  } catch (err: unknown) {
    $q.notify({ type: 'negative', message: 'Error al cargar datos de pagos' })
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function handleEnviarACorporativo() {
  if (selected.value.length === 0) {
    $q.notify({ type: 'warning', message: 'Seleccione al menos un pago' })
    return
  }

  const pendientes = selected.value.filter(p => p.status_pago === 'SOLICITAR')
  if (pendientes.length === 0) {
    $q.notify({ type: 'warning', message: 'Los pagos seleccionados ya fueron enviados' })
    return
  }

  const montoTotal = pendientes.reduce((s, p) => s + (p.monto_solicitado ?? 0), 0)
  const nuevoTotal = montoSolicitadoHoy.value + montoTotal
  const nuevoPct   = topeDiario.value > 0 ? (nuevoTotal / topeDiario.value) * 100 : 0

  // Advertencia al 90%
  if (nuevoPct >= 90 && nuevoPct < 100) {
    const ok = await new Promise<boolean>(resolve =>
      $q.dialog({
        title: 'Advertencia de Tope',
        message: `Usarás el ${nuevoPct.toFixed(1)}% del tope diario (${formatCurrency(nuevoTotal)} de ${formatCurrency(topeDiario.value)}). ¿Continuar?`,
        cancel: true,
        persistent: true,
      }).onOk(() => resolve(true)).onCancel(() => resolve(false))
    )
    if (!ok) return
  }

  solicitando.value = true
  try {
    const ids = pendientes.map(p => p.id)
    await api.post('/pagos/solicitar-pago', {
      SolicitudIds: ids,
      SedeId: authStore.sedeActivaId,
    })
    $q.notify({ type: 'positive', message: `${pendientes.length} pago(s) enviados a Corporativo` })
    selected.value = []
    await cargarDatos()
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
    if (msg?.includes('Tope diario excedido')) {
      $q.notify({ type: 'negative', message: `Tope diario excedido. ${msg}` })
    } else {
      $q.notify({ type: 'negative', message: msg ?? 'Error al enviar a Corporativo' })
    }
  } finally {
    solicitando.value = false
  }
}

function handleVerDetalle(pago: PagoRecord) {
  pagoSeleccionado.value = pago
  detallePagoForm.value = {
    fechaSolicitud: '',
    bancoId:        pago.banco_id ?? pago.banco_id_productor ?? null,
    formaPagoId:    pago.metodo_pago ?? null,
    clabe:          pago.cuenta_clabe ?? pago.cuenta_clabe_productor ?? '',
    cuenta:         pago.cuenta ?? '',
    fechaPago:      '',
    importePago:    pago.monto_solicitado,
    folioPago:      '',
  }
  showDetalle.value = true
}

async function handleGuardarDatosBancarios() {
  if (!pagoSeleccionado.value) return
  guardando.value = true
  try {
    await api.put('/pagos/actualizar-datos-bancarios', {
      SolicitudId:  pagoSeleccionado.value.id,
      BancoId:      detallePagoForm.value.bancoId,
      FormaPagoId:  detallePagoForm.value.formaPagoId,
      Clabe:        detallePagoForm.value.clabe,
      Cuenta:       detallePagoForm.value.cuenta,
      SedeId:       authStore.sedeActivaId,
    })
    $q.notify({ type: 'positive', message: 'Datos bancarios guardados' })
    showDetalle.value = false
    await cargarDatos()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar datos bancarios' })
  } finally {
    guardando.value = false
  }
}

async function handleEjecutarPago() {
  if (!pagoSeleccionado.value) return
  guardando.value = true
  try {
    await api.put('/pagos/registrar-pago', {
      SolicitudId: pagoSeleccionado.value.id,
      FechaPago:   detallePagoForm.value.fechaPago,
      FolioPago:   detallePagoForm.value.folioPago,
      BancoId:     detallePagoForm.value.bancoId,
      FormaPagoId: detallePagoForm.value.formaPagoId,
      Cuenta:      detallePagoForm.value.cuenta,
      ImportePago: detallePagoForm.value.importePago,
      SedeId:      authStore.sedeActivaId,
    })
    $q.notify({ type: 'positive', message: 'Pago ejecutado exitosamente' })
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
    const res = await api.get('/pagos/exportar-excel', {
      params: { corporativo: false },
      responseType: 'blob',
    })
    const url = URL.createObjectURL(new Blob([res.data]))
    const a   = document.createElement('a')
    a.href    = url
    a.download = `pagos_productores_${new Date().toISOString().slice(0,10)}.xlsx`
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
